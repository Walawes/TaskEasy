/**
 * Task List Handler
 */
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

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for task updates
    document.addEventListener('tasksUpdated', this.loadTasks.bind(this));
    
    // Search and filter
    this.searchInput.addEventListener('input', this.handleSearch.bind(this));
    this.statusFilter.addEventListener('change', this.handleStatusFilter.bind(this));
    
    // Edit task form
    document.getElementById('save-edit-task').addEventListener('click', this.handleEditTaskSave.bind(this));
  }

  /**
   * Load tasks from API
   */
  async loadTasks() {
    try {
      this.showLoading();
      
      // Fetch tasks
      this.tasks = await this.api.getAllTasks();
      
      // Apply current filters
      this.applyFilters();
      
      // Render tasks
      this.renderTasks();
    } catch (error) {
      this.showError('Gagal memuat tugas. Silakan coba lagi.');
      console.error('Error loading tasks:', error);
    }
  }

  /**
   * Apply search and status filters
   */
  applyFilters() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const statusFilter = this.statusFilter.value;
    
    this.filteredTasks = this.tasks.filter(task => {
      // Apply search filter
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm) || 
        task.description.toLowerCase().includes(searchTerm);
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort by priority (high > medium > low)
    this.filteredTasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Handle search input
   */
  handleSearch() {
    this.applyFilters();
    this.renderTasks();
  }

  /**
   * Handle status filter change
   */
  handleStatusFilter() {
    this.applyFilters();
    this.renderTasks();
  }

  /**
   * Render tasks to the container
   */
  renderTasks() {
    // Clear container
    this.container.innerHTML = '';
    
    // Show message if no tasks
    if (this.filteredTasks.length === 0) {
      this.container.innerHTML = `
        <div class="text-center py-4">
          <p class="text-muted">Tidak ada tugas yang ditemukan</p>
        </div>
      `;
      return;
    }
    
    // Render each task
    this.filteredTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      this.container.appendChild(taskElement);
    });
  }

  /**
   * Create a task list item element
   * @param {Object} task - Task data
   * @returns {HTMLElement} Task element
   */
  createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `list-group-item task-item priority-${task.priority}`;
    taskElement.dataset.taskId = task.id;
    
    // Format date
    const createdDate = new Date(task.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Status text
    const statusText = {
      'todo': 'To Do',
      'in-progress': 'Sedang Dikerjakan',
      'done': 'Selesai'
    };
    
    // Priority text
    const priorityText = {
      'low': 'Rendah',
      'medium': 'Sedang',
      'high': 'Tinggi'
    };
    
    taskElement.innerHTML = `
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${task.title}</h5>
        <div>
          <span class="badge status-${task.status}">${statusText[task.status]}</span>
          <span class="badge priority-${task.priority}">${priorityText[task.priority]}</span>
        </div>
      </div>
      <p class="mb-1">${task.description || 'Tidak ada deskripsi'}</p>
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">Dibuat pada ${createdDate}</small>
        <div class="task-actions">
          <button class="btn btn-sm btn-outline-primary edit-task-btn">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline-danger delete-task-btn">
            <i class="bi bi-trash"></i> Hapus
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners
    const editButton = taskElement.querySelector('.edit-task-btn');
    const deleteButton = taskElement.querySelector('.delete-task-btn');
    
    editButton.addEventListener('click', () => this.handleEditTask(task));
    deleteButton.addEventListener('click', () => this.handleDeleteTask(task.id));
    
    return taskElement;
  }

  /**
   * Handle edit task button click
   * @param {Object} task - Task to edit
   */
  handleEditTask(task) {
    // Populate edit form
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-description').value = task.description;
    document.getElementById('edit-priority').value = task.priority;
    document.getElementById('edit-status').value = task.status;
    
    // Show modal
    this.editModal.show();
  }

  /**
   * Handle save edit task button click
   */
  async handleEditTaskSave() {
    try {
      const taskId = document.getElementById('edit-task-id').value;
      
      // Get form data
      const taskData = {
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-description').value,
        priority: document.getElementById('edit-priority').value,
        status: document.getElementById('edit-status').value
      };
      
      // Validate form data
      if (!taskData.title || taskData.title.trim() === '') {
        alert('Judul tugas tidak boleh kosong');
        return;
      }
      
      // Update task
      await this.api.updateTask(taskId, taskData);
      
      // Hide modal
      this.editModal.hide();
      
      // Refresh task list
      this.loadTasks();
      
      // Show success message
      this.showToast('Tugas berhasil diperbarui!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Handle delete task button click
   * @param {string} taskId - Task ID to delete
   */
  async handleDeleteTask(taskId) {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      return;
    }
    
    try {
      // Delete task
      await this.api.deleteTask(taskId);
      
      // Refresh task list
      this.loadTasks();
      
      // Show success message
      this.showToast('Tugas berhasil dihapus!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    this.container.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="alert alert-danger m-3" role="alert">
        ${message}
      </div>
    `;
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   */
  showToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toastId = `toast-${Date.now()}`;
    const toastElement = document.createElement('div');
    toastElement.className = 'toast';
    toastElement.id = toastId;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    toastElement.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">TaskEasy</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    toastContainer.appendChild(toastElement);
    
    // Show toast
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }
}