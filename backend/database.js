const path = require('node:path');
const Database = require('better-sqlite3');

const databasePath = process.env.TASK_DATABASE_PATH || path.join(__dirname, 'database', 'task.db');
const db = new Database(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'todo',
    created_at TEXT NOT NULL
  )
`);

const taskColumns = db.pragma('table_info(tasks)');
const hasCreatedAt = taskColumns.some((column) => column.name === 'created_at');
const hasLegacyCreatedAt = taskColumns.some((column) => column.name === 'createdAt');

if (!hasCreatedAt && hasLegacyCreatedAt) {
  db.exec('ALTER TABLE tasks RENAME COLUMN createdAt TO created_at');
}

module.exports = db;
