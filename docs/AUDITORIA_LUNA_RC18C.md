# AUDITORÍA LUNA · RC18c

**Objeto:** `builds/1248_CHAMELO_RC18c.html` («prueba juego.html»)
- 29,8 MB; SHA-256 `493c57bbcf8eb88036ca619a35ea80609b2e7e57eedfbfd1baf9cec86f3ed857`.
- No se ha modificado el juego.

**Método:**
1. Volcado de `E.DATA` en Chromium después de cargar todos los módulos, que es el estado real de la partida.
2. Lectura de las fuentes: `production/CHAMELO/rc17.js`, `rc18.js`, `rc18c.js`, `rc07.js` y `production/G11/g11_journey.js`.
3. Para el motor, que solo existe dentro del HTML, se cita la línea del propio HTML de RC18c (`HTML l.N`).
4. Capturas de las 14 escenas en un Pixel 7 apaisado simulado: `production/CHAMELO/capturas/luna/`.

**Estados:**
- **Confirmado:** visto en el navegador o comprobado en los datos cargados.
- **Provisional:** dibujado por código, o arte marcado como provisional.
- **Ausente:** no existe.
- **Pendiente:** no comprobado.

> Existe **RC18d** (RC18c + Rai-gato con los clips de César: andar, sentarse y guiñar). Esta auditoría describe RC18c y avisa donde RC18d cambia algo.

---

## 1. Escenarios

Hay 14 escenas y 13 se alcanzan jugando.

| Id | Nombre en pantalla | Ancho · cámara | Fondo | Arte | ¿Se juega? | Encima del fondo, dibujado por código |
|---|---|---|---|---|---|---|
| `ribera` | Ribera del Tajo | 2600 · sigue | `scenes/ribera/bg.png` | Pintado (serie A) | Sí: inicio y final | — |
| `acena` | La aceña de Durán | 1600 · fija | `scenes/acena/bg_g12.webp` | **Provisional**: estilo plano, sale de una captura con interfaz (`art/escenarios/acena/acena_mejorada_original.jpg`; ESTADO pide fondo limpio) | Sí | — |
| `embarcadero` | El embarcadero | 2000 · sigue | `scenes/embarcadero/bg.png` | Serie A | Sí | Red de pesca (`net_rack`) |
| `travesia` | Cruzando el Tajo | 1600 · fija | `travesia/bg.png` + `barca.png` | Serie A | Paso automático | — |
| `orilla` | La orilla · Soto de los Sifones | 4000 · sigue | `orilla/soto_acuarela.webp` + juncos | Serie A | Sí, de día y de noche | Mapa de la cuadrilla, entero y roto; la noche es una capa de color |
| `chamelo` | Rai, el hechicero · Isla del Chamelo | 1600 · fija | `chamelo/bg.webp` | Serie C (tinta y acuarela) | Sí | Mata y raíces de paloduz: PNG de Claude (RC18c), **provisional** |
| `puerta_rio` | La Puerta del Río | 2200 · sigue | `puerta_rio/bg.png` + carreta atascada + poste | Serie A | Sí | Brazo «A TALAVERA» (`rc17.js:692`) |
| `plaza` | Plaza del Pan | 2600 · sigue | `plaza/bg.png` | Serie A | Sí | Banco de Lope, tablón y hogazas (marcadores de G11) |
| `iglesia` | Atrio de Santa María | 1600 · fija | `iglesia/bg.png` | Serie A | Sí | Cuerda de la campana (marcador); Luna y pórtico (efectos) |
| `alfar` | Alfar de Yuçaf | 1600 · fija | `alfar/bg.png` | Serie A | Sí | Torno (marcador); cadena y trampilla del tiro, resplandor del horno (`rc17.js:673`) |
| `audiencia` | Plaza Mayor | 1600 · fija | `audiencia/bg.png` | Serie A | Sí, tras el rescate | — |
| `portazgo` | Casa del Portazgo | 1600 · fija | `portazgo/bg.png` | Serie A | **No**: puerta cerrada siempre (`rc17.js:311`) | 5 marcadores |
| `corredera` | Corredera del Cristo | 1600 · fija | `corredera/exterior.jpg` | César (serie B) | Sí | — |
| `taberna` | La Taberna del Miedo | 2700 · sigue | `taberna/bg.webp` | César (serie B) | Sí | Balanza, cuña de la balanza y cuña de la mesa (`rc17.js:491`) |

