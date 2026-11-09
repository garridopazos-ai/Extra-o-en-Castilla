// CHAMELO RC17 · GUION DEFINITIVO, revisión 2 de puzles (docs/REVISION_2_PUZLES.md, aprobada por César el 9 nov).
// Sustituye la trama del juglar por la historia de César: Mingo y su curiosidad, la rueda (con nube de harina), Sancha
// (arte de Elvira) al salir de la aceña, el paloduz de Rai, el alfar que no se puede cerrar, la Requeteconquista y el gato,
// la confesión de Rai, el peso de la señora de Oropesa, la destitución de Nuño, el poste de la aldea, la campana bajo la
// Luna roja, la despedida con la hogaza y el regreso al presente. Las secundarias quedan para tramos siguientes.
// Se carga tras rc15.js (sin rc16). No edita módulos antiguos: neutraliza lo que sobra desde aquí.
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues, I = D.items, CH = D.characters;
  const T = E.state.test, TAU = Math.PI * 2;
  const R17 = E.rc17 = { moon: 0, portal: 0, flash: 0, oven: 0, coins: 0, lift: 0, flour: 0 };
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const note = text => ({ note: text });
  const opt = (text, next, cond, extra) => Object.assign({ text, next, if: cond }, extra || {});
  const H = (sc, id) => (S[sc].hotspots || []).find(h => h.id === id);
  const Ly = (sc, id) => (S[sc].layers || []).find(l => l.id === id);
  const dropH = (sc, ids) => { S[sc].hotspots = S[sc].hotspots.filter(h => !ids.includes(h.id)); };
  const hideL = (sc, ids) => { for (const id of ids) { const l = Ly(sc, id); if (l) l.visibleWhen = 'nunca_jamas'; } };

  // =====================================================================================================
  // 0 · NOMBRES: el barquero pasa a ser Martín (antes de escribir textos nuevos con «Alfonso IX»); Elvira = Sancha
  (function rename(o, seen) {
    if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
    for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') { if (v.indexOf('Alfonso') >= 0) o[k] = v.replace(/Alfonso/g, 'Martín'); } else rename(v, seen); }
  })(D, new Set());
  if (CH.alfonso) CH.alfonso.name = 'Martín';
  if (N.alfonso) N.alfonso.name = 'Martín el Que Sabe';
  if (N.alfonso_b) N.alfonso_b.name = 'Martín el Que Sabe';
  if (CH.elvira) CH.elvira.name = 'Sancha';
  N.sancha.character = 'elvira'; N.sancha.name = 'Sancha';
  N.elvira_aceña.presentWhen = 'nunca_jamas'; N.elvira.presentWhen = 'nunca_jamas';

  // =====================================================================================================
  // 1 · PERSONAJES NUEVOS (marionetas articuladas de g12_rig.js + un gato dibujado aquí). Arte PROVISIONAL.
  const HIT = [-55, -300, 110, 300];
  const rig = (id, name, height, speed, look) => { CH[id] = { name, height, speed, hit: HIT, orient: 'lr', rig: look, sprite: { src: null } }; };
  rig('oropesa', 'La señora de Oropesa', 290, 150, { build: 'woman', skin: '#efc6a8', hat: 'toca', hatCol: '#f4ecd8', top: '#7a1f2b', sleeve: '#7a1f2b', cape: '#3b1a4a', legs: '#5a1a24', collar: '#c9a227', belt: '#c9a227', tunicLen: 1.0, mood: 'grumpy', cheeks: true, seed: 21 });
  rig('requete_a', 'El cabecilla', 305, 190, { build: 'adult', skin: '#c48a60', hair: '#1a1410', beard: 'full', beardCol: '#1a1410', hat: 'turban', hatCol: '#2f6a4a', top: '#2f6a4a', sleeve: '#24533a', cape: '#6a2a1a', legs: '#3a2a1a', shoes: 'boot', belt: '#c9a227', mood: 'grumpy', nose: 'big', seed: 31 });
  rig('requete_b', 'El del turbante blanco', 300, 190, { build: 'thin', skin: '#d29a70', hair: '#2a1a10', beard: 'goatee', hat: 'turban', hatCol: '#efe8d8', top: '#a0522d', sleeve: '#8a4426', legs: '#4a3a2a', shoes: 'shoe', mood: 'worried', seed: 32 });
  rig('requete_c', 'El del gorro rojo', 290, 190, { build: 'fat', skin: '#dca484', hair: '#3a2a1a', beard: 'moustache', hat: 'cap', hatCol: '#a33a2a', top: '#5a6a8a', sleeve: '#4a5a7a', legs: '#3a3a4a', shoes: 'shoe', mood: 'happy', nose: 'big', seed: 33 });
  rig('requete_d', 'El viejo de la capucha', 285, 150, { build: 'old', skin: '#cf9e7c', hair: '#b8b0a4', beard: 'full', beardCol: '#c8c0b4', hat: 'hood', hatCol: '#6a4a2a', top: '#7a5a3a', sleeve: '#6a4a2a', legs: '#4a3a2a', shoes: 'shoe', mood: 'sly', seed: 34 });
  CH.gato = { name: 'Gato negro', height: 70, speed: 300, hit: [-260, -390, 520, 430], orient: 'lr', rig: { cat: true }, sprite: { src: null } };

  // gato: se dibuja aquí (no es una figura humana). Pose según anim: idle / walk / sit / yawn.
  function drawCat(ctx, a, scale, camX) {
    if (a.visible === false) return;
    const k = (a.def.height / 70) * scale, px = a.x - camX, py = a.y, f = (a.facing === 'left' || (a.facing !== 'right' && a.lastH === 'left')) ? -1 : 1;
    const t = performance.now() / 1000, walk = !!a.moving, yawn = a.anim === 'yawn';
    if (!a._noShadow) { ctx.fillStyle = 'rgba(20,12,4,.28)'; ctx.beginPath(); ctx.ellipse(px, py, 34 * k, 6 * k, 0, 0, TAU); ctx.fill(); }
    ctx.save(); ctx.translate(px, py); ctx.scale(f * k, k);
    const ink = '#111014', fur = '#1d1a20', ph = walk ? t * 11 : 0;
    ctx.lineCap = 'round';
    // cola
    ctx.strokeStyle = fur; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-28, -30);
    ctx.quadraticCurveTo(-48, -40 - Math.sin(t * 2.1) * 8, -44 + Math.sin(t * 1.7) * 6, -64 - Math.cos(t * 2.3) * 6); ctx.stroke();
    // patas
    ctx.strokeStyle = ink; ctx.lineWidth = 6;
    const leg = (x, o) => { const s = walk ? Math.sin(ph + o) * 7 : 0; ctx.beginPath(); ctx.moveTo(x, -22); ctx.lineTo(x + s, -2); ctx.stroke(); };
    leg(-20, 0); leg(-12, Math.PI); leg(14, Math.PI); leg(22, 0);
    // cuerpo y cabeza
    ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(0, -30, 32, 15, 0, 0, TAU); ctx.fill();
    const hx = 30, hy = -46 + (walk ? Math.sin(ph * 2) * 1.5 : 0);
    ctx.beginPath(); ctx.arc(hx, hy, 14, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - 11, hy - 6); ctx.lineTo(hx - 8, hy - 24); ctx.lineTo(hx - 1, hy - 11); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 3, hy - 11); ctx.lineTo(hx + 10, hy - 24); ctx.lineTo(hx + 13, hy - 5); ctx.closePath(); ctx.fill();
    // ojos (parpadeo; guiño si a._wink)
    const blink = (t % 4.3) < 0.13;
    ctx.fillStyle = '#d9e04a';
    if (!blink && !yawn) { ctx.beginPath(); ctx.ellipse(hx + 2, hy - 3, 2.6, 3.4, 0, 0, TAU); ctx.fill(); }
    if (!blink && !yawn && !a._wink) { ctx.beginPath(); ctx.ellipse(hx + 9, hy - 3, 2.6, 3.4, 0, 0, TAU); ctx.fill(); }
    if (a._wink || yawn) { ctx.strokeStyle = '#d9e04a'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(hx + 6, hy - 3); ctx.lineTo(hx + 12, hy - 3); ctx.stroke(); }
    if (yawn) { ctx.fillStyle = '#c0475a'; ctx.beginPath(); ctx.ellipse(hx + 6, hy + 6, 4, 5 + Math.sin(t * 3) * 1.5, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  // =====================================================================================================
  // 2 · ACCIONES DE GUION PROPIAS: {rc17:'nombre'}
  R17.act = (name, G) => {
    const U = G.ui, f = G.state.flags;
    if (name === 'fadeout') { U.fadeTarget = 1; return () => U.fade >= 1; }
    if (name === 'fadein') { U.fadeTarget = 0; return () => U.fade <= 0; }
    if (name === 'night') { f.noche = true; G.onStateChanged(); return; }
    if (name === 'day') { delete f.noche; G.onStateChanged(); return; }
    if (name === 'mingoBaja') {            // Mingo salta de la higuera junto al viajero
      const n = G.npcs.get('mingo'), p = G.player, x = Math.min(3900, p.x + 140);
      n.mem.scene = G.state.scene; n.mem.x = x; n.mem.y = 700; n.mem.facing = 'left';
      Object.assign(n.actor, { x, y: 700, scripted: false, _fixed: false }); E.actor.setPath(n.actor, []); n.actor.facing = n.actor.lastH = 'left';
      G.onStateChanged(); return;
    }
    if (name === 'harina') { R17.flour = 1; if (E.rc07) E.rc07.cam.shake(9, 0.9); return; }
    if (name === 'sacudir') { delete f.enharinado; R17.flour = 0; return; }
    if (name === 'hornoRuge') { if (E.rc07) E.rc07.cam.shake(6, 1.2); E.audio.play('wheel'); return; }
    if (name === 'mapaRoto') { f.mapa_roto = true; G.onStateChanged(); E.audio.play('nope'); return; }
    if (name === 'guino') { const a = G.npc('gato'); if (a) { a._wink = true; setTimeout(() => { a._wink = false; }, 1400); if (E.rc07) E.rc07.emote(a, ';)', 1.5); } return; }
    if (name === 'bosteza') { const a = G.npc('gato'); if (a) { a.anim = 'yawn'; setTimeout(() => { a.anim = 'idle'; }, 2200); } let w = 2.2; return () => (w -= G.lastDt) <= 0; }
    if (name === 'zzz') { const a = G.npc('soldado'); if (a && E.rc07) E.rc07.emote(a, 'z z z', 2.4); return; }
    if (name === 'monedas') { R17.coins = 0.001; E.audio.play('pick'); if (E.rc07) E.rc07.cam.shake(5, 0.5); return; }
    if (name === 'alonso') { N.soldado.name = 'Alonso'; f.alonso_nombre = true; return; }
    if (name === 'eclipse') { f.noche = true; f.eclipse = true; R17.moon = 0; G.onStateChanged(); return; }
    if (name === 'lunaRoja') return () => R17.moon >= 1;
    if (name === 'vuela') { R17.lift = 0.001; E.audio.play('campana'); if (E.rc07) E.rc07.cam.shake(8, 1.4); return; }
    if (name === 'portal') { R17.portal = 0.001; E.audio.play('success'); return; }
    if (name === 'flash') { R17.flash = 0.001; let w = 1.4; return () => (w -= G.lastDt) <= 0; }
    if (name === 'aldea') { R17.card = { t: 0 }; return () => !R17.card; }
    if (name === 'cuadrillaTaberna') { for (const [id, p] of Object.entries(R17.TBP)) { const n = G.npcs.get(id); Object.assign(n.mem, { scene: 'taberna', x: p[0], y: p[1], facing: p[2] }); Object.assign(n.actor, { x: p[0], y: p[1], scripted: false }); n.actor.facing = n.actor.lastH = p[2]; } G.onStateChanged(); return; }
  };

  // =====================================================================================================
  // 3 · ACTO I — LLEGADA Y DESCUBRIMIENTO
  // ---- ribera: llegada (se conserva el robo del móvil), sin cuerda ni moneda; Sancha al salir de la aceña
  const RB = S.ribera;
  { const fe = RB.firstEnter;
    const n0 = fe.find(a => a.note && a.note.indexOf('Ribera del Tajo') === 0); if (n0) n0.note = 'Ribera del Tajo · Talavera, junio de 1248';
    const obj = fe.find(a => a.note && a.note.indexOf('OBJETIVO') === 0); if (obj) obj.note = 'OBJETIVO: recuperar el móvil. El crío ha huido río arriba.';
    fe.unshift({ set: 'cuerda_cogida' }); }
  dropH('ribera', ['moneda']);
  { const rope = Ly('ribera', 'rope'); if (rope) rope.visibleWhen = null;
    const poste = H('ribera', 'poste'); if (poste) poste.verbs = { look: [say('Un poste de amarre con su cuerda. Bien atada. No me hace falta.')] }; }
  RB.entries.presente = { x: 1700, y: 805, facing: 'right' };
  RB.onEnter = [
    { if: { all: ['enharinado', '!sancha_conocida', '!presente'] }, then: [
      { wait: 0.4 },
      say('¿Y tú de qué molino te has escapado?', 'sancha'),
      say('Del de Durán. Le he arreglado la rueda.'),
      say('Entonces hoy habrá pan. Soy Sancha: pan y harina, en la Plaza del Pan.', 'sancha'),
      note('(Te sacude la harina de los hombros con dos palmadas. Mingo se queda blanco… de envidia.)'),
      { rc17: 'sacudir' }, { set: 'sancha_conocida' },
      { npcWalk: ['sancha', 1250, 815] }, { npcPlace: ['sancha', 'plaza', 470, 790, 'right'] }] },
    { if: { all: ['presente', '!fin'] }, then: [
      { wait: 0.8 }, note('Talavera, hoy.'),
      say('Ha sido un sueño. Seguro.'),
      note('(Abres la mochila. La hogaza sigue caliente.)'),
      say('…O no.'),
      { npcPlace: ['gato', 'ribera', 1960, 772, 'left'] }, { wait: 1.2 }, { rc17: 'bosteza' },
      note('(En la orilla, un gato negro bosteza. Te mira. Y ya no está.)'),
      { npcPlace: ['gato', 'nada', 0, 0, 'left'] },
      { rc17: 'fadeout' },
      note('Alonso, se cuenta, fue bisabuelo de un tal Alonso Quijano. Eso dicen.'),
      note('Sancha Alfonso de León, hija de Alfonso IX, existió de verdad. Lo del pan lo hemos inventado. Ella no lo desmentiría.'),
      note('Rai, dicen las leyendas, era una especie de Merlín castellano. Los gatos de la ribera no opinan.'),
      { set: 'fin' }, { endLab: true }] }
  ];

  // ---- aceña: la rueda (solo pértiga) y la nube de harina
  const rueda = H('acena', 'rueda');
  const LIBERA = [say('Meto la pértiga entre el tronco y los álabes… y ¡palanca!'), { sfx: 'wheel' }, { wait: 0.5 },
    { set: ['rueda_libre', 'sabe_tronco', 'enharinado'] }, { event: 'rueda_liberada' }, { rc17: 'harina' },
    { npcPlace: ['sancha', 'ribera', 1640, 812, 'right'] },   // Sancha espera fuera (su hoja se carga al volver a la ribera)
    note('(La rueda arranca. La aceña tiembla. Una nube de harina lo cubre todo.)'),
    say('Ya muele.', 'duran'), { take: 'pertiga' }];
  rueda.verbs['use:pertiga'] = [{ if: 'rueda_libre', then: [say('La rueda ya gira. Misión cumplida.')], else: LIBERA }];
  rueda.verbs['use:pertiga_lazo'] = rueda.verbs['use:pertiga'];
  if (N.duran.reactions) delete N.duran.reactions.rueda_liberada;   // ya no da el saco: «Ya muele» basta
  rueda.verbs['use:cuerda'] = [say('Con una cuerda no saco un tronco. Necesito palanca.')];
  { const d = L.duran.nodes;
    d.problema.lines = [['duran', 'Un tronco atasca la rueda. El agua inunda el camino del embarcadero.'], ['duran', 'Haría falta algo largo para hacer palanca.']];
    d.barca.lines = [['duran', 'Martín. Gruñón, pero honrado.'], ['duran', 'Arréglame la rueda y te cruza gratis. Yo respondo.', '!rueda_libre'], ['duran', 'Ya le he dicho que eres de fiar.', 'rueda_libre']];
    d.hub.options = d.hub.options.filter(o => o.next !== 'saco'); }

  // ---- soto: Mingo en la higuera y su curiosidad (puzle 1: dos acciones, sin objetos)
  const OR = S.orilla;
  OR.firstEnter = [note('La orilla · Soto de los Sifones'), say('El crío ha subido por aquí. Seguro que lo oigo antes de verlo.')];
  dropH('orilla', ['cuenco_h']); hideL('orilla', ['cuenco']);
  H('orilla', 'parra').verbs = { look: [say('Una parra. Las uvas, verdes como mi suerte: hasta septiembre, nada.')], pick: [say('Agraces. Ni el ciego se las come.')] };
  H('orilla', 'higuera').verbs.look = [{ if: 'mingo_sigue', then: [say('Una higuera enorme. Higos, todavía no: es junio.')], else: [say('Una higuera enorme. Y en la rama baja, un crío con mi móvil.')] }];
  delete H('orilla', 'higuera').verbs['use:mingo'];
  const ESCONDIDO = { all: ['mingo_robo', '!mingo_sigue'] };
  const CURIOSO = [{ if: { all: ['mingo_robo', '!mingo_sigue', '!mingo_curioso'] }, then: [
    say('¿Qué? ¿Qué miras? ¡Desde aquí arriba no se ve el río!', 'mingo'), { set: 'mingo_curioso' }] }];
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
    note('Mingo te acompaña. Elígelo en el zurrón y toca algo para pedirle una trastada.')];
  for (const h of OR.hotspots) {
    if (h.exit || !h.verbs || !h.verbs.look) continue;
    const base = h.verbs.look;
    if (h.id === 'rio') h.verbs.look = [{ if: { all: ['mingo_curioso', '!mingo_sigue'] }, then: TRUCO, else: base.concat(CURIOSO) }];
    else h.verbs.look = base.concat(CURIOSO);
  }
  N.mingo.verbs.talk = [{ if: 'mingo_sigue', then: [{ dialogue: 'mingo' }], else: [say('¡No bajo! Aquí arriba tu espejo canta mejor.', 'mingo')] }];
  N.mingo.verbs.look = [{ if: 'mingo_sigue', then: [say('Mingo. Descalzo, con honda y un palo en la boca que no suelta.')],
    else: [say('El ladronzuelo, en la rama, trasteando MI móvil. Y mordisqueando un palo.')] }];
  delete N.mingo.verbs['give:racimo']; delete N.mingo.verbs['give:higos'];
  N.mingo.routines = [{ when: ESCONDIDO, steps: [{ wait: 6, anim: 'idle', face: 'left' }, { bark: '¡Este espejo canta! ¡Y sale un señor con tu cara!', every: 26 }, { wait: 5 }] }];
  { const m = L.mingo.nodes; m.start.options = m.start.options.filter(o => o.next !== 'leonor');
    m.talavera.lines = [['mingo', 'Murallas, curas, alfareros y Don Nuño, que cobra hasta por mirar.'], ['mingo', 'Por mirarle a él, el doble.']];
    m.robar.lines = [['mingo', 'Porque comer cuesta y robar es gratis. Hasta que te pillan.']]; }

  // ---- el ciego: gag opcional de las cerezas de la Vera (sin puzle)
  N.ciego.presentWhen = '!noche';
  N.ciego.verbs = { talk: [{ dialogue: 'ciego' }], look: [say('Un ciego viejo con una cesta de cerezas. Tararea desafinando… a propósito, diría yo.')],
    'give:*': [say('Eso no suena a moneda ni huele a comida.', 'ciego')], 'use:mingo': [say('Ni se te ocurra, que me conoce las pisadas.', 'mingo')] };
  N.ciego.routines = [{ steps: [{ wait: 7, anim: 'idle', face: 'left' }, { bark: '¡Cerezas de la Vera! ¡Rojas como Nuño cuando paga!', every: 34 }] }];
  L.ciego = { npc: 'ciego', start: [{ if: 'cerezas', node: 'despues' }, { node: 'cerezas' }], nodes: {
    cerezas: { lines: [['ciego', '¿Cerezas de la Vera? Siéntate. De dos en dos, que hay pocas.']],
      actions: [note('(Él coge de dos en dos. Tú, de tres en tres.)'), say('Me estás engañando, forastero.', 'ciego'), say('¿Cómo lo sabe?'),
        say('Porque yo cojo de dos en dos… y tú callas.', 'ciego'), { set: 'cerezas' }, { mood: ['ciego', 'grin'] }], next: 'end' },
    despues: { lines: [['ciego', 'Se acabaron las cerezas. La gracia, no.']], next: 'end' } } };

  // ---- Chamelo: Rai y el paloduz (puzle 3: una acción)
  const CHM = S.chamelo;
  CHM.onEnter = [
    { if: { all: ['!rai_conocido', '!noche'] }, then: [{ wait: 0.4 },
      say('¡Botas blancas! Digo… bienvenido, forastero.', 'leonor'),
      say('¿Nos conocemos?'),
      say('Conozco a todo el que cruza el vado. A ti… casi.', 'leonor'), { set: 'rai_conocido' }] },
    { if: { all: ['requete_1', '!confesion'] }, then: [{ wait: 0.5 },
      say('¿Me he perdido algo?', 'leonor'),
      note('(Rai tiene la túnica llena de pelos negros. Muchos.)'),
      say('Rai. ¿Qué me pasó? ¿Por qué estoy aquí?'),
      { vineta: ['rai_caldero', 'El caldero de Rai'] },
      say('Pretendía mirar el futuro.', 'leonor'),
      say('¿Y me trajiste aquí?'),
      say('La magia nunca fue una ciencia exacta.', 'leonor'),
      say('Te devuelvo la noche del eclipse, el 7 de junio.', 'leonor'),
      say('Con la Luna roja, la campana de Talavera abre la puerta.', 'leonor'),
      { set: 'confesion' }, { rc17: 'fadeout' }, { rc17: 'day' },
      note('(Amanece.)'),
      { npcPlace: ['sancha', 'plaza', 470, 790, 'right'] },
      { goto: ['plaza', 'from_puerta'] }] }
  ];
  const PALODUZ = [
    say('¿Mi palo? ¡Si está chupado!', 'mingo'),
    note('(Rai se lo quita de la boca. Lo prueba. Cierra los ojos. Suspira.)'),
    say('Paloduz de la vega. Gloria bendita.', 'leonor'),
    note('(Sin mirar, despliega un mapa. Del revés.)'),
    say('Está del revés.'),
    say('Para el que viene de lejos, todo está del revés.', 'leonor'),
    { set: 'mapa_rai' }, { sfx: 'success' },
    say('¿Qué tal el viaje? …Digo, el camino.', 'leonor'),
    note('Ya tienes el mapa: el botón está a la derecha, bajo el «?».')];
  N.leonor.verbs = Object.assign({}, N.leonor.verbs, {
    talk: [{ dialogue: 'rai17' }],
    'give:mingo': [{ if: 'mapa_rai', then: [say('Ya le di mi palo. Lo demás no se mastica.', 'mingo')],
      else: [{ if: 'pide_paloduz', then: PALODUZ, else: [say('¿Y yo qué le hago a un brujo?', 'mingo')] }] }],
    'give:*': [say('Eso no es dulce. Lo que no es dulce no me interesa.', 'leonor')]
  });
  L.rai17 = { npc: 'leonor', start: [{ if: 'confesion', node: 'despues' }, { if: 'mapa_rai', node: 'mapa' }, { node: 'pide' }], nodes: {
    pide: { lines: [['player', 'Necesito saber dónde estoy. ¿Tienes un mapa?'], ['leonor', 'Mapas tengo. Pero el saber se paga en paloduz.'],
      ['leonor', 'Raíz dulce, de ribera. Los críos la mascan todo el día.']], actions: [{ set: 'pide_paloduz' }], next: 'end' },
    mapa: { lines: [['leonor', 'Yo de viajes no sé nada. Nada de nada.']], next: 'end' },
    despues: { lines: [['leonor', 'La campana, la Luna roja y tú. No faltes.']], next: 'end' } } };

  // ---- embarcadero y travesía: Martín cruza gratis al de la rueda (sin amarre)
  const EM = S.embarcadero;
  EM.firstEnter = [];
  dropH('embarcadero', ['amarre']); hideL('embarcadero', ['amarre']);
  const CRUZAR = [{ if: '!mapa_rai', then: [
    say('¿Botas blancas? Rai, el del Chamelo, pregunta por ti desde ayer.', 'alfonso'),
    say('¿Por mí?'), say('Ve a verle. Luego te cruzo.', 'alfonso')],
    else: [say('¿El de la rueda? Sube. A los héroes les cobro a la vuelta.', 'alfonso'), { set: 'barca_libre' }, { goto: ['travesia', 'start'] }] }];
  H('embarcadero', 'barca').verbs = { look: [say('La barca de Martín. Fondo plano y mucha paciencia.')], use: CRUZAR };
  N.alfonso.verbs = { talk: CRUZAR, look: [say('Martín, el barquero. Sombrero de paja y cara de cobrar a la vuelta.')], 'give:*': [say('Guárdatelo. Aquí se paga con hechos.', 'alfonso')] };
  N.alfonso.routines = [];
  S.travesia.onEnter = [{ if: '!cruzado', then: [{ wait: 0.5 },
    say('Talavera. Murallas, pan… y Don Nuño, que cobra hasta el aire.', 'alfonso_b'),
    say('¿Hasta el aire?'), say('El que respiras de más.', 'alfonso_b'), { set: 'cruzado' }] },
    { goto: ['puerta_rio', 'from_travesia'] }];

  // ---- Puerta del Río: los Giles discuten y entras (cero acciones). Fuera carreta, cartel y Nuño.
  const PR = S.puerta_rio;
  PR.firstEnter = [
    say('¡Alto! Al forastero lo registro yo.', 'gil_a'),
    say('No, yo. Tú registras a los que salen.', 'gil_b'),
    say('¡Pues que salga primero!', 'gil_a'),
    note('(Mientras discuten, entras en Talavera.)'),
    { set: ['pase_puerta', 'nuno_conoce'] }, { walk: [1470, 700] }, { goto: ['plaza', 'from_puerta'] }];
  H('puerta_rio', 'exit_plaza').exit.when = null;
  dropH('puerta_rio', ['bando', 'carreta', 'ladrillos', 'viga', 'tarifas']); hideL('puerta_rio', ['bando', 'ladrillos_paso', 'viga_suelo', 'regla_visible']);
  N.yucaf.presentWhen = 'nunca_jamas'; N.nuno_puerta.presentWhen = 'nunca_jamas';
  for (const g of ['gil_a', 'gil_b']) { N[g].presentWhen = '!alfar_activo';
    N[g].verbs = { talk: [say('Yo registro a los que entran.', 'gil_a'), say('Y yo a los que salen. Nadie ha salido nunca.', 'gil_b')], look: [say('Gil del Paso y Gil del Peso. Dos guardias y ninguna idea.')], 'give:*': [say('Eso habría que registrarlo. ¿Quién lo registra?', g)] }; }
  { const ex = H('puerta_rio', 'exit_corredera'); ex.rect = [2070, 600, 130, 280]; }
  PR.hotspots.push({ id: 'poste17', name: 'Poste indicador', rect: [1960, 414, 250, 186], walkTo: [2050, 800], default: 'use',
    verbs: { look: [say('Un poste indicador. Arriba, «A TALAVERA». Ese brazo baila un poco.')],
      use: [say('Mejor no lo toco. Alguien se perdería.')] } });

  // =====================================================================================================
  // 4 · ACTO II — AVENTURAS Y AMISTADES
  N.sancha.presentWhen = '!sancha_oculta';
  N.sancha.verbs = { talk: [{ dialogue: 'sancha' }], look: [say('Sancha. Recia, lista y con harina hasta en las cejas.')],
    'give:*': [say('Guárdatelo. Yo cambio pan por buena conversación.', 'sancha')] };
  N.sancha.routines = [{ when: '!noche', steps: [{ wait: 9, anim: 'idle' }, { bark: '¡Pan de hoy! ¡El de ayer ya tiene otro oficio!', every: 40 }] }];
  L.sancha = { npc: 'sancha', start: 'hub', nodes: {
    hub: { lines: [['sancha', '¿Qué se te ofrece, forastero?']], options: [
      opt('¿Quién es Don Nuño?', 'nuno', null, { once: true }), opt('¿Y tú, quién eres?', 'quien', null, { once: true }), opt('Nada, gracias.', 'end')] },
    nuno: { lines: [['sancha', 'El administrador de la señora de Oropesa. Tasa hasta el aire.']], next: 'hub' },
    quien: { lines: [['sancha', 'Sancha. Panadera. Lo demás ni se pregunta ni se tasa.']], next: 'hub' } } };

  // ---- Plaza: llegada (Sancha te lleva al alfar), Lope sin trucos, la noticia del secuestro
  const PL = S.plaza;
  PL.firstEnter = [say('¡Talavera os saluda! Y Don Nuño os cobra el saludo.', 'pregonero'),
    say('¡Forastero! Nuño va a cerrar el alfar de Yuçaf. Ven.', 'sancha'),
    { npcWalk: ['sancha', 900, 800] }, { npcPlace: ['sancha', 'alfar', 880, 815, 'left'] }];
  PL.onEnter = [{ if: { all: ['confesion', '!oropesa_secuestrada'] }, then: [{ wait: 0.4 },
    { set: 'oropesa_secuestrada' },
    say('¡Han secuestrado a la señora de Oropesa! ¡Piden su peso en oro!', 'pregonero'),
    say('Anoche vi a cuatro subirla a los cuartos de la Taberna del Miedo.', 'sancha'),
    { npcWalk: ['sancha', 80, 790] },
    { npcPlace: ['sancha', 'taberna', 2300, 805, 'left'] }, { set: 'sancha_oculta' },
    { rc17: 'cuadrillaTaberna' },
    note('OBJETIVO: rescatar a la señora de Oropesa.')] }];
  dropH('plaza', ['banco_lope']); hideL('plaza', ['hilo_visible']);
  H('plaza', 'exit_portazgo').exit.when = 'nunca_jamas';
  H('plaza', 'exit_portazgo').exit.deny = [say('Cerrado: «horario de tasas, de nunca a jamás».')];
  Object.assign(H('plaza', 'exit_audiencia').exit, { when: 'oropesa_rescatada', deny: [say('En la Plaza Mayor, hoy, solo hay palomas. Y Nuño, cobrándoles.')] });
  N.lope.verbs = { talk: [{ dialogue: 'lope' }], look: [say('Maese Lope, herrero. Un orgullo que no cabe en la fragua.')], 'give:*': [say('Eso no es hierro. No me interesa.', 'lope')] };
  N.lope.routines = [{ when: '!noche', steps: [{ wait: 6, anim: 'work' }, { bark: '¡Herraduras, rejas y orgullo! Lo último no se vende.', every: 38 }] }];
  L.lope = { npc: 'lope', start: 'hub', nodes: {
    hub: { lines: [['lope', 'Hierro que toco, hierro que dura.']], options: [opt('¿Y la campana de Santa María?', 'campana', null, { once: true }), opt('Hasta luego.', 'end')] },
    campana: { lines: [['lope', 'Tiene el yugo flojo. Cuando haga falta, sonará.']], next: 'hub' } } };
  N.pregonero.routines = [{ when: '!noche', steps: [{ wait: 9 }, { bark: '¡Se pregona que hoy no hay nada que pregonar!', every: 44 }] }];
  N.pregonero.verbs = Object.assign({}, N.pregonero.verbs, { talk: [say('¡Si tienes noticia, la pregono! Si no, me la invento.', 'pregonero')] });
  N.benito.verbs = Object.assign({}, N.benito.verbs, { talk: [say('Santa María tiene la campana más bonita de Talavera. Cuando suena.', 'benito')] });
  delete N.benito.verbs['give:badajo'];

  // ---- PUZLE 5 · El alfar que no se puede cerrar (dos acciones: tiro + carbón)
  const AL = S.alfar;
  AL.firstEnter = [];
  N.yucaf_alfar.presentWhen = null; N.yucaf_alfar.start = [640, 805]; N.yucaf_alfar.facing = 'right';
  N.yucaf_alfar.routines = [{ steps: [{ wait: 6, face: 'right' }] }];
  N.yucaf_alfar.verbs = Object.assign({}, N.yucaf_alfar.verbs, { talk: [{ if: 'alfar_devuelto', then: [say('Mi alfar es tu alfar. Pero el barro lo amasas tú.', 'yucaf_alfar')],
    else: [{ if: 'embargo_aplazado', then: [say('Mientras el horno arda, aquí no entra un lacre.', 'yucaf_alfar')], else: [say('¡Que no me lo cierre! Hay una hornada dentro.', 'yucaf_alfar')] }] }] });
  const npc = (id, o) => { N[id] = Object.assign({ id, verbs: {}, routines: [] }, o); };
  npc('nuno_alfar', { name: 'Don Nuño', character: 'nuno', scene: 'alfar', start: [1070, 792], facing: 'left', presentWhen: '!embargo_aplazado',
    verbs: { talk: [say('Tres dineros son tres dineros. Y con tasa, nueve.', 'nuno_alfar')], look: [say('Don Nuño, con su pluma, su anillo y su barra de lacre.')], 'give:*': [say('¿Eso paga la deuda? No. Siguiente.', 'nuno_alfar')] } });
  npc('gil_alfar_a', { name: 'Gil del Paso', character: 'guardia', scene: 'alfar', start: [1260, 786], facing: 'left', presentWhen: { all: ['p02_visto', '!embargo_aplazado'] },
    verbs: { talk: [say('Yo busco el lacre. Él busca que lo busque yo.', 'gil_alfar_a')], look: [say('Gil del Paso, registrando a Gil del Peso.')] } });
  npc('gil_alfar_b', { name: 'Gil del Peso', character: 'guardia', scene: 'alfar', start: [1360, 800], facing: 'left', presentWhen: { all: ['p02_visto', '!embargo_aplazado'] },
    verbs: { talk: [say('El lacre lo tiene Don Nuño. Pero no se lo digas.', 'gil_alfar_b')], look: [say('Gil del Peso, registrando a Gil del Paso.')] } });
  const FIN_P02 = [{ rc17: 'hornoRuge' },
    say('¡Cerrad el taller!', 'nuno_alfar'),
    say('¿Con el horno encendido?', 'sancha'),
    say('Hasta que enfríe, aquí no cierra nadie.', 'yucaf_alfar'),
    note('(Nuño mira el alfar. Mira el horno. Mira su mano: el lacre se le derrite en el anillo.)'),
    say('¡Mi anillo!… Volveré.', 'nuno_alfar'),
    { npcWalk: ['nuno_alfar', 1480, 782] },
    note('(Los guardias le siguen, registrándose el uno al otro.)'),
    { set: 'embargo_aplazado' }, { unset: 'alfar_activo' }, { sfx: 'success' },
    say('Volverá. Con más tasas y menos pluma.', 'sancha'),
    say('Esta noche, a la Taberna del Miedo. El viejo soldado invita.', 'sancha'),
    { npcPlace: ['lope', 'taberna', 1300, 792, 'right'] }, { npcPlace: ['leonor', 'taberna', 250, 790, 'right'] }, { set: 'rai_oculto' },
    { rc17: 'fadeout' }, { rc17: 'night' }, note('(Cae la tarde sobre Talavera.)'), { rc17: 'fadein' }];
  const TIRO = [{ if: 'embargo_aplazado', then: [say('El horno ya respira solo.')], else: [{ if: 'tiro_abierto', then: [say('La trampilla ya está abierta.')],
    else: [{ if: '!alfar_activo', then: [say('Es el horno de Yuçaf. No toco lo que no es mío.')], else: [
      { sfx: 'door' }, { set: 'tiro_abierto' }, note('(Tiras de la cadena. La trampilla de arriba se abre y el horno toma aire.)'), say('¡Eso, que respire!', 'yucaf_alfar')] }] }] }];
  const CARBON = [{ if: 'embargo_aplazado', then: [say('Mejor no. Ya ruge bastante.')], else: [{ if: '!alfar_activo', then: [say('Carbón de encina. Del bueno.')],
    else: [{ if: '!tiro_abierto', then: [say('Sin tiro, el carbón se ahoga.', 'yucaf_alfar')],
      else: [note('(Una palada de carbón. El horno se traga el aire y ruge.)'), { set: 'carbon_echado' }, ...FIN_P02] }] }] }];
  H('alfar', 'horno').verbs = {
    look: [{ if: 'carbon_echado', then: [say('El horno ruge. Nadie lo cierra hasta que enfríe.')], else: [{ if: 'tiro_abierto', then: [say('Ahora respira. Pero le falta comida.')], else: [say('El horno de Yuçaf. Apenas tira: el fuego se ahoga.')] }] }],
    use: [say('Por algún sitio tiene que respirar. Esa cadena de hierro…')], pick: [say('Un horno de alfarero. Ni con Mingo.')] };
  AL.hotspots.push(
    { id: 'tiro', name: 'Cadena del tiro', rect: [536, 300, 110, 290], walkTo: [610, 790], face: 'left', default: 'use',
      verbs: { look: [{ if: 'tiro_abierto', then: [say('La trampilla del tiro, abierta. El horno respira.')], else: [say('Una cadena sube hasta una trampilla de hierro en lo alto del horno. Cerrada.')] }], use: TIRO, pick: TIRO } },
    { id: 'carbon', name: 'Cesta de carbón', rect: [0, 585, 150, 155], walkTo: [150, 800], face: 'left', default: 'use',
      verbs: { look: [say('Carbón de encina y una pala.')], use: CARBON, pick: CARBON } });
  AL.onEnter = [
    { if: '!p02_visto', then: [{ set: ['p02_visto', 'alfar_activo'] }, { wait: 0.4 },
      say('Por tres dineros de deuda, este alfar queda precintado.', 'nuno_alfar'),
      say('¡Tengo una hornada dentro!', 'yucaf_alfar'),
      say('Pues precintada también. ¡Guardias, el lacre!', 'nuno_alfar'),
      say('¿Quién lo tiene?', 'gil_alfar_a'), say('Tú.', 'gil_alfar_b'),
      note('(Los guardias se registran el uno al otro. Hay tiempo.)')] }];
  hideL('alfar', ['pajar']); dropH('alfar', ['pajar']);
  H('alfar', 'sacos').verbs = { look: [say('Sacos de arena fina para el barro.')] };

  // ---- Taberna: Lope y la lanza de Alonso (su nombre), y Rai da la alarma
  const TB = S.taberna;
  N.leonor.presentWhen = '!rai_oculto';
  N.soldado.presentWhen = null;
  for (const id of ['arriero', 'peregrina']) N[id].presentWhen = { any: ['!oropesa_secuestrada', 'oropesa_rescatada'] };
  TB.onEnter = [
    { if: { all: ['embargo_aplazado', '!lanza_vista'] }, then: [{ set: 'lanza_vista' }, { wait: 0.4 },
      say('Tu lanza. Recta como mi palabra.', 'lope'),
      say('Me la torció un moro de dos varas.', 'soldado'),
      say('Te la torció una puerta, Alonso.', 'lope'),
      { rc17: 'alonso' }, note('(Así que el viejo soldado se llama Alonso.)'),
      { unset: 'rai_oculto' }, { npcWalk: ['leonor', 700, 790] },
      say('¡Antorchas en el soto! Cuatro tipos discutiendo un mapa.', 'leonor'),
      say('¡A mí la lanza!', 'soldado'),
      note('(Alonso se levanta… y se vuelve a sentar. La rodilla.)'),
      say('Ve tú, forastero. Yo voy… por otro lado.', 'leonor'),
      { npcPlace: ['leonor', 'chamelo', 1235, 727, 'left'] }, { npcPlace: ['lope', 'plaza', 800, 790, 'right'] },
      { set: 'noche_soto' }, { rc17: 'fadeout' }, { goto: ['orilla', 'from_chamelo'] }] },
    { if: { all: ['oropesa_secuestrada', '!p04_visto'] }, then: [{ set: 'p04_visto' }, { wait: 0.4 },
      say('¡Soltadme, bellacos! Peso lo justo.', 'oropesa'),
      say('Pesarás lo que diga la balanza, señora.', 'requete_a'),
      { rc17: 'zzz' }] }];
  N.soldado.routines = [{ when: { all: ['oropesa_secuestrada', '!oropesa_rescatada'] }, steps: [{ wait: 6, anim: 'idle' }, { bark: 'Zzz… Las Navas… zzz…', every: 22 }] }];

  // ---- PUZLE 6 · La primera Requeteconquista (en el soto, de noche; una acción: llamar al gato)
  const REQ = ['requete_a', 'requete_b', 'requete_c', 'requete_d'];
  const REQ_ON = { any: [{ all: ['noche_soto', '!requete_1'] }, { all: ['oropesa_secuestrada', '!oropesa_rescatada'] }, { all: ['requete_vuelve', '!requete_fin'] }] };
  const RQ_TALK = {
    requete_a: '¡Atrás! Esto es una reunión secreta. Muy secreta.',
    requete_b: 'No me distraigas, que pierdo el hilo de la discusión.',
    requete_c: '¿Traes comida? Conquistar da mucha hambre.',
    requete_d: 'Yo ya conquisté Talabayra una vez. O lo soñé.' };
  const RQ_BARK = {
    requete_a: ['¡Por la puerta principal!', '¡Os lo dije: atacamos a la hora de la siesta!', '¡Yo voy delante!'],
    requete_b: ['¡Rodeando la muralla!', '¡A esa hora duerme hasta el enemigo!', '¡Delante voy yo!'],
    requete_c: ['¡Primero fundamos una taifa!', '¿Y si la pesamos en plata, que pesa más?', '¡Que vaya delante el más alto!'],
    requete_d: ['¿Y si cenamos antes?', 'Yo la pesaba en higos.', '¡El más alto soy yo!'] };
  const ORI = { requete_a: [2560, 705, 'right'], requete_b: [2780, 705, 'left'], requete_c: [2610, 772, 'right'], requete_d: [2740, 778, 'left'] };
  REQ.forEach((id, i) => {
    npc(id, { name: CH[id].name, character: id, scene: 'orilla', start: ORI[id].slice(0, 2), facing: ORI[id][2], presentWhen: REQ_ON,
      verbs: { talk: [say(RQ_TALK[id], id)], look: [say(i === 0 ? 'El cabecilla de la Requeteconquista. Mucho turbante, poco acuerdo.' : 'Uno de la Requeteconquista. Discute por profesión.')],
        'give:*': [say('¡Soborno! …¿Cuánto?', id)] },
      routines: [
        { when: { all: ['noche_soto', '!requete_1'] }, steps: [{ wait: 3 + i * 2.3 }, { bark: RQ_BARK[id][0], every: 9 + i * 2 }, { wait: 4 }] },
        { when: { all: ['oropesa_secuestrada', '!oropesa_rescatada'] }, steps: [{ wait: 4 + i * 2.1 }, { bark: RQ_BARK[id][1], every: 12 + i * 3 }, { wait: 4 }] },
        { when: { all: ['requete_vuelve', '!requete_fin'] }, steps: [{ wait: 3 + i * 1.9 }, { bark: RQ_BARK[id][2], every: 8 + i * 2 }, { wait: 3 }] }] });
  });
  const GATO = [
    say('Mis, mis, mis…'),
    { npcWalk: ['gato', 2668, 742] },
    say('¡Un gato negro sobre la ruta! ¡Mal agüero!', 'requete_b'),
    say('¡En Córdoba es buen agüero!', 'requete_a'),
    { rc17: 'mapaRoto' },
    note('(Cada uno tira de una esquina. El mapa se parte en cuatro: uno para cada uno.)'),
    say('¡Por fin, cada cual con su ruta!', 'requete_c'),
    say('¡Retirada estratégica!', 'requete_a'),
    { npcWalk: ['requete_a', 2470, 708] },
    note('(Retroceden tres pasos. Y vuelven a acampar.)'),
    { npcWalk: ['gato', 3010, 735] }, { rc17: 'guino' }, { wait: 1.3 },
    { set: 'requete_1' }, { rc17: 'fadeout' }, { goto: ['chamelo', 'from_orilla'] }];
  npc('gato', { name: 'Gato negro', character: 'gato', scene: 'orilla', start: [3020, 735], facing: 'left', talkDistance: 90,
    presentWhen: { any: [{ all: ['noche_soto', '!requete_1'] }, 'presente'] },
    verbs: { talk: [{ if: 'presente', then: [say('¿Rai?')], else: GATO }], look: [say('Un gato negro. Me mira como si me conociera.')], 'give:*': [say('El gato lo mira. Te mira. Bosteza.')] } });
  OR.onEnter = [{ if: { all: ['noche_soto', '!requete_1'] }, then: [{ wait: 0.6 }, say('Antorchas. Y cuatro señores que no se ponen de acuerdo en nada.')] }];
  OR.layers.push({ id: 'mapa_suelo', z: 'back', x: 2600, y: 722, w: 140, h: 44, placeholder: 'rc17_mapa', visibleWhen: { all: ['noche_soto', '!mapa_roto'] } },
    { id: 'mapa_roto', z: 'back', x: 2590, y: 718, w: 160, h: 52, placeholder: 'rc17_mapa_roto', visibleWhen: { all: ['noche_soto', 'mapa_roto'] } });

  // ---- PUZLE 7 · El peso de la señora de Oropesa (taberna; dos acciones: cuña de la mesa → soporte de la balanza)
  I.cuna17 = { name: 'Cuña', short: 'Cuña', look: [say('La cuña de la mesa coja. Pequeña, pero sostiene el mundo. O una mesa.')] };
  I.hogaza = { name: 'Hogaza de Sancha', short: 'Hogaza', look: [say('Una hogaza de Sancha. Todavía caliente.')] };
  npc('oropesa', { name: 'La señora de Oropesa', character: 'oropesa', scene: 'taberna', start: [1965, 776], facing: 'right',
    presentWhen: { any: [{ all: ['oropesa_secuestrada', '!oropesa_rescatada'] }, 'oropesa_rescatada'] },
    verbs: { talk: [{ if: 'oropesa_rescatada', then: [say('Te debo una, forastero. Y yo pago mis deudas. A diferencia de otros.', 'oropesa')],
      else: [say('¡No te quedes mirando! Haz algo útil. O al menos algo.', 'oropesa')] }],
      look: [say('La señora de Oropesa. Atada, ofendida y perfectamente peinada.')], 'give:cuna17': 'PONER', 'give:*': [say('¿Eso es un rescate? Me esperaba algo más.', 'oropesa')] } });
  const P4_ON = { all: ['oropesa_secuestrada', '!oropesa_rescatada'] };
  const TBP = R17.TBP = { requete_a: [1790, 796, 'right'], requete_b: [2250, 798, 'left'], requete_c: [2160, 808, 'left'], requete_d: [1700, 806, 'right'] };
  const PESAJE = [
    say('¡A pesar a la señora!', 'requete_a'),
    note('(La balanza marca… lo que pesa una gallina.)'),
    say('¡Por fin una balanza honrada!', 'oropesa'),
    say('¡Otra vez!', 'requete_b'),
    note('(Ahora marca tres bueyes.)'),
    say('¿Tres bueyes? ¡Insolentes!', 'oropesa'),
    say('¡Se pesa de pie!', 'requete_c'), say('¡Sentada!', 'requete_d'),
    say('¡¿Quién osa?!', 'soldado'),
    { npcSpeed: ['soldado', 560] }, { npcWalk: ['soldado', 1870, 798] },
    note('(Alonso carga. La lanza se engancha en la cuerda de las pesas. Tira. Caen las pesas y ruedan las monedas.)'),
    { rc17: 'monedas' },
    say('¡El oro!', 'requete_a'),
    { unset: 'sancha_oculta' },
    note('(Los cuatro se tiran al suelo a por las monedas. Sancha entra por detrás y desata a la señora.)'),
    say('¿Ese es vuestro mejor soldado?', 'oropesa'),
    say('El único.', 'sancha'),
    say('Tú eres Sancha Alfonso. La hija del rey de León.', 'oropesa'),
    say('Y panadera. Lo segundo me sale mejor.', 'sancha'),
    { set: 'oropesa_rescatada' }, { sfx: 'success' },
    say('A la Plaza Mayor. Hoy cobro yo.', 'oropesa'),
    { npcPlace: ['oropesa', 'audiencia', 820, 760, 'left'] }, { npcPlace: ['sancha', 'audiencia', 560, 792, 'right'] },
    { npcPlace: ['soldado', 'taberna', 1470, 795, 'left'] }, { npcSpeed: ['soldado', 110] },
    { rc17: 'fadeout' }, { goto: ['audiencia', 'from_plaza'] }];
  const PONER = [{ if: 'cuna_puesta', then: [say('Ya está calzada. Ahora, a esperar.')], else: [
    { take: 'cuna17' }, { set: 'cuna_puesta' }, { sfx: 'combine' },
    note('(Metes la cuña bajo el soporte del platillo. Nadie mira: están contando monedas.)'), ...PESAJE] }];
  N.oropesa.verbs['give:cuna17'] = PONER;
  for (const id of REQ) N[id].verbs['give:cuna17'] = [say('¿Una cuña? ¿Para qué queremos una cuña?', id)];
  const CUNA = [{ give: 'cuna17' }, { set: 'cuna_mesa_cogida' }, { sfx: 'pick' },
    note('(La mesa se tambalea. La jarra de Alonso se vuelca. Alonso sigue roncando.)')];
  { const mesa = H('taberna', 'mesa'), base = mesa.verbs.look || [];
    mesa.default = 'pick';
    mesa.verbs = Object.assign({}, mesa.verbs, {
      look: [{ if: { all: ['p04_visto', '!cuna_mesa_cogida'] }, then: [say('La mesa del fuego cojea. Alguien le ha calzado una cuña.')], else: base }],
      pick: [{ if: { all: ['p04_visto', '!cuna_mesa_cogida'] }, then: CUNA, else: [say('Una mesa junto al fuego. Cojea, pero con dignidad.')] }] }); }
  TB.hotspots.push({ id: 'balanza', name: 'Balanza enorme', rect: [1890, 470, 300, 330], walkTo: [1880, 800], face: 'right', visibleWhen: P4_ON, default: 'look',
    verbs: { look: [say('Una balanza enorme. Su soporte cojea. Como la mesa del fuego.')],
      use: [say('Si la toco ahora, me ven. Mejor algo pequeño y discreto.')], 'use:cuna17': PONER } });
  TB.layers.push({ id: 'balanza', z: 'back', x: 1880, y: 470, w: 320, h: 330, placeholder: 'rc17_balanza', visibleWhen: P4_ON },
    { id: 'cuna_bal', z: 'back', x: 1925, y: 772, w: 40, h: 22, placeholder: 'rc17_cuna', visibleWhen: { all: ['cuna_puesta', '!oropesa_rescatada'] } },
    { id: 'cuna_mesa', z: 'back', x: 1182, y: 736, w: 50, h: 24, placeholder: 'rc17_cuna_clara', visibleWhen: '!cuna_mesa_cogida' });

  // ---- Destitución de Nuño (Plaza Mayor), sin puzle
  const AU = S.audiencia;
  AU.firstEnter = [];
  N.mayordomo.presentWhen = 'nunca_jamas'; N.pregonero_vista.presentWhen = 'oropesa_rescatada';
  npc('yucaf_aud', { name: 'Yuçaf', character: 'yucaf', scene: 'audiencia', start: [1300, 792], facing: 'left', presentWhen: 'oropesa_rescatada',
    verbs: { talk: [say('¡Mi alfar! Te haré un cántaro con tu cara. Bueno, con la de Mingo.', 'yucaf_aud')], look: [say('Yuçaf, el alfarero. Hoy sonríe con toda la barba.')] } });
  N.nuno_aud.presentWhen = '!nuno_destituido';
  N.nuno_aud.verbs = { talk: [say('Destituido no. «Reubicado en el sector ovino».', 'nuno_aud')], look: [say('Don Nuño, sin sello. Parece más bajito.')] };
  AU.onEnter = [{ if: { all: ['oropesa_rescatada', '!nuno_destituido'] }, then: [{ wait: 0.5 },
    say('Señora, por el rescate corresponde una tasa de…', 'nuno_aud'),
    say('Tu sello, Nuño.', 'oropesa'),
    note('(Nuño entrega el sello. Antes se mira un momento en el móvil del forastero. Se gusta. Suspira.)'),
    say('El alfar vuelve a Yuçaf. Y tú, a contar ovejas.', 'oropesa'),
    say('¿Con tasa?', 'nuno_aud'), say('Sin.', 'oropesa'),
    { npcWalk: ['nuno_aud', 1560, 800] },
    { set: ['nuno_destituido', 'alfar_devuelto'] }, { sfx: 'success' },
    say('¡Mi alfar! Te haré un cántaro con tu cara, señora.', 'yucaf_aud'),
    say('¡Don Nuño, destituido! ¡Y sin tasa por pregonarlo!', 'pregonero_vista'),
    { rc17: 'fadeout' }, note('(Esa tarde, la cuadrilla vuelve a la Puerta del Río. A discutir quién va delante.)'),
    { set: 'requete_vuelve' },
    { npcPlace: ['requete_a', 'puerta_rio', 1700, 760, 'right'] }, { npcPlace: ['requete_b', 'puerta_rio', 1810, 800, 'left'] },
    { npcPlace: ['requete_c', 'puerta_rio', 1590, 805, 'right'] }, { npcPlace: ['requete_d', 'puerta_rio', 1880, 775, 'left'] },
    { goto: ['puerta_rio', 'from_plaza'] }] }];

  // ---- PUZLE 8 · La aldea de los que siempre llegan tarde (poste de la Puerta del Río; una acción)
  PR.onEnter = [{ if: { all: ['requete_vuelve', '!requete_fin'] }, then: [{ wait: 0.4 }, say('¡Yo voy delante!', 'requete_a'), say('¡Delante voy yo, que soy más alto!', 'requete_d')] }];
  const P05 = [
    note('(Mientras discuten quién va delante, giras el brazo «A TALAVERA» hacia el camino de la aldea.)'),
    { set: 'poste_girado' }, { sfx: 'door' },
    say('¡Mirad! «A Talabayra».', 'requete_c'),
    say('¡Una ruta nueva! ¡Estratégica!', 'requete_a'),
    { npcWalk: ['requete_a', 2150, 830] },
    { set: 'requete_fin' }, { rc17: 'aldea' },
    { npcPlace: ['lope', 'iglesia', 360, 792, 'right'] }, { npcPlace: ['soldado', 'iglesia', 250, 800, 'right'] },
    { npcPlace: ['sancha', 'iglesia', 720, 805, 'left'] }, { npcPlace: ['leonor', 'iglesia', 1010, 790, 'left'] },
    note('OBJETIVO: esta noche es el eclipse. Todos te esperan en el atrio de Santa María.')];
  H('puerta_rio', 'poste17').verbs.use = [{ if: { all: ['requete_vuelve', '!requete_fin'] }, then: P05, else: [say('Mejor no lo toco. Alguien se perdería.')] }];

  // =====================================================================================================
  // 5 · ACTO III — LA LUNA ROJA
  const IG = S.iglesia;
  IG.firstEnter = [];
  N.benito.presentWhen = '!requete_fin';
  const FINAL = [{ set: 'campanada' }, { rc17: 'vuela' },
    note('(La campana suena hondo. Alonso, agarrado a la cuerda, sube hasta el campanario.)'),
    say('¡Victoria! …¿Alguien me baja?', 'soldado'),
    { rc17: 'portal' }, { wait: 1.2 },
    say('Para el camino. Que en Talavera no se pase hambre.', 'sancha'),
    { give: 'hogaza' }, { sfx: 'pick' },
    say('¿Volverás?', 'mingo'),
    say('Si me llama un sabio despistado.'),
    say('No prometo nada.', 'leonor'),
    { walk: [900, 792] }, { rc17: 'flash' },
    { unset: ['mingo_sigue', 'noche', 'eclipse'] }, { take: 'mingo' }, { set: 'presente' },
    { npcPlace: ['mingo', 'nada', 0, 0, 'left'] },
    { goto: ['ribera', 'presente'] }];
  const CAMPANA = [{ if: 'campanada', then: [say('Ya ha sonado. Y cómo.')], else: [{ if: 'luna_roja', then: FINAL,
    else: [{ if: 'eclipse', then: [say('¡Aún no! Espera a que se ponga roja.', 'leonor')], else: [say('La campana de Santa María. Lope dice que tiene el yugo flojo.')] }] }] }];
  for (const id of ['campana', 'cuerda_campana']) { const h = H('iglesia', id); h.default = 'use'; h.verbs = { look: [say('La campana de Santa María, con su cuerda.')], use: CAMPANA, pick: CAMPANA }; delete h.verbs['use:badajo']; }
  IG.onEnter = [{ if: { all: ['requete_fin', '!campana_lista'] }, then: [{ set: 'campana_lista' }, { wait: 0.4 },
    note('(Lope sube al campanario. Un martillazo. Dos.)'), { sfx: 'campana' },
    say('No me he quemado. El hierro estaba caliente, que es distinto.', 'lope'),
    { rc17: 'eclipse' }, note('(Cae la noche. La Luna empieza a oscurecerse.)'),
    say('Alonso, la cuerda. Sancha, la gente. Mingo… quieto.', 'leonor'),
    { rc17: 'lunaRoja' },
    say('¡Ahora!', 'leonor'), { set: 'luna_roja' }] }];
  for (const id of ['lope', 'soldado', 'leonor', 'sancha']) N[id].routines = (N[id].routines || []).map(r => Object.assign({}, r, { when: r.when ? { all: [r.when, '!requete_fin'] } : '!requete_fin' }));

  // =====================================================================================================
  // 6 · PISTAS («?» y Mingo): la primera que se cumple
  D.hints = [
    { if: { all: ['luna_roja', '!campanada'] }, obj: 'Tocar la campana', text: '¡Ahora! Tira de la cuerda de la campana.' },
    { if: { all: ['requete_fin', '!campanada'] }, obj: 'La noche del eclipse', text: 'Ve al atrio de Santa María (entrada en la Plaza del Pan). Allí te esperan todos.' },
    { if: { all: ['requete_vuelve', '!requete_fin'] }, obj: 'Alejar a la cuadrilla', text: 'Discuten quién va delante. El poste indicador de la derecha tiene un brazo que baila…' },
    { if: { all: ['oropesa_rescatada', '!nuno_destituido'] }, obj: 'Ir a la Plaza Mayor', text: 'Arco de la derecha de la Plaza del Pan.' },
    { if: { all: ['oropesa_secuestrada', 'has:cuna17'] }, obj: 'Trucar la balanza', text: 'Pon la cuña bajo el soporte del platillo: elígela en el zurrón y toca la balanza.' },
    { if: { all: ['oropesa_secuestrada', 'p04_visto'] }, obj: 'Rescatar a la señora', text: 'El soporte de la balanza cojea… como la mesa del fuego. Esa mesa tiene una cuña.' },
    { if: 'oropesa_secuestrada', obj: 'Rescatar a la señora de Oropesa', text: 'Está en la Taberna del Miedo: sal por la Puerta del Río y sigue la muralla a la derecha.' },
    { if: { all: ['noche_soto', '!requete_1'] }, obj: 'Frustrar la Requeteconquista', text: 'No se ponen de acuerdo en nada. Ese gato negro que ronda… llámalo.' },
    { if: { all: ['embargo_aplazado', '!lanza_vista'] }, obj: 'Ir a la Taberna del Miedo', text: 'Sal por la Puerta del Río y sigue la muralla a la derecha: la Corredera del Cristo.' },
    { if: { all: ['alfar_activo', 'tiro_abierto'] }, obj: 'Avivar el horno', text: 'Echa una palada de carbón: la cesta está a la izquierda del horno.' },
    { if: 'alfar_activo', obj: 'Que no cierren el alfar', text: 'Nadie cierra un horno encendido. El de Yuçaf apenas tira: tira de la cadena del tiro, a la derecha del horno.' },
    { if: { all: ['pase_puerta', '!p02_visto'] }, obj: 'El alfar de Yuçaf', text: 'Sancha va al alfar: calle de los Olleros, a la derecha de la plaza.' },
    { if: { all: ['mapa_rai', '!cruzado'] }, obj: 'Cruzar a Talavera', text: 'Martín te cruza: ve al embarcadero (izquierda de la ribera) y toca su barca.' },
    { if: { all: ['pide_paloduz', '!mapa_rai'] }, obj: 'Conseguir paloduz', text: 'Raíz dulce que mascan los críos… Mingo lleva todo el día mordisqueando un palo. Elige a Mingo en el zurrón y toca a Rai.' },
    { if: { all: ['rueda_libre', 'mingo_sigue', { scene: 'chamelo' }, '!mapa_rai'] }, obj: 'Hablar con Rai', text: 'Tócale para hablar.' },
    { if: { all: ['rueda_libre', 'mingo_sigue', '!mapa_rai'] }, obj: 'Ver a Rai', text: 'Rai vive en la Isla del Chamelo: ve al soto (derecha de la ribera) y cruza el vado. Con la rueda girando, el agua ha bajado.' },
    { if: { all: ['mingo_robo', '!mingo_sigue', 'mingo_curioso'] }, obj: 'Engañar a Mingo', text: 'Desde la rama no ve el río. Mira el río como si hubieras visto algo increíble.' },
    { if: { all: ['mingo_robo', '!mingo_sigue', { scene: 'orilla' }] }, obj: 'Recuperar el móvil', text: 'Mingo no piensa bajar de la higuera… pero es muy curioso. Mira cosas del soto y fíjate en él.' },
    { if: { all: ['mingo_robo', '!mingo_sigue'] }, obj: 'Perseguir al ladronzuelo', text: 'El crío ha huido río arriba: sal por la derecha de la ribera, hacia el soto.' },
    { if: { all: ['!rueda_libre', 'sabe_tronco'] }, obj: 'Liberar la rueda', text: 'Coge la pértiga de la orilla de la ribera, entra en la aceña y úsala sobre la rueda.' },
    { if: '!rueda_libre', obj: 'Cruzar el Tajo', text: 'El camino del embarcadero está inundado. Entra en la aceña (la puerta de piedra) y habla con Durán.' }
  ];

  // =====================================================================================================
  // 7 · ARTE PROVISIONAL dibujado por código (balanza, cuña, mapa) e iconos
  const A = E.assets, cv = (w, h) => E.createCanvas(w, h);
  A.registerPlaceholder('rc17_cuna', (w, h) => { const c = cv(w, h), g = c.getContext('2d');
    g.fillStyle = '#8a5a2e'; g.strokeStyle = '#3a2412'; g.lineWidth = 2; g.beginPath(); g.moveTo(1, h - 1); g.lineTo(w - 1, h - 1); g.lineTo(w - 1, 2); g.closePath(); g.fill(); g.stroke(); return c; });
  A.registerPlaceholder('rc17_cuna_clara', (w, h) => { const c = cv(w, h), g = c.getContext('2d');
    g.fillStyle = '#d9a35a'; g.strokeStyle = '#3a2412'; g.lineWidth = 3; g.beginPath(); g.moveTo(2, h - 2); g.lineTo(w - 2, h - 2); g.lineTo(w - 2, 3); g.closePath(); g.fill(); g.stroke(); return c; });
  A.registerPlaceholder('rc17_balanza', (w, h) => { const c = cv(w, h), g = c.getContext('2d');
    const wood = '#6b4423', dark = '#2e1c0e', iron = '#5a5e66';
    g.lineCap = 'round'; g.strokeStyle = dark; g.lineWidth = 3;
    g.fillStyle = wood; g.fillRect(w / 2 - 12, 30, 24, h - 40); g.strokeRect(w / 2 - 12, 30, 24, h - 40);   // poste
    g.fillRect(w / 2 - 70, h - 18, 140, 16); g.strokeRect(w / 2 - 70, h - 18, 140, 16);                       // pie
    g.save(); g.translate(w / 2, 40); g.rotate(-0.05); g.fillStyle = iron; g.fillRect(-150, -7, 300, 14); g.strokeRect(-150, -7, 300, 14); g.restore();
    g.strokeStyle = '#3a3226'; g.lineWidth = 2;
    for (const [x0, y0, x1, y1] of [[10, 46, 8, h - 34], [44, 44, 70, h - 34], [w - 16, 34, w - 50, 210], [w - 16, 34, w - 4, 210]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.fillStyle = '#9a7240'; g.strokeStyle = dark; g.lineWidth = 3; g.fillRect(0, h - 36, 84, 12); g.strokeRect(0, h - 36, 84, 12);   // plataforma de la señora
    g.fillStyle = '#7a5530'; g.fillRect(40, h - 24, 22, 22); g.strokeRect(40, h - 24, 22, 22);                                         // soporte que cojea
    g.fillStyle = iron; g.beginPath(); g.ellipse(w - 27, 214, 34, 9, 0, 0, TAU); g.fill(); g.stroke();                                  // platillo de las pesas
    g.fillStyle = '#c9a227'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(w - 40 + (i % 3) * 12, 206 - Math.floor(i / 3) * 7, 7, 3, 0, 0, TAU); g.fill(); }
    g.fillStyle = '#3a3a40'; g.fillRect(w - 60, 180, 22, 24); g.fillRect(w - 34, 186, 18, 18);                                         // pesas
    return c; });
  const mapDraw = torn => (w, h) => { const c = cv(w, h), g = c.getContext('2d');
    const piece = (x, y, pw, ph, r) => { g.save(); g.translate(x + pw / 2, y + ph / 2); g.rotate(r); g.fillStyle = '#e8d6a6'; g.strokeStyle = '#6a5030'; g.lineWidth = 2; g.fillRect(-pw / 2, -ph / 2, pw, ph); g.strokeRect(-pw / 2, -ph / 2, pw, ph);
      g.strokeStyle = '#8a3a2a'; g.beginPath(); g.moveTo(-pw / 3, 0); g.quadraticCurveTo(0, -ph / 3, pw / 3, ph / 5); g.stroke(); g.restore(); };
    if (!torn) piece(6, 6, w - 12, h - 12, 0.03);
    else { piece(2, 2, w / 2 - 6, h / 2 - 2, -0.2); piece(w / 2 + 6, 4, w / 2 - 8, h / 2 - 4, 0.25); piece(6, h / 2 + 2, w / 2 - 8, h / 2 - 6, 0.15); piece(w / 2 + 4, h / 2, w / 2 - 6, h / 2 - 4, -0.12); }
    return c; };
  A.registerPlaceholder('rc17_mapa', mapDraw(false)); A.registerPlaceholder('rc17_mapa_roto', mapDraw(true));
  A.registerPlaceholder('item_cuna17', () => { const c = cv(96, 96), g = c.getContext('2d'); g.fillStyle = '#8a5a2e'; g.strokeStyle = '#3a2412'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(14, 70); g.lineTo(82, 70); g.lineTo(82, 30); g.closePath(); g.fill(); g.stroke(); return c; });
  A.registerPlaceholder('item_hogaza', () => { const c = cv(96, 96), g = c.getContext('2d'); g.fillStyle = '#b8742e'; g.strokeStyle = '#5a3412'; g.lineWidth = 4;
    g.beginPath(); g.ellipse(48, 54, 36, 24, 0, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = '#e8c27a'; g.lineWidth = 3;
    for (const x of [32, 48, 64]) { g.beginPath(); g.moveTo(x - 6, 44); g.lineTo(x + 6, 58); g.stroke(); } return c; });

  // =====================================================================================================
  // 8 · INSTALACIÓN: efectos de escena (horno, antorcha, harina, luna, pórtico, presente), viñeta de la aldea, mapa tras Rai
  const baseInstall = E.rc07 && E.rc07.install;
  if (baseInstall) E.rc07.install = G => {
    baseInstall(G);
    const ng0 = G.newGame;
    G.newGame = () => { Object.assign(R17, { moon: 0, portal: 0, flash: 0, oven: 0, coins: 0, lift: 0, flour: 0, card: null }); N.soldado.name = 'Viejo soldado'; return ng0(); };
    const rd0 = E.rig.draw;
    E.rig.draw = (ctx, a, scale, camX) => a.def.rig && a.def.rig.cat ? drawCat(ctx, a, scale, camX) : rd0(ctx, a, scale, camX);
    if (E.journey) {
      const b0 = E.journey.button, o0 = E.journey.open;
      E.journey.button = (ctx, G2, U) => { if (G.state.flags.mapa_rai) b0(ctx, G2, U); };
      E.journey.open = (G2, U) => { if (G.state.flags.mapa_rai) o0(G2, U); };
    }
    const da0 = G.drawActor;
    G.drawActor = (ctx, a, Sc) => {
      const f = G.state.flags;
      if (a.id === 'soldado' && R17.lift > 0 && Sc.def.id === 'iglesia') {
        const u = Math.min(1, R17.lift), y = -Math.sin(u * Math.PI / 2) * 300;
        ctx.save(); ctx.translate(0, y); da0(ctx, a, Sc); ctx.restore(); return;
      }
      if (a === G.player && f.enharinado && !f.sancha_conocida) { ctx.save(); ctx.filter = 'brightness(1.5) saturate(0.25)'; da0(ctx, a, Sc); ctx.restore(); return; }
      da0(ctx, a, Sc);
    };
    const draw0 = E.scene.draw;
    E.scene.draw = (ctx, Sc, G2) => {
      draw0(ctx, Sc, G2);
      const f = G.state.flags, id = Sc.def.id, C = E.CONFIG, now = performance.now() / 1000;
      const dt = G.paused ? 0 : Math.min(0.05, G.lastFrameDt || 0.016);
      if (f.alonso_nombre && N.soldado.name !== 'Alonso') N.soldado.name = 'Alonso';
      if (E.rc14) E.rc14.scene = T({ all: ['oropesa_secuestrada', '!oropesa_rescatada'] }, G.state) || f.noche ? 'apagada' : 'taberna';
      ctx.save();
      if (id === 'alfar') drawOven(ctx, f, now, dt);
      if (id === 'orilla' && f.noche_soto && !f.requete_1) torch(ctx, 2672 - Sc.camX, 640, now);
      if (id === 'acena' && R17.flour > 0) { R17.flour = Math.max(0, R17.flour - dt * 0.35); flour(ctx, R17.flour, now); }
      if (id === 'taberna' && R17.coins > 0) { R17.coins += dt; coins(ctx, 2060 - Sc.camX, R17.coins); if (R17.coins > 6) R17.coins = 0; }
      if (id === 'iglesia' && f.eclipse) { if (!f.luna_roja) R17.moon = Math.min(1, R17.moon + dt / 7); else R17.moon = 1; moonDraw(ctx, 1010, 72, R17.moon, now); }
      if (id === 'iglesia' && R17.lift > 0) R17.lift += dt / 1.6;
      if (id === 'iglesia' && R17.portal > 0) { R17.portal = Math.min(1, R17.portal + dt / 1.5); portalDraw(ctx, 900, 640, R17.portal, now); }
      if (id === 'ribera' && f.presente) presente(ctx, C);
      if (id === 'puerta_rio') armTalavera(ctx, Sc.camX, !!f.poste_girado);
      if (R17.flash > 0) { R17.flash += dt; const k = R17.flash < 0.5 ? R17.flash / 0.5 : Math.max(0, 1 - (R17.flash - 0.5) / 1.2); ctx.fillStyle = 'rgba(255,250,235,' + k.toFixed(3) + ')'; ctx.fillRect(0, 0, C.W, C.H); if (R17.flash > 1.7) R17.flash = 0; }
      ctx.restore();
    };
    const ui0 = G.ui.draw;
    G.ui.draw = (ctx, Sc) => { ui0(ctx, Sc); if (R17.card) cardDraw(ctx, G.paused ? 0 : Math.min(0.05, G.lastFrameDt || 0.016)); };
    const adv0 = G.ui.advance;
    G.ui.advance = () => { if (R17.card) { if (R17.card.t > 1.2) R17.card = null; return true; } return adv0(); };
  };

  function drawOven(ctx, f, now, dt) {
    const target = f.carbon_echado ? 1 : f.tiro_abierto ? 0.5 : f.alfar_activo ? 0 : 0.2;
    R17.oven += Math.sign(target - R17.oven) * Math.min(Math.abs(target - R17.oven), dt * 0.8);
    const o = R17.oven, fl = 0.85 + 0.15 * Math.sin(now * 9) * Math.sin(now * 5.3);
    // cadena y trampilla del tiro (arte provisional)
    const open = f.tiro_abierto || f.carbon_echado;
    ctx.strokeStyle = '#2a2a2e'; ctx.lineWidth = 4; ctx.setLineDash([7, 5]);
    ctx.beginPath(); ctx.moveTo(318, 70); ctx.quadraticCurveTo(520, 120, 590, open ? 470 : 520); ctx.stroke(); ctx.setLineDash([]);
    ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(590, open ? 482 : 532, 13, 0, TAU); ctx.stroke();
    ctx.save(); ctx.translate(290, 62); ctx.rotate(open ? -0.7 : 0); ctx.fillStyle = '#4a4a52'; ctx.strokeStyle = '#1a1a1e'; ctx.lineWidth = 3; ctx.fillRect(0, -8, 62, 14); ctx.strokeRect(0, -8, 62, 14); ctx.restore();
    if (o > 0.02) {
      const g = ctx.createRadialGradient(318, 610, 10, 318, 610, 220 + 260 * o);
      g.addColorStop(0, 'rgba(255,170,60,' + (0.55 * o * fl).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 200, 900, 700); ctx.globalCompositeOperation = 'source-over';
      if (open) for (let i = 0; i < 5; i++) { const u = ((now * 0.25 + i / 5) % 1); ctx.fillStyle = 'rgba(90,85,80,' + (0.35 * (1 - u) * Math.max(0.3, o)).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(312 + Math.sin(now + i) * 18 * u, 50 - u * 140, 14 + u * 40, 0, TAU); ctx.fill(); }
    }
  }
  // brazo «A TALAVERA» del poste (provisional): apunta a la puerta; girado, al camino de la aldea
  function armTalavera(ctx, camX, girado) {
    const x = 2010 - camX, y = 432; if (x < -200 || x > 1800) return;
    ctx.save(); ctx.translate(x, y); if (girado) ctx.scale(-1, 1);
    ctx.fillStyle = '#e6d3a3'; ctx.strokeStyle = '#4a3218'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-130, -15); ctx.lineTo(40, -15); ctx.lineTo(40, 15); ctx.lineTo(-130, 15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.scale(girado ? -1 : 1, 1); ctx.fillStyle = '#3a2412'; ctx.font = 'bold 16px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('A TALAVERA', girado ? 55 : -55, 1); ctx.restore();
  }
  function torch(ctx, x, y, now) {
    const fl = 0.8 + 0.2 * Math.sin(now * 13) * Math.sin(now * 7.1);
    const g = ctx.createRadialGradient(x, y, 6, x, y, 360);
    g.addColorStop(0, 'rgba(255,190,90,' + (0.6 * fl).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(x - 380, y - 380, 760, 760); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#4a2e14'; ctx.fillRect(x - 4, y, 8, 90);
    ctx.fillStyle = 'rgba(255,200,80,' + fl.toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(x, y - 8, 9, 18, 0, 0, TAU); ctx.fill();
  }
  function flour(ctx, k, now) {
    ctx.fillStyle = 'rgba(250,246,236,' + (0.55 * k).toFixed(3) + ')'; ctx.fillRect(0, 0, 1600, 900);
    for (let i = 0; i < 40; i++) { const x = (i * 97 + now * 30) % 1600, y = (i * 53 + Math.sin(now + i) * 40) % 900;
      ctx.fillStyle = 'rgba(255,255,255,' + (0.5 * k).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, 6 + (i % 5) * 3, 0, TAU); ctx.fill(); }
  }
  function coins(ctx, x, t) {
    for (let i = 0; i < 14; i++) { const a = i * 2.3, sp = 120 + (i % 4) * 60, px = x + Math.cos(a) * sp * Math.min(t, 0.8), py = 760 - Math.max(0, 200 * Math.sin(Math.min(t, 0.8) * Math.PI)) * (0.4 + (i % 3) * 0.2) + Math.min(t, 0.8) * 60;
      ctx.fillStyle = '#e2b84a'; ctx.strokeStyle = '#7a5a10'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px, Math.min(py, 812), 7, 4, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
  }
  function moonDraw(ctx, x, y, k, now) {
    const r = 46, red = Math.min(1, k * 1.15);
    const col = 'rgb(' + Math.round(240 - 40 * red) + ',' + Math.round(236 - 150 * red) + ',' + Math.round(220 - 170 * red) + ')';
    const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.2); g.addColorStop(0, 'rgba(255,' + Math.round(230 - 120 * red) + ',' + Math.round(200 - 150 * red) + ',.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (k < 1) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip(); ctx.fillStyle = 'rgba(30,20,30,' + (0.75 * (1 - Math.abs(k * 2 - 1))).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x - r * 2 + k * r * 3.2, y - 6, r * 1.05, 0, TAU); ctx.fill(); ctx.restore(); }
  }
  function portalDraw(ctx, x, y, k, now) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 6; i++) { const rr = (40 + i * 22) * k, a = 0.5 - i * 0.07;
      ctx.strokeStyle = 'rgba(' + (180 + i * 10) + ',' + (120 + i * 18) + ',255,' + Math.max(0, a).toFixed(3) + ')'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.ellipse(x, y, rr * 0.55, rr * 1.15, Math.sin(now * 1.3 + i) * 0.15, now * (i % 2 ? 2 : -2), now * (i % 2 ? 2 : -2) + Math.PI * 1.6); ctx.stroke(); }
    const g = ctx.createRadialGradient(x, y, 4, x, y, 150 * k); g.addColorStop(0, 'rgba(255,240,255,' + (0.8 * k).toFixed(3) + ')'); g.addColorStop(1, 'rgba(120,80,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 90 * k, 170 * k, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  function presente(ctx, C) {
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,.55)'; ctx.fillRect(0, 0, C.W, C.H);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(170,190,215,.14)'; ctx.fillRect(0, 0, C.W, C.H); ctx.restore();
  }
  function cardDraw(ctx, dt) {
    const c = R17.card; c.t += dt; const C = E.CONFIG, k = Math.min(1, c.t / 0.5);
    if (c.t > 10) { R17.card = null; return; }
    ctx.save(); ctx.fillStyle = 'rgba(10,8,6,' + (0.55 * k).toFixed(3) + ')'; ctx.fillRect(0, 0, C.W, C.H);
    ctx.globalAlpha = k; ctx.translate(C.W / 2, C.H / 2 - 20);
    ctx.fillStyle = '#efe0b8'; ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = 6; ctx.fillRect(-470, -280, 940, 520); ctx.strokeRect(-470, -280, 940, 520);
    // dibujo provisional: aldea con un reloj de sol, el poste y cuatro figuras sentadas en corro
    ctx.fillStyle = '#c9b48a'; ctx.fillRect(-440, -250, 880, 250);
    for (let i = 0; i < 5; i++) { const x = -380 + i * 150, hgt = 70 + (i % 2) * 25; ctx.fillStyle = '#e8d8b0'; ctx.fillRect(x, -60 - hgt, 100, hgt); ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = 3; ctx.strokeRect(x, -60 - hgt, 100, hgt);
      ctx.fillStyle = '#a8502e'; ctx.beginPath(); ctx.moveTo(x - 10, -60 - hgt); ctx.lineTo(x + 50, -100 - hgt); ctx.lineTo(x + 110, -60 - hgt); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(250, -200, 8, 140); ctx.fillStyle = '#e8d8b0'; ctx.fillRect(200, -200, 120, 34); ctx.strokeRect(200, -200, 120, 34);
    ctx.fillStyle = '#3a2412'; ctx.font = 'bold 16px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('MAÑANA', 260, -178);
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + c.t * 0.3, x = -60 + Math.cos(a) * 70, y = -40 + Math.sin(a) * 18;
      ctx.fillStyle = ['#2f6a4a', '#a0522d', '#5a6a8a', '#7a5a3a'][i]; ctx.beginPath(); ctx.arc(x, y - 30, 14, 0, TAU); ctx.fill(); ctx.fillRect(x - 13, y - 18, 26, 30); }
    const lines = ['«¡Mañana tomaremos Talabayra!»', '«Mañana fue ayer.»', '(Se sentaron a discutir la fecha. Allí siguen.)'];
    ctx.fillStyle = '#2a1a0c'; ctx.textAlign = 'center';
    lines.forEach((l, i) => { const a = Math.max(0, Math.min(1, (c.t - 0.6 - i * 1.6) / 0.5)); if (!a) return; ctx.globalAlpha = k * a; ctx.font = (i === 2 ? 'italic ' : 'bold ') + '30px Georgia, serif'; ctx.fillText(l, 0, 60 + i * 50); });
    ctx.globalAlpha = k; ctx.fillStyle = '#c73a2c'; ctx.fillRect(-300, 212, 600, 46); ctx.fillStyle = '#fff6dc'; ctx.font = 'italic bold 26px Georgia, serif'; ctx.fillText('La aldea de los que siempre llegan tarde', 0, 244);
    ctx.restore();
  }
})(window.E1248);
