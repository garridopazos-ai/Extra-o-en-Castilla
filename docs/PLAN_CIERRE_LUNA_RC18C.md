# PLAN DE CIERRE LUNA · RC18c

**Base:** `builds/1248_CHAMELO_RC18c.html`, que no se sobrescribe. RC18d ya añade Rai-gato: los cambios se encadenan sobre RC18d si se aprueba su gato; si no, sobre RC18c.

**Diagnóstico:** `docs/AUDITORIA_LUNA_RC18C.md` (en este plan, «A§n» remite a sus secciones).

**Cómo se aplica:**
- Cada cambio de Claude va en un módulo nuevo encadenado después de `rc18c.js`, con su propia build.
- No se reconstruye el motor ni se reescribe la historia.
- No se crean personajes ni subtramas; el pastor ya está aprobado en la revisión 2.
- No se sustituye arte aprobado.
- Cada cambio se comprueba solo en su escena, sin partidas completas.

---

## Orden por impacto en el jugador

| # | Tarea | Qué gana el jugador | Quién | Tamaño |
|---|---|---|---|---|
| 1 | Salidas señalizadas con su destino y zonas táctiles mínimas (F2.1–F2.3) | Sabe dónde pulsar y adónde va | Claude | S |
| 2 | Objetivo siempre visible y mapa en la esquina superior derecha (F2.4–F2.5) | Sabe qué intenta y dónde está | Claude | S |
| 3 | Fijar desde el principio que quiere volver a casa y que Rai es quien sabe de eso (F3.R) | Entiende por qué va a ver a Rai | Claude | XS |
| 4 | Quitar pistas falsas: destello de la ribera, carreta, «apicultor», «una moneda por cruzar» (F2.8, F3) | No se distrae | Claude | XS |
| 5 | Recortar texto: acotaciones convertidas en acciones visibles, menos repeticiones; objetivo −30 % (F3) | Lee menos y ve más | Claude | M |
| 6 | Que Nuño se entienda por lo que hace (F3.N) | Entiende al villano | Claude | S |
| 7 | Arte P1: señora, cuadrilla, objetos clave y bostezo del gato (F5) | Entiende los puzles mirando | ChatGPT → Claude | L |
| 8 | Alonso: andar con sus clips, fracasos visibles, árbol corto (F3.A) | Alonso hace gracia por lo que hace | Claude (+ gestos de ChatGPT) | M |
| 9 | Secundarias 11–15 y anotaciones del mapa (F4) | Más juego, sin bloqueos | Claude + ChatGPT | L |
| 10 | Prueba con alguien que nunca haya jugado, en un móvil | Validación | César | — |

Las tareas 1 a 6 no necesitan arte nuevo y pueden ir en una sola build. La 7 desbloquea la 8 y la 9.

---

## Fase 2 · Navegación y claridad (intervención mínima)

Se corrige el sistema que ya existe (salidas como zonas, mapa de ruta de G11, pistas «?»); no se sustituye. Las flechas de F2.1 marcan también las salidas de vuelta, así que regresar es tan visible como avanzar.

