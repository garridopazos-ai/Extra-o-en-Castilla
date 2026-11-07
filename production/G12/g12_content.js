/* G12 · Acto I «La orilla»: Mingo (pícaro compañero), el ciego de la parra (guiño al Lazarillo), el soto de los Sifones
   y el primer objetivo: comer algo. Además, todos los vecinos pasan a marionetas articuladas (g12_rig.js).
   Se carga DESPUÉS de g11_content.js y g11_juglar.js: solo añade o sustituye. */
(function (E) {
  'use strict';
  const D = E.DATA, S = D.scenes, N = D.npcs, DL = D.dialogues;
  const HIT = [-55, -300, 110, 300];
  const rig = (id, name, height, speed, look) => { D.characters[id] = { name, height, speed, hit: HIT, orient: 'lr', rig: look, sprite: { src: null } }; };

  // ===================================================== REPARTO (marionetas)
  rig('mingo', 'Mingo', 205, 215, { build: 'child', skin: '#e2a882', hair: '#5a3418', hairStyle: 'mop', top: '#c9953a', sleeve: '#c9953a', legs: '#e2a882', shoes: 'bare', belt: '#6a4a2a', patch: '#4a6ea8', freckles: true, cheeks: true, mood: 'grin', tunicLen: 0.42, sling: true, work: 'juggle', seed: 3 });
  rig('ciego', 'El ciego', 285, 90, { build: 'old', skin: '#d7a27e', hair: '#cfc8bc', beard: 'full', beardCol: '#d8d2c6', hat: 'brim', hatCol: '#4a3a2c', top: '#6a5a46', sleeve: '#6a5a46', cape: '#5a3c2a', legs: '#4a3a2c', eyes: 'blind', nose: 'big', stick: true, mood: 'sly', tunicLen: 0.75, work: 'tap', seed: 5 });
  rig('guardia', 'Gil', 300, 200, { build: 'fat', skin: '#dca484', hair: '#4a3a2a', beard: 'moustache', hat: 'helmet', top: '#8a4a34', sleeve: '#6b6f78', legs: '#4a3a2a', shoes: 'boot', belt: '#3a2a1a', nose: 'big', work: 'scratch', seed: 1 });
  rig('yucaf', 'Yuçaf', 300, 200, { build: 'adult', skin: '#c08a62', hair: '#2a2018', beard: 'full', hat: 'turban', hatCol: '#e8e2cc', top: '#9c6b3f', sleeve: '#8a5a33', apron: '#d8c8a0', legs: '#5a4632', tunicLen: 0.7, mood: 'happy', work: 'stir', seed: 6 });
  rig('nuno', 'Don Nuño', 290, 230, { build: 'thin', skin: '#ecc2a2', hair: '#1a1018', beard: 'goatee', moustache: true, hat: 'bonete', hatCol: '#2e1a40', feather: '#c9a227', top: '#5b2a6e', sleeve: '#4a2058', legs: '#2e1a40', shoes: 'shoe', collar: '#c9a227', cape: '#7a2c6a', mood: 'sly', nose: 'hook', prop: 'keys', seed: 2 });
  rig('sancha', 'Doña Sancha', 285, 180, { build: 'woman', skin: '#e0aa86', hat: 'toca', hatCol: '#efe6d0', top: '#a8603a', sleeve: '#a8603a', apron: '#f0e6cc', legs: '#7a5a3a', tunicLen: 0.95, mood: 'happy', cheeks: true, work: 'stir', seed: 4 });
  rig('lope', 'Maese Lope', 305, 180, { build: 'adult', skin: '#c99070', hair: '#2a2018', beard: 'stubble', top: '#6b3e2a', sleeve: '#6b3e2a', apron: '#3a3a3a', legs: '#3a3a3a', shoes: 'boot', mood: 'sly', work: 'hammer', seed: 8 });
  rig('pregonero', 'El pregonero', 300, 200, { build: 'fat', skin: '#e3ad8a', hair: '#6a4a2a', hat: 'cap', hatCol: '#a33a2a', top: '#c9a227', sleeve: '#a33a2a', legs: '#2f3f5c', shoes: 'shoe', mood: 'happy', prop: 'scroll', work: 'shout', cheeks: true, seed: 9 });
  rig('benito', 'Fray Benito', 290, 160, { build: 'fat', skin: '#e8b494', hair: '#9a9288', hairStyle: 'tonsure', top: '#5a4a32', sleeve: '#5a4a32', legs: '#5a4a32', belt: '#d8c8a0', tunicLen: 1.0, mood: 'worried', cheeks: true, seed: 7 });
  rig('mayordomo', 'Don Gutierre', 310, 180, { build: 'thin', skin: '#e4b292', hair: '#8a8a8a', beard: 'full', beardCol: '#a8a8a8', hat: 'bonete', hatCol: '#1d3b73', top: '#1d3b73', sleeve: '#1d3b73', legs: '#1d3b73', collar: '#c9a227', tunicLen: 0.9, mood: 'grumpy', prop: 'scroll', seed: 10 });

  // ===================================================== OBJETOS
  const it = (id, name, look, extra) => { D.items[id] = { name, icon: 'assets/items/' + id + '.png', look: [{ say: look }], ...extra }; };
  it('mingo', 'Mingo', 'Mingo. Pícaro, pequeño, sin escrúpulos y con hambre. No cabe en el zurrón, pero se le pueden pedir cosas: elígelo y toca algo.');
  it('cuenco', 'Cuenco de limosnas', 'Un cuenco de madera, algo mordido. Tiene grabado «NICOLÁS». Y debajo, en letra más pequeña: «devolver a Nicolás».');
  it('racimo', 'Racimo de uvas', 'Medio racimo de uvas tintas. Bueno, un tercio. Bueno, lo que dejó Mingo.');
  it('higos', 'Higos', 'Higos morados de la higuera del soto. Los guardo para cuando vuelva el hambre. Volverá.');

  // ===================================================== RIBERA: llegada con hambre y robo del móvil
  S.ribera.firstEnter = [
    { note: 'Ribera del Tajo · Talavera, 1248' },
    { say: 'Mi móvil dice «Has llegado». Me gustaría saber adónde.' },
    { say: 'Y mi estómago dice «Has llegado... sin desayunar».' },
    { npcPlace: ['mingo', 'ribera', 2590, 830, 'left'] },
    { bark: '¡Paso, paso, que llevo prisa y no llevo nada!', who: 'mingo' },
    { npcSpeed: ['mingo', 330] },
    { npcWalk: ['mingo', 1810, 812] },
    { npcFace: ['mingo', 'player'] }, { face: 'right' },
    { say: '¡Uy! Perdone, señor extranjero. Qué ropa más rara. ¿Es de Toledo?', who: 'mingo' },
    { say: 'Eh... no. ¿Y tú quién eres?' },
    { say: 'Nadie. Nadie importante. ¡Adiós!', who: 'mingo' },
    { take: 'telefono' }, { set: 'mingo_robo' }, { sfx: 'pick' },
    { npcWalk: ['mingo', 2595, 832] },
    { npcPlace: ['mingo', 'orilla', 2265, 470, 'left'] }, { npcSpeed: ['mingo', 215] },
    { say: 'Qué crío más raro... ¡Eh! ¡Mi móvil! ¡Me ha quitado el móvil!' },
    { note: 'OBJETIVO: recuperar el móvil. El pícaro ha huido río arriba, por la derecha, pasado el molino.' }
  ];
  S.ribera.entries.from_orilla = { x: 2520, y: 832, facing: 'left' };
  S.ribera.hotspots.push({ id: 'exit_orilla', name: 'Río arriba: el soto', rect: [2480, 690, 120, 195], walkTo: [2575, 832],
    exit: { to: 'orilla', entry: 'from_ribera' },
    verbs: { look: [{ say: 'El camino sigue río arriba, entre juncos y huertas. Por ahí se fue el ladronzuelo.' }] } });
  const moneda = S.ribera.hotspots.find(h => h.id === 'moneda');
  if (moneda) moneda.verbs['use:mingo'] = [{ say: '¿Una moneda en el agua? ¡Eso es mío!... digo, tuyo.', who: 'mingo' },
    { note: '(Mingo se mete en el agua hasta las rodillas, chapotea y vuelve con la moneda entre los dientes.)' },
    { give: 'moneda' }, { set: 'moneda_cogida' }, { say: 'Entera. Le he quitado solo el sabor.', who: 'mingo' }];

  // sin el móvil no se sube a la barca (los puzles de la villa lo necesitan)
  const barca = S.embarcadero && S.embarcadero.hotspots.find(h => h.id === 'barca');
  if (barca && barca.verbs && barca.verbs.use) {
    const orig = barca.verbs.use;
    barca.verbs.use = [{ if: '!mingo_sigue', then: [{ say: 'No pienso cruzar sin mi móvil. Ese crío se fue río arriba, por la ribera.' }], else: orig }];
  }

  // ===================================================== LA ORILLA · SOTO DE LOS SIFONES (escenario ancho, 2,5 pantallas)
  S.orilla = {
    id: 'orilla', name: 'La orilla · Soto de los Sifones', width: 4000, height: 900, camera: 'follow',
    ambientSound: { cutoff: 900, vol: 0.10 },
    depth: { yFar: 650, sFar: 0.74, yNear: 885, sNear: 1.0 },
    layers: [
      { id: 'far', z: 'back', x: 0, y: 0, w: 2920, h: 480, parallax: 0.55, src: 'assets/scenes/orilla/far.jpg', placeholder: 'g11_plaza' },
      { id: 'near', z: 'back', x: 0, y: 0, w: 4000, h: 900, src: 'assets/scenes/orilla/near.webp', placeholder: 'g11_plaza' },
      { id: 'cuenco', z: 'back', x: 2452, y: 552, w: 58, h: 26, placeholder: 'g12_cuenco', visibleWhen: '!cuenco_cogido' },
      { id: 'reeds1', z: 'front', x: 520, y: 680, w: 320, h: 280, parallax: 1.22, src: 'assets/scenes/orilla/reeds_a.webp', placeholder: 'g11_bando' },
      { id: 'reeds2', z: 'front', x: 2350, y: 690, w: 320, h: 280, parallax: 1.22, src: 'assets/scenes/orilla/reeds_b.webp', placeholder: 'g11_bando' },
      { id: 'reeds3', z: 'front', x: 4300, y: 680, w: 320, h: 280, parallax: 1.22, src: 'assets/scenes/orilla/reeds_a.webp', placeholder: 'g11_bando' }
    ],
    ambient: [{ type: 'strip', asset: 'fx_water_strip', x: 0, y: 440, w: 4000, h: 120, tile: 800, speed: 14, alpha: 0.55 }],
    walk: { outer: [[30, 664], [1280, 662], [1840, 664], [2600, 666], [3120, 664], [3985, 668], [3985, 885], [30, 885]], holes: [] },
    entries: { default: { x: 130, y: 790, facing: 'right' }, from_ribera: { x: 130, y: 790, facing: 'right' } },
    firstEnter: [
      { note: 'La orilla · Soto de los Sifones' },
      { say: 'Ni rastro del crío. Pero él tiene mi móvil... y mi móvil tiene una música de llamada horrorosa.' },
      { say: 'Si me pongo a escuchar...' }
    ],
    hotspots: [
      { id: 'exit_ribera', name: 'Hacia la ribera', rect: [0, 640, 90, 245], walkTo: [45, 790], exit: { to: 'ribera', entry: 'from_orilla' },
        verbs: { look: [{ say: 'Por ahí se vuelve a la ribera y a la aceña.' }] } },
      { id: 'rio', name: 'Río Tajo', poly: [[0, 430], [4000, 430], [4000, 562], [0, 562]],
        verbs: { look: [{ say: 'El Tajo, ancho y tranquilo. Huele a juncia y a barro del bueno.' }], use: [{ say: 'Ahora mismo, el agua me interesa más en forma de sopa.' }] },
        mingo: 'Aquí abajo hay barbos como brazos. Los pesca la Leonor con las manos.' },
      { id: 'mojon', name: 'Mojón', rect: [140, 640, 80, 70],
        verbs: { look: [{ say: 'Un mojón: «RIBERA ← · → SOTO». Alguien ha rayado debajo: «Aquí no hay nada que ver».' }, { say: 'Eso dicen siempre los sitios donde hay algo que ver.' }] },
        mingo: 'Lo rayé yo. Para que nadie venga a mi soto.' },
      { id: 'sifon', name: 'Sifón del aguador', poly: [[440, 600], [560, 540], [1000, 500], [1130, 420], [1150, 470], [1010, 560], [860, 580], [480, 660]],
        verbs: { look: [{ say: 'Caños de barro sobre caballetes que bajan al río y vuelven a subir. Un cartel: «SIFÓN. No tocar. Maese Hamid, ingeniero de aguas».' },
                        { say: 'Un sifón en 1248. Algún día esta orilla se llamará «Los Sifones» y nadie sabrá por qué.' }],
                 use: [{ say: 'Si toco un caño se viene abajo todo el invento. Y aquí no hay seguro a todo riesgo.' }],
                 'use:mingo': [{ say: 'Si le quito este caño, el sifón hace «glu» y riega todo el soto.', who: 'mingo' }, { say: 'Déjalo. Ya hay bastante agua donde no debe.' }] },
        mingo: 'Maese Hamid dice que con esto el agua sube sola. Yo digo que gotea sola.' },
      { id: 'plano', name: 'Plano del aguador', rect: [890, 605, 140, 60],
        verbs: { look: [{ say: 'Un plano a carboncillo: el agua del río sube por los caños hasta... un círculo que pone «¿HUERTA?».' }, { say: 'Ingeniería con fe. Me gusta.' }] } },
      { id: 'huerta', name: 'Huerta', rect: [1280, 580, 550, 75],
        verbs: { look: [{ say: 'Una huerta de coles muy bien cuidada. Y muy bien vigilada.' }],
                 pick: [{ say: 'Robar coles con el espantapájaros mirando... Tengo hambre, pero también tengo principios. Pocos, pero tengo.' }],
                 'use:mingo': [{ say: '¿Coles? Ni hablar. El huertano Pascual me conoce las pisadas.', who: 'mingo' }] },
        mingo: 'Son del Pascual. Cuenta las hojas. Las HOJAS.' },
      { id: 'espantapajaros', name: 'Espantapájaros', rect: [1545, 465, 110, 150],
        verbs: { look: [{ say: 'Un espantapájaros con un cuervo encima. El cuervo parece más contento que el espantapájaros.' }],
                 use: [{ say: 'Le he estrechado la mano. Apretón firme, pero de paja.' }],
                 talk: [{ say: 'Buenos días.' }, { note: '(El espantapájaros no contesta. El cuervo, sí: «¡Crá!».)' }],
                 'use:mingo': [{ say: '¡Tello, ven!', who: 'mingo' }, { note: '(El cuervo baja al hombro de Mingo, le roba la cuerda de la honda y se vuelve al espantapájaros.)' }, { say: '...Me debe tres higos y ahora una cuerda.', who: 'mingo' }] },
        mingo: 'El cuervo se llama Tello. Me debe tres higos.' },
      { id: 'higuera', name: 'Higuera', poly: [[1860, 120], [2460, 120], [2470, 420], [2240, 445], [2120, 640], [2060, 640], [1990, 430], [1850, 400]],
        verbs: { look: [{ if: 'mingo_sigue', then: [{ say: 'Una higuera enorme, cargada de higos morados. Demasiado altos para mí.' }],
                          else: [{ say: 'Una higuera enorme. Y en la rama baja, un crío con mi móvil.' }] }],
                 pick: [{ say: 'No llego. Y trepar a un árbol frutal ajeno es como empiezan todas las malas historias.' }],
                 'use:mingo': [{ if: 'higos_cogidos', then: [{ say: 'Ya no quedan maduros. Los verdes te dejan la boca como un zapato.', who: 'mingo' }],
                                 else: [{ say: '¡Higos! Ahora verás.', who: 'mingo' }, { note: '(Mingo trepa como una lagartija y baja con la camisa llena de higos.)' }, { give: 'higos' }, { set: 'higos_cogidos' }, { say: 'Para cuando vuelva el hambre. Que vuelve. Siempre vuelve.', who: 'mingo' }] }] } },
      { id: 'parra', name: 'Parra', rect: [2620, 420, 470, 120],
        verbs: { look: [{ say: 'Una parra cargada de racimos. Y debajo, alguien que no ve las uvas... pero las cuenta.' }],
                 pick: [{ say: 'Con el dueño de las uvas a dos pasos, ni se me ocurre.' }] },
        mingo: 'Esa parra es del ciego. Me sé cada racimo. Él también, que es lo malo.' },
      { id: 'cuenco_h', name: 'Cuenco entre los juncos', rect: [2440, 540, 90, 50], walkTo: [2480, 690], visibleWhen: '!cuenco_cogido',
        verbs: { look: [{ say: 'Un cuenco de madera flota entre los juncos, enganchado. Fuera de mi alcance.' }],
                 pick: [{ say: 'Está en el agua, demasiado lejos para la mano. Y no pienso mojarme hasta la cintura por un cuenco.' }],
                 'use:pertiga': [{ say: 'Con la pértiga... un poco más... ¡ya!' }, { give: 'cuenco' }, { set: 'cuenco_cogido' }, { sfx: 'pick' }],
                 'use:pertiga_lazo': [{ say: 'Lazo, cuenco, tirón... ¡pescado!' }, { give: 'cuenco' }, { set: 'cuenco_cogido' }, { sfx: 'pick' }] } },
      { id: 'jarra', name: 'Jarra del ciego', rect: [2925, 595, 55, 50],
        verbs: { look: [{ say: 'La jarra de vino del ciego. Atada al cinto con una cuerda... y aun así no se fía.' }],
                 pick: [{ say: 'Esa jarra tiene dueño. Y el dueño tiene muy buen oído.' }] },
        mingo: 'Una vez le bebí media jarra con una paja de centeno. Aún no sabe cómo.' },
      { id: 'vado', name: 'Vado al Chamelo', poly: [[3120, 610], [3330, 520], [3360, 545], [3170, 640]],
        verbs: { look: [{ if: 'rueda_libre', then: [{ say: 'Con la rueda de la aceña girando, el agua ha bajado: las piedras del vado asoman.' }],
                          else: [{ say: 'El vado al Chamelo. El agua cubre las piedras: algo, río abajo, la tiene desbordada.' }] }],
                 use: [{ say: 'Ahora no: primero quiero llegar a Talavera. La isla no se va a ir a ninguna parte.' }] },
        mingo: 'En el Chamelo vive la Leonor. Tiene abejas, una barca y un genio que espanta a los patos.' },
      { id: 'letrero', name: 'Letrero', rect: [3040, 555, 100, 45],
        verbs: { look: [{ say: '«AL CHAMELO. Solo con el agua baja. Y con permiso de la Leonor».' }, { set: 'sabe_leonor' }] } },
      { id: 'isla', name: 'Isla del Chamelo', rect: [3280, 380, 660, 160],
        verbs: { look: [{ say: 'Una isla en mitad del Tajo: sauces, un chozo con humo... y colmenas. Alguien vive ahí.' }, { say: 'La Isla del Chamelo. En mi siglo es un parque con bancos. Aquí es un secreto con abejas.' }, { set: 'sabe_leonor' }] } }
    ]
  };

  // ===================================================== MINGO
  const DEAL = [
    { if: 'mingo_en_arbol', then: [{ note: '(Mingo baja de la higuera de un salto. Ni rastro de vergüenza.)' }, { npcPlace: ['mingo', 'orilla', 2300, 700, 'left'] }, { unset: 'mingo_en_arbol' }] },
    { say: '¡Uvas! Bueno... son del ciego. Pero las has conseguido tú, que es lo que cuenta.', who: 'mingo' },
    { take: 'racimo' }, { give: 'telefono' }, { sfx: 'pick' },
    { say: 'Toma tu espejo cantor. Palabra de pícaro.', who: 'mingo' },
    { note: '(Os sentáis en el banco del ciego y os coméis el racimo a medias. Sabe a gloria. A gloria del siglo XIII.)' },
    { say: 'Me siento casi persona.' },
    { say: 'Oye, Ropa-Rara. Tú no eres de aquí. Ni de Toledo. Ni de ningún sitio.', who: 'mingo' },
    { say: 'Es... complicado.' },
    { say: 'Pues me quedo contigo. Pareces más tonto que el ciego... y de los tontos se come mejor.', who: 'mingo' },
    { set: ['mingo_sigue', 'comido_1'] }, { give: 'mingo' },
    { note: 'Mingo se une a ti. Está en el zurrón (bueno, no cabe): elígelo y toca algo para pedirle una trastada. Tócale a él para hablar.' },
    { note: 'OBJETIVO: llegar a Talavera, al otro lado del Tajo. Y comer de verdad: siete uvas no son una comida.' }
  ];
  N.mingo = {
    id: 'mingo', name: 'Mingo', character: 'mingo', scene: 'ribera', start: [2700, 832], facing: 'left',
    verbs: {
      talk: [{ if: 'mingo_sigue', then: [{ dialogue: 'mingo' }], else: [{ dialogue: 'mingo_arbol' }] }],
      look: [{ if: 'mingo_sigue', then: [{ say: 'Mingo. Pelo de nido, pies descalzos, honda al cinto. Lo más honrado que tiene es la sonrisa, y está mellada.' }],
               else: [{ say: 'El ladronzuelo. Está sentado en la rama, balanceando los pies y trasteando MI móvil.' }] }],
      'give:racimo': DEAL,
      'give:higos': [{ say: 'Los higos, para luego. Hazme caso, que de hambres sé más que tú.', who: 'mingo' }],
      'give:*': [{ say: 'Eso no se come. Lo que no se come, no me interesa. Casi nunca.', who: 'mingo' }]
    },
    routines: [
      { when: { all: ['mingo_robo', '!mingo_sigue'] }, steps: [
        { wait: 5, anim: 'idle', face: 'left' },
        { bark: '¡Este espejo canta! ¡Y sale un señor con tu cara!', every: 26 },
        { wait: 4, anim: 'work' },
        { bark: '¿Buscabas algo, Ropa-Rara? Yo de ti miraría hacia arriba.', every: 34 }] }
    ]
  };
  DL.mingo_arbol = { npc: 'mingo', start: 'start', nodes: {
    start: { lines: [['mingo', '¿Qué quieres, señor Ropa-Rara? Desde aquí arriba se te ve muy bajito.']], actions: [{ set: 'mingo_en_arbol' }], options: [
      { text: 'Devuélveme el móvil.', next: 'movil' },
      { text: '¿Quién eres?', once: true, next: 'quien' },
      { text: 'Baja de ahí ahora mismo.', once: true, next: 'baja' },
      { text: 'Te lo cambio por algo.', if: '!trato_mingo', next: 'trato' },
      { text: '¿Seguro que no quieres otra cosa que comida?', if: 'trato_mingo', next: 'trato2' },
      { text: 'Ya volveré.', next: 'end' }] },
    movil: { lines: [['mingo', '¿El espejo que canta? Me lo he encontrado.'], ['player', 'En mi bolsillo.'], ['mingo', 'Pues eso: lo he encontrado en tu bolsillo.']], next: 'start' },
    quien: { lines: [['mingo', 'Mingo. Domingo, para los curas. «Ese demonio», para el ciego.'], ['player', '¿Qué ciego?'],
      ['mingo', 'El de la parra, río arriba. Le hice de lazarillo dos años. Él me pegaba con la jarra; yo le bebía el vino con una paja.'], ['mingo', 'Estamos en paz. Más o menos.']], actions: [{ set: 'sabe_ciego' }], next: 'start' },
    baja: { lines: [['mingo', 'Sube tú, si puedes.'], ['mingo', 'Ah, que no puedes. Qué pena. Qué pena más grande.']], next: 'start' },
    trato: { lines: [['mingo', 'Ahora hablamos el mismo idioma. Tengo un hambre que me comería la higuera con la rama y todo.'],
      ['mingo', 'Tráeme algo de comer de verdad, y no una col del Pascual, y te devuelvo el espejo. Palabra de pícaro.'], ['player', '¿Y eso cuánto vale?'], ['mingo', 'Nada. Por eso te la doy gratis.']],
      actions: [{ set: 'trato_mingo' }, { note: 'OBJETIVO: conseguir comida para Mingo. Y para ti, ya de paso.' }], next: 'start' },
    trato2: { lines: [['mingo', 'Comida. C-O-M-I-D-A. Si es dulce, mejor. Y si es de otro, más dulce todavía.']], next: 'start' }
  } };
  DL.mingo = { npc: 'mingo', start: 'start', nodes: {
    start: { lines: [['mingo', '¿Qué pasa, Ropa-Rara?']], options: [
      { text: '¿Y ahora qué hacemos?', next: 'pista' },
      { text: 'Háblame de Talavera.', once: true, next: 'talavera' },
      { text: '¿Por qué robas?', once: true, next: 'robar' },
      { text: '¿Quién es esa Leonor?', if: 'sabe_leonor', once: true, next: 'leonor' },
      { text: 'Nada, sigamos.', next: 'end' }] },
    pista: { lines: [], actions: [{ mingoHint: true }], next: 'start' },
    talavera: { lines: [['mingo', 'Murallas, curas, alfareros y un alguacil, Don Nuño, que cobra hasta por mirar. Por mirarle a él, el doble.'],
      ['mingo', 'Viven cristianos, moros y judíos. Se pelean poco y comercian mucho. Lo que más se pelea es el precio del pan.'],
      ['player', 'Eso no ha cambiado en ochocientos años.'], ['mingo', '¿Qué?'], ['player', 'Nada, nada.']], next: 'start' },
    robar: { lines: [['mingo', 'Porque comer cuesta, y robar es gratis. Hasta que te pillan. Entonces cuesta el doble.'],
      ['mingo', 'En tu tierra seguro que la comida sale sola de una caja.'], ['player', 'Pues... más o menos, sí.'], ['mingo', '¡Lo sabía! Tierra de brujos.']], next: 'start' },
    leonor: { lines: [['mingo', 'La del Chamelo. Tiene abejas, una barca y un genio que espanta a los patos.'], ['mingo', 'Cuando te mira, te pica. Como sus abejas.'],
      ['player', 'Suena encantadora.'], ['mingo', 'Eso dicen todos antes de conocerla. Y después también, pero cojeando.']], next: 'start' }
  } };

  // ===================================================== EL CIEGO DE LA PARRA (guiño al Lazarillo de Tormes)
  const UVAS = [
    { take: 'cuenco' }, { set: 'cuenco_devuelto' },
    { say: '¡Mi cuenco! Hombre de palabra, cosa rara. Siéntate: nos comeremos el racimo a la par. Yo una, tú una.', who: 'ciego' },
    { say: 'Trato hecho.' },
    { if: { all: ['mingo_robo', '!mingo_sigue'] }, then: [
      { note: '(Algo baja de la higuera sin hacer ruido...)' },
      { npcPlace: ['mingo', 'orilla', 2640, 705, 'right'] }, { unset: 'mingo_en_arbol' },
      { npcWalk: ['mingo', 2760, 700] }] },
    { note: '(El ciego come de una en una. Tú, de una en una. Y una mano pequeña, por detrás, de tres en tres.)' },
    { say: 'Alto. Me habéis engañado.', who: 'ciego' },
    { say: '¿Yo? Si he comido de una en una.' },
    { say: 'Tú sí. Pero alguien ha comido de tres en tres.', who: 'ciego' },
    { say: '¿Y cómo lo sabe?' },
    { say: 'Porque yo comía de dos en dos... y nadie se quejaba.', who: 'ciego' },
    { mood: ['ciego', 'grin'] },
    { if: { all: ['mingo_robo', '!mingo_sigue'] }, then: [
      { say: '¡MINGO! Te huelo, demonio.', who: 'ciego' },
      { say: 'Buenos días, amo. Están dulces este año.', who: 'mingo' },
      { say: 'Llévate el resto, forastero, antes de que se lo coma él. Y que no te vea... es un decir.', who: 'ciego' }],
      else: [{ say: 'Llévate el resto, forastero. Me has hecho reír, que ya es más de lo que hace la mayoría.', who: 'ciego' }] },
    { give: 'racimo' }, { set: 'racimo_dado' }, { rel: ['ciego', 1] }
  ];
  N.ciego = {
    id: 'ciego', name: 'Nicolás, el ciego', character: 'ciego', scene: 'orilla', start: [2860, 690], facing: 'left',
    verbs: {
      talk: [{ dialogue: 'ciego' }],
      look: [{ say: 'Un ciego viejo, con barba de nieve y sombrero de ala ancha. Tararea un romance desafinando... a propósito, diría yo.' }],
      'give:cuenco': UVAS,
      'give:racimo': [{ say: '¿Mis propias uvas? Me sé de memoria cuántas tengo. Y me faltan.', who: 'ciego' }],
      'give:higos': [{ say: 'Higos de la higuera del soto. Esos los coge Mingo. ¿Dónde está ese demonio?', who: 'ciego' }],
      'give:*': [{ say: 'Eso no suena a moneda ni huele a comida. No me interesa.', who: 'ciego' }],
      'use:mingo': [{ say: '¿Le hago saltar el arroyo otra vez? «¡Saltad, amo, que es estrecho!»', who: 'mingo' }, { say: 'Ni se te ocurra.' }, { say: 'Aguafiestas.', who: 'mingo' }]
    },
    routines: [{ steps: [
      { wait: 6, anim: 'idle', face: 'left' },
      { bark: '¡Romances, coplas y oraciones! ¡Para la buena muerte y para la mala suerte!', every: 32 },
      { wait: 5, anim: 'work' },
      { bark: 'Huelo a forastero. Huele a... ¿jabón?', every: 45, if: '!ciego_conoce' }] }]
  };
  DL.ciego = { npc: 'ciego', start: 'start', nodes: {
    start: { lines: [['ciego', 'Pasos de forastero. Pisa como quien no sabe dónde está. ¿Me equivoco?', '!ciego_conoce'], ['player', 'Ni un poco.', '!ciego_conoce'],
      ['ciego', '¿Otra vez tú? Sigues oliendo raro.', 'ciego_conoce']], actions: [{ set: 'ciego_conoce' }], options: [
      { text: '¿Me vendería unas uvas?', if: '!racimo_dado', next: 'uvas' },
      { text: 'Conozco a un tal Mingo.', if: { all: ['sabe_ciego', '!ciego_mingo'] }, next: 'mingo' },
      { text: '¿Qué sabe de Don Nuño?', once: true, next: 'nuno' },
      { text: '¿Quién vive en la isla?', if: 'sabe_leonor', once: true, next: 'leonor' },
      { text: 'Adiós.', next: 'end' }] },
    uvas: { lines: [['ciego', '¿Vender? Las uvas no se venden: se ganan.'],
      ['ciego', 'Se me ha caído el cuenco de las limosnas al río, ahí, entre los juncos. Lo oigo dar golpecitos contra las cañas.'],
      ['ciego', 'Tráemelo y comemos uvas juntos. A la par: tú una, yo una.']], actions: [{ set: 'sabe_cuenco' }], next: 'start' },
    mingo: { lines: [['ciego', '¡Ese demonio! Me cambió una longaniza por un nabo, me bebía el vino con una paja...'],
      ['ciego', '...y un día me hizo saltar un arroyo: «¡Saltad, amo, que es estrecho!». Era ancho. Muy ancho.'],
      ['player', 'Suena a buen chaval.'], ['ciego', 'El mejor lazarillo que he tenido. No se lo digas nunca.']], actions: [{ set: 'ciego_mingo' }], next: 'start' },
    nuno: { lines: [['ciego', 'Que cobra por pasar, por mirar y, si le dejan, por respirar.'],
      ['ciego', 'Desde que es alguacil, hasta las limosnas pagan portazgo. Un día de estos alguien le dará una lección. Ojalá lo oiga.']], next: 'start' },
    leonor: { lines: [['ciego', 'La Leonor. La única persona de este río que me ha dado limosna y luego me ha pedido el cambio.'],
      ['ciego', 'Lista como el hambre. No le digas que lo he dicho.']], next: 'start' }
  } };

  // ===================================================== PISTAS del Acto I (delante de todas: hasta que Mingo se une, nada más aplica)
  D.hints.unshift(
    { if: { all: ['racimo_dado', '!mingo_sigue'] }, obj: 'Darle las uvas a Mingo', text: 'Tienes el racimo. Dáselo a Mingo: abre el zurrón, elige las uvas y tócale. Te devolverá el móvil.' },
    { if: { all: ['has:cuenco', '!racimo_dado'] }, obj: 'Devolverle el cuenco al ciego', text: 'Dale el cuenco al ciego de la parra: abre el zurrón, elige el cuenco y tócale.' },
    { if: { all: ['sabe_cuenco', '!cuenco_cogido', '!has:pertiga', '!has:pertiga_lazo'] }, obj: 'Conseguir algo largo', text: 'El cuenco flota entre los juncos, junto a la parra, fuera de tu alcance. En la hierba de la ribera hay una pértiga: ve a por ella.' },
    { if: { all: ['sabe_cuenco', '!cuenco_cogido'] }, obj: 'Rescatar el cuenco del ciego', text: 'El cuenco del ciego flota entre los juncos, a la izquierda de la parra. Usa la pértiga sobre él.' },
    { if: { all: ['mingo_robo', '!mingo_sigue', 'trato_mingo'] }, obj: 'Conseguir comida', text: 'Mingo quiere comida a cambio del móvil. Bajo la parra, río arriba, hay un ciego con un racimo de uvas. Habla con él.' },
    { if: { all: ['mingo_robo', '!mingo_sigue', { scene: 'orilla' }] }, obj: 'Hablar con Mingo', text: 'Mingo está sentado en la rama baja de la higuera, con tu móvil. Tócale para hablar: quizá acepte un trato.' },
    { if: { all: ['mingo_robo', '!mingo_sigue'] }, obj: 'Perseguir al ladronzuelo', text: 'El crío ha huido río arriba: sal por la derecha de la ribera, pasado el molino, hacia el soto.' }
  );

  // ===================================================== ICONOS PROVISIONALES
  const A = E.assets, cv = (w, h) => E.createCanvas(w, h);
  const icon = draw => (w) => { const c = cv(96, 96), g = c.getContext('2d'); draw(g, 96); return c; };
  A.registerPlaceholder('item_mingo', icon((g, w) => {
    g.fillStyle = '#e2a882'; g.beginPath(); g.arc(w / 2, w / 2 + 6, 26, 0, 7); g.fill(); g.strokeStyle = '#7a4a30'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#5a3418'; g.beginPath(); for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; g.lineTo(w / 2 + Math.cos(a) * (i % 2 ? 34 : 26), w / 2 + Math.sin(a) * (i % 2 ? 34 : 26)); } g.fill();
    g.fillStyle = '#21140c'; g.beginPath(); g.arc(w / 2 - 9, w / 2 + 4, 3.5, 0, 7); g.arc(w / 2 + 9, w / 2 + 4, 3.5, 0, 7); g.fill();
    g.strokeStyle = '#5a1e18'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, w / 2 + 12, 10, 0.2, Math.PI - 0.2); g.stroke();
  }));
  A.registerPlaceholder('item_cuenco', icon((g, w) => { g.fillStyle = '#9a6a3a'; g.beginPath(); g.ellipse(w / 2, w / 2, 32, 12, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(w / 2, w / 2 + 2, 32, 22, 0, 0, Math.PI); g.fill(); g.fillStyle = '#6a4424'; g.beginPath(); g.ellipse(w / 2, w / 2, 26, 8, 0, 0, 7); g.fill(); }));
  A.registerPlaceholder('item_racimo', icon((g, w) => { g.strokeStyle = '#5a7a2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2 + 6, 24); g.stroke(); for (let r = 0; r < 4; r++) for (let k = 0; k <= 3 - r; k++) { g.fillStyle = (r + k) % 2 ? '#5a2e6a' : '#6e3a80'; g.beginPath(); g.arc(w / 2 - (3 - r) * 7 + k * 14, 32 + r * 13, 8, 0, 7); g.fill(); } }));
  A.registerPlaceholder('item_higos', icon((g, w) => { for (const [x, y] of [[34, 50], [58, 46], [46, 66]]) { g.fillStyle = '#5a2e5a'; g.beginPath(); g.ellipse(x, y, 13, 16, 0, 0, 7); g.fill(); g.fillStyle = '#7a9a3a'; g.fillRect(x - 2, y - 22, 4, 8); } }));
  A.registerPlaceholder('g12_cuenco', (w, h) => { const c = cv(w, h), g = c.getContext('2d'); g.fillStyle = '#8a5a30'; g.beginPath(); g.ellipse(w / 2, h * .45, w * .45, h * .3, 0, 0, 7); g.fill(); g.fillStyle = '#5a3a1e'; g.beginPath(); g.ellipse(w / 2, h * .4, w * .36, h * .18, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(230,245,240,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(2, h * .8); g.quadraticCurveTo(w / 2, h, w - 2, h * .8); g.stroke(); return c; });
})(window.E1248 = window.E1248 || {});

/* G12 · Aceña con el arte mejorado de César (art/escenarios/acena, generado por tools/build_acena.py):
   fondo con la rueda parada y el tronco; al liberar la rueda, la ventana se repinta sin tronco y la rueda redibujada gira recortada a la ventana. */
(function (E) {
  'use strict';
  const S = E.DATA.scenes.acena; if (!S) return;
  S.layers = [
    { id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/scenes/acena/bg_g12.webp', placeholder: 'acena_bg' },
    { id: 'ventana', z: 'back', x: 247, y: 158, w: 281, h: 488, src: 'assets/scenes/acena/ventana_libre.webp', placeholder: 'g11_bando', visibleWhen: 'rueda_libre' },
    { id: 'poste', z: 'sort', sortY: 708, x: 1063, y: 238, w: 50, h: 471, src: 'assets/scenes/acena/poste.webp', placeholder: 'pillar' }
  ];
  S.ambient = [
    { type: 'spin', asset: 'g12_rueda', src: 'assets/scenes/acena/rueda.webp', x: 298, y: 401, w: 472, h: 472, speed: 0.9, spinWhen: 'rueda_libre', visibleWhen: 'rueda_libre', clipRect: [247, 158, 281, 488] },
    { type: 'strip', asset: 'fx_water_strip', x: 248, y: 572, w: 280, h: 74, tile: 280, speed: 40, alpha: 0.85, clip: true, visibleWhen: 'rueda_libre' }
  ];
  const h = id => S.hotspots.find(x => x.id === id);
  if (h('rueda')) h('rueda').rect = [240, 150, 300, 500];
  if (h('sacos')) { const s = h('sacos'); s.name = 'Barriles de harina'; s.verbs.look = [{ say: 'Barriles de harina bien cerrados. Durán los cuenta como si fueran hijos. Los sacos vacíos, apilados detrás.' }]; }
  if (h('muela')) h('muela').rect = [636, 376, 256, 300];
})(window.E1248 = window.E1248 || {});
