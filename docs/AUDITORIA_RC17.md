# Auditoría correctiva de RC17 — informe para aprobación

Fecha: 9 nov 2026. Objeto: `builds/1248_CHAMELO_RC17.html`, **sin modificar**. Su suma md5 se ha comprobado antes y después de la auditoría.
Reglas de César para esta fase:
- No regenerar imágenes ni sustituir escenarios aprobados.
- No añadir puzles ni alargar conversaciones.
- No borrar recursos sin comprobar dependencias.
- Informe primero; correcciones solo tras aprobación.

## Cómo se ha auditado

1. **Volcado completo de `E.DATA` en el navegador** (1.021 cadenas con su ruta). Se ha calculado qué diálogos abre cada personaje o zona y en qué condiciones. Herramienta: `production/CHAMELO/tools/audit_alcance.py`.
2. **Partida completa repetida** con toques reales, anotando en cada pausa la caja de cada personaje en pantalla: fuera de cuadro, tapado por la interfaz o superpuesto. Herramienta: `tools/audit_encuadre.py`; 64 pausas registradas.
3. **Análisis de las hojas de personaje**, buscando píxeles opacos pegados al borde de la celda, que indican un dibujo recortado. Herramienta: `tools/audit_hojas.py`.
4. **Reproducción en Chromium** de cada incidencia declarada accesible. Herramienta: `tools/audit_reproducir.py`; capturas en `production/CHAMELO/capturas/auditoria_rc17_*.png`.

«Accesible» significa que un jugador lo encuentra jugando. «Inactivo» significa que el código sigue en el HTML pero nada del juego actual lo alcanza.

## Resumen

- 21 incidencias: 3 de gravedad alta, 8 media y 10 baja.
- **Ninguna bloquea la partida**: la cadena principal se completa siempre.
- Las tres altas son contradicciones de historia que el jugador ve: la Vista Pública antigua, el diálogo antiguo de Alonso y el ciego de las cerezas frente a la parra de uvas.

## Incidencias

