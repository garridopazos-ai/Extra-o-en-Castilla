# Pedido de arte para «1248 · Un extraño en Castilla» (lista priorizada para ChatGPT u otro generador)

**Cómo usarlo.** Claude no puede escribirle a ChatGPT: dejar un archivo en el repositorio no activa nada por sí solo. Lo práctico: César abre ChatGPT (con generación de imágenes), le pega el texto «Instrucciones» de abajo y le adjunta **2–3 imágenes de referencia** ya aprobadas (una de personaje, una de escenario) para que mantenga el estilo. Lo que ChatGPT devuelva se suelta en el chat de Claude; Claude lo recorta, quita el verde, lo escala, monta las hojas de animación y lo integra (esas herramientas ya existen: `production/CHAMELO/tools/build_*_rc20.py`).

## Instrucciones (para pegar)
Estilo: ilustración de cuento a **acuarela con línea de tinta fina**, colores cálidos y algo desaturados, texturas de papel; proporciones de dibujo animado (cabeza algo grande, manos expresivas); luz suave. Mismo estilo que las imágenes adjuntas. Sin texto ni letras dentro de la imagen, sin marcos, sin interfaz.
- **Personajes y animaciones:** un solo personaje, cuerpo entero, **de perfil o tres cuartos**, mirando a la izquierda, sobre **fondo verde liso (#00FF00) sin suelo ni sombra**, cámara fija, personaje centrado y entero (sin cortar pies ni manos), mismo tamaño en todos los fotogramas. Si es una animación: bucle de 2–3 s (marcha: un ciclo completo de dos pasos).
- **Escenarios:** sin personajes, horizontal, suelo caminable claro en el tercio inferior, panorama continuo. Formato final del juego: 1600×900 (escena fija) o 2700×900 / 4000×900 (con scroll).
- **Objetos sueltos (props):** el objeto solo, sobre fondo verde liso, mismo punto de vista que el escenario.

## Lo que ya está y NO hace falta pedir (comprobado contra el juego, RC21)
- **Con arte propio ya integrado:** protagonista (todas las animaciones), Elvira (que en el juego hace de **Sancha**), Nuño, Alfonso/Alonso, Durán, Mingo, el ciego, Rai (mago), Rai-gato (andar, sentarse, guiñar), viejo soldado (andar, reposo, hablar).
- **Con bucles dibujados de reposo/hablar:** Yuçaf, Lope, señora de Oropesa (4 gestos), pregonero, los dos Giles (los guardias de la puerta) y los **tres grupos de conspiradores** (en fila, en fila con antorchas y en corro).
- Fondos con arte propio: ribera, orilla, Chamelo, taberna (día y noche), soto de noche, plaza, puerta del Río, iglesia, alfar, corredera, embarcadero, travesía, audiencia.

## Lo único que realmente falta (hoy se ve como marioneta o dibujo por código)
**Prioridad 1 · cuatro personajes sin ningún arte**: reposo, hablar y andar (de perfil, mirando a la izquierda).
1. **Benito** (iglesia).
2. **El mayordomo** (audiencia).
3. **El arriero** (taberna).
4. **La peregrina** (taberna).

**Prioridad 2 · props con arte propio** (hoy los dibuja el código; objeto solo sobre verde): balanza de la taberna (reposo y en equilibrio), cuña de la mesa coja, mapa del suelo entero y roto en cuatro, cuerda de la campana, regla de la Puerta del Río, ladrillos del paso, viga del suelo, banco de Lope, hilo, tablón, hogazas del puesto, pajar del alfar, amarre del embarcadero.

**Prioridad 3 · opcional, solo si se quiere más vida** (nada bloquea):
- Ciclo de **andar** de perfil de Yuçaf, Lope, señora de Oropesa, pregonero y Giles: hoy, al caminar, se cambia a marioneta (al estar quietos ya se ven con su arte).
- Los cuatro **conspiradores por separado** (reposo, discutir, andar): en escena siguen siendo marionetas; los grupos ya recibidos se usan en las cartelas.
- Rai-gato: bostezar, correr, asustarse, esconderse, tropezar, dormir. Mingo sentado en la rama de la higuera (quitar los zapatos cortados).

## Pulido (aceña y sonido)
9. Aceña: la versión alternativa de Durán es muy superior al fondo actual; para usarla hacen falta, por separado y sobre verde: **la rueda sola** (para girarla), **el tronco atascado** contra la rueda, y la **rueda liberada con el agua cayendo**.
10. Cartelas del narrador (las ya hechas bastan; si se quiere, una ilustración de la Puerta del Río y de la plaza al amanecer).
11. Sonido real (opcional): río, pájaros, molino, mercado, horno, grillos nocturnos; bucles de 30–60 s.

## Qué puede hacer Claude sin arte nuevo
Reutilizar y derivar lo que ya hay: versiones nocturnas por colorimetría, recortes de los GIF recibidos, cartelas, efectos de luz, partículas y fuego, animar objetos por código, montar hojas de animación desde cualquier clip sobre verde y ajustar tamaños/proporciones. **No** puede crear personajes, fondos ni animaciones pintadas nuevas con la coherencia del estilo: eso necesita un generador de imágenes (ChatGPT, Gemini u otro) o un ilustrador.
