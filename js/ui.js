/**
 * Módulo de interfaz de usuario
 * Maneja el renderizado y eventos de la UI
 */

const UI = {
  currentFilter: 'all',

  /**
   * Inicializa los eventos de la interfaz
   */
  init() {
    this.attachEventListeners();
    this.render();
  },

  /**
   * Adjunta event listeners a elementos
   */
  attachEventListeners() {
    // Botón de agregar tarea
    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showInputModal());
    }

    // Filtros
    const filterBtns = document.querySelectorAll('[data-filter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
      });
    });

    // Modal de entrada
    const modal = document.getElementById('inputModal');
    const closeModal = document.getElementById('closeModal');
    const saveBtn = document.getElementById('saveTaskBtn');

    if (closeModal) {
      closeModal.addEventListener('click', () => this.closeInputModal());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveTaskFromModal());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeInputModal();
        }
      });
    }

    // Enter en el input
    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.saveTaskFromModal();
        }
      });
    }
  },

  /**
   * Muestra el modal de entrada
   */
  showInputModal() {
    const modal = document.getElementById('inputModal');
    const input = document.getElementById('taskInput');
    const timeInput = document.getElementById('taskTime');
    if (modal) {
      modal.style.display = 'flex';
      input.focus();
      input.value = '';
      if (timeInput) timeInput.value = '';
    }
  },

  /**
   * Cierra el modal de entrada
   */
  closeInputModal() {
    const modal = document.getElementById('inputModal');
    const input = document.getElementById('taskInput');
    const timeInput = document.getElementById('taskTime');
    if (modal) {
      modal.style.display = 'none';
      input.removeAttribute('data-editId');
      if (timeInput) timeInput.value = '';
      document.querySelector('#inputModal h2').textContent = 'Nueva tarea';
      document.getElementById('saveTaskBtn').textContent = 'Crear';
    }
  },

  /**
   * Guarda la tarea desde el modal
   */
  saveTaskFromModal() {
    const input = document.getElementById('taskInput');
    const timeInput = document.getElementById('taskTime');
    const text = input.value.trim();
    const time = timeInput ? timeInput.value : '';
    const editId = input.dataset.editId;

    if (text.length === 0) {
      alert('Por favor ingresa una tarea');
      return;
    }

    if (text.length > 500) {
      alert('La tarea es demasiado larga (máximo 500 caracteres)');
      return;
    }

    if (editId) {
      Storage.updateTask(parseInt(editId), { text: text, time: time });
    } else {
      Storage.addTask(text, 'task', time);
    }

    this.closeInputModal();
    this.render();
  },

  /**
   * Obtiene tareas filtradas según el filtro actual
   * @returns {Array} Tareas filtradas
   */
  getFilteredTasks() {
    const allTasks = Storage.getTasks();

    switch (this.currentFilter) {
      case 'completed':
        return allTasks.filter(t => t.completed);
      case 'pending':
        return allTasks.filter(t => !t.completed);
      case 'all':
      default:
        return allTasks;
    }
  },

  /**
   * Renderiza la interfaz completa
   */
  render() {
    this.renderTaskList();
    this.updateTaskCount();
  },

  /**
   * Renderiza la lista de tareas
   */
  renderTaskList() {
    const container = document.getElementById('tasksList');
    const tasks = this.getFilteredTasks();

    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>📭 No hay tareas ${this.currentFilter === 'completed' ? 'completadas' : this.currentFilter === 'pending' ? 'pendientes' : ''}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(task => this.createTaskElement(task))
      .join('');

    // Adjuntar event listeners a las tareas
    this.attachTaskEventListeners();
  },

  /**
   * Crea el HTML de una tarea
   * @param {Object} task - La tarea
   * @returns {string} HTML de la tarea
   */
  createTaskElement(task) {
    const timeDisplay = task.time ? ` • ${task.time}` : '';
    return `
      <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-content">
          <div class="task-checkbox-wrapper">
            <input 
              type="checkbox" 
              class="task-checkbox" 
              ${task.completed ? 'checked' : ''}
              data-action="toggle"
              data-id="${task.id}"
            >
            <label class="checkbox-custom"></label>
          </div>
          <div class="task-text-wrapper">
            <p class="task-text">${this.escapeHtml(task.text)}</p>
            <span class="task-date">${task.date}${timeDisplay}</span>
          </div>
        </div>
        <div class="task-buttons">
          <button class="task-btn btn-edit" data-action="edit" data-id="${task.id}" title="Editar">
            ✏️
          </button>
          <button class="task-btn btn-delete" data-action="delete" data-id="${task.id}" title="Eliminar">
            🗑️
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Adjunta event listeners a las tareas
   */
  attachTaskEventListeners() {
    document.querySelectorAll('[data-action="toggle"]').forEach(btn => {
      btn.addEventListener('change', (e) => {
        Storage.toggleTaskComplete(parseInt(e.target.dataset.id));
        this.render();
      });
    });

    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = parseInt(e.currentTarget.dataset.id);
        if (confirm('¿Eliminar esta tarea?')) {
          Storage.deleteTask(taskId);
          this.render();
        }
      });
    });

    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = parseInt(e.currentTarget.dataset.id);
        const task = Storage.getTaskById(taskId);
        if (task) {
          this.showEditModal(task);
        }
      });
    });
  },

  /**
   * Muestra el modal para editar una tarea
   * @param {Object} task - La tarea a editar
   */
  showEditModal(task) {
    const input = document.getElementById('taskInput');
    const timeInput = document.getElementById('taskTime');
    const modal = document.getElementById('inputModal');
    const title = modal.querySelector('h2');
    const saveBtn = document.getElementById('saveTaskBtn');

    input.value = task.text;
    if (timeInput) timeInput.value = task.time || '';
    title.textContent = 'Editar tarea';
    input.dataset.editId = task.id;
    saveBtn.textContent = 'Actualizar';

    modal.style.display = 'flex';
    input.focus();
    input.select();
  },

  /**
   * Actualiza el contador de tareas
   */
  updateTaskCount() {
    const totalTasks = Storage.getTasks().length;
    const completedTasks = Storage.getTasks().filter(t => t.completed).length;
    const counter = document.getElementById('taskCounter');

    if (counter) {
      counter.textContent = `${completedTasks}/${totalTasks}`;
    }
  },

  /**
   * Actualiza la fecha actual en el header
   */
  updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = today.toLocaleDateString('es-ES', options);
      dateElement.textContent = dateStr;
    }
  },

  /**
   * Escapa caracteres especiales HTML
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