| ID | Incidencia | ¿Accesible? | Causa | Gravedad | Corrección propuesta |
|---|---|---|---|---|---|
| **A1** | **La tarima de la Plaza Mayor abre el diálogo antiguo de la Vista Pública** («¿Qué maravilla vais a hacer?», «Sacar un dinero del bolsillo de un cobrador»…). | Sí, después de la destitución. Reproducido. | En `g11_juglar.js` la tarima tiene verbo por defecto «usar» y ese verbo abre `mayordomo`. RC17 ocultó al mayordomo, pero no la tarima. La Pieza del Rey no se puede conseguir (exige `vista_convocada`), pero el diálogo entero de la trama antigua se lee. | Alta | Dejar la tarima solo con «mirar» y un texto neutro de una frase. Sin diálogo. |
| **A2** | **El diálogo de Alonso contradice el guion**: «Lope se llevó el badajo», «tres toques, todo el mundo a la Vista», «pídelo en Vista pública». Además se abre completo **mientras duerme** (puzle de la balanza) y en la iglesia, la noche del eclipse. | Sí. Reproducido con la señora secuestrada: ofrece las 8 opciones. | Es el árbol de `rc13`–`rc15`, que RC17 no revisó. | Alta | Quitar las opciones «¿No vigilabais la campana…?» y «¿Qué significan los toques…?» y la segunda frase de «¿Qué sabéis de Don Nuño?». «¿Y la punta de vuestra lanza?» solo antes de que Lope la arregle. Dormido: solo «Zzz… Las Navas… zzz». En la iglesia: una frase que ya existe. Recortar la entrada de 6 a 3 frases. Todo son recortes y condiciones: no hay texto nuevo. |
| **A3** | **Nicolás habla de cerezas, pero el soto muestra una parra con racimos maduros y una higuera con higos.** Su hoja no lleva cesta y su comentario espontáneo dice «Huelo uvas». En cuanto se pisa el soto se oye «¡Cerezas de la Vera!». | Sí. Reproducido. | En RC17 cambié el gag a cerezas para cuadrar con junio y no lo contrasté con el arte aprobado. Lo mismo pasa con otros textos de estación escritos en RC17: «uvas verdes hasta septiembre», «Higos, todavía no: es junio». | Alta | Volver al racimo de la parra, que es el gag del Lazarillo y lo que se ve. Quitar «cesta de cerezas», «Cerezas de la Vera», «verdes… septiembre» y «Higos, todavía no». Los textos describen lo pintado sin nombrar la estación. **Decisión de César**: la parra y la higuera pintadas no son de junio; propongo aceptarlo como licencia del arte aprobado. |
| M1 | **El rótulo del narrador sale arriba mientras el panel de diálogo de abajo sigue abierto y vacío.** | Sí: el gag del ciego (reproducido), «¿Y ahora qué hacemos?» de Mingo (su pista sale en bocadillo con el panel vacío) y la Vista de A1. | El motor ejecuta las acciones de un nodo de diálogo con el panel visible y sin texto. Los rótulos van arriba y las frases salen en bocadillo. Esos tres nodos meten frases o rótulos en acciones. | Media | Regla: ningún diálogo con frases o rótulos en sus acciones. El ciego pasa a una secuencia directa, sin panel. Mingo, al tocarle, dice la pista directamente; se quitan sus dos charlas de relleno («Háblame de Talavera», «¿Por qué robas?»), que no aportan. La Vista se resuelve con A1. |
| M2 | **«▸ toca para continuar» se corta en el borde derecho.** | Sí, en todas las frases de todos los diálogos. Reproducido. | `hud.js`: el texto se coloca con ancla centrada (`'bc'`) en el borde derecho menos 36 px. La mitad derecha cae fuera del panel y de la pantalla. Viene de antes de RC17. | Media | Anclarlo por su borde derecho (una línea del motor, aplicada en `patch_rc17.py`). |
| M3 | **Bocadillos de un personaje aparecen en la escena siguiente.** El «¡Cerezas de la Vera!» del ciego se vio dentro de la aceña. | Sí. Reproducido. | Al cambiar de escena no se borran los bocadillos no bloqueantes. Se siguen dibujando en las coordenadas del personaje con la cámara nueva. | Media | Al cambiar de escena, descartar los comentarios no bloqueantes y no dibujar bocadillos de personajes que no están en la escena. |
| M4 | **Mingo queda medio fuera de cuadro al entrar en 7 escenas** (aceña 17 % visible; ribera, soto, embarcadero, plaza, alfar, iglesia 36–76 %). En la plaza, además, queda detrás del botón del zurrón. | Sí. Registrado en las pausas de la partida. | `companion.place` lo sitúa 130 px «detrás» del viajero. Si se entra por un borde, queda fuera del encuadre, y en escenas de cámara fija no se mueve hasta que el viajero se aleja más de 210 px. | Media | Al colocarlo, limitar su x al encuadre visible (200–1400 px de pantalla) y fuera del círculo del zurrón; si no cabe detrás, ponerlo delante. |
| M5 | **El protagonista tiene la coronilla recortada en plano.** | Sí, en todas las escenas. El pelo toca el borde superior de la celda en reposo, andar y hablar (23, 14 y 22 muestras opacas). | La hoja (`build_player.py`, G11) se generó con poco margen superior. | Media | Rehacer la hoja **desde los mismos clips (216/222/223)** con 10–12 px más de margen arriba. No es arte nuevo: mismo vídeo, mismo recorte, misma escala. **Requiere tu aprobación** porque toca un recurso gráfico; si no, se queda como está. |
| M6 | **Comentarios espontáneos de la trama antigua**: Fray Benito, «Sin badajo, la campana solo dice…»; Lope, «Martillo, yunque y misterio» y «Un herrero sin truco…» (aluden al truco de la herradura, que ya no existe). | Sí (comentarios al estar quieto). | Tabla `BARKS` de `rc07.js`, que no se revisó en RC17. | Media | Quitar esas tres frases de la tabla. Benito y Lope se quedan con las que no contradicen. |
| M7 | **«Vista Pública» sigue en la Plaza Mayor**: título «Plaza Mayor · Vista Pública», alfiler del mapa «Vista Pública», sitio «ante la Vista Pública», la tarima («tres cojines…») y el público («cómo Don Nuño me quita lo que no tengo»). | Sí. | Restos de `g11_juglar.js` y de la tabla del mapa de `rc07`. | Media | Renombrar a «Plaza Mayor» y dejar textos neutros de una frase. |
| M8 | **La sustitución global «Alfonso → Martín» es frágil y no llegó a todo.** | En parte. | RC17 reemplaza «Alfonso» en todas las cadenas de `E.DATA`. Comprobado en las fuentes: **todas** las apariciones eran el barquero; no tocó a ningún rey. Pero (1) no alcanza textos fuera de `E.DATA`: el mapa sigue diciendo «ante la choza de **Alfonso**»; (2) cualquier texto futuro con «Alfonso» cargado antes de rc17 (por ejemplo «Alfonso VIII» de la tradición de las torres albarranas) se convertiría en «Martín». | Media | Sustituir la regla global por cambios explícitos campo a campo (lista cerrada: unos diez textos y los nombres del barquero) y corregir la etiqueta del mapa. Las otras sustituciones son seguras: «Raimundo → Rai» (rc07) no colisiona con nada, y Elvira → Sancha no fue textual, sino un cambio de hoja de personaje. |
| B1 | **Mingo subido a la higuera tiene los zapatos cortados** en el borde derecho de la celda (17 muestras). | Sí, en el Acto I. | La celda de 200 px es estrecha para la pose sentada. | Baja | Igual que M5: rehacer esa fila desde su clip con celda más ancha, con tu aprobación, o aceptarlo. |
| B2 | **Encuadres mejorables**: el viajero se pone encima de Yuçaf al usar la cadena del tiro (72 % superpuestos); en la balanza, el cabecilla y la señora quedan a medias en el borde derecho cuando estás en la mesa; al entrar en la Puerta del Río apareces entre los dos Giles. | Sí. | Coordenadas de colocación de RC17 (alfar y taberna) y punto de entrada antiguo (puerta). | Baja | Solo coordenadas: Yuçaf a x 700; punto de acercamiento al tiro x 585; grupo de la balanza unos 150 px a la izquierda y más compacto; entrada de la puerta 80 px antes de los guardias. |
| B3 | **Personajes duplicados tras la destitución**: Yuçaf está a la vez en su alfar y en la Plaza Mayor; el pregonero, a la vez en la Plaza del Pan y en la Mayor. | Sí. | Son entradas distintas de personaje con condiciones de presencia que no se excluyen. | Baja | Condiciones excluyentes: el de la Plaza Mayor solo hasta salir de ella. |
| B4 | Durán saluda con «¿Eres juglar?». | Sí. | Resto de la trama del juglar. | Baja | Quitar la pregunta: «¡Eh, tú! ¿De dónde sales con esas ropas?». |
| B5 | **Frases del viajero que se adelantan a la historia**: «¿Y si el portal se abre justo ahora…?», antes de que Rai hable del pórtico; «Nuño me cobra por estar parado», antes de conocer a Nuño. | Sí (frases al estar quieto). | `QUIPS` de `rc07`. | Baja | Mostrarlas solo después de la confesión y después de cruzar el río, respectivamente. |
| B6 | «Mapa de Talavera» en el menú de pausa **no hace nada** antes de tener el mapa de Rai. | Sí. | RC17 bloquea la apertura del mapa, pero el botón del menú sigue ahí. | Baja | Ocultar esa entrada hasta `mapa_rai`. |
| B7 | El nombre «Alonso» **no vuelve a «Viejo soldado» al cargar una partida anterior** a la escena de la lanza (solo al empezar una nueva). | Sí, al cargar. | La sincronización de RC17 solo pone el nombre, nunca lo quita. | Baja | Sincronizarlo en los dos sentidos según `alonso_nombre`. |
| B8 | **Riesgo teórico en el eclipse**: si existiera una partida guardada entre «la Luna se oscurece» y «¡Ahora!», la campana diría «¡Aún no!» para siempre. | Muy improbable: el autoguardado no actúa mientras corre esa secuencia. | `luna_roja` solo se marca al final de la secuencia de entrada. | Baja | Marcar `luna_roja` también cuando la luna llega a rojo en el bucle de dibujo (blindaje sin cambio visible). |
| B9 | **Dos rótulos explican controles** («Elígelo en el zurrón y toca algo…», «el botón está a la derecha, bajo el «?»»), cosa que el protocolo desaconseja. | Sí. | Textos de RC17 puestos por usabilidad. | Baja | Acortarlos a un aviso breve que desaparece solo («Mingo se une a ti», «Nuevo: mapa»). **Decisión de César**: quitarlos o dejarlos así. |
| B10 | Objetos antiguos definidos pero imposibles de conseguir: cuenco, racimo, higos, cuerda, pértiga con lazo, moneda, saco, cuña de obra, viga, cántaro, sellos, badajo, cartel, Pieza del Rey. | **Inactivo** (comprobado: ninguna acción alcanzable los entrega, una vez corregida A1). | Siguen en los módulos antiguos. | Baja | **No borrar**: los iconos se cargan al arrancar y otros módulos los nombran. Se documentan como inactivos. |