| Id | Cambio | Qué ve el jugador | Sobre qué código | Tamaño |
|---|---|---|---|---|
| F2.1 | **Flecha en cada salida, siempre** | Una etiqueta pequeña y semitransparente con flecha y destino. En los bordes: «← Ribera». Sobre las puertas: «▲ Aceña». Si está cerrada, en gris con candado (al tocarla sale la frase de aviso que ya existe). Se oculta durante diálogos y secuencias | Usa el dibujo de la flecha de ruta (`g11_journey.js:117-130`) para todas las `h.exit` de la escena. La etiqueta es también un botón (`U.buttons`) que ejecuta la salida | ~80 líneas |
| F2.2 | **La etiqueta dice el destino real** | Los nombres son los del mapa: «Embarcadero» en vez de «Camino a la ribera»; «Plaza del Pan» en vez de «Postigo de la ciudad» | `E.journey.places[exit.to]` | XS |
| F2.3 | **Zonas táctiles mínimas** | Al menos 120 × 120 px lógicos (unos 48 px reales en el Pixel) en salidas y objetos de puzle. Se amplían las 7 zonas pequeñas de A§5 sin pisar otras | Campo `rect` en los datos | XS |
| F2.4 | **Mapa arriba a la derecha desde el principio** | Fila superior: mapa · zurrón · menú. Antes del puzle 3, el botón está apagado y al tocarlo dice: «Aún no tengo mapa. Dicen que Rai, el del Chamelo, tiene uno.» Así el puzle 3 se mantiene y además señala a Rai | Posición: `g11_journey.js:61`. Condición: `rc17.js:632-635` | S |
| F2.5 | **Objetivo siempre a la vista** | Una etiqueta arriba a la izquierda con el objetivo de la pista activa («Cruzar el Tajo», «Ver a Rai»…; ya existen, de 2 a 4 palabras). Al tocarla sale la pista «?». Se oculta en los diálogos | `U.objective()` (HTML l.2115) dibujado en el HUD | S |
| F2.6 | **Volver rápido** *(decisión)* | En el mapa, tocar un lugar ya visitado muestra «Ir»: viaja por la misma ruta de salidas, respetando las puertas cerradas | `route()` (`rc07.js:720`) ya calcula los tramos; se entra por el último | S |
| F2.7 | **El zurrón, solo para objetos** | Mingo deja de ser un objeto. Tocarle ya da la pista (`rc18.js:54`). Rai y el ciego reaccionan cuando les hablas, no cuando les «das» a Mingo | `rc17.js:179` (`give: 'mingo'`), `rc18c.js` (`give:mingo`) | XS |
| F2.8 | **Menos ruido** | Fuera el destello de la ribera, que remite a la moneda eliminada (HTML l.3044 y l.5463), y la carreta atascada (capa `cart1`). El aviso «Efectos reducidos…» pasa al menú de pausa (HTML l.5953). La pulsación larga se queda como atajo | Datos y una línea | XS |

**Criterio de aceptación**, en un móvil y en cada pantalla:
- todas las salidas se ven con su destino;
- el objetivo está a la vista;
- cada objeto de puzle se puede tocar a 48 px.

Tras cada salto automático (A§5), el nombre del lugar ya sale arriba y F2.5 actualiza el objetivo.

---

## Fase 3 · Simplificación narrativa

**Reglas** (las del protocolo):
- Cada acotación «(…)» se convierte en algo que se ve o se elimina.
- Cada chiste se cuenta una sola vez.
- Ninguna explicación que la escena ya muestre.
- Los cambios de texto son cortes, o una frase nueva como máximo por escena.

**Cifras objetivo** para el texto obligatorio:
- de 168 a unas 115 líneas;
- de 44 acotaciones a 15 o menos.

### Escena por escena

