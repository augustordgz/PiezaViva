/* theme.js
   Aplica el tema guardado (o la preferencia del sistema) apenas se
   parsea el <head>, antes de que se pinte la página, para evitar el
   "flash" del tema incorrecto. Por eso se carga sin defer/async y
   antes de las hojas de estilo. El cambio de tema en sí (el click del
   botón) vive en js/script.js. */
(function () {
  try {
    var saved = localStorage.getItem('pv-theme');
    var theme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