**Estilos en pantalla.** Hay cinco familias, y la decisión de estilo sigue abierta desde el 7 de noviembre (`production/ESTADO.md`, l.74):
- **A** · Pintado de la serie G10/G11: ribera, embarcadero, travesía, soto, Puerta, plazas, iglesia, alfar y portazgo.
- **B** · César, compatible con A pero más detallado: Corredera y taberna.
- **C** · Tinta y acuarela: Chamelo, y también los 8 fondos sin usar de §3.
- **D** · Plano: aceña por dentro.
- **E** · Mapa vectorial: `art/portada/mapa_talavera_v2.jpg`.

A esto se suman los murales del padre de César en la pausa y el final, y la mezcla de personajes de vídeo con marionetas vectoriales (§2).

**Fondos que no existen:**
- Noches pintadas (soto, ribera y atrio): hoy son una capa de color, `rc09`.
- El presente: hoy es un filtro de saturación (`rc17.js:733`).
- La viñeta de la aldea: dibujada por código (`rc17.js:737`).
- La viñeta del duelo: no existe.

---

## 2. Personajes y animaciones integradas

### Con hoja sacada de clips de vídeo (9)

| Personaje | Id (personaje · NPC) | Animaciones (fotogramas) | Dónde sale | Carencias |
|---|---|---|---|---|
| Viajero | `player` | reposo **1 (fijo)**, andar 36, hablar 64 | Todo | Sin gestos; clips 218, 224 y 225 sin usar (§3) |
| Durán | `duran` | reposo **1**, andar 19, hablar 40, escuchar 32 | Aceña | — |
| Martín | `alfonso` · `alfonso`, `alfonso_b` | reposo **1**, andar 34, hablar 24, escuchar 1 | Embarcadero, travesía | — |
| Don Nuño | `nuno` · `nuno_alfar`, `nuno_aud` | reposo 16, andar 16, hablar 24 | Alfar, Plaza Mayor | Ningún gesto (lacre, espejo) |
| Mingo | `mingo` | reposo 16, andar 16, hablar 24, encaramado 16 | Soto y como acompañante | Zapatos cortados en la higuera (`AUDITORIA_RC17` B1); no salta de la rama: aparece abajo |
| Ciego | `ciego` | reposo 1, hablar 16 | Soto (de día) | — |
| Sancha | `elvira` (hoja de Elvira) · `sancha` | reposo 24, andar 16, hablar 24 | Ribera, plaza, alfar, taberna, Plaza Mayor, atrio | Sin gesto de dar la hogaza ni de desatar a la señora (esto último es un rótulo) |
| Rai | `leonor` | reposo 16 y hablar 16 (izquierda), andar 16 (derecha) | Chamelo, taberna, atrio | — |
| Alonso | `soldado` | reposo 30, hablar 46, **sin andar** | Taberna, atrio | **Se desliza** al cargar (`rc17.js:461`); existen dos clips suyos andando (§3) |

### Dibujados por código: marionetas `rig` de `g12_rig.js` (14 personajes con 13 figuras, 18 NPC)

| Personaje | Id (personaje · NPC) | Dónde sale |
|---|---|---|
| Gil del Paso y Gil del Peso | `guardia` · `gil_a`, `gil_b`, `gil_alfar_a`, `gil_alfar_b` | Puerta del Río, alfar |
| Yuçaf | `yucaf` · `yucaf_alfar`, `yucaf_aud` | Alfar, Plaza Mayor |
| Maese Lope | `lope` | Plaza, taberna, atrio |
| Per de la Voz (pregonero) | `pregonero` · `pregonero`, `pregonero_vista` | Plaza, Plaza Mayor |
| Fray Benito | `benito` | Atrio |
| Arriero y peregrina | `arriero`, `peregrina` | Taberna |
| Señora de Oropesa | `oropesa` (`rc17.js:37`) | Taberna, Plaza Mayor |
| Los cuatro conspiradores | `requete_a`…`requete_d` (`rc17.js:38-41`) | Soto de noche, taberna, Puerta del Río |
| Gato | `gato` (`rc17.js:42-74`) | Soto de noche, ribera final. **En RC18d ya usa el arte de César.** |

Los dos Giles comparten la figura `guardia`. Hay dos figuras definidas que no salen nunca: `mayordomo` y `sancha` (la marioneta; la NPC Sancha usa la hoja de Elvira).

