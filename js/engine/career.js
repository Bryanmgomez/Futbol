/* ============================================================
   CAREER — temporada, jornadas, selección, traspasos, fin de año.
   ============================================================ */
(function () {
  const G = (window.G = window.G || {});
  const CFG = () => G.config;

  /* Fuerza base de cada selección nacional por país */
  const NAT_STR = {
    ar: 78, br: 78, uy: 76, co: 75, ec: 72, cl: 71, py: 70, pe: 69, ve: 67, bo: 64,
    es: 85, en: 86, it: 85, de: 85, fr: 85, pt: 79, nl: 77,
    mx: 73, us: 69,
    cn: 65, jp: 72, ru: 72,
    ot: 70,
  };
  const CODE3 = {
    ar: "ARG", br: "BRA", co: "COL", cl: "CHI", pe: "PER", uy: "URU", ec: "ECU", py: "PAR", bo: "BOL", ve: "VEN",
    es: "ESP", en: "ENG", it: "ITA", de: "GER", fr: "FRA", pt: "POR", nl: "NED",
    mx: "MEX", us: "USA",
    cn: "CHN", jp: "JPN", ru: "RUS",
    ot: "INT",
  };
  const FLAG_OF = (code) => {
    const lg = G.leagues.find((l) => l.code === code);
    return lg ? lg.flag : "🌎";
  };

  /* ---------------- CONFEDERACIONES ------------------------------- */
  G.confOfLeague = function (leagueId) {
    const lg = G.leagueIndex[leagueId];
    return (lg && (lg.conf || "CONMEBOL")) || "CONMEBOL";
  };

  G.confLabel = function (conf) {
    return (G.config.CONF && G.config.CONF[conf] && G.config.CONF[conf].label) || conf || "CONMEBOL";
  };

  // Copas asignadas a una confederación (respeta los switches CONMEBOL).
  G.cupDefsFor = function (conf) {
    const all = (G.config.CUP_DEFS && G.config.CUP_DEFS[conf]) || (G.config.CUP_DEFS && G.config.CUP_DEFS.CONMEBOL) || [];
    return all
      .map((d) => {
        const enabled = conf === "CONMEBOL"
          ? (d.key === "libertadores" ? G.config.CONTINENTAL_ENABLED : G.config.SUDAMERICANA_ENABLED)
          : !!G.config.CONTINENTAL_ENABLED; // master switch global
        return Object.assign({}, d, { enabled, minTeams: d.minTeams || 2, spots: d.spots || 8 });
      })
      .filter((d) => d.enabled);
  };

  /* ---------------- SUELDOS Y VALORES ------------------------------ */
  G.salaryFor = function (club, player) {
    const s = CFG().SALARY_BASE + player.ovr * CFG().SALARY_PER_OVR;
    const factor = 0.7 + Math.max(0, club.ovr - 58) * 0.035;
    return Math.round((s * factor) / 10000) * 10000;
  };

  /* ---------------- INTELIGENCIA DE SELECCIÓN ---------------------- */
  G.nationalStrengthOf = function (career) {
    const code = career.meta.code;
    const base = NAT_STR[code] || 70;
    return G.clamp(Math.round(base + Math.max(0, (career.player.ovr - 66) / 2)), 55, 92);
  };

  G.nationalTeam = function (career) {
    const code = career.meta.code;
    return {
      id: "nat-" + code,
      name: "Selección " + (career.meta.country),
      short: CODE3[code] || "INT",
      flag: FLAG_OF(code),
      ovr: career.intl.strength,
      color: "#2d6a4f",
      color2: "#ffffff",
      stadium: "Sede neutral",
      city: "",
      titles: 0,
      isNational: true,
    };
  };

  /* ---------------- INICIO DE CARRERA ------------------------------ */
  G.startCareer = function (meta, player, leagueId, clubId, difficulty, contractYears) {
    const st = G.newState();
    st.meta = meta;
    st.player = player;
    st.leagueId = leagueId;
    st.clubId = clubId;
    st.difficulty = difficulty;
    const club = G.clubsIndex[clubId];
    st.contract = {
      clubId,
      yearsLeft: contractYears || CFG().defaultContractYears,
      totalYears: contractYears || CFG().defaultContractYears,
      salary: G.salaryFor(club, player),
      type: "pro",
    };
    st.clubHistory = [{ clubId, leagueId, year: 2026 - 1 }];
    st.career = {
      seasonNumber: 1,
      startYear: 2026,
      totals: { apps: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, sumRatings: 0, nRatings: 0 },
      history: [],
      titles: [],
      conducted: [clubId],
    };
    st.intl = { caps: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0, selected: false, strength: 0, yearsSelected: 0 };
    G.state = st;
    G.setupSeason(st, 2026);
    G.save();
    return st;
  };

  /* ---------------- NUEVA TEMPORADA -------------------------------- */
  G.setupSeason = function (st, year) {
    // si venía de una cesión que ya terminó: vuelve a su club de origen
    // (se hace ANTES de generar plantilla/fixtures con el club correcto)
    if (st.loan && st.loan.untilYear < year) {
      st.clubId = st.loan.parentClubId;
      st.leagueId = st.loan.parentLeagueId;
      st.loan = null;
      st.contract = { clubId: st.clubId, yearsLeft: 2, totalYears: 2, salary: G.salaryFor(G.clubsIndex[st.clubId], st.player), type: "pro" };
      G.save();
    }
    const league = G.leagueIndex[st.leagueId];
    const club = G.clubsIndex[st.clubId];
    const rounds = CFG().ROUNDS_PER_LEAGUE;

    const { fixtures, perRound, totalRounds } = G.buildFixtures(st.leagueId, rounds);
    fixtures.forEach((fx) => {
      if (fx.home === st.clubId || fx.away === st.clubId) fx.mine = true;
    });

    // plantilla regenerada (determinista: misma plantilla en una partida dada)
    const squad = G.generateSquad(club, league, year);
    const status = G.starterStatus(squad, st.player);

    // selección nacional
    st.intl.selected = st.player.ovr >= CFG().INTl_MIN_OVR;
    st.intl.strength = G.nationalStrengthOf(st);
    if (st.intl.selected) st.intl.yearsSelected++;

    // agenda de la temporada
    const order = [];
    for (let r = 1; r <= totalRounds; r++) order.push({ type: "round", round: r });
    const mid = Math.floor(totalRounds / 2);
    order.splice(mid, 0, { type: "intl", kind: "friendly" });
    if (G.config.WINTER_TRANSFERS) order.splice(mid + 1, 0, { type: "transfer-window" });
    const tg = (kind, stage) => ({ type: "intl", kind, stage });
    if (st.career.seasonNumber % CFG().WORLD_CUP_EVERY === 0) {
      order.push(tg("wc", "sf1"), tg("wc", "sf2"), tg("wc", "final"));
    } else if (st.career.seasonNumber % CFG().COPA_AMERICA_EVERY === 0) {
      order.push(tg("copa", "sf1"), tg("copa", "sf2"), tg("copa", "final"));
    } else {
      order.push({ type: "intl", kind: "friendly" });
    }
    order.push({ type: "season-end", round: totalRounds });

    st.season = {
      year,
      perRound,
      totalRounds,
      fixtures,
      table: G.newTable(st.leagueId),
      squad,
      starterStatus: status.status,
      myStats: { apps: 0, goals: 0, assists: 0, saves: 0, conceded: 0, sumRatings: 0, nRatings: 0, cleanSheets: 0 },
      eventQueue: order,
      eventIdx: 0,
      tournament: null,
      activeFixture: null,
      activeIntl: null,
      clubSquads: {},
      golden: { s: {}, a: {} },
      transferAsked: false,
      continentalInserted: false,
      continental: null,
      winterMarket: null,
      cups: {},
      cupInit: [],
      rumors: [],
      trainingSessions: G.config.TRAINING_SESSIONS_PER_SEASON || 0,
      expectations: null,
    };
st.player.injuredRounds = 0;
    st.pending = null;
    st.season.expectations = G.makeExpectations(st);
    G.save();
    return st;
  };

  /* ---------------- PRÓXIMO EVENTO -------------------------------- */
  G.currentEvent = function (st) {
    return st.season.eventQueue[st.season.eventIdx];
  };

  G.advanceEvent = function (st) {
    st.season.eventIdx++;
    const ev = G.currentEvent(st);
    if (ev && ev.type === "round") {
      // la jornada jugada renueva energía: recupera 1 sesión de
      // entrenamiento (hasta el tope de la temporada).
      const cap = G.config.TRAINING_SESSIONS_PER_SEASON || 0;
      if (st.season.trainingSessions < cap) {
        st.season.trainingSessions = Math.min(cap, (st.season.trainingSessions || 0) + 1);
      }
    }
    if (ev && ev.type === "round" && G.config.RUMORS_ENABLED && ev.round && ev.round % G.config.RUMORS_EVERY === 0) {
      G.genRumors(st); // nueva oleada de rumores
    }
    G.save();
    return ev;
  };

  // ¿El jugador empieza titular o entra de cambio?
  G.matchEntry = function (st) {
    const status = st.season.starterStatus;
    const squad = st.season.squad;
    if (status === "starter") {
      const xi = G.bestXI(squad);
      return { bench: false, xi };
    }
    return { bench: true, xi: null };
  };

  /* ---------------- PARTIDO DE TU CLUB ---------------------------- */
  // Encuentra y "activa" el partido de tu club de la ronda actual.
  G.activeClubMatch = function (st) {
    const ev = G.currentEvent(st);
    const fx = st.season.fixtures.find((f) => f.round === ev.round && f.mine && !f.played);
    st.season.activeFixture = fx;
    return fx;
  };

  G.clubMatchEngineOpts = function (st, fx) {
    const club = G.clubsIndex[st.clubId];
    const me = fx.home === st.clubId;
    const entry = G.matchEntry(st);
    return {
      home: { club: G.clubsIndex[fx.home], isMine: fx.home === st.clubId },
      away: { club: G.clubsIndex[fx.away], isMine: fx.away === st.clubId },
      myPlayer: st.player,
      mySide: me ? "home" : "away",
      bench: entry.bench,
      subMinute: CFG().MATCH.subMinute,
      difficulty: CFG().DIFFICULTY[st.difficulty].ai,
      neutral: false,
      national: false,
    };
  };

  // Aplica el resultado de TU partido + simula el resto de la ronda.
  G.resolveClubMatch = function (st, engine) {
    const fx = st.season.activeFixture;
    const s = engine.summary();
    fx.played = true;
    fx.gh = s.gh;
    fx.ga = s.ga;
    fx.scorers = s.goals
      .filter((g) => g.byPlayer)
      .map((g) => ({ min: g.min, name: st.player.name }));
    G.applyResultTable(st.season.table, fx.home, fx.away, s.gh, s.ga);

    const ms = st.season.myStats;
    ms.apps++;
    ms.sumRatings += s.rating;
    ms.nRatings++;
    ms.goals += s.stats.goals;
    ms.assists += s.stats.assists;
    ms.saves += s.stats.saves;
    ms.conceded += s.stats.conceded;
    if (s.cleanSheet) ms.cleanSheets++;

    const t = st.career.totals;
    t.apps++; t.goals += s.stats.goals; t.assists += s.stats.assists;
    t.saves += s.stats.saves;
    if (s.cleanSheet) t.cleanSheets++;
    t.sumRatings += s.rating; t.nRatings++;

    G.simulateRound(st, fx.round);
    if (G.config.GOLDEN_BOOT) G.attributeScorers(st, fx);
    G.rollInjury(st);
    G.save();
    return s;
  };

  /* ---------------- LESIONES --------------------------------------- */
  // Tras un partido jugado hay una probabilidad de lesionarte y perder
  // entre INJURY_RANGE jornadas (esas jornadas se simulan solas).
  G.rollInjury = function (st) {
    if (!G.config.INJURY_CHANCE || st.player.injuredRounds > 0) return; // ya lesionado: no se re-roll
    if (G.chance(G.config.INJURY_CHANCE)) {
      const [min, max] = G.config.INJURY_RANGE;
      st.player.injuredRounds = G.rndInt(min, max);
      st.player.injuryNote = "Lesión muscular";
      G.save();
    }
  };

  /* ---------------- NORMALIZAR PARTIDAS VIEJAS --------------------- */
  // Pobla campos nuevos de temporadas guardadas antes de estas funciones.
  G.ensureSeasonExtras = function (st) {
    if (!st || !st.season) return;
    const s = st.season;
    if (!s.clubSquads) s.clubSquads = {};
    if (!s.golden) s.golden = { s: {}, a: {} };
    if (typeof s.transferAsked !== "boolean") s.transferAsked = false;
    if (typeof s.continentalInserted !== "boolean") s.continentalInserted = false;
    if (!s.continental) s.continental = null;
    if (s.winterMarket === undefined) s.winterMarket = null;
    if (!s.cups) s.cups = {};
    if (!s.cupInit) s.cupInit = [];
    if (!s.rumors) s.rumors = [];
    if (typeof s.trainingSessions !== "number") s.trainingSessions = G.config.TRAINING_SESSIONS_PER_SEASON || 0;
    if (!s.expectations) s.expectations = G.makeExpectations(st);
    if (!st.player.injuredRounds) st.player.injuredRounds = 0;
    if (!st.career.bonusIncome) st.career.bonusIncome = 0;
  };

  /* ---------------- PARTIDOS INTERNACIONALES ---------------------- */
  G.isTournamentEvent = (ev) => ["wc", "copa"].indexOf(ev.kind) !== -1;

  // Crea el "club" selección de un país.
  function nativeTeam(code) {
    const lg = G.leagues.find((l) => l.code === code);
    return {
      id: "nat-" + code,
      name: lg ? "Selección " + lg.country : "Selección Internacional",
      short: CODE3[code] || "INT",
      flag: lg ? lg.flag : "🌎",
      ovr: (NAT_STR[code] || 70) + G.rndInt(-2, 2),
      color: lg ? lg.color : "#2d6a4f",
      color2: "#ffffff",
      isNational: true,
    };
  }

  /* Construye el próximo partido internacional según el evento actual.
     Devuelve un objeto "intl" con {sim:false,...} o {sim:true,...} */
  G.activeIntlMatch = function (st) {
    const ev = G.currentEvent(st);
    const me = G.nationalTeam(st);
    const others = G.leagues
      .map((l) => l.code)
      .filter((c) => c !== st.meta.code && c !== "ot");
    const picked = G.pick(others);

    if (G.isTournamentEvent(ev)) {
      if (!st.season.tournament) {
        const rivals = G.shuffle(others).slice(0, 3).map(nativeTeam);
        st.season.tournament = {
          kind: ev.kind,
          teams: [me, rivals[0], rivals[1], rivals[2]],
          sf1: null, sf2: null, winner: null,
        };
      }
      const tour = st.season.tournament;
      const simMatch = (a, b) => {
        const r = G.simIntl(a.ovr, b.ovr);
        const w = r.gh > r.ga ? (r.gh > r.ga ? a : b) : null;
        return { a, b, gh: r.gh, ga: r.ga, winner: r.gh === r.ga ? null : (r.gh > r.ga ? a : b) };
      };

      if (ev.stage === "sf1") {
        if (!tour.sf1) {
          const r = simMatch(tour.teams[0], tour.teams[1]);
          // la semifinal 1 La juega TÚ: marca pendiente de jugar
          tour.sf1 = { a: tour.teams[0], b: tour.teams[1], played: false, pending: true };
        }
        st.season.activeIntl = { sim: false, ev, me: tour.teams[0], opp: tour.teams[1], key: "sf1" };
      } else if (ev.stage === "sf2") {
        if (!tour.sf2) tour.sf2 = simMatch(tour.teams[2], tour.teams[3]);
        st.season.activeIntl = { sim: true, ev, me: tour.teams[0], opp: tour.sf2, key: "sf2", result: tour.sf2 };
      } else {
        // final
        const sf1w = tour.sf1 && tour.sf1.played ? tour.sf1.winner : null;
        const sf2w = tour.sf2 ? tour.sf2.winner : null;
        const finalA = sf1w, finalB = sf2w;
        st.season.activeIntl = {
          sim: finalA !== tour.teams[0],
          ev, me: tour.teams[0],
          opp: finalB || tour.teams[2],
          key: "final",
          result: null,
          opponents: { finalA, finalB },
        };
      }
      return st.season.activeIntl;
    }

    // amistoso
    const opp = nativeTeam(picked);
    st.season.activeIntl = { sim: false, ev, me, opp, key: "friendly" };
    return st.season.activeIntl;
  };

  G.intlEngineOpts = function (st, intl) {
    return {
      home: { club: intl.me, isMine: true },
      away: { club: intl.opp, isMine: false },
      myPlayer: st.player,
      mySide: "home",
      bench: false,
      difficulty: CFG().DIFFICULTY[st.difficulty].ai,
      neutral: true,
      national: true,
    };
  };

  // Simula un partido internacional entre dos selecciones.
  G.simIntl = function (sa, sb) {
    return G.simMatchAI(Math.round(sa), Math.round(sb));
  };

  /* Aplica el resultado de un partido internacional (jugado o simulado). */
  G.resolveIntlMatch = function (st, engine) {
    const intl = st.season.activeIntl;
    const ev = intl.ev || {};
    const isTour = G.isTournamentEvent(ev);

    if (isTour) {
      const tour = st.season.tournament;
      if (intl.key === "sf1") {
        const s = engine.summary();
        const won = s.gh > s.ga ? intl.me : s.gh < s.ga ? intl.opp : (Math.random() < 0.5 ? intl.me : intl.opp);
        tour.sf1.played = true;
        tour.sf1.winner = won;
        tour.sf1F = won;
      } else if (intl.key === "sf2") {
        // ya simulado en activeIntlMatch
      } else if (intl.key === "final") {
        if (intl.sim) {
          const r = G.simIntl(intl.opponents.finalA.ovr, intl.opponents.finalB.ovr);
          const w = r.gh > r.ga ? intl.opponents.finalA : intl.opponents.finalB;
          tour.winner = w;
          if (w === intl.me) st.career.titles.push({ type: ev.kind, year: st.season.year, label: ev.kind === "wc" ? "🏆 Copa del Mundo" : "🏆 Copa América" });
        } else {
          const s = engine.summary();
          const won = s.gh > s.ga ? intl.me : s.gh < s.ga ? intl.opp : (Math.random() < 0.5 ? intl.me : intl.opp);
          tour.winner = won;
          if (won === intl.me) {
            st.career.titles.push({ type: ev.kind, year: st.season.year, label: ev.kind === "wc" ? "🏆 ¡CAMPEÓN DEL MUNDO!" : "🏆 ¡CAMPEÓN DE AMÉRICA!" });
          }
        }
      }
    }

    if (engine) {
      const s = engine.summary();
      const I = st.intl;
      I.caps++;
      I.goals += s.stats.goals;
      I.assists += s.stats.assists;
      I.saves += s.stats.saves;
      if (s.cleanSheet) I.cleanSheets++;
    }
    G.save();
    return engine ? engine.summary() : null;
  };

  // Evento internacional donde NO hay convocatoria: noticia simple.
  G.intlNewsWOP = function (st) {
    const ev = G.currentEvent(st);
    return ev.kind === "friendly"
      ? "Amistoso internacional: tu selección jugó sin ti."
      : "Torneo de selecciones: no te convocaron.";
  };

  /* ---------------- OBJETIVOS DE TEMPORADA ------------------------- */
  // Expectativas del club y del jugador según la fuerza del club y tu
  // media. Se marcan al empezar la temporada y se comprueban al final.
  G.makeExpectations = function (st) {
    if (!st || !st.season || !G.config.EXPECTATIONS_ENABLED) return null;
    const league = G.leagueIndex[st.leagueId];
    const club = G.clubsIndex[st.clubId];
    if (!league || !club) return null;
    const rank = league.clubs
      .slice()
      .sort((a, b) => b.ovr - a.ovr)
      .findIndex((c) => c.id === club.id) + 1;
    const n = league.clubs.length;
    const minPos = Math.round(G.clamp(rank * G.config.EXPECTATION_POS_MARGIN, 1, n));
    const goals = Math.max(G.config.EXPECTATION_MIN.goals, Math.round((st.player.ovr - 50) * G.config.EXPECTATION_GOALS_F));
    const assists = Math.max(G.config.EXPECTATION_MIN.assists, Math.round((st.player.ovr - 52) * G.config.EXPECTATION_ASSISTS_F));
    return { minPos, goals, assists };
  };

  G.checkExpectations = function (st, myPos) {
    const ex = st.season && st.season.expectations;
    if (!ex) return null;
    const ms = st.season.myStats;
    const metPos = myPos !== undefined && myPos <= ex.minPos;
    const metGoals = (ms.goals || 0) >= ex.goals;
    const metAssists = (ms.assists || 0) >= ex.assists;
    return {
      minPos: ex.minPos,
      goals: ex.goals,
      assists: ex.assists,
      metPos,
      metGoals,
      metAssists,
      allMet: metPos && metGoals && metAssists,
    };
  };

  /* ---------------- FIN DE TEMPORADA ------------------------------- */
  G.processSeasonEnd = function (st) {
    const season = st.season;
    const spots = G.finishSeasonTableInfo(st);
    const table = spots.table;
    const myPos = table.findIndex((x) => x.id === st.clubId) + 1;
    const myClub = G.clubsIndex[st.clubId];
    const isChampion = spots.champion === st.clubId;

    // resumen histórico
    const ms = season.myStats;
    const avgRating = ms.nRatings ? (ms.sumRatings / ms.nRatings).toFixed(1) : "—";
    st.career.history.push({
      year: season.year,
      seasonNumber: st.career.seasonNumber,
      clubId: st.clubId,
      leagueId: st.leagueId,
      apps: ms.apps,
      goals: ms.goals,
      assists: ms.assists,
      saves: ms.saves,
      rating: avgRating,
      position: myPos,
      champion: isChampion,
    });

    // títulos de liga
    if (isChampion) {
      st.career.titles.push({ type: "league", year: season.year, label: "Liga " + G.leagueIndex[st.leagueId].name + " (" + myClub.name + ")" });
      st.career.conducted.push(st.clubId);
    }

    // objetivos de temporada
    const ex = G.checkExpectations(st, myPos);
    const exMetAll = !!(ex && ex.allMet);
    if (exMetAll) {
      st.career.titles.push({ type: "award", year: season.year, label: "🎯 Objetivos de temporada superados" });
    }

    // Balón de Oro: gran fama + al menos un título este año
    let ballonDor = false;
    if (G.config.BALLON_DOR_ENABLED) {
      const seasonTitles = st.career.titles.filter((t) => t.year === season.year).length;
      if (G.fameOf(st) >= G.config.BALLON_DOR_MIN_FAME && seasonTitles >= G.config.BALLON_DOR_MIN_TITLES) {
        ballonDor = true;
        st.career.titles.push({ type: "award", year: season.year, label: "🏆 Balón de Oro" });
      }
    }

    // rally de ofertas
    const offers = G.generateOffers(st);
    if (G.config.LOANS_ENABLED) {
      G.genLoanOffers(st).forEach((o) => offers.push(o));
    }

    // renovación del club actual (mejora si cumpliste los objetivos)
    let renewalSalary = G.salaryFor(myClub, st.player);
    if (exMetAll && G.config.EXPECTATION_RENEWAL_MULT) {
      renewalSalary = Math.round((renewalSalary * G.config.EXPECTATION_RENEWAL_MULT) / 10000) * 10000;
    }
    const renewal = {
      club: myClub,
      salary: renewalSalary,
      years: [CFG().defaultContractYears, CFG().defaultContractYears + 1],
      type: "renewal",
      boosted: exMetAll,
    };
    if (!offers.some((o) => o.club.id === st.clubId)) offers.unshift(renewal);

    st.pending = {
      type: "season-end",
      spots,
      myPos,
      summary: { apps: ms.apps, goals: ms.goals, assists: ms.assists, saves: ms.saves, rating: avgRating, champion: isChampion },
      contractStatus: st.contract.yearsLeft <= 0 ? "expired" : st.contract.yearsLeft === 1 ? "last" : "ok",
      offers,
      reputation: G.reputationOf(st),
      goldenBoot: G.config.GOLDEN_BOOT ? G.goldenLeaders(st, "s", 1)[0] || null : null,
      bonusIncome: st.career.bonusIncome || 0,
      expectations: ex,
      ballonDor,
    };
    st.contract.yearsLeft = Math.max(0, st.contract.yearsLeft - 1);
    G.save();
    return st.pending;
  };

  G.reputationOf = function (st) {
    const ovr = st.player.ovr;
    if (ovr >= 88) return "Leyenda";
    if (ovr >= 82) return "Estrella mundial";
    if (ovr >= 76) return "Figura continental";
    if (ovr >= 70) return "Jugador destacado";
    return ovr >= 62 ? "Promesa" : "Joven en formación";
  };

  /* ---------------- OFERTAS DE TRASPASO --------------------------- */
  G.generateOffers = function (st) {
    const player = st.player;
    const code = st.meta.code;
    const offerProb = G.clamp((player.ovr - 66) / 16, 0, 1) * 0.95;
    const candidates = [];
    for (const lg of G.leagues) {
      if (lg.id === st.leagueId) continue;
      for (const c of lg.clubs) {
        if (c.id === st.clubId) continue;
        candidates.push(Object.assign({ league: lg }, c));
      }
    }
    candidates.sort((a, b) => (b.ovr + b.titles * 0.4) - (a.ovr + a.titles * 0.4));
    const shortlist = candidates.filter((c) => c.ovr + c.titles * 0.4 >= player.ovr - 6);
    const pool = shortlist.length ? shortlist : candidates.slice(0, 6);

    const offers = [];
    for (let i = 0; i < pool.length && offers.length < 3; i++) {
      if (!G.chance(offerProb)) continue;
      if (G.clubsIndex[pool[i].id].ovr < 58 && Math.random() > 0.3) continue;
      offers.push({
        club: pool[i],
        salary: G.salaryFor(pool[i], player),
        years: [CFG().defaultContractYears, CFG().defaultContractYears + 1][i % 2] || CFG().defaultContractYears,
        type: "offer",
      });
    }
    // posible interés extranjero de élite (el grande de la liga más fuerte)
    if (player.ovr >= 80 && offers.length < 3 && G.chance(0.4)) {
      const topLeague = G.leagues.slice().sort((a, b) => (b.clubs[0] ? b.clubs[0].ovr : 0) - (a.clubs[0] ? a.clubs[0].ovr : 0))[0];
      const top = topLeague && topLeague.clubs[0];
      if (top) offers.push({ club: Object.assign({ league: topLeague }, top), salary: G.salaryFor(top, player) * 1.2, years: 4, type: "elite" });
    }
    return offers;
  };

  // Acepta una oferta o renovación.
  G.acceptContract = function (st, offer, years, clubId) {
    const club = G.clubsIndex[clubId] || offer.club;
    const league = G.leagues.find((lg) => lg.clubIds.indexOf(clubId) !== -1);
    if (st.clubId !== clubId) {
      st.clubHistory.push({ clubId, leagueId: league.id, year: st.season.year });
    }
    st.clubId = clubId;
    st.leagueId = league.id;
    st.contract = {
      clubId,
      yearsLeft: years,
      totalYears: years,
      salary: offer.salary,
      type: offer.type || "pro",
    };
    if (offer.bonus) {
      if (!st.career.bonusIncome) st.career.bonusIncome = 0;
      st.career.bonusIncome += offer.bonus;
    }
    G.save();
  };

  /* ---------------- AVANZAR A LA SIGUIENTE TEMPORADA -------------- */
  G.advanceSeason = function (st) {
    st.career.seasonNumber++;
    // crecimiento anual del jugador
    const growth = G.applyGrowth(st.player);
    const newYear = st.season.year + 1;
    G.setupSeason(st, newYear);
    return { growth, year: newYear };
  };

  /* ---------------- CAMBIO EN MID-SEASON (traspaso de invierno) --- */
  // Reasigna qué partidos son los del jugador (tras un traspaso).
  G.reassignMine = function (st) {
    for (const fx of st.season.fixtures) {
      if (!fx.played) fx.mine = fx.home === st.clubId || fx.away === st.clubId;
    }
  };

  // Genera ofertas de la ventana de invierno: solo clubes de TU liga
  // (así el fixture y la tabla siguen siendo válidos).
  G.genWinterOffers = function (st) {
    const player = st.player;
    const league = G.leagueIndex[st.leagueId];
    const myClub = G.clubsIndex[st.clubId];
    const candidates = league.clubs
      .filter((c) => c.id !== st.clubId)
      .sort((a, b) => (b.ovr + b.titles * 0.4) - (a.ovr + a.titles * 0.4));
    // probabilidad base de recibir interés según tu media
    const baseP = G.clamp((player.ovr - 64) / 18, 0, 1) * 0.95;
    const mv = G.marketValue(player);
    const offers = [];
    for (const c of candidates) {
      if (offers.length >= G.config.WINTER_MAX_OFFERS) break;
      if (!G.chance(baseP)) continue;
      const [fmin, fmax] = G.config.WINTER_FEE_MULT;
      const fee = Math.round((mv * (fmin + Math.random() * (fmax - fmin)) / 10) / 50000) * 50000;
      const bonus = Math.round((fee * G.config.WINTER_BONUS_PERCENT) / 10000) * 10000;
      offers.push({
        club: c,
        salary: G.salaryFor(c, player),
        years: G.config.CONTRACT_YEARS[1 + G.rndInt(0, 2)], // 2 a 4 años
        fee,
        bonus,
        type: "winter",
      });
    }
    // posible cesión a un club de la liga con más nivel
    if (G.config.LOANS_ENABLED && player.ovr >= 62) {
      const stronger = candidates.find((c) => c.ovr > G.clubsIndex[st.clubId].ovr);
      if (stronger && G.chance(0.5)) {
        offers.push({
          club: stronger,
          salary: G.salaryFor(stronger, player),
          years: 1,
          fee: 0,
          bonus: 0,
          type: "winter",
          loan: true,
          seasonYears: G.config.LOAN_YEARS[0],
        });
      }
    }
    return offers;
  };

  // Abre el mercado de invierno (evento de la agenda).
  G.startWinterMarket = function (st) {
    if (!st.season.winterMarket) {
      st.season.winterMarket = { source: "window", offers: G.genWinterOffers(st) };
      G.save();
    }
    return st.season.winterMarket;
  };

  // Solicitud manual de traspaso (una vez por temporada desde Contrato).
  G.requestTransfer = function (st) {
    if (st.season.transferAsked) return null;
    st.season.transferAsked = true;
    st.season.winterMarket = { source: "asked", offers: G.genWinterOffers(st) };
    G.save();
    return st.season.winterMarket;
  };

  // Acepta un traspaso de invierno (mismo campeonato → fixture intacto).
  G.acceptTransferWinter = function (st, offer) {
    G.acceptContract(st, offer, offer.years, offer.club.id);
    st.season.squad = G.squadFor(st, offer.club.id); // plantilla del nuevo club
    st.season.starterStatus = G.starterStatus(st.season.squad, st.player).status;
    G.reassignMine(st);
    st.season.activeFixture = null;
    G.save();
  };

  // Cierra el mercado y (si aplica) arma la copa continental.
  G.closeWinterMarket = function (st) {
    st.season.winterMarket = null;
    G.save();
  };

  /* ---------------- COPA CONTINENTAL (bracket genérico) ------------- */
  // Los mejores de la liga (mejores puestos de la tabla al cerrar el
  // mercado) juegan una copa de eliminación directa a un partido.
  // Se soportan dos torneos independientes en el mismo !st! capa:
  //   st.season.cups = { [tourKey]: <estado de copa>, ... }
  // Cada torneo tiene su propio bracket y orden de etapas según nº equipos.

  const CUP_STAGE_NAMES = {
    oct: "Octavos de final",
    qf: "Cuartos de final",
    sf: "Semifinal",
    final: "Final",
  };

  function nextPow2(x) {
    let p = 2;
    while (p < x) p *= 2;
    return p;
  }

  // Orden de etapas para n equipos (con potencia de 2 de techo):
  // 2 → final · 3-4 → sf/final · 5-8 → qf/sf/final · 9-16 → oct/qf/sf/final
  function stagesFor(count) {
    const k = nextPow2(count);
    if (k <= 2) return ["final"];
    if (k <= 4) return ["sf", "final"];
    if (k <= 8) return ["qf", "sf", "final"];
    return ["oct", "qf", "sf", "final"];
  }

  // Mayor potencia de 2 <= x (para recortar participantes al formato limpio).
  function floorPow2(x) {
    let p = 1;
    while (p * 2 <= x) p *= 2;
    return p;
  }

  // Crea un bracket de eliminación directa a un partido. Devuelve el
  // estado de la copa listo para avanzar etapa a etapa.
  G.makeCupBracket = function (teamIds, name) {
    const stages = stagesFor(teamIds.length);
    const k = nextPow2(teamIds.length);
    const byes = k - teamIds.length;      // equipos que no juegan la 1ª fase
    const sorted = teamIds.slice();
    // byes: los de mejor posición descansan la 1ª ronda
    const resting = sorted.slice(0, byes);
    const playing = sorted.slice(byes);
    // pares de la PRIMERA fase (las siguientes se rellenan con ganadores)
    const firstPairs = [];
    for (let i = 0; i < Math.floor(playing.length / 2); i++) {
      firstPairs.push([playing[i], playing[playing.length - 1 - i]]);
    }
    return {
      key: "liber",
      name,
      stages,
      teams: sorted.slice(),
      firstPairs,
      bye: resting,                 // mejor posición → descansan
      alive: sorted.slice(),        // equipos vivos (orden de siembra)
      winners: {},                  // {stage: [id,id,...]} ganadores por etapa
      pairs: {},                    // {stage: [[a,b],...]} emparejamientos
      champion: null,
      myAlive: true,
    };
  };

  // Empareja la lista de equipos vivos (mejor contra peor → centro del pitch).
  function pairsOf(list) {
    const o = [];
    for (let i = 0; i < list.length / 2; i++) o.push([list[i], list[list.length - 1 - i]]);
    return o;
  }

  // Fuerza/triunfo de un duelo entre clubes (local = primer equipo).
  function cupMatchInfo(a, b) {
    const sa = G.teamStrength(G.clubsIndex[a], { home: true });
    const sb = G.teamStrength(G.clubsIndex[b]);
    const r = G.simMatchAI(sa, sb);
    const winner = r.gh > r.ga ? a : r.gh < r.ga ? b : (G.chance(0.5) ? a : b);
    return { a, b, gh: r.gh, ga: r.ga, winner };
  }

  // Devuelve la información del partido de copa actual de un torneo.
  // {play:true, pair, opp} → juegas · {sim:true} → solo noticia.
  G.activeCupMatch = function (st, cup, stage) {
    // etapa no válida para este bracket (partidas viejas): solo noticia
    if (cup.stages.indexOf(stage) === -1) return { sim: true };
    // si ya no hay etapa guardada, la construimos con los vivos actuales
    if (!cup.pairs[stage]) {
      cup.pairs[stage] = pairsOf(cup.alive);
      cup.winners[stage] = cup.pairs[stage].map(() => null);
    }
    const pairList = cup.pairs[stage];
    const myIdx = pairList.findIndex((p) => p[0] === st.clubId || p[1] === st.clubId);
    const myPendiente = cup.myAlive && myIdx !== -1 && !cup.winners[stage][myIdx];
    // simula los demás partidos de la fase
    for (let i = 0; i < pairList.length; i++) {
      if (i !== myIdx || !myPendiente) {
        if (!cup.winners[stage][i]) cup.winners[stage][i] = cupMatchInfo(pairList[i][0], pairList[i][1]).winner;
      }
    }
    if (!myPendiente) {
      // si la final entera se resuelve por simulación, coronamos campeón
      if (stage === cup.stages[cup.stages.length - 1]) {
        cup.champion = cup.winners[stage][0];
      }
      return { sim: true };
    }
    const pair = pairList[myIdx];
    const opp = pair[0] === st.clubId ? pair[1] : pair[0];
    return { play: true, pair, opp, oppClub: G.clubsIndex[opp], meClub: G.clubsIndex[st.clubId] };
  };

  // Aplica el resultado de tu partido de copa y reduce el bracket.
  G.resolveCupMatch = function (st, cup, stage, engine) {
    const s = engine.summary();
    const myIdx = cup.pairs[stage].findIndex((p) => p[0] === st.clubId || p[1] === st.clubId);
    const [a, b] = cup.pairs[stage][myIdx];
    const winner = s.gh > s.ga ? a : s.gh < s.ga ? b : (G.chance(0.5) ? a : b);
    cup.winners[stage][myIdx] = winner;
    cup.myAlive = winner === st.clubId;

    // al terminar la fase: rearmar vivos para la siguiente
    const wins = cup.winners[stage];
    if (wins.every((w) => w)) {
      cup.alive = wins; // orden de ganadores → siembra repetida para siguiente fase

      // si es la final, se corona campeón
      if (stage === "final") {
        cup.champion = cup.alive[0];
        const me = st.clubId;
        if (cup.champion === me) {
          st.career.titles.push({ type: "cup", year: st.season.year, label: cup.name + " (" + G.clubsIndex[me].name + ")" });
        }
      }
    }
    G.save();
    return s;
  };

  // Opciones del motor para tu partido de copa.
  G.continentalEngineOpts = function (st, info) {
    const me = st.clubId;
    const [home, away] = info.pair;
    return {
      home: { club: G.clubsIndex[home], isMine: home === me },
      away: { club: G.clubsIndex[away], isMine: away === me },
      myPlayer: st.player,
      mySide: home === me ? "home" : "away",
      bench: false,
      difficulty: G.config.DIFFICULTY[st.difficulty].ai,
      neutral: false,
      national: false,
    };
  };

  // Construye los torneos insertados en la agenda a mitad de temporada.
  // Devuelve la lista de eventos insertados ({type:'continental', tour, stage}).
  // Las copas se eligen según la confederación de la liga del jugador.
  function buildCupEvents(st) {
    const table = G.sortedTable(st.season.table);
    const conf = G.confOfLeague(st.leagueId);
    const defs = G.cupDefsFor(conf);
    if (!defs.length) return null;
    const events = [];
    const orders = [];
    const used = [];

    for (const d of defs) {
      // plazas repartidas por la tabla (el campeón ya está en las primeras).
      // La reserva de plazas es fija aunque el jugador no clasifique a esa copa.
      const pool = table.filter((r) => used.indexOf(r.id) === -1).slice(0, d.spots).map((r) => r.id);
      used.push.apply(used, pool);
      const ids = pool.slice(0, floorPow2(pool.length));
      if (ids.length >= d.minTeams && ids.indexOf(st.clubId) !== -1) {
        const key = d.key;
        const stages = stagesFor(ids.length);
        stages.forEach((stage) => events.push({ type: "continental", tour: key, stage }));
        orders.push({ key, name: d.title, ids });
      }
    }

    if (!events.length) return null;
    st.season.cupInit = orders;
    st.season.continentalInserted = true;
    return events;
  }

  // Inserta la(s) copa(s) en la agenda si el club está clasificado.
  G.maybeInsertContinental = function (st) {
    if (st.season.continentalInserted) return false;
    const events = buildCupEvents(st);
    if (!events) return false;
    const ev = G.currentEvent(st);
    const idx = st.season.eventQueue.indexOf(ev);
    st.season.eventQueue.splice(idx + 1, 0, ...events);
    G.save();
    return true;
  };

  // Inicializa el estado de una copa concreta en su primer evento.
  G.cupBattle = function (st, tour) {
    const cup = st.season.cups && st.season.cups[tour];
    if (cup) return cup;
    const info = (st.season.cupInit || []).find((c) => c.key === tour);
    const ids = info ? info.ids : [st.clubId];
    const made = G.makeCupBracket(ids, (info && info.name) || "🏆 Copa");
    if (!st.season.cups) st.season.cups = {};
    st.season.cups[tour] = made;
    return made;
  };

  // Copa del evento actual (si el jugador participa en más de una).
  G.currentCup = function (st) {
    const ev = G.currentEvent(st);
    const defs = G.cupDefsFor(G.confOfLeague(st.leagueId));
    const fallback = (defs[0] && defs[0].key) || "libertadores";
    return G.cupBattle(st, (ev && ev.tour) || fallback);
  };

  /* ---------------- PRÉSTAMOS -------------------------------------- */
  // Ofertas de cesión: clubes de la MISMA liga con mayor o igual nivel
  // que el tuyo. Al ser una cesión no cambia tu contrato (vuelves al
  // club padre al terminar).
  G.genLoanOffers = function (st) {
    if (!G.config.LOANS_ENABLED) return [];
    const player = st.player;
    const league = G.leagueIndex[st.leagueId];
    const myClub = G.clubsIndex[st.clubId];
    const candidates = league.clubs
      .filter((c) => c.id !== st.clubId && c.ovr >= myClub.ovr)
      .sort((a, b) => (b.ovr + b.titles * 0.4) - (a.ovr + a.titles * 0.4));
    if (player.ovr < 62) return []; // muy joven/débil: nadie lo quiere cedido
    const offers = [];
    for (const c of candidates) {
      if (offers.length >= G.config.LOAN_MAX_OFFERS) break;
      if (!G.chance(G.clamp((player.ovr - 62) / 20, 0, 1))) continue;
      offers.push({
        club: c,
        seasonYears: G.config.LOAN_YEARS[G.rndInt(0, G.config.LOAN_YEARS.length - 1)],
        type: "loan",
      });
    }
    return offers;
  };

  // Acepta una cesión (no cambia el contrato; vuelves al final).
  G.acceptLoan = function (st, offer) {
    const fromClub = st.clubId;
    const fromLeague = st.leagueId;
    st.loan = {
      parentClubId: fromClub,
      parentLeagueId: fromLeague,
      destClubId: offer.club.id,
      untilYear: st.season.year + offer.seasonYears,
    };
    // cedido: juegas en el destino
    if (st.clubId !== offer.club.id) {
      st.clubHistory.push({ clubId: offer.club.id, leagueId: fromLeague, year: st.season.year, type: "loan" });
    }
    st.contract = {
      clubId: fromClub,
      yearsLeft: st.contract.yearsLeft,
      totalYears: st.contract.totalYears,
      salary: G.salaryFor(offer.club, st.player),
      type: "loan",
    };
    st.clubId = offer.club.id;
    st.season.squad = G.squadFor(st, offer.club.id);
    st.season.starterStatus = G.starterStatus(st.season.squad, st.player).status;
    G.reassignMine(st);
    st.season.activeFixture = null;
    G.save();
  };

  /* ---------------- ENTRENAMIENTO --------------------------------- */
  G.trainingSessionsLeft = function (st) {
    const s = st.season && st.season.trainingSessions;
    return Math.max(0, typeof s === "number" ? s : (G.config.TRAINING_SESSIONS_PER_SEASON || 0));
  };

  // Atributo clave para la posición del jugador (bonus de avanzance).
  G._isKeyAttr = function (st, key) {
    const keys = (G.config.TRAINING_POSITION_BONUS && G.config.TRAINING_POSITION_BONUS[st.player.pos]) || [];
    return keys.indexOf(key) !== -1;
  };

  // Probabilidad de éxito por ronda de drill: depende del atributo
  // actual, la edad (jóvenes aprenden mejor) y si es clave en tu posición.
  G._drillChance = function (st, key) {
    const v = st.player.attrs[key] || 50;
    let p = 0.32 + (v - 35) * 0.006;
    if (st.player.age <= G.config.TRAINING_YOUNG_AGE) p += 0.10;
    if (G._isKeyAttr(st, key)) p += 0.06;
    return G.clamp(p, 0.08, 0.92);
  };

  // Entrena un atributo: sesión de "drill" con TRAINING_DRILL_ROUNDS
  // rondas (cada éxito suma +1). Las sesiones se recuperan por jornada.
  // Pasando forcedGain puedes forzar la ganancia (uso interno/tests).
  G.trainAttribute = function (st, key, forcedGain) {
    const left = G.trainingSessionsLeft(st);
    if (!G.config.TRAINING_ENABLED || left <= 0) return { ok: false, msg: "No te quedan sesiones de entrenamiento" };
    const a = st.player.attrs;
    if (a[key] === undefined) return { ok: false, msg: "Atributo no válido" };
    const max = G.config.TRAINING_MAX_ATTR;
    if (a[key] >= max) return { ok: false, msg: "Ya alcanzaste el máximo de " + key.toUpperCase() };

    const before = a[key];
    const rounds = [];
    let gain = 0;
    if (forcedGain !== undefined) {
      gain = Math.max(1, Math.min(max - before, Math.round(+forcedGain)));
      for (let i = 0; i < gain; i++) rounds.push(true);
    } else {
      const p = G._drillChance(st, key);
      for (let i = 0; i < G.config.TRAINING_DRILL_ROUNDS; i++) {
        const hit = G.chance(p);
        rounds.push(hit);
        if (hit) gain += G.config.TRAINING_GROWTH_PER_SESSION;
      }
      // bonus joven si la sesión rindió en al menos una ronda
      if (gain > 0 && st.player.age <= G.config.TRAINING_YOUNG_AGE) {
        const bonus = G.config.TRAINING_YOUNG_BONUS || 0;
        if (bonus) { gain += bonus; rounds.push(true); }
      }
    }
    gain = Math.min(max, before + gain) - before;
    if (gain > 0) {
      a[key] += gain;
      st.player.ovr = G.ovr(a, st.player.pos);
      st.player.marketValue = G.marketValue(st.player);
    }
    st.season.trainingSessions = Math.max(0, left - 1);
    G.save();
    return {
      ok: true,
      attr: key,
      attrName: (G.config.ATTRIBUTES.find((x) => x.key === key) || {}).name,
      gain,
      rounds,
      sessionsLeft: Math.max(0, left - 1),
      chance: G.clamp(G._drillChance(st, key), 0.08, 0.92),
    };
  };

  /* ---------------- FAMA ------------------------------------------- */
  // Puntuación de fama 0-100: media ponderada + logros.
  G.fameOf = function (st) {
    const p = st.player;
    let v = G.clamp((p.ovr - 55) * 1.6, 0, 60); // media base
    const t = st.career.titles || [];
    v += t.filter((x) => x.type === "cup" || x.type === "continental").length * 7;
    v += t.filter((x) => x.type === "league").length * 6;
    v += t.filter((x) => x.type === "wc" || x.type === "copa").length * 10;
    v += t.filter((x) => x.type === "award").length * 5; // logros y Balón de Oro
    const caps = st.intl ? st.intl.caps : 0;
    v += G.clamp(caps / 8, 0, 12); // internacionalidad
    if (p.ovr >= 88) v += 8; // estrella mundial
    return Math.round(G.clamp(v, 0, 100));
  };

  G.fameTier = function (st) {
    const v = G.fameOf(st);
    let tier = G.config.FAME_TIERS[0];
    for (const t of G.config.FAME_TIERS) if (v >= t.min) tier = t;
    return { value: v, tier };
  };

  /* ---------------- RUMORES DE FICHAJES --------------------------- */
  // Genera una oleada de rumores: clubes interesados según tu momento.
  G.genRumors = function (st) {
    if (!G.config.RUMORS_ENABLED) return [];
    const player = st.player;
    const news = [];
    const prob = G.clamp((player.ovr - 62) / 18, 0, 1);
    const cands = [];
    for (const lg of G.leagues) {
      for (const c of lg.clubs) {
        if (c.id === st.clubId) continue;
        cands.push({ club: c, league: lg });
      }
    }
    cands.sort((a, b) => (b.club.ovr + b.club.titles * 0.4) - (a.club.ovr + a.club.titles * 0.4));
    const seen = {};
    for (const c of cands) {
      if (news.length >= 3) break;
      const strong = c.club.ovr + c.club.titles * 0.4;
      if (strong >= player.ovr - 4 && G.chance(prob)) {
        const key = c.club.id;
        if (seen[key]) continue;
        seen[key] = true;
        const isTop = strong >= player.ovr + 10;
        news.push({
          club: c.club,
          league: c.league,
          round: G.currentEvent(st).round || null,
          note: isTop
            ? "quiere reforzarse contigo de cara al mercado"
            : "te sigue de cerca para el próximo mercado",
          strength: strong,
        });
      }
    }
    st.season.rumors = news;
    G.save();
    return news;
  };

  // Noticia cuando no hay partido de copa para jugar (no clasificado/eliminado).
  G.continentalNews = function (st, ev) {
    const cup = st.season.cups && st.season.cups[ev.tour];
    const stageName = CUP_STAGE_NAMES[ev.stage] || ev.stage;
    if (!cup) return "La copa se define sin tu equipo.";
    if (!cup.myAlive) return "Tu equipo quedó eliminado de la copa (" + stageName + ").";
    return "Noticia de " + stageName + ".";
  };

  G.cupNameFor = function (st, tour) {
    const info = (st.season.cupInit || []).find((c) => c.key === tour);
    if (info && info.name) return info.name;
    const defs = G.cupDefsFor(G.confOfLeague(st.leagueId));
    const d = defs.find((x) => x.key === tour);
    return (d && d.title) || "🏆 Copa";
  };

  G.cupStageName = function (stage) {
    return (CUP_STAGE_NAMES[stage] || stage || "Copa").toUpperCase();
  };
})();