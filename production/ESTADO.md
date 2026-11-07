# 1248 · Un extraño en Castilla — ESTADO DEL DESARROLLO (libreta de relevo)

Última actualización: 2026-11-07 · Última candidata: `builds/1248_LUNA_G12_ORILLA_RC03.html` (línea principal: G12)

## Cómo trabajar (para cada ejecución, también las automáticas)
1. `git pull`, leer este archivo entero y abrir la última candidata de `builds/`.
1b. Revisa `assets/inbox/`: si César ha subido material nuevo (vídeo, imagen, audio), míralo, úsalo en el tramo que corresponda, muévelo a su carpeta definitiva (`assets/source_clips/`, `art/concepts/`...) y anótalo en 'Hecho'. Los fondos verdes/blancos se recortan como en `production/G10/tools/key.py`.
2. Cerrar UN tramo jugable por ejecución (siguiente paso concreto, abajo). Orden: objetivo, personajes, puzle y salida primero; pulido después.
3. Crear una candidata NUEVA en `builds/` (`1248_LUNA_G##_<TRAMO>_RC##.html`); nunca sobrescribir las anteriores. Se parte de la última candidata y se parchea con un script en `production/G##/tools/` (el motor es un HTML único con recursos incrustados en `window.E1248_EMBED`; datos en `E.DATA.*`; API de pruebas `window.LAB1248`).
4. Probar en navegador (Playwright/Chromium preinstalado: `from playwright.sync_api import sync_playwright`) con «Mostrar artefactos» DESACTIVADO, con toques reales (`LAB1248.tapWorld`), recorrer entrada → siguiente escena y comprobar 0 errores en consola. Plantillas de test en `production/G10/tools/pt_*.py` (rutas absolutas dentro de los scripts: ajustarlas si el repositorio se clona en otro sitio). Sin red para pip/npm: usar solo lo ya instalado (cv2, numpy, scipy, PIL, ffmpeg).
5. Actualizar este archivo (Hecho / Siguiente paso / Limitaciones / Esperando a César), hacer commit con mensaje claro y `git push` a `main`. Avisar al final con una nota corta: qué cambia, cómo llegar, qué se verificó y qué no.
6. Si te quedas sin tiempo: deja la última candidata utilizable subida y escribe en "Siguiente paso concreto" el punto exacto desde el que retomar.

## Reglas
- César solo prueba. Tú decides la implementación. Consúltale SOLO si falta un recurso indispensable o hay una decisión narrativa/artística difícil de revertir; si no, anótalo en "Esperando a César" y sigue con lo que avance en paralelo.
- Dúo Acero es otro proyecto: no tocarlo. Rigor histórico separado de hipótesis artísticas y ficción.
- No presentes como hecho lo que no hayas probado en navegador. Arte provisional = marcarlo como provisional.
- Material: `art/concepts/refs_g10/` (9 láminas de referencia: composición, luz, textura acuarela, NO sprites técnicos), `assets/source_clips/` (clips: 233 Durán habla, 234 Durán escucha, 252 Durán marcha, 216-225 jugador; 224 tiene fondo blanco, el resto verde), `docs/`, guion y Biblia visual G06.1 en Drive (carpeta 1ObYGWJCdx0Qt8i9b9ECBkVvqbm0b68vT, solo lectura desde el conector).

## Hecho
- **G10** `1248_LUNA_G10_ALFONSO_RC01.html`: ribera → aceña de Durán → embarcadero de Alfonso, jugable de principio a fin (final provisional `endLab` al subir a la barca).
  - Zonas pulsables de la ribera corregidas; camino inundado pintado como agua real; el viajero se detiene en tierra firme.
  - Durán con clips reales (habla/escucha/marcha), estados según turno de diálogo, vuelve a reposo al terminar o saltar frase. Hoja generada con `production/G10/tools/build_duran.py`.
  - Rueda: pértiga/lazo → rueda libre → agua vuelve al caz → camino abierto → Alfonso.
- Verificado en navegador (artefactos desactivados): 14 zonas de la ribera, recogida de objetos, entrada a la aceña, parada ante el agua, recorrido completo, 0 errores.