En las capturas de la plaza, el alfar, la taberna y el atrio se ven juntos los dos acabados: personajes pintados y marionetas planas.

---

## 3. Recursos que existen pero no se usan

### En el HTML, pero inalcanzables jugando (comprobado por las condiciones)

| Recurso | Por qué no se ve |
|---|---|
| Escena `portazgo`: fondo de 0,53 MB, 5 marcadores y Nuño en su casa (`nuno_casa`) | Puerta `when: 'nunca_jamas'` (`rc17.js:311-312`) |
| NPC `yucaf` (Puerta), `nuno_puerta`, `mayordomo`, `elvira_aceña`, `elvira` (Chamelo) | `presentWhen: 'nunca_jamas'` (`rc17.js:31, 277, 498`) |
| 16 objetos imposibles de conseguir: cuerda, pértiga con lazo, moneda, saco, cuña de obra, viga, cántaro, tres sellos, badajo, bando, pieza del rey, cuenco, racimo, higos | Solo los dan acciones antiguas que ya no se alcanzan. Se pueden conseguir 6: móvil, Mingo, pértiga, paloduz, cuña y hogaza |
| Capas `bando`, `regla_visible`, `ladrillos_paso`, `viga_suelo`, `hilo_visible`, `pajar`, `cuenco`, `amarre` | Ocultas con `nunca_jamas` |
| Diálogos antiguos `yucaf`, `mayordomo`, `toque`, `elvira_plaza` y `rai`; nodos `campana` y `toques` de Alonso; nodo `saco` de Durán; árbol de `mingo` | Nadie los abre (desde RC18, tocar a Mingo da la pista directamente, `rc18.js:54`) |
| Combinación cuerda + pértiga; acciones `deliverSack` y `payCoin` de Martín | Trama antigua |

Dos restos sí se ven, sin función:
- La **carreta atascada** (`cart_stuck.png`) se ve siempre en la Puerta del Río, porque `carreta_libre` ya no se activa nunca.
- Un **destello en el agua de la ribera** (x 1515, y 663) sigue latiendo, porque está ligado a `!moneda_cogida` (HTML l.3044, posición l.5463) y la moneda ya no se puede coger. Captado en 8 capturas seguidas: es una pista falsa en la primera pantalla.

### En el repositorio, sin integrar

| Recurso | Contenido | Estado |
|---|---|---|
| `assets/source_clips/soldado_anda_1000703355.mp4` y `…3361.mp4` | Alonso andando de perfil sobre verde, 8 s | Confirmado sin usar. Por eso Alonso se desliza |
| `assets/source_clips/1000700218.mp4`, `…224.mp4` (fondo blanco), `…225.mp4` | Viajero: mirarse los bolsillos, sonrisa de frente, tres cuartos | Sin usar; si sirven como gestos, pendiente |
| `art/escenarios/nuevos/` (8 fondos de César) | Aceña exterior (2), calle de casas, plaza del mercado, puente (2), puerta de muralla, interior de taberna. Estilo C, como el Chamelo | Sin usar |
| `art/ilustraciones_mural/game_puente_barca.jpg` | Mural del padre de César: puente, barca y burro | Sin usar (la pausa y el final usan los otros dos) |
| `art/portada/portada_1248_*.jpg`, `art/escenarios/orilla/far.jpg` y `near.webp`, `art/escenarios/corredera/bg_provisional.jpg` | Versiones sustituidas | Sin usar |
| `assets/source_clips/rai_gato_*` (3) | Rai-gato | Integrado en RC18d, no en RC18c |
| `alfonso_marcha_perfil_1000701584.mp4`, `rai_senala_1000703344.mp4` | Martín andando; Rai señalando | Pendiente: según ESTADO forman parte de las hojas actuales |

---

## 4. Puzles

En RC18c se juega la historia principal completa, de la ribera al final.

