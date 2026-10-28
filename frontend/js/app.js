/**
 * Main application entry point
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize task form
  const taskForm = new TaskForm('task-form', taskAPI);
  
  // Initialize task list
  const taskList = new TaskList('task-list', taskAPI);
  
  // Add Bootstrap icons
  const iconLink = document.createElement('link');
  iconLink.rel = 'stylesheet';
  iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css';
  document.head.appendChild(iconLink);
  
  console.log('TaskEasy application initialized');
});