- **G10 RC02**: Alfonso con clip real (`1000701584`): reposo (fotograma con respiración) + marcha de perfil con ciclo ligado a la distancia (L=34 f, zancada 118 px, velocidad 100). Al hablar usa el reposo con cabeceo procedural (no hay clips de habla/escucha). Build: `tools/key_alf.py`, `tools/build_alfonso.py`, `tools/patch_g10_rc02_alfonso.py`. Probado en navegador: 0 errores. Ilustración limpia de referencia: `art/concepts/refs_g10/ref_12_alfonso_perfil_ilustracion_limpia.jpg`.

## Material del protagonista disponible (clips en `assets/source_clips/`)
- 222: se coloca la chaqueta y queda de pie quieto → REPOSO. 223: gesto de habla (fondo verde claro). 224: igual que 223 pero fondo blanco con acuarela (no usar). 225: gestos de señalar/dar. 216: marcha de tres cuartos hacia la IZQUIERDA (el arte mira a la izquierda; corregido en RC04). 218: usa el móvil en plano cerrado (zoom, no sirve como sprite a escala).

## Siguiente paso concreto
**Línea principal: G12** (ver secciones «G12 RC01/RC02» al final). Build: `python production/G12/patch_g12.py builds/1248_LUNA_G10_ALFONSO_RC02.html builds/1248_LUNA_G12_<TRAMO>_RC##.html RC##`
(encadena G11 + RC10 + G12). Contenido nuevo en `production/G12/*.js` (añadir el archivo a la lista de `patch_g12.py`). Test de referencia: `production/G12/tools/pt_g12.py` (ampliarlo con cada tramo).
Personajes nuevos = marionetas (`rig(...)` en g12_content.js, opciones en g12_rig.js). Escenarios nuevos = acuarela procedural tomando como plantilla `production/G12/tools/make_orilla.py` (capas far/near/front con paralaje).
Plan de tramos (uno por ejecución, en este orden):
1. **G12 RC03 · Isla del Chamelo y Leonor (amor inesperado).** Con `rueda_libre` el vado de la orilla se abre (hotspot `vado` → nueva escena `isla`, ~3200 px). Leonor: apicultora y pescadora, lista, con genio (rig build 'woman', toca/pañuelo, delantal, colmenas). Primer encuentro cómico (la abeja pica al protagonista; Mingo se ríe; ella se ríe de su ropa y del móvil). Puzle corto: recuperar su barca/nasa o calmar la colmena (humo: Mingo + yesca/paja). Ella cuenta que Nuño esconde en el Chamelo lo que cobra de más (el «arca de los portazgos» o un libro de cuentas doble) y lo vio enterrarlo. Objeto clave: `libro_cuentas` (o llave del arca). Ganchos de amor: diálogos con chispa, rel leonor +, «flor de jara» opcional. Pistas (D.hints) y Mingo comentando todo.
2. **G12 RC04 · Hambre y lecho en la villa.** En la Plaza del Pan, Doña Sancha vende pan pero Nuño ha subido el «portazgo del pan»: conseguir una hogaza (trueque con los higos de Mingo o un número de juglar). Lecho: el mesón cobra lo que no tienes → pajar del alfar de Yuçaf; escena de noche (fundido, ronquidos de Mingo, sueño corto con el móvil brillando: gancho del final). Objetivos visibles «Comer de verdad» / «Encontrar dónde dormir».
3. **G12 RC05 · La Vista con Leonor.** En la audiencia, el `libro_cuentas` (o el arca) y el testimonio de Leonor se suman a las pruebas del juglar; Mingo hace la trastada decisiva (distrae al mayordomo / cambia el sello). Desenlace con Nuño más cómico. Ajustar pistas y pt_g12.py.
4. Después: repintar en acuarela las escenas de la villa (hoy son marcadores planos: puerta_rio, plaza, iglesia, portazgo, audiencia, alfar) con el método de make_orilla.py; marco de azulejo para diálogos/zurrón.
## Limitaciones conocidas
- Arte de aceña y embarcadero provisional (placeholders). Alfonso con una sola pose.
- Clips del jugador (216-225) sin integrar.
- Marcha de Durán reproducida a ~1,8× la velocidad natural del clip (105 px/s con stride 125).
- La rueda del fondo de la ribera aparece girando aunque esté parada (viene del arte).

