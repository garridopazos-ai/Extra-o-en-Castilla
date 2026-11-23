# Auditoría del sprint de 24 horas

23 de noviembre de 2026 · Fase 0: **PASS** · Aptitud de RC21 para entrega: **FAIL**.

Base: `main@f488233d65c98cb5258becca80d87eba7e9b2ca7`. Candidata: `builds/1248_CHAMELO_RC21.html`. Esta fase añade únicamente el informe.

## Base técnica

El repositorio conserva 38 HTML en `builds/` y dos referencias. La libreta `production/ESTADO.md` identifica RC21 como base de la próxima candidata. El README aún presenta G10. RC21 es un HTML autocontenido: 38.125.479 bytes, motor Canvas 2D, scripts de contenido superpuestos y recursos incrustados. El código ejecutado está dentro del HTML; los parches y módulos activos están en `production/CHAMELO/`, el arte en `art/` y los clips y música fuente en `assets/`. Las comprobaciones históricas son scripts Python/Playwright; el árbol carece de una suite CI y de un manifiesto npm.

Se inspeccionaron el inventario del árbol, las fuentes ejecutadas de RC21, los módulos de escenas y contenido, el guion, la revisión de puzles, los informes de relevo y los arneses de QA. El inventario activo contiene 15 definiciones de escena, 34 NPC, 22 objetos y 22 entradas de diálogo. Las 15 definiciones incluyen material histórico como Portazgo y cuentan definiciones, no escenas necesariamente visitables en el recorrido vigente.

## Criterios de entrega

| Criterio | Evidencia de RC21 y trabajo pendiente |
| --- | --- |
| 1. Arranque, guardado, carga y salida | En Node con DOM, Canvas y almacenamiento simulados: portada, nueva partida, ribera, pausa, guardado y carga, con cero errores registrados por el motor durante la comprobación. **Pérdida de partidas reproducida:** ocultar la página en la portada sobrescribe el guardado previo con el estado de la ribera precargada. Pausa carece de salida al título. Revisar también guardados durante transiciones, diálogos y secuencias. |
| 2. Menús y ajustes | Se renderizaron portada y pausa en el arnés. Pausa tiene guardado, carga, reinicio, velocidad de texto, sonido, niveles de música y ambiente, efectos visuales, pantalla completa y depuración. Pendiente verificar los ajustes de extremo a extremo y su persistencia. La build usa textos en castellano; el motor inspeccionado carece de selector de idioma y de remapeo. |
| 3. Puzles y diálogos | Cargaron las 15 definiciones por entrada directa en Node y los destinos de los hotspots de salida apuntan a escenas y entradas existentes. El arnés `pt_guion.py` cubre la ruta principal en tres actos y conoce el soto nuevo, pero no llegó a ejecutar el recorrido aquí. Pendiente validar la ventana del eclipse, volver atrás en estados sensibles, recuperar partidas a mitad de acto y clasificar qué secundarias están realmente accesibles en RC21. |
| 4. Controles | Eventos de puntero unificados para ratón y táctil. Clic derecho o pulsación larga abren las acciones de contexto; hay atajos de teclado. No se encontró integración de mando en RC21. Pendiente comprobar puntero y táctil reales, revisar los controles del menú y documentar los gestos. |
| 5. Rendimiento | Canvas lógico de 1600 × 900, escala física limitada y degradación automática de efectos. Sin medición de fotogramas en esta fase. Comparar primero el soto nocturno, la taberna y las escenas con mayor número de actores y efectos. Perfilar la peor con el objetivo de 16 ms por fotograma. |
| 6. Texto y recursos | 57 imágenes decodificadas con Pillow y cabeceras y pistas reconocidas por ffprobe en 3 vídeos y 1 MP3. Cuatro capas remiten a fuentes sin imagen incrustada y tienen fallback procedural: red del embarcadero, bando de Puerta del Río, torno del alfar y mesa del Portazgo. En HTTP el cargador puede solicitar esas rutas antes del fallback. Pendiente confirmar la presentación en Canvas, cortes de texto y salida audible. El test actual nombra «uvas del ciego» y la revisión aprobada «cerezas»: comprobar el texto visible y elevar la discrepancia si continúa. |
| 7. Créditos y final | Existe `FIN`, con reinicio y regreso al título. La pantalla contiene un crédito de guion y una nota de arte provisional. Pendiente alcanzar FIN jugando y completar los créditos con atribuciones confirmadas. |

