const TASKS_KEY = 'tasks';

export function saveTask(task) {
  const tasks = getTasks();
  tasks.push({ id: Date.now(), text: task, completed: false });
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getTasks() {
  return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
}