## Material nuevo recibido (6 nov, tarde)
- `assets/inbox/alfonso_marcha_perfil_1000701584.mp4`: Alfonso caminando de perfil mirando a la derecha, 720×1280, 24 fps, 8 s, fondo verde. Sombrero de paja, chaleco azul, cinturón de cuerda. Sin integrar todavía (Alfonso hoy es una sola pose). Idea: hoja con marcha + reposo (fotograma de pie) con el mismo pipeline que Durán (`production/G10/tools/key.py`, `build_duran.py`).
- `art/concepts/refs_g10/ref_10_alfonso_de_pie_manos_en_cintura.png`: captura de otro clip de Alfonso (de pie, de frente, manos en la cintura, "Personaje de pie con manos", Omni 1.1 Flash). El clip original NO está subido.
- `ref_02.jpg` (captura de la aceña con arte nuevo de rueda/tronco/barriles/muela) ya estaba en refs; trae HUD y texto, no vale como fondo limpio.

## Esperando a César
- (7 nov) Decisión de estilo abierta con César: propuesta «línea de cómic + lavado de acuarela» para todo (fondos suaves, personajes con tinta fuerte, proporciones de dibujo animado, camino de suelo claro en el tercio inferior de cada fondo). Documento con fichas de personajes, movimientos y plantillas para Flow/Gemini: https://claude.ai/artifact/WCkmcfbDPhCHDQZDV77Pcp (Claude Docs). Hasta que responda, no repintar escenas en un estilo definitivo; seguir con contenido y marionetas.
- (7 nov) Para G12 sería ideal arte de Gemini en acuarela: panorámicas por capas de la orilla/Isla del Chamelo y clips (fondo verde) de Mingo, el ciego y Leonor. No bloquea: hay marionetas y acuarela procedural.
- Material pedido (ver lista en la conversación): fondo limpio de la aceña sin HUD y por capas; clips de Alfonso de habla/escucha/reposo; fondo/capas del embarcadero; arte de la Puerta del Río. Nada bloquea: se avanza con arte provisional.
- (nada por ahora)

## G11 · Juego completo con arte provisional (RC01) — HECHO
- Build: `builds/1248_LUNA_G11_COMPLETO_RC01.html` (se genera con `production/G11/patch_g11.py` desde G10 RC02 + `g11_placeholders.js` + `g11_content.js`).
- Ruta: embarcadero → travesía (Alfonso) → Puerta del Río (carreta: cuña+palanca → Yuçaf da sello gremio + cántaro; Don Nuño aparece y lanza su bando) → Plaza del Pan (Sancha, Lope: cántaro↔badajo; pregonero) → Iglesia (Fray Benito: badajo → sello parroquia) → Casa del Portazgo (móvil como espejo ante Nuño → sello alguacil) → Vista Pública (mayordomo: 3 sellos + bando de Nuño → Nuño atrapado en su propio bando) → alfar: epílogo y horno final (usar móvil) → fin.
- Villano cómico: Don Nuño de Mala-Cuenta (tasa por todo, vanidad ante el espejo, se contradice con su propio bando).
- Test: `production/G11/tools/pt_g11.py <html> <tag>` recorre todo con taps reales, 0 errores. Viga = palanca de reserva por si Alfonso se queda la pértiga.
- Pendiente: arte real de todo lo nuevo, sprites propios de los NPC nuevos (ahora muñecos procedurales), integrar clips del protagonista (222/223/216), audio/música, pulir textos y humor.