## Código antiguo inactivo: qué hay y por qué no se borra

- **`G12` (Acto I antiguo)**: 34 menciones del cuenco y 17 del racimo. Incluye la zona `cuenco_h` (retirada de la escena), la capa `cuenco` (oculta), el árbol de diálogo `mingo_arbol` (ya no se abre), el trato del racimo (sustituido) y las pistas antiguas (sustituidas por la lista nueva). **No se puede quitar el módulo**, porque define cosas que siguen en uso: el soto de los Sifones, Mingo como compañero, el ciego y las marionetas. Se neutraliza desde rc17, como ahora.
- **`g11_content.js` / `g11_juglar.js`**: Giles y reglamento, truco de Lope, badajo, toques, retrato de Nuño, Vista, carreta y horno final. Siguen definiendo escenas que se usan (Puerta del Río, plaza, iglesia, alfar, Plaza Mayor). Restos que aún se alcanzan: los de A1 y M7.
- **`rc09` (hambre y pajar)**, **`rc10` (Elvira con motivo)**: sus personajes y zonas están ocultos o sustituidos. El fondo de noche de `rc09` se reutiliza.
- **`rc13`–`rc15` (soldado, taberna)**: se usan; los restos que aún se alcanzan son los de A2.
- **`rc16`** no está en la cadena de RC17.