| Escena (código) | Debe entender | Debe hacer | Sobra (eliminar) | Situación cómica en vez de explicación |
|---|---|---|---|---|
| Ribera, llegada (`g12_content.js:30-46`) | Está en 1248, junto a Talavera. Quiere volver a casa. Un crío le roba el móvil | Perseguir al crío (salida derecha) | «Y mi estómago dice…» (trama del hambre eliminada); 2 de las 3 frases de Mingo; «¿Es de Toledo?», que repite Durán | El móvil enseña la fecha: «2 de junio de **1248**». Viajero: «…Tengo que volver.» Mingo se lo quita de la mano |
| Soto, Mingo (`rc17.js:160-194`) | Mingo no ve el río desde la rama y es curioso | Mirar algo; mirar el río con asombro | El truco pasa de 9 a 6 líneas: fuera «Te has metido tú. Veinte veces.» y el rótulo «Mingo se une a ti» (se ve que te sigue) | Mingo **salta** de la rama. Al unirse: «¿Volver a tu casa? Eso es cosa de Rai, el del Chamelo.» (fija el objetivo y la función de Rai) |
| Aceña, rueda (`rc17.js:144-158`; HTML l.3330-3380) | Un tronco atasca la rueda y por eso el camino está inundado | Coger la pértiga y usarla en la rueda | El menú de Durán pasa de 5 opciones a 2 (rueda y adiós). «¿Dónde estamos?» ya no hace falta (ribera). Fuera «Mira este aparato» | Durán, **blanco de harina** y serio: «Ya muele». El efecto de harina ya existe (`rc17.js:644`) |
| Ribera, Sancha (`rc17.js:120-128`) | Sancha es panadera y amiga | — | Nada (RC18b ya la recortó) | — |
| Chamelo, paloduz (`rc18c.js`) | Rai sabe cosas raras y cambia su mapa por paloduz, que crece en la orilla | Hablar, coger la raíz, dársela | El trato pasa de 12 a 7 líneas: fuera «Toma: paloduz de tu orilla» y el par «Está del revés / Para el que viene de lejos…». Los comentarios de «apicultor» (`rc07.js:554`). La frase de Mingo «Yo le he visto usar una caña» | Se **ve** el mapa del revés. Tras el trato, Rai esquiva la pregunta: «¿Volver a tu casa? Eso, en Talavera. Allí hay de todo.» (motiva cruzar) |
| Embarcadero y travesía (`rc17.js:251-265`) | Martín te cruza gratis por la rueda | Tocar la barca | «Una moneda por cruzar…» (`rc07.js:555`). Travesía de 3 líneas a 1: fuera el chiste del aire, que se repite | — |
| Puerta del Río (`rc17.js:267-283`) | Los Giles discuten y entras | Nada | La carreta (F2.8). El rótulo «Mientras discuten, entras…»: el viajero ya pasa andando | — |
| Plaza del Pan (`rc17.js:297-322`) | Nuño amenaza el alfar; Sancha te lleva allí | Seguir a Sancha (calle de los Olleros) | — | **Nuño cruza la plaza** y le cobra al pregonero «la tasa de pregón»: lo vemos, no nos lo cuentan (F3.N) |
| Alfar (`rc17.js:324-373`) | Nuño quiere el alfar; con el horno encendido nadie puede cerrarlo | Tirar de la cadena y echar carbón | El desenlace pasa de 10 a 6 líneas: fuera los dos rótulos de los guardias y «Volverá. Con más tasas y menos pluma.» | Lapsus: «Por tres dineros, este alfar es mío… digo, queda **precintado**.» El lacre gotea y la pluma humea, como efecto (igual que la harina) |
| Taberna, lanza (`rc17.js:380-392`) | Alonso es un fanfarrón; Lope le arregla la lanza; Rai avisa de antorchas en el soto | Nada | Rótulo «Así que el viejo soldado se llama Alonso» (el nombre ya cambia en su etiqueta) | Alonso **se levanta y se vuelve a sentar** (gesto) en vez del rótulo |
| Soto de noche (`rc17.js:399-440`) | No se ponen de acuerdo; hay un gato | Llamar al gato | «Antorchas. Y cuatro señores que…» (sus gritos ya lo dicen). Rótulo «Retroceden tres pasos…» (se ve) | El gato cruza el mapa (RC18d) y **el mapa se rompe en cuatro** (arte P1) |
| Chamelo, confesión (`rc17.js:214-227`) | Rai lo trajo; vuelve con la Luna roja y la campana | Nada | Nada: con F3.R la confesión ya responde a una pregunta que el jugador se ha hecho | — |
| Plaza, secuestro (`rc17.js:302-309`) | Han secuestrado a la señora; está en la taberna | Ir a la taberna | El rótulo «OBJETIVO:…», que pasa a la etiqueta de F2.5 | — |
| Taberna, balanza (`rc17.js:442-493`) | El soporte de la balanza cojea, igual que la mesa con su cuña | Coger la cuña y ponerla bajo el soporte | El pesaje pasa de 18 a 11 líneas: fuera «¡Otra vez!», «¡El oro!» y 3 de los 5 rótulos | La **aguja** de la balanza marca «gallina» y después «bueyes» (arte P1). **Alonso carga andando** y se engancha (clips existentes + gesto). Las monedas ya están hechas por código |
| Plaza Mayor, destitución (`rc17.js:495-517`) | La señora manda sobre Nuño y le quita el cargo; el alfar vuelve a Yuçaf | Nada | El rótulo del móvil, que no se entiende. El grito final del pregonero | «**Mi señora**, por el rescate corresponde una tasa de…»: dos palabras fijan quién manda |
| Puerta, aldea (`rc17.js:519-531`) | Se puede girar el poste | Girar el brazo | Rótulo «Mientras discuten… giras el brazo» (el brazo ya gira por código) | Viñeta de Talabayra (arte P2) |
| Atrio, Luna roja (`rc17.js:533-561`) | Tirar cuando Rai grite «¡Ahora!» | Tirar de la cuerda | Rótulo «(La campana suena hondo…)»: se oye y Alonso sube | Alonso **colgado saludando** (gesto) |
| Ribera, regreso (`rc17.js:129-141`) | Fue real | Nada | Nada: el epílogo lo pide el guion | El gato **bosteza** (falta el clip) |