## G11 RC02 — correcciones tras la prueba de César (6 nov, 20:23)
- Problema: no se entendía qué hacer (Talavera «inalcanzable», la rueda visible en la ribera no era tocable, nada guiaba). Hecho: objetivo al empezar, botón «?» de pista contextual (`E.DATA.hints` en `g11_content.js`, el botón late tras 40 s sin avanzar; el menú de pausa muestra el objetivo), Talavera/río/aceña/rueda exterior explican y llevan a la puerta de la aceña.
- Charco de la ribera: borde difuminado (ya no parece un recorte pegado).
- Protagonista: hoja nueva desde los clips reales 216 (marcha, 36 fot.), 222 (reposo) y 223 (habla, ida y vuelta) con `production/G11/tools/key_player.py` y `build_player.py`; marcha por distancia (stride 190, velocidad 210). La hoja antigua (la de G05/G08, 8 fot. rígidos) ya no se incrusta.
- Pruebas: `tools/pt_g11.py` (partida completa), `pt_hints.py` (pistas del tramo 1), `pt_ux.py` (clics reales: pista, Talavera, caminar, rueda exterior).
- Pendiente: reposo con clip propio de escucha; transición habla↔reposo tiene un salto de pose (reposo brazos abajo vs. habla manos en tirantes); stride del jugador estimado (no medido con suelo real).

## G11 RC03 — corrección del «moonwalk» (6 nov, 20:58)
- Causa: el clip 216 desliza el pie apoyado hacia delante respecto al cuerpo; reproducido tal cual el personaje andaba hacia atrás. Solución: ciclo invertido en `build_player.py`. Medido sobre la hoja: el pie apoyado retrocede de forma lineal 4,5 px de celda/fotograma ⇒ zancada real 140 px de juego (antes estimada a ojo en 190-220). Velocidad del jugador 180.
- Build: `builds/1248_LUNA_G11_COMPLETO_RC03.html`.

## G11 RC04 — moonwalk de verdad + banda sonora (6 nov, 21:14)
- RC03 estaba mal: el error NO era el orden del ciclo, sino que los clips del protagonista (216/222/223) miran a la IZQUIERDA y la hoja se declaraba `baseFacing:'right'`. Ahora `baseFacing:'left'` (anims `*_left`) y el ciclo vuelve a su orden original. Zancada medida 140, velocidad 180.
- Música: `assets/music/Caminos_de_Castilla_original.mp3` (original de César) y `caminos_de_castilla_96k.mp3` (incrustada, 96 kbps). Bucle con entrada suave (4 s), volumen 0.34 bajo el volumen general; la silencia el ajuste «Sonido» del menú; arranca con el primer toque. Código en `patch_g11.py` (sección «banda sonora»).
- Build: `builds/1248_LUNA_G11_COMPLETO_RC04.html`.

## G11 RC05 — ilustraciones del mural (6 nov, 21:35)
- César confirma que las acuarelas con marco de azulejo son obra de su padre y que tiene autoridad para usarlas. Son tres paneles de un mismo mural (puente con barca y burro; pescador y familia en la orilla; gente en la orilla con Talavera al fondo). Falta un cuarto panel que no llegó.
- Recortes y versiones 16:9 en `art/ilustraciones_mural/` (`crop_*` completos, `game_*` 1600×900). Uso en RC05: título (puente_barca), menú de pausa (pescador_orilla) y pantalla final (gente_ribera), incrustados por `patch_g11.py`.
- Ideas siguientes: marco de azulejo para diálogos/zurrón, fondos de escena (el puente con barca = embarcadero), tarjetas de capítulo.

## G11 RC06 (portada-mapa + aligerado)
- Portada nueva: mapa ilustrado de Talavera 1248 (art/portada/mapa_talavera.svg/.jpg, generado por production/G11/tools/make_map.py). Tono disparatado-histórico: monstruo del Tajo vegetariano, dragón dormido en Gredos, galeón perdido, ovni con oveja, molino «gigante dentro de 350 años», puente en obras, guiños históricos (Fernando III conquistando Sevilla en 1248; «de la Reina» llega en el s. XIV). Marco de azulejo talaverano.
- Título: mapa a pantalla completa + barra inferior de botones; anillo pulsante en «¡Tú estás aquí!»; «Nueva partida» hace zoom de 1,6 s al punto de llegada y funde a la ribera (tocar salta). La acuarela del puente ya no se usa en el título (pausa y final siguen con el mural).
- Tirón de Durán en móvil (no reproducible en headless, 60 fps): se reduce presión de memoria → hoja del protagonista 2880×3480 (antes 2880×4872; habla 64 fotogramas a 8 fps) y música por streaming (<audio> + MediaElementSource) en vez de decodeAudioData (~60 MB menos).
- Verificado: partida completa pt_g11 sin errores; pt_perf 60 fps sin fotogramas largos; capturas de título/zoom/ribera en viewport de móvil.