La pértiga **no es un resto**: es el objeto del puzle de la rueda. Sus textos actuales son coherentes; lo que desapareció es la cuerda y el lazo.

## Lo que se ha comprobado y está bien

- La cadena principal se completa en las dos partidas registradas (64 pausas), sin errores de consola.
- Por análisis de condiciones (no probado en el navegador): no hay bloqueos al salir a mitad de un puzle; alfar, soto de noche y taberna se pueden abandonar y retomar.
- Por análisis de condiciones: las pistas «?» no tienen huecos en ningún estado de la cadena.
- Inventario: solo se consiguen el móvil, Mingo, la pértiga, la cuña y la hogaza, y cada uno se usa. Los otros objetos son inactivos (B10), una vez corregida A1.
- Hojas de Durán, Martín, Nuño, Sancha (arte de Elvira), Rai, Alonso y el ciego: sin recortes en la celda.

## Plan de corrección propuesto (RC18, tras tu aprobación)

1. Un módulo de corrección `rc18_correcciones.js` encadenado tras `rc17.js`, más los ajustes de motor en `patch_rc17.py` (M2, M3, M4). **RC17 se conserva tal cual.**
2. Todo serán recortes, condiciones, coordenadas o sustituciones de texto por otro igual o más corto. No hay puzles nuevos ni conversaciones más largas.
3. Lo que necesita tu decisión:
   - **A3**: confirmar el gag de las uvas como licencia del arte.
   - **M5 y B1**: aprobar o no rehacer las dos hojas desde sus clips, sin arte nuevo.
   - **B9**: quitar o dejar los rótulos de controles.
4. Verificación: partida completa `pt_guion.py`, más `audit_reproducir.py` y `audit_encuadre.py`, que deben salir sin ninguna de estas incidencias.


---

## Estado tras RC18 (9 nov, noche) · `builds/1248_CHAMELO_RC18.html`

Compilación de partida: **RC17** (`builds/1248_CHAMELO_RC17.html`, md5 `974f5974…`), conservada intacta. RC18 = RC17 + `patch_rc18.py` + `rc18.js` (`bash production/CHAMELO/build_rc18.sh`). Mismo guardado que RC17: sus partidas se cargan en RC18.

Antes de corregir se reprodujeron en RC17 los hallazgos (navegador): A1, A2, A3, M1, M2 y M3 con `audit_reproducir.py`; M4 con `audit_encuadre.py`; M5 y B1 con `audit_hojas.py`. Con `saves_guion.py`, usando guardados hechos con el botón «Guardar partida» del menú de pausa, se reprodujeron también B7 y B8 y un fallo nuevo, N1.

