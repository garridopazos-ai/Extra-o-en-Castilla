# Auditoría del juego actual (CHAMELO RC16) frente al guion definitivo

Fecha: 9 nov 2026. Base auditada: `builds/1248_CHAMELO_RC16.html`.
Normas: `docs/GUION_DEFINITIVO.md` y `docs/PROTOCOLO_SENCILLEZ_Y_HUMOR.md` (mandan sobre todo lo anterior).
Método: volcado de los datos reales de la build en Chromium (`E.DATA`: escenas, zonas, PNJ, objetos, diálogos y guiones automáticos), más las pruebas de partida completa ya existentes (`pt_rc09.py`, `check_rc14.py`, `pt_rc16.py`).

## 1. Resumen

- **Acto I** (ribera, aceña, embarcadero) funciona y casi todo se conserva, como pide el guion. El problema es la cadena de Mingo y el ciego para recuperar el móvil: tres acciones, dos conversaciones y la pértiga con lazo ya fabricada antes de poder cruzar. Es exactamente el recado que prohíbe el protocolo.
- **Acto II actual** (la trama del juglar: los Giles, el truco de Lope, el badajo, la campana de tres toques, el retrato de Nuño, la Vista Pública) **no encaja con el guion definitivo**. Lope es ahí casi un ladrón, la campana sirve para convocar un juicio y Nuño cae en un pleito por un cartel. Se sustituye entero. Se aprovechan escenarios, personajes y algún gag.
- **El final actual** (dormir en el pajar y usar el móvil en el horno) se sustituye por la campana bajo la Luna roja. El horno pasa a ser el centro del Puzle 02.
- **Diálogos**: muy por encima del protocolo (detalle en el apartado 4). La visita al Chamelo son 24 frases automáticas seguidas.
- **Ya encaja con el guion**: el viejo soldado vive en la Taberna del Miedo (es Alonso), Rai tiene su caldero (sirve para el accidente y la confesión), Sancha ya es panadera en la Plaza del Pan, Yuçaf es el alfarero y la noche del alfar ya existe como técnica (capa de noche y luz de horno).

## 2. Datos del guion comprobados (rigor)

| Dato | Comprobación | Consecuencia |
|---|---|---|
| Eclipse lunar total del 7 jun 1248 | **Real.** Máximo a las 21:15 UT, con 1 h 21 min de totalidad y magnitud umbral 1,29 (fecha juliana, EclipseWise). | Se usa tal cual. Cálculo mío aproximado, no publicado: en Talavera la Luna saldría por el sureste al ponerse el sol y en plena totalidad estaría baja, a unos 10–15° sobre el horizonte. Una luna roja baja sobre la sierra queda muy bien y es plausible. |
| Sancha Alfonso de León, hija ilegítima de Alfonso IX | **Persona real**, h. 1220–1270, hija de Teresa Gil de Soverosa. Casó con Simón Ruiz de los Cameros (el documento se discute), profesó en Santa Eufemia de Cozuelos en 1270 y se la venera. No consta relación con Talavera. | Su vida de panadera en Talavera es ficción, como ya dice el guion. **Ojo con la edad:** en 1248 tendría unos 28 años, no «mediana edad». Lo dejo como licencia salvo que César diga otra cosa. Su verdadero desenlace (monja en 1270) puede servir para la estampa final. |
| Señora de Oropesa en 1248 | Recreación ficticia, como dice el guion. | Sin cambio. Se mantiene fuera de cualquier rótulo de «dato histórico». |
| Ambientación mayo–junio | El juego actual dice noviembre (rc09: «…noviembre, que esa higuera no tiene calendario»; hojas de otoño en la Corredera; la vendimia en las uvas del ciego). | Cambiar textos y atmósfera. En junio no hay uvas maduras ni higos, pero sí brevas (finales de junio) y cerezas. El cerco de Sevilla sigue en curso (rinde el 23 nov 1248), así que el soldado vale con «junio». |
| «Doña Sancha **Panza**» (nombre actual en el juego) | Referencia quijotesca explícita, contraria al protocolo y al guion (se llama Sancha Alfonso). | Renombrar a «Doña Sancha». |
| Alonso (soldado) / Alfonso (barquero) / Alfonso IX / Sancha Alfonso | Cuatro nombres casi iguales. | Riesgo de confusión para el jugador (decisión de César, apartado 10). |

## 3. Puzles actuales: veredicto

Pasos = acciones significativas del jugador (sin contar caminar ni leer).

