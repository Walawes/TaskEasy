const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

// GET /api/tasks - Get all tasks
router.get('/tasks', taskController.getAllTasks);

// GET /api/tasks/:id - Get task by ID
router.get('/tasks/:id', taskController.getTaskById);

// POST /api/tasks - Create a new task
router.post('/tasks', taskController.createTask);

// PUT /api/tasks/:id - Update a task
router.put('/tasks/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;