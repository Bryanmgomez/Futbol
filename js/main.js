/* ============================================================
   MAIN — arranque de la aplicación.
   ============================================================ */
(function () {
  const G = (window.G = window.G || {});

  function init() {
    // Carga partida guardada si existe
    const st = G.load();
    if (st) G.state = st;
    G.ui.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();