| # | Puzle actual | Escena | Pasos | Veredicto | Motivo y destino |
|---|---|---|---|---|---|
| 1 | Pértiga + cuerda del poste → pértiga con lazo | ribera | 3 | **CONSERVAR** | Objetos visibles y uso evidente. Es la herramienta de todo el Acto I. |
| 2 | Rueda de la aceña atascada por un tronco | aceña | 2 | **CONSERVAR** | Es el «molino de Durán» del guion. Comprensible, con reacción visual (agua, temblor) y abre el camino. |
| 3 | Soltar el cabo de Alfonso con la pértiga → pasaje gratis | embarcadero | 1–2 | **CONSERVAR** | Una acción con la misma herramienta y causa clara. Recortar las frases de mirar y usar (5–6 por zona). |
| 4 | Mingo roba el móvil → trato → cuenco del ciego → uvas → racimo a Mingo | ribera, soto | 3 + 2 conversaciones (y antes fabricar la pértiga con lazo) | **SUSTITUIR** | Recado encadenado de manual. Si Mingo sigue (decisión de César), basta con «Mingo roba el móvil y se sube a la higuera → una acción → lo devuelve». El ciego, si sigue, queda opcional. |
| 5 | «Algo que brilla» (usar a Mingo sobre la moneda) | ribera | 1 | **ELIMINAR** | Solo sirve como pasaje alternativo, que ya da el puzle 3. |
| 6 | Higos (usar a Mingo en la higuera) | soto | 1 | **ELIMINAR** | Existe solo para pagar el pan. Además, en junio no hay higos. |
| 7 | Visita al Chamelo con el consejo de Rai (24 frases automáticas) | chamelo | 0 | **SUSTITUIR** | Pasa a ser el **Puzle 01 (paloduz → mapa)**, 1–3 minutos. El consejo era de la trama del juglar. |
| 8 | Paradoja de Gil del Paso / Gil del Peso (leer reglamento → hablar) | Puerta del Río | 3–4 | **SIMPLIFICAR** | Buena idea cómica, pero mucha lectura. Se reduce a una acción para entrar en Talavera. Los Giles pasan a ser **los dos guardias de Nuño** del Puzle 02. |
| 9 | Cartel de la función (bando) | Puerta del Río | 1 | **ELIMINAR** | Prueba de la Vista, que desaparece. |
| 10 | Carreta de Yuçaf (cuña + viga) | Puerta del Río | 4 | **ELIMINAR** | Opcional y repite la mecánica de palanca. La **cuña** reaparece con sentido en el Puzle 04. |
| 11 | Hambre: Sancha cobra con tasas → higos / número con el móvil / pan de Elvira | plaza | 2–3 | **SUSTITUIR** | Tres vías para un recado. La presentación de Sancha (al salir de la aceña y luego en su puesto) no es un puzle según el protocolo. |
| 12 | Truco de Lope (herradura, hilo visto con la luz del móvil) → badajo | plaza | 4 | **SUSTITUIR** | La observación con luz es buena, pero Lope ya no tiene el badajo robado: es el amigo que repara. La idea de «mirar de cerca el mecanismo» pasa al **Puzle 06**. |
| 13 | Dar el badajo a Benito → campana con 1/2/3 toques → convoca la Vista | iglesia | 3 | **SUSTITUIR** | Se conserva el escenario, la cuerda y el sonido para **P06/P07**. |
| 14 | Retrato de Nuño (móvil en el atril) → coger su sello | portazgo | 2 | **ELIMINAR** (aprovechar el gag) | Su vanidad ante la «tablilla mágica» es un buen gag de Nuño. Puede volver en un segundo plano (la destitución o el alfar), sin puzle. |
| 15 | Vista Pública (testigo, marca del cántaro, cláusula; recibo RC16) | audiencia | 4 opciones | **ELIMINAR** | A Nuño lo destituye la señora de Oropesa. El escenario sirve para la destitución pública. |
| 16 | Dormir en el pajar (exige haber comido) | alfar | 1 | **ELIMINAR** | No hay noche-objetivo en el guion. La técnica de noche se reutiliza para el eclipse. |
| 17 | Usar el móvil en el horno → fin | alfar | 1 | **SUSTITUIR** | El final es la campana. El horno pasa a ser el **Puzle 02**. |
| 18 | Tertulia del soldado (6 aventuras) y oyentes | taberna | 0 | **CONSERVAR, recortar** | Es Alonso en su cuartel general. Recortar a una aventura por visita y frases cortas. Aquí va el **duelo cinematográfico** (una sola vez). Su nombre se revela más tarde. |
| 19 | Elvira: tres momentos de romance y recibo (RC16) | plaza, audiencia | 1–3 | **ELIMINAR** | César: Elvira y Sancha son la misma. Su arte pasa a Sancha. Se quitan el romance y el recibo; la hogaza de la despedida es de Sancha. |
| 20 | Viñeta del caldero de Rai | chamelo | 0 | **CONSERVAR** | Es el «experimento mágico». Se reutiliza en la **confesión**. |

