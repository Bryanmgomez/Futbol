/* ============================================================
   CORE — utilidades, números aleatorios, guardado y partida.
   ============================================================ */
(function () {
  const G = (window.G = window.G || {});

  /* ---------------- Utilidades básicas ---------------- */
  G.rnd = Math.random;
  G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  G.rndInt = (min, max) => Math.floor(G.rnd() * (max - min + 1)) + min;
  G.pick = (arr) => arr[Math.floor(G.rnd() * arr.length)];
  G.shuffle = (arr) => {
    let a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(G.rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // Probabilidad: chance(0.3) → true el 30% de las veces.
  G.chance = (p) => G.rnd() < p;
  // Número con distribucion de Poisson (uso para ocasiones/goles).
  G.poisson = (lambda) => {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do {
      k++;
      p *= G.rnd();
    } while (p > L);
    return k - 1;
  };
  // Función de probabilidad logística → mapea diferencias a [0,1].
  G.logit = (x) => 1 / (1 + Math.exp(-x));

  // Generador de nombres aleatorios por país (usa rng determinista si se pasa).
  G.generateName = function (code, rng) {
    const R = rng || G.rnd;
    const pool = G.namePools[code] || G.namePools.ot;
    const pickN = (arr) => arr[Math.floor(R() * arr.length)];
    return (pickN(pool.first) + " " + pickN(pool.last)).trim();
  };

  // RNG determinista (para regenerar plantillas de forma estable).
  G.mulberry32 = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Hash simple de cadena (para seeds deterministas).
  G.hashString = function (str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  // Formato de números: 1200000 → 1,2M · 850000 → 850K
  G.fmtMoney = function (n) {
    n = Math.round(n);
    if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(".0", "") + "B";
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return String(n);
  };

  G.fmt = (n) => n.toLocaleString("es-ES");

  /* ---------------- Estado de partida y guardado ---------------- */
  const SAVE_KEY = "sudamerica_carrera_save_v1";

  G.newState = function () {
    return {
      version: G.config.VERSION,
      meta: null,      // configuración de tu jugador al inicio
      player: null,    // objeto del jugador (atributos, media, etc.)
      clubId: null,
      leagueId: null,
      contract: null,
      clubHistory: [],
      season: null,
      career: null,
      intl: null,
      pending: null,   // pantallas pendientes (ofertas, fin de temporada)
      createdAt: Date.now(),
    };
  };

  G.save = function () {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(G.state));
    } catch (e) {
      alert("No se pudo guardar la partida: " + e.message);
    }
  };

  G.load = function () {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const st = JSON.parse(raw);
      if (!st || !st.meta) return null;
      return st;
    } catch (e) {
      return null;
    }
  };

  G.clearSave = function () {
    localStorage.removeItem(SAVE_KEY);
  };

  G.exportSave = function () {
    try {
      const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(G.state))));
      const blob = new Blob([b64], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mi-carrera-sudamerica.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    } catch (e) {
      alert("Error al exportar: " + e.message);
    }
  };

  G.importSave = function (file) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const text = ev.target.result;
        const json = decodeURIComponent(escape(atob(text.replace(/\s/g, ""))));
        const st = JSON.parse(json);
        if (!st || !st.meta) throw new Error("Archivo no válido");
        G.state = st;
        G.save();
        G.bootToGame();
      } catch (e) {
        alert("Archivo de partida no válido: " + e.message);
      }
    };
    reader.readAsText(file);
  };

  /* ---------------- Media global (OVR) ---------------- */
  G.ovr = function (attrs, pos) {
    const w = G.config.OVR_WEIGHTS[pos] || G.config.OVR_WEIGHTS.MED;
    let num = 0, den = 0;
    for (const k in w) {
      if (!w[k]) continue;
      num += (attrs[k] || 0) * w[k];
      den += w[k];
    }
    return den ? Math.round(num / den) : 50;
  };

  G.posLabel = (key) => {
    const p = G.config.POSITIONS.find((x) => x.key === key);
    return p ? p.name : key;
  };

  G.posIcon = (key) => {
    const p = G.config.POSITIONS.find((x) => x.key === key);
    return p ? p.icon : "⚽";
  };
})();