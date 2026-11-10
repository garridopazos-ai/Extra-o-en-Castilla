// CHAMELO RC19 · arreglos tras la prueba de César (10 nov). Se carga tras rc18e.js.
//  · Mingo en la higuera: un solo toque sobre él (o sobre el río) y baja; el vado explica por qué hace falta; pistas claras.
//  · Alfar: la trama del lacre se entiende (el lacre es cera: con el horno al rojo se derrite) y NO se hace de noche ahí.
//  · Noche: llega en la taberna, al subir a dormir; Rai despierta al viajero.
//  · Proporciones: las marionetas (que salían ~10 % más altas que los dibujos) se igualan a la tabla de alturas visibles.
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues, CH = D.characters;
  const R17 = E.rc17, TAU = Math.PI * 2;
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const note = text => ({ note: text });
  const H = (sc, id) => (S[sc].hotspots || []).find(h => h.id === id);
  const R19 = E.rc19 = { wax: 0 };

  // ---------------------------------------------------------------- 1 · PROPORCIONES (altura visible a escala 1, medida con tools/measure_sizes.py)
  // el viajero mide 309; objetivo = fracción del viajero. Las marionetas medían 304–337 (cabello, sombrero y turbante incluidos).
  const SZ = { guardia: 0.88, yucaf: 0.875, sancha: 0.89, lope: 0.915, pregonero: 0.89, benito: 0.915, mayordomo: 0.89, arriero: 0.91, peregrina: 0.87,
    oropesa: 0.88, requete_a: 0.88, requete_b: 0.88, requete_c: 0.90, requete_d: 0.91 };
  for (const id in SZ) if (CH[id] && CH[id].rig && !CH[id]._rc19) { CH[id].height = Math.round(CH[id].height * SZ[id]); CH[id]._rc19 = true; }

  // ---------------------------------------------------------------- 2 · MINGO EN LA HIGUERA → RAI
  const OR = S.orilla;
  const TRUCO = [
    say('¡Anda! ¡Eso no lo había visto en mi vida!'),
    say('¿El qué? ¿Dónde?', 'mingo'),
    { rc17: 'mingoBaja' }, note('(Mingo baja de un salto y corre a mirar. El móvil se le escurre de la camisa.)'),
    { give: 'telefono' }, { sfx: 'pick' },
    note('(En el móvil hay veinte fotos nuevas. Todas de la nariz de Mingo.)'),
    say('¡Me has metido ahí dentro!', 'mingo'),
    say('Te has metido tú. Veinte veces.'),
    say('Pues me quedo contigo. Alguien tiene que vigilar ese espejo.', 'mingo'),
    { set: 'mingo_sigue' }, { give: 'mingo' }, { sfx: 'success' },
    note('Mingo te acompaña. Rai, el del Chamelo, lo conoce: ahora ya puedes cruzar el vado.')];
  const TIENE_QUE_BAJAR = { all: ['mingo_robo', '!mingo_sigue'] };
  // tocar a Mingo en la rama: una conversación corta y baja (un toque, una escena)
  N.mingo.verbs.talk = [{ if: 'mingo_sigue', then: [{ dialogue: 'mingo' }], else: [
    say('Baja, anda. Dame el móvil.'),
    say('¡No bajo! Aquí arriba tu espejo canta mejor.', 'mingo'),
    note('(Un crío así no baja porque se lo mandes. Baja por curiosidad.)'),
    say('Qué raro… ¡Mira el río! ¡Nunca había visto algo así!'),
    ...TRUCO] }];
  // y también valen el río (mirarlo) en cualquier momento mientras Mingo está arriba
  { const rio = H('orilla', 'rio');
    if (rio && rio.verbs && rio.verbs.look) { const base = rio.verbs.look[0] && rio.verbs.look[0].else || [say('El Tajo, ancho y tranquilo. Huele a juncia y a barro del bueno.')];
      rio.verbs.look = [{ if: TIENE_QUE_BAJAR, then: [say('Qué raro… ¡Mira el río! ¡Nunca había visto algo así!'), ...TRUCO], else: base.filter(a => !(a.if && JSON.stringify(a).includes('mingo_curioso'))) }]; } }
  // el vado: dice la verdad (Rai solo recibe con Mingo, y Mingo sigue en la higuera con tu móvil)
  { const v = H('orilla', 'vado');
    if (v) {
      const DENY = [{ if: 'rueda_libre', then: [{ if: 'mingo_robo', then: [say('Rai solo recibe con Mingo… y Mingo sigue en la higuera con mi móvil.')], else: [say('Mejor vuelvo con Mingo. Él conoce a Rai.')] }],
        else: [say('La crecida tapa el vado. Antes hay que arreglar la rueda de la aceña.')] }];
      v.exit.deny = DENY;
      v.verbs.use = [{ if: { all: ['rueda_libre', 'mingo_sigue'] }, then: [{ goto: ['chamelo', 'from_orilla'] }], else: DENY }]; } }
  // pistas
  { const hs = D.hints, i0 = hs.findIndex(h => h.obj === 'Engañar a Mingo');
    const nuevas = [
      { if: { all: ['rueda_libre', 'mingo_robo', '!mingo_sigue', { scene: 'orilla' }] }, obj: 'Recuperar a Mingo', text: 'Rai solo te recibirá con Mingo. Toca a Mingo, en la higuera: no baja porque se lo mandes, baja por curiosidad.' },
      { if: { all: ['mingo_robo', '!mingo_sigue', { scene: 'orilla' }] }, obj: 'Recuperar el móvil', text: 'Toca a Mingo, en la rama de la higuera: no baja porque se lo mandes. Hay que despertarle la curiosidad.' }];
    for (const h of hs.slice()) if (h.obj === 'Engañar a Mingo' || (h.obj === 'Recuperar el móvil' && /Mira cosas del soto/.test(h.text))) hs.splice(hs.indexOf(h), 1);
    hs.splice(Math.max(0, i0), 0, ...nuevas); }

  // ---------------------------------------------------------------- 3 · EL ALFAR: el lacre se derrite con el horno (y es de día)
  const AL = S.alfar;
  AL.onEnter = [
    { if: '!p02_visto', then: [{ set: ['p02_visto', 'alfar_activo'] }, { wait: 0.4 },
      say('Por tres dineros de deuda, este alfar queda precintado.', 'nuno_alfar'),
      say('Lacre rojo en la boca del horno, mi anillo encima, y nadie lo abre.', 'nuno_alfar'),
      say('¡Tengo una hornada dentro!', 'yucaf_alfar'),
      note('(Nuño saca una barra de lacre. Para fundirla hace falta una vela.)'),
      say('¡Guardias! ¡La vela!', 'nuno_alfar'),
      say('¿Quién la trae?', 'gil_alfar_a'), say('Tú.', 'gil_alfar_b'),
      note('(Los guardias se registran el uno al otro. Hay tiempo.)'),
      say('Con el horno flojo, ese lacre agarra. Con el horno al rojo… se derrite.', 'yucaf_alfar')] }];
  N.nuno_alfar.verbs.talk = [say('Tres dineros son tres dineros. Y con lacre, nueve.', 'nuno_alfar')];
  N.nuno_alfar.verbs.look = [say('Don Nuño, con su pluma, su anillo y una barra de lacre rojo.')];
  const FIN = [{ rc17: 'hornoRuge' }, { rc17: 'cera' },
    note('(El horno ruge. Una ola de calor llena el alfar.)'),
    say('Bien. Ahora, el lacre.', 'nuno_alfar'),
    note('(Nuño acerca la barra a la boca del horno… y el lacre se le derrite en la mano: por el anillo, por la manga, por la barba.)'),
    say('¡Mi anillo! ¡Mi manga!', 'nuno_alfar'),
    say('Horno al rojo, lacre derretido. Lo sabe cualquier alfarero.', 'yucaf_alfar'),
    say('Pues esperaré a que se enfríe.', 'nuno_alfar'),
    say('Mi horno no se enfría hasta el domingo.', 'yucaf_alfar'),
    say('Volveré. Con lacre de invierno.', 'nuno_alfar'),
    { npcWalk: ['nuno_alfar', 1480, 782] },
    note('(Los guardias le siguen, registrándose el uno al otro.)'),
    { set: 'embargo_aplazado' }, { unset: 'alfar_activo' }, { sfx: 'success' },
    say('Volverá. Con más tasas y un lacre mejor.', 'sancha'),
    say('Esta tarde, a la Taberna del Miedo. El viejo soldado invita.', 'sancha'),
    { npcPlace: ['lope', 'taberna', 1300, 792, 'right'] }, { npcPlace: ['leonor', 'taberna', 250, 790, 'right'] }, { set: 'rai_oculto' },
    note('OBJETIVO: ir a la Taberna del Miedo (Puerta del Río → Corredera).')];
  const CARBON = [{ if: 'embargo_aplazado', then: [say('Mejor no. Ya ruge bastante.')], else: [{ if: '!alfar_activo', then: [say('Carbón de encina. Del bueno.')],
    else: [{ if: '!tiro_abierto', then: [say('Sin tiro, el carbón se ahoga.', 'yucaf_alfar')],
      else: [note('(Una palada de carbón. El horno se traga el aire y ruge.)'), { set: 'carbon_echado' }, ...FIN] }] }] }];
  { const c = H('alfar', 'carbon'); if (c) { c.verbs.use = CARBON; c.verbs.pick = CARBON; } }
  for (const h of D.hints) {
    if (h.obj === 'Avivar el horno') h.text = 'El lacre es cera: con el horno al rojo se derrite. Echa una palada de carbón: la cesta está a la izquierda del horno.';
    if (h.obj === 'Que no cierren el alfar') h.text = 'Con el horno flojo, el lacre de Nuño agarra. Aviva el fuego: primero tira de la cadena del tiro, a la derecha del horno.';
  }
  // efecto: gotas de lacre rojo que resbalan de la mano de Nuño
  const act0 = R17.act;
  R17.act = (name, G) => { if (name === 'cera') { R19.wax = 0.001; return; } return act0(name, G); };

  // ---------------------------------------------------------------- 4 · LA NOCHE LLEGA EN LA TABERNA (al subir a dormir)
  const TB = S.taberna;
  { const b0 = TB.onEnter[0];
    b0.then = [{ set: 'lanza_vista' }, { wait: 0.4 },
      say('Tu lanza. Recta como mi palabra.', 'lope'),
      say('Me la torció un moro de dos varas.', 'soldado'),
      say('Te la torció una puerta, Alonso.', 'lope'),
      { rc17: 'alonso' }, note('(Así que el viejo soldado se llama Alonso.)'),
      say('Se hace tarde, forastero. Arriba hay una cama. Hoy invito yo.', 'soldado'),
      say('Gracias. Estoy rendido.'),
      { rc17: 'fadeout' }, { rc17: 'night' },
      note('(Subes a los cuartos y te duermes en cuanto tocas la paja.)'), { wait: 0.6 }, { rc17: 'fadein' },
      note('(Un golpe en la puerta. Es Rai.)'),
      { unset: 'rai_oculto' }, { npcWalk: ['leonor', 700, 790] },
      say('¡Despierta! ¡Antorchas en el soto! Cuatro tipos discutiendo un mapa.', 'leonor'),
      say('¡A mí la lanza!', 'soldado'),
      note('(Alonso se levanta… y se vuelve a sentar. La rodilla.)'),
      say('Ve tú, forastero. Yo voy… por otro lado.', 'leonor'),
      { npcPlace: ['leonor', 'chamelo', 1235, 727, 'left'] }, { npcPlace: ['lope', 'plaza', 800, 790, 'right'] },
      { set: 'noche_soto' }, { rc17: 'fadeout' }, { goto: ['orilla', 'from_chamelo'] }]; }

  // ---------------------------------------------------------------- dibujo: lacre goteando (solo en el alfar)
  const inst0 = E.rc07 && E.rc07.install;
  if (inst0) E.rc07.install = G => {
    inst0(G);
    const draw0 = E.scene.draw;
    E.scene.draw = (ctx, Sc, G2) => {
      draw0(ctx, Sc, G2);
      if (R19.wax > 0 && Sc.def.id === 'alfar') {
        const dt = G.paused ? 0 : Math.min(0.05, G.lastFrameDt || 0.016); R19.wax += dt;
        const n = G.npc && G.npc('nuno_alfar'); if (n && n.visible !== false) {
          const k = Sc.depthScale(n.y), x = n.x - Sc.camX + (n.facing === 'left' ? -52 : 52) * k, y0 = n.y - 150 * k, t = R19.wax;
          ctx.save(); ctx.fillStyle = '#b3201a'; ctx.strokeStyle = '#5a0b08'; ctx.lineWidth = 2;
          const blob = Math.min(1, t / 0.6) * (t > 4.5 ? Math.max(0, 1 - (t - 4.5) / 1.5) : 1);
          ctx.globalAlpha = blob; ctx.beginPath(); ctx.ellipse(x, y0, 16 * k, 11 * k, 0, 0, TAU); ctx.fill(); ctx.stroke();
          for (let i = 0; i < 4; i++) { const ph = (t * 0.9 + i * 0.27) % 1, yy = y0 + ph * (n.y - y0), a = (1 - ph * 0.6) * blob;
            ctx.globalAlpha = a; ctx.beginPath(); ctx.ellipse(x + Math.sin(i * 2.1) * 9 * k, yy, 4.5 * k, 7 * k, 0, 0, TAU); ctx.fill(); }
          ctx.globalAlpha = Math.min(1, t / 2) * blob; ctx.beginPath(); ctx.ellipse(x, n.y + 4 * k, 26 * k * Math.min(1, t / 3), 6 * k, 0, 0, TAU); ctx.fill();
          ctx.restore(); }
        if (R19.wax > 6.5) R19.wax = 0;
      }
    };
  };
})(window.E1248 = window.E1248 || {});