## G11 RC07 (trama «El juglar que faltaba» + mapa de viaje)
- César pasó 1248_LUNA_EL_JUGLAR_RC01 (copia en referencias/): era una rama de nuestro G11 RC01 con otra trama y un mapa de viaje. Su animación NO aporta nada (usa la hoja antigua del protagonista; Durán y Alfonso idénticos), así que se conserva la nuestra.
- Se adopta su trama (production/G11/g11_juglar.js, cargada tras g11_content.js): al extraño lo toman por el juglar que falta en el mercado. Puzles: soltar el cabo de la barca con la pértiga con lazo (pasaje gratis), paradoja de Gil del Paso / Gil del Peso (reglamento del postigo), truco de la herradura de Lope (ver el hilo con la luz del móvil o harina) → badajo, campana con 1/2/3 toques (tres convocan la Vista), retrato de Nuño en el atril para robar el sello, Vista Pública con testigo + marca del cántaro boca abajo + cláusula → Nuño paga la Pieza del Rey; epílogo de la foto con Yuçaf. Carreta de Yuçaf queda como reto opcional.
- Pistas «?» reescritas para la nueva cadena (E.DATA.hints al final de g11_juglar.js). Primera escena conserva el OBJETIVO.
- Mapa de viaje rehecho en el lienzo (production/G11/g11_journey.js) sobre el mapa ilustrado: botón bajo «?» y entrada «Mapa de Talavera» en pausa; lugares numerados (actual/visitado/por descubrir), tocar = destino, ruta animada, y en escena una flecha con el nombre de la salida siguiente. Sonido de campana tomado del juglar.
- Mapa ilustrado corregido: la ribera de llegada, la aceña y el embarcadero pasan a la orilla SUR (Talavera queda enfrente, como en el juego); alcázar junto al río; Judería, Morería, Puertas de Mérida y Toledo, Vista Pública, Casa del Portazgo; ruta de la barca.
- Verificado: pt_juglar.py (partida completa por la nueva trama, sin errores), mapa y guía en capturas, 60 fps.

## G11 RC08 (ritmo de lectura)
- César: «los diálogos van demasiado rápido». Causa: las frases de guion (say/notas) se cerraban solas a 1,3 s + 42 caracteres/s. Ahora 14 car/s con mínimos de 2,6 s (bocadillo) y 3,6 s (nota): una frase de 100 caracteres dura ~8 s. Un toque sigue adelantando.
- Los bocadillos que esperan muestran un «▸» parpadeante. Pausa → «Texto: normal / rápido / lento» (14 / 22 / 10 car/s, se recuerda en el navegador). Menú de pausa compactado para que quepan 9 botones.
- Los diálogos con caja (conversaciones) ya esperaban al toque; no cambian.
- El JUGLAR reenviado es el mismo archivo (md5 idéntico); no tenía nada sobre el ritmo de texto.

## G11 RC09 (arreglo: no salía el protagonista)
- Desde RC06, al empezar con «Nueva partida» (zoom del mapa) la ribera aparecía SIN protagonista y el juego quedaba en transición. Causa: tras G.newGame() el título ponía U.fadeTarget = 0, y el cambio de escena del motor espera a que el fundido llegue a 1 → nunca cargaba al jugador. Ahora solo se pone U.fade = 1 y el motor hace su fundido.
- Las pruebas automáticas no lo detectaban porque llaman a G.newGame() directamente; tools/dbg_start.py ahora entra por el botón real del título y comprueba que existe el jugador.

