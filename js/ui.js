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
    this.updateCurrentDate();
  },



  /**
   * Adjunta event listeners a elementos
   */
  attachEventListeners() {
    // Navigation Tabs
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        navItems.forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const tab = e.currentTarget.dataset.tab;
        
        if (tab === 'dashboard') {
          document.getElementById('dashboardView').style.display = 'block';
          document.getElementById('tasksView').style.display = 'none';
          document.getElementById('addTaskBtn').style.display = 'none';
          this.renderDashboard();
        } else {
          document.getElementById('dashboardView').style.display = 'none';
          document.getElementById('tasksView').style.display = 'block';
          document.getElementById('addTaskBtn').style.display = 'flex';
          this.render();
        }
      });
    });

    // Botón de agregar tarea
    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showInputModal());
      addBtn.style.display = 'none'; // Hide by default on Dashboard
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

    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar todas las tareas completadas?')) {
          const tasks = Storage.getTasks();
          const pendingTasks = tasks.filter(t => !t.completed);
          Storage.saveTasks(pendingTasks);
          this.render();
        }
      });
    }

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
    const dateInput = document.getElementById('taskDate');
    const timeInput = document.getElementById('taskTime');
    const prioritySelect = document.getElementById('taskPriority');
    if (modal) {
      modal.style.display = 'flex';
      delete input.dataset.editId;
      document.querySelector('#inputModal h2').textContent = 'Nueva tarea';
      document.getElementById('saveTaskBtn').textContent = 'Crear';
      input.focus();
      input.value = '';
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      if (timeInput) timeInput.value = '';
      if (prioritySelect) prioritySelect.value = 'medium';
    }
  },

  /**
   * Cierra el modal de entrada
   */
  closeInputModal() {
    const modal = document.getElementById('inputModal');
    const input = document.getElementById('taskInput');
    const timeInput = document.getElementById('taskTime');
    const dateInput = document.getElementById('taskDate');
    const prioritySelect = document.getElementById('taskPriority');
    if (modal) {
      modal.style.display = 'none';
      delete input.dataset.editId;
      if (timeInput) timeInput.value = '';
      if (dateInput) dateInput.value = '';
      if (prioritySelect) prioritySelect.value = 'medium';
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
    const dateInput = document.getElementById('taskDate');
    const prioritySelect = document.getElementById('taskPriority');
    
    const text = input.value.trim();
    const time = timeInput ? timeInput.value : '';
    const date = dateInput ? dateInput.value : '';
    const priority = prioritySelect ? prioritySelect.value : 'medium';
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
      Storage.updateTask(parseInt(editId), { text: text, date: date, time: time, priority: priority });
    } else {
      Storage.addTask(text, date, time, priority);
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
    this.renderDashboard();
  },

  /**
   * Renderiza los datos del Dashboard
   */
  renderDashboard() {
    const allTasks = Storage.getTasks();
    const dashTotal = document.getElementById('dashTotal');
    const dashPending = document.getElementById('dashPending');
    const dashCompleted = document.getElementById('dashCompleted');
    const dashPercent = document.getElementById('dashPercent');
    const dashProgressCircle = document.getElementById('dashProgressCircle');
    const dashUrgentTasks = document.getElementById('dashUrgentTasks');

    if (!dashTotal) return;

    const completedTasks = allTasks.filter(t => t.completed);
    const pendingTasks = allTasks.filter(t => !t.completed);
    const total = allTasks.length;

    // Actualizar Contadores
    dashTotal.textContent = total;
    dashPending.textContent = pendingTasks.length;
    dashCompleted.textContent = completedTasks.length;

    // Actualizar Porcentaje y Gráfico
    const percent = total === 0 ? 0 : Math.round((completedTasks.length / total) * 100);
    dashPercent.textContent = `${percent}%`;
    dashProgressCircle.style.background = `conic-gradient(var(--success) ${percent}%, rgba(0,0,0,0.1) 0)`;

    // Renderizar Tareas Urgentes (Prioridad Alta no completadas)
    const urgentTasks = pendingTasks
      .filter(t => t.priority === 'high')
      .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
      .slice(0, 3); // Mostrar máximo 3 urgentes

    if (urgentTasks.length === 0) {
      dashUrgentTasks.innerHTML = `
        <div style="text-align: center; color: var(--text-secondary); padding: 15px; background: rgba(255,255,255,0.5); border-radius: 12px; border: 1px dashed rgba(0,0,0,0.1);">
          ✅ ¡No tienes tareas de alto riesgo pendientes!
        </div>
      `;
    } else {
      dashUrgentTasks.innerHTML = urgentTasks.map(task => this.createTaskElement(task)).join('');
      // Attach listeners for these urgent tasks too
      this.attachTaskEventListeners(dashUrgentTasks);
    }
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
      .sort((a, b) => {
        // Sort by date first (ascending)
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        // Then by priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const pA = priorityOrder[a.priority || 'medium'];
        const pB = priorityOrder[b.priority || 'medium'];
        if (pA !== pB) return pB - pA;
        
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .map(task => this.createTaskElement(task))
      .join('');

    // Adjuntar event listeners a las tareas
    this.attachTaskEventListeners(container);
  },

  /**
   * Crea el HTML de una tarea
   * @param {Object} task - La tarea
   * @returns {string} HTML de la tarea
   */
  createTaskElement(task) {
    const timeDisplay = task.time ? ` • ${task.time}` : '';
    
    let priorityIcon = '';
    if (task.priority === 'high') priorityIcon = '<span class="priority-icon" style="color: var(--danger); margin-right: 4px;">🔴</span>';
    else if (task.priority === 'low') priorityIcon = '<span class="priority-icon" style="color: var(--success); margin-right: 4px;">🟡</span>';
    else priorityIcon = '<span class="priority-icon" style="color: var(--primary); margin-right: 4px;">🟠</span>';

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
            <p class="task-text">${priorityIcon}${this.escapeHtml(task.text)}</p>
            <span class="task-date">${task.date}${timeDisplay}</span>
          </div>
        </div>
        <div class="task-buttons">
          <button class="task-btn btn-edit" data-action="edit" data-id="${task.id}" title="Editar">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
          <button class="task-btn btn-delete" data-action="delete" data-id="${task.id}" title="Eliminar">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Adjunta event listeners a las tareas
   */
  attachTaskEventListeners(container = document) {
    const toggles = container.querySelectorAll('[data-action="toggle"]');
    toggles.forEach(btn => {
      // Remover listener viejo por si acaso
      btn.replaceWith(btn.cloneNode(true));
    });
    
    container.querySelectorAll('[data-action="toggle"]').forEach(btn => {
      btn.addEventListener('change', (e) => {
        Storage.toggleTaskComplete(parseInt(e.target.dataset.id));
        this.render();
      });
    });

    const deletes = container.querySelectorAll('[data-action="delete"]');
    deletes.forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    container.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = parseInt(e.currentTarget.dataset.id);
        if (confirm('¿Eliminar esta tarea?')) {
          Storage.deleteTask(taskId);
          this.render();
        }
      });
    });

    const edits = container.querySelectorAll('[data-action="edit"]');
    edits.forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    container.querySelectorAll('[data-action="edit"]').forEach(btn => {
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
    const dateInput = document.getElementById('taskDate');
    const prioritySelect = document.getElementById('taskPriority');
    const modal = document.getElementById('inputModal');
    const title = modal.querySelector('h2');
    const saveBtn = document.getElementById('saveTaskBtn');

    input.value = task.text;
    if (timeInput) timeInput.value = task.time || '';
    if (dateInput) dateInput.value = task.date || '';
    if (prioritySelect) prioritySelect.value = task.priority || 'medium';
    
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
