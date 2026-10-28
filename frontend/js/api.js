/**
 * API client for interacting with the TaskEasy backend
 */
class TaskAPI {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  /**
   * Get all tasks
   * @returns {Promise<Array>} Array of tasks
   */
  async getAllTasks() {
    try {
      const response = await fetch(`${this.baseURL}/tasks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get a task by ID
   * @param {string} id - Task ID
   * @returns {Promise<Object>} Task object
   */
  async getTaskById(id) {
    try {
      const response = await fetch(`${this.baseURL}/tasks/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData) {
    try {
      const response = await fetch(`${this.baseURL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   * @param {string} id - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(id, taskData) {
    try {
      const response = await fetch(`${this.baseURL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTask(id) {
    try {
      const response = await fetch(`${this.baseURL}/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create a global instance of the API client
const taskAPI = new TaskAPI();