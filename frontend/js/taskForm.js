/**
 * Task Form Handler
 */
class TaskForm {
  constructor(formId, api) {
    this.form = document.getElementById(formId);
    this.api = api;
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for the form
   */
  setupEventListeners() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    try {
      // Get form data
      const taskData = {
        title: this.form.elements.title.value,
        description: this.form.elements.description.value,
        priority: this.form.elements.priority.value,
        status: this.form.elements.status.value
      };
      
      // Validate form data
      if (!this.validateTaskData(taskData)) {
        return;
      }
      
      // Show loading state
      this.setLoadingState(true);
      
      // Create task
      const createdTask = await this.api.createTask(taskData);
      
      // Reset form
      this.form.reset();
      
      // Show success message
      this.showAlert('success', 'Tugas berhasil ditambahkan!');
      
      // Refresh task list
      document.dispatchEvent(new CustomEvent('tasksUpdated'));
      
      // Switch to tasks tab
      const tasksTab = document.getElementById('tasks-tab');
      const tab = new bootstrap.Tab(tasksTab);
      tab.show();
    } catch (error) {
      this.showAlert('danger', `Error: ${error.message}`);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Validate task data
   * @param {Object} taskData - Task data to validate
   * @returns {boolean} Validation result
   */
  validateTaskData(taskData) {
    if (!taskData.title || taskData.title.trim() === '') {
      this.showAlert('danger', 'Judul tugas tidak boleh kosong');
      return false;
    }
    
    return true;
  }

  /**
   * Show alert message
   * @param {string} type - Alert type (success, danger, etc.)
   * @param {string} message - Alert message
   */
  showAlert(type, message) {
    // Remove any existing alerts
    const existingAlert = this.form.querySelector('.alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} mt-3`;
    alert.textContent = message;
    
    // Add dismiss button
    const dismissButton = document.createElement('button');
    dismissButton.type = 'button';
    dismissButton.className = 'btn-close';
    dismissButton.setAttribute('data-bs-dismiss', 'alert');
    dismissButton.setAttribute('aria-label', 'Close');
    alert.appendChild(dismissButton);
    
    // Add alert to form
    this.form.appendChild(alert);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 3000);
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Loading state
   */
  setLoadingState(isLoading) {
    const submitButton = this.form.querySelector('button[type="submit"]');
    
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Menyimpan...';
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Tambah Tugas';
    }
  }
}