| Nº | Puzle (revisión 2) | Estado | Código | Comprobación |
|---|---|---|---|---|
| 1 | El móvil de Mingo | Implementado | `rc17.js:160-194`, `rc18.js:84` | Jugado en RC18 (`pt_guion`: 50 comprobaciones, 0 fallos) |
| 2 | La rueda atascada | Implementado | `rc17.js:144-158` | Jugado en RC18 |
| 3 | El mapa del sabio (paloduz) | Implementado según el guion | `rc18c.js` | Jugado en RC18c (9 nov) |
| 4 | Los Giles | Eliminado como puzle: escena | `rc17.js:269-274` | Jugado en RC18 |
| 5 | El alfar que no se puede cerrar | Implementado; cadena y trampilla **provisionales** | `rc17.js:324-373` | Jugado en RC18 |
| 6 | La primera Requeteconquista | Implementado | `rc17.js:399-440` | Jugado en RC18 |
| — | Confesión de Rai | Escena | `rc17.js:214-227` | Jugado en RC18 |
| 7 | El peso de la señora | Implementado; balanza y cuñas **provisionales** | `rc17.js:442-493`, `rc18.js:57-66` | Jugado en RC18 |
| — | Destitución de Nuño | Escena | `rc17.js:495-517` | Jugado en RC18 |
| 8 | La aldea (poste) | Implementado; viñeta **provisional** | `rc17.js:519-531`, `692`, `737` | Jugado en RC18 |
| 9 | La campana de Lope | Fusionado con el 10: un martillazo | `rc17.js:554-556` | Jugado en RC18 |
| 10 | La noche de la Luna roja | Implementado | `rc17.js:533-561`, `rc18.js:127-133` | Jugado en RC18 |
| 16 | El ciego (uvas) | Gag sin puzle | `rc18.js:15-31` | Jugado en RC18 |
| 11 | Monstruo del Tajo | **Ausente** | Solo una frase de Martín (`rc07.js:556`) y el dibujo del mapa | — |
| 12 | Alonso y los molinos | **Ausente** | — | — |
| 13 | Ovejas desaparecidas | **Ausente** | Solo el dibujo del ovni en el mapa | — |
| 14 | La pala del alguacil | **Ausente** | — | — |
| 15 | El duelo cinematográfico | **Ausente** | — | — |

RC18c es RC18 más los tres arreglos de RC18b y el puzle 3; el resto de la cadena no cambia. Siguiendo la restricción 7, no se ha repetido la partida completa en RC18c.

---

## 5. Navegación actual

| Mecanismo | Cómo funciona | Código | Qué pasa en el móvil |
|---|---|---|---|
| Salidas | 25 zonas **invisibles**, en bordes o puertas. Al tocar, el viajero anda hasta su punto y hay un fundido | HTML l.2578-2584 y l.2604 | Nada indica que existen |
| Nombre de una zona | Solo al pasar el **ratón** por encima | HTML l.2255 | En el móvil no aparece nunca |
| «Revelar» | Una pulsación larga en un sitio vacío enseña las zonas durante 2,4 s | `rc07.js:594`, `640-655`; HTML l.2700 | Nadie lo descubre; letra de 22 px, unos 9 px reales en el Pixel |
| Mapa | Botón en (1530, 254), el tercero de la columna derecha. **Solo aparece tras el mapa de Rai** | `g11_journey.js:61`; `rc17.js:632-635` | Sin mapa la primera parte; no está en la esquina superior derecha |
| Ruta | En el mapa se toca un destino y en la escena aparece una flecha con la salida siguiente | `g11_journey.js:117-130`; `rc07.js:713-740` | Funciona, pero hay que descubrir el mapa y marcar un destino |
| Objetivo | Solo en el menú de pausa y en tres rótulos «OBJETIVO» | HTML l.2281; `rc17.js:309, 530` | Nunca está a la vista |
| Pistas «?» | Texto con direcciones («sal por la derecha…») | `rc17.js:565-587`, `rc18c.js` | Es la única guía |
| Nombre del lugar | Arriba al entrar: 2,6 s, o 4,2 s la primera vez | HTML l.2031, l.2237 | Bien |
| Saltos automáticos (6) | La lanza lleva al soto; el gato, al Chamelo; la confesión, a la plaza; el rescate, a la Plaza Mayor; la destitución, a la Puerta del Río; la campana, a la ribera | `rc17.js:392, 434, 227, 475, 517, 550` | Desorientan a quien no tiene mapa |
| Nombres engañosos | En la Puerta del Río, «Camino a la ribera» lleva al **embarcadero**, cruzando el Tajo a pie. «Postigo de la ciudad» lleva a la Plaza del Pan | Datos de `puerta_rio` | Confunde |
| Puertas cerradas (4) | Portazgo, siempre; Plaza Mayor, hasta el rescate; embarcadero, hasta la rueda; vado, hasta la rueda y Mingo | `rc17.js:311-313`; G12 | Avisan con una frase; bien, salvo el portazgo, que nunca abre |
| Zurrón | Arriba a la derecha desde RC18b. Mingo va dentro como si fuera un objeto (`rc17.js:179`) | — | Mingo en el zurrón apenas sirve: solo reaccionan a él 2 zonas del soto, el ciego y Rai |