**Sistemas que se conservan:** pistas «?» y pista de Mingo (con textos nuevos), tarjetas de capítulo (renumerar por actos), mapa de viaje (empieza limpio y gana anotaciones, Puzle 01), zurrón, verbos, guardado, luz, atmósfera y sonido, viñeta de vídeo y escena de noche.

## 4. Diálogos frente al protocolo (1–3 intervenciones, menos de 15 palabras)

Medido sobre la build:

| Encuentro | Frases | Frases de más de 15 palabras |
|---|---|---|
| Visita al Chamelo (automática) | 24 | — |
| Soldado (árbol completo) | 45 | 14 |
| Elvira en la plaza (RC16) | 24 | 15 |
| Mayordomo (Vista) | 22 | 5 |
| Durán | 18 | 5 |
| Dar el cuenco al ciego (automática) | 13 | — |
| Dar higos a Sancha (automática) | 11 | — |
| Pajar del alfar (automática) | 10 | — |
| Dar el racimo a Mingo (automática) | 10 | — |
| Llegada a la ribera (automática) | 8 | — |

Regla de trabajo para todos los tramos: cada escena nueva se mide con el mismo volcado. Más de 3 intervenciones seguidas o una frase de más de 15 palabras exigen justificación (revelación importante) o se recortan.

## 5. Escenas reutilizables

| Necesidad del guion | Escena existente | Qué falta |
|---|---|---|
| Accidente y llegada | ribera | — |
| Molino de Durán | aceña | — |
| Primera aparición de Sancha | ribera, al salir de la aceña tras hablar con Durán | — (usa el arte de Elvira) |
| Casa de Rai y P01 | chamelo (puerta de Rai, hierbas, colmenas) | Paloduz como zona visible (se puede dibujar) |
| Llegada a Talavera | embarcadero → travesía → Puerta del Río → plaza | — |
| P02 alfar | alfar (horno grande, pala, carbón, cántaros) | **Control de tiro** del horno: el arte no lo tiene. Dibujarlo como prop con reacción visible (humo, brillo) |
| Cuartel de Alonso y duelo | taberna, corredera | Viñeta del duelo (vídeo o animación) |
| Confesión de Rai | chamelo + viñeta del caldero | — |
| Destitución de Nuño | audiencia (Plaza Mayor) o portazgo | Señora de Oropesa |
| P06 campana | iglesia (campana, cuerda) | Vista de la torre (opcional; se puede hacer en el atrio) |
| P07 eclipse | plaza o iglesia de noche (técnica de RC09) | Luna roja y pórtico (procedural) |
| Alonso y los molinos | **aceña** (rueda de agua: guiño sutil, sin gigantes) | — |
| Monstruo del Tajo | soto u orilla de noche | Mecanismo (cuerdas, silueta, cuerno) y dos ojos bajo el agua |
| P03 bosque nocturno | — | **Escena nueva** |
| P04 escondite y balanza | — | **Escena nueva** |
| P05 encrucijada y aldea | — | **Escena nueva** (o dos) |
| Ovejas desaparecidas | — | **Escena nueva** (prado con pastor) |
| Regreso al presente | — | **Escena nueva** (la ribera actual sirve de base) |

## 6. Transiciones entre pantallas (estado actual, probado)

ribera ↔ aceña · ribera ↔ soto ↔ Chamelo (vado) · ribera ↔ embarcadero → travesía → Puerta del Río ↔ plaza ↔ {iglesia, portazgo, audiencia, alfar} · Puerta del Río ↔ Corredera ↔ taberna. Todas recorridas por `pt_rc09.py` y `check_rc14.py` sin errores en RC16. Las escenas nuevas se colgarán del mapa de viaje (destinos) y de salidas existentes, sin otro sistema de navegación.

## 7. Guardado

`localStorage` con la clave `1248_g12_rc03_save_v1`: banderas, zurrón y escena. El flujo nuevo cambia el significado de muchas banderas, así que el guion definitivo usará una **clave nueva** (`…_v2`). Las partidas viejas siguen valiendo en RC16 y anteriores, y no se mezclan.

## 8. Flujo de estados nuevo (banderas)

