# ⚽ Fútbol Sudamérica: Modo Carrera

Juego de fútbol tipo **modo carrera de jugador** con **22 ligas**: las 10 de
primera división de Sudamérica + las grandes de Europa (España, Inglaterra,
Italia, Alemania, Francia, Portugal, Países Bajos, Rusia), Norteamérica
(México, Estados Unidos) y Asia (China, Japón). Se juega en el navegador,
sin instalar nada, y todos los datos del juego son **100 % editables**
(clubes, ligas, nombres, atributos, dificultad...). **Versión actual: 1.2.0.**

## 🎮 Cómo jugar

1. Doble clic en `index.html` (se abre en tu navegador: Chrome, Edge, Firefox...).
2. En el menú principal: **Nueva carrera**, crea tu jugador, elige liga y club.
3. Juega tus partidos: cuando te llega el balón decides **Disparar / Regatear / Pasar**.
   Si eres **PORTERO**, adivina la esquina del disparo para atajar.
4. A mitad de temporada se abre el **Mercado de invierno**: otros clubes pueden
   ofrecer por ti (pagan una tasa a tu equipo y te dan contrato + prima).
5. Cada liga juega su **copa continental** según su confederación: en Sudamérica
   la **Copa Libertadores** (8 mejores) y la **Copa Sudamericana** (puestos
   9-16); en Europa la **Champions League** y la **Europa League**; en
   Norteamérica la **Copa de Campeones CONCACAF** y en Asia la
   **Liga de Campeones AFC**.
6. Puedes pedir una **cesión** a un club más fuerte (mercado y ofertas de final
   de temporada): juegas prestado una o dos temporadas y vuelves a tu club.
7. **Entrena** desde el hub: cada sesión es un mini-drill por rondas con bonus
   por edad y por atributo clave de tu posición. Cada jornada recuperas sesiones.
8. Tu club te fija **objetivos de temporada** (quedar por encima de X, goles y
   asistencias): si los cumples, logro + **renovación premium** (sueldo x1,25).
   Si brillas con fama y títulos, al final de temporada te espera el
   **🏆 Balón de Oro**.
9. Mira tu **Fama** (nivel de figura según títulos, rendimiento y selección) y
   sigue los **Rumores** de clubes interesados en ti.
10. Cuidado con las **lesiones**: si te toca, las jornadas de baja se simulan solas.
11. Avanza jornada a jornada: busca el título de tu liga, conquista la **Bota de
    Oro**, llega a tu selección nacional y crece como leyenda.

> 💾 El juego **guarda automáticamente** (partida continua). Puedes exportar e
> importar tu partida desde **Configuración**.

---

## 🛠 Cómo actualizar el juego (altamente actualizable)

Todos los datos viven en archivos separados dentro de la carpeta `js/data/`.
**Edítalos con cualquier editor de texto (Block de notas) y guarda; vuelve a
abrir `index.html`.**

| Archivo | Qué contiene | Qué puedes cambiar |
|---|---|---|
| `config.js` | Reglas del juego | Atributos, posiciones, dificultad, sueldos, fechas de selección, medias de campeonatos |
| `leagues.js` | Las 22 ligas y sus clubes | Añadir/editar/quitar ligas, clubes, campeonatos ganados, colores, estadios, presupuestos |
| `names.js` | Piscinas de nombres por país | Añadir más nombres/apellidos para que se generen jugadores realistas |

### Ejemplo: agregar un club

En `js/data/leagues.js`, dentro del array de `clubs` de una liga, añade:

```js
{ id: "club-01", name: "Mi Club FC", short: "MFC", ovr: 74, color: "#b3123f",
  color2: "#ffffff", stadium: "Estadio Municipal", city: "Ciudad", titles: 2 }
```

- `ovr`: la media general del club (fuerza del equipo). 60 = débil, 80 = top.
- `color` / `color2`: colores de la camiseta (formato hex `#rrggbb`).
- `titles`: campeonatos nacionales del club (aumenta su reputación).

### Ejemplo: ajustar la dificultad

En `config.js`, en `DIFFICULTY`, sube o baja el valor de `ai` (los rivales se
vuelven más fuertes si subes el número):

```js
dificil: { ai: 5 }   // rivales más difíciles
```

### Hacer una liga más corta o más larga

En `config.js`, `ROUNDS_PER_LEAGUE = 2` (todos contra todos, ida y vuelta).
Pon `1` para una sola vuelta.

### Activar/desactivar y ajustar las funciones nuevas

Todo se controla desde `js/data/config.js`:

