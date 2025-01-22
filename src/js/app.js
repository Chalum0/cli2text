import { saveTask, getTasks } from './storage.js';
import { renderTasks } from './dom.js';

document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');

  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const task = taskInput.value.trim();
    if (task) {
      saveTask(task);
      taskInput.value = '';
      renderTasks();
    }
  });

  renderTasks();
});