### Nuño se entiende por lo que hace (F3.N)

| Cambio | Dónde |
|---|---|
| Aparece en la plaza cobrando una tasa absurda al pregonero (una frase y un gesto) | `plaza.firstEnter` (`rc17.js:299`) |
| Lapsus de codicia en el alfar | `rc17.js:367` |
| «Mi señora…» en la destitución, y fuera el rótulo del móvil | `rc17.js:504-506` |
| El chiste de la tasa se dice una vez. Quedan el pregonero y el tablón; fuera la travesía, el «¿Quién es Don Nuño?» de Sancha, el adiós de Alonso y el comentario de Benito | `rc17.js:263, 293`; nodo `adios`; `rc07.js` (BARKS) |
| Opcional: su lacre aparece en el monstruo falso, sin explicarlo (F4, nº 11) | Secundaria |

### Rai tiene una función reconocible (F3.R)

1. Desde el soto, Mingo lo nombra como quien sabe de «volver».
2. El botón del mapa apagado remite a él (F2.4).
3. Fuera «apicultor» y la caña de Mingo.
4. Después del mapa, Rai manda a Talavera con una evasiva.
5. La bufanda roja del gato (RC18d) queda como pista visual del gato-Rai.

### Alonso, cómico por sus fracasos (F3.A)

1. Andar con sus dos clips, que ya existen: deja de deslizarse.
2. Sus fracasos se ven, no se cuentan:
   - levantarse y volver a sentarse;
   - cargar y engancharse;
   - quedar colgado de la cuerda;
   - los molinos (F4).
3. Su menú pasa a 3 opciones: una aventura (rotan solo 2: la lagartija-dragón y las suelas de las botas), Fortún y adiós. El duelo (F4) sustituye a las otras aventuras. Fuera las dos frases largas de «¿Quién sois?».

---

## Fase 4 · Misiones secundarias

**Estado actual:** las cinco faltan (A§4). La revisión 2, aprobada, ya fija el problema, las acciones y la solución de cada una. Aquí solo se diseña lo que falta: cuándo y dónde ocurre, el gancho, la consecuencia visible, el arte y el código.

Se usan **dos ventanas sin escenarios nuevos**:
- **Ventana N (noche):** desde que la cuadrilla acampa en el soto (`noche_soto`) hasta que el jugador llama al gato. El soto y la ribera, contiguos, ya están de noche (`noche` desde el alfar), y el jugador ya está allí.
- **Ventana D (día de fiesta)** *(decisión)*: después de la destitución. En vez de saltar a la Puerta del Río (`rc17.js:513-517`), la cuadrilla aparece la próxima vez que el jugador entre allí. El objetivo de F2.5 será «Vigilar la Puerta del Río».