| Parámetro | Qué hace |
|---|---|
| `WINTER_TRANSFERS` | `true` = hay mercado de traspasos a mitad de temporada. `false` lo desactiva |
| `WINTER_MAX_OFFERS` | Nº máximo de ofertas por ventana de invierno |
| `WINTER_FEE_MULT` | Rango de la tasa que paga el otro club (x0,7–x1,1 del valor de mercado) |
| `WINTER_BONUS_PERCENT` | % de la tasa que recibes tú como prima de fichaje |
| `CONTINENTAL_ENABLED` | Interruptor general de las copas continentales (todas las confederaciones) |
| `SUDAMERICANA_ENABLED` | `true` = se juega la Copa Sudamericana (puestos 9-16, mínimo 4 equipos) |
| `SUDAMERICANA_SPOTS` | Cuántos equipos entran en la Sudamericana |
| `SUDAMERICANA_MIN_TEAMS` | Mínimo de equipos para que se juegue |
| `CUP_DEFS` | Definición de copas por confederación: `CONMEBOL`, `UEFA`, `CONCACAF` y `AFC`, cada una con plazas, nombre y título |
| `CONF` | Etiquetas de confederación (CONMEBOL / UEFA / CONCACAF) |
| `LOANS_ENABLED` | `true` = puedes ir cedido a un club más fuerte (mercado y fin de temporada) |
| `LOAN_MAX_OFFERS` | Nº máximo de ofertas de cesión por ventana |
| `LOAN_YEARS` | Duración de la cesión: `[1, 2]` = entre 1 y 2 temporadas |
| `TRAINING_ENABLED` | `true` = pantalla de entrenamiento en el hub |
| `TRAINING_SESSIONS_PER_SEASON` | Sesiones máximas de entrenamiento por temporada (se recuperan con las jornadas) |
| `TRAINING_DRILL_ROUNDS` | Rondas por sesión de entrenamiento (cada éxito suma +1) |
| `TRAINING_YOUNG_AGE` / `TRAINING_YOUNG_BONUS` | Bonus de +N puntos para jugadores jóvenes (edad ≤ tope) |
| `TRAINING_POSITION_BONUS` | Bonus de +1 al entrenar el atributo clave de tu posición |
| `TRAINING_MAX_ATTR` | Tope de atributo (p. ej. 99) |
| `EXPECTATIONS_ENABLED` | `true` = tu club fija objetivos de temporada (posición, goles, asistencias) |
| `EXPECTATION_REWARD_FAME` | Fama extra si cumples todos los objetivos |
| `EXPECTATION_RENEWAL_MULT` | Multiplicador de sueldo de la renovación premium al cumplir objetivos |
| `BALLON_DOR_ENABLED` | `true` = Balón de Oro al final de la temporada |
| `BALLON_DOR_MIN_FAME` | Fama mínima para optar al Balón de Oro |
| `BALLON_DOR_MIN_TITLES` | Títulos mínimos en la temporada para optar al Balón de Oro |
| `FAME_TIERS` | Niveles de fama (nombre e icono) según la fama acumulada |
| `RUMORS_ENABLED` | `true` = rumores de clubes interesados en ti |
| `RUMORS_EVERY` | Cada cuántas jornadas llega una nueva tanda de rumores |
| `INJURY_CHANCE` | Probabilidad de lesionarte por partido (0 = sin lesiones) |
| `INJURY_RANGE` | Jornadas de baja: `[1, 3]` = entre 1 y 3 |
| `GOLDEN_BOOT` | `true` = Bota de Oro y ranking de asistencias en la liga |

---

## 📁 Estructura del proyecto

```
juego mc/
├── index.html            ← Menú y pantallas del juego
├── assets/
│   └── style.css         ← Todos los estilos
├── js/
│   ├── main.js           ← Arranque y navegación
│   ├── ui.js             ← Menús y pantallas
│   ├── core.js           ← Utilidades + guardado
│   ├── engine/
│   │   ├── player.js     ← Crear jugador, plantillas, XI
│   │   ├── league.js     ← Fixture, tabla, simular otros partidos
│   │   ├── match.js      ← Motor del partido
│   │   └── career.js     ← Temporadas, traspasos, selección
│   └── data/
│       ├── config.js     ← Reglas / parámetros
│       ├── names.js      ← Nombres por país
│       └── leagues.js    ← Ligas y clubes
```

**Consejo:** haz una copia de `js/data/` antes de editar, o guarda tus
cambios con `git` si conoces GitHub.