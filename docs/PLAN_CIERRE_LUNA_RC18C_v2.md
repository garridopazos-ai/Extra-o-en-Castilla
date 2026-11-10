# Plan de cierre Luna · v2 (tras la revisión de ChatGPT)

Sustituye al orden de trabajo de `PLAN_CIERRE_LUNA_RC18C.md`. La auditoría sigue valiendo como diagnóstico técnico, no como validación completa de RC18c: lo que dice de experiencia de juego son hipótesis por comprobar, no resultados.

Quitado del plan v1: el objetivo de recorte de texto en porcentaje, animar las 44 acotaciones, repintar familias de estilo y encargar otra vez a Rai-gato (ya está en RC18d).

## Orden y límites

| # | Bloque | Qué entra | Qué no entra | Estado |
|---|---|---|---|---|
| 1 | Comprensión y navegación | Salidas reconocibles, zonas táctiles cómodas, destinos coherentes, fuera señuelos | Tutoriales largos; abrir escenas descartadas (Portazgo) | **Hecho en RC18e**, pendiente de prueba en el Pixel |
| 2 | Coherencia narrativa esencial | Motivo temprano para buscar a Rai; relación Nuño–Oropesa; continuidad del móvil | Escenas o personajes nuevos; revelar pronto la culpa de Rai | Propuestas abajo, para aprobar |
| 3 | Acciones y humor visibles | Paseo de Alonso (clips ya existentes); resultado de los puzles a la vista; remates principales | Animar todas las acotaciones | Pendiente |
| 4 | Arte y secundarias | Integrar lo aprobado; corregir solo lo que choque en una pantalla y el interior de la aceña | Cadenas de recados obligatorias; repintar lo aprobado | Pendiente |
| 5 | Validación del candidato | Prueba real en el Pixel, pantalla a pantalla | Partidas completas sin fin | Tras 2–4 |

## Lo que hace RC18e (bloque 1)

- **Etiquetas de salida** con el nombre del destino: pegadas al borde («‹ Ribera», «Soto ›») si la salida es lateral o queda fuera de cuadro, y encima de la puerta si se ve. Si la salida está cerrada, sale en gris con candado. La del Portazgo no se anuncia. Al tocar una etiqueta, Alonso va hacia allí; la zona de toque mide como mínimo 120 × 120 y queda por debajo de los botones del HUD. Las etiquetas se esconden durante frases, notas, inventario, menús, fundidos, el título de escena y el zoom de cámara.
- **Destino del mapa:** la etiqueta de la salida siguiente se ilumina en azul. Sustituye a la flecha flotante, que se mantiene solo para la barca.
- **Nombres coherentes:** el nombre de cada salida es el de su destino (Ribera, Aceña, Embarcadero, Soto, Isla del Chamelo, Puerta del Río, Plaza del Pan, Santa María, Alfar, Plaza Mayor, Corredera, Taberna).
- **Toques cerca:** en la cuerda de la campana, la pértiga, las raíces de paloduz, la puerta de la aceña y las salidas estrechas, un toque a menos de 120 px también cuenta. Un toque exacto sobre otra cosa sigue teniendo prioridad.
- **Fuera señuelos:**
  - el destello del agua y «Algo que brilla» en la ribera;
  - la carreta atascada de la Puerta del Río y su obstáculo invisible;
  - la chincheta del Portazgo en el mapa (renumerado del 1 al 13; la ilustración no se toca);
  - el aviso «Efectos reducidos…»;
  - la frase de Martín «Una moneda por cruzar…».
- **Sin tocar:** la historia, los diálogos (salvo la frase de Martín), el arte y las partidas guardadas.

## Recursos: tres estados

| Estado | Ejemplos |
|---|---|
| **No existe** | Interior de la aceña con arte de la serie; Nuño en la Plaza Mayor con cuerpo pintado (sigue de marioneta) |
| **Disponible sin integrar** | Clips de Alonso andando (`assets/source_clips/soldado_anda_1000703355.mp4`, `…3361.mp4`); 8 fondos acuarela-cómic de César en `art/escenarios/nuevos/` |
| **Integrado, pendiente de validar** | Rai-gato (RC18d), paloduz (RC18c), etiquetas de salida (RC18e) |

## Calidad de los puzles: qué entiende, decide y provoca el jugador

| Puzle | Lectura | Riesgo de «simplificar ≈ automatizar» |
|---|---|---|
| P1, P3, P5, P7 | El jugador entiende el problema, elige el objeto o la persona y ve el efecto | Bajo: conservar tal cual |
| P2 | Correcto, pero de tutorial | Aceptable al principio |
| P4 | Lo resuelve la escena sola | Alto |
| P6 | Basta con tocar al gato | Alto: **propuesta:** llamarlo con algo que le guste (miel o paloduz), sin nueva cadena |
| P8 | Se resuelve en un solo turno | Medio: **propuesta:** una elección entre dos respuestas, de las cuales solo una convence |
| P9 | Fusionado con otro paso | Medio: revisar al validar |
| P10 | Final por tiempo | Aceptable como clímax |

Las dos propuestas reutilizan objetos y personajes que ya existen. Se implementan solo si César las aprueba.

## Bloque 2 · propuestas para aprobar (sin implementar)

1. **Motivo temprano para buscar a Rai.** Hoy el jugador va a ver a Rai sin una razón propia. Propuesta: en la ribera, una sola frase de Mingo o de Durán presenta a Rai como «el que sabe de caminos y de cosas raras», justo cuando Alonso pregunta cómo volver. La culpa de Rai no se revela. Se queda el chiste del «apicultor» como evasiva.
2. **Nuño y Oropesa.** Reforzar las dos escenas que ya existen:
   - en el alfar, que Nuño diga qué quiere (cobrar la tasa del alfar y quedarse con él);
   - en la Plaza Mayor, que se entienda por qué Oropesa puede destituirlo (autoridad del concejo o del rey, una frase).
3. **Continuidad del móvil.** Que la batería y la vanidad del móvil cuadren entre la ribera y la Plaza Mayor: una frase que diga que lo guarda o que se agota, sin escena nueva.

César redacta o aprueba las líneas exactas; Claude solo las coloca.