| Nº | Ventana y lugar | Gancho | Acciones | Resolución | Consecuencia visible | Arte | Código |
|---|---|---|---|---|---|---|---|
| 11 Monstruo del Tajo | N · extremo oeste del soto (x 900–1300; la cuadrilla está en 2600) | Al entrar, un bramido. Mingo: «¡El monstruo del Tajo!» | (1) Mirar los juncos: se ve una cuerda. (2) Soltar la cuerda | El cesto con pieles se hunde con un bocinazo triste. La cuadrilla deja de discutir para reírse | Dos ojos en el agua (solo los ves tú). En el cesto, el lacre con el anillo de Nuño. Al día siguiente, Martín: «¡Vuelven los pasajeros!». Pegatina en el mapa | Silueta en 2 estados y ojos (P3) | 2 zonas, 2 capas, 1 bandera |
| 13 Ovejas | N · ribera | Al entrar, el pastor: «¡Otra menos!» | (1) Mirar las huellas, que acaban de golpe (Mingo: «Ni que volaran»). (2) Usar el móvil en el resplandor detrás del árbol grande | La nave contesta parpadeando. Una oveja sube en el haz, sigue pastando y la bajan… pero se llevan el gorro del pastor | Por la mañana (tras la confesión), el pastor en la ribera con todas las ovejas y sin gorro. Pegatina en el mapa | Pastor, ovejas, nave y haz (P3) | Personaje `pastor`, capas, `use:telefono` |
| 15 Duelo | D · taberna, al entrar (una sola vez) | Alonso cuenta «la batalla de la balanza» | Ninguna: es un gag | Viñeta de 10 s: dos guerreros, primerísimos planos, silencio, cortes de correas y se caen los pantalones | Sancha: «Te quedaste en calzones.» Alonso sale «de ronda», lo que abre la nº 12 | Viñeta del duelo (P3) | `{vineta: […]}`, que ya existe (`rc07`) |
| 12 Alonso y los molinos | D, después del duelo · aceña | Tras el duelo, Alonso sale «de ronda» y Sancha va a por harina. En la aceña se ve a Alonso en la rueda a través de la puerta, gritando al «enemigo que agita los brazos» | Cerrar la compuerta del caz (1) | La rueda se para con él arriba, cabeza abajo: «Se ha rendido.» Sancha, comprando harina, ni levanta la vista | Alonso vuelve a la taberna con la lanza torcida; Lope suspira. Pegatina en el mapa | Compuerta (2 estados) y Alonso cabeza abajo (P3) | Zona y capa con `visibleWhen`, 1 bandera |
| 14 La pala del alguacil | D · Plaza del Pan, primera entrada | Rai-gato hace sus necesidades junto a la fuente. Gil del Paso te acusa y te da la pala | Recoger con la pala (1) | Gil se lleva la pala (no va al zurrón) | Rai-gato mira desde el tejado, guiña y se va | Rai-gato agachado y en el tejado (P3) | Secuencia y 1 bandera |

**Para todas:**
- Duran de 1 a 3 minutos.
- Ninguna toca banderas de la historia principal.
- Si se ignoran, no pasa nada: el gato, la Puerta y la campana siguen igual.
- La pista «?» no empuja a hacerlas; la etiqueta de objetivo solo muestra la historia principal.

**El mapa gana anotaciones** (guion, puzle 01): se parte de un mapa histórico limpio (F5-E) y, al resolver cada aventura, el código pega su dibujo: aldea (puzle 8), monstruo, nave, molino y gato. Es la consecuencia visible común.

---

## Fase 5 · Arte para ChatGPT

### Formato de entrega

- **Personajes:**
  - vídeo de 2 a 4 s sobre verde plano (`#00B140`), 24 fps, cámara fija;
  - cuerpo entero con un 10 % de margen arriba y abajo;
  - misma escala y misma línea de pies en todos los clips de un personaje;
  - sin sombra proyectada;
  - reposo y hablar en bucle, que empiecen y acaben igual;
  - caminar en el sitio, con dos pasos completos, sin desplazarse.

  También vale una secuencia PNG transparente a 24 fps sobre un lienzo fijo. Hay que respetar la orientación indicada; el motor voltea al otro lado.
