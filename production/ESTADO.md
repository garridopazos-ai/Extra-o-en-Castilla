# 1248 · Un extraño en Castilla — ESTADO DEL DESARROLLO (libreta de relevo)

Última actualización: 2026-11-06 · Última candidata: `builds/1248_LUNA_G10_ALFONSO_RC02.html`

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
- **Tramo 2 · Puerta del Río / murallas** (Biblia G06, SCN_03_PUERTA_RIO): carreta atascada, postigo, mesa de portazgo. Sustituir el final provisional (`endLab` al subir a la barca) por la transición a esta escena (cruce del Tajo → llegada a la puerta). Candidata prevista: `1248_LUNA_G11_PUERTA_RIO_RC01.html`.

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
