const Task = require('../models/Task');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const toTask = (row) => row && ({
  id: row.id,
  title: row.title,
  description: row.description,
  priority: row.priority,
  status: row.status,
  createdAt: row.created_at
});

/**
 * Task controller
 */
const taskController = {
  /**
   * Get all tasks
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllTasks: (req, res) => {
     const tasks = db.prepare('SELECT * FROM tasks ORDER BY rowid').all();
     res.json(tasks.map(toTask));
   },
  
  /**
   * Get task by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTaskById: (req, res) => {
    const taskId = req.params.id;
    const task = toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId));
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  },
  
  /**
   * Create a new task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createTask: (req, res) => {
    const taskData = req.body;
    
    // Validate task data
    const validation = Task.validate(taskData);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Create new task
    const taskId = uuidv4();
    const newTask = Task.fromData(taskData, taskId);

    db.prepare(`
      INSERT INTO tasks (id, title, description, priority, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      newTask.id,
      newTask.title,
      newTask.description,
      newTask.priority,
      newTask.status,
      newTask.createdAt
    );
    
    res.status(201).json(newTask);
  },
  
  /**
   * Update an existing task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateTask: (req, res) => {
    const taskId = req.params.id;
    const taskData = req.body;
    
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!row) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = toTask(row);
    
    // Validate task data
    const validation = Task.validate({ ...task, ...taskData });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Update task
    const updatedTask = new Task(
      task.id,
      task.title,
      task.description,
      task.priority,
      task.status
    );
    updatedTask.createdAt = task.createdAt;
    updatedTask.update(taskData);

    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, priority = ?, status = ?
      WHERE id = ?
    `).run(
      updatedTask.title,
      updatedTask.description,
      updatedTask.priority,
      updatedTask.status,
      taskId
    );

    res.json(updatedTask);
  },
  
  /**
   * Delete a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteTask: (req, res) => {
    const taskId = req.params.id;
    
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  }
};

module.exports = taskController;