- **Fondos:** sin personajes ni texto, a la medida exacta. Todo lo que cambia de estado va en una capa PNG aparte.
- **Estilo:** el que se decida (A§1). Para los personajes, la referencia son las hojas actuales de Nuño, Sancha, Rai y Alonso.
- **Nombres de archivo:** `<id>_<animación>.mp4` (por ejemplo, `oropesa_hablar.mp4`) y `<escena>_<variante>.png`.
- **Dónde:** en `assets/inbox/`.

**Prioridad:**
- **P1:** sin esto no se entiende la historia principal.
- **P2:** mejora clara.
- **P3:** secundarias o acabado.

### A. Personajes

La altura es relativa y aproximada: viajero = 1,00, que son 321 px en el juego. Sale del alto de cada figura en el código.

En las columnas de animación: **Sí** = hay que producirla; **Existe** = ya está en el juego; **—** = no hace falta.

| Personaje | Id | Recurso actual | Reposo | Hablar | Caminar | Gestos especiales | Altura | Mira a | Dónde | Prio. | Reutilizable |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Señora de Oropesa | `oropesa` | Marioneta (`rc17.js:37`) | Sí (atada y suelta) | Sí | Sí | «Encantada» (gallina), «ofendida» (bueyes) | 0,90 | Derecha | Taberna, Plaza Mayor | **P1** | Vestuario de la marioneta: toca blanca, vestido granate, capa morada |
| El cabecilla | `requete_a` | Marioneta (`:38`) | Sí | Sí | Sí | Señalar el mapa, tirar del mapa, «¡Retirada estratégica!» | 0,95 | Derecha | Soto de noche, taberna, Puerta | **P1** | Turbante verde, barba negra |
| El del turbante blanco | `requete_b` | Marioneta (`:39`) | Sí | Sí | Sí | Tirar del mapa | 0,93 | Derecha | Ídem | **P1** | Delgado, perilla |
| El del gorro rojo | `requete_c` | Marioneta (`:40`) | Sí | Sí | Sí | Tirar del mapa | 0,90 | Derecha | Ídem | **P1** | Grueso, bigote |
| El viejo de la capucha | `requete_d` | Marioneta (`:41`) | Sí | Sí | Sí (despacio) | Tirar del mapa | 0,89 | Derecha | Ídem | **P1** | Barba blanca, capucha parda |
| Rai-gato | `gato` | RC18d: andar, sentarse, guiño (de César) | Existe | — | Existe | **Bostezar con la boca abierta** (P1, epílogo); hacer sus necesidades y sentado en un tejado (P3, nº 14) | 0,33 | Derecha | Soto, ribera, plaza | P1 / P3 | El mismo gato de los clips |
| Alonso | `soldado` | `hoja.webp` | Existe | Existe | **No producir**: hay dos clips, lo integra Claude | Levantarse y volver a sentarse, cargar y engancharse, colgado saludando, dormido; cabeza abajo en la rueda (P3) | 1,02 | Derecha | Taberna, atrio, aceña | P2 | Vestuario de sus clips |
| Mingo | `mingo` | `flow_rc01` | Existe | Existe | Existe | Sentado en la rama con los pies dentro del cuadro; saltar de la rama | 0,70 | Derecha | Soto | P2 | Su hoja |
| Viajero | `player` | `sheet_g11` | Sí (hoy 1 fotograma) | Existe | Existe | Agacharse a coger, asombro fingido (puzle 1), abrir la mochila (final) | 1,00 | Izquierda, como su hoja | Todo | P2 | Comprobar antes los clips 218 y 225 |
| Gil del Paso y Gil del Peso (alguacil) | `guardia` | Marioneta | Sí | Sí | Sí | Dar la pala (nº 14); dos variantes: alto y flaco, bajo y grueso | 0,93 | Derecha | Puerta, alfar, plaza | P2 | — |
| Yuçaf | `yucaf` | Marioneta | Sí | Sí | — | Alegría | 0,93 | Derecha | Alfar, Plaza Mayor | P2 | — |
| Maese Lope | `lope` | Marioneta | Sí | Sí | Sí | Martillazo y soplarse el dedo | 0,95 | Derecha | Plaza, taberna, atrio | P2 | — |
| Don Nuño | `nuno` | `flow.webp` | Existe | Existe | Existe | Sacudir la mano (lacre), entregar el sello, cobrar con la mano tendida | 0,95 | Derecha | Plaza, alfar, Plaza Mayor | P2 | Su hoja |
| Sancha | `elvira` | Hoja de Elvira | Existe | Existe | Existe | Dar la hogaza | 0,90 | Derecha | Atrio | P2 | Su hoja |
| Rai | `leonor` | `raimundo/flow.webp` | Existe | Existe | Existe | Morder el paloduz, desplegar el mapa del revés, levantar el bastón («¡Ahora!») | 1,22 | Izquierda, como su hoja | Chamelo, atrio | P2 | Su hoja |
| Pregonero y Fray Benito | `pregonero`, `benito` | Marioneta | Sí | Sí | — | — | 0,93 / 0,90 | Derecha | Plaza, atrio | P3 | — |
| Arriero y peregrina | `arriero`, `peregrina` | Marioneta | Sí | Sí | — | — | 0,88 | Derecha | Taberna | P3 | — |
| Pastor | `pastor` (nuevo, aprobado en la revisión 2) | No existe | Sí (con y sin gorro) | Sí | — | — | 0,90 | Derecha | Ribera | P3 | — |
| Ovejas | `oveja` (nuevo) | No existe | Pastar en bucle | — | — | Flotar en el haz | 0,30 | Derecha | Ribera | P3 | Una oveja con variaciones |

