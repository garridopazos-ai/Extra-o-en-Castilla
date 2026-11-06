// Trama «El juglar que faltaba» (tomada de 1248_LUNA_EL_JUGLAR_RC01, adaptada a G11 RC07): se aplica encima de g11_content.js
/* 1248 · El juglar que faltaba · guion y puzles */
(function (E) {
  'use strict';
  const { scenes: S, npcs: N, dialogues: L, items: I } = E.DATA;
  const say = (who, text) => ({ who, say: text });
  const open = id => [{ dialogue: id }];
  const opt = (text, next, condition) => ({ text, next, if: condition });
  const at = (scene, id) => S[scene].hotspots.find(h => h.id === id);

  // Cada victoria hace que la ciudad anuncie una versión un poco más grande.
  S.ribera.firstEnter = [
    { note: 'Ribera del Tajo · Talavera, 1248' },
    { say: 'Mi móvil dice «Has llegado». Me gustaría saber adónde.' },
    { say: 'Vale. Respira. Talavera está allí enfrente, al otro lado del río.' },
    { note: 'OBJETIVO: llegar a Talavera. Si te atascas, toca «?». El mapa (arriba a la derecha) te dice dónde estás.' }
  ];
  I.telefono.look = [{ say: 'Cuatro por ciento. Sin señal. Todavía tengo luz, cámara y un espejo cada vez que lo apago.' }];
  N.duran.reactions.rueda_liberada.actions = [
    { give: 'saco' }, { set: 'duran_dio_saco' },
    say('duran', '¡La rueda! ¿Cómo lo has hecho?'),
    { say: 'Con una pértiga.' },
    say('duran', 'Si te preguntan, con una sola mano. Toma harina. Y ahora el camino de la barca ya estará seco.')
  ];
  I.saco.look = [{ say: 'Harina de Durán. Deja marca hasta en el hilo más fino.' }];

  // Alfonso ofrece una prueba de oficio, además de su tarifa original.
  for (const id of ['alfonso', 'alfonso_b']) N[id].name = 'Alfonso el Que Sabe';
  N.alfonso.verbs.look = [{ say: 'Alfonso el Que Sabe. Lo primero que sabe es quién le debe dinero.' }];
  N.alfonso.verbs['give:saco'] = [
    { take: 'saco' }, { set: 'saco_entregado' },
    say('alfonso', '¡Por fin paga Durán! La harina cruza gratis. Tú, por una moneda.'),
    { if: 'pagado', then: [{ set: 'barca_libre' }] }
  ];
  L.alfonso = { npc: 'alfonso', start: [{ if: 'barca_libre', node: 'listo' }, { node: 'reto' }], nodes: {
    listo: { lines: [['alfonso', 'Sube. Y si alguien pregunta, la barca ha llegado puntual.']], next: 'end' },
    reto: { lines: [['alfonso', 'Un dinero y alguien que responda por ti. A mis tripulantes los llevo gratis.']], options: [
      opt('¿Y cómo se entra en tu tripulación?', 'prueba'),
      opt('¿Cuánto cuesta llevar este saco?', 'carga', 'has:saco'),
      opt('Voy a mirar el amarre.', 'end')
    ] },
    prueba: { lines: [['alfonso', 'El cabo se ha quedado en la argolla de fuera. Suéltalo desde aquí y el viaje es tuyo.'],
      ['player', '¿Y si me caigo?'], ['alfonso', 'Entonces el viaje de vuelta también.']], next: 'end' },
    carga: { lines: [['alfonso', 'El saco va gratis. A él no le tengo que explicar dónde sentarse.']], next: 'end' }
  } };
  const barca = at('embarcadero', 'barca');
  barca.verbs.look = [{ say: 'El cabo de amarre está enganchado en una argolla. Un lazo largo llegaría sin pisar el agua.' }];
  barca.verbs['use:pertiga'] = [{ say: 'Llego con la pértiga, pero necesito un lazo para enganchar el cabo.' }];
  barca.verbs['use:pertiga_lazo'] = [{ if: '!barca_libre', then: [
    { sfx: 'combine' }, { set: 'barca_libre' },
    { say: 'El cabo, fuera. Y yo, seco.' },
    say('alfonso', 'Durán dice que domaste un molino y a mí me acabas de ganar una apuesta. Sube antes de que te contrate.')
  ], else: [{ say: 'La barca ya está lista para cruzar.' }] }];
  barca.verbs.use = [{ if: 'barca_libre', then: [{ goto: ['travesia', 'start'] }], else: [
    say('alfonso', 'Si buscas pasaje gratis, libera el amarre sin mojarte. Desde el embarcadero se ve la argolla.')
  ] }];
  S.travesia.onEnter = [{ if: '!cruzado', then: [
    { wait: .5 },
    say('alfonso_b', 'Hay mercado y falta el juglar. Si te preguntan, tú eres el de las maravillas.'),
    { say: '¿Y qué sé hacer?' },
    say('alfonso_b', 'Eso pregúntaselo a Durán. Según él, ayer el Tajo iba al revés.'),
    { set: ['cruzado', 'aviso_nuno'] }
  ] }, { goto: ['puerta_rio', 'from_travesia'] }];

  // Puerta del Río: dos guardias y dos condiciones incompatibles.
  N.gil_a.name = 'Gil del Paso';
  N.gil_b.name = 'Gil del Peso';
  N.gil_a.verbs = { ...N.gil_a.verbs, look: [{ say: 'Gil del Paso. Si pone «pase» en un papel, ya ha hecho su trabajo.' }] };
  N.gil_b.verbs = { ...N.gil_b.verbs, look: [{ say: 'Gil del Peso. Lo pesa todo. Sobre todo, las palabras.' }] };
  N.gil_a.routines = [{ steps: [{ wait: 8 }, { bark: '¡Los que entren, a este lado!', every: 28 }] }];
  N.gil_b.routines = [{ steps: [{ wait: 9 }, { bark: '¡Los que ya estén dentro, al otro!', every: 34 }] }];
  N.nuno_puerta.start = [1040, 770];
  N.nuno_puerta.presentWhen = '!nuno_se_fue';
  N.nuno_puerta.reactions = {};
  N.nuno_puerta.verbs.talk = [say('nuno_puerta', '¿La función? Ya está pagado el premio. Yo mismo lo estoy custodiando en mi bolsillo.')];
  S.puerta_rio.firstEnter = [
    say('gil_a', '¡Vos, el de las botas blancas! ¿Sois el artista?'),
    { say: 'Alfonso, ¿quieres explicarles que…?' },
    { say: 'La barca ya se va.' }
  ];
  at('puerta_rio', 'tarifas').name = 'Reglamento del postigo';
  at('puerta_rio', 'tarifas').verbs.look = [
    { set: 'regla_postigo' },
    { note: 'ARTISTAS · Entrada por el postigo. Demostración en la tarima de la plaza.' }
  ];
  at('puerta_rio', 'exit_plaza').exit.deny = [
    say('gil_a', 'Yo tengo orden de dejar entrar artistas.'),
    say('gil_b', 'Y yo tengo orden de comprobar que lo son. Hablad con nosotros o leed el reglamento.')
  ];
  L.gil = { npc: 'gil_a', start: [{ if: 'pase_puerta', node: 'pase' }, { node: 'hub' }], nodes: {
    hub: { lines: [['gil_a', 'Dejo entrar al artista después de ver la función.'],
      ['gil_b', 'La función se hace dentro. Para eso me han dado un banco.']],
      options: [
        opt('¿Y si hago un truco aquí mismo?', 'aqui'),
        opt('¿Cuál de los dos se llama Gil?', 'gil'),
        opt('Abrid y os guardo sitio.', 'sitio'),
        opt('Para demostrarlo, primero me tenéis que dejar entrar.', 'pasa', 'regla_postigo'),
        opt('Voy a leer el reglamento.', 'end')
      ] },
    aqui: { lines: [['gil_b', 'Si sale mal, os dejo fuera. Si sale bien, yo tengo un problema: lo he visto antes de que empiece.']], next: 'hub' },
    gil: { lines: [['gil_a', 'Yo.'], ['gil_b', 'Ha preguntado cuál, no cuántos.'], ['gil_a', 'Poneos de acuerdo con el tablón. Ahí está escrito lo de la tarima.']], next: 'hub' },
    sitio: { lines: [['gil_b', 'Buen intento. Me sé la letra pequeña: estaré aquí vigilando la puerta que habéis cruzado.']], next: 'hub' },
    pasa: { lines: [['gil_a', 'Tiene razón. Si lo dejo fuera, estoy impidiendo la demostración.'],
      ['gil_b', 'Y si entro a verla, estoy dejando la puerta sola. Otra vez me quedo sin función.'],
      ['nuno_puerta', '¡Paso al artista! He puesto una Pieza del Rey para la función. Quien la cancele paga.'],
      ['player', 'Muy generoso.'], ['nuno_puerta', 'Sé lo que hago. Ya he encargado que pongan «ausente» al lado de vuestro nombre.']],
      actions: [{ set: ['nuno_conoce', 'pase_puerta'] }, { sfx: 'success' },
        { npcWalk: ['nuno_puerta', 1470, 695] }, { set: 'nuno_se_fue' }], next: 'end' },
    pase: { lines: [['gil_b', 'Si preguntan, os dejé entrar yo.'], ['gil_a', 'Si cobran, fui yo.']], next: 'end' }
  } };

  const bando = at('puerta_rio', 'bando');
  bando.name = 'Cartel firmado de la función';
  bando.rect = [1250, 400, 66, 110];
  const rules = 'Quien suspenda la función pagará la Pieza del Rey. Las disputas se juzgarán en la plaza tras tres toques de campana.';
  bando.verbs.look = [{ note: rules }];
  bando.verbs.pick = [{ give: 'bando' }, { set: ['bando_leido', 'bando_cogido'] },
    { note: 'Bajo «Artista ausente» figura la marca del alguacil: un cántaro boca abajo.' }];
  I.bando.name = 'Cartel de la función';
  I.bando.short = 'Cartel';
  I.bando.look = [{ note: rules }, { say: 'La cancelación está sellada con un cántaro boca abajo.' }];
  N.yucaf.reactions.carreta_liberada.actions = [
    { give: 'cantaro' }, { set: 'yucaf_recompensa' },
    say('yucaf', 'Lo has sacado sin romper mi mejor cántaro. Llévatelo antes de que alguien me lo compre.'),
    say('yucaf', 'En el alfar guardo algo más raro. El horno se enciende solo cuando se va el sol. Pásate si te dejan.')
  ];
  I.cantaro.look = [{ say: 'Si soplo por la boca suena como una paloma enfadada. Un cántaro de Yuçaf, con todas sus plumas.' }];

  // Plaza: Lope protege su truco y pone la campana en juego.
  S.plaza.firstEnter = [
    say('pregonero', '¡Esta tarde, el Hombre que Hizo Retroceder el Tajo!'),
    { say: 'Era un tronco. Y se movió unos veinte centímetros.' },
    say('pregonero', '¡Veinte centímetros menos de río para todos!')
  ];
  N.lope.name = 'Maese Lope de Pega';
  N.lope.routines = [{ steps: [{ wait: 6, anim: 'work' }, { bark: '¡Una herradura que vuelve cuando la llamo! ¡Un dinero por verlo!', every: 29 }] }];
  N.lope.verbs = {
    talk: open('lope'),
    look: [{ say: 'Lope de Pega. Le dieron el nombre por sus reparaciones. Él dice que es por el teatro.' }],
    'give:cantaro': [say('lope', 'Bonita jarra. Yo no cambio mi número por cerámica, por mucho que le silbes.')],
    'give:telefono': [say('lope', 'Apunta esa luz a mi cara si quieres. Al banco, ni se te ocurra.')]
  };
  I.badajo.name = 'La Lengua de Santa María';
  I.badajo.short = 'La Lengua';
  I.badajo.look = [{ say: 'El badajo que Lope apostó. Sin él, la campana no puede convocar la Vista.' }];
  const wonLope = { any: ['lope_derrotado', 'has:badajo', 'campana_arreglada'] };
  const winLope = [
    { set: ['lope_derrotado', 'tiene_badajo'] }, { give: 'badajo' }, { sfx: 'success' }
  ];
  L.lope = { npc: 'lope', start: [{ if: wonLope, node: 'fin' }, { node: 'reto' }], nodes: {
    reto: { lines: [['lope', '¡La herradura ama a su amo! Digo «ven» y vuelve a mi mano.'],
      ['lope', 'Averigua cómo lo hago y te llevas la Lengua de Santa María. Una adivinanza por cabeza.']],
      options: [
        opt('¿La has amaestrado desde pequeña?', 'animal'),
        opt('¿Hay un imán bajo el banco?', 'iman'),
        opt('La llamas con la boca. La traes con el hilo.', 'hilo', 'hilo_visto'),
        opt('Quiero ver el banco de cerca.', 'end')
      ] },
    animal: { lines: [['lope', 'Sí. De potrilla era un clavo. ¿Quieres mirar el banco o seguir hablando de su infancia?']], next: 'end' },
    iman: { lines: [['lope', 'Bonita teoría. ¿Y por qué se mueve primero la punta de mi manga?'], ['lope', 'Olvida que he dicho eso.']], next: 'end' },
    hilo: { lines: [['lope', '¡Ese hilo es para que no se me pierda la herradura!'],
      ['player', 'Qué alivio. Pensé que era para que no se te perdiera el público.'],
      ['lope', 'Llévate la Lengua. Y a la campana le dices que estuve ensayando.']],
      actions: winLope, next: 'end' },
    fin: { lines: [['lope', 'Mañana estreno otro número. Un martillo que martillea solo. Ya tengo al aprendiz debajo del banco.']], next: 'end' }
  } };
  const showThread = [{ if: 'hilo_visto', then: [{ say: 'El banco ya ha confesado.' }], else: [
    { set: 'hilo_visto' }, { sfx: 'combine' },
    { note: 'Aparece un hilo fino entre la herradura y la manga de Lope.' }
  ] }];
  S.plaza.hotspots.push({
    id: 'banco_lope', name: 'Banco del truco de Lope', rect: [932, 590, 121, 103], walkTo: [998, 762],
    verbs: {
      look: [{ if: 'hilo_visto', then: [{ say: 'El hilo va de la herradura a su manga. Que me explique otra vez lo de llamarla.' }],
        else: [{ say: 'Algo roza la madera cuando Lope mueve la mano. Con luz de lado, o un poco de harina, podría ver qué es.' }] }],
      'use:telefono': showThread,
      'use:saco': showThread
    }
  });
  N.sancha.name = 'Doña Sancha Panza';
  N.sancha.routines = [{ steps: [{ wait: 8, anim: 'work' }, { bark: '¡Pan de hoy! ¡El de ayer ya tiene otro oficio!', every: 34 }] }];
  L.sancha = { npc: 'sancha', start: [{ if: { all: ['!vista_convocada', 'pan_reabierto'] }, node: 'reapertura' },
    { if: { all: ['!vista_convocada', 'pan_cerrado'] }, node: 'cierre' }, { node: 'hub' }], nodes: {
    reapertura: { lines: [['sancha', 'Has abierto el mercado dos veces. Ahora el pan de esta mañana tiene que ser de ayer.']], next: 'hub' },
    cierre: { lines: [['sancha', 'Lo de cerrar por un toque tuyo va a constar en mis memorias. Las estoy escribiendo en una hogaza.']], next: 'hub' },
    hub: { lines: [['sancha', '¿Eres el de las maravillas? Hoy llevo dos hornadas esperando la campana. Me vendría bien una.']],
      options: [opt('¿Qué pasa cuando suena la campana?', 'toques'), opt('¿Qué oficio tiene el pan de ayer?', 'pan'), opt('Voy a buscar la campana.', 'end')] },
    toques: { lines: [['sancha', 'Con un toque, abro el puesto. Con dos, recojo. Con tres, hasta Nuño tiene que acudir a la Vista.'],
      ['sancha', 'Esto último lo sé porque la última vez vino en zapatillas.']], next: 'end' },
    pan: { lines: [['sancha', 'Aguanta la puerta. El de anteayer aguanta la casa.']], next: 'end' }
  } };
  N.pregonero.name = 'Per de la Voz';
  N.pregonero.routines = [
    { when: { all: ['lope_derrotado', '!vista_convocada'] }, steps: [{ wait: 8 }, { bark: '¡Ha devuelto la lengua a la campana! ¡La campana no ha querido hacer declaraciones!', every: 31 }] },
    { when: 'vista_convocada', steps: [{ wait: 5 }, { bark: '¡Tres toques! ¡La Vista comienza! ¡Los que pagaron para sentarse, de pie!', every: 24 }] },
    { steps: [{ wait: 5 }, { bark: '¡El Hombre del Río! ¡Aplauso voluntario, presencia obligatoria!', every: 25 }] }
  ];
  L.pregonero = { npc: 'pregonero', start: 'hub', nodes: {
    hub: { lines: [['pregonero', 'Per de la Voz. A mí me pagan por palabra, pero si grito cuenta doble.']],
      options: [opt('¿Quién te dijo que hice retroceder el río?', 'rio'), opt('¿Qué pasa con mi función?', 'acto'), opt('Hasta luego.', 'end')] },
    rio: { lines: [['pregonero', 'Alfonso dijo «sacó un tronco». Yo tengo que vender las localidades del fondo.']], next: 'end' },
    acto: { lines: [['pregonero', 'Nuño la tachó de la lista antes de que llegaras. Si quieres discutirlo en público, reúne a la plaza con tres toques.']], next: 'end' }
  } };

  // La campana se toca con intención. Una señal equivocada tiene una respuesta, nunca penalización.
  N.benito.name = 'Fray Benito Tocaqueda';
  N.benito.routines = [{ steps: [{ wait: 5, act: 'vigilando la cuerda' }] }];
  const repairBell = [{ if: { all: ['has:badajo', '!campana_arreglada'] }, then: [
    { take: 'badajo' }, { set: 'campana_arreglada' }, { sfx: 'combine' },
    say('benito', 'Ahí está su Lengua. Ahora tira de la cuerda y piensa bien cuántos toques necesitas.')
  ], else: [say('benito', 'Ya está montada. Le falta que alguien tire de la cuerda.')] }];
  N.benito.verbs['give:badajo'] = repairBell;
  const bell = at('iglesia', 'campana');
  bell.default = 'use';
  bell.verbs = {
    look: [{ if: 'campana_arreglada', then: [{ say: 'La cuerda está lista. Un toque abre el mercado, dos lo cierran, tres llaman a la Vista.' }],
      else: [{ say: 'La campana tiene cuerda pero le falta la Lengua. Lope la usa como apuesta en la plaza.' }] }],
    use: [{ if: 'campana_arreglada', then: open('toque'), else: [{ say: 'Tiro de la cuerda. La campana no tiene nada que decir hasta que recupere su badajo.' }] }],
    'use:badajo': repairBell
  };
  S.iglesia.hotspots.push({
    id: 'cuerda_campana', name: 'Cuerda de Santa María', rect: [222, 222, 76, 440],
    walkTo: [260, 700], default: 'use', verbs: bell.verbs
  });
  L.benito = { npc: 'benito', start: 'hub', nodes: {
    hub: { lines: [['benito', 'Tocaqueda. Puedo despertar a todo Talavera y ninguno sabe dónde vivo.']],
      options: [
        opt('Lope me ha dado la Lengua.', 'montar', 'has:badajo'),
        opt('¿Qué señal convoca la Vista?', 'senales'),
        opt('Hasta luego.', 'end')
      ] },
    montar: { actions: repairBell, next: 'end' },
    senales: { lines: [['benito', 'Uno: abren los puestos. Dos: guardan la mercancía. Tres: todo el mundo a la Vista, incluido el alguacil.'],
      ['benito', 'Con cuatro vendría mi superior. A nadie le conviene.']], next: 'end' }
  } };
  const ring = count => Array.from({ length: count }, () => [{ sfx: 'campana' }, { wait: .43 }]).flat();
  L.toque = { npc: 'benito', start: [{ if: 'vista_convocada', node: 'hecho' }, { node: 'hub' }], nodes: {
    hub: { options: [
      { ...opt('Dar un toque', 'uno'), say: false },
      { ...opt('Dar dos toques', 'dos'), say: false },
      { ...opt('Dar tres toques', 'tres'), say: false },
      { ...opt('Dejar la cuerda', 'end'), say: false }
    ] },
    uno: { actions: [...ring(1), { set: 'pan_reabierto' }, { unset: 'pan_cerrado' }, say('benito', '¡Abierto el mercado! Sancha acaba de sacar el mismo pan por segunda vez.')], next: 'hub' },
    dos: { actions: [...ring(2), { set: 'pan_cerrado' }, { unset: 'pan_reabierto' }, say('benito', '¡Cierre! Acabas de mandar a comer a media Talavera. Prueba con los que quieres reunir.')], next: 'hub' },
    tres: { actions: [...ring(3), { set: 'vista_convocada' },
      say('benito', 'Tres. Hasta Nuño tiene que ir a la Vista. Ahora procura que abra la boca tanto como la bolsa.')], next: 'end' },
    hecho: { lines: [['benito', 'Ya están en camino. Si quieres repetir, ensaya con un cascabel.']], next: 'end' }
  } };

  // El sello se gana al hacer que el rival abandone su mesa.
  const portrait = [
    { if: 'sello_cogido', then: [{ say: 'Ya he conseguido el sello. Me guardo la batería para el regreso.' }],
      else: [{ if: 'nuno_ensimismado', then: [say('nuno_casa', 'No toques el retrato. Estoy consiguiendo que no se me vea el lado de cobrar.')],
        else: [
          { npcHold: 'nuno_casa' }, { npcWalk: ['nuno_casa', 735, 778] },
          { npcFace: ['nuno_casa', 'left'] }, { set: 'nuno_ensimismado' }, { npcRelease: 'nuno_casa' },
          say('nuno_casa', '¡Ah! ¡Al fin un retrato que me hace justicia! Que nadie se mueva. Sobre todo yo.')
        ] }] }
  ];
  S.portazgo.firstEnter = [{ say: 'Detrás de esa mesa hay un sello. Delante, todo Don Nuño.' }];
  N.nuno_casa.routines = [
    { when: 'nuno_ensimismado', steps: [{ wait: 6, face: 'left' }, { bark: 'Retrato oficial. Sí, oficial suena más caro.', every: 18 }] },
    { steps: [{ wait: 5, anim: 'work', face: 'left' }] }
  ];
  N.nuno_casa.verbs['give:telefono'] = [say('nuno_casa', 'Si quieres retratarme, pon el espejo en el atril. Desde tu altura salgo con una sola barbilla.')];
  L.nuno = { npc: 'nuno_casa', start: 'hub', nodes: {
    hub: { lines: [['nuno_casa', 'He anulado tu función por ausencia. Que estés aquí es una cuestión de perspectiva.']],
      options: [
        opt('El cartel lleva vuestro sello.', 'sello', 'has:bando'),
        opt('Puedo haceros un retrato oficial.', 'retrato', '!sello_cogido'),
        opt('Volveré con otra perspectiva.', 'end')
      ] },
    sello: { lines: [['nuno_casa', 'El cántaro boca abajo es mío. Lo mandé poner así porque nadie más se atrevía a firmar al revés.']], next: 'end' },
    retrato: { lines: [['nuno_casa', 'Desde el atril, por favor. Y que salga el lado que sabe leer.']], next: 'end' }
  } };
  S.portazgo.hotspots.push({
    id: 'atril_nuno', name: 'Atril del retrato', rect: [469, 466, 124, 214], walkTo: [580, 775],
    verbs: {
      look: [{ say: 'Un atril vacío. Desde aquí solo se ve el perfil de quien se coloque lejos de la mesa.' }],
      'use:telefono': portrait
    }
  });
  const seal = at('portazgo', 'sello');
  seal.name = 'Sello del cántaro invertido';
  seal.rect = [1188, 644, 83, 59];
  seal.verbs = {
    look: [{ say: 'El sello tiene un cántaro boca abajo, igual que la marca junto a «Artista ausente».' }],
    pick: [{ if: 'nuno_ensimismado', then: [
      { give: 'sello_alguacil' }, { set: ['sello_cogido', 'tiene_sello_alguacil'] },
      { say: 'Sello al zurrón. Y recojo el móvil antes de que Nuño le ponga marco.' },
      { unset: 'nuno_ensimismado' }, { npcHold: 'nuno_casa' },
      { npcWalk: ['nuno_casa', 1050, 770] }, { npcRelease: 'nuno_casa' },
      say('nuno_casa', '¿Ya está? Cuando acabe el juicio quiero dos copias. Una para cada lado bueno.')
    ], else: [say('nuno_casa', 'Las manos a la vista. Sobre todo la que estaba a punto de hacerme perder dinero.')] }]
  };
  I.sello_alguacil.name = 'Sello del cántaro invertido';
  I.sello_alguacil.short = 'Sello de Nuño';
  I.sello_alguacil.look = [{ say: 'Un cántaro boca abajo. Es la misma marca que hay en la cancelación del cartel.' }];

  // Vista: el jugador monta la demostración pieza a pieza.
  N.mayordomo.name = 'Don Gutierre de Buen Oído';
  N.pregonero_vista = {
    ...N.pregonero, id: 'pregonero_vista', scene: 'audiencia', start: [430, 778],
    presentWhen: 'vista_convocada', routines: [], verbs: {
      talk: [say('pregonero_vista', 'No temo declarar. Temo que al declarar no me oigan los de atrás.')]
    }
  };
  const vista = at('plaza', 'exit_audiencia');
  vista.exit.when = 'vista_convocada';
  vista.exit.deny = [{ say: 'La tarima está vacía. Los tres toques de Santa María convocan la Vista.' }];
  S.audiencia.firstEnter = [
    say('pregonero_vista', '¡Haced sitio! ¡Empieza el número! ¡Por ahora nadie sabe cuál es!')
  ];
  at('audiencia', 'tarima').default = 'use';
  at('audiencia', 'tarima').verbs.use = open('mayordomo');
  N.nuno_aud.verbs.talk = [say('nuno_aud', 'Si alguien pregunta, tú estás ausente. Y si lo preguntas tú, también.')];
  I.pieza_rey = {
    name: 'La Pieza del Rey', short: 'Pieza del Rey',
    look: [{ say: 'Lo más raro que he visto en Talavera. Una moneda que ha salido del bolsillo de Don Nuño.' }]
  };
  L.mayordomo = { npc: 'mayordomo', start: [{ if: 'nuno_derrotado', node: 'despues' }, { node: 'acto' }], nodes: {
    acto: { lines: [['mayordomo', '¿Qué maravilla vais a hacer?']],
      options: [
        opt('Sacar un dinero del bolsillo de un cobrador.', 'cargo'),
        opt('Darme a la fuga con dignidad.', 'end')
      ] },
    cargo: { lines: [['nuno_aud', '¡Anulé la función porque el juglar estaba ausente!'],
      ['mayordomo', '¿Quién puede decir que el artista llegó a tiempo?']],
      options: [
        opt('Yo, que me he visto en la cámara del móvil.', 'camara', 'has:telefono'),
        opt('Per de la Voz. Que diga a quién vio llegar.', 'testigo', 'vista_convocada'),
        opt('Aplazad un momento la maravilla.', 'end')
      ] },
    camara: { lines: [['mayordomo', 'No sé quién vive en esa tablilla. Prefiero un testigo que me pueda contestar.']], next: 'cargo' },
    testigo: { lines: [['pregonero_vista', '¡Le vi llegar antes de que se anunciara la función! ¡Y lo sigo viendo! ¡Los del fondo, poneos de pie!'],
      ['nuno_aud', 'Cualquiera puede tachar un cartel. ¡Demostrad que lo cancelé yo!']],
      options: [
        opt('La marca del cartel encaja con vuestro sello.', 'marca', { all: ['has:bando', 'has:sello_alguacil'] }),
        opt('Tenéis cara de haberlo cancelado.', 'cara'),
        opt('Pido un receso para buscar pruebas.', 'faltan')
      ] },
    cara: { lines: [['mayordomo', 'Si juzgáramos por la cara, Nuño y yo estaríamos los dos en prisión. Traedme una prueba.']], next: 'testigo' },
    faltan: { lines: [
      ['mayordomo', 'El cartel está al lado del postigo, donde Nuño lo tachó.', '!has:bando'],
      ['mayordomo', 'Si la marca es suya, el sello tiene que estar en el Portazgo.', '!has:sello_alguacil']
    ], next: 'end' },
    marca: { lines: [['mayordomo', 'Un cántaro boca abajo. ¿Es vuestro, Nuño?'],
      ['nuno_aud', '¡Claro que es mío! Está boca abajo para que no me lo confundan.'],
      ['mayordomo', 'Queda reconocido. ¿Qué dice la cláusula de la función?']],
      options: [
        opt('Quien la suspenda paga la Pieza del Rey.', 'paga'),
        opt('Quien tenga el sello se queda con la plaza.', 'plaza')
      ] },
    plaza: { lines: [['mayordomo', 'Si eso fuera así tendría que venderos hasta mi silla. Leed el cartel.']], next: 'marca' },
    paga: { lines: [['nuno_aud', 'Yo puse esa cláusula para cobrársela al ausente.'],
      ['mayordomo', 'Y el ausente ha venido. Haced vuestra parte del número.'],
      ['nuno_aud', '¿Aceptáis que os lo deba?'],
      ['player', 'No sería una maravilla. Eso lo hacéis todos los días.']],
      actions: [{ give: 'pieza_rey' }, { set: ['nuno_derrotado', 'final_listo'] }, { sfx: 'success' },
        { note: 'Don Nuño abre la bolsa. La plaza pide que lo haga otra vez.' },
        say('pregonero_vista', '¡El hombre que hizo pagar a Don Nuño! ¡No me hace falta exagerar nada!'),
        say('pregonero_vista', '¡Yuçaf os espera en su alfar! Dice que ya casi es la hora. Eso último lo ha dicho él, no yo.')], next: 'end' },
    despues: { lines: [['mayordomo', 'La próxima vez cobro la entrada yo. Por ver la cara de Nuño, que ya la del juglar me la sé.']], next: 'end' }
  } };
  S.alfar.onEnter = [{ if: { all: ['final_listo', '!epilogo_visto'] }, then: [
    { set: 'epilogo_visto' },
    say('yucaf_alfar', 'Ahí va un cliente que quería tres cántaros para imitar tu número. ¿Qué hiciste al final?'),
    { say: 'Hice pagar a un hombre.' },
    say('yucaf_alfar', 'Aquí les gusta el teatro imposible. Ven. Mira lo que está haciendo el horno.')
  ] }];
  L.yucaf_alfar = { npc: 'yucaf_alfar', start: 'hub', nodes: {
    hub: { lines: [['yucaf_alfar', 'Hay un momento en que mi horno enciende el fuego hacia dentro. Lo hace cuando empieza a oscurecer.']],
      options: [opt('¿Y qué se ve al otro lado?', 'lado'), opt('Volveré al horno al caer la tarde.', 'end')] },
    lado: { lines: [['yucaf_alfar', 'Mi abuelo decía que se oían carros que no tenían caballo.'],
      ['player', '¿Muchos?'], ['yucaf_alfar', 'Los suficientes para que él prefiriera quedarse aquí.']], next: 'end' }
  } };
  N.yucaf_alfar.reactions.final_horno.actions = [
    { say: 'Me queda batería para una foto. Yuçaf, ven.' },
    say('yucaf_alfar', '¿Qué cara pongo?'),
    { say: 'La que pondrías si dentro de ochocientos años alguien siguiera usando tus cántaros.' },
    { sfx: 'combine' }, { wait: .4 }, { note: 'El horno arde azul. Al otro lado del fuego se oye tráfico.' }, { endLab: true }
  ];

  // Atrezzo provisional en el mismo lienzo que los objetos que se pueden tocar.
  function prop(scene, id, rect, draw, visibleWhen) {
    const [x, y, w, h] = rect;
    const placeholder = 'juglar_' + id;
    E.assets.registerPlaceholder(placeholder, (width, height) => {
      const canvas = E.createCanvas(width, height);
      draw(canvas.getContext('2d'), width, height);
      return canvas;
    });
    S[scene].layers.push({ id, z: 'back', x, y, w, h, placeholder, visibleWhen });
  }
  prop('plaza', 'banco_lope', [932, 590, 121, 103], (g) => {
    g.fillStyle = '#503626'; g.fillRect(9, 53, 103, 15);
    g.fillRect(15, 66, 9, 37); g.fillRect(96, 66, 9, 37);
    g.strokeStyle = '#c0c6c2'; g.lineWidth = 8; g.beginPath();
    g.arc(61, 36, 19, 0, Math.PI); g.stroke();
  });
  prop('puerta_rio', 'regla_visible', [1176, 524, 106, 88], (g) => {
    g.fillStyle = '#684931'; g.fillRect(45, 50, 12, 38);
    g.fillRect(0, 0, 106, 58);
    g.fillStyle = '#e7cf9b'; g.fillRect(6, 5, 94, 48);
    g.fillStyle = '#382b1c'; g.font = 'bold 12px serif'; g.fillText('ARTISTAS', 20, 25);
    g.fillRect(15, 33, 74, 2); g.fillRect(15, 42, 55, 2);
  });
  prop('plaza', 'hilo_visible', [834, 604, 163, 30], (g) => {
    g.strokeStyle = '#e9daa3'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(4, 10); g.quadraticCurveTo(83, 30, 159, 21); g.stroke();
  }, { all: ['hilo_visto', '!lope_derrotado'] });
  prop('iglesia', 'cuerda_campana', [244, 222, 32, 440], (g, w, h) => {
    g.strokeStyle = '#5d4126'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(16, 0); g.lineTo(16, h - 23); g.stroke();
    g.strokeStyle = '#cfaa69'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(14, 0); g.lineTo(14, h - 20); g.stroke();
    g.beginPath(); g.ellipse(15, h - 15, 8, 11, 0, 0, 2 * Math.PI); g.stroke();
  });
  prop('portazgo', 'atril_nuno', [469, 466, 124, 214], (g) => {
    g.fillStyle = '#62432b'; g.fillRect(57, 89, 11, 125);
    g.fillRect(30, 200, 65, 10);
    g.fillStyle = '#8c6440'; g.fillRect(14, 47, 98, 51);
    g.fillStyle = '#bc935d'; g.fillRect(10, 86, 104, 9);
  });
  prop('portazgo', 'movil_en_atril', [514, 512, 34, 39], (g) => {
    g.fillStyle = '#1e1b1e'; g.fillRect(2, 0, 30, 38);
    g.fillStyle = '#7eb7c8'; g.fillRect(6, 4, 22, 30);
  }, 'nuno_ensimismado');
  prop('portazgo', 'sello_visible', [1214, 656, 29, 36], (g) => {
    g.fillStyle = '#9f3428'; g.fillRect(3, 25, 24, 9);
    g.fillStyle = '#382720'; g.fillRect(11, 8, 8, 18);
    g.fillRect(6, 5, 18, 9);
  }, '!sello_cogido');
  E.assets.registerPlaceholder('item_pieza_rey', (w, h) => {
    const c = E.createCanvas(w, h), g = c.getContext('2d');
    g.fillStyle = '#a66b27'; g.beginPath(); g.arc(48, 48, 33, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e9b95d'; g.beginPath(); g.arc(48, 48, 28, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#8a5720'; g.lineWidth = 4; g.beginPath();
    g.moveTo(33, 37); g.lineTo(39, 56); g.lineTo(57, 56); g.lineTo(64, 37);
    g.lineTo(53, 45); g.lineTo(48, 34); g.lineTo(43, 45); g.closePath(); g.stroke();
    return c;
  });

  // ===================================================== PISTAS (botón «?») para la trama del juglar: la primera que se cumple
  const HAVE_ALL = ['vista_convocada', 'has:bando', 'has:sello_alguacil'];
  E.DATA.hints = [
    { if: { all: ['final_listo', { scene: 'alfar' }] }, obj: 'Usar el móvil en el horno', text: 'Don Nuño ha pagado. Acércate al horno de Yuçaf y usa el móvil sobre él.' },
    { if: 'final_listo', obj: 'Volver al alfar de Yuçaf', text: 'Yuçaf te espera en su alfar (salida de la derecha en la Plaza del Pan). Dice que el horno hace cosas raras al oscurecer.' },
    { if: { all: HAVE_ALL }, obj: 'Ganar la Vista Pública', text: 'Ve a la Vista Pública (arco de la derecha de la plaza) y habla con el mayordomo. Tu testigo es Per de la Voz; tus pruebas, el cartel y el sello de Nuño.' },
    { if: { all: ['!lope_derrotado', '!has:badajo', '!campana_arreglada', 'hilo_visto'] }, obj: 'Desenmascarar a Lope', text: 'Ya has visto el hilo. Habla con Lope y explícale cómo hace el truco de la herradura.' },
    { if: { all: ['!lope_derrotado', '!has:badajo', '!campana_arreglada', { scene: 'plaza' }] }, obj: 'Descubrir el truco de Lope', text: 'Lope apuesta la Lengua de la campana a que no adivinas su truco. Mira su banco de cerca: con la luz del móvil (o un poco de harina) se vería lo que no quiere que veas.' },
    { if: { all: ['!lope_derrotado', '!has:badajo', '!campana_arreglada', 'pase_puerta'] }, obj: 'Recuperar el badajo', text: 'La campana de Santa María no tiene badajo: lo tiene el herrero Lope en la Plaza del Pan, como premio de su truco.' },
    { if: { all: ['has:badajo', '!campana_arreglada'] }, obj: 'Devolver la Lengua a la campana', text: 'Lleva el badajo a Fray Benito, en el atrio de Santa María (entrada en la plaza). Dáselo o úsalo en la campana.' },
    { if: { all: ['campana_arreglada', '!vista_convocada'] }, obj: 'Convocar la Vista', text: 'Tira de la cuerda de la campana. Un toque abre el mercado, dos lo cierran... y tres llaman a todo el mundo a la Vista, alguacil incluido.' },
    { if: { all: ['vista_convocada', '!has:sello_alguacil', 'nuno_ensimismado'] }, obj: 'Coger el sello de Nuño', text: 'Nuño está embobado con su retrato. Es el momento: coge el sello de su mesa.' },
    { if: { all: ['vista_convocada', '!has:sello_alguacil'] }, obj: 'Conseguir el sello de Nuño', text: 'El sello de Nuño está en su mesa de la Casa del Portazgo. No se aparta de ella... salvo para mirarse: deja el móvil en el atril como si fuera un retrato.' },
    { if: { all: ['vista_convocada', '!has:bando'] }, obj: 'Coger el cartel de la función', text: 'Necesitas el cartel de la función, el que tachó Nuño. Está junto al postigo de la Puerta del Río (salida izquierda de la plaza).' },
    { if: { all: ['cruzado', '!pase_puerta', 'regla_postigo'] }, obj: 'Convencer a los dos Giles', text: 'Usa el reglamento contra ellos: habla con los guardias y diles que, para demostrar que eres artista, primero tienen que dejarte entrar.' },
    { if: { all: ['cruzado', '!pase_puerta'] }, obj: 'Entrar en Talavera', text: 'Los dos Giles tienen órdenes que se contradicen. Lee el reglamento del postigo (el tablón junto a la puerta) y luego habla con ellos.' },
    { if: 'barca_libre', obj: 'Subir a la barca', text: 'Alfonso ya te cruza. Toca su barca para subir.' },
    { if: { all: ['rueda_libre', '!barca_libre'] }, obj: 'Conseguir pasaje', text: 'Alfonso pide una moneda y alguien que responda por ti... o te lleva gratis si sueltas el cabo de la argolla sin mojarte: usa la pértiga con lazo sobre la barca.' },
    { if: { all: ['!rueda_libre', { scene: 'acena' }, '!sabe_tronco'] }, obj: 'Examinar la rueda y hablar con Durán', text: 'Ya estás dentro de la aceña. Toca la rueda grande de la izquierda para examinarla y habla con Durán, el molinero.' },
    { if: { all: ['!rueda_libre', 'has:pertiga_lazo', 'sabe_tronco'] }, obj: 'Liberar la rueda de la aceña', text: 'Entra en la aceña (la puerta de piedra, a la derecha de la ribera), abre el zurrón, elige la pértiga y úsala sobre la rueda.' },
    { if: { all: ['!rueda_libre', 'has:pertiga'] }, obj: 'Liberar la rueda de la aceña', text: 'Entra en la aceña (puerta de piedra, a la derecha de la ribera). Un tronco atasca la rueda: abre el zurrón, elige la pértiga y úsala sobre la rueda.' },
    { if: { all: ['!rueda_libre', 'sabe_tronco'] }, obj: 'Conseguir algo largo para hacer palanca', text: 'Necesitas algo largo y firme: hay una pértiga entre la hierba de la ribera. Con una cuerda puedes hacer un lazo para pescar cosas del agua.' },
    { if: { all: ['!rueda_libre', 'sabe_aceña'] }, obj: 'Entrar en la aceña', text: 'Entra por la puerta de la aceña (el edificio de piedra, a la derecha de la ribera) y habla con Durán.' },
    { if: '!rueda_libre', obj: 'Cruzar el Tajo hasta Talavera', text: 'Talavera está al otro lado del río y el puente está en obras. Hace falta una barca, pero el camino del embarcadero está inundado: el agua se escapa de la aceña, a la derecha de la ribera. Empieza por ahí.' }
  ];
})(window.E1248);