- **Acto I:** `mingo_robo` → una acción → `mingo_sigue` (Mingo devuelve el móvil y se une) → `rueda_libre` (se conserva) → `sancha_conocida` (escena breve al salir de la aceña tras hablar con Durán; arte de Elvira) → `paloduz` en el zurrón → `mapa_rai` (P01; el mapa se vuelve limpio) → `barca_libre` → `cruzado` → `en_talavera` (una acción en la Puerta del Río) → presentación escalonada en la plaza (Sancha en su puesto, Lope en la fragua, pregonero).
- **Acto II:** `embargo_aplazado` (P02) → `arma_reparada` (Lope y Alonso, escena) → `requete_1` (P03) → `confesion_rai` (objetivo conocido: eclipse y campana) → `oropesa_secuestrada` → `cuna_puesta` → `oropesa_rescatada` (P04) → `nuno_destituido` y `alfar_devuelto` (escena) → `requete_fin` (P05).
- **Acto III:** `campana_lista` (P06) → `eclipse` → `hogaza_sancha` (obligatoria) → `campanada` (P07, sin límite de tiempo) → `regreso` → `epilogo`.
- **Secundarias** (nunca bloquean): `monstruo_descubierto`, `alonso_molino`, `ovejas`; cada una añade una anotación al mapa. Rai-gato aparece en segundo plano desde la confesión. La pala del alguacil no se queda en el zurrón (no hay uso posterior definido).

Mientras se construye, cada candidata se puede jugar de principio a fin hasta el último tramo terminado, que acaba en una cartela «Continuará». La versión completa antigua queda en `builds/1248_CHAMELO_RC16.html`.

## 9. Recursos gráficos que faltan de verdad

Imprescindibles (sin ellos se usa provisional marcado):

1. ~~Sancha con clip propio~~ **Resuelto**: Sancha usa el arte de Elvira (reposo, andar y hablar ya montados). Falta, si acaso, un gesto de dar la hogaza.
2. **Señora de Oropesa** (reposo, hablar).
3. **Los cuatro conspiradores** (pueden compartir hoja con variaciones; reposo, hablar y discutir).
4. **Rai-gato**: el guion habla de animaciones «disponibles» (caminar, correr, esperar, asustarse, esconderse, tropezar, dormir, bostezar), pero **no están en el repositorio ni en la carpeta de Drive**. Hay que subirlas a `assets/inbox/`.
5. Fondos nuevos: **bosque nocturno**, **escondite con balanza**, **encrucijada y aldea**. Provisional: acuarela procedural como en la orilla o la Corredera.

Deseables: Alonso andando con un ciclo limpio (sus clips de andar tienen deriva), el duelo samurái (vídeo de 5–8 s), el alguacil, el pastor y las ovejas, la nave, y la escena del presente.

## 10. Decisiones de César (9 nov, respuestas a la auditoría)

1. **Mingo**: se queda como **compañero, sin recados**. Sigue al jugador, da pistas y hace gags de fondo. Se quita la cadena móvil → ciego → cuenco → uvas: Mingo roba el móvil y lo devuelve con **una sola acción**.
2. **Elvira y Sancha son la misma persona** (economía de personajes). Ya no hay nadie en la aceña al entrar. **Sancha aparece al salir de la aceña, después de hablar con Durán.** Por tanto:
   - el arte de Elvira (hoja de la portada, reposo y andar, y su clip de hablar `elvira_habla_1000702939.mp4`) **pasa a ser Sancha**, y la marioneta de «Doña Sancha Panza» desaparece;
   - Sancha ya no es hija de Durán: comercia con harina, y por eso pasa por la aceña;
   - se quitan las escenas de Elvira (la aceña, la invitación al Chamelo, la «familia» con Rai, el romance de RC16 y el recibo). La hogaza de la despedida es de Sancha, como dice el guion.
   - Sin decidir: si queda una chispa de complicidad entre Sancha y el protagonista. Por defecto, solo la que dé su carácter, sin escenas de romance.
3. **El ciego Nicolás**: **opcional**, corto, con **cerezas** (temporada de junio). No bloquea nada.
4. **El barquero** se renombra: **Martín el Que Sabe** (mismo personaje y mismos clips).
5. **Edad de Sancha**: el arte de Elvira (aspecto de unos 30 años) cuadra con la Sancha real (unos 28 en 1248). El guion dice «mediana edad»; se usa el arte existente y se anota la diferencia.
6. **El guion llegó cortado** al final de la sección X («Todos los escenarios jugables deben respetar…»). Falta el resto: pedido a César.

Fuentes de los datos comprobados: [EclipseWise, Total Lunar Eclipse of 1248 Jun 07](https://eclipsewise.com/lunar/LEprime/1201-1300/LE1248Jun07Tprime.html) · [Wikipedia, Sancha Alfonso of León](https://en.wikipedia.org/wiki/Sancha_Alfonso_of_Le%C3%B3n).