### B. Escenarios y viñetas

| Recurso | Id | Actual | Necesario | Medida | Prio. | Reutilizable |
|---|---|---|---|---|---|---|
| Aceña por dentro | `acena` | `scenes/acena/bg_g12.webp` (plano, sale de una captura) | Fondo limpio con la misma composición: puerta abierta a la izquierda con la rueda vista (la rueda gira en su capa, `acena/rueda.webp`), muela al centro (capa delantera `muela_frente`), barriles a la derecha. Suelo de y 660 a 885 | 1600×900 | **P1** | Composición actual |
| Atrio de noche | `iglesia` | Capa de color | Versión nocturna con cielo despejado arriba al centro (la Luna la dibuja el código en x 1010, y 72) | 1600×900 | P2 | Repintar de noche el fondo actual |
| Soto de noche | `orilla` | Capa de color | Versión nocturna de `soto_acuarela` (la antorcha la pone el código en x 2672) | 4000×900 | P2 | Ídem |
| Ribera de noche | `ribera` | Capa de color | Versión nocturna | 2600×900 | P3 | Ídem |
| Ribera en el presente | `ribera` (`presente`) | Filtro de saturación | La misma vista hoy | 2600×900 | P3 | Misma composición |
| Viñeta de Talabayra | `R17.card` (`rc17.js:737`) | Dibujada por código | Aldea con reloj de sol, el poste y los cuatro sentados en corro discutiendo; franja inferior libre para tres líneas | 1880×1040 | P2 | — |
| Viñeta del duelo | — | No existe | 3 o 4 paneles (o un clip de 10 s): dos guerreros, primerísimos planos, silencio, cortes de correas, se caen los pantalones | 1600×900 | P3 | — |
| Estilo único | — | Cinco familias (A§1) | **Decisión de dirección artística antes de pintar**; no se repinta arte aprobado sin el visto bueno de César | — | — | Los 8 fondos de `art/escenarios/nuevos/` ya están en estilo C |

### C. Objetos y capas

PNG transparente, a la escala del fondo. Medidas en px del lienzo. Orientación: la del fondo (vista frontal, un poco desde arriba). Todos son recursos nuevos; ninguno reutiliza arte existente salvo que se indique.

