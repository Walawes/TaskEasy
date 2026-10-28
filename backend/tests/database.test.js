const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');

const databasePath = path.join(os.tmpdir(), `taskeasy-${uuidv4()}.db`);
process.env.TASK_DATABASE_PATH = databasePath;

const Database = require('better-sqlite3');
const legacyDb = new Database(databasePath);
legacyDb.exec(`
  CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    createdAt TEXT
  )
`);
legacyDb.prepare(`
  INSERT INTO tasks (id, title, description, priority, status, createdAt)
  VALUES (?, ?, ?, ?, ?, ?)
`).run('legacy-task', 'Task lama', '', 'medium', 'todo', '2026-10-28T00:00:00.000Z');
legacyDb.close();

const db = require('../database');
const taskController = require('../controllers/taskController');

function invoke(handler, req) {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    send() {
      return this;
    }
  };

  handler(req, response);
  return response;
}

try {
  const created = invoke(taskController.createTask, {
    body: {
      title: 'Task tersimpan',
      description: 'Uji persistensi SQLite',
      priority: 'high',
      status: 'todo'
    }
  });

  assert.equal(created.statusCode, 201);
  assert.ok(created.body.id);
  assert.equal(invoke(taskController.getAllTasks, {}).body.length, 2);
  assert.equal(
    invoke(taskController.getTaskById, { params: { id: 'legacy-task' } }).body.createdAt,
    '2026-10-28T00:00:00.000Z'
  );
  assert.ok(db.pragma('table_info(tasks)').some((column) => column.name === 'created_at'));

  const taskId = created.body.id;
  const originalCreatedAt = created.body.createdAt;
  const updated = invoke(taskController.updateTask, {
    params: { id: taskId },
    body: { title: 'Task diperbarui' }
  });

  assert.equal(updated.body.title, 'Task diperbarui');
  assert.equal(updated.body.createdAt, originalCreatedAt);
  assert.equal(invoke(taskController.getTaskById, { params: { id: taskId } }).body.title, 'Task diperbarui');

  const reopenedDb = new (require('better-sqlite3'))(databasePath);
  assert.equal(reopenedDb.prepare('SELECT title FROM tasks WHERE id = ?').get(taskId).title, 'Task diperbarui');
  reopenedDb.close();

  const deleted = invoke(taskController.deleteTask, { params: { id: taskId } });
  assert.equal(deleted.statusCode, 204);
  assert.equal(invoke(taskController.getTaskById, { params: { id: taskId } }).statusCode, 404);
  assert.equal(invoke(taskController.getTaskById, { params: { id: 'legacy-task' } }).statusCode, 200);

  console.log('SQLite CRUD dan persistensi berhasil');
} finally {
  if (db.open) {
    db.close();
  }
  if (fs.existsSync(databasePath)) {
    fs.unlinkSync(databasePath);
  }
}
