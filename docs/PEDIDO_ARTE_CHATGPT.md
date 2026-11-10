# Pedido de arte para «1248 · Un extraño en Castilla» (lista priorizada para ChatGPT u otro generador)

**Cómo usarlo.** Claude no puede escribirle a ChatGPT: dejar un archivo en el repositorio no activa nada por sí solo. Lo práctico: César abre ChatGPT (con generación de imágenes), le pega el texto «Instrucciones» de abajo y le adjunta **2–3 imágenes de referencia** ya aprobadas (una de personaje, una de escenario) para que mantenga el estilo. Lo que ChatGPT devuelva se suelta en el chat de Claude; Claude lo recorta, quita el verde, lo escala, monta las hojas de animación y lo integra (esas herramientas ya existen: `production/CHAMELO/tools/build_*_rc20.py`).

## Instrucciones (para pegar)
Estilo: ilustración de cuento a **acuarela con línea de tinta fina**, colores cálidos y algo desaturados, texturas de papel; proporciones de dibujo animado (cabeza algo grande, manos expresivas); luz suave. Mismo estilo que las imágenes adjuntas. Sin texto ni letras dentro de la imagen, sin marcos, sin interfaz.
- **Personajes y animaciones:** un solo personaje, cuerpo entero, **de perfil o tres cuartos**, mirando a la izquierda, sobre **fondo verde liso (#00FF00) sin suelo ni sombra**, cámara fija, personaje centrado y entero (sin cortar pies ni manos), mismo tamaño en todos los fotogramas. Si es una animación: bucle de 2–3 s (marcha: un ciclo completo de dos pasos).
- **Escenarios:** sin personajes, horizontal, suelo caminable claro en el tercio inferior, panorama continuo. Formato final del juego: 1600×900 (escena fija) o 2700×900 / 4000×900 (con scroll).
- **Objetos sueltos (props):** el objeto solo, sobre fondo verde liso, mismo punto de vista que el escenario.

## Lo que ya está y NO hace falta pedir
Protagonista (todas las animaciones), Elvira, Nuño, Alfonso, Durán, Mingo, el ciego, Rai (mago) y Rai-gato (andar, sentarse, guiñar), viejo soldado, y los bucles de Yuçaf, Lope, señora de Oropesa, pregonero y los dos Giles. Fondos: ribera, orilla, Chamelo, taberna (día y noche), soto de noche, plaza, puerta del Río, iglesia, alfar, corredera, embarcadero, travesía, audiencia.

## Prioridad 1 · lo que hoy se ve «provisional» en la partida
1. **Los cuatro conspiradores (requeteconquistadores), uno por uno**: reposo, hablar/discutir y andar. Hoy son marionetas y desentonan con todo lo demás. Descripción: el cabecilla (turbante verde, barba), el del gorro rojo, el de capucha parda con barba blanca, el del turbante blanco y túnica naranja. *(Los tres grupos ya recibidos sirven para las cartelas, no para moverse por la escena.)*
2. **Sancha** (panadera): reposo, hablar, andar, dar la hogaza.
3. **Andar** (ciclo de marcha de perfil) de Yuçaf, Lope, señora de Oropesa, pregonero y Giles: ahora, al caminar, se cambia a marioneta.
4. **Props con arte propio** (hoy dibujados por código): balanza de la taberna (en reposo y en equilibrio), cuña de la mesa coja, mapa del suelo entero y roto en cuatro, cuerda de la campana, regla de la Puerta del Río, ladrillos del paso, viga del suelo, banco de Lope, hilo, tablón, hogazas del puesto, pajar del alfar, amarre del embarcadero.

## Prioridad 2 · extras que dan vida
5. Extras de la villa: guardia genérico, Benito, mayordomo, arriero, peregrina (reposo + hablar; andar si se puede).
6. Rai-gato: bostezar, correr, asustarse, esconderse, tropezar, dormir.
7. Mingo sentado en la rama de la higuera (para quitar los zapatos cortados) y reírse/burlarse.
8. Alguacil, pastor y ovejas (si el guion los mantiene).

## Prioridad 3 · pulido
9. Aceña: la versión alternativa de Durán es muy superior al fondo actual; para usarla hacen falta, por separado y sobre verde: **la rueda sola** (para girarla), **el tronco atascado** contra la rueda, y la **rueda liberada con el agua cayendo**.
10. Cartelas del narrador (las ya hechas bastan; si se quiere, una ilustración de la Puerta del Río y de la plaza al amanecer).
11. Sonido real (opcional): río, pájaros, molino, mercado, horno, grillos nocturnos; bucles de 30–60 s.

## Qué puede hacer Claude sin arte nuevo
Reutilizar y derivar lo que ya hay: versiones nocturnas por colorimetría, recortes de los GIF recibidos, cartelas, efectos de luz, partículas y fuego, animar objetos por código, montar hojas de animación desde cualquier clip sobre verde y ajustar tamaños/proporciones. **No** puede crear personajes, fondos ni animaciones pintadas nuevas con la coherencia del estilo: eso necesita un generador de imágenes (ChatGPT, Gemini u otro) o un ilustrador.