| Objeto | Dónde (capa o código) | Actual | Necesario | Medida | Prio. |
|---|---|---|---|---|---|
| Balanza enorme | Taberna, capa `balanza` (x 1730, y 470) | Código (`rc17.js:596`) | Soporte cojo bien visible, platillo, pesas; aguja o dial que marque «gallina» y «bueyes» | 320×330 | **P1** |
| Cuña | `cuna_mesa` (x 1182, y 736) y `cuna_bal` | Código | Cuña de madera clara, en dos tamaños | 50×24 y 40×22 | **P1** |
| Mapa de la cuadrilla | `mapa_suelo` y `mapa_roto` (soto, x 2600) | Código (`rc17.js:610`) | Pergamino en el suelo, entero y roto en cuatro | 140×44 y 160×52 | **P1** |
| Trampilla y cadena del tiro | Alfar (`rc17.js:677-682`) | Código | Trampilla cerrada y abierta en lo alto del horno, con cadena y argolla; 2 estados | Unos 70×20 más la cadena | **P1** |
| Brazo «A TALAVERA» | Puerta del Río (`rc17.js:692`, x 2010, y 432) | Código | Tabla con flecha y texto; 2 estados (hacia la puerta y hacia el camino) | 190×30 | **P1** |
| Cuerda de la campana | `cuerda_campana` (atrio) | Marcador de G11 | Cuerda gruesa con nudo y tirador | 55×510 | **P1** |
| Compuerta del caz | Aceña (nº 12) | No existe | Abierta y cerrada | Unos 120×160 | P3 |
| Monstruo falso | Soto (nº 11) | No existe | Cesto con pieles y cuerno en un palo, en pie y hundido; dos ojos en el agua | Unos 220×260 | P3 |
| Nave con haz | Ribera (nº 13) | No existe | Nave y haz (capa clara aparte) | Unos 300×400 | P3 |
| Mata de paloduz | `paloduz_mata` y `paloduz_raiz` (Chamelo) | PNG provisional de Claude | Sustituir solo si no encaja en el estilo | 195×163 | P3 |
| Marcadores de G11 (banco, tablón, hogazas, red, torno) | Capas con `placeholder` | Código | Quitarlos si el fondo ya los pinta; si no, PNG | — | P3 |

### D. Iconos del zurrón

Móvil, pértiga, cuña y hogaza. Hoy están dibujados por código (`rc17.js:617-621` y marcadores de G11). Formato: PNG de 192×192 con silueta clara (se muestran a 96). **P2.**

### E. Mapa

Un **mapa histórico limpio** de 2400×1350, con el mismo encuadre que `art/portada/mapa_talavera_v2.jpg` pero:
- sin «Vista Pública»;
- sin monstruo, ovni, dragón, galeón ni «Gigante».

Además, **pegatinas PNG** (aldea, monstruo, nave con oveja, molino con lanza, gato) que el código añade al resolver cada aventura. Los números de lugar los sigue poniendo el código. **P2.**

---

## Reparto de tareas y decisiones

| Quién | Tareas |
|---|---|
| **Claude** | F2.1–F2.8. Los recortes y frases de F3 (escena por escena, F3.N, F3.R, F3.A). Integrar la marcha de Alonso con sus clips. F4: lógica y ventanas. Integrar todo el arte que llegue a `assets/inbox/`. Una comprobación corta por cambio, en su escena |
| **ChatGPT** | Arte de F5 por prioridades: P1 (señora, cuadrilla, bostezo, aceña, objetos clave), después P2 y P3. Decisión de estilo único |
| **César** | Decisiones pendientes (abajo) y la prueba con un jugador nuevo en un móvil |

**Decisiones pendientes:**
1. Estilo único (A o C) antes de pintar fondos nuevos.
2. Botón del mapa visible desde el principio y apagado hasta Rai (F2.4). Recomendado.
3. Ventana de día de fiesta tras la destitución (F4). Recomendado.
4. Mingo fuera del zurrón (F2.7). Recomendado.
5. Viaje rápido desde el mapa (F2.6).
6. Portazgo: dejar la puerta cerrada con su chiste o quitar esa zona.
7. El final del guion, que llegó cortado en la sección X.
