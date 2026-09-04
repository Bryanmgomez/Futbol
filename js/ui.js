/* ============================================================
   UI — pantallas, menús y motor de partido en vivo.
   ============================================================ */
(function () {
  const G = (window.G = window.G || {});
  const U = (G.ui = {});

  U.esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  let toastTimer = null;
  U.toast = function (msg, ms) {
    const t = document.getElementById("toast");
    const tx = document.getElementById("toast-text");
    tx.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), ms || 2200);
  };

  const SCREENS = ["menu", "new", "league", "club", "hub", "standings", "squad", "stats", "contract", "intl", "training", "fame", "rumors", "season", "market", "settings"];

  U.show = function (id) {
    SCREENS.forEach((s) => {
      const el = document.getElementById("scr-" + s);
      if (el) el.classList.toggle("active", s === id);
    });
    window.scrollTo(0, 0);
  };

  const $ = (el) => document.getElementById(el);

  /* =========================================================
     MENÚ PRINCIPAL
     ========================================================= */
  U.menu = function () {
    const save = G.load();
    let cont = save
      ? '<button class="btn gold" onclick="G.ui.bootGame()">▶ Continuar carrera de ' +
        U.esc(save.meta.name) + "</button>"
      : '<button class="btn" disabled title="Aún no hay partida guardada">▶ Continuar</button>';
    const confCount = G.config.CONF ? Object.keys(G.config.CONF).length : 1;
    $("scr-menu").innerHTML =
      '<div class="hero">' +
      '<span class="ball">⚽</span>' +
      "<h1>Fútbol Sudamérica</h1>" +
      '<div class="sub">⚡ Modo Carrera del Jugador · ' + G.leagues.length + " Ligas · " + confCount + " continentes</div>" +
      '<div class="muted small">🇦🇷 🇧🇷 🇨🇴 🇨🇱 🇵🇪 🇺🇾 🇪🇨 🇵🇾 🇧🇴 🇻🇪 🇪🇸 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇮🇹 🇩🇪 🇫🇷 🇵🇹 🇳🇱 🇲🇽 🇺🇸</div>' +
      "</div>" +
      '<div class="menu-btns">' +
      '<button class="btn gold" onclick="G.ui.newCareer()">⚽ Nueva Carrera</button>' +
      cont +
      '<button class="btn ghost" onclick="G.ui.settings()">⚙️ Configuración</button>' +
      "</div>" +
      '<div class="foot">Datos 100 % actualizables en <b>js/data/</b> (clubes, ligas, nombres, reglas).<br>' +
      'Revisa el <b>README.md</b> incluido para editar todo el juego.</div>';
    U.show("menu");
  };
  // typos del menú corregidos arriba

  /* =========================================================
     CREAR JUGADOR
     ========================================================= */
  G.create = G.create || {};
  U.newCareer = function () {
    const c = G.create;
    c.pos = c.pos || "MED";
    c.code = c.code || "ar";
    c.age = c.age || 18;
    c.stars = c.stars || 3;
    c.nr = c.nr || 10;
    c.name = c.name || "";
    c.attrs = G.baseAttrsFor(c.pos);
    c.pool = G.config.NEW_PLAYER.pointPool;
    U.renderNew();
  };

  U.renderNew = function () {
    const c = G.create;
    const cfg = G.config.NEW_PLAYER;
    const posCards = G.config.POSITIONS.map(
      (p) =>
        '<div class="pos-card ' + (c.pos === p.key ? "sel" : "") + '" onclick="G.ui.setPos(\'' + p.key + '\')">' +
        '<span class="ic">' + p.icon + "</span><b>" + p.name + "</b>" +
        "</div>"
    ).join("");

    let attrRows = "";
    G.config.ATTRIBUTES.forEach((a) => {
      attrRows +=
        '<div class="attr-row">' +
        '<button class="attr-ctl" onclick="G.ui.attrMinus(\'' + a.key + '\')" data-k="' + a.key + '" disabled>−</button>' +
        '<div class="name">' + a.icon + " " + a.name + "</div>" +
        '<div class="val" data-v="' + a.key + '">' + c.attrs[a.key] + "</div>" +
        '<button class="attr-ctl" onclick="G.ui.attrPlus(\'' + a.key + '\')">+</button>' +
        "</div>";
    });

    const ovr = G.ovr(c.attrs, c.pos);

    const nats = G.leagues
      .map((l) => '<option value="' + l.code + '"' + (c.code === l.code ? " selected" : "") + ">" + l.flag + " " + l.country + "</option>")
      .join("") + '<option value="ot"' + (c.code === "ot" ? " selected" : "") + ">🌎 Otra</option>";

    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      starsHtml += '<span class="stars" onclick="G.ui.setStars(' + i + ')">' +
        (i <= c.stars ? '<span class="on">★</span>' : "★") + "</span>";
    }

    $("scr-new").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.menu()">← Menú</span></div>' +
      "<h2 style=\"margin:10px 0 4px\">👤 Crea tu jugador</h2>" +
      '<div class="muted small" style="margin-bottom:16px">Solo quedan ' + (c.pool) + ' puntos para repartir.</div>' +
      '<div class="grid" style="grid-template-columns:1fr">' +
      '<div class="grid cols2">' +
      '<div><label>Nombre completo</label>' +
      '<div class="row" style="margin-top:6px"><input type="text" id="in-name" value="' + U.esc(c.name || "") + '" placeholder="Ej: Lionel Messi" style="flex:1">' +
      '<button class="btn ghost small" onclick="G.ui.randomName()">🎲</button></div></div>' +
      "<div><label>Nacionalidad</label>" +
      '<select onchange="G.ui.setCode(this.value)" style="margin-top:6px">' + nats + "</select></div>" +
      "<div><label>Edad: <span id='age-txt'>" + c.age + "</span></label>" +
      '<input type="range" min="' + cfg.minAge + '" max="' + cfg.maxAge + '" value="' + c.age +
      '" oninput="G.ui.setAge(this.value)" style="margin-top:6px"></div>' +
      "<div><label>Dorsal</label>" +
      '<input type="number" min="1" max="99" value="' + c.nr + '" onchange="G.ui.setNr(this.value)" style="margin-top:6px"></div>' +
      "</div>" +
      "<div class=\"divider\"></div>" +
      "<label>Posición</label><div class=\"pos-cards\" style=\"margin-top:6px\">" + posCards + "</div>" +
      '<div class="row spread" style="margin-top:8px">' +
      '<div class="chip" style="font-size:.95rem">🧤 Media global: <b style="color:var(--gold)">&nbsp;' + ovr + "</b></div>" +
      '<div class="chip">🌠 Talento: ' + starsHtml + "</div>" +
      "</div>" +
      '<div class="pool-chip" id="pool-chip" style="margin-top:10px">Puntos restantes: ' + c.pool + "</div>" +
      '<div class="grid" style="margin-top:10px">' + attrRows + "</div>" +
      '<button class="btn ghost small" onclick="G.ui.randomAttrs()" style="margin-top:10px">🎲 Repartir al azar</button>' +
      "</div>" +
      '<div class="row" style="margin-top:22px">' +
      '<button class="btn gold" style="flex:1;padding:15px" onclick="G.ui.confirmNew()">Elegir liga →</button>' +
      "</div>";

    U.show("new");
    U._syncAttrBtns();
  };

  U._syncAttrBtns = function () {
    const c = G.create;
    const base = G.baseAttrsFor(c.pos);
    const pool = c.pool;
    G.config.ATTRIBUTES.forEach((a) => {
      const plus = document.querySelector('[onclick="G.ui.attrPlus(\'' + a.key + '\')"]');
      const minus = document.querySelector('[onclick="G.ui.attrMinus(\'' + a.key + '\')"]');
      if (plus) plus.disabled = pool <= 0 || c.attrs[a.key] >= G.config.NEW_PLAYER.maxAttr;
      if (minus) minus.disabled = c.attrs[a.key] <= base[a.key];
    });
    const chip = $("pool-chip");
    if (chip) chip.innerHTML = "Puntos restantes: " + pool;
    const v = document.querySelector('.val[data-v="' + "rit" + '"]');
    if (v) {
      // actualizar media global mostrada
      const ovr = G.ovr(c.attrs, c.pos);
      const el = document.querySelector('.row.spread .chip b');
      if (el) el.textContent = ovr;
    }
  };

  U.attrPlus = function (k) {
    const c = G.create;
    if (c.pool <= 0 || c.attrs[k] >= G.config.NEW_PLAYER.maxAttr) return;
    c.attrs[k]++; c.pool--;
    U._reapplyNew();
  };
  U.attrMinus = function (k) {
    const c = G.create;
    if (c.attrs[k] <= G.baseAttrsFor(c.pos)[k]) return;
    c.attrs[k]--; c.pool++;
    U._reapplyNew();
  };

  U._reapplyNew = function () {
    // actualiza valores DOM sin reconstruir todo (más agradable)
    const c = G.create;
    G.config.ATTRIBUTES.forEach((a) => {
      const v = document.querySelector('.val[data-v="' + a.key + '"]');
      if (v) v.textContent = c.attrs[a.key];
    });
    U._syncAttrBtns();
    // re-sync media
    const el = document.querySelector(".row.spread .chip b");
    if (el) el.textContent = G.ovr(c.attrs, c.pos);
  };

  U.setPos = function (pos) {
    G.create.pos = pos;
    G.create.attrs = G.baseAttrsFor(pos);
    G.create.pool = G.config.NEW_PLAYER.pointPool;
    U.renderNew();
  };
  U.setCode = function (code) { G.create.code = code; G.create.attrs = G.baseAttrsFor(G.create.pos); G.create.pool = G.config.NEW_PLAYER.pointPool; U.renderNew(); };
  U.setAge = function (v) {
    G.create.age = +v;
    const t = $("age-txt");
    if (t) t.textContent = G.create.age;
  };
  U.setNr = function (v) { G.create.nr = G.clamp(+v || 10, 1, 99); };
  U.setStars = function (n) { G.create.stars = n; U.renderNew(); };
  U.randomName = function () {
    const inp = $("in-name");
    const nm = G.generateName(G.create.code);
    G.create.name = nm;
    if (inp) inp.value = nm;
  };
  U.randomAttrs = function () {
    const c = G.create;
    c.attrs = G.baseAttrsFor(c.pos);
    c.pool = G.config.NEW_PLAYER.pointPool;
    const max = G.config.NEW_PLAYER.maxAttr;
    // reparte puntos al azar
    let guard = 0;
    while (c.pool > 0 && guard++ < 5000) {
      const k = G.pick(G.config.ATTRIBUTES).key;
      if (c.attrs[k] < max) { c.attrs[k]++; c.pool--; }
    }
    U.renderNew();
  };

  U.confirmNew = function () {
    const c = G.create;
    const inp = $("in-name");
    c.name = (inp && inp.value.trim()) || c.name;
    if (!c.name) { U.toast("Escribe el nombre de tu jugador"); return; }
    const meta = G.makeMeta(c.name, c.pos, c.code, c.age, c.stars, c.nr);
    // potencial = media actual + 6 puntos por estrella (techo)
    meta.potNumber = G.clamp(G.ovr(c.attrs, c.pos) + c.stars * 6, 60, 96);
    c.meta = meta;
    c.player = G.buildPlayer(meta, c.attrs);
    U.league();
  };

  /* =========================================================
     ELEGIR LIGA
     ========================================================= */
  U.league = function () {
    const cards = G.leagues.map((lg) => {
      const avg = Math.round(lg.clubs.reduce((s, c) => s + c.ovr, 0) / lg.clubs.length);
      const conf = lg.conf || "CONMEBOL";
      return '<div class="pick-card" onclick="G.ui.chooseLeague(\'' + lg.id + '\')">' +
        '<div class="row spread">' +
        '<span class="flag">' + lg.flag + "</span>" +
        '<span class="chip">' + G.confLabel(conf) + "</span>" +
        "</div>" +
        "<h3 style=\"margin-top:8px\">" + U.esc(lg.name) + "</h3>" +
        '<div class="muted small">' + lg.country + " · " + lg.clubs.length + " equipos · Media " + avg + "</div>" +
        "</div>";
    }).join("");

    $("scr-league").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.newCareer()">← Atrás</span></div>' +
      "<h2 style=\"margin:10px 0 16px\">🏆 Elige tu liga</h2>" +
      '<div class="pick-grid">' + cards + "</div>" +
      '<div class="muted small" style="margin-top:14px">¿No está tu liga? Añádela en <code>js/data/leagues.js</code>.</div>';
    U.show("league");
  };

  U.chooseLeague = function (id) {
    G.create.leagueId = id;
    U.club();
  };

  /* =========================================================
     ELEGIR CLUB
     ========================================================= */
  U.club = function () {
    const lg = G.leagueIndex[G.create.leagueId];
    const player = G.create.player;
    const cards = lg.clubs.slice().sort((a, b) => b.ovr - a.ovr).map((club) => {
      return '<div class="pick-card win" onclick="G.ui.chooseClub(\'' + club.id + '\')">' +
        '<div class="row">' +
        '<div class="crest" style="background:' + club.color + '">' + (club.short ? club.short.slice(0, 3) : "FC") + "</div>" +
        '<div style="flex:1">' +
        "<b>" + U.esc(club.name) + "</b>" +
        '<div class="muted small">🏟️ ' + U.esc(club.stadium) + " · " + U.esc(club.city) + "</div>" +
        '<div class="muted small">🏆 ' + club.titles + " campeonatos</div>" +
        '<div class="ovr-bar"><i style="width:' + (club.ovr - 50) * 2.4 + '%"></i></div>' +
        "</div>" +
        '<div class="chip" style="font-size:1rem">' + club.ovr + "</div>" +
        "</div>" +
        "</div>";
    }).join("");

    const yearsOpts = G.config.CONTRACT_YEARS.map((y) => '<option value="' + y + '">' + y + " años</option>").join("");
    const diffOpts = Object.keys(G.config.DIFFICULTY).map((k) =>
      '<option value="' + k + '"' + (G.config.defaultDifficulty === k ? " selected" : "") + ">" + G.config.DIFFICULTY[k].name + "</option>"
    ).join("");

    $("scr-club").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.league()">← Ligas</span></div>' +
      "<h2 style=\"margin:10px 0 4px\">" + lg.flag + " " + lg.country + "</h2>" +
      '<div class="muted small" style="margin-bottom:14px">' + lg.name + " · elige tu club. Ordenados por fuerza.</div>" +
      '<div class="pick-grid">' + cards + "</div>" +
      '<div class="card" style="margin-top:16px">' +
      '<div class="row spread">' +
      '<div style="flex:1">' +
      "<label>Años de contrato</label>" +
      '<select id="years-sel" style="margin-top:6px">' + yearsOpts + "</select>" +
      "</div>" +
      '<div style="flex:1">' +
      "<label>Dificultad</label>" +
      '<select id="diff-sel" style="margin-top:6px">' + diffOpts + "</select>" +
      "</div>" +
      "</div>" +
      '<div class="muted small" style="margin-top:10px">💵 El sueldo se acuerda según tu media global. Cuando elijas club verás tu oferta antes de firmar.</div>' +
      "</div>";
    U.show("club");
  };

  U.chooseClub = function (clubId) {
    G.create.clubId = clubId;
    const club = G.clubsIndex[clubId];
    const player = G.create.player;
    const league = G.leagueIndex[G.create.leagueId];
    const salary = G.salaryFor(club, player);
    const years = +(document.getElementById("years-sel") ? document.getElementById("years-sel").value : G.config.defaultContractYears);
    const diff = document.getElementById("diff-sel") ? document.getElementById("diff-sel").value : G.config.defaultDifficulty;

    // contrato: pregunta confirmación
    if (confirm(
      club.name +
      "\n\nSueldo: $" + G.fmt(salary) + " / año\nContrato: " + years + " años\nDificultad: " + G.config.DIFFICULTY[diff].name +
      "\n\nTu media: " + player.ovr + " · Posición: " + G.posLabel(player.pos) +
      "\n\n¿Firmar y comenzar la carrera?"
    )) {
      const meta = G.create.meta;
      G.startCareer(meta, G.create.player, G.create.leagueId, clubId, diff, years);
      G.ui.bootToGame();
    }
  };

  /* =========================================================
     HUB (centro de carrera)
     ========================================================= */
  U.bootToGame = function () {
    G.state = G.load();
    U.hub();
  };
  G.bootToGame = U.bootToGame;

  U.bootGame = function () {
    G.state = G.load();
    if (G.state) U.hub();
    else U.menu();
  };

  U.hub = function () {
    const st = G.state;
    G.ensureSeasonExtras(st);
    const club = G.clubsIndex[st.clubId];
    const league = G.leagueIndex[st.leagueId];
    const player = st.player;
    const season = st.season;
    const ev = G.currentEvent(st);
    const ms = season.myStats;

    const statChips =
      '<div class="stat-chips">' +
      U._chip(ms.apps, "Partidos") +
      U._chip(ms.goals, "Goles") +
      U._chip(ms.assists, "Asistencias") +
      U._chip(ms.saves, "Paradas") +
      U._chip(ms.sumRatings ? (ms.sumRatings / ms.nRatings).toFixed(1) : "—", "Nota media") +
      "</div>";

    const myPosNow = G.sortedTable(season.table).findIndex((r) => r.id === st.clubId) + 1;
    const ex = G.checkExpectations(st, myPosNow);
    const exRow = (label, met) =>
      '<div class="row" style="margin:4px 0"><span style="flex:1" class="muted small">' + label + "</span>" +
      '<b style="color:' + (met ? "var(--green)" : "var(--muted)") + '">' + (met ? "✓" : "·") + "</b></div>";
    const exCard = ex
      ? '<div class="card" style="margin-top:14px">' +
        '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">🎯 Objetivos del club</div>' +
        exRow("🏁 Terminar entre los " + ex.minPos + " primeros", ex.metPos) +
        exRow("⚽ Marcar al menos " + ex.goals + " goles", ex.metGoals) +
        exRow("🎳 " + ex.assists + " asistencias", ex.metAssists) +
        '<div class="muted small" style="margin-top:6px">' + (ex.allMet ? '<b style="color:var(--green)">¡Todo cumplido! Mejor renovación 🎉</b>' : "Cumplirlos mejora tu renovación y tu fama.") + "</div>" +
        "</div>"
      : "";

    const next = U._nextBlock(st, ev);

    $("scr-hub").innerHTML =
      '<div class="topbar">' +
      '<div class="crest big" style="background:' + club.color + '">' + (club.short || "FC").slice(0, 3) + "</div>" +
      '<div class="info"><h2>' + U.esc(club.name) + "</h2>" +
      '<div class="muted small">' + league.flag + " " + league.name + " · Temporada " + season.year +
      (ev.type === "round" ? " · Jornada " + ev.round + "/" + season.totalRounds : "") + "</div></div>" +
      '<div class="row">' +
      '<button class="btn ghost small" onclick="G.ui.settings()">⚙️</button>' +
      '<button class="btn ghost small" onclick="G.ui.seasonEndScreen()">🏁</button>' +
      "</div>" +
      "</div>" +

      '<div class="grid cols2" style="grid-template-columns:2fr 1.2fr">' +
      '<div class="card next-block">' + next + "</div>" +
      '<div class="card player-card">' +
      '<div style="flex:1">' +
      "<div>" + U.esc(player.name) + " <span class=\"muted small\">#" + player.nr + "</span></div>" +
      '<div class="muted small">' + G.posIcon(player.pos) + " " + G.posLabel(player.pos) +
      " · " + player.age + " años</div>" +
      '<div class="muted small">' + (st.meta.country) + " · Potencial " + player.pot + "</div>" +
      '<div class="muted small">✅ ' + (season.starterStatus === "starter" ? "Titular" : "Desde el banquillo") + "</div>" +
      (st.loan ? '<div class="muted small" style="color:var(--blue)">🔁 Cedido de ' + U.esc(G.clubsIndex[st.loan.parentClubId].name) + " · vuelve en " + (st.loan.untilYear - season.year) + " año(s)</div>" : "") +
      (player.injuredRounds > 0 ? '<div class="muted small" style="color:var(--red)">🤕 Lesionado · ' + player.injuredRounds + " jornada(s)</div>" : "") +
      "</div>" +
      '<div style="text-align:center">' +
      '<div class="chip" style="font-size:1.3rem;padding:8px 16px">' + player.ovr + "</div>" +
      '<div class="muted small" style="margin-top:6px">Valor $' + G.fmtMoney(G.marketValue(player)) + "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +

      '<div class="card" style="margin-top:14px">' + statChips + "</div>" +
      exCard +

      '<div class="nav-grid" style="margin-top:14px">' +
      U._nav("📊", "Tabla", "G.ui.standings()") +
      U._nav("👥", "Plantilla", "G.ui.squad()") +
      U._nav("📈", "Mis stats", "G.ui.stats()") +
      U._nav("📄", "Contrato", "G.ui.contract()") +
      U._nav("🌍", "Selección", "G.ui.intl()") +
      U._nav("🎯", "Entrenar", "G.ui.training()") +
      U._nav("🌟", "Fama", "G.ui.fame()") +
      U._nav("📰", "Rumores", "G.ui.rumors()") +
      "</div>";

    U.show("hub");
  };

  U._chip = function (val, label) {
    return '<div class="stat-chip"><b>' + val + "</b><span>" + label + "</span></div>";
  };
  U._nav = function (ic, label, onclick) {
    return '<div class="nav-cell" ' + (onclick ? "onclick=\"" + onclick + "\"" : "") +
      '><span class="ic">' + ic + "</span><span>" + label + "</span></div>";
  };

  U._nextBlock = function (st, ev) {
    const club = G.clubsIndex[st.clubId];
    if (ev.type === "round") {
      const fx = G.activeClubMatch(st);
      if (!fx) return '<div class="muted">Finalización de ronda…</div>';
      const home = G.clubsIndex[fx.home];
      const away = G.clubsIndex[fx.away];
      const local = fx.home === st.clubId;
      const you = local ? home.name : away.name;
      const rival = local ? away : home;
      if (st.player.injuredRounds > 0) {
        return '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px">Jornada ' + ev.round + "</div>" +
          '<div class="vs">' +
          '<span class="crest" style="background:' + home.color + '">' + home.short.slice(0, 3) + "</span>" +
          "<span>" + U.esc(home.name) + "</span>" +
          '<span class="vs-x">vs</span>' +
          '<span class="crest" style="background:' + away.color + '">' + away.short.slice(0, 3) + "</span>" +
          "<span>" + U.esc(away.name) + "</span>" +
          "</div>" +
          '<div class="muted">🤕 Estás lesionado (' + st.player.injuredRounds + ' jornada(s) más). El partido se simula solo.</div>' +
          '<button class="btn gold" style="margin-top:14px" onclick="G.ui.playNext(true)">⏩ Simular jornada</button>';
      }
      return '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px">Jornada ' + ev.round + "</div>" +
        '<div class="vs">' +
        '<span class="crest" style="background:' + home.color + '">' + home.short.slice(0, 3) + "</span>" +
        "<span>" + U.esc(home.name) + "</span>" +
        '<span class="vs-x">vs</span>' +
        '<span class="crest" style="background:' + away.color + '">' + away.short.slice(0, 3) + "</span>" +
        "<span>" + U.esc(away.name) + "</span>" +
        "</div>" +
        '<div class="muted small">' + (local ? "🏠 Local" : "✈️ Visitante") + " · " + U.esc(rival.city) + "</div>" +
        '<button class="btn gold" style="margin-top:14px" onclick="G.ui.playNext()">▶ Jugar partido</button>' +
        '<button class="btn ghost small" style="margin-top:8px" onclick="G.ui.playNext(true)">⏩ Simular</button>';
    }
    if (ev.type === "transfer-window") {
      return '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px">💼 MERCADO DE INVIERNO</div>' +
        '<div class="vs"><div>💼</div><div class="vs-x">Ventana de traspasos</div></div>' +
        '<div class="muted">Otros clubes pueden hacer ofertas por tu jugador a media temporada.</div>' +
        '<button class="btn gold" style="margin-top:14px" onclick="G.ui.openWinterMarket()">Abrir mercado 🔄</button>';
    }
    if (ev.type === "continental") {
      const cup = G.currentCup(st);
      const info = G.activeCupMatch(st, cup, ev.stage);
      const cupName = G.cupNameFor(st, ev.tour);
      const stageName = G.cupStageName(ev.stage);
      if (!info.play || !info.pair) {
        return '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px">' + cupName.toUpperCase() + " · " + stageName + "</div>" +
          '<div class="vs"><div>🏆</div><div class="vs-x">' + G.continentalNews(st, ev) + "</div></div>" +
          '<button class="btn" style="margin-top:14px" onclick="G.ui.afterContinentalSim()">Continuar ➜</button>';
      }
      const opc = info.oppClub, me = info.meClub;
      return '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px">' + cupName.toUpperCase() + " · " + stageName + "</div>" +
        '<div class="vs">' +
        '<span class="crest" style="background:' + me.color + '">' + me.short.slice(0, 3) + "</span>" +
        "<span>" + U.esc(me.name) + "</span>" +
        '<span class="vs-x">vs</span>' +
        '<span class="crest" style="background:' + opc.color + '">' + opc.short.slice(0, 3) + "</span>" +
        "<span>" + U.esc(opc.name) + "</span>" +
        "</div>" +
        '<button class="btn gold" style="margin-top:14px" onclick="G.ui.playNext()">▶ Jugar partido</button>' +
        '<button class="btn ghost small" style="margin-top:8px" onclick="G.ui.playNext(true)">⏩ Simular</button>';
    }
    if (ev.type === "intl") {
      const kindName = ev.kind === "wc" ? "🏆 Copa del Mundo" : ev.kind === "copa" ? "🏆 Copa América" : "🤝 Amistoso internacional";
      const stageName = ev.stage ? { sf1: "Semifinal", sf2: "Semifinal", final: "Final" }[ev.stage] : "";
      if (!st.intl.selected) {
        return '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px">' + kindName + "</div>" +
          '<div class="vs"><div>' + G.nationalTeam(st).flag + "</div><div class=\"vs-x\">Sin convocatoria</div></div>" +
          '<div class="muted">Tu media (' + st.player.ovr + ') no alcanza para ser llamado (mín ' + G.config.INTl_MIN_OVR + ').</div>' +
          '<button class="btn" style="margin-top:14px" onclick="G.ui.skipIntl()">Seguir ➜</button>';
      }
      if (st.player.injuredRounds > 0) {
        return '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px">' + kindName + (stageName ? " · " + stageName : "") + "</div>" +
          '<div class="vs"><div>' + G.nationalTeam(st).flag + "</div><div class=\"vs-x\">Aún estás lesionado</div></div>" +
          '<div class="muted">🤕 No convocado por lesión.</div>' +
          '<button class="btn" style="margin-top:14px" onclick="G.ui.skipIntl()">Seguir ➜</button>';
      }
      const n = G.nationalTeam(st);
      return '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px">' + kindName + (stageName ? " · " + stageName : "") + "</div>" +
        '<div class="vs">' + n.flag + " <b>" + U.esc(n.short) + "</b>" +
        '<span class="vs-x">vs</span><span class="muted">rival por sorteo</span></div>' +
        '<button class="btn gold" style="margin-top:14px" onclick="G.ui.playNext()">▶ Jugar partido</button>' +
        '<button class="btn ghost small" style="margin-top:8px" onclick="G.ui.playNext(true)">⏩ Simular</button>';
    }
    if (ev.type === "season-end") {
      return '<div class="muted small" style="text-transform:uppercase;letter-spacing:2px">⚑ FIN DE TEMPORADA</div>' +
        '<div class="vs"><div>🏁</div><div class="vs-x">Terminó la temporada ' + st.season.year + "</div></div>" +
        '<button class="btn gold" style="margin-top:14px" onclick="G.ui.seasonEndScreen()">Ver resumen 🏆</button>';
    }
    return '<div class="muted">…</div>';
  };

  /* =========================================================
     PARTIDO EN VIVO
     ========================================================= */
  const Play = (U.play = {
    engine: null,
    timer: null,
    speed: 0,
    kind: null,
    onFinish: null,

    _el: () => $("match-area"),

    dismiss() {
      clearInterval(this.timer);
      $("match-overlay").classList.add("hidden");
      this.engine = null;
    },

    playNext: (fast) => U.playNext(fast),
  });

  U.playNext = function (fast) {
    const st = G.state;
    const ev = G.currentEvent(st);
    const ov = $("match-overlay");
    ov.classList.remove("hidden");

    if (ev.type === "round") {
      const fx = G.activeClubMatch(st);
      if (st.player.injuredRounds > 0) {
        // estás de baja: la jornada se simula sola
        const opts = G.clubMatchEngineOpts(st, fx);
        const eng = new G.MatchEngine(opts);
        eng.quick();
        const s = G.resolveClubMatch(st, eng);
        st.player.injuredRounds = Math.max(0, st.player.injuredRounds - 1);
        G.save();
        U.dismissOverlay();
        G.advanceEvent(st);
        U.hub();
        U.toast("🤕 De baja por lesión: partido simulado", 3000);
        return;
      }
      const opts = G.clubMatchEngineOpts(st, fx);
      U.play._prepare("club", opts, (engine) => {
        const s = G.resolveClubMatch(st, engine);
        U.play._summary("club", s, fx);
      });
    } else if (ev.type === "transfer-window") {
      U.dismissOverlay();
      U.openWinterMarket();
      return;
    } else if (ev.type === "continental") {
      const cup = G.currentCup(st);
      const info = G.activeCupMatch(st, cup, ev.stage);
      if (!info.play || !info.pair) {
        U.dismissOverlay();
        G.advanceEvent(st);
        U.hub();
        return;
      }
      const opts = G.continentalEngineOpts(st, info);
      U.play.cupTitle = G.cupNameFor(st, ev.tour);
      const myInjured = st.player.injuredRounds > 0;
      if (myInjured) {
        const eng = new G.MatchEngine(opts);
        eng.quick();
        const s = G.resolveCupMatch(st, cup, ev.stage, eng);
        U.dismissOverlay();
        G.advanceEvent(st);
        U.hub();
        U.toast("🤕 Jugaste la copa lesionado: se simuló", 3000);
        return;
      }
      U.play._prepare("continental", opts, (engine) => {
        const s = G.resolveCupMatch(st, cup, ev.stage, engine);
        U.play._summary("continental", s, info);
      });
    } else if (ev.type === "intl") {
      if (!st.intl.selected) { G.advanceEvent(st); U.dismissOverlay(); U.hub(); U.toast("Sin convocatoria"); return; }
      if (st.player.injuredRounds > 0) { G.advanceEvent(st); U.dismissOverlay(); U.hub(); U.toast("No convocado por lesión"); return; }
      const intl = G.activeIntlMatch(st);
      if (intl.sim) {
        U._renderSimIntl(intl);
        return;
      }
      const opts = G.intlEngineOpts(st, intl);
      U.play._prepare("intl", opts, (engine) => {
        const s = G.resolveIntlMatch(st, engine);
        U.play._summary("intl", s, intl);
      });
    } else if (ev.type === "season-end") {
      U.dismissOverlay();
      U.seasonEndScreen();
    } else {
      U.dismissOverlay();
      U.hub();
    }
  };

  U.skipIntl = function () {
    G.advanceEvent(G.state);
    G.save();
    U.hub();
  };

  U.afterContinentalSim = function () {
    G.advanceEvent(G.state);
    G.save();
    U.hub();
  };

  /* =========================================================
     MERCADO DE INVIERNO (traspasos a mitad de temporada)
     ========================================================= */
  U.openWinterMarket = function () {
    const st = G.state;
    G.startWinterMarket(st);
    U.renderWinterMarket();
  };

  U.renderWinterMarket = function () {
    const st = G.state;
    const m = st.season.winterMarket;
    const myClub = G.clubsIndex[st.clubId];

    let body = "";
    if (m && m.offers.length) {
      body = '<div class="offer-card hl" style="border-left:4px solid var(--gold)">' +
        '<div class="row">' +
        '<span class="crest sm" style="background:' + myClub.color + '">' + myClub.short.slice(0, 3) + "</span>" +
        '<div style="flex:1"><span class="s">' + U.esc(myClub.name) + " <span class=\"muted small\">(tu club)</span></span>" +
        '<div class="muted small">No hay oferta para quedarte: solo cambias si fichas por otro.</div></div>' +
        "</div>" +
        "</div>";
      m.offers.forEach((o) => {
        const league = G.leagueIndex[st.leagueId];
        body +=
          '<div class="offer-card">' +
          '<div class="row">' +
          '<span class="crest sm" style="background:' + o.club.color + '">' + o.club.short.slice(0, 3) + "</span>" +
          '<div style="flex:1"><span class="s">' + U.esc(o.club.name) + "</span>" +
          '<div class="muted small">' + league.flag + " " + U.esc(o.club.city || "") + " · Media " + o.club.ovr + "</div></div>" +
          "</div>" +
          '<div class="grid cols2" style="margin-top:10px">' +
          (o.loan
            ? '<div class="chip" style="grid-column:1 / -1;background:var(--blue);color:#04101f">🔁 Cesión: juegas cedido ' + o.seasonYears + " año(s) sin dejar tu contrato</div>"
            : '<div class="chip">💵 Tasa a tu club: <b>$' + G.fmtMoney(o.fee) + "</b></div>" +
              '<div class="chip" style="background:var(--green);color:#04240f">✍️ Firma: $' + G.fmt(o.salary) + "/año · " + o.years + " años</div>") +
          (!o.loan ? '<div class="chip" style="grid-column:1 / -1">💰 Prima de fichaje para ti: <b>$' + G.fmtMoney(o.bonus) + "</b></div>" : "") +
          "</div>" +
          (o.loan
            ? '<button class="btn blue small" style="margin-top:10px" onclick="G.ui.signWinterLoan(\'' + o.club.id + '\')">🔁 Ir cedido a ' + U.esc(o.club.name) + "</button>"
            : '<button class="btn gold small" style="margin-top:10px" onclick="G.ui.signWinter(\'' + o.club.id + '\')">Fichar por ' + G.fmtMoney(o.salary) + "/año ✍️</button>") +
          "</div>";
      });
    } else {
      body = '<div class="muted">Nadie hizo una oferta por ti esta ventana. Sigue rindiendo para atraer interés. 📈</div>';
    }

    $("scr-market").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.backFromMarket()">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 4px\">💼 Mercado de invierno</h2>" +
      '<div class="muted small" style="margin-bottom:14px">Cuentas de media temporada · temporada ' + st.season.year +
      " · tu valor: <b>$" + G.fmtMoney(G.marketValue(st.player)) + "</b></div>" +
      '<div class="grid cols2">' + body + "</div>" +
      '<div class="muted small" style="margin-top:12px">Un club te compra pagando una tasa a ' + U.esc(myClub.name) +
      " y firmas contrato nuevo. Cambias de equipo en la misma liga (el fixture sigue igual).</div>";
    U.show("market");
  };

  U.signWinter = function (clubId) {
    const st = G.state;
    const m = st.season.winterMarket;
    const offer = m && m.offers.find((o) => o.club.id === clubId);
    if (!offer) return;
    U.dismissOverlay();
    G.acceptTransferWinter(st, offer);
    m.offers = [];
    U.toast("✍️ Traspaso a " + offer.club.name + " · $/" + G.fmt(offer.salary) + " + prima $" + G.fmtMoney(offer.bonus), 3200);
    U.renderWinterMarket();
  };

  U.signWinterLoan = function (clubId) {
    const st = G.state;
    const m = st.season.winterMarket;
    const offer = m && m.offers.find((o) => o.club.id === clubId && o.loan);
    if (!offer) return;
    U.dismissOverlay();
    G.acceptLoan(st, { club: offer.club, seasonYears: offer.seasonYears });
    m.offers = [];
    U.toast("🔁 Cedido a " + offer.club.name + " · vuelve a tu club en " + offer.seasonYears + " año(s)", 3200);
    U.renderWinterMarket();
  };

  U.backFromMarket = function () {
    const st = G.state;
    const src = st.season.winterMarket && st.season.winterMarket.source;
    G.reassignMine(st);
    G.closeWinterMarket(st);
    if (src === "window") {
      G.maybeInsertContinental(st);
      G.advanceEvent(st);
    }
    G.save();
    U.hub();
  };

  U.requestTransfer = function () {
    const st = G.state;
    if (st.season.transferAsked) { U.toast("Ya pediste traspaso esta temporada"); return; }
    const m = G.requestTransfer(st);
    if (!m) return;
    U.toast("Tu agente abrió el mercado: revisa las ofertas");
    U.renderWinterMarket();
  };

  U._renderSimIntl = function (intl) {
    const st = G.state;
    const ev = intl.ev || {};
    // Final simulada: si no llegaste, se resuelve al instante.
    if (intl.key === "final") {
      G.resolveIntlMatch(st, null);
      G.advanceEvent(st);
      U.dismissOverlay();
      U.hub();
      U.toast("🏆 El torneo se definió sin tu participación");
      return;
    }
    const r = intl.opp;
    const a = r.a, b = r.b;
    $("match-area").innerHTML =
      '<div class="card result-panel" style="max-width:520px;margin:40px auto">' +
      '<div class="muted small" style="letter-spacing:2px">RESULTADO DEL OTRO PARTIDO</div>' +
      '<div class="bigscore">' + a.short + " " + a.flag + " " + r.gh + " – " + r.ga + " " + b.flag + " " + b.short + "</div>" +
      '<div class="muted small">' + a.name + " vs " + b.name + "</div>" +
      '<button class="btn gold" style="margin-top:18px" onclick="G.ui.afterSim()">Continuar ➜</button>' +
      "</div>";
  };

  U.afterSim = function () {
    G.resolveIntlMatch(G.state, null);
    G.advanceEvent(G.state);
    U.dismissOverlay();
    U.hub();
  };

  U.play._prepare = function (kind, opts, onFinish) {
    const eng = new G.MatchEngine(opts);
    this.kind = kind;
    this.engine = eng;
    this.onFinish = onFinish;
    this.speed = 0;
    const spSet = [950, 430, 170];
    const saved = localStorage.getItem("sa_speed") || "1";
    this._renderMatchHeader();
    this._tick();
    this.setSpeed(+saved);
  };

  U.play._tick = function () {
    const eng = this.engine;
    if (!eng || eng.done) return;
    if (eng.needChoice) { this._renderChoices(); return; }
    eng.step();
    this._update();
    if (eng.done) { clearInterval(this.timer); this.onFinish && this.onFinish(eng); }
  };

  U.play._update = function () {
    const eng = this.engine;
    const msgs = eng.drainMsg();
    msgs.forEach((m) => {
      let cls = "msg";
      if (/GOL|GOOOL|GOOOLAZO|GOLAZO|¡CIERTO|¡GOL/i.test(m)) cls = "msg goal";
      if (/Final del partido/.test(m)) cls = "msg half";
      const d = document.createElement("div");
      d.className = cls;
      d.textContent = m;
      $("match-feed").appendChild(d);
    });
    const feed = $("match-feed");
    if (feed) feed.scrollTop = feed.scrollHeight;
    this._renderScore();
  };

  U.play._renderScore = function () {
    const eng = this.engine;
    const gh = eng.args.gh, ga = eng.args.ga;
    const homeEl = document.getElementById("mh");
    const awayEl = document.getElementById("ma");
    const minEl = document.getElementById("mm");
    if (homeEl) homeEl.textContent = gh;
    if (awayEl) awayEl.textContent = ga;
    const mm = eng._curMin || 0;
    if (minEl) minEl.textContent = (mm < 46 ? mm + "&#39;" : mm + "&#39;").replace("&#39;", "'");
    if (mm >= 46) minEl.textContent = mm + "'";
  };

  U.play._renderChoices = function () {
    const eng = this.engine;
    const btns = eng.choices.map((c) =>
      '<button class="btn ' + (c.id === "pass" ? "green" : c.id === "dribble" ? "blue" : "gold") + '" onclick="G.ui.play.choose(\'' + c.id + '\')">' +
      "<b>" + c.icon + "</b>" + c.label + '<span class="d">' + c.desc + "</span></button>"
    ).join("");
    const box = document.getElementById("choices");
    if (box) {
      box.innerHTML = btns;
      box.classList.remove("hidden");
    }
  };

  U.play.choose = function (id) {
    const eng = this.engine;
    if (!eng) return;
    eng.choose(id);
    this._update();
    this._renderChoices();
    const box = document.getElementById("choices");
    if (box) box.classList.add("hidden");
    // reanudar inmediatamente
    const spSet = [950, 430, 170];
    clearInterval(this.timer);
    this.timer = setInterval(() => this._tick(), spSet[this.speed]);
    this._tick();
  };

  U.play._renderMatchHeader = function () {
    const eng = this.engine;
    const opts = eng.opts;
    const h = opts.home.club, a = opts.away.club;
    $("match-area").innerHTML =
      '<div class="match-top">' +
      '<div class="scoreboard">' +
      '<div class="team"><span class="crest" style="background:' + h.color + '">' + (h.short || "FC").slice(0, 3) + "</span>" +
      "<div>" + (h.flag ? h.flag + " " : "") + h.short + "</div></div>" +
      '<div class="score"><span id="mh">0</span>–<span id="ma">0</span></div>' +
      '<div class="team"><span class="crest" style="background:' + a.color + '">' + (a.short || "FC").slice(0, 3) + "</span>" +
      "<div>" + (a.flag ? a.flag + " " : "") + a.short + "</div></div>" +
      "</div>" +
      '<div class="min muted" id="mm" style="margin-top:6px">0&#39;</div>' +
      "</div>" +
      '<div id="match-feed"></div>' +
      '<div id="choices" class="choice-btns hidden"></div>' +
      '<div class="match-controls" id="ctl">' +
      '<button class="btn ghost small" id="sp-0" onclick="G.ui.play.setSpeed(0)">1×</button>' +
      '<button class="btn ghost small" id="sp-1" onclick="G.ui.play.setSpeed(1)">2×</button>' +
      '<button class="btn ghost small" id="sp-2" onclick="G.ui.play.setSpeed(2)">4×</button>' +
      '<button class="btn small" onclick="G.ui.play.skipAll()">⏩ Finalizar ahora</button>' +
      '<button class="btn ghost small" id="pause-btn" onclick="G.ui.play.pause()">⏸ Pausa</button>' +
      "</div>";
  };

  U.play.pause = function () {
    if (!this.engine) return;
    if (this._paused) {
      this._paused = false;
      const spSet = [950, 430, 170];
      clearInterval(this.timer);
      this.timer = setInterval(() => this._tick(), spSet[this.speed]);
      const b = document.getElementById("pause-btn");
      if (b) b.textContent = "⏸ Pausa";
      this._tick();
      return;
    }
    clearInterval(this.timer);
    this._paused = true;
    const b = document.getElementById("pause-btn");
    if (b) b.textContent = "▶ Reanudar";
  };
  U.play.resume = function () {
    this._paused = false;
  };
  U.play.setSpeed = function (i) {
    this.speed = i;
    localStorage.setItem("sa_speed", String(i));
    const spSet = [950, 430, 170];
    clearInterval(this.timer);
    this.timer = setInterval(() => this._tick(), spSet[i]);
    [0, 1, 2].forEach((x) => {
      const b = document.getElementById("sp-" + x);
      if (b) b.style.borderColor = x === i ? "var(--gold)" : "var(--line)";
    });
  };

  U.play.skipAll = function () {
    if (!this.engine || this.engine.done) return;
    clearInterval(this.timer);
    this.engine.quick();
    this._update();
    const mm = document.getElementById("mm");
    if (mm) mm.textContent = "90'";
    const box = document.getElementById("choices");
    if (box) box.classList.add("hidden");
    if (this.engine.done) this.onFinish && this.onFinish(this.engine);
  };

  U.play._summary = function (kind, s, ctx) {
    const eng = this.engine;
    const opts = eng.opts;
    const h = opts.home.club, a = opts.away.club;
    const player = opts.myPlayer ? opts.myPlayer.name : G.state.player.name;
    const country = G.state.meta.country;
    const isBench = this.engine.opts.bench;
    const statLine =
      '<div class="stat-line">' +
      '<div class="s"><b>' + s.stats.goals + "</b><span>Goles</span></div>" +
      '<div class="s"><b>' + s.stats.assists + "</b><span>Asistencias</span></div>" +
      '<div class="s"><b>' + s.stats.saves + "</b><span>Paradas</span></div>" +
      '<div class="s"><b>' + s.rating + "</b><span>Nota</span></div>" +
      "</div>";
    $("match-area").innerHTML =
      '<div class="card result-panel" style="max-width:560px;margin:30px auto">' +
      '<div class="muted small" style="letter-spacing:2px">' +
      (kind === "club" ? "FINAL · LIGA" : kind === "continental" ? "FINAL · " + ((this.cupTitle || "COPA") + "").toUpperCase() : "FINAL · TORNEO") + "</div>" +
      '<div class="bigscore">' + h.short + " " + s.gh + " – " + s.ga + " " + a.short + "</div>" +
      '<div class="muted small">' + h.name + " vs " + a.name + "</div>" +
      '<div class="divider"></div>' +
      "<h3>" + U.esc(player) + (kind === "intl" ? " · " + country : "") + "</h3>" +
      '<div class="muted small">' + (isBench ? "Ingresó desde el banquillo" : "Fue de la partida") +
      (s.cleanSheet ? " · 🧤 valla invicta" : "") +
      (s.stats.goals > 0 ? " · 🔥 Goleador" : "") +
      "</div>" +
      statLine +
      (s.rating >= 8.5 ? '<div class="chip gold" style="background:var(--gold);color:#241b00">⭐ ¡MVP del partido!</div>' : "") +
      '<button class="btn gold" style="margin-top:16px" onclick="G.ui.afterMatch()">Continuar ➜</button>' +
      "</div>";
  };

  U.afterMatch = function () {
    G.advanceEvent(G.state);
    U.dismissOverlay();
    U.hub();
  };

  U.dismissOverlay = function () {
    U.play.dismiss();
  };

  /* =========================================================
     TABLA
     ========================================================= */
  U.standings = function () {
    const st = G.state;
    const table = G.sortedTable(st.season.table);
    const defs = G.cupDefsFor(G.confOfLeague(st.leagueId));
    const spots = { lib: defs[0] ? defs[0].spots : 0, sud: defs[1] ? defs[1].spots : 0, rel: G.config.RELEGATIONS };
    let rows = "";
    table.forEach((r, idx) => {
      const pos = idx + 1;
      const club = G.clubsIndex[r.id];
      let cls = "";
      if (pos === 1) cls = "pos-gold";
      else if (pos <= 1 + spots.lib) cls = "pos-lib";
      else if (pos <= 1 + spots.lib + spots.sud) cls = "pos-sud";
      else if (pos > table.length - spots.rel) cls = "pos-rel";
      const mine = r.id === st.clubId;
      const formHtml = (r.form || []).slice(-5).map((f) =>
        '<span style="color:' + (f === "W" ? "var(--green)" : f === "D" ? "var(--muted)" : "var(--red)") + '">' +
        (f === "W" ? "W" : f === "D" ? "D" : "L") + "</span>"
      ).join(" ");
      rows +=
        '<tr class="' + (mine ? "my " : "") + cls + '">' +
        "<td>" + pos + "</td>" +
        '<td class="cli"><span class="crest sm" style="background:' + club.color + '">' + (club.short || "FC").slice(0, 3) + "</span> " +
        (mine ? "<b>" : "") + U.esc(club.name) + (mine ? "</b>" : "") + "</td>" +
        '<td class="num">' + r.p + "</td>" +
        '<td class="num">' + r.w + "</td>" +
        '<td class="num">' + r.d + "</td>" +
        '<td class="num">' + r.l + "</td>" +
        '<td class="num">' + r.gf + ":" + r.ga + "</td>" +
        '<td class="num">' + (r.gd > 0 ? "+" : "") + r.gd + "</td>" +
        '<td class="num">' + formHtml + "</td>" +
        '<td class="num" style="font-weight:800">' + r.pts + "</td>" +
        "</tr>";
    });

    $("scr-standings").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.hub()">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 4px\">📊 " + G.leagueIndex[st.leagueId].flag + " Tabla de posiciones</h2>" +
      '<div class="muted small" style="margin-bottom:12px">Temporada ' + st.season.year + "</div>" +
      '<div class="card" style="overflow-x:auto">' +
      '<table class="tbl">' +
      "<thead><tr><th>#</th><th>Club</th><th class=\"num\">PJ</th><th class=\"num\">G</th><th class=\"num\">E</th><th class=\"num\">P</th><th class=\"num\">GF:GC</th><th class=\"num\">Dif</th><th class=\"num\">Últ.5</th><th class=\"num\">Pts</th></tr></thead>" +
      "<tbody>" + rows + "</tbody>" +
      "</table>" +
      "</div>" +
      '<div class="row small muted" style="margin-top:10px;gap:16px">' +
      '<span>🥇 Campeón</span>' + defs.map((d, i) => '<span>' + (i === 0 ? "🟢 " : "🔵 ") + d.name + " (" + d.spots + ")</span>").join("") +
      '<span>🔴 Descenso (' + spots.rel + ')</span>' +
      "</div>" +
      U._goldenRow(st);
    U.show("standings");
  };

  U._goldenRow = function (st) {
    if (!G.config.GOLDEN_BOOT) return "";
    const sc = G.goldenLeaders(st, "s", 5);
    const as = G.goldenLeaders(st, "a", 5);
    const row = (list, label) =>
      '<div class="card">' +
      "<h3 style=\"margin-bottom:8px\">" + label + "</h3>" +
      '<div class="golden-list">' +
      (list.map((r, i) =>
        '<div class="row" style="padding:4px 0">' +
        '<span class="chip sm' + (i === 0 ? " gold" : "") + '">' + (i + 1) + "</span>" +
        '<span style="flex:1">' + U.esc(r.name) + "</span>" +
        '<span class="crest sm" style="background:' + G.clubsIndex[r.clubId].color + '">' + G.clubsIndex[r.clubId].short.slice(0, 3) + "</span>" +
        '<b style="width:44px;text-align:right">' + r.val + "</b>" +
        "</div>").join("") || '<div class="muted small">Sin datos aún.</div>') +
      "</div>" +
      "</div>";
    return '<div class="grid cols2" style="margin-top:12px">' +
      row(sc, "⭐ Bota de Oro") + row(as, "🎳 Asistencias") + "</div>";
  };

  /* =========================================================
     PLANTILLA
     ========================================================= */
  U.squad = function () {
    const st = G.state;
    const club = G.clubsIndex[st.clubId];
    const sq = st.season.squad;
    const xi = G.bestXI(sq);
    const used = {};
    xi.forEach((p) => (used[p.id] = true));
    const bench = sq.filter((p) => !used[p.id]).sort((a, b) => b.ovr - a.ovr);

    const lineupHtml = G.config.FORMATION.line.reduce((acc, pos, i) => {
      const p = xi[i];
      return acc + '<div class="slot' + (pos === st.player.pos ? " pos" : "") + '">' +
        '<span class="nm">' + U.esc(p.name) + "</span><span class=\"ov\">" +
        G.posIcon(p.pos) + " " + p.ovr + "</span></div>";
    }, "");

    // categorías del banquillo
    const benchRows = bench.map((p) =>
      '<div class="row" style="padding:5px 0">' +
      '<span class="crest sm" style="background:' + club.color + '">#' + p.number + "</span>" +
      '<span style="flex:1">' + U.esc(p.name) + "</span>" +
      '<span class="muted small">' + G.posIcon(p.pos) + " " + p.pos + "</span>" +
      '<span class="chip">' + p.ovr + "</span>" +
      "</div>").join("");

    $("scr-squad").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.hub()">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 4px\">👥 Plantilla</h2>" +
      '<div class="muted small" style="margin-bottom:12px">' + U.esc(club.name) + " · Formación " + G.config.FORMATION.label + "</div>" +

      '<div class="card" style="margin-bottom:14px">' +
      '<div class="row">' +
      '<div class="crest" style="background:var(--gold);color:#241b00">TÚ</div>' +
      '<div style="flex:1"><b>' + U.esc(st.player.name) + "</b>" +
      '<div class="muted small">' + G.posIcon(st.player.pos) + " " + G.posLabel(st.player.pos) +
      " · #" + st.player.nr + " · " + (st.season.starterStatus === "starter" ? "✅ Titular" : "↔️ Desde el banquillo") + "</div></div>" +
      '<div class="chip" style="font-size:1.2rem;padding:8px 14px">' + st.player.ovr + "</div>" +
      "</div>" +
      "</div>" +

      '<div class="pitch">' +
      '<div class="lineup">' + lineupHtml + "</div>" +
      "</div>" +

      '<div class="card" style="margin-top:14px">' +
      "<h3 style=\"margin-bottom:8px\">Suplentes</h3>" + benchRows +
      "</div>";
    U.show("squad");
  };

  /* =========================================================
     ESTADÍSTICAS
     ========================================================= */
  U.stats = function () {
    const st = G.state;
    const ms = st.season.myStats;
    const t = st.career.totals;
    const avgR = ms.nRatings ? (ms.sumRatings / ms.nRatings).toFixed(1) : "—";

    const histRows = st.career.history.slice(-12).reverse().map((h) => {
      const club = G.clubsIndex[h.clubId];
      return "<tr>" +
        "<td>" + h.year + "</td>" +
        '<td><span class="crest sm" style="background:' + club.color + '">' + club.short.slice(0, 3) + "</span> " + U.esc(club.name) + "</td>" +
        '<td class="num">' + h.apps + "</td>" +
        '<td class="num">' + h.goals + "</td>" +
        '<td class="num">' + h.assists + "</td>" +
        '<td class="num">' + h.rating + "</td>" +
        '<td class="num">' + (h.champion ? "🏆" : "#" + h.position) + "</td>" +
        "</tr>";
    }).join("") || '<tr><td colspan="7" class="muted">Primera temporada en curso…</td></tr>';

    const titlesHtml = st.career.titles.map((x) => "<li>🏆 " + U.esc(x.label) + " · " + x.year + "</li>").join("") ||
      '<li class="muted">Aún sin títulos. ¡A por el primero!</li>';

    $("scr-stats").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.hub()">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 4px\">📈 Estadísticas</h2>" +
      '<div class="muted small" style="margin-bottom:12px">' + U.esc(st.player.name) + " · Temporada " + st.season.year + "</div>" +

      '<div class="card">' +
      "<h3 style=\"margin-bottom:8px\">Temporada actual</h3>" +
      '<div class="stat-chips">' +
      U._chip(ms.apps, "PJ") + U._chip(ms.goals, "Goles") + U._chip(ms.assists, "Asist") +
      U._chip(ms.saves, "Paradas") + U._chip(ms.conceded, "Recibidos") + U._chip(avgR, "Nota") +
      "</div>" +
      "</div>" +

      '<div class="grid cols2" style="margin-top:12px">' +
      '<div class="card">' +
      "<h3 style=\"margin-bottom:8px\">Carrera</h3>" +
      '<div class="stat-chips">' +
      U._chip(t.apps, "PJ") + U._chip(t.goals, "Goles") + U._chip(t.assists, "Asist") +
      U._chip(t.saves, "Paradas") + U._chip(t.cleanSheets, "Valla 0") +
      U._chip(t.nRatings ? (t.sumRatings / t.nRatings).toFixed(1) : "—", "Nota media") +
      "</div>" +
      "</div>" +
      '<div class="card">' +
      "<h3 style=\"margin-bottom:8px\">🏆 Palmarés</h3>" +
      '<ul class="titles-list">' + titlesHtml + "</ul>" +
      '<div class="muted small" style="margin-top:8px">Media actual: <b style="color:var(--gold)">' + st.player.ovr + "</b> (" + G.reputationOf(st) + ")</div>" +
      "</div>" +
      "</div>" +

      '<div class="card" style="margin-top:12px">' +
      "<h3 style=\"margin-bottom:8px\">Historial por temporada</h3>" +
      '<div style="overflow-x:auto"><table class="tbl">' +
      "<thead><tr><th>Temporada</th><th>Club</th><th class=\"num\">PJ</th><th class=\"num\">Gol</th><th class=\"num\">Asis</th><th class=\"num\">Nota</th><th class=\"num\">Posición</th></tr></thead>" +
      "<tbody>" + histRows + "</tbody></table></div>" +
      "</div>";
    U.show("stats");
  };

  /* =========================================================
     CONTRATO
     ========================================================= */
  U.contract = function () {
    const st = G.state;
    const club = G.clubsIndex[st.clubId];
    const c = st.contract;
    const player = st.player;

    $("scr-contract").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.hub()">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 16px\">📄 Contrato y fichaje</h2>" +
      '<div class="grid cols2">' +
      '<div class="card">' +
      '<span class="crest big" style="background:' + club.color + '">' + club.short.slice(0, 3) + "</span>" +
      "<h3 style=\"margin:10px 0 4px\">" + U.esc(club.name) + "</h3>" +
      '<div class="muted small">' + G.leagueIndex[st.leagueId].flag + " " + G.leagueIndex[st.leagueId].name + "</div>" +
      '<div class="divider"></div>' +
      '<div class="row spread"><span class="muted">Sueldo anual</span><b>$' + G.fmt(c.salary) + "</b></div>" +
      '<div class="row spread"><span class="muted">Años firmados</span><b>' + c.totalYears + "</b></div>" +
      '<div class="row spread"><span class="muted">Años restantes</span><b>' + c.yearsLeft + "</b></div>" +
      '<div class="row spread"><span class="muted">Valor de mercado</span><b>$' + G.fmtMoney(G.marketValue(player)) + "</b></div>" +
      "</div>" +
      '<div class="card">' +
      "<h3 style=\"margin-bottom:8px\">💡 Traspasos</h3>" +
      '<div class="muted small">Puedes cambiar de club en el <b>mercado de invierno</b> (mitad de temporada) o al final del año.' +
      " Un club que te quiera le paga una tasa a tu equipo y te ofrece contrato y prima de fichaje.</div>" +
      '<div class="muted small" style="margin-top:8px">Tu equipo desciende con los peores ' + G.config.RELEGATIONS + " de la tabla.</div>" +
      (st.season.transferAsked
        ? '<div class="chip" style="margin-top:10px">✅ Ya pediste traspaso esta temporada</div>'
        : '<button class="btn small" style="margin-top:10px" onclick="G.ui.requestTransfer()">📨 Pedir traspaso de invierno</button>') +
      (st.career.bonusIncome
        ? '<div class="chip" style="margin-top:10px;background:var(--green);color:#04240f">💰 Primas cobradas: $' + G.fmtMoney(st.career.bonusIncome) + "</div>"
        : "") +
      '<div class="divider"></div>' +
      "<h3 style=\"margin-bottom:8px\">📈 Tu progreso</h3>" +
      '<div class="row"><div class="chip">Edad ' + player.age + "</div>" +
      '<div class="chip">Media ' + player.ovr + "</div>" +
      '<div class="chip">Reputación: ' + G.reputationOf(st) + "</div></div>" +
      "</div>" +
      "</div>";
    U.show("contract");
  };

  /* =========================================================
     SELECCIÓN NACIONAL
     ========================================================= */
  U.intl = function () {
    const st = G.state;
    const I = st.intl;
    const nat = G.nationalTeam(st);
    const conf = G.confOfLeague(st.leagueId);
    const continental = (G.config.CONF[conf] || {}).continental || "🇨🇴 Copa América";

    const tourInfo = I.selected
      ? '<div class="chip" style="background:var(--green);color:#04240f">✅ Convocado</div>' +
        '<div class="muted small" style="margin-top:8px">Media necesaria: ' + G.config.INTl_MIN_OVR + " · La tuya: " + st.player.ovr + "</div>"
      : '<div class="chip" style="background:var(--red);color:#2b0505">No convocado aún</div>' +
        '<div class="muted small" style="margin-top:8px">Sube tu media hasta ' + G.config.INTl_MIN_OVR + " para ser llamado a la selección.</div>";

    $("scr-intl").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.hub()">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 16px\">🌍 Selección nacional</h2>" +
      '<div class="card">' +
      '<div class="row">' +
      '<div style="font-size:2rem">' + nat.flag + "</div>" +
      '<div style="flex:1"><h3>' + U.esc(nat.name) + "</h3>" +
      '<div class="muted small">Fuerza de la selección: ' + nat.ovr + " · Confederación: " + G.confLabel(G.confOfLeague(st.leagueId)) + "</div>" +
      "</div>" +
      "</div>" +
      '<div class="divider"></div>' +
      '<div class="stat-chips">' +
      U._chip(I.caps, "Partidos") + U._chip(I.goals, "Goles") + U._chip(I.assists, "Asist") +
      U._chip(I.saves, "Paradas") + U._chip(I.cleanSheets, "Valla 0") +
      "</div>" +
      '<div class="divider"></div>' + tourInfo +
      '<div class="divider"></div>' +
      '<div class="muted small">Calendario: amistosos durante la temporada y, cada ' +
      G.config.COPA_AMERICA_EVERY + " temporadas, la " + continental + "; cada " +
      G.config.WORLD_CUP_EVERY + " temporadas, la 🏆 Copa del Mundo.</div>" +
      "</div>";
    U.show("intl");
  };

  /* =========================================================
     ENTRENAMIENTO
     ========================================================= */
  U.training = function () {
    const st = G.state;
    const left = G.trainingSessionsLeft(st);
    if (!G.config.TRAINING_ENABLED) {
      $("scr-training").innerHTML =
        '<div class="row"><span class="backlink" onclick="G.ui.hub()">← Volver</span></div>' +
        "<h2 style=\"margin:10px 0 16px\">🎯 Entrenamiento</h2>" +
        '<div class="card"><div class="muted">El entrenamiento está desactivado en la configuración.</div></div>';
      U.show("training");
      return;
    }
    const rows = G.config.ATTRIBUTES.map((a) => {
      const v = st.player.attrs[a.key];
      const maxed = v >= G.config.TRAINING_MAX_ATTR;
      const keyAttr = G._isKeyAttr(st, a.key);
      const chance = G._drillChance(st, a.key);
      return '<div class="row" style="margin:8px 0">' +
        '<div style="flex:1"><b>' + a.icon + " " + a.name + (keyAttr ? " ⭐" : "") + "</b> " +
        '<span class="chip" style="margin-left:6px">' + v + (maxed ? " (máx)" : "") + "</span>" +
        '<div class="muted small">' + a.desc + " · éxito por ronda ~" + Math.round(chance * 100) + "%</div></div>" +
        '<button class="btn small ' + (maxed ? "ghost" : "gold") + '" ' + (maxed || left <= 0 ? "disabled" : "") +
        ' onclick="G.ui.trainAttr(\'' + a.key + '\')">Entrenar 🏋️</button>' +
        "</div>";
    }).join("");
    $("scr-training").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.hub()">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 4px\">🎯 Entrenamiento</h2>" +
      '<div class="muted small" style="margin-bottom:14px">Sesiones de hoy: <b>' + left + " de " + G.config.TRAINING_SESSIONS_PER_SEASON +
      "</b> · una nueva sesión cada jornada · Media actual: " + st.player.ovr + "</div>" +
      '<div class="card"><div style="margin-bottom:8px" class="muted small">Cada sesión es un drill de ' +
      G.config.TRAINING_DRILL_ROUNDS + " rondas (éxito por ronda = +1). Entrenar las ⭐ (claves de tu posición) rinde más. Máximo " +
      G.config.TRAINING_MAX_ATTR + ".</div>" + rows + "</div>";
    U.show("training");
  };

  U.trainAttr = function (key) {
    const st = G.state;
    const r = G.trainAttribute(st, key);
    if (!r.ok) { U.toast(r.msg); }
    else {
      U.toast(r.gain > 0
        ? "💪 " + (r.attrName || key) + " +" + r.gain + " · media " + st.player.ovr + " · quedan " + r.sessionsLeft
        : "🧘 " + (r.attrName || key) + " sin éxito esta vez · quedan " + r.sessionsLeft, 2600);
    }
    U.training();
  };

  /* =========================================================
     FAMA
     ========================================================= */
  U.fame = function () {
    const st = G.state;
    const v = G.fameOf(st);
    const tier = G.fameTier(st).tier;
    const pct = Math.round(v);
    $("scr-fame").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.hub()">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 4px\">🌟 Fama del jugador</h2>" +
      '<div class="muted small" style="margin-bottom:14px">Qué tan conocido eres en Sudamérica y el mundo.</div>' +
      '<div class="card" style="text-align:center">' +
      '<div style="font-size:3rem">' + tier.icon + "</div>" +
      "<h3 style=\"margin:6px 0 2px\">" + tier.name + "</h3>" +
      '<div class="muted small">Nivel de fama: <b>' + v + " / 100</b></div>" +
      '<div style="height:14px;background:var(--line);border-radius:8px;margin:12px 0;overflow:hidden">' +
      '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--gold),var(--green))"></div></div>' +
      '<div class="muted small">La fama sube con tu rendimiento (medía, títulos y selección).</div>' +
      "</div>";
    U.show("fame");
  };

  /* =========================================================
     RUMORES
     ========================================================= */
  U.rumors = function () {
    const st = G.state;
    const rs = st.season.rumors || [];
    const ev = G.currentEvent(st);
    const nextWave = ev && ev.type === "round" && G.config.RUMORS_EVERY
      ? G.config.RUMORS_EVERY - (((ev.round || 0) - 1) % G.config.RUMORS_EVERY)
      : null;
    let body = "";
    if (rs.length) {
      body = rs.map((r) =>
        '<div class="offer-card">' +
        '<div class="row">' +
        '<span class="crest sm" style="background:' + r.club.color + '">' + r.club.short.slice(0, 3) + "</span>" +
        '<div style="flex:1"><span class="s">' + U.esc(r.club.name) + "</span>" +
        '<div class="muted small">' + r.league.flag + " " + U.esc(r.club.city || "") + " · Media " + r.club.ovr + "</div></div>" +
        "</div>" +
        '<div class="muted small" style="margin-top:8px">📰 ' + U.esc(r.note) + (r.round ? " (jornada " + r.round + ")" : "") + "</div>" +
        "</div>"
      ).join("");
    } else {
      body = '<div class="muted">No hay rumores sobre ti todavía. Rinde en la cancha para que los grandes se fijen.</div>';
    }
    $("scr-rumors").innerHTML =
      '<div class="row"><span class="backlink" onclick="G.ui.hub()">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 4px\">📰 Rumores de fichajes</h2>" +
      '<div class="muted small" style="margin-bottom:14px">' +
      (nextWave ? "La prensa renueva los rumores cada " + G.config.RUMORS_EVERY + " jornadas · próxima oleada en ~" + nextWave + " jornada(s)." :
        "Los rumores se renuevan en el transcurso de la temporada.") +
      "</div>" +
      '<div class="grid cols2">' + body + "</div>";
    U.show("rumors");
  };

  /* =========================================================
     FIN DE TEMPORADA
     ========================================================= */
  U.seasonEndScreen = function () {
    const st = G.state;
    // proceso una sola vez
    if (!st.pending || st.pending.type !== "season-end") {
      const p = G.processSeasonEnd(st);
      U.seasonEndScreen();
      return;
    }
    U._renderSeasonEnd();
  };

  U._renderSeasonEnd = function () {
    const st = G.state;
    const p = st.pending;
    const spots = p.spots;
    const myClub = G.clubsIndex[st.clubId];
    const champClub = G.clubsIndex[spots.champion];

    const offersHtml = p.offers.map((o) =>
      '<div class="offer-card' + (o.club.id === st.clubId || o.type === "renewal" ? " hl" : "") + '">' +
      '<div class="row">' +
      '<span class="crest sm" style="background:' + o.club.color + '">' + o.club.short.slice(0, 3) + "</span>" +
      '<div style="flex:1"><span class="s">' + U.esc(o.club.name) + "</span>" +
      '<div class="muted small">' + (o.club.isNational ? "Selección" : (G.leagues.find((lg) => lg.clubIds.indexOf(o.club.id) !== -1) || {}).flag || "") +
      " " + U.esc(o.club.city || "") + " · Media " + o.club.ovr + "</div></div>" +
      "</div>" +
      '<div class="row spread" style="margin-top:10px">' +
      '<div class="muted small">💵 ' + (o.type === "loan" ? "CESIÓN · vuelves a " + U.esc((G.clubsIndex[st.clubId]).name) :
        "$" + G.fmt(o.salary) + "/año · " + o.years + " años" +
        (o.type === "renewal" ? (o.boosted ? " · RENOVACIÓN PREMIUM ⭐" : " · RENOVACIÓN") : o.type === "elite" ? " · ÉLITE" : " · OFERTA")) + "</div>" +
      '<button class="btn small ' + (o.type === "renewal" ? "green" : o.type === "loan" ? "blue" : "gold") + '" onclick="G.ui.sign(' + ("'" + o.club.id + "'") + ')">' +
      (o.type === "loan" ? "↩️ Aceptar cesión" : "Firmar ✍️") + "</button>" +
      "</div>" +
      "</div>"
    ).join("");

    const contractWarn = p.contractStatus === "expired"
      ? '<div class="chip" style="background:var(--red);color:#2b0505">Tu contrato terminó: debes firmar</div>'
      : p.contractStatus === "last"
        ? '<div class="chip">Te queda 1 año de contrato (renueva o saldrás libre)</div>'
        : "";

    const cupSlots = (p.spots.cups || []).reduce((s, c) => s + c.slots.length, 0);
    const exUi = p.expectations
      ? '<div class="row" style="justify-content:center;margin-top:10px">' +
        '<div class="chip">🎯 Objetivos: 🏁 top ' + p.expectations.minPos + (p.expectations.metPos ? " ✓" : " ✗") +
        " · ⚽ " + p.expectations.goals + " gol" + (p.expectations.metGoals ? " ✓" : " ✗") +
        " · 🎳 " + p.expectations.assists + " asis" + (p.expectations.metAssists ? " ✓" : " ✗") + "</div>" +
        (p.expectations.allMet
          ? '<div class="chip gold" style="background:var(--gold);color:#241b00">🎉 ¡Objetivos superados! Renovación mejorada</div>'
          : "") +
        "</div>"
      : "";

    $("scr-season").innerHTML =
      '<div class="card" style="margin:6px 0 14px;text-align:center">' +
      '<div class="muted small" style="letter-spacing:3px">⚑ TEMPORADA ' + st.season.year + "</div>" +
      '<h2 style="margin:6px 0 2px">Final de la temporada</h2>' +
      '<div class="muted small">' + G.leagueIndex[st.leagueId].flag + " " + G.leagueIndex[st.leagueId].name + "</div>" +
      "</div>" +

      '<div class="grid cols2">' +
      '<div class="card" style="grid-column:1 / -1;text-align:center">' +
      (p.summary.champion
        ? '<div class="big gold">🏆 ¡CAMPEÓN DE LIGA!</div><div class="muted">' + myClub.name + " se consagró campeón de la temporada</div>"
        : '<div class="big">' + (p.myPos === 1 ? "🥇 Campeón" : p.myPos === 2 ? "🥈 Subcampeón" : p.myPos <= 1 + cupSlots ? "🌟 Clasificado a copas" : "Misma categoría") + "</div>") +
      '<div class="muted small">Tu posición: <b>#' + p.myPos + "</b> · Campeón: " +
      '<span class="crest sm" style="background:' + champClub.color + '">' + champClub.short.slice(0, 3) + "</span> " + U.esc(champClub.name) + "</div>" +
      '<div class="row" style="justify-content:center;margin-top:10px">' +
      '<div class="chip">⚽ ' + p.summary.goals + " goles</div>" +
      '<div class="chip">🎳 ' + p.summary.assists + " asist.</div>" +
      '<div class="chip">🧤 ' + p.summary.saves + " paradas</div>" +
      '<div class="chip">🏅 Nota ' + p.summary.rating + "</div>" +
      '<div class="chip">👕 ' + p.summary.apps + " PJ</div>" +
      "</div>" +
      '<div class="muted small" style="margin-top:8px">Reputación: ' + p.reputation + " · Media " + st.player.ovr + "</div>" +
      (p.goldenBoot
        ? '<div class="row" style="justify-content:center;margin-top:10px">' +
          '<div class="chip gold" style="background:var(--gold);color:#241b00">⭐ Bota de Oro: ' + U.esc(p.goldenBoot.name) + " · " + p.goldenBoot.val + " goles</div>" +
          (p.bonusIncome ? '<div class="chip">💰 Primas por traspasos: $' + G.fmtMoney(p.bonusIncome) + "</div>" : "") +
          "</div>"
        : "") +
      (p.ballonDor
        ? '<div class="big gold" style="margin-top:8px">🏆 ¡BALÓN DE ORO!</div><div class="muted">La prensa te corona como el mejor jugador del mundo.</div>'
        : "") +
      exUi +
      "</div>" +

      '<div class="card" style="grid-column:1 / -1">' +
      "<h3 style=\"margin-bottom:10px\">Mercado de fichajes</h3>" + contractWarn +
      '<div class="offers" style="margin-top:10px">' + (offersHtml || '<div class="muted small">No hay ofertas este mercado.</div>') + "</div>" +
      "</div>" +
      "</div>" +

      '<div class="row" style="justify-content:center;margin:20px 0">' +
      '<button class="btn gold" style="padding:16px 30px" onclick="G.ui.nextSeason()">👉 Nueva temporada ' + (st.season.year + 1) + "</button>" +
      "</div>";
    U.show("season");
  };

  U.sign = function (clubId) {
    const st = G.state;
    if (!st.pending || st.pending.type !== "season-end") return;
    const offer = st.pending.offers.find((o) => o.club.id === clubId);
    if (!offer) return;
    if (offer.type === "loan") {
      G.acceptLoan(st, offer);
      st.pending.offers = st.pending.offers.filter((o) => o.club.id !== clubId);
      U.toast("🔁 Cedido a " + offer.club.name + " · vuelves en " + offer.seasonYears + " año(s)", 3000);
      U.seasonEndScreen();
      return;
    }
    G.acceptContract(st, offer, offer.years, clubId);
    st.pending.offers = st.pending.offers.filter((o) => o.club.id !== clubId);
    U.toast("✍️ Firmaste con " + offer.club.name + " · $" + G.fmt(offer.salary) + "/año");
    U.seasonEndScreen();
  };

  U.nextSeason = function () {
    const st = G.state;
    // si el contrato terminó y no firmó, sigue igual (contrato expirado)
    const growth = G.advanceSeason(st);
    U.hub();
    const g = growth.growth;
    U.toast(g > 0 ? "📈 Subiste a media " + st.player.ovr : g < 0 ? "📉 Bajaste a media " + st.player.ovr : "Temporada " + growth.year + " comenzó", 2600);
  };

  /* =========================================================
     CONFIGURACIÓN
     ========================================================= */
  U.settings = function () {
    const st = G.state;
    const diffOpts = Object.keys(G.config.DIFFICULTY).map((k) =>
      '<option value="' + k + '"' + (st && st.difficulty === k ? " selected" : "") + ">" + G.config.DIFFICULTY[k].name + " · " + G.config.DIFFICULTY[k].desc + "</option>"
    ).join("");

    $("scr-settings").innerHTML =
      '<div class="row"><span class="backlink" onclick="' + (st ? "G.ui.hub()" : "G.ui.menu()") + '">← Volver</span></div>' +
      "<h2 style=\"margin:10px 0 16px\">⚙️ Configuración</h2>" +
      '<div class="grid cols2">' +
      '<div class="card">' +
      "<h3 style=\"margin-bottom:8px\">Ajustes de partida</h3>" +
      "<label>Dificultad</label>" +
      '<select onchange="G.ui.setDiff(this.value)" style="margin-top:6px">' + diffOpts + "</select>" +
      '<div class="muted small" style="margin-top:10px">La dificultad afecta la fuerza de los rivales en tus partidos.</div>' +
      "</div>" +
      '<div class="card">' +
      "<h3 style=\"margin-bottom:8px\">Partida</h3>" +
      '<div class="grid">' +
      '<button class="btn ghost small" onclick="G.ui.exportSave()">📤 Exportar partida</button>' +
      '<label class="btn ghost small" style="cursor:pointer">📥 Importar partida' +
      '<input type="file" accept=".txt" style="display:none" onchange="G.ui.importSave(this.files[0])"></label>' +
      '<button class="btn red small" onclick="G.ui.deleteSave()">🗑️ Borrar partida</button>' +
      "</div>" +
      '<div class="muted small" style="margin-top:10px">Tu progreso se guarda automáticamente (navegador).</div>' +
      "</div>" +
      "</div>" +
      '<div class="card" style="margin-top:12px">' +
      "<h3 style=\"margin-bottom:6px\">📦 Datos del juego (altamente actualizables)</h3>" +
      '<div class="muted small">Edita los archivos de la carpeta <code>js/data/</code> para cambiar clubes, ligas, nombres, ' +
      'atributos, sueldos, dificultad y calendarios. Guarda y recarga la página.</div>' +
      '<div class="muted small" style="margin-top:6px">Versión ' + G.config.VERSION + "</div>" +
      "</div>";
    U.show("settings");
  };

  U.setDiff = function (v) {
    if (G.state) { G.state.difficulty = v; G.save(); }
    U.toast("Dificultad: " + v);
  };

  U.exportSave = function () { G.exportSave(); };
  U.importSave = function (file) {
    if (file) G.importSave(file);
  };
  U.deleteSave = function () {
    if (confirm("¿Borrar la partida actual? Se perderá todo el progreso.")) {
      G.clearSave();
      G.state = null;
      U.menu();
    }
  };

  /* Arranque de la app */
  U.init = function () {
    const st = G.load();
    if (st) {
      G.state = st;
    }
    U.menu();
  };
})();