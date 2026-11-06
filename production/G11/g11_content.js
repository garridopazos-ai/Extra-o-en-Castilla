/* G11 · contenido del juego tras la travesía: personajes, objetos, escenas, NPC y diálogos.
   Sigue exactamente el formato de data/*.js del motor (ver comentarios allí). Arte provisional. */
(function (E) {
  'use strict';
  const D = E.DATA;
  const HIT = [-55, -300, 110, 300];
  const SH = { frameW: 140, frameH: 320, anchor: [70, 312], anims: {
    idle_right: { row: 0, frames: 2, fps: 1.5 }, walk_right: { row: 1, frames: 8, fps: 8 },
    talk_right: { row: 2, frames: 2, fps: 6 }, work_right: { row: 3, frames: 2, fps: 2.5 } } };
  const ch = (id, name, height, speed, opts) => { D.characters[id] = { name, height, speed, hit: HIT, orient: 'lr', sprite: { src: 'assets/characters/' + id + '/sheet.png', sheet: SH, placeholderOpts: opts } }; };
  const SK = { skin: '#d9a07a', hair: '#3a2a20', legs: '#4a3a2a', shoes: '#2f2218' };

  // ===================================================== PERSONAJES (provisionales)
  ch('guardia', 'Gil', 300, 200, { ...SK, top: '#8a4a34', sleeve: '#8a4a34', hat: '#7a7a84', beard: '#4a3a2a' });
  ch('yucaf', 'Yuçaf', 300, 200, { ...SK, skin: '#c98e68', top: '#9c6b3f', sleeve: '#8a5a33', apron: '#e6dcc0', hat: '#e8e2cc', beard: '#2a2018' });
  ch('nuno', 'Don Nuño', 262, 230, { ...SK, skin: '#e6b99a', top: '#5b2a6e', sleeve: '#4a2058', legs: '#2e1a40', hat: '#2e1a40', hair: '#1a1018', beard: '#1a1018', hood: '#c9a227' });
  ch('sancha', 'Doña Sancha', 290, 180, { ...SK, top: '#a88a5a', sleeve: '#a88a5a', apron: '#f0e6cc', hood: '#d8c6a0', legs: '#7a5a3a' });
  ch('lope', 'Maese Lope', 310, 180, { ...SK, top: '#6b3e2a', sleeve: '#6b3e2a', apron: '#2a2a2a', beard: '#2a2018', hair: '#2a2018', legs: '#3a3a3a' });
  ch('pregonero', 'El pregonero', 300, 200, { ...SK, top: '#c9a227', sleeve: '#a33a2a', hat: '#a33a2a', legs: '#2f3f5c' });
  ch('benito', 'Fray Benito', 290, 160, { ...SK, top: '#5a4a32', sleeve: '#5a4a32', hood: '#4a3c28', hair: '#9a9288', beard: '#cfc8b8', legs: '#5a4a32' });
  ch('mayordomo', 'Don Gutierre', 315, 180, { ...SK, top: '#1d3b73', sleeve: '#1d3b73', hat: '#c9a227', beard: '#6a6a6a', hair: '#6a6a6a', legs: '#1d3b73', hood: '#c9a227' });

  // ===================================================== OBJETOS
  const it = (id, name, look, extra) => { D.items[id] = { name, icon: 'assets/items/' + id + '.png', look: [{ say: look }], ...extra }; };
  it('cuna', 'Cuña de obra', 'Una cuña de madera dura. Sirve para calzar, para encajar y para sentirse útil.');
  it('viga', 'Viga larga', 'Un tablón largo y recio. Palanca de segunda mano, nunca mejor dicho.');
  it('cantaro', 'Cántaro talaverano', 'Un cántaro de barro vidriado azul y naranja. Aún no sé que algún día valdrá una fortuna... bueno, sí lo sé.');
  it('sello_gremio', 'Sello de los Olleros', 'Un sello de bronce con un cántaro grabado. Sello número uno.', { short: 'Sello olleros' });
  it('sello_parroquia', 'Sello parroquial', 'Un sello con una campanita. Huele a incienso. Sello número dos.', { short: 'Sello parroquia' });
  it('sello_alguacil', 'Sello del Alguacil', 'El sello de Don Nuño. Lo he «tomado prestado» mientras admiraba su propio reflejo. Sello número tres.', { short: 'Sello alguacil' });
  it('badajo', 'Badajo de campana', 'El badajo de Santa María. Pesa lo que una mala conciencia.');
  it('bando', 'Bando de Don Nuño', 'El bando de Don Nuño. Lo escribió él, lo clavó él y, sobre todo, lo firmó él.');

  // ===================================================== ESCENAS
  const S = D.scenes;
  const DEPTH = { yFar: 640, sFar: 0.8, yNear: 885, sNear: 1.0 };
  const quad = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  // --- Embarcadero: la barca ahora cruza el río
  S.embarcadero.entries.from_puerta = { x: 1880, y: 775, facing: 'left' };
  const barca = S.embarcadero.hotspots.find(h => h.id === 'barca');
  barca.verbs.use = [{ if: 'barca_libre', then: [{ say: 'Allá vamos. Adiós, Talavera... bueno, hola, Talavera.' }, { goto: ['travesia', 'start'] }],
    else: [{ say: '¡Eh! ¡Las manos quietas, que esa barca es mía!', who: 'alfonso' }, { if: '!met_alfonso', then: [{ say: 'Mejor hablo primero con el barquero.' }] }] }];

  // --- TRAVESÍA (cinemática jugable: se salta al volver a pasar)
  S.travesia = {
    id: 'travesia', name: 'Cruzando el Tajo', width: 1600, height: 900, camera: 'fixed', depth: { yFar: 690, sFar: 0.95, yNear: 745, sNear: 1 },
    ambientSound: { cutoff: 700, vol: 0.12 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/scenes/travesia/bg.png', placeholder: 'g11_travesia' }],
    ambient: [
      { type: 'strip', asset: 'fx_water_strip', x: 0, y: 335, w: 1600, h: 565, tile: 800, speed: 80, alpha: .9 },
      { type: 'bob', asset: 'g11_boat_big', x: 400, y: 560, w: 800, h: 240, speed: 1.5, amp: 4 }],
    walk: { outer: quad(560, 690, 1040, 745), holes: [] },
    entries: { start: { x: 640, y: 720, facing: 'right' } },
    hotspots: [{ id: 'rio', name: 'Río Tajo', rect: [0, 335, 1600, 330], verbs: { look: [{ say: 'El Tajo, visto desde dentro. Moja más.' }] } }],
    onEnter: [{ if: 'cruzado', then: [{ goto: ['puerta_rio', 'from_travesia'] }], else: [
      { wait: 0.8 }, { note: 'La barca se aparta de la orilla. Talavera crece poco a poco.' },
      { say: '¿Sin motor, sin remos, sin chaleco? Solo una pértiga y mucha confianza.' },
      { say: 'Silencio. El río escucha, y lo que escucha lo cobra.', who: 'alfonso_b' }, { wait: 0.6 },
      { say: 'Esto va más lento que mi cercanías de las 7:15.' },
      { say: '¿Qué es un «cercanías»? No me lo expliques: Don Nuño lo tasaría.', who: 'alfonso_b' },
      { say: '¿Quién es Don Nuño?' },
      { say: 'El alguacil de la Puerta del Río. Cobra por entrar, por estar y por irse. Una vez multó a un gallo por cantar sin licencia.', who: 'alfonso_b' },
      { say: 'Si te pregunta, tú eres un juglar. Y si te quita algo, tú nunca lo tuviste.', who: 'alfonso_b' },
      { say: 'Habla con Yuçaf, el alfarero. Tiene la carreta atascada, pero tiene más amigos que Nuño impuestos.', who: 'alfonso_b' },
      { wait: 0.5 }, { note: 'La orilla de la Puerta del Río se acerca.' },
      { say: 'Hasta aquí llego. Si vuelves, aquí estaré. Si Nuño no me ha tasado la barca.', who: 'alfonso_b' },
      { set: ['cruzado', 'aviso_nuno'] }, { goto: ['puerta_rio', 'from_travesia'] }] }]
  };

  // --- PUERTA DEL RÍO
  S.puerta_rio = {
    id: 'puerta_rio', name: 'La Puerta del Río', width: 2200, height: 900, camera: 'follow', depth: DEPTH,
    ambientSound: { cutoff: 900, vol: 0.10 },
    layers: [
      { id: 'bg', z: 'back', x: 0, y: 0, w: 2200, h: 900, src: 'assets/scenes/puerta_rio/bg.png', placeholder: 'g11_puerta' },
      { id: 'cart1', z: 'sort', sortY: 760, x: 1680, y: 520, w: 380, h: 260, src: 'assets/scenes/puerta_rio/cart_stuck.png', placeholder: 'g11_cart_stuck', visibleWhen: '!carreta_libre' },
      { id: 'cart2', z: 'sort', sortY: 760, x: 1680, y: 520, w: 380, h: 260, src: 'assets/scenes/puerta_rio/cart_free.png', placeholder: 'g11_cart_free', visibleWhen: 'carreta_libre' },
      { id: 'bando', z: 'back', x: 1262, y: 420, w: 70, h: 90, src: 'assets/scenes/puerta_rio/bando.png', placeholder: 'g11_bando', visibleWhen: { all: ['nuno_conoce', '!bando_cogido'] } }
    ],
    ambient: [{ type: 'strip', asset: 'fx_water_strip', x: 0, y: 420, w: 480, h: 130, tile: 480, speed: 14, alpha: .8, clip: true }],
    walk: { outer: [[80, 650], [1950, 650], [1950, 860], [80, 860]], holes: [{ id: 'carreta', poly: quad(1700, 700, 2040, 770) }] },
    entries: { start: { x: 160, y: 760, facing: 'right' }, from_travesia: { x: 160, y: 760, facing: 'right' }, from_plaza: { x: 1470, y: 720, facing: 'left' } },
    hotspots: [
      { id: 'muralla', name: 'Muralla', rect: [450, 80, 1750, 270], verbs: { look: [{ say: 'La muralla de Talavera. Desde aquí no parece medieval: parece muy, muy en serio.' }], 'use:telefono': [{ say: 'Foto de la muralla. Sin cobertura, pero con mucha dignidad.' }] } },
      { id: 'torre', name: 'Torre albarrana', rect: [780, 40, 480, 300], verbs: { look: [{ say: 'Una torre albarrana: adelantada, para vigilar. Tiene pinta de estar vigilando exactamente a mí.' }] } },
      { id: 'tarifas', name: 'Tablón de tarifas', rect: [1170, 520, 120, 110], walkTo: [1230, 700],
        verbs: { look: [{ say: 'TARIFAS DEL PORTAZGO: entrar, 2 dineros. Estar, 3. Salir, 4. Mirar la muralla, 1. Mirar la muralla con cara de admiración, 2.' }, { say: 'Y debajo, a mano: «Respirar: suspendido por falta de aire».' }] } },
      { id: 'exit_plaza', name: 'Postigo de la ciudad', rect: [1320, 350, 300, 300], walkTo: [1470, 700],
        exit: { to: 'plaza', entry: 'from_puerta', when: 'pase_puerta', deny: [{ say: '¡Alto ahí, juglar!', who: 'gil_a' }, { say: 'Sin pase no se entra. Eso dice la ley. Cuál, no lo sé.', who: 'gil_b' }] },
        blocked: [{ say: 'Los guardias se interponen. Tendré que hablarles.' }],
        verbs: { look: [{ say: 'El postigo de Talavera: arco de herradura, ladrillo y una cola de ninguna parte.' }] } },
      { id: 'bando', name: 'Bando de Don Nuño', rect: [1250, 410, 90, 110], walkTo: [1290, 700], visibleWhen: { all: ['nuno_conoce', '!bando_cogido'] },
        verbs: {
          look: [{ say: 'BANDO DE DON NUÑO DE MALA-CUENTA, ALGUACIL MAYOR.' },
            { say: 'Art. 1: Todo forastero pagará por entrar, por estar y por irse.' },
            { say: 'Art. 2: Quedará EXENTO de toda tasa quien presente licencia con TRES SELLOS: el de los Olleros, el de la parroquia y el de la alguacilía.' },
            { say: 'Art. 3: Quien lo logre recibirá del Alguacil una pieza de oro «por las molestias».' },
            { say: 'Art. 4: Ver art. 5. Art. 5: Ver art. 4. Firmado: Nuño. (Lo escribí yo y nadie va a conseguirlo.)' },
            { set: 'bando_leido' }, { say: 'Interesante. «Lo escribí yo»... esto lo vuelvo a leer. Y a guardar.' }],
          pick: [{ if: 'bando_leido', then: [{ give: 'bando' }, { set: 'bando_cogido' }, { say: 'Arranco el bando con cuidado. Un delito menor frente a lo que cobra Nuño por estornudar.' }], else: [{ say: 'Primero lo leo, que luego dicen que robo sin entender.' }] }] } },
      { id: 'carreta', name: 'Carreta atascada', rect: [1680, 520, 380, 260], walkTo: [1650, 790], face: 'right',
        verbs: {
          look: [{ if: 'carreta_libre', then: [{ say: 'La carreta rueda otra vez. Los cántaros no se han roto. Milagro de la ingeniería medieval.' }],
            else: [{ say: 'Una carreta cargada de cántaros con la rueda hundida en la rodada. Para sacarla hay que calzar la rueda y hacer palanca.' }, { set: 'sabe_carreta' }] }],
          use: [{ if: 'carreta_libre', then: [{ say: 'Ya no necesita mi ayuda.' }], else: [{ say: 'Empujo con todas mis fuerzas... y mis fuerzas dicen que no. Necesito calzar la rueda y una palanca.' }] }],
          'use:cuna': [{ if: 'carreta_libre', then: [{ say: 'Ya no hace falta.' }], else: [{ if: 'cuna_puesta', then: [{ say: 'Ya está calzada.' }], else: [{ take: 'cuna' }, { set: 'cuna_puesta' }, { sfx: 'combine' }, { say: 'Meto la cuña bajo la rueda. Ahora, si levanto, no se vuelve a hundir.' }] }] }],
          'use:pertiga': 'LEVER', 'use:pertiga_lazo': 'LEVER', 'use:viga': 'LEVER',
          'use:telefono': [{ say: 'Una foto de la carreta. Quedará genial en el álbum «Cosas que no pasaron».' }] } },
      { id: 'ladrillos', name: 'Montón de ladrillos', rect: [250, 700, 140, 80], walkTo: [320, 800], visibleWhen: '!cuna_cogida',
        verbs: { look: [{ say: 'Ladrillos, cascotes y una cuña de obra perdida entre el montón.' }], pick: [{ give: 'cuna' }, { set: 'cuna_cogida' }, { say: 'Una cuña de obra. Nunca se sabe cuándo hará falta calzar algo.' }] } },
      { id: 'viga', name: 'Viga caída', rect: [520, 770, 220, 50], walkTo: [630, 840], visibleWhen: '!viga_cogida',
        verbs: { look: [{ say: 'Una viga de reparación abandonada. Larga, recia y sin dueño aparente.' }], pick: [{ give: 'viga' }, { set: 'viga_cogida' }, { say: 'Una viga larga. Sirve de palanca, de bastón y de excusa.' }] } },
      { id: 'mojon', name: 'Mojón', rect: [360, 560, 150, 170], verbs: { look: [{ say: 'Un miliario romano reutilizado. Dice «a Toledo, 76 millas». O «aquí meó un legionario». Mi latín es de oídas.' }] } },
      { id: 'exit_ribera', name: 'Camino a la ribera', rect: [0, 640, 120, 230], walkTo: [150, 760], exit: { to: 'embarcadero', entry: 'from_puerta' }, verbs: { look: [{ say: 'El camino de vuelta a la orilla. Alfonso me espera... si no le han tasado la espera.' }] } }
    ],
    firstEnter: [{ note: 'La Puerta del Río. Murallas, una torre albarrana y una fila de guardias muy atentos.' },
      { say: 'Wow. La ciudad ha dejado de ser un horizonte.' }, { say: 'Y ahora un guardia me mira como si le debiera dinero. Normal, aquí es probable.' }]
  };
  // palanca: la misma secuencia con pértiga, pértiga+lazo o viga
  const LEVER = [{ if: 'carreta_libre', then: [{ say: 'Ya está libre.' }], else: [
    { if: '!cuna_puesta', then: [{ say: 'Levantaría la rueda... y se volvería a hundir. Antes hay que calzarla con algo.' }],
      else: [{ say: 'Cuña puesta. Meto la palanca bajo el eje... uno, dos... ¡y tres!' }, { sfx: 'wheel' }, { wait: 0.6 },
        { set: ['carreta_libre', 'tiene_palanca_usada'] }, { note: 'La carreta sale de la rodada con un crujido heroico.' }, { event: 'carreta_liberada' }] }] }];
  for (const h of S.puerta_rio.hotspots) for (const k of Object.keys(h.verbs || {})) if (h.verbs[k] === 'LEVER') h.verbs[k] = LEVER;

  // --- PLAZA DEL PAN
  S.plaza = {
    id: 'plaza', name: 'Plaza del Pan', width: 2600, height: 900, camera: 'follow', depth: DEPTH, ambientSound: { cutoff: 1200, vol: 0.12 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 2600, h: 900, src: 'assets/scenes/plaza/bg.png', placeholder: 'g11_plaza' }],
    ambient: [], walk: { outer: [[60, 660], [2540, 660], [2540, 870], [60, 870]], holes: [
      { id: 'fuente', poly: quad(1090, 690, 1210, 722) }, { id: 'mostrador', poly: quad(300, 690, 560, 730) }, { id: 'yunque', poly: quad(690, 690, 900, 730) }] },
    entries: { from_puerta: { x: 200, y: 770, facing: 'right' }, from_iglesia: { x: 1530, y: 740, facing: 'left' }, from_portazgo: { x: 1975, y: 740, facing: 'left' },
      from_audiencia: { x: 2300, y: 760, facing: 'left' }, from_alfar: { x: 2480, y: 780, facing: 'left' }, start: { x: 200, y: 770, facing: 'right' } },
    hotspots: [
      { id: 'exit_puerta', name: 'Puerta del Río', rect: [0, 330, 200, 330], walkTo: [150, 760], exit: { to: 'puerta_rio', entry: 'from_plaza' } },
      { id: 'bandos', name: 'Tablón de bandos', rect: [230, 290, 70, 160], walkTo: [280, 780],
        verbs: { look: [{ say: 'Bandos y más bandos: «Prohibido cantar sin licencia de cantar», «Tasa por llevar sombrero», «Tasa por no llevarlo».' }, { say: 'Todos firmados: Don Nuño de Mala-Cuenta. Tiene mejor letra que conciencia.' }] } },
      { id: 'fuente', name: 'Fuente', rect: [1070, 540, 160, 180], walkTo: [1150, 760], verbs: { look: [{ say: 'Una fuente. Con tasa de sed, supongo.' }], use: [{ say: 'Bebo un trago. Sorprendentemente, no me cobran. Todavía.' }], 'use:cantaro': [{ say: 'Un cántaro lleno de agua pesa y no tengo en qué volcarlo. Se lo daré a quien lo necesite.' }] } },
      { id: 'exit_iglesia', name: 'Iglesia de Santa María', rect: [1470, 460, 140, 210], walkTo: [1530, 740], exit: { to: 'iglesia', entry: 'from_plaza' }, verbs: { look: [{ say: 'Santa María. Se oye... nada. Ni una campana en toda la plaza. Raro.' }] } },
      { id: 'exit_portazgo', name: 'Casa del Portazgo', rect: [1930, 470, 100, 200], walkTo: [1975, 740],
        exit: { to: 'portazgo', entry: 'from_plaza', when: 'nuno_conoce', deny: [{ say: 'Cerrado: «horario de tasas, de nunca a jamás».' }] }, verbs: { look: [{ say: 'La casa del portazgo. De la puerta cuelga un cartel: «Ábrase con tasa».' }] } },
      { id: 'exit_audiencia', name: 'Arco de la Plaza Mayor', rect: [2220, 330, 140, 340], walkTo: [2300, 760], exit: { to: 'audiencia', entry: 'from_plaza', when: 'nuno_conoce', deny: [{ say: 'Está cerrado por preparativos de la Vista Pública. Nadie me ha dicho qué vista ni de qué.' }] } },
      { id: 'exit_alfar', name: 'Calle de los Olleros', rect: [2420, 400, 180, 270], walkTo: [2480, 780], exit: { to: 'alfar', entry: 'from_plaza' }, verbs: { look: [{ say: 'La calle de los Olleros. Huele a barro cocido y a negocio redondo.' }] } }
    ],
    firstEnter: [{ note: 'La Plaza del Pan. El corazón de Talavera en 1248.' }, { say: 'Talavera por dentro. Si Alfonso lo viera, cobraría entrada.' },
      { say: 'Objetivo: tres sellos. Gremio ya lo tengo. Faltan la parroquia y la alguacilía.', if: 'tiene_sello_gremio' }]
  };
  // arreglo: líneas condicionales en firstEnter con 'if' dentro del say no existen en el motor; las convertimos
  S.plaza.firstEnter = [{ note: 'La Plaza del Pan. El corazón de Talavera en 1248.' }, { say: 'Talavera por dentro. Si Alfonso lo viera, cobraría entrada.' },
    { say: 'Objetivo: tres sellos para la licencia. Gremio ya lo tengo. Faltan parroquia y alguacilía.' }];

  // --- IGLESIA
  S.iglesia = {
    id: 'iglesia', name: 'Atrio de Santa María', width: 1600, height: 900, camera: 'fixed', depth: DEPTH, ambientSound: { cutoff: 800, vol: 0.08 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/scenes/iglesia/bg.png', placeholder: 'g11_iglesia' }],
    ambient: [], walk: { outer: [[60, 660], [1540, 660], [1540, 870], [60, 870]], holes: [{ id: 'banco', poly: quad(560, 700, 800, 730) }] },
    entries: { from_plaza: { x: 1450, y: 780, facing: 'left' }, start: { x: 1450, y: 780, facing: 'left' } },
    hotspots: [
      { id: 'campana', name: 'Campana', rect: [190, 90, 120, 150], walkTo: [260, 700],
        verbs: { look: [{ if: 'campana_arreglada', then: [{ say: 'La campana, ya con su badajo. Suena a gloria y a cobrar.' }], else: [{ say: 'La campana de Santa María. Le falta el badajo: cuelga muda como un reproche.' }, { set: 'sabe_badajo' }] }],
          'use:badajo': 'BADAJO' } },
      { id: 'banco', name: 'Banco', rect: [560, 700, 240, 66], verbs: { look: [{ say: 'Un banco de madera. Más cómodo que mi sofá, seguro; mentira, no.' }] } },
      { id: 'exit_plaza', name: 'Salida a la plaza', rect: [1430, 400, 150, 270], walkTo: [1450, 780], exit: { to: 'plaza', entry: 'from_iglesia' } }
    ],
    firstEnter: [{ note: 'El atrio de Santa María. Incienso, sombra y un silencio que da hasta miedo.' }]
  };
  const BADAJO = [{ if: 'campana_arreglada', then: [{ say: 'Ya está puesto.' }], else: [{ say: 'Para arreglar la campana hay que dárselo a Fray Benito, que es quien manda aquí. Y quien sella.' }] }];
  for (const h of S.iglesia.hotspots) for (const k of Object.keys(h.verbs || {})) if (h.verbs[k] === 'BADAJO') h.verbs[k] = BADAJO;

  // --- ALFAR DE YUÇAF
  S.alfar = {
    id: 'alfar', name: 'Alfar de Yuçaf', width: 1600, height: 900, camera: 'fixed', depth: DEPTH, ambientSound: { cutoff: 700, vol: 0.10 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/scenes/alfar/bg.png', placeholder: 'g11_alfar' },
      { id: 'torno', z: 'sort', sortY: 770, x: 760, y: 640, w: 150, h: 160, src: 'assets/scenes/alfar/torno.png', placeholder: 'g11_torno' }],
    ambient: [{ type: 'pulse', asset: 'g11_horno_fuego', x: 310, y: 560, w: 200, h: 200, speed: 3, visibleWhen: 'final_listo' }],
    walk: { outer: [[60, 660], [1540, 660], [1540, 870], [60, 870]], holes: [{ id: 'horno', poly: quad(90, 640, 530, 700) }, { id: 'torno', poly: quad(780, 740, 890, 770) }] },
    entries: { from_plaza: { x: 1450, y: 780, facing: 'left' }, from_audiencia: { x: 1220, y: 790, facing: 'left' }, start: { x: 1450, y: 780, facing: 'left' } },
    hotspots: [
      { id: 'horno', name: 'Horno', rect: [90, 220, 440, 440], walkTo: [320, 740],
        verbs: { look: [{ if: 'final_listo', then: [{ say: 'El horno arde con un fuego raro: azul en el centro, como una pantalla encendida.' }], else: [{ say: 'Un horno de alfarero enorme. Caliente, vivo y con aire de saber más de lo que dice.' }] }],
          use: [{ if: 'final_listo', then: [{ event: 'final_horno' }], else: [{ say: 'Está muy caliente. No pienso meterme.' }] }],
          'use:telefono': [{ if: 'final_listo', then: [{ event: 'final_horno' }], else: [{ say: 'Sin cobertura ni al lado de un horno. Qué manía.' }] }] } },
      { id: 'torno', name: 'Torno de alfarero', rect: [760, 640, 150, 160], walkTo: [840, 800], verbs: { look: [{ say: 'Un torno de alfarero con un cántaro a medias. Lo hice girar. Me salió una sartén. Mala suerte.' }] } },
      { id: 'estantes', name: 'Estantes de cerámica', rect: [600, 130, 840, 280], verbs: { look: [{ say: 'Cántaros, escudillas y jarras. Todo vidriado en azul y naranja. Esto, en mi siglo, cuesta una fortuna.' }], 'use:telefono': [{ say: 'Foto de los estantes. Cuando vuelva, el museo de cerámica me va a odiar.' }] } },
      { id: 'exit_plaza', name: 'Salida a la calle', rect: [1440, 300, 160, 370], walkTo: [1470, 780], exit: { to: 'plaza', entry: 'from_alfar' } }
    ],
    firstEnter: [{ note: 'El alfar de Yuçaf. Calor, barro y cántaros por todas partes.' }],
    onEnter: [{ if: { all: ['final_listo', '!epilogo_visto'] }, then: [
      { set: 'epilogo_visto' }, { wait: 0.5 }, { note: 'Atardece sobre Talavera. El horno de los Olleros se enciende.' },
      { say: 'Hoy has hecho temblar a Don Nuño. Eso se paga con vino... o con un cántaro. Elige.', who: 'yucaf_alfar' },
      { say: 'Prefiero el cántaro. El vino lo cobran con tasa.' }, { wait: 0.3 },
      { say: 'En mi familia se cuenta que el Tajo guarda caminos del tiempo, y que el horno de los Olleros los enciende al caer el sol.', who: 'yucaf_alfar' },
      { say: 'Mi abuelo vio salir de ese fuego a un hombre con ropas azules y una tablilla negra que brillaba.', who: 'yucaf_alfar' },
      { say: '...¿Y qué pasó con ese hombre?' }, { say: 'Que dijo «cuánta batería» y se fue. Nunca supimos qué era una batería.', who: 'yucaf_alfar' },
      { say: 'Sácala, forastero. Acércate al horno. Creo que te está esperando.', who: 'yucaf_alfar' }, { say: 'Móvil, tú y yo... una última vez.' }] }]
  };

  // --- CASA DEL PORTAZGO (interior)
  S.portazgo = {
    id: 'portazgo', name: 'Casa del Portazgo', width: 1600, height: 900, camera: 'fixed', depth: DEPTH, ambientSound: { cutoff: 500, vol: 0.06 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/scenes/portazgo/bg.png', placeholder: 'g11_portazgo' },
      { id: 'mesa', z: 'sort', sortY: 734, x: 900, y: 690, w: 400, h: 60, src: 'assets/scenes/portazgo/mesa.png', placeholder: 'g11_mesa' }],
    ambient: [], walk: { outer: [[60, 660], [1540, 660], [1540, 870], [60, 870]], holes: [{ id: 'mesa', poly: quad(900, 700, 1300, 740) }] },
    entries: { from_plaza: { x: 215, y: 780, facing: 'right' }, start: { x: 215, y: 780, facing: 'right' } },
    hotspots: [
      { id: 'tarifas', name: 'Cuadro de tarifas', rect: [640, 130, 320, 220], walkTo: [800, 740], verbs: { look: [{ say: 'Entrar: 2 dineros. Estar: 3. Salir: 4. Mirar: 1. Respirar: suspendido.' }, { say: 'Desde que subió la tasa de respirar, la gente habla menos. Qué casualidad.' }] } },
      { id: 'jarras', name: 'Estantería de tasas', rect: [1100, 110, 400, 420], walkTo: [1250, 760], verbs: { look: [{ say: 'Jarras con etiquetas: «Tasa de la tasa», «Tasa de la tasa de la tasa», «Tasa de emergencia (por si acaso)».' }] } },
      { id: 'libro', name: 'Gran Libro de las Tasas', rect: [1070, 680, 120, 40], walkTo: [1090, 780], verbs: { look: [{ say: 'El Gran Libro de las Tasas. Capítulo 12: «Tasas aplicables a quien lea este libro».' }], pick: [{ say: 'Pesa más que una cuesta de enero.' }] } },
      { id: 'sello', name: 'Sello del Alguacil', rect: [1200, 668, 60, 32], walkTo: [1230, 780], visibleWhen: '!sello_cogido',
        verbs: { look: [{ say: 'El sello del Alguacil: un sello rojo con un cántaro roto y una moneda. Nuño no lo suelta ni para dormir.' }],
          pick: [{ if: 'nuno_ensimismado', then: [{ give: 'sello_alguacil' }, { set: ['sello_cogido', 'tiene_sello_alguacil'] }, { sfx: 'pick' }, { say: 'Con Nuño mirándose a sí mismo, cojo el sello. «Prestado». Seguro que lo hubiera aprobado, cobrando.' }],
            else: [{ say: 'Con Nuño mirándome no me atrevo. Si pudiera distraerlo un momento...' }] }] } },
      { id: 'exit_plaza', name: 'Salida a la plaza', rect: [140, 300, 150, 370], walkTo: [215, 780], exit: { to: 'plaza', entry: 'from_portazgo' } }
    ],
    onEnter: [{ unset: 'nuno_ensimismado' }],
    firstEnter: [{ note: 'La Casa del Portazgo. Aquí se cobra hasta el silencio.' }]
  };

  // --- AUDIENCIA (Vista Pública)
  S.audiencia = {
    id: 'audiencia', name: 'Plaza Mayor · Vista Pública', width: 1600, height: 900, camera: 'fixed', depth: DEPTH, ambientSound: { cutoff: 1100, vol: 0.12 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/scenes/audiencia/bg.png', placeholder: 'g11_audiencia' }],
    ambient: [], walk: { outer: [[60, 690], [1540, 690], [1540, 870], [60, 870]], holes: [] },
    entries: { from_plaza: { x: 200, y: 790, facing: 'right' }, start: { x: 200, y: 790, facing: 'right' } },
    hotspots: [
      { id: 'tarima', name: 'Tarima', rect: [480, 600, 640, 80], verbs: { look: [{ say: 'La tarima de la Vista Pública. Con tres cojines: uno para el mayordomo, uno para el alguacil y uno para la tasa.' }] } },
      { id: 'publico', name: 'Vecinos', rect: [100, 560, 380, 200], verbs: { look: [{ say: 'Medio Talavera ha venido a ver cómo Don Nuño me quita lo que no tengo. O al revés.' }] } },
      { id: 'exit_plaza', name: 'Volver a la plaza', rect: [0, 300, 150, 400], walkTo: [200, 790], exit: { to: 'plaza', entry: 'from_audiencia' } }
    ],
    firstEnter: [{ note: 'Plaza Mayor. Vista Pública ante el mayordomo del Rey.' }, { say: 'Si tuviera una palomitas... pero seguro que las tasan.' }]
  };

  // ===================================================== PERSONAJES NO JUGADORES
  const LOPE_TRADE_ACT = [{ if: 'has:cantaro', then: [{ take: 'cantaro' }, { give: 'badajo' }, { set: ['tiene_badajo', 'lope_trueque'] }, { sfx: 'success' }, { say: 'Tu badajo. Y ahora, a templar. ¡Fuera, que me inspiro!', who: 'lope' }],
    else: [{ say: 'Sin cántaro, no hay trato.', who: 'lope' }] }];
  const LOPE_TRADE = [{ if: 'lope_trueque', then: [{ say: 'Ya hicimos trato, hombre.', who: 'lope' }], else: [{ say: '¿Un cántaro? Ya era hora. Dame, dame.', who: 'lope' }, ...LOPE_TRADE_ACT] }];
  const BENITO_BADAJO = [{ if: 'campana_arreglada', then: [{ say: 'Ya suena, hijo, ya suena.', who: 'benito' }], else: [
    { say: '¿Eh? ¿Una badana? ¡Ah, el badajo! ¡DIOS TE BENDIGA!', who: 'benito' }, { take: 'badajo' }, { set: ['campana_arreglada', 'tiene_sello_parroquia'] }, { sfx: 'success' },
    { note: '¡DONG! La campana de Santa María suena por toda Talavera.' }, { give: 'sello_parroquia' }, { rel: ['benito', 3] },
    { say: '¡DONG! ¡Qué dulce música! Toma el sello de la parroquia, hijo. Te lo has ganado.', who: 'benito' }] }];
  const NUNO_ESPEJO = [{ if: 'nuno_ensimismado', then: [{ say: '¡Silencio! ¡Que me estoy mirando!', who: 'nuno_casa' }], else: [
    { say: 'Es un espejo negro, sí. Pero si se mira por la cara de delante... se ve todo.' },
    { say: '¿Brujería? Déjame ver... ¿Quién es ese caballero tan pomposo? ¡Qué ojos! ¡Qué porte!', who: 'nuno_casa' },
    { say: 'Esa papada... ¡esa papada es una obra maestra! ¡SOY YO!', who: 'nuno_casa' },
    { say: 'Déjame mirarme un momento... a solas. No me interrumpas, que me estoy tasando la belleza.', who: 'nuno_casa' },
    { set: 'nuno_ensimismado' }, { say: 'Don Nuño se queda absorto ante su propio reflejo. Ahora sí tengo un momento.' }] }];
  const N = D.npcs;
  const npc = (id, name, character, scene, start, facing, extra) => { N[id] = { id, name, character, scene, start, facing, talkDistance: 125, routines: [], reactions: {}, verbs: {}, ...extra }; };
  const guardVerbs = { talk: [{ dialogue: 'gil' }], look: [{ say: 'Un guardia del portazgo. Dice llamarse Gil. El otro también.' }],
    'give:*': [{ say: '¿Eso es un soborno? Sepa que los sobornos se cobran aparte.', who: 'gil_a' }] };

  npc('gil_a', 'Gil', 'guardia', 'puerta_rio', [1360, 745], 'left', { verbs: guardVerbs, routines: [{ steps: [{ wait: 6, face: 'left' }, { bark: '¡Circulen! ...pero paguen.', every: 25 }] }] });
  npc('gil_b', 'Otro Gil', 'guardia', 'puerta_rio', [1560, 745], 'left', { verbs: guardVerbs, routines: [{ steps: [{ wait: 8, face: 'left' }, { bark: 'Yo no sé nada, pero lo sé con mucha firmeza.', every: 30 }] }] });
  npc('yucaf', 'Yuçaf', 'yucaf', 'puerta_rio', [1620, 800], 'left', { talkDistance: 130,
    verbs: { talk: [{ dialogue: 'yucaf' }], look: [{ say: 'Yuçaf, alfarero. Dignidad, barro hasta los codos y la paciencia de quien paga impuestos desde niño.' }], 'give:telefono': [{ say: '¿Una tablilla negra? ¡Guárdala! Si la ve Nuño, la tasa; si la ve Fray Benito, la bendice.', who: 'yucaf' }], 'give:*': [{ say: 'Gracias, pero no necesito eso ahora.', who: 'yucaf' }] },
    routines: [{ when: '!carreta_libre', steps: [{ wait: 5, anim: 'work', act: 'empujando la carreta' }, { bark: '¡Por la barba del Profeta! ¡Otra vez la rueda!', every: 22 }, { wait: 3, face: 'right' }] }, { steps: [{ wait: 6, face: 'left' }] }],
    reactions: { carreta_liberada: { blocking: true, actions: [
      { npcHold: 'yucaf' }, { wait: 0.4 }, { npcFace: ['yucaf', 'player'] },
      { say: '¡Dios sea loado! ¡La carreta rueda! Llevaba tres días atascado y tres noches con el mismo sueño.', who: 'yucaf' },
      { say: 'Forastero, me has ahorrado un día de trabajo y tres de lamentos. Toma: mi sello de ollero y un cántaro de mi mejor hornada.', who: 'yucaf' },
      { give: 'sello_gremio' }, { give: 'cantaro' }, { set: ['tiene_sello_gremio', 'yucaf_recompensa'] }, { rel: ['yucaf', 3] },
      { say: 'Cuidado con Don Nuño: lo cobra todo. Mi alfar está en la calle de los Olleros, al otro lado de la plaza.', who: 'yucaf' }, { npcRelease: 'yucaf' }] } } });
  npc('yucaf_alfar', 'Yuçaf', 'yucaf', 'alfar', [1000, 790], 'left', { presentWhen: 'pase_puerta',
    verbs: { talk: [{ dialogue: 'yucaf_alfar' }], look: [{ say: 'Yuçaf, ya en casa. Entre cántaros se le ve más relajado: casi sonríe.' }], 'give:*': [{ say: 'No hace falta, amigo. Quédatelo.', who: 'yucaf_alfar' }] },
    routines: [{ steps: [{ wait: 4, anim: 'work', face: 'right', act: 'moldeando barro' }, { wait: 3, face: 'left' }] }] });
  npc('nuno_puerta', 'Don Nuño', 'nuno', 'puerta_rio', [1400, 770], 'left', { presentWhen: { all: ['carreta_libre', '!nuno_se_fue'] }, talkDistance: 120,
    verbs: { talk: [{ say: '¡Silencio! ¡Hablo yo! Las preguntas se tasan.', who: 'nuno_puerta' }], look: [{ say: 'Don Nuño de Mala-Cuenta: alguacil mayor, altura de mulo, sombrero de catedral y sonrisa de recibo.' }], 'give:*': [{ say: '¿Una ofrenda? Qué sorpresa. Tasa por ofrenda: la mitad.', who: 'nuno_puerta' }] },
    reactions: { carreta_liberada: { blocking: true, actions: [
      { npcHold: 'nuno_puerta' }, { wait: 0.6 }, { npcFace: ['nuno_puerta', 'player'] },
      { say: '¡ALTO, EN NOMBRE DEL PORTAZGO! ¿Quién ha liberado esa carreta sin abonar la tasa de liberación?', who: 'nuno_puerta' },
      { say: 'Eh... ¿nadie?' }, { say: 'Nadie. Tasa por «nadie»: dos dineros. Yo mismo la apunto.', who: 'nuno_puerta' },
      { say: 'Soy Don Nuño de Mala-Cuenta, Alguacil Mayor de Talavera, Cobrador del Portazgo y Juez de Tasas. Todo en uno, para ahorrar.', who: 'nuno_puerta' },
      { say: 'Y tú: chaqueta azul sin licencia de color, mochila no registrada y calzado sospechosamente blanco.', who: 'nuno_puerta' },
      { say: 'Vengo del otro lado del Tajo.' }, { say: 'Eso no es una excusa: es una agravante geográfica.', who: 'nuno_puerta' },
      { say: 'Veo además un brillo azul en tu zurrón. ¿Un espejo negro? Brujería, claro. Lo confiscaré mañana, en Vista Pública, ante el mayordomo del Rey.', who: 'nuno_puerta' },
      { say: 'A menos que presentes LICENCIA DE FORASTERO con tres sellos: gremio, parroquia y alguacilía. Está en mi bando.', who: 'nuno_puerta' },
      { say: 'Tres sellos. En un día. Qué cosa más... posible.', who: 'nuno_puerta' }, { say: 'Imposible, quiero decir. IMPOSIBLE. Y esto lo dice la ley, que acabo de escribirla.', who: 'nuno_puerta' },
      { set: ['nuno_conoce', 'pase_puerta'] }, { note: 'Don Nuño clava un bando junto al postigo y se retira con dignidad de gallo.' },
      { say: '¡Gil! ¡Gil!', who: 'nuno_puerta' }, { say: '¿Cuál de los dos?', who: 'gil_a' }, { say: '¡El de siempre!', who: 'nuno_puerta' },
      { npcWalk: ['nuno_puerta', 1470, 655] }, { set: 'nuno_se_fue' }] } } });
  npc('sancha', 'Doña Sancha', 'sancha', 'plaza', [470, 790], 'right', { verbs: { talk: [{ dialogue: 'sancha' }], look: [{ say: 'Doña Sancha, la panadera. Tiene más harina en el delantal que Durán en todo el molino.' }], 'give:*': [{ say: 'No, hijo. Aquí se vende, no se trapichea... a menos que sea tasado.', who: 'sancha' }] },
    routines: [{ steps: [{ wait: 5, anim: 'work', face: 'left', act: 'amasando' }, { bark: '¡Pan caliente, tasa fría!', every: 20 }, { wait: 3, face: 'right' }] }] });
  npc('lope', 'Maese Lope', 'lope', 'plaza', [800, 790], 'right', { talkDistance: 140,
    verbs: { talk: [{ dialogue: 'lope' }], look: [{ say: 'Maese Lope, el herrero: brazos de yunque, bigotes de fragua y mal humor de pozo seco.' }],
      'give:cantaro': LOPE_TRADE, 'give:*': [{ say: '¿Y yo qué hago con eso? Necesito agua, hombre, agua.', who: 'lope' }] },
    routines: [{ steps: [{ wait: 4, anim: 'work', face: 'right', act: 'martilleando' }, { bark: '¡Sin agua no hay temple! ¡Y sin temple no hay herradura!', every: 24 }, { wait: 2, face: 'left' }] }] });
  npc('pregonero', 'El pregonero', 'pregonero', 'plaza', [1700, 800], 'left', { verbs: { talk: [{ dialogue: 'pregonero' }], look: [{ say: 'El pregonero. Voz de trompeta, memoria de gallina y ningún criterio.' }] },
    routines: [{ steps: [{ wait: 3, face: 'left' }, { bark: '¡Oíd, oíd! Por orden de Don Nuño: tasa por estornudar en la plaza.', every: 22 }, { wait: 5 }, { bark: '¡Y tasa de salud por quien diga «Jesús»!', every: 30 }, { wait: 3, face: 'right' }] }] });
  npc('benito', 'Fray Benito', 'benito', 'iglesia', [800, 790], 'right', { talkDistance: 120,
    verbs: { talk: [{ dialogue: 'benito' }], look: [{ say: 'Fray Benito: hábito pardo, barba de nieve y oreja de piedra. Se le oye hablar muy alto y escuchar muy poco.' }],
      'give:badajo': BENITO_BADAJO, 'give:*': [{ say: '¿Eh? ¿Una limosna? ¡Dios te lo pague... a plazos!', who: 'benito' }] },
    routines: [{ steps: [{ wait: 5, face: 'right', act: 'rezando' }, { bark: '¡Hace dos días que no toco! ¡Dos días!', every: 28 }, { wait: 4, face: 'left' }] }] });
  npc('nuno_casa', 'Don Nuño', 'nuno', 'portazgo', [1050, 770], 'left', { talkDistance: 130,
    verbs: { talk: [{ dialogue: 'nuno' }], look: [{ say: 'Don Nuño en su salsa: tras la mesa, entre libros de cuentas y con cara de que alguien le debe algo. Yo, probablemente.' }],
      'give:telefono': NUNO_ESPEJO, 'give:*': [{ say: '¿Una ofrenda? Anotada, tasada y sin recibo.', who: 'nuno_casa' }] },
    routines: [{ when: 'nuno_ensimismado', steps: [{ bark: '¡Qué porte! ¡Qué ojos! La papada... la papada es una obra maestra.', every: 12 }, { wait: 5, face: 'left' }] },
      { steps: [{ wait: 5, anim: 'work', face: 'left', act: 'contando tasas' }, { bark: 'Tasa de tasa de tasa... ¡qué buen negocio!', every: 20 }] }] });
  npc('mayordomo', 'Don Gutierre', 'mayordomo', 'audiencia', [820, 745], 'left', { talkDistance: 130,
    verbs: { talk: [{ dialogue: 'mayordomo' }], look: [{ say: 'Don Gutierre, mayordomo del Rey. Preparado para todo, menos para los impuestos de Nuño.' }], 'give:*': [{ say: 'Conserve eso; si tiene algo que decirme, que sea hablando.', who: 'mayordomo' }] } });
  npc('nuno_aud', 'Don Nuño', 'nuno', 'audiencia', [1120, 760], 'left', { talkDistance: 120,
    verbs: { talk: [{ dialogue: 'nuno_aud' }], look: [{ say: 'Don Nuño, de pie con su mejor sombrero, su peor cara y el libro de cuentas bajo el brazo como un escudo.' }], 'give:*': [{ say: 'No acepto nada hasta que acabe la Vista. Después, sí. Con tasa.', who: 'nuno_aud' }] } });
  npc('alfonso_b', 'Alfonso', 'alfonso', 'travesia', [900, 720], 'left', { verbs: { look: [{ say: 'Alfonso, con la pértiga. De pie en la popa, mirando el río como quien mira un negocio.' }], talk: [{ say: 'Cuando acabe la travesía hablamos. El río escucha.', who: 'alfonso_b' }] } });

  // ===================================================== DIÁLOGOS
  const L = D.dialogues;
  L.gil = { npc: 'gil_a', start: [{ if: 'pase_puerta', node: 'pase' }, { node: 'hub' }], nodes: {
    hub: { lines: [['gil_a', '¡Alto! Portazgo: tres dineros, o carta de paso.'], ['gil_b', 'O una carta de paso de las que dan a cambio de tres dineros.']],
      options: [
        { text: '¿Qué es el portazgo?', once: true, next: 'portazgo' },
        { text: '¿Por qué hay una carreta atascada?', if: '!carreta_libre', once: true, next: 'carreta' },
        { text: '¿Quién manda aquí?', once: true, next: 'nuno' },
        { text: 'Ya me voy.', next: 'end' }] },
    portazgo: { lines: [['gil_a', 'El portazgo es lo que pagas por pasar por la puerta.'], ['gil_b', 'Y por mirarla. Y por pensarla.'], ['gil_a', 'Lo de pensarla lo ha inventado hoy Nuño.']], next: 'hub' },
    carreta: { lines: [['gil_a', 'Es la carreta de Yuçaf, el alfarero. Lleva tres días hundida en la rodada.'], ['gil_b', 'Si alguien la sacara, el pobre podría entrar a vender. Y pagar su tasa, claro.'], ['gil_a', 'Yo no la saco: mi trabajo es mirar. Mirar y no ayudar.']], actions: [{ set: 'sabe_carreta' }], next: 'hub' },
    nuno: { lines: [['gil_a', 'Don Nuño de Mala-Cuenta, Alguacil Mayor. Cobra, manda y sella.'], ['gil_b', 'Y a veces se contesta a sí mismo en las cartas.'], ['gil_a', 'Apareces tú y ya le sientes: las cosas raras le atraen como una mosca a un cántaro.']], next: 'hub' },
    pase: { lines: [['gil_a', 'Pase, pase, que lo ha dicho Don Nuño.'], ['gil_b', 'No sé exactamente qué ha dicho, pero ha sido con mucha firmeza.']], next: 'end' } } };

  L.yucaf = { npc: 'yucaf', start: [{ if: '!met_yucaf', node: 'intro' }, { node: 'hub' }], nodes: {
    intro: { lines: [['yucaf', 'Que la paz sea contigo, forastero. Perdona que no te salude como es debido: tengo una carreta clavada en la rodada y un alma clavada en la tasa.'], ['player', 'Puedo ayudar.'], ['yucaf', 'Llevo tres días empujando. Haría falta calzar la rueda con algo y hacer palanca con algo largo.']], actions: [{ set: ['met_yucaf', 'sabe_carreta'] }], next: 'hub' },
    hub: { lines: [['yucaf', '¿En qué puedo servirte?']],
      options: [
        { text: '¿Cómo saco la carreta?', if: '!carreta_libre', next: 'carreta' },
        { text: '¿Quién es Don Nuño?', once: true, next: 'nuno' },
        { text: 'Mira este aparato.', if: 'has:telefono', once: true, next: 'movil' },
        { text: 'Hasta luego.', next: 'end' }] },
    carreta: { lines: [['yucaf', 'Calzar la rueda para que no resbale: busca una cuña. Y una palanca: una viga, una pértiga... lo que tengas.'], ['yucaf', 'Los albañiles dejaron ladrillos y una viga por ahí, al fondo del camino.']], next: 'hub' },
    nuno: { lines: [['yucaf', 'Don Nuño de Mala-Cuenta. Cobra por todo. Una vez tasó mi sombra por ocupar sitio en la calle.'], ['yucaf', 'Pero tiene una debilidad: se ama a sí mismo con una devoción casi religiosa.']], next: 'hub' },
    movil: { lines: [['yucaf', '¿Una tablilla negra? Se parece a un espejo de obsidiana, pero más fino.'], ['player', 'Es un reloj muy caro.'], ['yucaf', 'Pues guárdalo bien. Al que lo vea, Nuño le tasa la curiosidad.']], next: 'hub' } } };

  L.yucaf_alfar = { npc: 'yucaf_alfar', start: [{ if: { all: ['final_listo', '!epilogo_visto'] }, node: 'hub' }, { node: 'hub' }], nodes: {
    hub: { lines: [['yucaf_alfar', 'Bienvenido a mi alfar, amigo. ¿Qué necesitas?']],
      options: [
        { text: '¿Cómo consigo la licencia?', if: { not: 'final_listo' }, next: 'licencia' },
        { text: '¿Qué sello me falta?', if: { not: 'final_listo' }, next: 'faltan' },
        { text: '¿Cuéntame algo del horno?', next: 'horno' },
        { text: 'Luego hablamos.', next: 'end' }] },
    licencia: { lines: [['yucaf_alfar', 'Tres sellos: el mío, que ya tienes; el de la parroquia, que guarda Fray Benito; y el de la alguacilía, que no te dará Nuño por las buenas.'], ['yucaf_alfar', 'Pero recuerda: se ama a sí mismo. Si tuvieras algo que le enseñara su cara...']], next: 'hub' },
    faltan: { lines: [['yucaf_alfar', 'Parroquia: Fray Benito anda con la campana muda desde hace dos días. Pregunta al herrero Lope en la plaza, que se lo llevó a soldar.', '!tiene_sello_parroquia'],
      ['yucaf_alfar', 'La parroquia ya la tienes.', 'tiene_sello_parroquia'], ['yucaf_alfar', 'Alguacilía: el sello del propio Nuño... en la Casa del Portazgo, ya sabes.', '!tiene_sello_alguacil'], ['yucaf_alfar', 'La alguacilía ya la tienes. ¡Eres peligroso!', 'tiene_sello_alguacil']], next: 'hub' },
    horno: { lines: [['yucaf_alfar', 'Es el horno de mi abuelo. Dicen que al caer el sol «respira».'], ['yucaf_alfar', 'Yo solo sé que cuece bien y que nunca falla: un horno honrado.']], next: 'hub' } } };

  L.sancha = { npc: 'sancha', start: [{ node: 'hub' }], nodes: {
    hub: { lines: [['sancha', '¿Pan, hijo? Un dinero. Más tasa por pan: dos. Más tasa por olerlo: uno.']],
      options: [
        { text: 'Deme un pan.', next: 'pan' },
        { text: '¿Sabe algo de Fray Benito?', once: true, next: 'benito' },
        { text: '¿Quién es Don Nuño?', once: true, next: 'nuno' },
        { text: 'Hasta luego.', next: 'end' }] },
    pan: { lines: [['sancha', 'Cuatro dineros.'], ['player', 'No tengo ni uno.'], ['sancha', 'Entonces huele desde ahí: olfatear es gratis. Hasta que Nuño lo decrete.']], next: 'hub' },
    benito: { lines: [['sancha', 'Dos días sin tocar la campana, y yo sin saber cuándo sacar el pan.'], ['sancha', 'Dicen que el badajo se lo llevó Lope, el herrero, a soldar. Y se le olvidó. Como todo.']], actions: [{ set: 'sabe_badajo' }], next: 'hub' },
    nuno: { lines: [['sancha', 'Don Nuño. Tasó mi horno por «producir calor sin licencia». Ahora tengo licencia de calor.'], ['sancha', 'Lo llamo el Tasado. Pero bajito.']], next: 'hub' } } };

  L.lope = { npc: 'lope', start: [{ if: '!met_lope', node: 'intro' }, { node: 'hub' }], nodes: {
    intro: { lines: [['lope', '¿Qué quieres? ¿No ves que estoy en plena crisis de temple?'], ['player', 'Veo un yunque y un mal humor.'], ['lope', 'Eso es lo que tengo. Y sin agua. El pozo está seco y la fuente la guarda Nuño, que cobra por sed.']], actions: [{ set: 'met_lope' }], next: 'hub' },
    hub: { lines: [['lope', 'Dime rápido, que se me enfría el hierro.']],
      options: [
        { text: '¿Tiene el badajo de la campana de Santa María?', if: { all: ['!tiene_badajo', '!tiene_sello_parroquia'] }, next: 'badajo' },
        { text: 'Esto es un cántaro con agua... digamos.', if: 'has:cantaro', next: 'trueque' },
        { text: 'Hasta luego.', next: 'end' }] },
    badajo: { lines: [['lope', 'El badajo. Lo tengo aquí. Lo traje a soldar hace dos semanas y se me olvidó entre tanto martillar.'], ['lope', 'Pero no te lo doy por las buenas: necesito agua para templar la herradura de un mulo. Tráeme un cántaro y te lo cambio.']], actions: [{ set: 'sabe_badajo' }], next: 'hub' },
    trueque: { lines: [['lope', '¿Un cántaro de agua? Ya era hora. Dame, dame.'], ['lope', 'Un cántaro talaverano vidriado, además. Es tan bonito que casi me da pena mojarlo... casi.']],
      actions: LOPE_TRADE_ACT, next: 'end' } } };

  L.pregonero = { npc: 'pregonero', start: [{ node: 'hub' }], nodes: {
    hub: { lines: [['pregonero', '¡Oíd! Soy el pregonero. No me hago responsable de lo que grito.']],
      options: [
        { text: '¿Cómo llego a Don Nuño?', once: true, next: 'nuno' },
        { text: '¿Qué es lo que gritas?', once: true, next: 'grito' },
        { text: 'Adiós.', next: 'end' }] },
    nuno: { lines: [['pregonero', 'En la Casa del Portazgo, a la derecha de la plaza. Pero no se deja ver sin cita.'], ['pregonero', 'Y la cita... es la propia visita. Ya ves, lógica de Nuño.']], next: 'hub' },
    grito: { lines: [['pregonero', 'Lo que me dan por escrito. Hoy: tasa por estornudar, tasa de salud por decir «Jesús» y tasa de reflexión.'], ['pregonero', 'No sé qué es la tasa de reflexión, pero me la han cobrado ya.']], next: 'hub' } } };

  L.benito = { npc: 'benito', start: [{ if: '!met_benito', node: 'intro' }, { node: 'hub' }], nodes: {
    intro: { lines: [['benito', '¿Eh? ¿Quién anda ahí? ¿Una cabra?'], ['player', '¡Un forastero!'], ['benito', '¿Un cabrestero? Bueno, bendito seas igualmente. Aunque no me dejes oír.']], actions: [{ set: 'met_benito' }], next: 'hub' },
    hub: { lines: [['benito', '¿Qué dices, hijo? ¡Habla más alto!']],
      options: [
        { text: 'Necesito el sello de la parroquia.', if: '!tiene_sello_parroquia', next: 'sello' },
        { text: 'Aquí tiene el badajo de la campana.', if: 'has:badajo', next: 'badajo' },
        { text: 'Adiós, Fray Benito.', next: 'end' }] },
    sello: { lines: [['benito', '¿El sello de la perdiz? No, no, hijo: el sello se da con la campana tocada.'], ['benito', '¡Y sin badajo no hay campana! ¡Y sin campana no hay misa! ¡Y sin misa, no hay sello!'], ['benito', 'Se lo llevó el herrero Lope. Dos semanas. ¡Dos! ¡Ah, qué castigo!']], actions: [{ set: 'sabe_badajo' }], next: 'hub' },
    badajo: { lines: [], actions: BENITO_BADAJO, next: 'end' } } };

  L.nuno = { npc: 'nuno_casa', start: [{ if: '!met_nuno', node: 'intro' }, { node: 'hub' }], nodes: {
    intro: { lines: [['nuno_casa', '¡Sin cita! Entrar: 2 dineros. Estar: 3. Haber entrado sin llamar: multa de 10.'], ['player', 'Vengo a pedir mi licencia de forastero.'], ['nuno_casa', '¡Ah! El forastero del espejo negro. Qué placer... cobrarte.']], actions: [{ set: 'met_nuno' }], next: 'hub' },
    hub: { lines: [['nuno_casa', '¿Qué se te ofrece? Pregunta corto, que cada palabra se tasa.']],
      options: [
        { text: 'Necesito el sello de la alguacilía.', if: '!tiene_sello_alguacil', next: 'sello' },
        { text: 'Mire este espejo, Don Nuño.', if: { all: ['has:telefono', '!nuno_ensimismado'] }, next: 'espejo' },
        { text: '¿Podría rebajar las tasas?', once: true, next: 'rebaja' },
        { text: 'Adiós.', next: 'end' }] },
    sello: { lines: [['nuno_casa', 'El sello de la alguacilía. Tasa del sello: 30 dineros. Tasa de la tasa: 12. Tasa por hacer la pregunta: 8.'], ['nuno_casa', 'Y la entrega voluntaria del espejo negro, que por cierto ya es mío.'], ['player', 'No tengo ni un dinero.'], ['nuno_casa', 'Entonces tampoco tendrás sello. Es lo que se llama «lógica administrativa».']], actions: [{ set: 'sabe_sello' }], next: 'hub' },
    rebaja: { lines: [['nuno_casa', '¿Rebajar? ¿Yo? ¡Ja! Eso solo lo he hecho una vez, y me salió caro.']], next: 'hub' },
    espejo: { lines: [], actions: NUNO_ESPEJO, next: 'end' } } };

  L.nuno_aud = { npc: 'nuno_aud', start: [{ node: 'hub' }], nodes: {
    hub: { lines: [['nuno_aud', 'Silencio. La Vista no ha empezado y ya me debes la tasa de espera.']],
      options: [{ text: '¿Está nervioso, Don Nuño?', once: true, next: 'nervios' }, { text: 'Hasta ahora.', next: 'end' }] },
    nervios: { lines: [['nuno_aud', '¿Nervioso yo? Jamás. Solo estoy... calculando... mis derechos.']], next: 'hub' } } };

  const SELLOS3 = { all: ['has:sello_gremio', 'has:sello_parroquia', 'has:sello_alguacil', 'has:bando'] };
  L.mayordomo = { npc: 'mayordomo', start: [{ if: '!met_gutierre', node: 'intro' }, { node: 'hub' }], nodes: {
    intro: { lines: [['mayordomo', 'Soy Don Gutierre, mayordomo del Rey. El Rey marcha a Sevilla y me ha dejado a cargo de que Talavera no se hunda en tasas.'], ['mayordomo', 'Dicen que hay un forastero con un espejo negro. ¿Eres tú?'], ['player', 'Soy yo. Pero es un reloj muy caro.']], actions: [{ set: 'met_gutierre' }], next: 'hub' },
    hub: { lines: [['mayordomo', 'Dime, forastero. Y habla claro: cada palabra tuya la oye media plaza.']],
      options: [
        { text: 'Presento mi licencia de forastero.', if: SELLOS3, next: 'final' },
        { text: 'Pido mi licencia de forastero.', if: { not: SELLOS3 }, next: 'faltan' },
        { text: '¿Qué le parece Don Nuño?', once: true, next: 'opinion' },
        { text: 'Luego vuelvo.', next: 'end' }] },
    faltan: { lines: [['mayordomo', 'Para la licencia hacen falta tres sellos: gremio, parroquia y alguacilía.'], ['mayordomo', 'Te falta el de los Olleros.', '!has:sello_gremio'], ['mayordomo', 'Te falta el de la parroquia.', '!has:sello_parroquia'], ['mayordomo', 'Te falta el de la alguacilía.', '!has:sello_alguacil'], ['mayordomo', 'Y falta el bando de Don Nuño: sin su propio texto, ¿cómo voy a juzgar lo que escribió?', '!has:bando'], ['mayordomo', 'Vuelve cuando los tengas todos, y trae el bando, que quiero leerlo.']], next: 'hub' },
    opinion: { lines: [['mayordomo', 'Un hombre de... mucho celo. De demasiado.'], ['mayordomo', 'He recibido más quejas de él que de la peste.']], next: 'hub' },
    final: { lines: [
      ['mayordomo', 'Tres sellos. Olleros, parroquia y alguacilía. ¿Don Nuño?'],
      ['nuno_aud', '¡Imposible! ¡Falsificación! ¡Ese sello de la alguacilía es... es... idéntico al mío!'],
      ['mayordomo', 'Es el suyo, Don Nuño. Lleva su cántaro roto y su moneda.'],
      ['nuno_aud', '...Ah. Ya lo decía yo: una obra maestra de imitación.'],
      ['player', 'Y según el bando del postigo, artículo tercero: pieza de oro del Alguacil «por las molestias».'],
      ['nuno_aud', '¡Eso lo escribí para... para que NADIE lo consiguiera!'],
      ['mayordomo', '¿Lo escribió usted?'], ['nuno_aud', '...Sí.'], ['mayordomo', '¿Lo firmó?'], ['nuno_aud', '...Sí.'], ['mayordomo', '¿Lo clavó con tachuelas públicas?'], ['nuno_aud', '...Con orgullo.'],
      ['mayordomo', 'Entonces es ley. Pague la pieza de oro, Don Nuño.'],
      ['nuno_aud', '¡Es todo lo que tengo! ¿Y la tasa de pagar?'], ['mayordomo', 'La paga usted. Y por tasar sin licencia de tasar, que he consultado y no tiene, multa de cien dineros.'],
      ['mayordomo', 'Además, cargará los cántaros de la carreta de Yuçaf hasta Toledo. A pie.'], ['nuno_aud', '¡Gil! ¡Gil!'], ['gil_a', '¿Cuál?'], ['nuno_aud', '¡CUALQUIERA!'],
      ['mayordomo', 'Quedas libre, forastero. Y ese espejo negro...'], ['player', 'Es un reloj.'], ['mayordomo', 'Ah, un reloj. Pase usted y buen viaje. Que alguien me cobre una tasa por reírme tanto.']],
      actions: [{ take: 'sello_gremio' }, { take: 'sello_parroquia' }, { take: 'sello_alguacil' }, { take: 'bando' }, { set: ['nuno_derrotado', 'final_listo'] }, { sfx: 'success' }, { rel: ['mayordomo', 3] },
        { note: 'Don Nuño pierde la tasa, la pieza de oro y el sombrero. La plaza entera aplaude. Alguien, discretamente, pide un recibo.' }, { goto: ['alfar', 'from_audiencia'] }], next: 'end' } } };

  // ===================================================== EVENTO FINAL (el horno)
  N.yucaf_alfar.reactions.final_horno = { blocking: true, actions: [
    { say: 'Batería: 1 %. Una foto, tú y yo, Yuçaf.' }, { say: '¿Una foto? ¿Qué es...?', who: 'yucaf_alfar' }, { sfx: 'combine' }, { wait: 0.5 },
    { note: 'FLASH. El horno ruge con un resplandor azul y el mundo se vuelve blanco.' }, { say: 'Adiós, Talavera. Adiós, 1248.' }, { say: 'Y gracias por el cántaro, forastero.', who: 'yucaf_alfar' }, { endLab: true }] };
})(window.E1248 = window.E1248 || {});