## G11 RC10 — tarjetas de capítulo (7 nov, ejecución automática)
- Primera visita a cada lugar (10 escenas): cartela grande «Capítulo N · nombre · frase» (4,2 s, no bloquea; un revisit vuelve al rótulo pequeño; al cargar partida guardada no sale). Textos de las frases = provisionales, de tono cómico, editables en `CHAPTERS` de `production/G12/patch_g11_rc10.py`.
- Build: `builds/1248_LUNA_G11_COMPLETO_RC10.html` = RC09 + `python production/G12/patch_g11_rc10.py RC09 RC10` (los parches de RC10 se aplican sobre el HTML de RC09, no sobre G10).
- Verificado en navegador (Chromium, artefactos desactivados): `production/G12/tools/pt_cards.py` (tarjeta en ribera y aceña, revisita sin tarjeta, capturas en `production/G12/shots/`) y `production/G11/tools/pt_juglar.py` (partida completa hasta el horno, 0 errores, 0 avisos). No probado: móvil real, ni tarjetas de portazgo/audiencia/alfar/iglesia con captura (misma ruta de código).
- Nota: la primera ejecución de pt_juglar sobre RC10 falló una vez con un `undefined.exit` (timing al lanzarlo junto a otro test); repetida dos veces, pasa igual que RC09.

## Esperando a César
- Nada bloquea. Siguen siendo bienvenidos: fondo limpio de aceña/embarcadero/Puerta del Río y clips de habla/escucha de NPC.
## G12 RC01 · Acto I «La orilla» (7 nov)
Petición de César: más encanto Monkey Island, personajes mejor estructurados, un chico pícaro compañero, mejores animaciones,
escenarios por los que pasear (entorno del Tajo, Los Sifones, Isla del Chamelo), acabado pictórico/acuarela, guiño al Lazarillo
con un ciego, y objetivos que den dirección (comer, un lecho, un amor inesperado) hacia el desenlace con el villano.
Hecho (production/G12, build con `python production/G12/patch_g12.py builds/1248_LUNA_G10_ALFONSO_RC02.html salida.html RC01`):
- **Marionetas articuladas** (g12_rig.js): todos los vecinos (Gil, Yuçaf, Nuño, Sancha, Lope, pregonero, Benito, Gutierre) + Mingo y el ciego
  se dibujan en vivo con esqueleto: marcha con pies plantados (IK), respiración, parpadeo, boca y gesto al hablar, cabeceo al escuchar,
  trabajos (martillo, pregón, remover, malabares, bastón). Protagonista, Durán y Alfonso siguen con sus clips.
- **Mingo** (g12_companion.js): roba el móvil al llegar, se esconde en la higuera; tras el trato se une: sigue al jugador entre escenas,
  hace malabares/comenta si se aburre, comenta lo que miras (campo `mingo` de los hotspots), está en el zurrón como «objeto» para
  «Usar Mingo con…» (verbos `use:mingo`; si no hay, se niega con gracia) y da la pista actual con su voz («¿Y ahora qué hacemos?»).
- **La orilla · Soto de los Sifones**: escena de 4000 px (2,5 pantallas) con paralaje (cielo/Talavera a 0,55, juncos delante a 1,22),
  acuarela procedural (production/G12/tools/make_orilla.py → art/escenarios/orilla/). Sifón de Maese Hamid (guiño a Los Sifones),
  huerta con espantapájaros y cuervo Tello, higuera, parra del ciego, vado e Isla del Chamelo (aún cerrada: gancho del Acto II, Leonor).
- **El ciego Nicolás** (guiño al Lazarillo): uvas «de una en una / de dos en dos / de tres en tres», la paja del vino, la longaniza por el nabo, el «¡saltad, que es estrecho!».
- Cadena: llegada con hambre → Mingo roba el móvil → orilla → trato con Mingo → el ciego pide su cuenco (pértiga) → uvas → Mingo devuelve el móvil y se une.
  Sin Mingo no se sube a la barca (los puzles de la villa necesitan el móvil). Luego sigue la trama del juglar intacta.
- Filtro acuarela offline sobre la ribera: probado y descartado (ensucia la pintura). El acabado acuarela va en el arte nuevo y en el pedido de arte.
- Verificado: production/G12/tools/pt_g12.py = partida completa (Acto I + toda la trama) sin errores; 60 fps en orilla y plaza.
Siguiente (plan Actos II-III): hambre 2 en la Plaza del Pan (Sancha, el pan gravado por Nuño), lecho (mesón caro → pajar; escena de noche),
amor inesperado con Leonor en la Isla del Chamelo (vado abierto al liberar la rueda; ella sabe el secreto de Nuño) → pruebas para la Vista;
repintar escenas de la villa (ahora marcadores planos) en acuarela; pedir a César arte Gemini/clips para Mingo, ciego, Leonor y panorámicas.

