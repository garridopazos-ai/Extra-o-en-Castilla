// CHAMELO RC14 · La Corredera del Cristo: el viejo soldado cuenta sus batallas a dos desconocidos a la puerta de la taberna
// «El Miedo», junto a una torre albarrana. Se llega desde la Puerta del Río siguiendo la muralla (poste indicador a la derecha).
// Fondo PROVISIONAL dibujado por código (tools/make_corredera.py) hasta que haya arte definitivo.
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues, T = E.state.test;
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const opt = (text, next, cond) => ({ text, next, if: cond });
  const HIT = [-55, -300, 110, 300];

  // ---------- escena
  S.corredera = {
    id: 'corredera', name: 'Corredera del Cristo · Taberna de El Miedo', width: 1600, height: 900, camera: 'fixed',
    depth: { yFar: 690, sFar: 0.84, yNear: 885, sNear: 1 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/scenes/corredera/bg.jpg' }],
    ambient: [],
    walk: { outer: [[40, 704], [1580, 704], [1580, 880], [40, 880]],
      holes: [{ id: 'tonel', poly: [[1250, 724], [1352, 724], [1352, 752], [1250, 752]] }, { id: 'banco', poly: [[1356, 708], [1514, 708], [1514, 752], [1356, 752]] },
        { id: 'cantaro', poly: [[1520, 704], [1572, 704], [1572, 752], [1520, 752]] }] },
    entries: { default: { x: 150, y: 800, facing: 'right' }, from_puerta: { x: 150, y: 800, facing: 'right' } },
    firstEnter: [{ note: 'Corredera del Cristo. La muralla vieja, una torre albarrana… y una taberna con un nombre muy poco tranquilizador.' },
      say('«El Miedo». Pues buen sitio para quedar con alguien.')],
    hotspots: [
      { id: 'exit_puerta', name: 'Volver a la Puerta del Río', rect: [0, 560, 110, 330], walkTo: [70, 800], exit: { to: 'puerta_rio', entry: 'from_corredera' } },
      { id: 'albarrana', name: 'Torre albarrana', rect: [292, 20, 236, 676], walkTo: [420, 760], verbs: { look: [
        say('Una torre albarrana: adelantada a la muralla y unida a ella por un arco alto.'),
        say('Si el enemigo sube a la muralla, la torre sigue aguantando por su cuenta. Muy de aquí: cada uno a lo suyo, pero juntos.')] } },
      { id: 'arco', name: 'Arco de la torre', rect: [520, 170, 160, 82], verbs: { look: [say('Por ese arco pasaban los defensores de la muralla a la torre. Hoy, solo las palomas. Y sin pagar.')] } },
      { id: 'muralla', name: 'Muralla', rect: [680, 250, 220, 440], verbs: { look: [say('Piedra con hiladas de ladrillo. Ha visto pasar a moros, a cristianos y ahora a un tío con mochila.')] } },
      { id: 'puerta_taberna', name: 'Puerta de El Miedo', rect: [1046, 410, 148, 270], walkTo: [1120, 760], verbs: {
        look: [say('Dentro se oye reír, cantar y a alguien que pide «otra de lo mismo» sin haber pagado la primera.')],
        use: [say('Está hasta arriba. Dentro no cabe ni el miedo: por eso lo cuentan aquí fuera.')], talk: [say('¿Hola? …Me contesta un eructo. Lo tomaré como un «pase».')] } },
      { id: 'letrero', name: 'Letrero de la taberna', rect: [1300, 410, 124, 112], walkTo: [1300, 770], verbs: { look: [
        say('«El Miedo». Debajo, en letra muy pequeña: «Aquí se viene a perderlo. La cuenta, no.»')] } },
      { id: 'placa', name: 'Placa de la calle', rect: [1422, 402, 70, 34], walkTo: [1420, 770], verbs: { look: [say('«Corredera del Cristo». Dicen que aquí se corrían caballos. Hoy se corre de la cuenta.')] } },
      { id: 'rueda_carro', name: 'Rueda de carro', rect: [544, 584, 112, 112], walkTo: [600, 770], verbs: { look: [say('Una rueda de carro sin carro. O un carro con mucha confianza en sí mismo.')], pick: [say('Ya llevo bastantes cosas redondas en la vida.')] } },
      { id: 'tonel', name: 'Tonel', rect: [1250, 636, 100, 116], walkTo: [1230, 790], verbs: { look: [say('Un tonel que hace de mesa. Encima, una jarra y un vaso que nadie reclama.')], pick: [say('Si cojo el vaso, el soldado me pide la cuenta de los tres.')] } }
    ]
  };

  // ---------- reparto: el soldado (de RC13) se muda aquí; dos desconocidos le escuchan
  D.characters.arriero = { name: 'El arriero', height: 282, speed: 170, hit: HIT, orient: 'lr', sprite: { src: null },
    rig: { build: 'fat', skin: '#cf9a74', hair: '#3a2a1a', beard: 'stubble', hat: 'brim', hatCol: '#7a5a34', top: '#6a7a4a', sleeve: '#5a6a3c', legs: '#5a4632', shoes: 'boot', belt: '#3a2a1a', mood: 'grumpy', nose: 'big', seed: 21 } };
  D.characters.peregrina = { name: 'La peregrina', height: 282, speed: 150, hit: HIT, orient: 'lr', sprite: { src: null },
    rig: { build: 'woman', skin: '#e6b496', hat: 'hood', hatCol: '#5a4a3c', top: '#8a6a44', sleeve: '#7a5a3a', cape: '#5a4a3c', legs: '#5a4632', tunicLen: 0.95, mood: 'happy', cheeks: true, stick: true, seed: 22 } };
  Object.assign(N.soldado, { scene: 'corredera', start: [1150, 772], facing: 'right', routines: [] });
  N.soldado.verbs.look = [say('El viejo soldado, con su cota remendada y su lanza sin punta, contando batallas a quien se deje.')];
  N.arriero = { id: 'arriero', name: 'El arriero', character: 'arriero', scene: 'corredera', start: [1400, 790], facing: 'left', talkDistance: 120, routines: [], reactions: {},
    verbs: { talk: [{ dialogue: 'arriero' }], look: [say('Un arriero de paso, con más polvo que camino. Escucha al soldado con cara de haberse equivocado de taberna.')],
      'give:*': [say('Si no es vino o herradura, no me interesa.', 'arriero')] } };
  N.peregrina = { id: 'peregrina', name: 'La peregrina', character: 'peregrina', scene: 'corredera', start: [1500, 808], facing: 'left', talkDistance: 120, routines: [], reactions: {},
    verbs: { talk: [{ dialogue: 'peregrina' }], look: [say('Una peregrina camino de Santiago. Se lo cree todo. Absolutamente todo.')],
      'give:higos': [say('¡Higos! Dios te lo pague. Y si no, te lo pago yo en oraciones, que son más ligeras.', 'peregrina'), { take: 'higos' }],
      'give:*': [say('Gracias, pero llevo lo justo: la concha, el bordón y una fe enorme.', 'peregrina')] } };

  L.arriero = { npc: 'arriero', start: 'hub', nodes: {
    hub: { lines: [['arriero', '¿Tú también vienes a oír al abuelo? Va por la tercera guerra y aún no ha pedido la segunda jarra.']],
      options: [opt('¿De dónde venís?', 'origen'), opt('¿Os creéis lo que cuenta?', 'cree'), opt('Nada, perdonad.', 'end')] },
    origen: { lines: [['arriero', 'De Toledo, con sal. Voy a Ávila con sal. Vuelvo con lana. Mi vida es muy salada y muy lanuda.']], next: 'hub' },
    cree: { lines: [['arriero', 'Me creo la mitad. Lo malo es que cada vez la mitad es distinta.']], next: 'hub' } } };
  L.peregrina = { npc: 'peregrina', start: 'hub', nodes: {
    hub: { lines: [['peregrina', '¡Qué hombre más valiente! ¿Has oído lo del dragón de Jaén?']],
      options: [opt('¿Adónde vais?', 'camino'), opt('¿Un dragón?', 'dragon'), opt('Buen camino.', 'end')] },
    camino: { lines: [['peregrina', 'A Santiago. Por ahora llevo tres semanas y dos ampollas. Dicen que al llegar se te olvidan las ampollas. Las semanas no.']], next: 'hub' },
    dragon: { lines: [['peregrina', 'Una bestia enorme. Al principio era una lagartija, pero él dice que creció mucho durante la historia.']], next: 'hub' } } };

  // ---------- el soldado: ahora en la taberna, con sus aventuras
  const tales = [
    [['soldado', 'En Las Navas, el rey me miró y me dijo: «Tú, el de la lanza».'], ['arriero', 'Llevabais lanza todos.'], ['soldado', 'Pero yo la llevaba con más estilo.']],
    [['soldado', 'En Jaén, una muralla me partió la lanza. Le sostuve la mirada. Aún tiembla.'], ['peregrina', '¿La muralla?'], ['soldado', 'Ahí la tienes. Mírala. Tiembla.']],
    [['soldado', 'En el cerco de Sevilla nos comimos las suelas de las botas. Las mías estaban buenísimas.'], ['arriero', '¿Y ahora qué calzas?'], ['soldado', 'Las del de al lado.']],
    [['soldado', 'Una vez maté un dragón.'], ['peregrina', '¡Un dragón!'], ['arriero', 'Era una lagartija.'], ['soldado', 'Una lagartija enorme. Para ser lagartija.']],
    [['soldado', 'Una torre albarrana aguanta aunque caiga la muralla. Como yo con mi familia.'], ['peregrina', 'Qué bonito.'], ['arriero', 'Qué triste.']],
    [['soldado', 'El miedo, amigos, es como el vino de esta casa: el primer trago asusta y luego te acostumbras.'], ['arriero', 'Por eso se llama El Miedo.'], ['soldado', 'No. Se llama así por la cuenta.']]
  ];
  const tellNode = i => ({ lines: [['soldado', '¿Una aventura? Siéntate, paisano. Bueno, de pie, que el banco es del arriero.']].concat(tales[i]), next: 'hub' });
  L.soldado = { npc: 'soldado', start: [{ if: '!soldado_conocido', node: 'intro' }, { node: 'hub' }], nodes: {
    intro: { lines: [['soldado', '¡Alto! ¿Quién va?'], ['player', 'Un… forastero. Desarmado. Y con hambre.'],
      ['soldado', 'Perdona, paisano. Treinta y seis años de guerra y todavía le doy el alto a las palomas.'],
      ['soldado', 'Arrímate, que estaba contándoles a estos dos desconocidos cómo gané yo solo la batalla de Las Navas.'],
      ['arriero', 'Ayer la ganó con su primo.'], ['soldado', 'Mi primo se fue a mear justo al principio.']], actions: [{ set: 'soldado_conocido' }], next: 'hub' },
    hub: { lines: [['soldado', '¿Qué se te ofrece?']],
      options: [opt('Contadnos una aventura.', 'tale'), opt('¿Quién sois?', 'quien'), opt('¿No vigilabais la campana de Santa María?', 'campana'),
        opt('¿Qué significan los toques de campana?', 'toques'), opt('¿Y la punta de vuestra lanza?', 'lanza'), opt('¿Qué sabéis de Don Nuño?', 'nuno'), opt('Nada, gracias.', 'adios')] },
    tale: { lines: [], actions: [{ rc14: 'tale' }], next: tales.map((_, i) => ({ if: 'cuento_' + i, node: 't' + i })).concat([{ node: 't0' }]) },
    t0: tellNode(0), t1: tellNode(1), t2: tellNode(2), t3: tellNode(3), t4: tellNode(4), t5: tellNode(5),
    quien: { lines: [['soldado', 'Soldado del rey. Estuve en Las Navas de Tolosa, en el año doce. Era joven, tenía la lanza entera y todos los dientes.'],
      ['soldado', 'Ahora vuelvo del cerco de Sevilla: el rey Fernando sigue allí, apretando. A mí me mandaron a casa por viejo.']], next: 'hub' },
    campana: { lines: [['soldado', 'La vigilaba, sí. Me echaron por darle el alto a las palomas. Y porque Lope se llevó el badajo «a soldar» delante de mis narices.'],
      ['soldado', 'Le di el alto. Me dio los buenos días. Empate.']], next: 'hub' },
    toques: { lines: [['soldado', 'Uno, se abren los puestos. Dos, se recoge. Tres, todo el mundo a la Vista, y allí hasta el alguacil tiene que dar la cara.'],
      ['soldado', 'En mi tiempo, tres toques era «¡a las armas!». Ahora es «¡a los papeles!».']], next: 'hub' },
    lanza: { lines: [['soldado', 'Se partió en Jaén, contra una muralla muy terca. La punta se la quedó la muralla; el palo, yo. Es más fiel que muchos.']], next: 'hub' },
    nuno: { lines: [['soldado', 'Nuño no ha visto una batalla en su vida. Cuando sonaban los cuernos, él contaba los carros de la intendencia… y les ponía tasa.'],
      ['soldado', 'Si alguna vez lo pillas en un renuncio, pídelo en Vista pública. Delante de todos, hasta los sinvergüenzas se ponen derechos.']], next: 'hub' },
    adios: { lines: [['soldado', 'Circula, paisano. Y si ves a Nuño, dile que la guerra se hace con hierro, no con tasas.']], next: 'end' } } };

  // ---------- Puerta del Río: la ronda de la muralla lleva a la Corredera (poste indicador a la derecha)
  const PR = S.puerta_rio;
  PR.layers.push({ id: 'poste_corredera', z: 'back', x: 1955, y: 414, w: 260, h: 240, src: 'assets/scenes/puerta_rio/poste_corredera.png' });
  PR.walk.outer = [[80, 650], [1950, 650], [2170, 760], [2170, 860], [80, 860]];
  PR.entries.from_corredera = { x: 2100, y: 815, facing: 'left' };
  PR.hotspots.push({ id: 'exit_corredera', name: 'Ronda de la muralla: Corredera del Cristo', rect: [1960, 420, 240, 460], walkTo: [2140, 815], exit: { to: 'corredera', entry: 'from_puerta' } });

  // ---------- acción de guion: contar la siguiente aventura (rota entre las seis)
  E.rc14 = {
    act(a, G) {
      if (a === 'tale') { const v = G.state.vars, f = G.state.flags; const i = (v.soldado_cuento || 0) % tales.length; v.soldado_cuento = (v.soldado_cuento || 0) + 1;
        tales.forEach((_, k) => { delete f['cuento_' + k]; }); f['cuento_' + i] = true; }
    }
  };

  // ---------- tertulia: cuando no hablas con nadie, el soldado sigue contando y los desconocidos le contestan
  let ti = 0, step = 0, tNext = 5;
  function tick(G, dt) {
    if (!G.S || G.S.def.id !== 'corredera') { step = 0; tNext = 5; return; }
    if (G.runner.busy || G.dialogue.active || G.ui.overlay || G.ui.notes.length || G.transitioning) { tNext = Math.max(tNext, 4); return; }
    if (G.ui.bubbles.some(b => !b.done && (b.blocking || !b.tert))) return;
    tNext -= dt; if (tNext > 0) return;
    const conv = tales[ti % tales.length], line = conv[step], a = G.npc(line[0]);
    let dur = 3;
    if (a) { const b = G.ui.say(a, line[1], false); b.bark = true; b.tert = true; b.dur = dur = Math.max(2.8, 1.6 + line[1].length / 15); }
    step++;
    if (step >= conv.length) { step = 0; ti++; tNext = dur + 16; } else tNext = dur + 0.5;
  }
  const base = E.rc07 && E.rc07.install;
  if (base) E.rc07.install = G => {
    base(G);
    const draw0 = E.scene.draw;
    E.scene.draw = (ctx, Sc, G2) => { draw0(ctx, Sc, G2); if (!G.paused) tick(G, Math.min(0.05, G.lastFrameDt || 0.016)); };
  };
})(window.E1248);
