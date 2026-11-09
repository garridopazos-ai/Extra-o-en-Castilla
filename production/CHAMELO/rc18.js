// CHAMELO RC18 · Correcciones de la auditoría de RC17 (docs/AUDITORIA_RC17.md). Se carga tras rc17.js.
// Solo recortes, condiciones, coordenadas y textos iguales o más cortos: sin puzles nuevos ni conversaciones más largas.
// Los parches de motor (panel, bocadillos, aviso de continuar, menú, mapa, hoja del protagonista) van en patch_rc18.py.
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues, T = E.state.test;
  const R17 = E.rc17, R18 = E.rc18 = { pending: null };
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const note = text => ({ note: text });
  const H = (sc, id) => (S[sc].hotspots || []).find(h => h.id === id);
  const Ly = (sc, id) => (S[sc].layers || []).find(l => l.id === id);
  const P4_ON = { all: ['oropesa_secuestrada', '!oropesa_rescatada'] };

  // =====================================================================================================
  // A3 · Soto y ciego: vuelve el gag de las uvas (lo que se ve en la parra). Sin cerezas ni frases de estación.
  // Secuencia directa (sin panel de diálogo): al acabar, el control vuelve al jugador con la pantalla limpia.
  const UVAS = [
    say('¿Uvas? Siéntate. A la par: tú una, yo una.', 'ciego'),
    note('(Él coge de dos en dos. Tú, de tres en tres.)'),
    say('Me estás engañando, forastero.', 'ciego'),
    say('¿Cómo lo sabe?'),
    say('Porque yo cojo de dos en dos… y tú callas.', 'ciego'),
    { set: 'uvas_ciego' }, { mood: ['ciego', 'grin'] }];
  N.ciego.verbs.talk = [{ if: 'uvas_ciego', then: [say('Se acabó el racimo. La gracia, no.', 'ciego')], else: UVAS }];
  N.ciego.verbs.look = [say('Un ciego viejo bajo su parra. Tararea desafinando… a propósito, diría yo.')];
  N.ciego.routines = [{ steps: [{ wait: 7, anim: 'idle', face: 'left' }, { bark: '¡Romances, coplas y oraciones! ¡Para la buena muerte y para la mala suerte!', every: 34 }] }];
  H('orilla', 'parra').verbs = { look: [say('Una parra cargada de racimos. Y debajo, alguien que no ve las uvas… pero las cuenta.')],
    pick: [say('Con el dueño de las uvas a dos pasos, ni se me ocurre.')] };
  H('orilla', 'higuera').verbs.look = [{ if: 'mingo_sigue', then: [say('Una higuera enorme, cargada de higos morados. Demasiado altos para mí.')],
    else: [say('Una higuera enorme. Y en la rama baja, un crío con mi móvil.')] }];
  H('corredera', 'arbol').verbs.look = [say('Un árbol que suelta hojas despacio, como si no tuviera prisa por llegar a 2026.')];

  // =====================================================================================================
  // A1 / M7 · Sin acceso a la antigua Vista Pública; la Plaza Mayor se llama así en título, mapa y textos.
  S.audiencia.name = 'Plaza Mayor';
  { const t = H('audiencia', 'tarima'); t.default = 'look'; t.verbs = { look: [say('La tarima de la Plaza Mayor. Hoy, sin pleitos.')] };
    const p = H('audiencia', 'publico'); if (p) p.verbs = { look: [say('Medio Talavera, mirando. En esta plaza siempre pasa algo.')] }; }

  // =====================================================================================================
  // A2 · Alonso según el estado de la historia (recortes y condiciones; ninguna pista necesaria vivía en su diálogo)
  { const d = L.soldado.nodes;
    d.intro.lines = [d.intro.lines[0], d.intro.lines[2]];                      // «¡Alto! ¿Quién va?» + las palomas
    d.hub.options = d.hub.options.filter(o => o.next !== 'campana' && o.next !== 'toques');
    const lz = d.hub.options.find(o => o.next === 'lanza'); if (lz) lz.if = '!lanza_vista';
    d.nuno.lines = [d.nuno.lines[0]]; }
  N.soldado.verbs.talk = [{ if: P4_ON, then: [say('Zzz… Las Navas… zzz…', 'soldado')],
    else: [{ if: 'requete_fin', then: [say('La cuerda es mía. Esta vez no se me escapa.', 'soldado')], else: [{ dialogue: 'soldado' }] }] }];
  N.soldado.verbs.look = [{ if: 'lanza_vista', then: [say('Alonso, con su cota remendada y la lanza recién enderezada por Lope.')],
    else: [say('El viejo soldado, con su cota remendada y su lanza sin punta, contando batallas a quien se deje.')] }];
  delete N.soldado.verbs['give:badajo']; delete N.soldado.verbs['give:higos'];

  // =====================================================================================================
  // M1 · Mingo da la pista directamente (sin árbol de diálogo con el panel vacío)
  N.mingo.verbs.talk = [{ if: 'mingo_sigue', then: [{ mingoHint: true }], else: [say('¡No bajo! Aquí arriba tu espejo canta mejor.', 'mingo')] }];

  // =====================================================================================================
  // B2 · Encuadres (solo coordenadas): Yuçaf deja sitio a la cadena del tiro; la balanza y su grupo, 150 px a la izquierda;
  //      al volver a la Puerta del Río ya no apareces entre los dos guardias.
  N.yucaf_alfar.start = [700, 812];
  H('alfar', 'tiro').walkTo = [585, 800];
  const DX = -150;
  for (const id of ['balanza', 'cuna_bal']) { const l = Ly('taberna', id); if (l) l.x += DX; }
  { const b = H('taberna', 'balanza'); b.rect = [b.rect[0] + DX, b.rect[1], b.rect[2], b.rect[3]]; b.walkTo = [b.walkTo[0] + DX, b.walkTo[1]];
    const seq = b.verbs['use:cuna17'][0].else; const w = seq.find(a => a.npcWalk && a.npcWalk[0] === 'soldado'); if (w) w.npcWalk[1] += DX; }
  N.oropesa.start = [N.oropesa.start[0] + DX, N.oropesa.start[1]];
  for (const p of Object.values(R17.TBP)) p[0] += DX;
  S.puerta_rio.entries.from_plaza = { x: 1470, y: 805, facing: 'left' };
  // el viajero no aparece ni se para bajo el botón del zurrón (abajo a la izquierda)
  S.orilla.entries.from_ribera = { x: 230, y: 790, facing: 'right' };
  S.ribera.entries.from_embarcadero = { x: 230, y: 790, facing: 'right' };
  H('alfar', 'carbon').walkTo = [215, 800];

  // =====================================================================================================
  // B3 · Yuçaf y el pregonero ya no están en dos sitios a la vez tras la destitución
  { const seq = S.audiencia.onEnter[0].then, i = seq.findIndex(a => a.goto);
    seq.splice(i, 0, { set: 'tras_destitucion' }); }
  N.yucaf_aud.presentWhen = { all: ['oropesa_rescatada', '!tras_destitucion'] };
  N.pregonero_vista.presentWhen = { all: ['oropesa_rescatada', '!tras_destitucion'] };

  // B4 · Durán ya no pregunta por el juglar
  L.duran.nodes.intro.lines[0] = ['duran', '¡Eh, tú! ¿De dónde sales con esas ropas?'];

  // B9 · Indicaciones breves y en el momento de usarlas
  { const truco = S.orilla.hotspots.find(h => h.id === 'rio').verbs.look[0].then;
    const n1 = truco.find(a => a.note && a.note.indexOf('Mingo te acompaña') === 0); if (n1) n1.note = 'Mingo se une a ti.';
    const pal = N.leonor.verbs['give:mingo'][0].else[0].then;
    const n2 = pal.find(a => a.note && a.note.indexOf('Ya tienes el mapa') === 0); if (n2) n2.note = 'Nuevo: el mapa de Rai (botón de la derecha).'; }
  { const i = D.hints.findIndex(h => h.obj === 'Frustrar la Requeteconquista');
    D.hints.splice(i, 0, { if: { all: ['requete_1', '!confesion'] }, obj: 'Ver a Rai', text: 'Rai te espera en el Chamelo: cruza el vado del soto.' }); }
  { const n = S.plaza.onEnter[0].then.find(a => a.npcPlace && a.npcPlace[0] === 'sancha' && a.npcPlace[1] === 'taberna'); if (n) n.npcPlace[2] += -150; }

  // =====================================================================================================
  // Guardados: reparar estados intermedios (una secuencia guardada a mitad desde el menú de pausa) al RESTAURAR la partida,
  // y volver a lanzar la entrada de la escena tras cargar (sus condiciones ya excluyen lo hecho).
  function repair(s) {
    const f = s.flags, inv = s.inventory, npc = (id, sc, x, y, fc) => { s.npcs[id] = Object.assign(s.npcs[id] || { ri: 0, pending: [] }, { scene: sc, x, y, facing: fc }); };
    const drop = (...k) => k.forEach(x => delete f[x]);
    if (f.lanza_vista && !f.noche_soto && s.scene === 'taberna') {                             // escena de la lanza a medias: se repite
      drop('lanza_vista', 'alonso_nombre'); f.rai_oculto = true; npc('lope', 'taberna', 1300, 792, 'right'); npc('leonor', 'taberna', 250, 790, 'right'); }
    if (f.carbon_echado && !f.embargo_aplazado && s.scene === 'alfar') drop('carbon_echado');                         // la palada se repite
    if (f.requete_1 && !f.confesion && s.scene === 'orilla') { s.scene = 'chamelo'; s.player = { x: 920, y: 756, facing: 'right' }; }
    if (f.confesion && !f.oropesa_secuestrada && s.scene === 'chamelo') { drop('confesion'); f.noche = true; }               // la confesión se repite entera
    if (f.oropesa_secuestrada && !f.oropesa_rescatada) {                                       // la cuadrilla y Sancha en la taberna
      for (const [id, p] of Object.entries(R17.TBP)) npc(id, 'taberna', p[0], p[1], p[2]);
      npc('sancha', 'taberna', 2300 + DX, 805, 'left'); f.sancha_oculta = true;
      if (f.cuna_puesta && s.scene === 'taberna') { drop('cuna_puesta'); if (!inv.includes('cuna17')) inv.push('cuna17'); }   // la cuña vuelve al zurrón
    }
    if (f.nuno_destituido && !f.requete_vuelve && s.scene === 'audiencia') drop('nuno_destituido', 'alfar_devuelto');      // la destitución se repite
    if (f.requete_vuelve && !f.requete_fin) {
      [['requete_a', 1700, 760, 'right'], ['requete_b', 1810, 800, 'left'], ['requete_c', 1590, 805, 'right'], ['requete_d', 1880, 775, 'left']].forEach(p => npc(p[0], 'puerta_rio', p[1], p[2], p[3])); }
    if (f.requete_fin && !f.campanada) {
      npc('lope', 'iglesia', 360, 792, 'right'); npc('soldado', 'iglesia', 250, 800, 'right'); npc('sancha', 'iglesia', 720, 805, 'left'); npc('leonor', 'iglesia', 1010, 790, 'left');
      if (!f.luna_roja && s.scene === 'iglesia') drop('campana_lista', 'eclipse');                                       // el eclipse empieza de nuevo
    }
    N.soldado.name = f.alonso_nombre ? 'Alonso' : 'Viejo soldado';
    return s;
  }
  const v0 = E.state.validate;
  E.state.validate = o => { const s = v0(o); return s ? repair(s) : s; };

  // =====================================================================================================
  // Estado fuera del dibujo: eclipse, nombre de Alonso, tertulia, y entrada de escena tras cargar
  function tick(G, dt) {
    const f = G.state.flags, id = G.S && G.S.def.id;
    N.soldado.name = f.alonso_nombre ? 'Alonso' : 'Viejo soldado';
    if (E.rc14) E.rc14.scene = (T(P4_ON, G.state) || f.noche) ? 'apagada' : 'taberna';
    if (f.luna_roja) R17.moon = 1;
    else if (f.eclipse && id === 'iglesia') {
      R17.moon = Math.min(1, R17.moon + dt / 7);
      if (R17.moon >= 1 && !G.runner.busy && !G.dialogue.active) {   // sin secuencia en marcha (p. ej., tras cargar): «¡Ahora!» igualmente
        f.luna_roja = true; G.runner.run([say('¡Ahora!', 'leonor')], { label: 'eclipse tras cargar' }); G.onStateChanged();
      }
    }
    if (R18.pending && G.S && !G.transitioning && G.S.def.id === R18.pending) {
      const sc = G.S.def; R18.pending = null;
      if (sc.onEnter) G.runner.run(sc.onEnter, { label: 'entrada tras cargar ' + sc.id });
    }
  }
  const baseInstall = E.rc07 && E.rc07.install;
  if (baseInstall) E.rc07.install = G => {
    baseInstall(G);
    const up0 = E.companion.update;
    E.companion.update = (G2, dt) => { tick(G2, dt); up0(G2, dt); };
    const lg0 = G.loadGame;
    G.loadGame = () => { const ok = lg0(); if (ok) R18.pending = G.state.scene; return ok; };
    const ng0 = G.newGame;
    G.newGame = () => { R18.pending = null; return ng0(); };
    // la pista de Mingo pasa la primera letra a minúscula: no con los nombres propios («Martín te cruza», no «martín»)
    const NAMES = ['Martín', 'Rai', 'Mingo', 'Sancha', 'Nuño', 'Lope', 'Alonso', 'Yuçaf', 'Durán', 'Talavera', 'Santa'];
    const hl0 = E.companion.hintLine;
    E.companion.hintLine = G2 => hl0(G2).replace(/^(Yo que tú\.\.\. )(\S+)/, (m, pre, w) => { const c = NAMES.find(nm => nm.toLowerCase() === w.toLowerCase()); return c ? pre + c : m; });
    // M4 · Mingo entra siempre dentro del encuadre y lejos del zurrón
    const pl0 = E.companion.place;
    E.companion.place = (G2, sceneId, e) => {
      pl0(G2, sceneId, e);
      if (!T('mingo_sigue', G2.state)) return;
      const n = G2.npcs.get('mingo'), W = E.DATA.scenes[sceneId].width, lo = 220, hi = W - 220;
      let x = n.mem.x;
      if (x < lo || x > hi) x = e.x - (x - e.x);                 // no cabe detrás: se pone delante
      x = Math.max(lo, Math.min(hi, x));
      if (Math.abs(x - e.x) < 100) x = e.x + (x >= e.x ? 130 : -130);
      const crowd = G2.npcs.inScene(sceneId).some(o => o.def.id !== 'mingo' && Math.abs(o.actor.x - x) < 90 && Math.abs(o.actor.y - n.mem.y) < 70);
      if (crowd) x = Math.max(lo, Math.min(hi, e.x - (x - e.x)));   // no encima de otro personaje
      n.mem.x = n.actor.x = Math.round(x);
    };
  };
})(window.E1248);
