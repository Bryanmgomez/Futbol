/* ============================================================
   PLAYER — creación del jugador, plantillas generadas, XI ideal.
   ============================================================ */
(function () {
  const G = (window.G = window.G || {});

  const CFG = () => G.config;

  /*  Atributos por defecto según posición (el usuario reparte puntos
      sobre esta base). */
  G.baseAttrsFor = function (pos) {
    const b = {
      rit: 50, tir: 45, pas: 50, reg: 45, def: 45, fis: 50, por: 20,
    };
    if (pos === "POR") { b.por = 55; b.tir = 25; b.reg = 30; b.pas = 45; }
    if (pos === "DEF") { b.def = 55; b.rit = 45; b.fis = 52; }
    if (pos === "MED") { b.pas = 55; b.reg = 50; b.def = 45; }
    if (pos === "DEL") { b.tir = 55; b.reg = 50; b.rit = 50; }
    return b;
  };

  /*  Crea el objeto real del jugador el usuario (a partir del meta). */
  G.buildPlayer = function (meta, attrs) {
    const a = {};
    for (const ac of CFG().ATTRIBUTES) a[ac.key] = attrs[ac.key] || 50;
    const player = {
      name: meta.name,
      nr: meta.nr,
      pos: meta.pos,
      country: meta.country,
      code: meta.code,
      bornYear: meta.bornYear,
      age: meta.age,
      attrs: a,
      pot: meta.pot,
    };
    player.ovr = G.ovr(a, meta.pos);
    player.marketValue = G.marketValue(player);
    return player;
  };

  G.makeMeta = function (name, pos, code, age, pot, nr) {
    const pool = G.namePools,
      _ = G.rndInt(1955, 2005);
    return {
      name: name || G.generateName(code),
      pos: pos || "MED",
      code: code || "ot",
      country: G.leagues.find((l) => l.code === code)
        ? G.leagues.find((l) => l.code === code).country
        : "Otra",
      bornYear: new Date().getFullYear() - age,
      age,
      pot, // potencial: 1⭐..5⭐ armado fuera
      nr,
    };
  };

  /* ---------------- PLANTILLAS (generación determinista) ------------ */

  /*  Genera la plantilla generica de un club. El "seed" de temporada
      permite que las plantillas envejezcan y cambien ligeramente cada año.
      Returns: array de 19 jugadores {id, name, pos, ovr, attrs, number, age} */
  G.generateSquad = function (club, league, seasonSeed) {
    const rng = G.mulberry32(G.hashString(club.id + ":" + league.id + ":" + seasonSeed));
    const squad = [];
    const pickN = (rr, arr) => arr[Math.floor(rr() * arr.length)];
    const counts = CFG().SQUAD_COUNTS;
    let n = 0;
    for (const pos of ["POR", "DEF", "MED", "DEL"]) {
      for (let i = 0; i < counts[pos]; i++) {
        const baseOvr = club.ovr + Math.round((rng() * 14) - 7); // -7..+7
        const age = 18 + Math.floor(rng() * 7); // 18-24
        const attrs = G.attrsFromOvr(pos, baseOvr, rng);
        const ovr = G.ovr(attrs, pos);
        n++;
        squad.push({
          id: club.id + "-p" + n,
          name: G.generateName(league?.code || "ot", rng),
          pos,
          ovr,
          age,
          number: 1 + Math.floor(rng() * 30),
          attrs,
          trained: false,
          pot: ovr + Math.round(rng() * 5 + 1),
        });
      }
    }
    return squad;
  };

  /*  Atributos plausibles para una media deseada (para NPCs). */
  G.attrsFromOvr = function (pos, target, rng) {
    rng = rng || G.rnd;
    const b = G.baseAttrsFor(pos);
    const w = CFG().OVR_WEIGHTS[pos];
    const a = {};
    // distribución inicial alrededor del objetivo
    for (const ac of CFG().ATTRIBUTES) {
      const spread = 22;
      let v = target + Math.round((rng() - 0.5) * spread);
      // Portero: por más cerca del objetivo
      if (pos === "POR" && ac.key === "por") v = target + Math.round((rng() - 0.5) * 6);
      // Delantero: tiro cerca del objetivo
      if (pos === "DEL" && ac.key === "tir") v = target + Math.round((rng() - 0.5) * 6);
      a[ac.key] = G.clamp(Math.round(v), 20, 99);
    }
    // ajustar media:
    let ovr = G.ovr(a, pos);
    const diff = target - ovr;
    let guard = 0;
    while (Math.abs(diff) > 1 && guard++ < 60) {
      const main = w && Object.keys(w).length
        ? Object.keys(w).reduce((x, y) => (w[y] > (w[x] || 0) ? y : x))
        : "pas";
      a[main] = G.clamp(a[main] + Math.sign(diff) * 2, 20, 99);
      ovr = G.ovr(a, pos);
    }
    return a;
  };

  /*  Mejor once (11 titulares) de una plantilla: [POR, 4 DEF, 3 MED, 3 DEL]. */
  G.bestXI = function (squad) {
    const byPos = {};
    for (const p of CFG().POSITIONS) byPos[p.key] = squad
      .filter((s) => s.pos === p.key)
      .sort((a, b) => b.ovr - a.ovr);
    const line = CFG().FORMATION.line;
    const xi = [];
    const used = {};
    for (let i = 0; i < line.length; i++) {
      const pos = line[i];
      const list = byPos[pos];
      let sel = null;
      for (const p of list) {
        if (!used[p.id]) { sel = p; break; }
      }
      if (!sel) sel = list[0];
      if (sel) { used[sel.id] = true; xi.push(sel); }
    }
    return xi;
  };

  /*  ¿Sale de titular o de banquillo? Comparando con el mejor jugador
      de su posicion en el XI. */
  G.starterStatus = function (squad, player) {
    const xi = G.bestXI(squad);
    const rival = xi
      .filter((p) => p.pos === player.pos)
      .sort((a, b) => b.ovr - a.ovr)[0];
    if (!rival) return { status: "starter", rival: null };
    if (player.ovr >= rival.ovr - 1) return { status: "starter", rival };
    return { status: "bench", rival };
  };

  /* ---------------- EDAD Y EVOLUCIÓN ------------------------------- */
  // La media sube/baja por temporada según edad y potencial.
  G.ageGrowth = function (player) {
    const age = player.age;
    const potDiff = player.pot - player.ovr;
    if (age < CFG().AGE_PEAK) {
      // mientras más potencial sin explotar, más crece
      return Math.min(4, Math.max(-1, Math.round(potDiff / 3)));
    }
    if (age >= CFG().AGE_DECLINE_START) {
      return -CFG().AGE_DECLINE_AMOUNT - (age >= 34 ? 1 : 0);
    }
    return 0;
  };

  G.applyGrowth = function (player) {
    const growth = G.ageGrowth(player);
    player.ovr = G.clamp(player.ovr + growth, 35, 99);
    player.age += 1;
    player.marketValue = G.marketValue(player);
    return growth;
  };

  /* ---------------- VALOR DE MERCADO ------------------------------- */
  G.marketValue = function (player) {
    const M = CFG().MARKET_VALUE;
    const ageFactor = player.age <= 25 ? M.ageFactor : player.age <= 28 ? 1 : 0.65;
    let v = player.ovr * M.perOvr * ageFactor + player.ovr * M.starBonus;
    return Math.round(v / 50000) * 50000;
  };
})();