**Zonas táctiles pequeñas.** En el Pixel 7 apaisado, 1 px lógico son 0,4 px CSS, y lo recomendable es al menos 44 px:

| Zona | Tamaño en pantalla |
|---|---|
| Salida de la Corredera a la Puerta | 28 px de ancho |
| Salida del soto | 36 px |
| Salida del embarcadero | 38 px |
| Puerta de la aceña | 42 px |
| Cuerda de la campana | 22 px de ancho |
| Pértiga de la ribera | 78 × 28 px |
| Raíces de paloduz | 66 × 18 px (la mata, de 49 × 47 px, también vale) |

**Ruido en pantalla:** el aviso «Efectos reducidos para ir más fluido» (HTML l.5953) sale en el móvil, en las capturas del atrio y de la Plaza Mayor.

---

## 6. Qué cuenta el juego de Nuño y de Rai

### Don Nuño

| Lo que pide el guion | ¿Está en el juego? | Dónde | Obligatorio u opcional |
|---|---|---|---|
| Administrador de la señora de Oropesa | Solo de palabra | Sancha, si le preguntas «¿Quién es Don Nuño?» (`rc17.js:294`) | Opcional |
| Cobra tasas por todo | Sí, **repetido al menos 8 veces** | Martín en la travesía (`rc17.js:263`); pregonero (`:299`); Sancha (`:294`); Alonso (nodos `nuno` y `adios`); comentarios de Benito y Sancha; tablón de la plaza; aviso de la Plaza Mayor (`:313`) | 2 obligatorias, el resto opcionales |
| Quiere quedarse el alfar por una deuda pequeña | A medias: se oye la deuda, no la codicia | «Por tres dineros de deuda, este alfar queda precintado» (`:367`). El guion dice «mira su futura propiedad»; el rótulo dice «Nuño mira el alfar» (`:342`) | Obligatorio |
| Está detrás del falso monstruo | **Ausente** | — | — |
| La señora lo destituye | Sí | `:503-517` | Obligatorio |
| Vanidad | Confusa | Un rótulo dice que «se mira en el móvil del forastero» (`:506`) sin explicar cómo lo tiene | Obligatorio |

Nuño sale en pantalla **dos veces**: en el alfar y en la Plaza Mayor. Su casa (portazgo) no se puede visitar. El jugador lo conoce sobre todo por lo que dicen otros, y la relación con la señora que lo destituye solo aparece en una charla opcional.

### Rai

| Lo que pide el guion | ¿Está en el juego? | Dónde |
|---|---|---|
| Es el hechicero que trajo al viajero | Sí, en la confesión: viñeta del caldero y las tres réplicas | `rc17.js:214-224` (obligatorio, a mitad del juego) |
| Oculta su culpa (pistas) | Sí, sueltas | «¡Botas blancas! Digo… bienvenido» (`:211`); Martín: «pregunta por ti desde ayer» (`:256`, solo si visitas a Martín antes); «¿Qué tal el viaje? …Digo, el camino» (`rc18c.js`) |
| Se convierte en gato | Sí, con pistas | «Yo voy… por otro lado» (`:390`); guiño del gato (`:433`); pelos en la túnica (`:216`); gato del final (`:134`) |
| Explica el eclipse y la campana | Sí | `:222-223` |
| Tiene una función jugable | Sí: mapa (puzle 3), alarma en la taberna, el gato (puzle 6) y el «¡Ahora!» (puzle 10) | — |

Lo que falta, y es la raíz de que Rai no se entienda: **el viajero nunca dice que quiere volver a casa** antes de la confesión.
- Los objetivos del Acto I son «recuperar el móvil», «cruzar el Tajo» y «ver a Rai» para conseguir un mapa.
- Dentro de la partida, el año 1248 solo aparece en el rótulo inicial y en una pregunta opcional a Durán (HTML l.3358).
- Los comentarios de Rai lo presentan como «apicultor» y no como hechicero: «¿Hechicero? Apicultor con buena fama» (`rc07.js:554`). Mingo, además, lo desmiente: «Rai dice que los pesca con un conjuro. Yo le he visto usar una caña» (zona del río en el soto).

