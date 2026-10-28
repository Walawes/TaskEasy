const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');

const databasePath = path.join(os.tmpdir(), `taskeasy-server-${uuidv4()}.db`);
process.env.TASK_DATABASE_PATH = databasePath;

const db = require('../database');
const app = require('../app');

const server = app.listen(0, async () => {
  const { port } = server.address();
  const baseURL = `http://127.0.0.1:${port}`;

  try {
    const pageResponse = await fetch(baseURL);
    assert.equal(pageResponse.status, 200);
    assert.match(pageResponse.headers.get('content-type'), /text\/html/);
    assert.match(await pageResponse.text(), /TaskEasy/);

    const scriptResponse = await fetch(`${baseURL}/js/api.js`);
    assert.equal(scriptResponse.status, 200);
    assert.match(await scriptResponse.text(), /class TaskAPI/);

    const healthResponse = await fetch(`${baseURL}/api/health`);
    assert.equal(healthResponse.status, 200);
    assert.deepEqual(await healthResponse.json(), { status: 'ok' });

    const tasksResponse = await fetch(`${baseURL}/api/tasks`);
    assert.equal(tasksResponse.status, 200);
    assert.deepEqual(await tasksResponse.json(), []);

    console.log('Frontend dan API tersedia dari satu origin');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      db.close();
      if (fs.existsSync(databasePath)) {
        fs.unlinkSync(databasePath);
      }
    });
  }
});
