/**
 * Task model tests
 */

const Task = require('../models/Task');

// Test task creation
function testTaskCreation() {
  console.log('Test: Task dapat dibuat dengan properti yang benar');
  
  // Arrange
  const id = '123';
  const title = 'Belajar TDD';
  const description = 'Mempelajari Test-Driven Development';
  const priority = 'high';
  const status = 'todo';
  
  // Act
  const task = new Task(id, title, description, priority, status);
  
  // Assert
  if (task.id !== id) {
    console.error(`❌ GAGAL: id tidak sesuai. Diharapkan ${id}, didapatkan ${task.id}`);
    return false;
  }
  
  if (task.title !== title) {
    console.error(`❌ GAGAL: title tidak sesuai. Diharapkan ${title}, didapatkan ${task.title}`);
    return false;
  }
  
  if (task.description !== description) {
    console.error(`❌ GAGAL: description tidak sesuai. Diharapkan ${description}, didapatkan ${task.description}`);
    return false;
  }
  
  if (task.priority !== priority) {
    console.error(`❌ GAGAL: priority tidak sesuai. Diharapkan ${priority}, didapatkan ${task.priority}`);
    return false;
  }
  
  if (task.status !== status) {
    console.error(`❌ GAGAL: status tidak sesuai. Diharapkan ${status}, didapatkan ${task.status}`);
    return false;
  }
  
  console.log('✅ BERHASIL: Task dapat dibuat dengan properti yang benar');
  return true;
}

// Test task validation
function testTaskValidation() {
  console.log('Test: Validasi task berfungsi dengan benar');
  
  // Test case 1: Valid task
  const validTask = {
    title: 'Task Valid',
    priority: 'medium',
    status: 'todo'
  };
  
  const validResult = Task.validate(validTask);
  if (!validResult.isValid) {
    console.error(`❌ GAGAL: Task valid dianggap tidak valid. Errors: ${validResult.errors.join(', ')}`);
    return false;
  }
  
  // Test case 2: Invalid title
  const invalidTitleTask = {
    title: '',
    priority: 'medium',
    status: 'todo'
  };
  
  const invalidTitleResult = Task.validate(invalidTitleTask);
  if (invalidTitleResult.isValid) {
    console.error('❌ GAGAL: Task dengan title kosong dianggap valid');
    return false;
  }
  
  // Test case 3: Invalid priority
  const invalidPriorityTask = {
    title: 'Task Valid',
    priority: 'invalid',
    status: 'todo'
  };
  
  const invalidPriorityResult = Task.validate(invalidPriorityTask);
  if (invalidPriorityResult.isValid) {
    console.error('❌ GAGAL: Task dengan priority tidak valid dianggap valid');
    return false;
  }
  
  console.log('✅ BERHASIL: Validasi task berfungsi dengan benar');
  return true;
}

// Test task update
function testTaskUpdate() {
  console.log('Test: Task dapat diperbarui dengan benar');
  
  // Arrange
  const task = new Task('123', 'Judul Awal', 'Deskripsi Awal', 'low', 'todo');
  const updateData = {
    title: 'Judul Baru',
    description: 'Deskripsi Baru',
    priority: 'high',
    status: 'done'
  };
  
  // Act
  task.update(updateData);
  
  // Assert
  if (task.title !== updateData.title) {
    console.error(`❌ GAGAL: title tidak diperbarui. Diharapkan ${updateData.title}, didapatkan ${task.title}`);
    return false;
  }
  
  if (task.description !== updateData.description) {
    console.error(`❌ GAGAL: description tidak diperbarui. Diharapkan ${updateData.description}, didapatkan ${task.description}`);
    return false;
  }
  
  if (task.priority !== updateData.priority) {
    console.error(`❌ GAGAL: priority tidak diperbarui. Diharapkan ${updateData.priority}, didapatkan ${task.priority}`);
    return false;
  }
  
  if (task.status !== updateData.status) {
    console.error(`❌ GAGAL: status tidak diperbarui. Diharapkan ${updateData.status}, didapatkan ${task.status}`);
    return false;
  }
  
  console.log('✅ BERHASIL: Task dapat diperbarui dengan benar');
  return true;
}

// Run tests
function runTests() {
  let passed = 0;
  let total = 0;
  
  total++;
  if (testTaskCreation()) passed++;
  
  total++;
  if (testTaskValidation()) passed++;
  
  total++;
  if (testTaskUpdate()) passed++;
  
  console.log(`\nHasil: ${passed}/${total} pengujian berhasil`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testTaskCreation, testTaskValidation, testTaskUpdate };