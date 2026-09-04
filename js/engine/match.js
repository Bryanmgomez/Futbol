/* ============================================================
   MATCH — motor del partido (interactivo y simulación rápida)
   ============================================================
   El motor genera una línea de tiempo de eventos. Cuando el balón
   llega a tu jugador se detiene y te da opciones; como portero,
   adivinas la esquina del disparo. Todo el texto se puede editar
   en la tabla T de este mismo archivo.
   ============================================================ */
(function () {
  const G = (window.G = window.G || {});
  const M = () => G.config.MATCH;

  const T = {
    filler: [
      "{B} intenta progresar por la izquierda.",
      "{A} controla el ritmo del partido en el centro.",
      "El juego se traba en el mediocampo.",
      "{A} mueve el balón con paciencia buscando espacios.",
      "{A} presiona arriba y recupera en campo rival.",
      "Centro al área de {B} que despeja la defensa.",
      "Juego de ida y vuelta en el centro del campo.",
      "{B} busca el contraataque con velocidad.",
      "Falta táctica de {A} a la altura del círculo central.",
      "{A} combina por la derecha, el pase no encuentra receptor.",
      "{B} gana el duelo aéreo y saca el balón.",
      "El partido está muy disputado en el mediocampo.",
      "{A} lanza en largo hacia el área de {B}.",
    ],
    chanceMiss: [
      "¡Ocasión para {A}! Remate desviado por poco.",
      "¡{A} dispara desde la frontal... la pelota se va alta!",
      "¡Casi {A}! El disparo roza el poste.",
      "¡Uyyyy! {A} la pierde enfrente del arco, desviada.",
    ],
    chanceSave: [
      "¡Disparo de {A}! ¡Gran atajada del arquero de {B}!",
      "¡{A} remata! El portero de {B} desvía a mano cambiada.",
      "¡Qué mano del arquero de {B}! Sacó el gol de {A}.",
      "¡Tiro de {A} al ángulo y el arquero de {B} vuela a desviarlo!",
      "¡{A} sacude y el portero de {B} rechaza a córner!",
    ],
    chanceGoal: [
      "¡GOOOL de {A}! ¡La tabla se mueve!",
      "¡{A} la manda a guardar! GOLAZO.",
      "¡GOL de {A}! El arquero nada pudo hacer.",
      "¡{A} define por bajo, al palo izquierdo! GOL.",
    ],
    yourChanceIntro: [
      "¡Balón para ti, {P}! Estás mano a mano con la defensa...",
      "¡{P}! Recibes con ventaja en tres cuartos...",
      "¡Corre {P}! Tienes el área para comértela...",
      "¡Otra vez {P}! Tienes la pelota en zona peligrosa...",
    ],
    yourGoal: [
      "¡GOOOLAZO DE {P}! ¡{T} enloquece!",
      "¡GOL DE {P}! ¡La rompes!",
      "¡Qué definición de {P}! Golazo para {T}.",
      "¡{T} festeja! ¡{P} anotó el gol!",
    ],
    yourAssist: [
      "¡{P} asiste! GOL de {T}. Pase perfecto del crack.",
      "¡Asistencia de {P}! La pone donde la defensa no alcanza.",
      "¡{P} la filtra y {T} define! ¡Golazo servido!",
    ],
    yourDribbleGoal: [
      "¡{P} se lleva a dos y define cruzado... GOOOLAZO!",
      "¡Qué jugada de {P}! Regate y golazo.",
      "¡{P} hace la individual y la coloca al palo! ¡GOL!",
    ],
    yourMiss: [
      "¡{P} remata... y se va desviado! La tuvo que embocar.",
      "¡Lo que falló {P}! El arquero miró cómo se iba.",
      "¡{P}! El disparo se pierde por encima del travesaño.",
    ],
    yourBlocked: [
      "¡{P} prueba suerte... y la defensa lo manda al córner!",
      "¡El remate de {P} es bloqueado por un defensor!",
    ],
    yourSaved: [
      "¡Disparo de {P} y el arquero la saca! ¡Qué atajada!",
      "¡{P} remata fuerte... pero el portero desvía!",
    ],
    yourPassFail: [
      "¡El pase de {P} es interceptado! Se pierde la oportunidad.",
      "¡{P} intenta filtrar y la defensa corta la jugada!",
      "¡Pase mal de {P}, el rival recupera!",
    ],
    yourLost: [
      "¡Se complica y {P} pierde la pelota! ¡El rival corre!",
      "¡Regate de más de {P}! Contragolpe rival.",
    ],
    yourCounter: [
      "¡Y el contragolpe termina en GOL de {R}! Duro castigo.",
      "¡Tras la pérdida, {R} anota en la contra! Qué castigo.",
    ],
    yourClear: [
      "¡{P} se proyecta con criterio y la jugada continúa!",
      "¡{P} corta con la marca y arma la salida!",
    ],
    gkSave: [
      "¡ATAJADA DE {P}! ¡Qué reflejos bajo el palo!",
      "¡{P} voló y sacó un disparo imposible! ¡GIGANTE!",
      "¡Paradón de {P}! La desvía con una mano infernal.",
      "¡{P} la rechaza al córner en el último momento!",
    ],
    gkConceded: [
      "¡GOL de {R}! {P} nada pudo hacer.",
      "¡Los rivales fusilan a {P}! Gol abajo, al palo.",
      "¡GOL de {R}! {P} se estira pero no llega.",
    ],
    gkOff: [
      "¡Remate de {R} que se va desviado! {P} respira.",
      "¡{R} dispara al travesaño! Se salva {P}.",
      "¡La pelota pega en el palo! Escapada para {P}.",
    ],
    gkIntro: [
      "¡Tiro a tu arco, {P}! ¿Hacia dónde te lanzas? 🧤",
      "¡{R} encara a {P}! ¡Elige tu esquina!",
    ],
    sub: [
      "¡Cambio de {T}! Entra {P} al campo con todo.",
      "¡{P} ingresa por {T}! El técnico busca chispa.",
      "¡Se viene {P}! Ingresa al minuto.",
    ],
  };

  G.matchText = function (key, vars) {
    const t = T[key] || ["..."];
    let s = G.pick(t);
    for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  };

  /* ================================================================
     MOTOR
     ================================================================ */
  G.MatchEngine = function (opts) {
    this.opts = opts;
    this.home = opts.home;   // { club, isMine }
    this.away = opts.away;
    this.player = opts.myPlayer || null;
    this.mySide = opts.mySide || "home";
    this.difficulty = opts.difficulty || 0;
    this.args = { gh: 0, ga: 0 };
    this.goals = [];
    this.stats = { goals: 0, assists: 0, saves: 0, conceded: 0 };
    this.rating = null;
    this.events = [];
    this._i = 0;
    this.choices = null;
    this.pendingChoice = null;
    this.needChoice = false;
    this.done = false;
    this.msgQueue = [];
    this._build();
  };

  G.MatchEngine.prototype.pos = function (side) {
    return side === "home" ? this.home : this.away;
  };

  G.MatchEngine.prototype.clubOf = function (side) {
    return this.pos(side).club;
  };

  G.MatchEngine.prototype.strOf = function (side) {
    return this.pos(side).strength;
  };

  G.MatchEngine.prototype.ownClub = function () {
    return this.clubOf(this.mySide);
  };

  G.MatchEngine.prototype.oppSide = function (side) {
    return side === "home" ? "away" : "home";
  };

  /* ---------------- construir la línea de tiempo ---------------- */
  G.MatchEngine.prototype._build = function () {
    const opts = this.opts;
    // Fuerza con dificultad (solo la reciben los rivales de tu club)
    const dh = !opts.neutral && opts.home.isMine ? 0 : this.difficulty;
    const da = !opts.neutral && opts.away.isMine ? 0 : this.difficulty;
    this.home.strength = G.teamStrength(opts.home.club, { home: !opts.neutral && !opts.home.isMine, difficulty: dh });
    this.away.strength = G.teamStrength(opts.away.club, { home: !opts.neutral && !opts.away.isMine, difficulty: da });

    const sh = this.home.strength, sa = this.away.strength;
    const pHome = sh / (sh + sa);
    const role = this.player ? this.player.pos : null;
    const totalAtt = G.poisson(M().avgChances);

    // participación del jugador
    const roleInv = { POR: 0, DEF: 0.12, MED: 0.28, DEL: 0.45 };
    let invFactor = 1;
    if (this.player && !opts.national) {
      invFactor = G.clamp(0.7 + (this.player.ovr - this.ownClub().ovr) / 55, 0.5, 1.35);
    }
    const bench = !!opts.bench;
    const subMinute = opts.bench && opts.subMinute ? opts.subMinute : M().subMinute;

    const events = [];
    const invOk = (minute) => {
      if (!this.player || role === "POR") return true;
      if (bench && minute < subMinute) return false;
      return true;
    };

    for (let a = 0; a < totalAtt; a++) {
      const side = G.chance(pHome) ? "home" : "away";
      const minute = G.rndInt(1, M().totalMinutes);
      const pChance = G.clamp(0.44 + (this.strOf(side) - 50) * 0.004, 0.24, 0.62);

      if (!G.chance(pChance)) {
        events.push({ min: minute, type: "filler", side, out: null });
        continue;
      }

      const myTurn = this.mySide === side;
      if (this.player && role !== "POR" && myTurn && invOk(minute) &&
          G.chance((roleInv[role] || 0.2) * invFactor)) {
        events.push({ min: minute, type: "yourChance", side, out: null });
        continue;
      }
      if (this.player && role === "POR" && !myTurn && invOk(minute) && G.chance(0.78)) {
        events.push({ min: minute, type: "gkRoll", side, out: null });
        continue;
      }
      events.push({ min: minute, type: "chance", side, out: this._resolveChance(side) });
    }

    if (bench) {
      events.push({ min: subMinute, type: "sub", side: null, out: null, forced: true });
    }

    // garantía: titular siempre participa al menos una vez
    if (this.player && !bench) {
      const type = role === "POR" ? "gkRoll" : "yourChance";
      if (!events.some((e) => e.type === type)) {
        const gkSide = this.oppSide(this.mySide);
        events.push({
          min: G.rndInt(15, 85),
          type,
          side: type === "yourChance" ? this.mySide : gkSide,
          out: null,
          forced: true,
        });
      }
    } else if (this.player && bench && M().totalMinutes - subMinute >= 8) {
      const type = role === "POR" ? "gkRoll" : "yourChance";
      if (!events.some((e) => e.type === type)) {
        const gkSide = this.oppSide(this.mySide);
        events.push({
          min: G.rndInt(subMinute + 2, M().totalMinutes),
          type,
          side: type === "yourChance" ? this.mySide : gkSide,
          out: null,
          forced: true,
        });
      }
    }

    events.sort((x, y) => x.min - y.min);
    events.unshift({ min: 1, type: "kickoff", side: null, out: null, forced: true });
    events.push({ min: M().totalMinutes, type: "whistle", side: null, out: null, forced: true });
    this.events = events;
  };

  /* Resuelve una ocasión genérica (sin tu intervención) */
  G.MatchEngine.prototype._resolveChance = function (side) {
    const opp = this.oppSide(side);
    const atk = this.strOf(side), def = this.strOf(opp);
    const pOnTarget = G.clamp(0.62 + (atk - def) * 0.004, 0.36, 0.82);
    if (G.chance(pOnTarget)) {
      const pGoal = G.clamp(0.34 + (atk - def) * 0.009, 0.08, 0.62);
      return G.chance(pGoal) ? { result: "goal", side } : { result: "save", side };
    }
    return { result: "miss", side };
  };

  /* ---------------- ejecución ---------------- */
  G.MatchEngine.prototype.step = function () {
    if (this.done) return false;
    if (this._i >= this.events.length) { this.done = true; return false; }
    const ev = this.events[this._i++];
    this._curMin = ev.min;
    if (ev.type === "kickoff") {
      this.msgQueue.push("🏁 ¡Arrancó el partido!");
    } else if (ev.type === "sub") {
      this.msgQueue.push(G.matchText("sub", { P: this.player.name, T: this.ownClub().short }));
    } else if (ev.type === "whistle") {
      this.msgQueue.push("⏱️ ¡Final del partido!");
      this.done = true;
      return true;
    } else {
      this._dispatch(ev);
    }
    return true;
  };

  G.MatchEngine.prototype._dispatch = function (ev) {
    const A = this.home.club.short, B = this.away.club.short;
    const vars = {
      A, B,
      P: this.player ? this.player.name : "",
      T: this.ownClub().short,
      R: this.clubOf(this.oppSide(ev.side)).short,
    };
    switch (ev.type) {
      case "filler":
        this.msgQueue.push(G.matchText("filler", vars));
        break;
      case "chance":
        this._applyChance(ev.out.side, ev.out.result, vars);
        break;
      case "yourChance":
        this.pendingChoice = { kind: "action", ev };
        this.choices = this._actionChoices();
        this.msgQueue.push(G.matchText("yourChanceIntro", { P: this.player.name }));
        this.needChoice = true;
        break;
      case "gkRoll":
        this.pendingChoice = { kind: "gk", ev };
        this.choices = [
          { id: "L", label: "Izquierda", icon: "⬅️" },
          { id: "C", label: "Centro", icon: "🎯" },
          { id: "R", label: "Derecha", icon: "➡️" },
        ];
        this.msgQueue.push(G.matchText("gkIntro", { P: this.player.name, R: vars.R }));
        this.needChoice = true;
        break;
    }
  };

  G.MatchEngine.prototype._applyChance = function (side, result, vars) {
    const A = this.home.club.short, B = this.away.club.short;
    const scorer = side === "home" ? A : B;
    const keeper = side === "home" ? B : A;
    if (result === "goal") {
      this.msgQueue.push(G.matchText("chanceGoal", { A: scorer }));
      this._goal(side, scorer);
    } else if (result === "save") {
      this.msgQueue.push(G.matchText("chanceSave", { A: scorer, B: keeper }));
    } else {
      this.msgQueue.push(G.matchText("chanceMiss", { A: scorer }));
    }
  };

  G.MatchEngine.prototype._goal = function (side, scorer, byPlayer) {
    this.goals.push({ min: this._curMin || 0, side, byPlayer });
    if (side === "home") this.args.gh++; else this.args.ga++;
    if (!byPlayer) this.msgQueue.push("⚽ " + scorer + " " + this.goals.length + "º gol");
  };

  /* ---------------- tus decisiones ---------------- */
  G.MatchEngine.prototype._actionChoices = function () {
    const role = this.player.pos;
    if (role === "DEL") return [
      { id: "shoot", label: "Disparar", icon: "🎯", desc: "Remate al arco" },
      { id: "dribble", label: "Regatear", icon: "🪄", desc: "Buscarte el gol" },
      { id: "pass", label: "Pasar", icon: "🎳", desc: "Habilitar a tu compañero" },
    ];
    if (role === "MED") return [
      { id: "pass", label: "Pasar", icon: "🎳", desc: "Habilitación de gol" },
      { id: "shoot", label: "Disparar", icon: "🎯", desc: "Remate desde fuera" },
      { id: "dribble", label: "Regatear", icon: "🪄", desc: "Desbordar hacia el área" },
    ];
    return [
      { id: "pass", label: "Pasar", icon: "🎳", desc: "Circulación segura" },
      { id: "clear", label: "Proyectarse", icon: "🛡️", desc: "Sumarte al ataque" },
      { id: "dribble", label: "Regatear", icon: "🪄", desc: "Ganar metros" },
    ];
  };

  G.MatchEngine.prototype.choose = function (choiceId) {
    if (!this.pendingChoice) return;
    const pc = this.pendingChoice;
    this.pendingChoice = null;
    this.needChoice = false;
    this.choices = null;
    if (pc.kind === "gk") this._gkChoice(pc.ev, choiceId);
    else this._actionChoice(pc.ev, choiceId);
  };

  G.MatchEngine.prototype._actionChoice = function (ev, id) {
    const P = this.player;
    const oppClubShort = this.clubOf(this.oppSide(this.mySide)).short;

    if (id === "clear") {
      this.msgQueue.push(G.matchText("yourClear", { P: P.name }));
      return;
    }
    if (id === "shoot") {
      const pOnTarget = G.clamp(0.62 + (P.attrs.tir - 50) * 0.006, 0.35, 0.85);
      if (!G.chance(pOnTarget)) {
        this.msgQueue.push(G.matchText("yourMiss", { P: P.name }));
        return;
      }
      const diff = this.strOf(this.mySide) - this.strOf(this.oppSide(this.mySide));
      const pGoal = G.clamp(0.2 + (P.attrs.tir - 50) * 0.006 + diff * 0.004, 0.06, 0.52);
      if (G.chance(pGoal)) {
        this.stats.goals++;
        this.msgQueue.push(G.matchText("yourGoal", { P: P.name, T: this.ownClub().short }));
        this._goal(this.mySide, P.name, true);
        return;
      }
      if (G.chance(0.65)) this.msgQueue.push(G.matchText("yourSaved", { P: P.name }));
      else this.msgQueue.push(G.matchText("yourBlocked", { P: P.name }));
      return;
    }
    if (id === "pass") {
      const pAssist = G.clamp(0.16 + (P.attrs.pas - 50) / 60, 0.08, 0.38);
      if (G.chance(pAssist)) {
        this.stats.assists++;
        this.msgQueue.push(G.matchText("yourAssist", { P: P.name, T: this.ownClub().short }));
        this._goal(this.mySide, this.ownClub().short, false);
      } else {
        this.msgQueue.push(G.matchText("yourPassFail", { P: P.name }));
      }
      return;
    }
    if (id === "dribble") {
      const pGoal = G.clamp(0.1 + (P.attrs.reg - 50) / 75, 0.05, 0.32);
      if (G.chance(pGoal)) {
        this.stats.goals++;
        this.msgQueue.push(G.matchText("yourDribbleGoal", { P: P.name, T: this.ownClub().short }));
        this._goal(this.mySide, P.name, true);
        return;
      }
      this.msgQueue.push(G.matchText("yourLost", { P: P.name }));
      if (G.chance(0.4)) {
        this.msgQueue.push(G.matchText("yourCounter", { P: P.name, R: oppClubShort }));
        this._goal(this.oppSide(this.mySide), oppClubShort);
      }
      return;
    }
  };

  G.MatchEngine.prototype._gkChoice = function (ev, choice) {
    const P = this.player;
    const oppClub = this.clubOf(ev.side);
    const pOnTarget = G.clamp(0.5 + (this.strOf(ev.side) - this.strOf(this.mySide)) * 0.005, 0.3, 0.68);
    if (!G.chance(pOnTarget)) {
      this.msgQueue.push(G.matchText("gkOff", { R: oppClub.short, P: P.name }));
      return;
    }
    const roll = G.rnd();
    const shotSide = roll < 0.16 ? "C" : G.chance(0.5) ? "L" : "R";
    const por = P.attrs.por;
    let saveP;
    if (shotSide === choice) {
      saveP = G.clamp(0.58 + (por - 50) / 60, 0.42, 0.88);
    } else if (choice === "C" && shotSide !== "C") {
      saveP = 0.12;
    } else {
      saveP = G.clamp(0.12 + (por - 50) / 150, 0.08, 0.3);
    }
    const sideName = shotSide === "L" ? "izquierda" : shotSide === "R" ? "derecha" : "centrado";
    if (G.chance(saveP)) {
      this.stats.saves++;
      this.msgQueue.push(G.matchText("gkSave", { P: P.name, R: oppClub.short }));
      this.msgQueue.push((shotSide === choice ? "🎯 ¡Leíste el disparo!" : "🤏 El balón iba a la " + sideName + " y lo rozaste."));
    } else {
      this.stats.conceded++;
      this.msgQueue.push(G.matchText("gkConceded", { P: P.name, R: oppClub.short }));
      this.msgQueue.push("El balón entró por la " + sideName + ".");
      this._goal(ev.side, oppClub.short);
    }
  };

  /* ---------------- resumen ---------------- */
  G.MatchEngine.prototype.quick = function () {
    let guard = 0;
    while (!this.done && guard++ < 500) {
      if (this.needChoice) {
        const pc = this.pendingChoice;
        if (pc && pc.kind === "gk") {
          this.choose(G.pick(["L", "C", "R"]));
        } else if (pc) {
          const r = Math.random();
          let id = r < 0.45 ? "pass" : r < 0.75 ? "shoot" : "dribble";
          if (this.player.pos === "DEF" && id !== "pass") id = "clear";
          this.choose(id);
        }
      } else {
        this.step();
      }
    }
    return this.summary();
  };

  G.MatchEngine.prototype.summary = function () {
    const me = this.args.gh === this.args.ga ? "D"
      : (this.mySide === "home") === (this.args.gh > this.args.ga) ? "W" : "L";
    let r = M().ratingBase;
    r += this.stats.goals * 1.7;
    r += this.stats.assists * 0.7;
    r += this.stats.saves * 0.12;
    if (this.player && this.player.pos === "POR") r -= this.stats.conceded * 0.18;
    if (me === "W") r += 0.3;
    if (me === "L") r -= 0.25;
    if (this.cleanSheet()) r += 0.25;
    r = Math.round(G.clamp(r, 1, 10) * 10) / 10;
    this.rating = r;
    return {
      gh: this.args.gh,
      ga: this.args.ga,
      goals: this.goals.slice(),
      stats: Object.assign({}, this.stats),
      rating: r,
      result: me,
      cleanSheet: this.cleanSheet(),
    };
  };

  G.MatchEngine.prototype.cleanSheet = function () {
    if (!this.player || this.player.pos !== "POR") return false;
    return this.mySide === "home" ? this.args.ga === 0 : this.args.gh === 0;
  };

  G.MatchEngine.prototype.drainMsg = function () {
    return this.msgQueue.splice(0, this.msgQueue.length);
  };

  G.MatchEngine.prototype.sideScore = function () {
    return this.ownClub().name;
  };
})();