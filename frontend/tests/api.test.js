/**
 * Task API Client Tests
 * 
 * Pengujian untuk client TaskAPI di frontend
 */

// Target global scope (window di browser, global di Node)
const globalScope = typeof window !== 'undefined' ? window : global;

// Mock fetch untuk pengujian
globalScope.fetch = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  
  if (url.endsWith('/tasks') && method === 'GET') {
    return {
      ok: true,
      status: 200,
      json: async () => [
        { id: '1', title: 'Task 1', description: 'Description 1', priority: 'high', status: 'todo' },
        { id: '2', title: 'Task 2', description: 'Description 2', priority: 'medium', status: 'in-progress' }
      ]
    };
  }
  
  if (url.match(/\/tasks\/1$/) && method === 'GET') {
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: '1', title: 'Task 1', description: 'Description 1', priority: 'high', status: 'todo' })
    };
  }
  
  if (url.endsWith('/tasks') && method === 'POST') {
    const taskData = JSON.parse(options.body || '{}');
    return {
      ok: true,
      status: 201,
      json: async () => ({ id: '3', ...taskData, created_at: new Date().toISOString() })
    };
  }
  
  if (url.match(/\/tasks\/\w+/) && method === 'PUT') {
    const taskData = JSON.parse(options.body || '{}');
    const id = url.split('/').pop();
    return {
      ok: true,
      status: 200,
      json: async () => ({ id, ...taskData, created_at: new Date().toISOString() })
    };
  }
  
  if (url.match(/\/tasks\/\w+/) && method === 'DELETE') {
    return {
      ok: true,
      status: 200,
      json: async () => ({ message: 'Task deleted' })
    };
  }
  
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' })
  };
};

// Test getAllTasks
async function testGetAllTasks() {
  console.log('Test: getAllTasks mengembalikan daftar tugas');
  try {
    const api = new TaskAPI('http://test-api');
    const tasks = await api.getAllTasks();
    if (!Array.isArray(tasks)) {
      console.error(`❌ GAGAL: getAllTasks tidak mengembalikan array. Didapatkan ${typeof tasks}`);
      return false;
    }
    if (tasks.length !== 2) {
      console.error(`❌ GAGAL: getAllTasks mengembalikan jumlah tugas yang salah. Diharapkan 2, didapatkan ${tasks.length}`);
      return false;
    }
    console.log('✅ BERHASIL: getAllTasks mengembalikan daftar tugas');
    return true;
  } catch (error) {
    console.error(`❌ GAGAL: getAllTasks melempar error: ${error.message}`);
    return false;
  }
}

// Test getTaskById
async function testGetTaskById() {
  console.log('Test: getTaskById mengembalikan tugas berdasarkan ID');
  try {
    const api = new TaskAPI('http://test-api');
    const task = await api.getTaskById('1');
    if (!task || task.id !== '1') {
      console.error('❌ GAGAL: getTaskById tidak mengembalikan tugas yang sesuai');
      return false;
    }
    console.log('✅ BERHASIL: getTaskById mengembalikan tugas yang sesuai');
    return true;
  } catch (error) {
    console.error(`❌ GAGAL: getTaskById melempar error: ${error.message}`);
    return false;
  }
}

// Test createTask
async function testCreateTask() {
  console.log('Test: createTask membuat tugas baru');
  try {
    const api = new TaskAPI('http://test-api');
    const taskData = {
      title: 'Task Baru',
      description: 'Deskripsi task baru',
      priority: 'medium',
      status: 'todo'
    };
    const createdTask = await api.createTask(taskData);
    if (!createdTask.id) {
      console.error('❌ GAGAL: createTask tidak mengembalikan ID tugas');
      return false;
    }
    if (createdTask.title !== taskData.title) {
      console.error(`❌ GAGAL: createTask mengembalikan judul yang salah. Diharapkan ${taskData.title}, didapatkan ${createdTask.title}`);
      return false;
    }
    console.log('✅ BERHASIL: createTask membuat tugas baru');
    return true;
  } catch (error) {
    console.error(`❌ GAGAL: createTask melempar error: ${error.message}`);
    return false;
  }
}

// Test updateTask
async function testUpdateTask() {
  console.log('Test: updateTask memperbarui tugas');
  try {
    const api = new TaskAPI('http://test-api');
    const updateData = {
      title: 'Task Diperbarui',
      status: 'done'
    };
    const updatedTask = await api.updateTask('1', updateData);
    if (!updatedTask || updatedTask.title !== updateData.title) {
      console.error('❌ GAGAL: updateTask tidak memperbarui judul');
      return false;
    }
    console.log('✅ BERHASIL: updateTask memperbarui tugas');
    return true;
  } catch (error) {
    console.error(`❌ GAGAL: updateTask melempar error: ${error.message}`);
    return false;
  }
}

// Test deleteTask
async function testDeleteTask() {
  console.log('Test: deleteTask menghapus tugas');
  try {
    const api = new TaskAPI('http://test-api');
    const success = await api.deleteTask('1');
    if (!success) {
      console.error('❌ GAGAL: deleteTask gagal menghapus tugas');
      return false;
    }
    console.log('✅ BERHASIL: deleteTask berhasil menghapus tugas');
    return true;
  } catch (error) {
    console.error(`❌ GAGAL: deleteTask melempar error: ${error.message}`);
    return false;
  }
}

// Run API tests
async function runApiTests() {
  let passed = 0;
  let total = 0;
  
  total++;
  if (await testGetAllTasks()) passed++;
  
  total++;
  if (await testGetTaskById()) passed++;
  
  total++;
  if (await testCreateTask()) passed++;
  
  total++;
  if (await testUpdateTask()) passed++;
  
  total++;
  if (await testDeleteTask()) passed++;
  
  console.log(`\nHasil: ${passed}/${total} pengujian berhasil`);
  return passed === total;
}

// Expose to window in browser
if (typeof window !== 'undefined') {
  window.testGetAllTasks = testGetAllTasks;
  window.testGetTaskById = testGetTaskById;
  window.testCreateTask = testCreateTask;
  window.testUpdateTask = testUpdateTask;
  window.testDeleteTask = testDeleteTask;
  window.runApiTests = runApiTests;
  
  if (typeof document !== 'undefined' && !document.getElementById('test-results')) {
    runApiTests();
  }
}

// Export for Node.js
if (typeof module !== 'undefined') {
  module.exports = {
    testGetAllTasks,
    testGetTaskById,
    testCreateTask,
    testUpdateTask,
    testDeleteTask,
    runApiTests
  };
}
