/* ============================================================
   LEAGUE — fixture, tabla, simulación de partidos entre IA.
   ============================================================ */
(function () {
  const G = (window.G = window.G || {});

  /* ---------------- FIXTURE (liga de todos contra todos) ------------ */
  // Algoritmo del "círculo": genera (n-1) rondas de ida + vueltas.
  G.roundRobin = function (teams) {
    const list = teams.slice();
    if (list.length % 2 === 1) list.push(null);
    const n = list.length;
    const half = n / 2;
    const first = [];
    for (let r = 0; r < n - 1; r++) {
      const rd = [];
      for (let i = 0; i < half; i++) {
        const h = list[i];
        const a = list[n - 1 - i];
        rd.push([h, a]); // si a===null es descanso
      }
      first.push(rd);
      // rotar: list[0] fijo, resto gira a la izquierda
      const last = list[n - 1];
      for (let i = n - 1; i >= 2; i--) list[i] = list[i - 1];
      list[1] = last;
    }
    let ida = [];
    for (const rd of first) {
      ida = ida.concat(rd.filter((m) => m[0] !== null && m[1] !== null));
    }
    // vuelta: invertir local/visitante, después de toda la ida
    return ida.concat(ida.map((m) => [m[1], m[0]]));
  };

  // Construye los fixtures completos de una liga.
  // Returns: array de {round, home, away} (round empieza en 1)
  G.buildFixtures = function (leagueId, rounds) {
    const league = G.leagueIndex[leagueId];
    const teams = league.clubIds.slice();
    const matches = G.roundRobin(teams);
    const perRound = Math.floor(teams.length / 2);
    const totalRounds = Math.ceil(matches.length / perRound);
    const fixtures = [];
    for (let i = 0; i < matches.length; i++) {
      const r = 1 + Math.floor(i / perRound);
      const [home, away] = matches[i];
      if (home === null || away === null) continue;
      fixtures.push({
        round: r,
        home,
        away,
        played: false,
        gh: 0,
        ga: 0,
        scorers: [],
        mine: false,
      });
    }
    return { fixtures, perRound, totalRounds };
  };

  /* ---------------- TABLA ------------------------------------------- */
  G.newTable = function (leagueId) {
    const t = {};
    for (const id of G.leagueIndex[leagueId].clubIds) {
      t[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [] };
    }
    return t;
  };

  G.applyResultTable = function (table, homeId, awayId, gh, ga) {
    const h = table[homeId], a = table[awayId];
    h.p++; a.p++;
    h.gf += gh; h.ga += ga; a.gf += ga; a.ga += gh;
    h.gd = h.gf - h.ga; a.gd = a.gf - a.ga;
    if (gh > ga) { h.w++; a.l++; h.pts += 3; h.form.push("W"); a.form.push("L"); }
    else if (gh < ga) { a.w++; h.l++; a.pts += 3; h.form.push("W"); a.form.push("L"); }
    else { h.d++; a.d++; h.pts++; a.pts++; h.form.push("D"); a.form.push("D"); }
    for (const x of [h, a]) if (x.form.length > 5) x.form.shift();
  };

  // Devuelve la tabla ordenada.
  G.sortedTable = function (table) {
    const ids = Object.keys(table);
    ids.sort((x, y) => {
      const a = table[x], b = table[y];
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return x.localeCompare(y);
    });
    return ids.map((id) => Object.assign({ id }, table[id]));
  };

  /* ---------------- SIMULAR PARTIDO IA vs IA ------------------------ */
  // Fuerza del equipo a partir de la media general del club.
  G.teamStrength = function (club, opts) {
    opts = opts || {};
    let s = club.ovr;
    if (opts.home) s += G.config.MATCH.homeAdvantage;
    if (opts.difficulty) s += opts.difficulty;
    // pequeña variación por partido
    s += G.rndInt(-2, 2);
    return s;
  };

  G.expectedGoals = function (sa, sb) {
    const diff = sa - sb;
    return G.clamp(1.25 + diff * 0.11, 0.15, 3.8);
  };

  // Simula un partido completo (para IA). Devuelve {gh, ga}
  G.simMatchAI = function (sa, sb) {
    const ea = G.expectedGoals(sa, sb);
    const eb = G.expectedGoals(sb, sa);
    let gh = G.poisson(ea), ga = G.poisson(eb);
    // control del marcador 0-0: mínima variación
    if (gh + ga === 0 && Math.abs(sa - sb) > 8) {
      const winner = sa > sb ? 0 : 1;
      gh = winner === 0 ? G.rndInt(1, 3) : 0;
      ga = winner === 1 ? G.rndInt(0, 2) : 0;
    }
    return { gh, ga };
  };

  // Simula TODOS los partidos de una ronda del campeonato del jugador
  // menos el del jugador (que se resuelve aparte).
  G.simulateRound = function (career, round) {
    const season = career.season;
    const table = season.table;
    for (const fx of season.fixtures) {
      if (fx.round !== round || fx.played || fx.mine) continue;
      const hc = G.clubsIndex[fx.home];
      const ac = G.clubsIndex[fx.away];
      const sh = G.teamStrength(hc, { home: true });
      const sa = G.teamStrength(ac);
      const { gh, ga } = G.simMatchAI(sh, sa);
      fx.played = true; fx.gh = gh; fx.ga = ga;
      G.applyResultTable(table, fx.home, fx.away, gh, ga);
      if (G.config.GOLDEN_BOOT) G.attributeScorers(career, fx);
    }
  };

  /* ---------------- BOTA DE ORO (goleadores y asistencias) ---------- */
  // Plantilla determinista de cualquier club de la liga (para atribuir
  // autorías de gol a los jugadores simulados).
  G.squadFor = function (career, clubId) {
    const season = career.season;
    if (!season.clubSquads) season.clubSquads = {};
    const key = season.year + ":" + clubId;
    if (!season.clubSquads[key]) {
      const league = G.leagueIndex[career.leagueId];
      season.clubSquads[key] = G.generateSquad(G.clubsIndex[clubId], league, season.year);
    }
    return season.clubSquads[key];
  };

  // Elige un jugador ofensivo de la plantilla (probabilidad por posición).
  function pickScorer(squad) {
    const weighted = [];
    for (const p of squad) {
      const w = p.pos === "DEL" ? 6 : p.pos === "MED" ? 3 : p.pos === "DEF" ? 1 : 0;
      for (let i = 0; i < w; i++) weighted.push(p);
    }
    return weighted.length ? weighted[Math.floor(G.rnd() * weighted.length)] : squad[0];
  }

  function pickAssist(squad, avoid) {
    const others = squad.filter((p) => p !== avoid);
    const pool = others.length ? others : squad;
    return pool[Math.floor(G.rnd() * pool.length)];
  }

  G.tallyGolden = function (career, type, name, clubId, inc) {
    if (!career.season.golden) career.season.golden = { s: {}, a: {} };
    const t = career.season.golden[type];
    const key = name + "|" + clubId;
    if (!t[key]) t[key] = { name, clubId, val: 0 };
    t[key].val += (inc === undefined ? 1 : inc);
  };

  // Atribuye autores de gol/asistencia a un partido (para la Bota de Oro).
  // Los goles del jugador (registrados en fx.scorers) se cuentan aparte.
  G.attributeScorers = function (career, fx) {
    const playerGoals = ((fx.scorers && fx.scorers.length) || 0);
    let gh = fx.gh, ga = fx.ga;
    if (fx.home === career.clubId) gh = Math.max(0, gh - playerGoals);
    if (fx.away === career.clubId) ga = Math.max(0, ga - playerGoals);
    if (gh > 0) {
      const sq = G.squadFor(career, fx.home);
      for (let i = 0; i < gh; i++) {
        const s = pickScorer(sq);
        G.tallyGolden(career, "s", s.name, fx.home);
        G.tallyGolden(career, "a", pickAssist(sq, s).name, fx.home);
      }
    }
    if (ga > 0) {
      const sq = G.squadFor(career, fx.away);
      for (let i = 0; i < ga; i++) {
        const s = pickScorer(sq);
        G.tallyGolden(career, "s", s.name, fx.away);
        G.tallyGolden(career, "a", pickAssist(sq, s).name, fx.away);
      }
    }
    if (playerGoals > 0) G.tallyGolden(career, "s", career.player.name, career.clubId, playerGoals);
  };

  // Top N de goleadores (t) o asistentes (a) de la liga.
  G.goldenLeaders = function (career, type, n) {
    if (!career.season.golden) career.season.golden = { s: {}, a: {} };
    return Object.keys(career.season.golden[type])
      .map((k) => career.season.golden[type][k])
      .sort((x, y) => y.val - x.val)
      .slice(0, n || 5);
  };

  /* ---------------- POSICIONES FINALES ------------------------------ */
  G.finishSeasonTableInfo = function (career) {
    const table = G.sortedTable(career.season.table);
    const conf = G.confOfLeague(career.leagueId);
    const defs = G.cupDefsFor(conf);
    const spots = {
      champion: table[0] ? table[0].id : null,
      libertadores: [],      // retrocompatibilidad CONMEBOL
      sudamericana: [],
      cups: [],              // genérico por confederación {key,title,name,slots}
      relegated: [],
    };

    // reparte plazas de copa por confederación (el campeón ocupa la 1ª)
    let idx = 0;
    defs.forEach((d) => {
      const slots = [];
      while (idx < table.length && slots.length < d.spots) {
        if (idx === 0) { idx++; continue; } // campeón: plaza nº1 implícita
        slots.push(table[idx].id);
        idx++;
      }
      if (d.key === "libertadores") spots.libertadores = slots.slice();
      if (d.key === "sudamericana") spots.sudamericana = slots.slice();
      spots.cups.push({ key: d.key, title: d.title, name: d.name, slots });
    });

    const rel = G.config.RELEGATIONS;
    for (let i = table.length - 1; i >= 0 && spots.relegated.length < rel; i--) {
      spots.relegated.push(table[i].id);
    }
    spots.table = table;
    return spots;
  };
})();