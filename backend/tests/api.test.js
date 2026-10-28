/**
 * Task API client tests
 */

// Mock fetch for testing
global.fetch = async (url, options) => {
  // Mock responses based on URL and method
  if (url.endsWith('/tasks') && (!options || options.method === 'GET')) {
    return {
      ok: true,
      json: async () => [
        { id: '1', title: 'Task 1', description: 'Description 1', priority: 'high', status: 'todo' },
        { id: '2', title: 'Task 2', description: 'Description 2', priority: 'medium', status: 'in-progress' }
      ]
    };
  }
  
  if (url.endsWith('/tasks/1') && (!options || options.method === 'GET')) {
    return {
      ok: true,
      json: async () => ({ id: '1', title: 'Task 1', description: 'Description 1', priority: 'high', status: 'todo' })
    };
  }
  
  if (url.endsWith('/tasks') && options && options.method === 'POST') {
    const taskData = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ id: '3', ...taskData, createdAt: new Date().toISOString() })
    };
  }
  
  if (url.includes('/tasks/') && options && options.method === 'PUT') {
    const taskData = JSON.parse(options.body);
    const id = url.split('/').pop();
    return {
      ok: true,
      json: async () => ({ id, ...taskData, createdAt: new Date().toISOString() })
    };
  }
  
  if (url.includes('/tasks/') && options && options.method === 'DELETE') {
    return {
      ok: true,
      json: async () => ({})
    };
  }
  
  // Default error response
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
    // Arrange
    const api = new TaskAPI('http://test-api');
    
    // Act
    const tasks = await api.getAllTasks();
    
    // Assert
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

// Test createTask
async function testCreateTask() {
  console.log('Test: createTask membuat tugas baru');
  
  try {
    // Arrange
    const api = new TaskAPI('http://test-api');
    const taskData = {
      title: 'Task Baru',
      description: 'Deskripsi task baru',
      priority: 'medium',
      status: 'todo'
    };
    
    // Act
    const createdTask = await api.createTask(taskData);
    
    // Assert
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

// Run tests
async function runTests() {
  let passed = 0;
  let total = 0;
  
  total++;
  if (await testGetAllTasks()) passed++;
  
  total++;
  if (await testCreateTask()) passed++;
  
  console.log(`\nHasil: ${passed}/${total} pengujian berhasil`);
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  runTests();
}