| ID | Estado | Qué se hizo / cómo se comprobó |
|---|---|---|
| A1 | **Corregida** | La tarima solo se mira («La tarima de la Plaza Mayor. Hoy, sin pleitos.»). El diálogo del mayordomo ya no se abre desde ningún sitio. **Jugado**: tocar la tarima → una frase y ningún panel. Nota: la señora de Oropesa tapa el centro de la tarima, así que tocar ahí habla con ella. |
| A2 | **Corregida** | Alonso: fuera las opciones de campana y toques y la frase de la Vista; la lanza solo antes del arreglo; entrada de 2 frases. Dormido: «Zzz… Las Navas… zzz…». En la iglesia: «La cuerda es mía. Esta vez no se me escapa.» Ninguna pista necesaria estaba en lo quitado. **Jugado** (dormido, iglesia) y **guardado de RC17** con Alonso dormido. |
| A3 | **Corregida** | Gag de las uvas como secuencia directa (sin panel), con el control devuelto al final. Fuera cerezas, cesta, «verdes hasta septiembre», «Higos, todavía no» y «hojas de otoño». La higuera vuelve a «cargada de higos morados». Se conserva la parra pintada. **Jugado**: entrar, gag, salir y volver; la segunda vez, «Se acabó el racimo. La gracia, no.». También con toques táctiles en móvil. |
| M1 | **Corregida** | Motor: el panel no se dibuja mientras corren las acciones de un nodo, y un toque adelanta sus frases. El ciego y Mingo ya no usan el panel (Mingo da la pista directamente). **Jugado**. |
| M2 | **Corregida** | El aviso se ancla por su borde derecho dentro del panel. Capturas en escritorio y móvil. |
| M3 | **Corregida** | Al cambiar de escena se descartan los comentarios sueltos, y no se dibuja el bocadillo de quien no está en la escena. **Jugado**: salir del soto → 0 bocadillos ajenos. |
| M4 | **Corregida** | Mingo se coloca dentro del cuadro (220 px de margen), fuera del zurrón y sin pisar a otro personaje. `audit_encuadre` en RC18: 0 casos de Mingo fuera de cuadro o bajo el zurrón (RC17: 9). Móvil: 100 % visible. |
| M5 | **Corregida** | Los clips 216/222/223 **sí contienen la cabeza entera** (90–100 px de margen arriba en el vídeo); el corte era de la celda. Hoja rehecha con los mismos clips, misma escala y celda 240×372 (antes 348): 0 fotogramas tocan el borde (antes, todos). La altura en pantalla no cambia (`height` 321 con la celda más alta). Reposo, marcha y habla comprobados en la partida completa y en la comparación de celdas. |
| M6 | **Corregida** | Fuera «Sin badajo…» (Benito) y el «truco» de Lope de los comentarios espontáneos. |
| M7 | **Corregida** | La escena, los alfileres del mapa y los sitios se llaman «Plaza Mayor». Tarima y público, con textos neutros. |
| M8 | **Corregida** | La sustitución ya solo afecta al barquero: respeta «Sancha Alfonso», «Alfonso IX», «rey Alfonso», «Alfonso VIII»… (probado en Node). El mapa dice «la choza de Martín». |
| B1 | **Pendiente** | Zapatos de Mingo cortados en la higuera: no hay clip de Mingo en el repositorio para rehacer esa fila. Hace falta el clip original. |
| B2 | **Corregida** | Yuçaf deja sitio a la cadena del tiro; la balanza y su grupo, 150 px a la izquierda; entrada a la Puerta del Río por delante de los guardias; el viajero ya no se para bajo el zurrón al entrar en el soto o la ribera ni en la cesta de carbón. `audit_encuadre` final (65 pausas). Quedan tres casos menores: (1) al entrar en la taberna durante la balanza, la cuadrilla se ve a medias en el borde, porque la cámara sigue al jugador (la de diálogo los encuadra cuando hablan); (2) en el soto y la taberna, el viajero roza el zurrón un instante justo al tocar la salida de la izquierda; (3) en el alfar, Mingo se pone delante del viajero cuando este va a la cesta de carbón, pegada a la pared. |
| B3 | **Corregida** | Yuçaf y el pregonero de la Plaza Mayor desaparecen tras la destitución. **Jugado**. |
| B4 | **Corregida** | Durán: «¡Eh, tú! ¿De dónde sales con esas ropas?». |
| B5 | **Corregida** | Fuera las dos frases que se adelantaban (comprobado en el código; son frases de espera al azar). |
| B6 | **Corregida** | Sin «Mapa de Talavera» en la pausa hasta tener el mapa de Rai. **Jugado**. |
| B7 | **Corregida** | El nombre de Alonso se sincroniza en los dos sentidos, en el bucle de juego. **Guardado de RC17** antes de la lanza → «Viejo soldado». |
| B8 | **Corregida** | **Reproducido en RC17** (guardar desde el menú a mitad del eclipse → la campana nunca responde). RC18 lo arregla al restaurar: el eclipse empieza de nuevo. El estado de la Luna pasa al bucle de juego, no al dibujo, con «¡Ahora!» de reserva. **Guardado de RC17** → llega al presente. |
| B9 | **Corregida** | Indicaciones breves y en su momento: «Mingo se une a ti.» y «Nuevo: el mapa de Rai (botón de la derecha).». |
| B10 | Sin cambios (inactivo) | Comprobados los dos identificadores de cuña: `cuna` («Cuña de obra», carreta antigua, inalcanzable) y `cuna17` («Cuña», la de la mesa). No colisionan; no se toca el inventario. |
| **N1 (nuevo)** | **Corregida** | **Reproducido en RC17**: guardar a mitad del pesaje de la señora deja la cuña gastada y la balanza sin respuesta. RC18, al restaurar, devuelve la cuña al zurrón y recoloca a la cuadrilla. **Guardado de RC17** → rescate completado. |
| N2 (nuevo) | Corregida, **solo por código** | Misma reparación al restaurar para otras secuencias guardadas a medias: lanza de Alonso, palada del horno, confesión de Rai, destitución y llegada a la iglesia. Además se relanza la entrada de la escena tras cargar. No se han jugado esos guardados. |
| N3 (nuevo) | **Corregida** | La pista de Mingo ponía «martín» en minúscula. |