### Pérdida de guardado

Reproducción en el arnés Node, ejecutando el código de RC21: iniciar en la portada con la ribera precargada, escribir un guardado previo con una bandera de progreso, simular `visibilitychange` con `document.hidden=true` y leer la partida. La bandera desaparece. El listener llama a `G.saveGame()` al ocultar la página cuando hay escena y la partida no ha terminado. `G.boot()` ya ha creado la escena de fondo aunque el jugador siga en portada. Prioridad 1: proteger el guardado en portada y definir cuándo el estado es estable para guardarlo. Añadir la comprobación de regresión antes de ampliar el menú.

### Ruta a certificar

Ribera → soto de día y móvil de Mingo → pértiga y rueda → Chamelo y paloduz → cruce con Martín → plaza y horno del alfar → Taberna del Miedo → soto nocturno y gato → regreso a la villa y rescate con la balanza → poste de la Puerta del Río → iglesia y campanada → presente y FIN. Distinguir en el grafo las transiciones jugadas, las automáticas y el contenido histórico. Verificar las variantes de diálogo y las interacciones fuera de orden con estados de guardado reales.

## Pruebas ejecutadas y límites

- RC20 + `patch_rc21.py` regeneró RC21 byte a byte. SHA-256: `0cdd8f679439e427cc33f9ed57701e6922167ce3f79847af13c9dfa20f3e298c`.
- Los 61 scripts incrustados se compilaron y ejecutaron en una VM de Node. El arnés temporal pasó portada, entrada a ribera, apertura de pausa, guardado manual, carga, comprobación de referencias de salida y carga directa de las 15 escenas. Reprodujo la sobrescritura al ocultar la portada. Las imágenes, el audio y Canvas se simularon en ese arnés.
- Pillow decodificó las imágenes incrustadas. ffprobe identificó los flujos de vídeo y audio. Pruebas de escucha, reproducción completa, encuadre y fluidez pendientes.
- `pt_guion.py`, `pt_rc18.py`, `pt_movil.py` y `saves_guion.py crear` se intentaron. Playwright no encontró su Chromium empaquetado; el Chromium del sistema se cerró antes de abrir una página por un error de permisos de su socket. `saves_guion.py cargar` requiere las partidas que genera `crear`. `audit_encuadre.py` falla por una ruta absoluta de otro entorno. Ninguno dio un resultado jugable. `pt_guion.py` además contiene una aserción del mapa que siempre pasa (`or True`) y comunica fallos por texto; conviene que la comprobación usada para aceptar la candidata devuelva un código distinto de cero ante fallos.
- Pendientes: consola de Chrome durante una partida completa, ratón y táctil reales, Android físico de gama media, rendimiento, sonido audible, regresiones de guardado entre actos, legibilidad y créditos finales.

## Estimación por bloque

| Fase | Presupuesto | Alcance |
| --- | ---: | --- |
| 0 · Auditoría | 1 h | Base, evidencia, riesgos y publicación. |
| 1 · Base estable | 5 h | 1,5 h para recuperar el navegador de QA; 2,5 h para guardado y transiciones; 1 h para salida al título y comprobaciones del menú. |
| 2 · Jugabilidad completa | 10 h | 4 h para recorrido y grafo; 4 h para bloqueos e interacciones fuera de orden; 2 h para recuperación de partidas y verificación del final. |
| 3 · Pulido | 6 h | 2 h para controles, interfaz y textos; 1 h para audio y créditos; 3 h para perfil y correcciones de rendimiento. |
| 4 · Entrega | 2 h | Candidata, pruebas de regresión e informe con las pruebas pendientes. |

La certificación de rendimiento en Android de gama media depende de disponer de un dispositivo durante el sprint. No hay decisión creativa que impida empezar la Fase 1. Quedan para dirección la atribución exacta de los créditos y cualquier discrepancia de texto que siga visible tras la revisión. No se integra arte nuevo en esta fase.
