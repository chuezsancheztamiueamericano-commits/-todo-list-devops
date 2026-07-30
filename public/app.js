const API_URL = '/api/tasks';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const filterInput = document.getElementById('filter-input');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const taskCounter = document.getElementById('task-counter');
const progressFill = document.getElementById('progress-fill');

let allTasks = []; // cache local de tareas, usada para el filtro en tiempo real
let isLoading = false;

// --- Show loading state ---
function setLoading(loading) {
  isLoading = loading;
  taskForm.querySelector('.btn-add').disabled = loading;
  taskForm.querySelector('.btn-add').textContent = loading ? 'Cargando...' : 'Agregar';
  taskInput.disabled = loading;
}

// --- Show error message ---
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    background: var(--danger-soft);
    color: var(--danger);
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 0.9rem;
    animation: fadeIn 0.3s ease;
  `;
  taskForm.parentNode.insertBefore(errorDiv, taskForm);
  setTimeout(() => errorDiv.remove(), 5000);
}

// --- Cargar tareas desde el backend ---
async function loadTasks() {
  if (isLoading) return;
  setLoading(true);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al obtener tareas');
    allTasks = await res.json();
    renderTasks(allTasks);
  } catch (err) {
    console.error(err);
    showError('No se pudieron cargar las tareas. Verifica que el backend esté corriendo.');
  } finally {
    setLoading(false);
  }
}

// --- Renderizar la lista de tareas en el DOM ---
function renderTasks(tasks) {
  taskList.innerHTML = '';

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  taskCounter.textContent = `${completed}/${total}`;
  progressFill.style.width = total === 0 ? '0%' : `${(completed / total) * 100}%`;

  if (tasks.length === 0) {
    emptyMessage.style.display = 'block';
    return;
  }
  emptyMessage.style.display = 'none';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.completed;
    checkbox.addEventListener('change', () => toggleComplete(task.id, checkbox.checked));

    const span = document.createElement('span');
    span.className = 'task-title';
    span.textContent = task.title;
    span.addEventListener('dblclick', () => editTask(task));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

// --- Crear tarea ---
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  setLoading(true);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al crear tarea');
    }
    taskInput.value = '';
    await loadTasks();
  } catch (err) {
    console.error(err);
    showError(err.message || 'No se pudo agregar la tarea.');
  } finally {
    setLoading(false);
  }
});

// --- Marcar como completada / pendiente ---
async function toggleComplete(id, completed) {
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al actualizar tarea');
    }
    await loadTasks();
  } catch (err) {
    console.error(err);
    showError(err.message || 'No se pudo actualizar la tarea.');
  } finally {
    setLoading(false);
  }
}

// --- Editar título (doble click sobre el texto) ---
async function editTask(task) {
  const newTitle = prompt('Editar tarea:', task.title);
  if (newTitle === null || !newTitle.trim() || newTitle.trim() === task.title) return;

  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al editar tarea');
    }
    await loadTasks();
  } catch (err) {
    console.error(err);
    showError(err.message || 'No se pudo editar la tarea.');
  } finally {
    setLoading(false);
  }
}

// --- Eliminar tarea ---
async function deleteTask(id) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al eliminar tarea');
    }
    await loadTasks();
  } catch (err) {
    console.error(err);
    showError(err.message || 'No se pudo eliminar la tarea.');
  } finally {
    setLoading(false);
  }
}

// --- Filtro en tiempo real (sobre la caché local, sin llamar al backend) ---
filterInput.addEventListener('input', () => {
  const query = filterInput.value.toLowerCase().trim();
  const filtered = allTasks.filter(task =>
    task.title.toLowerCase().includes(query)
  );
  renderTasks(filtered);
});

// --- Carga inicial ---
loadTasks();