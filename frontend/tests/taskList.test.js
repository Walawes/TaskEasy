/**
 * Task List Tests
 * 
 * Pengujian untuk komponen daftar tugas
 */

// Mock DOM untuk pengujian
function setupDOM() {
  // Buat elemen HTML dasar untuk pengujian
  document.body.innerHTML = `
    <div id="test-container">
      <div class="row mb-3">
        <div class="col-md-8">
          <input type="text" id="search-input" class="form-control" placeholder="Cari tugas...">
        </div>
        <div class="col-md-4">
          <select id="status-filter" class="form-select">
            <option value="all">Semua Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">Sedang Dikerjakan</option>
            <option value="done">Selesai</option>
          </select>
        </div>
      </div>
      <div id="task-list" class="list-group">
        <!-- Task items will be inserted here -->
      </div>
      
      <!-- Edit Modal -->
      <div class="modal fade" id="editTaskModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit Tugas</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="edit-task-form">
                <input type="hidden" id="edit-task-id">
                <div class="mb-3">
                  <label for="edit-title" class="form-label">Judul</label>
                  <input type="text" class="form-control" id="edit-title" name="edit-title" required>
                </div>
                <div class="mb-3">
                  <label for="edit-description" class="form-label">Deskripsi</label>
                  <textarea class="form-control" id="edit-description" name="edit-description" rows="3"></textarea>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="edit-priority" class="form-label">Prioritas</label>
                    <select class="form-select" id="edit-priority" name="edit-priority">
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="edit-status" class="form-label">Status</label>
                    <select class="form-select" id="edit-status" name="edit-status">
                      <option value="todo">To Do</option>
                      <option value="in-progress">Sedang Dikerjakan</option>
                      <option value="done">Selesai</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
              <button type="button" class="btn btn-primary" id="save-edit-task">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Mock Bootstrap Modal
  window.bootstrap = {
    Modal: class {
      constructor(element) {
        this.element = element;
      }
      show() {
        // Mock implementation
        this.element.classList.add('show');
        console.log('Showing modal');
      }
      hide() {
        // Mock implementation
        this.element.classList.remove('show');
        console.log('Hiding modal');
      }
    }
  };
  
  return document.getElementById('test-container');
}

// Mock API client
class MockTaskAPI {
  constructor() {
    this.tasks = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        priority: 'high',
        status: 'todo',
        createdAt: '2023-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Description 2',
        priority: 'medium',
        status: 'in-progress',
        createdAt: '2023-01-02T00:00:00.000Z'
      },
      {
        id: '3',
        title: 'Task 3',
        description: 'Description 3',
        priority: 'low',
        status: 'done',
        createdAt: '2023-01-03T00:00:00.000Z'
      }
    ];
  }
  
  async getAllTasks() {
    return [...this.tasks];
  }
  
  async getTaskById(id) {
    return this.tasks.find(task => task.id === id);
  }
  
  async updateTask(id, taskData) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...taskData };
      return this.tasks[index];
    }
    throw new Error('Task not found');
  }
  
  async deleteTask(id) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== id);
    return initialLength !== this.tasks.length;
  }
}

/**
 * Test: Daftar tugas dapat dirender dengan benar
 */
function testTaskListRendering() {
  console.log('Test: Daftar tugas dapat dirender dengan benar');
  
  // Arrange
  const container = setupDOM();
  const mockAPI = new MockTaskAPI();
  const taskList = new TaskList('task-list', mockAPI);
  
  // Act - Tunggu loadTasks selesai
  return new Promise(resolve => {
    setTimeout(() => {
      // Assert
      const taskElements = document.querySelectorAll('.task-item');
      
      if (taskElements.length !== 3) {
        console.error(`❌ GAGAL: Jumlah task yang dirender tidak sesuai. Diharapkan 3, didapatkan ${taskElements.length}`);
        resolve(false);
        return;
      }
      
      // Cek task pertama
      const firstTask = taskElements[0];
      if (!firstTask.textContent.includes('Task 1')) {
        console.error(`❌ GAGAL: Task pertama tidak berisi judul yang benar. Diharapkan 'Task 1', tidak ditemukan dalam '${firstTask.textContent}'`);
        resolve(false);
        return;
      }
      
      console.log('✅ BERHASIL: Daftar tugas dapat dirender dengan benar');
      resolve(true);
    }, 100);
  });
}

/**
 * Test: Filter status berfungsi dengan benar
 */
function testStatusFilter() {
  console.log('Test: Filter status berfungsi dengan benar');
  
  // Arrange
  const container = setupDOM();
  const mockAPI = new MockTaskAPI();
  const taskList = new TaskList('task-list', mockAPI);
  
  // Act - Tunggu loadTasks selesai, lalu filter
  return new Promise(resolve => {
    setTimeout(() => {
      // Filter by 'todo'
      const statusFilter = document.getElementById('status-filter');
      statusFilter.value = 'todo';
      
      // Trigger change event
      const changeEvent = new Event('change');
      statusFilter.dispatchEvent(changeEvent);
      
      // Wait for filter to apply
      setTimeout(() => {
        // Assert
        const taskElements = document.querySelectorAll('.task-item');
        
        if (taskElements.length !== 1) {
          console.error(`❌ GAGAL: Jumlah task setelah filter tidak sesuai. Diharapkan 1, didapatkan ${taskElements.length}`);
          resolve(false);
          return;
        }
        
        // Cek task yang tersisa
        const firstTask = taskElements[0];
        if (!firstTask.textContent.includes('Task 1')) {
          console.error(`❌ GAGAL: Task yang tersisa bukan yang diharapkan. Diharapkan 'Task 1', tidak ditemukan dalam '${firstTask.textContent}'`);
          resolve(false);
          return;
        }
        
        console.log('✅ BERHASIL: Filter status berfungsi dengan benar');
        resolve(true);
      }, 100);
    }, 100);
  });
}

/**
 * Test: Pencarian berfungsi dengan benar
 */
function testSearch() {
  console.log('Test: Pencarian berfungsi dengan benar');
  
  // Arrange
  const container = setupDOM();
  const mockAPI = new MockTaskAPI();
  const taskList = new TaskList('task-list', mockAPI);
  
  // Act - Tunggu loadTasks selesai, lalu cari
  return new Promise(resolve => {
    setTimeout(() => {
      // Search for 'Task 2'
      const searchInput = document.getElementById('search-input');
      searchInput.value = 'Task 2';
      
      // Trigger input event
      const inputEvent = new Event('input');
      searchInput.dispatchEvent(inputEvent);
      
      // Wait for search to apply
      setTimeout(() => {
        // Assert
        const taskElements = document.querySelectorAll('.task-item');
        
        if (taskElements.length !== 1) {
          console.error(`❌ GAGAL: Jumlah task setelah pencarian tidak sesuai. Diharapkan 1, didapatkan ${taskElements.length}`);
          resolve(false);
          return;
        }
        
        // Cek task yang tersisa
        const firstTask = taskElements[0];
        if (!firstTask.textContent.includes('Task 2')) {
          console.error(`❌ GAGAL: Task yang tersisa bukan yang diharapkan. Diharapkan 'Task 2', tidak ditemukan dalam '${firstTask.textContent}'`);
          resolve(false);
          return;
        }
        
        console.log('✅ BERHASIL: Pencarian berfungsi dengan benar');
        resolve(true);
      }, 100);
    }, 100);
  });
}

/**
 * Test: Menampilkan pesan saat tidak ada tugas
 */
function testEmptyTaskList() {
  console.log('Test: Menampilkan pesan saat tidak ada tugas');
  
  // Arrange
  const container = setupDOM();
  const mockAPI = new MockTaskAPI();
  // Kosongkan daftar tugas
  mockAPI.tasks = [];
  
  const taskList = new TaskList('task-list', mockAPI);
  
  // Act - Tunggu loadTasks selesai
  return new Promise(resolve => {
    setTimeout(() => {
      // Assert
      const taskElements = document.querySelectorAll('.task-item');
      
      if (taskElements.length !== 0) {
        console.error(`❌ GAGAL: Masih ada task yang dirender. Diharapkan 0, didapatkan ${taskElements.length}`);
        resolve(false);
        return;
      }
      
      const emptyMessage = document.querySelector('.text-muted');
      if (!emptyMessage || !emptyMessage.textContent.includes('Tidak ada tugas')) {
        console.error('❌ GAGAL: Pesan "Tidak ada tugas" tidak ditemukan');
        resolve(false);
        return;
      }
      
      console.log('✅ BERHASIL: Menampilkan pesan saat tidak ada tugas');
      resolve(true);
    }, 100);
  });
}

/**
 * Test: Modal edit dapat ditampilkan dengan data yang benar
 */
function testEditModal() {
  console.log('Test: Modal edit dapat ditampilkan dengan data yang benar');
  
  // Arrange
  const container = setupDOM();
  const mockAPI = new MockTaskAPI();
  const taskList = new TaskList('task-list', mockAPI);
  
  // Act - Tunggu loadTasks selesai, lalu klik edit
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulasi klik tombol edit
      taskList.handleEditTask(mockAPI.tasks[0]);
      
      // Assert
      const taskIdInput = document.getElementById('edit-task-id');
      const titleInput = document.getElementById('edit-title');
      const descriptionInput = document.getElementById('edit-description');
      
      if (taskIdInput.value !== '1') {
        console.error(`❌ GAGAL: ID task di modal edit tidak sesuai. Diharapkan '1', didapatkan '${taskIdInput.value}'`);
        resolve(false);
        return;
      }
      
      if (titleInput.value !== 'Task 1') {
        console.error(`❌ GAGAL: Judul task di modal edit tidak sesuai. Diharapkan 'Task 1', didapatkan '${titleInput.value}'`);
        resolve(false);
        return;
      }
      
      if (descriptionInput.value !== 'Description 1') {
        console.error(`❌ GAGAL: Deskripsi task di modal edit tidak sesuai. Diharapkan 'Description 1', didapatkan '${descriptionInput.value}'`);
        resolve(false);
        return;
      }
      
      console.log('✅ BERHASIL: Modal edit dapat ditampilkan dengan data yang benar');
      resolve(true);
    }, 100);
  });
}

/**
 * Jalankan semua pengujian List
 */
async function runListTests() {
  let passed = 0;
  let total = 0;
  
  // Definisikan TaskList jika belum ada (untuk pengujian)
  if (typeof TaskList === 'undefined') {
    class TaskList {
      constructor(containerId, api) {
        this.container = document.getElementById(containerId);
        this.api = api;
        this.tasks = [];
        this.filteredTasks = [];
        this.searchInput = document.getElementById('search-input');
        this.statusFilter = document.getElementById('status-filter');
        this.editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
        
        this.setupEventListeners();
        this.loadTasks();
      }
      
      setupEventListeners() {
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        this.statusFilter.addEventListener('change', this.handleStatusFilter.bind(this));
      }
      
      async loadTasks() {
        try {
          this.tasks = await this.api.getAllTasks();
          this.applyFilters();
          this.renderTasks();
        } catch (error) {
          this.showError('Gagal memuat tugas');
        }
      }
      
      applyFilters() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const statusFilter = this.statusFilter.value;
        
        this.filteredTasks = this.tasks.filter(task => {
          const matchesSearch = 
            task.title.toLowerCase().includes(searchTerm) || 
            task.description.toLowerCase().includes(searchTerm);
          
          const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
          
          return matchesSearch && matchesStatus;
        });
      }
      
      handleSearch() {
        this.applyFilters();
        this.renderTasks();
      }
      
      handleStatusFilter() {
        this.applyFilters();
        this.renderTasks();
      }
      
      renderTasks() {
        this.container.innerHTML = '';
        
        if (this.filteredTasks.length === 0) {
          this.container.innerHTML = `
            <div class="text-center py-4">
              <p class="text-muted">Tidak ada tugas yang ditemukan</p>
            </div>
          `;
          return;
        }
        
        this.filteredTasks.forEach(task => {
          const taskElement = this.createTaskElement(task);
          this.container.appendChild(taskElement);
        });
      }
      
      createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `list-group-item task-item priority-${task.priority}`;
        taskElement.dataset.taskId = task.id;
        
        taskElement.innerHTML = `
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${task.title}</h5>
            <div>
              <span class="badge status-${task.status}">${task.status}</span>
              <span class="badge priority-${task.priority}">${task.priority}</span>
            </div>
          </div>
          <p class="mb-1">${task.description || 'Tidak ada deskripsi'}</p>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">Dibuat pada ${new Date(task.createdAt).toLocaleDateString()}</small>
            <div class="task-actions">
              <button class="btn btn-sm btn-outline-primary edit-task-btn">Edit</button>
              <button class="btn btn-sm btn-outline-danger delete-task-btn">Hapus</button>
            </div>
          </div>
        `;
        
        return taskElement;
      }
      
      handleEditTask(task) {
        document.getElementById('edit-task-id').value = task.id;
        document.getElementById('edit-title').value = task.title;
        document.getElementById('edit-description').value = task.description;
        document.getElementById('edit-priority').value = task.priority;
        document.getElementById('edit-status').value = task.status;
        
        this.editModal.show();
      }
      
      showError(message) {
        this.container.innerHTML = `
          <div class="alert alert-danger m-3" role="alert">
            ${message}
          </div>
        `;
      }
    }
    
    window.TaskList = TaskList;
  }
  
  total++;
  if (await testTaskListRendering()) passed++;
  
  total++;
  if (await testStatusFilter()) passed++;
  
  total++;
  if (await testSearch()) passed++;
  
  total++;
  if (await testEmptyTaskList()) passed++;
  
  total++;
  if (await testEditModal()) passed++;
  
  console.log(`\nHasil: ${passed}/${total} pengujian berhasil`);
  return passed === total;
}

// Jalankan pengujian jika file ini dijalankan langsung
if (typeof window !== 'undefined') {
  window.runListTests = runListTests;
  if (typeof document !== 'undefined' && !document.getElementById('test-results')) {
    runListTests();
  }
}

if (typeof module !== 'undefined') {
  // Export untuk Node.js
  module.exports = { 
    testTaskListRendering, 
    testStatusFilter, 
    testSearch, 
    testEmptyTaskList,
    testEditModal,
    runListTests
  };
}