## G12 RC02 (7 nov) = G12 RC01 + tarjetas de capítulo de G11 RC10
- patch_g12.py ahora encadena: patch_g11.py (G10 RC02 → G11 RC09) → patch_g11_rc10.py (tarjetas) → cambios G12. La orilla es el Capítulo II (el resto se renumera); frase de la ribera ajustada al tono del Acto I.
- **La línea principal pasa a ser G12.** Cualquier mejora nueva se añade a production/G12 (o como parche encadenado en patch_g12.py), no sobre los HTML de G11.
- Verificado: pt_g12.py partida completa sin errores; inicio desde el botón del título con protagonista y tarjeta de capítulo.

## G12 RC03 · Aceña con el arte mejorado de César (7 nov)
- `art/escenarios/acena/acena_mejorada_original.jpg` (2576×1438, venía de una captura: traía zurrón y rótulo). `production/G12/tools/build_acena.py` lo limpia (copia tablas del suelo), pinta la puerta de salida (era un rectángulo crema) con luz de día, recorta el poste como capa ordenada y genera: `bg.webp`, `ventana_libre.webp` (ventana sin rueda ni tronco) y `rueda.webp` (rueda completa redibujada con la paleta del arte: 16 álabes, 12 radios, 12 abrazaderas).
- Rueda parada = el arte tal cual (con el tronco). Al liberarla: ventana limpia + la rueda gira recortada a la ventana (nuevo `clipRect` en ambientes 'spin') + agua.
- Verificado: capturas parada/girando; pt_g12.py partida completa sin errores.

## Portada ilustrada recibida (7 nov) — pendiente de integrar en la línea G12
- César entregó la portada (acuarela: el extraño + siete personajes, título «1248 · Un extraño en Castilla»): `art/portada/portada_1248_original.jpg` (1672×941) y `portada_1248_game.jpg` (1600×900).
- Ya probada como pantalla de título sobre la línea antigua: `builds/1248_LUNA_G11_COMPLETO_RC11.html` (parche `production/G12/patch_g11_rc11.py`: sustituye el mapa por la portada en el título, sin zoom; prueba `production/G12/tools/pt_title.py`, 0 errores). **Falta llevarla a la línea G12** (siguiente RC de G12: aplicar el mismo cambio al título).
- César (7 nov): «no hay ni una chica en mi historia». Hoy solo existe Doña Sancha (panadera, plaza) y la portada no tiene ninguna mujer. Decisión narrativa pendiente de César (ver «Esperando a César»); propuesta: personaje femenino con peso en la trama, no solo ornamento.

## Decisión narrativa de César (7 nov): la hija de Durán
- Ver `docs/PERSONAJE_HIJA_DE_DURAN.md`. Hija de Durán; se enamora del protagonista y Durán lo nota (gags). Nombre provisional «Elvira».
- Siguiente RC de G12 que toque la aceña: añadir a Elvira (provisional, marcada) con diálogos y gags de Durán; respetar el flujo del puzle actual.
- Esperando a César: arte/clip de Elvira, nombre y edad definitivos, portada con ella.

## Mapas de zona caminable de 6 fondos nuevos (7 nov)
- Puente, plaza del mercado, aceña, calle de casas, taberna, puerta de muralla: ver `production/G12/walkmaps/` (JSON + capturas) y fondos en `art/escenarios/nuevos/`. Sin integrar todavía; son la base del Acto II (villa/taberna/Puerta).
- Portada con Elvira: G12 RC04 (`production/G12/patch_cover.py`).

## Talavera al fondo de puente y aceña (7 nov)
- Versión provisional procedural pintada en el horizonte de los dos fondos (`art/escenarios/nuevos/*_talavera.jpg`). Detalles, rigor histórico y prompt para la versión definitiva en `docs/TALAVERA_1248_FONDO.md`. Sin cablear en el juego aún.
