// G12 · Compañero: Mingo sigue al protagonista de escena en escena, se queda un paso por detrás,
// mira lo que mira él, se aburre (malabares, comentarios) y responde cuando se le «usa» desde el zurrón.
(function (E) {
  'use strict';
  const ID = 'mingo';
  const T = (c, s) => E.state.test(c, s);
  const IDLE_BARKS = [
    'Oye, Ropa-Rara, ¿en tu tierra todos andáis tan despacio?',
    'Tengo hambre. Te aviso, por si se te olvida que tengo hambre.',
    'Si te aburres, yo sé dónde hay un panal sin vigilar.',
    'Mi abuela decía que el que mucho mira, poco roba.',
    '¿Ese espejo tuyo sabe contar chistes? A ver, que cante.',
    'En Talavera hay tres cosas que no fallan: el río, las campanas y Don Nuño cobrando.',
    'Una vez gané una apuesta a un fraile. Aún me está rezando en contra.'
  ];
  const REFUSE = ['¿Y yo qué gano?', 'Eso hazlo tú, que eres más alto.', 'Ni loco.', 'Me aburre solo de mirarlo.', 'Si me pillan, digo que fue idea tuya.', 'Eso no se roba, se mira. Y ya lo he mirado.'];
  let timer = 0, antic = 0, lastBark = -99, pathT = 0;

  const active = G => T('mingo_sigue', G.state);
  function npc(G) { return G.sceneNpcs && G.sceneNpcs.find(n => n.def.id === ID); }

  // Al entrar en escena: aparece un paso por detrás del protagonista.
  function place(G, sceneId, e) {
    if (!active(G)) return;
    const back = e.facing === 'left' ? 1 : -1;
    const n = G.npcs.get(ID), m = n.mem;
    m.scene = sceneId; m.x = Math.round(e.x + back * 130); m.y = Math.round(e.y + (e.y > 820 ? -10 : 10)); m.facing = e.facing === 'left' ? 'left' : 'right';
    const a = n.actor; a.x = m.x; a.y = m.y; E.actor.setPath(a, []); a.facing = a.lastH = m.facing; a.scripted = false; a.anim = 'idle';
  }
  function fixInside(G, a) {
    const S = G.S; if (!S || !S.nav || S.nav.inside(a.x, a.y)) return;
    const p = S.nav.nearest(a.x, a.y); if (p) { a.x = p[0]; a.y = p[1]; }
  }

  function update(G, dt) {
    if (!active(G) || !G.S || !G.player) return;
    const n = npc(G); if (!n) return;
    const a = n.actor, p = G.player;
    if (a.hold || a.talking || a.scripted || G.dialogue.active) { timer = 0; return; }
    if (!a._fixed) { fixInside(G, a); a._fixed = true; }
    const d = Math.hypot(a.x - p.x, (a.y - p.y) * 1.6);
    pathT -= dt;
    if (d > 210 || (a.moving && d > 150 && pathT <= 0)) {
      if (!a.moving || pathT <= 0) {
        const back = p.lastH === 'left' ? 1 : -1;
        let tx = p.x + back * 125, ty = p.y + (p.y > 830 ? -16 : 16);
        const q = G.S.nav.inside(tx, ty) ? [tx, ty] : (G.S.nav.nearest(tx, ty) || [p.x, p.y]);
        const r = G.S.nav.findPath(a.x, a.y, q[0], q[1]);
        if (r && r.path.length) { E.actor.setPath(a, r.path); a.speed = d > 480 ? 330 : 215; a.anim = 'walk'; }
        pathT = 0.45;
      }
      timer = 0; antic = 0;
      return;
    }
    if (a.moving) return;
    // quieto: mira al protagonista y, si se aburre, hace de las suyas
    if (!antic) a.facing = a.lastH = p.x < a.x ? 'left' : 'right';
    timer += dt;
    if (antic > 0) { antic -= dt; if (antic <= 0) { antic = 0; a.anim = 'idle'; } return; }
    if (timer > 9 + (a.x % 5) && !p.moving && !G.runner.busy) {
      timer = 0;
      const r = Math.random();
      if (r < 0.45) { a.anim = 'work'; antic = 3.2; }
      else if (G.time - lastBark > 35 && !G.ui.bubbles.length) { lastBark = G.time; G.speak(ID, IDLE_BARKS[Math.floor(Math.random() * IDLE_BARKS.length)], false); }
    }
  }

  // «Usar Mingo con…» sin respuesta propia
  function refuse() { return [{ say: REFUSE[Math.floor(Math.random() * REFUSE.length)], who: ID }]; }
  // Mingo como pista: dice la pista actual con su voz
  function hintLine(G) {
    const h = (E.DATA.hints || []).find(h => T(h.if, G.state));
    if (!h) return 'Yo que tú... me sentaba a la sombra. No se me ocurre nada.';
    const t = h.text.charAt(0).toLowerCase() + h.text.slice(1);
    return 'Yo que tú... ' + t;
  }
  function present(G) { return active(G) && !!npc(G); }

  E.companion = { id: ID, place, update, refuse, hintLine, present };
})(window.E1248 = window.E1248 || {});
