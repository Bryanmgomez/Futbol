/* ============================================================
   CONFIGURACIÓN DEL JUEGO — ¡EDITA AQUÍ PARA CAMBIAR LAS REGLAS!
   ============================================================
   Este archivo contiene todos los parámetros/parámetros del modo
   carrera. Cambia valores, guarda y vuelve a abrir index.html.
   ============================================================ */
(function () {
  const G = (window.G = window.G || {});

  G.config = {
    VERSION: "1.2.0",

    /* ---- CAMPEONATO -------------------------------------------- */
    // Vuelta oficiales: 2 = Todos contra todos ida y vuelta.
    ROUNDS_PER_LEAGUE: 2,
    // Partidos por jornada que se ven de la liga del jugador.
    // Número de descensos (los 2 últimos de la tabla descienden).
    RELEGATIONS: 2,
    // Plazas de copas continentales repartidas según la tabla.
    // (El campeón ocupa la 1ª plaza de Libertadores; el resto según orden).
    LIBERTADORES_SPOTS: 8,
    SUDAMERICANA_SPOTS: 8,

    /* ---- CONFEDERACIONES ---------------------------------------- */
    // Cada liga pertenece a una confederación (campo `conf` en leagues.js).
    // Las copas continentales se definen por confederación en CUP_DEFS.
    CONF: {
      CONMEBOL: { name: "CONMEBOL", label: "Sudamérica", continental: "🇨🇴 Copa América" },
      UEFA: { name: "UEFA", label: "Europa", continental: "🇪🇺 Eurocopa" },
      CONCACAF: { name: "CONCACAF", label: "Norteamérica", continental: "🌎 Copa Oro" },
      AFC: { name: "AFC", label: "Asia", continental: "🏆 Copa Asiática" },
    },

    /* ---- COPAS CONTINENTALES POR CONFEDERACIÓN ----------------- */
    // Cada torneo reparte N plazas de la tabla de tu liga y arranca a
    // mitad de temporada (eliminación directa, formato adaptado).
    CUP_DEFS: {
      CONMEBOL: [
        { key: "libertadores", name: "Copa Libertadores", title: "🏆 Copa Libertadores", spots: 8, minTeams: 2 },
        { key: "sudamericana", name: "Copa Sudamericana", title: "🏆 Copa Sudamericana", spots: 8, minTeams: 4 },
      ],
      UEFA: [
        { key: "champions", name: "Champions League", title: "🏆 Champions League", spots: 8, minTeams: 2 },
        { key: "europa", name: "Europa League", title: "🏆 Europa League", spots: 8, minTeams: 4 },
      ],
      CONCACAF: [
        { key: "concacaf", name: "Copa de Campeones", title: "🏆 Copa de Campeones CONCACAF", spots: 8, minTeams: 2 },
      ],
      AFC: [
        { key: "afc", name: "Liga de Campeones AFC", title: "🏆 Liga de Campeones AFC", spots: 8, minTeams: 2 },
      ],
    },

    /* ---- ATRIBUTOS DEL JUGADOR --------------------------------- */
    // Las 7 estadísticas del juego.
    ATTRIBUTES: [
      { key: "rit", name: "Ritmo", icon: "⚡", desc: "Velocidad y desborde" },
      { key: "tir", name: "Tiro", icon: "🎯", desc: "Definición y disparo" },
      { key: "pas", name: "Pase", icon: "🎳", desc: "Precisión de pase" },
      { key: "reg", name: "Regate", icon: "🪄", desc: "Habilidad en el uno contra uno" },
      { key: "def", name: "Defensa", icon: "🛡️", desc: "Marcaje y robo de balón" },
      { key: "fis", name: "Físico", icon: "💪", desc: "Fuerza y resistencia" },
      { key: "por", name: "Portería", icon: "🧤", desc: "Paradas y juego de manos" },
    ],

    // Edad límite → 34+ el jugador empieza a perder media.
    AGE_PEAK: 27,
    AGE_DECLINE_START: 30,
    AGE_DECLINE_AMOUNT: 1,

    /* ---- POSICIONES Y FORMACIÓN -------------------------------- */
    // Pesos para calcular la media global por posición.
    POSITIONS: [
      { key: "POR", name: "Portero", short: "POR", icon: "🧤", role: "gk" },
      { key: "DEF", name: "Defensa", short: "DEF", icon: "🛡️", role: "def" },
      { key: "MED", name: "Mediocampista", short: "MED", icon: "🧠", role: "mid" },
      { key: "DEL", name: "Delantero", short: "DEL", icon: "⭐", role: "att" },
    ],
    // Formación base del equipo: 4-3-3
    FORMATION: {
      label: "4-3-3",
      line: ["POR", "DEF", "DEF", "DEF", "DEF", "MED", "MED", "MED", "DEL", "DEL", "DEL"],
    },
    SQUAD_COUNTS: { POR: 2, DEF: 6, MED: 6, DEL: 5 }, // plantilla de 19 + tú

    // Peso de cada atributo en la media global, según posición.
    OVR_WEIGHTS: {
      POR: { rit: 5, tir: 5, pas: 8, reg: 5, def: 12, fis: 15, por: 50 },
      DEF: { rit: 16, tir: 6, pas: 12, reg: 9, def: 40, fis: 17, por: 0 },
      MED: { rit: 16, pas: 32, reg: 20, tir: 8, def: 14, fis: 10, por: 0 },
      DEL: { rit: 20, tir: 35, reg: 20, pas: 12, def: 4, fis: 9, por: 0 },
    },

    /* ---- CREACIÓN DE JUGADOR ------------------------------------ */
    NEW_PLAYER: {
      baseAttr: 40,       // atributo inicial
      pointPool: 55,      // puntos a repartir
      maxAttr: 95,        // máximo por atributo
      minAttr: 35,        // mínimo
      minAge: 16,
      maxAge: 25,
    },

    /* ---- DIFICULTAD --------------------------------------------- */
    // 'ai' son puntos extra que recibe el rival en el motor de partido.
    DIFFICULTY: {
      facil:   { name: "Fácil",   ai: -5, desc: "Rivales más débiles" },
      normal:  { name: "Normal",  ai: 0,  desc: "Equilibrado" },
      dificil: { name: "Difícil", ai: 5,  desc: "Rivales más fuertes" },
    },
    defaultDifficulty: "normal",

    /* ---- CONTRATOS Y SUELDOS ------------------------------------ */
    // Sueldo base según tu media global (en dólares al año).
    SALARY_BASE: 120000,
    SALARY_PER_OVR: 18000,
    CONTRACT_YEARS: [1, 2, 3, 4, 5],
    defaultContractYears: 3,
    // Prima de renovación (parte del sueldo).
    SIGNING_PERCENT: 0.5,

    /* ---- SELECCIÓN NACIONAL ------------------------------------- */
    // Media mínima para entrar en tu selección.
    INTl_MIN_OVR: 71,
    // Partidos internacionales por temporada (amistosos).
    INTl_FRIENDLIES_PER_SEASON: 2,
    // Cada cuántas temporadas hay Copa América (y mundial).
    COPA_AMERICA_EVERY: 2,
    WORLD_CUP_EVERY: 4,

    /* ---- MOTOR DE PARTIDO ---------------------------------------- */
    MATCH: {
      totalMinutes: 90,
      // Número de ataques promedio por partido (Poisson).
      avgChances: 15,
      // Probabilidad base de gol por ocasión clara.
      goalBaseChance: 0.30,
      // Rafaga: un equipo fuerte convierte mejor sus ocasiones.
      goalDiffFactor: 0.004,
      // Ventaja de jugar en casa (puntos de fuerza).
      homeAdvantage: 3,
      // Minuto típico de sustitución si sales desde el banquillo.
      subMinute: 58,
      // Nota base de la valoración (de 1 a 10).
      ratingBase: 6.4,
    },

    /* ---- VALORACIÓN DE MERCADO (€) ------------------------------- */
    // Valor aproximado de tu jugador (para traspasos).
    MARKET_VALUE: { perOvr: 850000, ageFactor: 1.1, starBonus: 3400000 },

    /* ---- MERCADO DE INVIERNO (TRASPASOS A MITAD DE TEMPORADA) ---- */
    // ¿Se abren traspasos a mitad de temporada? Un club paga una
    // tasa a tu equipo y te ofrece contrato; puedes cambiar de club
    // en la misma liga al llegar la mitad del campeonato.
    WINTER_TRANSFERS: true,
    WINTER_MAX_OFFERS: 3,     // ofertas máximas por ventana
    WINTER_FEE_MULT: [7, 11], // x0,7 .. x1,1 del valor de mercado
    WINTER_BONUS_PERCENT: 0.18, // prima de firma para ti (sobre la tasa)

    /* ---- COPA CONTINENTAL (formato reducido) --------------------- */
    // A mitad de temporada, los mejores equipos de tu liga juegan una
    // copa de eliminación directa (cuartos, semifinal y final, a un
    // partido). El formato se adapta al número de clasificados.
    // Estos switches controlan las copas de CONMEBOL; el resto de
    // confederaciones usa CUP_DEFS de arriba (todas bajo el master).
    CONTINENTAL_ENABLED: true,
    CONTINENTAL_SPOTS: 8,        // plazas de Copa Libertadores
    CONTINENTAL_NAME: "Copa Libertadores",
    CONTINENTAL_TITLE: "🏆 Copa Libertadores",

    /* ---- COPA SUDAMERICANA ---------------------------------------- */
    // Segunda copa continental: los siguientes equipos de la tabla.
    // Solo arranca si hay al menos 4 clasificados de tu liga.
    SUDAMERICANA_ENABLED: true,
    SUDAMERICANA_SPOTS: 8,       // siguientes a las plazas de Libertadores
    SUDAMERICANA_NAME: "Copa Sudamericana",
    SUDAMERICANA_TITLE: "🏆 Copa Sudamericana",
    SUDAMERICANA_MIN_TEAMS: 4,   // mínimo de equipos para jugarla

    /* ---- PRÉSTAMOS ------------------------------------------------ */
    // Al final de temporada un club de mayor nivel (o igual) puede
    // ofrecerte una cesión temporal de 1-2 años en la misma liga.
    // Devuelves al club padre al terminar la cesión.
    LOANS_ENABLED: true,
    LOAN_MAX_OFFERS: 2,          // ofertas de cesión máximas por ventana
    LOAN_YEARS: [1, 2],          // duración de la cesión (años)

    /* ---- ENTRENAMIENTO -------------------------------------------- */
    // Sesiones de entrenamiento por temporada. Las sesiones se consumen
    // al entrenar y se recuperan con cada jornada (hasta el tope), por
    // lo que durante la temporada puedes entrenar varios atributos.
    // Cada sesión ejecuta un "drill" de TRAINING_DRILL_ROUNDS rondas,
    // con una probabilidad de éxito por ronda según el atributo actual,
    // la edad y si el atributo es clave para tu posición.
    TRAINING_ENABLED: true,
    TRAINING_SESSIONS_PER_SEASON: 8,
    TRAINING_GROWTH_PER_SESSION: 1,
    TRAINING_DRILL_ROUNDS: 3,     // rondas por sesión (éxito = +1 cada una)
    TRAINING_YOUNG_AGE: 23,       // menor que esto: aprende más rápido
    TRAINING_YOUNG_BONUS: 1,      // +n puntos extra se logra al menos 1 ronda
    TRAINING_MAX_ATTR: 99,
    // Atributos clave por posición: entrenarlos rinde más.
    TRAINING_POSITION_BONUS: {
      POR: ["por", "fis"],
      DEF: ["def", "fis", "rit"],
      MED: ["pas", "reg", "fis"],
      DEL: ["tir", "reg", "rit"],
    },

    /* ---- FAMA DEL JUGADOR ----------------------------------------- */
    // La fama sube con tu rendimiento (media y títulos). Se muestra en
    // su propia pantalla y en el hub.
    FAME_TIERS: [
      { min: 0,  name: "Desconocido", icon: "🙂" },
      { min: 10, name: "Promesa local", icon: "🔰" },
      { min: 25, name: "Jugador destacado", icon: "⭐" },
      { min: 45, name: "Figura continental", icon: "🌟" },
      { min: 65, name: "Estrella mundial", icon: "💫" },
      { min: 85, name: "Leyenda viva", icon: "🐐" },
    ],

    /* ---- RUMORES DE FICHAJES -------------------------------------- */
    // Rumores generados cada 2-3 jornadas con clubes interesados en ti.
    RUMORS_ENABLED: true,
    RUMORS_EVERY: 6,             // una oleada de rumores cada ~N jornadas

    /* ---- LESIONES ------------------------------------------------- */
    // Probabilidad de lesionarte por partido jugado (0 = sin lesiones).
    INJURY_CHANCE: 0.06,
    INJURY_RANGE: [1, 3], // jornadas de baja

    /* ---- GOLES Y ASISTENCIAS (Bota de Oro de la liga) ------------ */
    // Atribuye goleadores/asistentes a los goles de TODOS los equipos
    // y muestra al final de la temporada la Bota de Oro de la liga.
    GOLDEN_BOOT: true,

    /* ---- OBJETIVOS DE TEMPORADA ---------------------------------- */
    // Al iniciar cada año el club marca expectativas según su fuerza.
    // Cumplirlas te da fama, un "título" de logro y mejores renovaciones.
    EXPECTATIONS_ENABLED: true,
    EXPECTATION_POS_MARGIN: 1.6,  // x1,6 sobre el puesto por fuerza del club
    EXPECTATION_GOALS_F: 0.30,    // goles exigidos según tu media
    EXPECTATION_ASSISTS_F: 0.20,  // asistencias exigidas según tu media
    EXPECTATION_MIN: { pos: 1, goals: 4, assists: 3 },
    EXPECTATION_REWARD_FAME: 6,   // fama extra si cumples todo
    EXPECTATION_RENEWAL_MULT: 1.25, // renovación x1,25 si cumples todo

    /* ---- BALÓN DE ORO ---------------------------------------------- */
    // Se otorga al final de la temporada a las estrellas: muchos títulos
    // y rendimiento altísimo. Añade prestigio a tu carrera.
    BALLON_DOR_ENABLED: true,
    BALLON_DOR_MIN_FAME: 78,      // fama mínima para aspirar
    BALLON_DOR_MIN_TITLES: 1,     // títulos de la temporada en curso
  };

  // Índices útiles
  G.attrKeys = G.config.ATTRIBUTES.map((a) => a.key);
  G.posKeys = G.config.POSITIONS.map((p) => p.key);
})();