---

## 7. Cuánto texto hay

### Texto obligatorio

En el camino principal hay **168 líneas y 1.304 palabras**, repartidas en 31 secuencias. **44 de esas líneas (26 %) son acotaciones** del tipo «(…)» que **cuentan** una acción en vez de mostrarla. Muchos chistes viven en esas acotaciones: la balanza marca «una gallina», Alonso carga y se enreda, a Nuño se le derrite el lacre.

| Secuencia | Líneas | Acotaciones | Código |
|---|---|---|---|
| Pesaje y rescate (puzle 7) | 18 | 5 | `rc17.js:452-475` |
| Trato del paloduz (puzle 3) | 12 | 3 | `rc18c.js` |
| Carbón y desenlace del alfar (puzle 5) | 10 | 4 | `rc17.js:338-350` |
| Truco de Mingo (puzle 1) | 9 | 3 | `rc17.js:170-180` |
| Confesión de Rai | 9 | 2 | `rc17.js:214-227` |
| Destitución | 9 | 2 | `rc17.js:503-517` |
| Llegada y robo del móvil | 8 | 2 | `g12_content.js:30-46` |
| Regreso y epílogo | 8 | 6 | `rc17.js:129-141` |
| Lanza de Alonso y alarma | 8 | 2 | `rc17.js:381-392` |

### Texto opcional

- **Alonso:** 36 líneas en su árbol (seis aventuras de 4 líneas, «¿Quién sois?», Nuño, Fortún).
- **Comentarios espontáneos:** 13 personajes en juego con 1 a 5 frases cada uno (la tabla `rc07.js:548-568` tiene 19 entradas; 6 son de personajes inactivos), más 4 frases de espera del viajero.
- **Chistes repetidos:** «¿Es de Toledo?» (Mingo y Durán) y «cobra hasta el aire o por mirar» (§6).
- **Restos de la trama del hambre**, que se eliminó: «Y mi estómago dice… sin desayunar» (`g12_content.js:33`).

### Alonso

Su humor es casi todo **de palabra**: las aventuras de la taberna. Sus fracasos se cuentan en rótulos y no se ven:
- «se levanta… y se vuelve a sentar. La rodilla.» (`rc17.js:389`)
- la carga con la lanza (`:462`)
- cuando sube colgado de la cuerda (`:539`)

No tiene animación de andar, aunque hay clips (§3).

---

## 8. Otras incidencias

| Incidencia | Dónde | Estado |
|---|---|---|
| La ilustración del mapa rotula «Vista Pública» (trama eliminada) y «Casa del Portazgo (Don Nuño)», que no se puede visitar | `E1248_ILLUS.map` = `art/portada/mapa_talavera_v2.jpg` | Confirmado |
| El mapa enseña desde el principio monstruo, ovni, dragón, aldea y «Gigante (dentro de unos 350 años)». El guion pide un mapa «aparentemente histórico» que gane anotaciones, y prohíbe nombrar a los gigantes de forma explícita | Ídem | Confirmado |
| Martín: «Una moneda por cruzar…» contradice «A los héroes les cobro a la vuelta» | `rc07.js:555` | Confirmado |
| Los textos llaman «gato negro» a un gato que en el arte de César es gris | `rc17.js:42, 425, 437, 573` | **Corregido en RC18d** |
| El gato no bosteza: no hay clip de bostezo | `rc17.js:134` | Pendiente de arte |
| Mingo en la higuera, con los zapatos cortados | Hoja de Mingo | Pendiente desde RC18: falta el clip |
| El repositorio guarda el texto del guion definitivo cortado en la sección X | `docs/GUION_DEFINITIVO.md:274` | Pendiente de César |

Capturas de apoyo en `production/CHAMELO/capturas/luna/`:
- `00_portada` y `01_ribera_inicio`;
- `escena_<id>`, una por escena (la de `travesia` muestra la Puerta del Río, porque esa escena salta sola);
- `orilla_revelar`, con la pulsación larga;
- `ribera_brillo_moneda`: 8 fotogramas seguidos del destello.
