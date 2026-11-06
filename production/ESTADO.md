# 1248 · Un extraño en Castilla — ESTADO DEL DESARROLLO (libreta de relevo)

Última actualización: 2026-11-06 · Última candidata: `builds/1248_LUNA_G10_ALFONSO_RC01.html`

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

## Siguiente paso concreto
- **Tramo 2 · Puerta del Río / murallas** (Biblia G06, SCN_03_PUERTA_RIO): carreta atascada, postigo, mesa de portazgo. Sustituir el final provisional (`endLab` al subir a la barca) por la transición a esta escena (cruce del Tajo → llegada a la puerta). Candidata prevista: `1248_LUNA_G11_PUERTA_RIO_RC01.html`.

## Limitaciones conocidas
- Arte de aceña y embarcadero provisional (placeholders). Alfonso con una sola pose.
- Clips del jugador (216-225) sin integrar.
- Marcha de Durán reproducida a ~1,8× la velocidad natural del clip (105 px/s con stride 125).
- La rueda del fondo de la ribera aparece girando aunque esté parada (viene del arte).

## Esperando a César
- (nada por ahora)
