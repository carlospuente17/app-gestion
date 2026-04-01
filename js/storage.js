/**
 * Módulo de almacenamiento (localStorage)
 * Maneja la persistencia de datos de tareas
 */

const Storage = {
  STORAGE_KEY: 'tasks_app_data',

  /**
   * Obtiene todas las tareas del localStorage
   * @returns {Array} Array de tareas
   */
  getTasks() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Guarda todas las tareas en localStorage
   * @param {Array} tasks - Array de tareas a guardar
   */
  saveTasks(tasks) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
  },

  /**
   * Agrega una nueva tarea
   * @param {string} text - Texto de la tarea
   * @param {string} type - Tipo: 'task' o 'note'
   * @param {string} time - Hora de la tarea (formato HH:MM)
   * @returns {Object} La tarea creada
   */
  addTask(text, type = 'task', time = '') {
    const tasks = this.getTasks();
    const newTask = {
      id: Date.now(),
      text: text,
      type: type,
      time: time,
      completed: false,
      date: new Date().toLocaleDateString('es-ES'),
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  /**
   * Actualiza una tarea existente
   * @param {number} id - ID de la tarea
   * @param {Object} updates - Objeto con los cambios
   * @returns {Object|null} La tarea actualizada o null si no existe
   */
  updateTask(id, updates) {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) return null;
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    this.saveTasks(tasks);
    return tasks[taskIndex];
  },

  /**
   * Elimina una tarea
   * @param {number} id - ID de la tarea a eliminar
   * @returns {boolean} true si se eliminó, false si no existía
   */
  deleteTask(id) {
    let tasks = this.getTasks();
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== id);
    
    if (tasks.length < initialLength) {
      this.saveTasks(tasks);
      return true;
    }
    return false;
  },

  /**
   * Obtiene una tarea por ID
   * @param {number} id - ID de la tarea
   * @returns {Object|null} La tarea o null
   */
  getTaskById(id) {
    const tasks = this.getTasks();
    return tasks.find(t => t.id === id) || null;
  },

  /**
   * Alterna el estado de completado de una tarea
   * @param {number} id - ID de la tarea
   * @returns {Object} La tarea actualizada
   */
  toggleTaskComplete(id) {
    const task = this.getTaskById(id);
    if (task) {
      task.completed = !task.completed;
      return this.updateTask(id, { completed: task.completed });
    }
    return null;
  }
};