### Pruebas ejecutadas sobre la compilación entregada (md5 comprobado)

**Jugadas en Chromium**, con toques reales sobre zonas y personajes y las frases avanzadas como lo haría el jugador:
- `pt_guion.py`: partida nueva completa de la ribera al FIN. 50 comprobaciones correctas, 0 fallos, 0 errores.
- `pt_rc18.py`:
  - gag del soto al entrar, salir y volver;
  - Alonso dormido y en la iglesia;
  - abandonar y retomar la balanza y el alfar;
  - la tarima de la Plaza Mayor y los personajes duplicados.

  Todo correcto.
- `pt_rc18_extra.py`: Mingo da la pista sin panel; el menú de pausa no ofrece el mapa antes de tenerlo. Todo correcto.
- `pt_movil.py`, en ventana de móvil apaisado (915×412, táctil, DPR 2,625) con **toques táctiles**:
  - portada, robo del móvil, soto (Mingo y río) y gag del ciego;
  - pértiga, rueda con el zurrón y Sancha;
  - panel de diálogo, más el encuadre de Mingo al entrar en cada escena.

  Todo correcto, 0 errores.
- `saves_guion.py`, con 4 guardados hechos **en RC17** con el botón «Guardar partida» y cargados en RC18 con «Continuar»:
  - antes de la lanza;
  - Alonso dormido;
  - balanza a medias;
  - eclipse a medias.

  Los cuatro continúan bien. En RC17, tres de ellos fallaban.

**Comprobaciones de código o de datos (no jugadas)**:
- `audit_alcance.py`: no queda ningún acceso a la Vista ni frases de cerezas o de estación que contradigan el arte.
- `audit_hojas.py`: la hoja del protagonista ya no tiene recortes.
- `audit_encuadre.py`: registro de encuadre en cada pausa.
- Reparación de las otras secuencias guardadas a medias (N2).

**Pendiente**: la prueba con una persona que no conozca el guion, en un móvil real. Conviene observar:
- en el soto, si se le ocurre mirar el río cuando Mingo dice que no lo ve;
- en el Chamelo, si entiende que hay que dar a Mingo a Rai desde el zurrón;
- en el alfar, el orden tiro → carbón;
- en el soto de noche, si llama al gato;
- en la taberna, si relaciona la cuña de la mesa con la balanza;
- en la Puerta del Río, si gira el poste;
- en la iglesia, si espera a «¡Ahora!».

Anotar dónde pierde el objetivo, qué diálogo se salta y qué le hace gracia.

**Comprobación de cierre (jugada en RC18, md5 de la entrega comprobado):** el menú de Alonso en la taberna ya no tiene opciones de campana ni de toques. Antes de la lanza ofrece: aventura, «¿Quién sois?», la punta de la lanza, Don Nuño, el abuelo del porche y salir. Después de la lanza ofrece lo mismo sin la punta de la lanza. Los nodos `campana` y `toques` siguen en los datos, pero ya no se pueden alcanzar. Ojo: el volcado de opciones con «campana» y «toques» que aparece en esta auditoría es de **RC17**.
