/**
 * Task model
 */
class Task {
  constructor(id, title, description, priority, status) {
    this.id = id;
    this.title = title;
    this.description = description || '';
    this.priority = priority || 'medium';
    this.status = status || 'todo';
    this.createdAt = new Date().toISOString();
  }
  
  /**
   * Validate task data
   * @param {Object} data - Task data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validate(data) {
    const errors = [];
    
    // Validate title
    if (!data.title || data.title.trim() === '') {
      errors.push('Title is required');
    }
    
    // Validate priority
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      errors.push('Priority must be low, medium, or high');
    }
    
    // Validate status
    if (data.status && !['todo', 'in-progress', 'done'].includes(data.status)) {
      errors.push('Status must be todo, in-progress, or done');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Create a Task instance from data
   * @param {Object} data - Task data
   * @param {string} id - Task ID
   * @returns {Task} Task instance
   */
  static fromData(data, id) {
    return new Task(
      id,
      data.title,
      data.description,
      data.priority,
      data.status
    );
  }
  
  /**
   * Update task with new data
   * @param {Object} data - New task data
   */
  update(data) {
    this.title = data.title || this.title;
    this.description = data.description !== undefined ? data.description : this.description;
    this.priority = data.priority || this.priority;
    this.status = data.status || this.status;
  }
}

module.exports = Task;