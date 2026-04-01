/**
 * Aplicación principal de gestión de tareas
 * Coordina almacenamiento, UI y service worker
 */

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar fecha actual
  UI.updateCurrentDate();

  // Inicializar la UI
  UI.init();

  // Registrar el service worker para funcionamiento offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado correctamente:', registration);
      })
      .catch(error => {
        console.warn('Fallo al registrar Service Worker:', error);
      });
  }

  // Manejar cambios de visibilidad (cuando se vuelve a la app)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Recargar UI cuando se vuelve a foco
      UI.render();
    }
  });
});

/**
 * Función para limpiar datos locales (uso en desarrollo)
 * Descomentar cuando necesites resetear la app
 */
// function clearAllData() {
//   localStorage.clear();
//   alert('Datos limpiados. Recarga la página.');
// }
