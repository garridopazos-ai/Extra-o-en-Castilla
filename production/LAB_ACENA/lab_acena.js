/* LABORATORIO ACEÑA · dos escenas conectadas (EXTERIOR_ACEÑA ↔ INTERIOR_ACEÑA) sobre el motor G12.
   Arte: exterior en acuarela (art/escenarios/nuevos/acena.jpg), interior con la muela y la puerta iluminada (art/escenarios/acena/bg.webp).
   Personajes: viajero (clips), Durán (clips), Elvira (pose fija recortada de la portada; provisional).
   Secuencia: examinar rueda/tronco fuera → Elvira da la pista → Durán se interpone con el saco (una vez) → fuera, el tronco confirma la pista.
   Todo el progreso vive en banderas: salir y volver a entrar lo conserva. */
(function (E) {
  'use strict';
  const D = E.DATA, S = D.scenes, N = D.npcs, DL = D.dialogues;

  // ----------------------------------------------------------------- ELVIRA (pose fija con respiración y cabeceo al hablar)
  // Recorte de la portada (cabeza a muslos); los pies quedan tras la muela. Ancla = punto de apoyo estimado (7 cabezas).
  const sheetElvira = { frameW: 300, frameH: 716, anchor: [150, 845], cols: 1, baseFacing: 'right', anims: {
    idle_right: { row: 0, frames: 1, fps: 1, breath: true } } };
  D.characters.elvira = { name: 'Elvira', height: 265, speed: 120, hit: [-50, -300, 100, 270], orient: 'lr',
    sprite: { src: 'assets/characters/elvira/pose_portada.webp', sheet: sheetElvira, placeholderOpts: { skin: '#e0aa86', top: '#6f7f3e', apron: '#d9a43a', legs: '#5f6b33' } } };

  // ----------------------------------------------------------------- EXTERIOR_ACEÑA
  S.acena_ext = {
    id: 'acena_ext', name: 'Exterior de la aceña', width: 1600, height: 900, camera: 'fixed',
    ambientSound: { cutoff: 900, vol: 0.14 },
    // escala por perspectiva: el hueco de la puerta mide 150 px con su base en y≈640 → una persona junto a ella ~130 px
    depth: { yFar: 695, sFar: 0.48, yNear: 805, sNear: 0.64 },
    layers: [
      { id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/scenes/acena_ext/bg.jpg', placeholder: 'acena_bg' },
      { id: 'tronco', z: 'back', x: 860, y: 580, w: 150, h: 64, src: 'assets/scenes/acena_ext/tronco.webp', placeholder: 'log', visibleWhen: '!rueda_libre' }
    ],
    ambient: [],
    // sendero: el canal de la rueda (700-1010) y el Tajo quedan por encima y bloquean
    walk: { outer: [[20, 704], [560, 699], [700, 702], [1010, 702], [1201, 690], [1585, 684], [1585, 804], [1201, 800], [561, 793], [20, 790]], holes: [] },
    entries: { default: { x: 140, y: 750, facing: 'right' }, from_int: { x: 1256, y: 712, facing: 'right' } },
    firstEnter: [
      { note: 'LABORATORIO · Exterior de la aceña' },
      { say: 'Una aceña junto al Tajo. La rueda está quieta... y el agua se escapa por los lados sin moverla.' },
      { note: 'Prueba: examina la rueda y el tronco (o entra directamente por la puerta). Menú → Depuración para ver suelo, apoyos y zonas.' }
    ],
    hotspots: [
      { id: 'puerta', name: 'Puerta de la aceña', rect: [1212, 482, 92, 166], walkTo: [1256, 706], exit: { to: 'acena', entry: 'from_ext' },
        verbs: { look: [{ say: 'Una puerta de madera gruesa, entreabierta. Dentro se oye trajín... y a alguien canturreando.' }] } },
      { id: 'rueda', name: 'Rueda', poly: [[795, 405], [975, 405], [985, 520], [975, 650], [795, 650], [790, 520]], walkTo: [900, 712],
        verbs: { look: [{ say: 'La rueda de la aceña, enorme y quieta. El agua del caz pasa de largo sin empujarla.' }],
                 use: [{ say: 'Es una rueda de molino, no un tiovivo. No se mueve a empujones.' }] } },
      { id: 'tronco', name: 'Tronco', rect: [860, 572, 150, 76], walkTo: [935, 712],
        verbs: {
          look: [{ if: { all: ['pista_elvira', '!tronco_confirmado'] },
                   then: [{ say: 'Ahora lo veo con otros ojos: no es un tronco cualquiera que trajo la corriente.' },
                          { say: 'Está calzado contra el eje con una cuña de madera nueva. Y tiene una marca hecha a navaja: un cántaro boca abajo.' },
                          { say: 'Elvira tenía razón. Alguien ha parado esta rueda a propósito.' },
                          { set: 'tronco_confirmado' }, { note: 'LABORATORIO: secuencia completada. Puedes seguir entrando y saliendo para comprobar la continuidad.' }],
                   else: [{ if: 'tronco_confirmado', then: [{ say: 'La cuña nueva, la marca del cántaro boca abajo... Esto no ha sido el río.' }],
                            else: [{ say: 'Un tronco grueso encajado entre los álabes y el muro, junto al eje. Por eso no gira la rueda.' }, { set: 'tronco_visto' }] }] }],
          pick: [{ say: 'Pesa como un buey mojado y está bien encajado. Con las manos no va a salir.' }],
          use: [{ say: 'Si lo empujo desde aquí, me voy yo al caz y el tronco se queda.' }] } },
      { id: 'canal', name: 'Canal de la rueda', poly: [[700, 590], [1010, 600], [1010, 690], [700, 690]],
        verbs: { look: [{ say: 'El caz: el canal que lleva el agua a la rueda. Corre fuerte y frío. Mejor no meter el pie.' }], use: [{ say: 'No pienso meterme en el agua. Ni en este siglo ni en el mío.' }] } },
      { id: 'puente', name: 'Pasarela', rect: [500, 520, 260, 60],
        verbs: { look: [{ say: 'Una pasarela de tablas sobre el caz. Lleva a la otra orilla del canal... fuera de este laboratorio.' }] } },
      { id: 'sacos', name: 'Sacos', rect: [1135, 595, 90, 75], verbs: { look: [{ say: 'Sacos de harina esperando turno. Sin rueda, no hay molienda.' }] } },
      { id: 'barriles', name: 'Barriles', rect: [1330, 565, 145, 90], verbs: { look: [{ say: 'Un cántaro y dos barriles junto a la pared. Agua para beber, que la del caz va al molino.' }] } },
      { id: 'camino', name: 'Camino de la ribera', rect: [0, 690, 70, 115], walkTo: [40, 750],
        verbs: { look: [{ say: 'El camino sigue hacia la ribera. En este laboratorio, aquí se acaba el mundo.' }] } }
    ]
  };

  // ----------------------------------------------------------------- INTERIOR_ACEÑA (arte de la muela con la puerta iluminada)
  const I = S.acena;
  I.name = 'Interior de la aceña';
  I.depth = { yFar: 662, sFar: 0.8, yNear: 885, sNear: 1.0 };   // persona junto a la puerta (hueco 249 px) ≈ 240 px
  I.layers.push({ id: 'muela_frente', z: 'sort', sortY: 678, x: 632, y: 376, w: 272, h: 304, src: 'assets/scenes/acena/muela_frente.webp', placeholder: 'g11_bando' });
  I.entries.from_ext = { x: 1490, y: 712, facing: 'left' };
  I.firstEnter = [{ note: 'LABORATORIO · Interior de la aceña' }];
  I.onEnter = [];
  const salida = I.hotspots.find(h => h.exit);
  const muela = I.hotspots.find(h => h.id === 'muela'); if (muela) muela.rect = [636, 545, 256, 132];   // deja libre a Elvira, detrás
  if (salida) { salida.exit = { to: 'acena_ext', entry: 'from_int' }; salida.name = 'Salir al exterior'; salida.verbs = { look: [{ say: 'La puerta, con la luz del día entrando a chorro. Fuera, la rueda.' }] }; }

  // ----------------------------------------------------------------- PERSONAJES DEL LABORATORIO
  for (const id of Object.keys(N)) if (id !== 'duran') delete N[id];
  D.characters.duran.height = 300;   // a la escala del viajero (hueco de la puerta: 249 px)
  N.duran.start = [1290, 770]; N.duran.facing = 'left'; N.duran.scene = 'acena';
  N.duran.presentWhen = undefined;
  N.duran.routines = [{ steps: [{ wait: 8, anim: 'idle', face: 'left' }, { bark: 'Parada desde el alba. ¡Desde el alba!', every: 40, if: '!gag_duran' }] }];
  N.duran.reactions = [];
  N.duran.verbs = {
    talk: [{ if: 'gag_duran', then: [{ say: 'Tú. Sí, tú. El de la ropa rara. A la rueda, que es lo que hay que mirar.', who: 'duran' }],
             else: [{ say: 'Ahora no, forastero, que tengo la muela parada y el genio igual.', who: 'duran' }] }],
    look: [{ say: 'Durán, el molinero. Enharinado hasta las cejas y con cara de que el día le debe dinero.' }]
  };
  N.elvira = {
    id: 'elvira', name: 'Elvira', character: 'elvira', scene: 'acena', start: [850, 650], facing: 'right',
    verbs: {
      talk: [{ walk: [1045, 756] }, { face: 'left' }, { dialogue: 'elvira' }],
      look: [{ say: 'Una muchacha enharinada, con las llaves de la aceña al cinto. Me mira como quien ya sabe la respuesta.' }],
      'give:*': [{ say: 'Guárdalo, forastero. Aquí lo que falta no se lleva en el bolsillo.', who: 'elvira' }]
    }
  };
  const GAG = [
    { if: '!gag_duran', then: [
      { npcSpeed: ['duran', 190] }, { npcWalk: ['duran', 930, 772] }, { npcFace: ['duran', 'player'] },
      { say: 'Si ya habéis terminado de miraros, ese saco también quiere que alguien le haga caso.', who: 'duran' },
      { say: 'Yo... solo preguntaba por la rueda.' },
      { say: '(bajito) Vuelve cuando lo hayas visto.', who: 'elvira' },
      { set: 'gag_duran' }, { npcSpeed: ['duran', 105] }, { npcWalk: ['duran', 1290, 770] }, { npcFace: ['duran', 'left'] }] }
  ];
  DL.elvira = { npc: 'elvira', start: 'start', nodes: {
    start: { lines: [
        ['elvira', 'Tú no eres de por aquí. Ni de este siglo, me atrevería a decir.', '!elvira_conoce'],
        ['player', '¿Tanto se nota?', '!elvira_conoce'],
        ['elvira', 'Esas costuras no las cose nadie en Castilla. Y miras la muela como si fuera la primera que ves.', '!elvira_conoce'],
        ['elvira', '¿Has vuelto? Bien. Cuéntame.', 'elvira_conoce']],
      actions: [{ set: 'elvira_conoce' }], options: [
        { text: 'Estoy perdido. ¿Dónde estoy?', once: true, next: 'donde' },
        { text: '¿Por qué está parada la muela?', if: '!pista_elvira', next: 'pista' },
        { text: '¿Qué tengo que buscar fuera?', if: { all: ['pista_elvira', '!tronco_confirmado'] }, next: 'repite' },
        { text: 'Tenías razón: alguien calzó el tronco.', if: 'tronco_confirmado', once: true, next: 'confirmado' },
        { text: 'Hasta luego.', next: 'end' }] },
    donde: { lines: [['elvira', 'En la aceña de mi padre, a la orilla del Tajo. Aquello de enfrente es Talavera.'],
      ['elvira', 'Y no te preocupes: los perdidos de verdad no preguntan. Tú todavía tienes arreglo.']], next: 'start' },
    pista: { lines: [
        ['elvira', 'Lo has visto tú también, ¿verdad? Ese tronco junto al eje no lo ha traído la corriente. Fíjate otra vez, pero de cerca.', 'tronco_visto'],
        ['elvira', 'La rueda se paró de golpe. Sal y mira lo que ha quedado encajado junto al eje.', '!tronco_visto']],
      actions: [{ set: 'pista_elvira' }].concat(GAG), next: 'end' },
    repite: { lines: [['elvira', 'Junto al eje de la rueda, fuera. No mires solo el tronco: mira cómo está puesto.']], next: 'start' },
    confirmado: { lines: [['elvira', 'Una cuña y un cántaro boca abajo... Esa marca la conozco. Pero no aquí, que mi padre tiene buen oído.'],
      ['player', '¿Y ahora?'], ['elvira', 'Ahora, forastero, ya somos dos los que lo sabemos.']], next: 'start' }
  } };

  // ----------------------------------------------------------------- PISTAS, MAPA Y COMIENZO
  D.hints = [
    { if: 'tronco_confirmado', obj: 'Laboratorio completado', text: 'Has confirmado la pista de Elvira. Puedes seguir entrando y saliendo para comprobar la continuidad.' },
    { if: 'pista_elvira', obj: 'Examinar el tronco junto al eje', text: 'Elvira te ha mandado mirar junto al eje: sal por la puerta iluminada y examina el tronco de la rueda.' },
    { if: { scene: 'acena' }, obj: 'Hablar con Elvira', text: 'Elvira está detrás de la muela. Tócala para hablar.' },
    { if: { scene: 'acena_ext' }, obj: 'Entrar en la aceña', text: 'Examina la rueda y el tronco si quieres; luego entra por la puerta de la aceña.' }
  ];
  if (E.journey && E.journey.places) {
    const P = E.journey.places;
    for (const k of Object.keys(P)) delete P[k];
    P.acena_ext = [1, 490, 640, 'Aceña de Durán · exterior'];
    P.acena = [2, 530, 600, 'Aceña de Durán · interior'];
  }
  D.start = { scene: 'acena_ext', entry: 'default', inventory: ['telefono'] };
})(window.E1248 = window.E1248 || {});
