import { getTasks } from './storage.js';

export function renderTasks() {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';

  const tasks = getTasks();
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.text;
    taskList.appendChild(li);
  });
}
