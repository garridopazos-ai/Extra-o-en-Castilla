// CHAMELO RC18e · Prioridad 1 de la revisión del Protocolo Luna: comprensión y navegación.
// · Cada salida se ve: una etiqueta con el nombre del destino (en el borde si la salida es lateral o queda fuera de
//   cuadro; sobre la puerta si se ve). Gris con candado si está cerrada; la del Portazgo no se anuncia.
//   La etiqueta se toca (zona de 120 px o más) y Alonso va hacia allí. Con un destino marcado en el mapa,
//   la etiqueta de la salida siguiente se ilumina en azul (sustituye a la flecha flotante de G11).
// · Nombres de salida = nombres de destino (los mismos que el mapa, en corto).
// · Zonas táctiles pequeñas: un toque cerca (dentro de 120 px) también cuenta, sin quitar nada a lo que ya se tocaba.
// · Fuera señuelos: destello de la ribera y su «algo que brilla», carreta atascada, chincheta del Portazgo en el mapa.
//   (El aviso «Efectos reducidos…» y la frase de Martín «Una moneda por cruzar…» se quitan en patch_rc18e.py.)
// Se carga tras rc18d.js. No cambia la historia, los diálogos ni los datos de guardado.
(function (E) {
  'use strict';
  const D = E.DATA, SC = D.scenes, TAU = Math.PI * 2;
  const T = (c, st) => E.state.test(c, st);

  // ---------------------------------------------------------------- nombres de destino
  const NAME = {
    ribera: 'Ribera', acena: 'Aceña', embarcadero: 'Embarcadero', orilla: 'Soto', chamelo: 'Isla del Chamelo',
    puerta_rio: 'Puerta del Río', plaza: 'Plaza del Pan', iglesia: 'Santa María', alfar: 'Alfar', audiencia: 'Plaza Mayor',
    corredera: 'Corredera', taberna: 'Taberna', portazgo: 'Casa del Portazgo'
  };
  const SKIP = { acena_ext: 1, rueda_ext: 1 };              // fachada y rueda de la aceña: la puerta ya lleva etiqueta
  for (const sid in SC) for (const h of SC[sid].hotspots || []) if (h.exit && NAME[h.exit.to] && !SKIP[h.id]) h.name = NAME[h.exit.to];

  // ---------------------------------------------------------------- señuelos
  const rib = SC.ribera;
  if (rib) {
    for (const a of rib.ambient || []) if (a.asset === 'glint') a.visibleWhen = 'nunca_jamas';
    const m = (rib.hotspots || []).find(h => h.id === 'moneda'); if (m) m.visibleWhen = 'nunca_jamas';
  }
  const pr = SC.puerta_rio;
  if (pr) {
    for (const l of pr.layers || []) if (l.id === 'cart1' || l.id === 'cart2') l.visibleWhen = 'nunca_jamas';
    if (pr.walk && pr.walk.holes) pr.walk.holes = pr.walk.holes.filter(h => h.id !== 'carreta');
  }

  // ---------------------------------------------------------------- utilidades
  const box = h => {
    if (h.rect) return h.rect;
    const xs = h.poly.map(p => p[0]), ys = h.poly.map(p => p[1]);
    const x = Math.min(...xs), y = Math.min(...ys); return [x, y, Math.max(...xs) - x, Math.max(...ys) - y];
  };
  const hidden = h => h.exit.when && /nunca_jamas/.test(JSON.stringify(h.exit.when));
  // una salida por destino (la «exit_…» si hay varias)
  function exitsOf(S) {
    const by = {};
    for (const h of S.hotspots()) {
      if (!h.exit || SKIP[h.id] || hidden(h) || !NAME[h.exit.to]) continue;
      const o = by[h.exit.to]; if (!o || (!/^exit_/.test(o.id) && /^exit_/.test(h.id))) by[h.exit.to] = h;
    }
    return Object.values(by);
  }
  // ruta del mapa (misma lógica que G11/rc07: salidas + barca)
  function edgesOf(from) {
    const sc = SC[from], P = E.journey && E.journey.places; if (!sc || !P) return [];
    const out = sc.hotspots.filter(h => h.exit && P[h.exit.to]).map(h => ({ to: h.exit.to, hotspot: h, when: h.exit.when }));
    if (from === 'embarcadero') out.push({ to: 'travesia', hotspot: sc.hotspots.find(h => h.id === 'barca'), when: 'barca_libre' });
    if (from === 'travesia') out.push({ to: 'puerta_rio' });
    return out;
  }
  function route(G, from, to, closed) {
    const q = [{ at: from, steps: [] }], seen = new Set([from]);
    for (let i = 0; i < q.length; i++) {
      const { at, steps } = q[i]; if (at === to) return steps;
      for (const e of edgesOf(at)) { if (seen.has(e.to) || (!closed && e.when && !T(e.when, G.state))) continue; seen.add(e.to); q.push({ at: e.to, steps: steps.concat([e]) }); }
    }
    return null;
  }
  function nextStep(G) {
    const J = E.journey, dest = J && J.destination, h = G.S && G.S.def.id;
    if (!dest || !h || dest === h) return null;
    const st = route(G, h, dest) || route(G, h, dest, true); return st && st[0] || null;
  }

  // ---------------------------------------------------------------- etiquetas de salida
  let alpha = 0, last = 0;
  function quiet(G) {
    const U = G.ui;
    return !G.S || !G.player || U.overlay || G.dialogue.active || G.runner.busy || G.transitioning || (U.notes && U.notes.length)
      || U.invOpen || U.verbMenu || U.fade > 0.02 || U.sceneTitle || (E.rc07 && E.rc07.cam && E.rc07.cam.z > 1.02);
  }
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function lock(ctx, x, y, col) {
    ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(x, y - 6, 7, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = col; ctx.fillRect(x - 10, y - 6, 20, 15);
  }
  function marks(ctx, G, S) {
    const now = performance.now(), dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    alpha += ((quiet(G) ? 0 : 1) - alpha) * Math.min(1, dt * 7);
    if (alpha < 0.03 || !G.S) return;
    const C = E.CONFIG, W = C.W, SW = (S.def.width || W), cam = E.rc07 && E.rc07.cam;
    const scr = (x, y) => cam ? cam.toScreen(x - S.camX, y) : [x - S.camX, y];
    const nx = nextStep(G), nh = nx && nx.hotspot;
    const chips = [];
    for (const h of exitsOf(S)) {
      const b = box(h), open = !h.exit.when || T(h.exit.when, G.state);
      const side = b[0] <= 60 ? -1 : b[0] + b[2] >= SW - 60 ? 1 : 0;
      const [cx, cy] = scr(b[0] + b[2] / 2, b[1] + b[3] / 2), [, ty] = scr(0, b[1]);
      let mode = side ? (side < 0 ? 'L' : 'R') : cx < 70 ? 'L' : cx > W - 70 ? 'R' : 'D';
      chips.push({ h, open, mode, cx, cy, ty, next: nh === h, off: !side && mode !== 'D' });
    }
    ctx.save();
    ctx.font = 'bold 30px system-ui, sans-serif'; ctx.textBaseline = 'middle';
    const H = 54, placed = { L: [], R: [] };
    // los de los lados se apilan sin pisarse (por altura)
    for (const k of ['L', 'R']) {
      const list = chips.filter(c => c.mode === k).sort((a, b) => a.cy - b.cy);
      let floor = 330;
      for (const c of list) { c.y = Math.max(floor, Math.min(C.H - 90, c.cy)); floor = c.y + H + 14; placed[k].push(c); }
    }
    const pulse = 0.5 + 0.5 * Math.sin(now / 260);
    for (const c of chips) {
      const arrowL = c.mode === 'L' ? '‹ ' : '', arrowR = c.mode === 'R' ? ' ›' : '';
      const label = arrowL + NAME[c.h.exit.to] + arrowR, tw = ctx.measureText(label).width, pad = 18, lk = c.open ? 0 : 30;
      const w = tw + pad * 2 + lk;
      let x, y;
      if (c.mode === 'L') { x = 8; y = c.y - H / 2; }
      else if (c.mode === 'R') { x = W - 8 - w; y = c.y - H / 2; }
      else { x = Math.max(8, Math.min(W - 8 - w, c.cx - w / 2)); y = Math.max(96, c.ty - H - 18); if (x + w > 1330 && y < 300) y = 300; }
      const a = alpha * (c.off ? 0.8 : 1);
      const edge = c.next ? 'rgba(118,215,238,' + (0.75 + 0.25 * pulse).toFixed(3) + ')' : c.open ? 'rgba(233,165,35,.95)' : 'rgba(170,165,155,.9)';
      ctx.globalAlpha = a;
      ctx.fillStyle = c.open ? 'rgba(28,18,10,.8)' : 'rgba(40,38,36,.82)'; rrect(ctx, x, y, w, H, 14); ctx.fill();
      ctx.lineWidth = c.next ? 5 : 3; ctx.strokeStyle = edge; ctx.stroke();
      if (c.mode === 'D') {   // piquito hacia la puerta
        const px = Math.max(x + 18, Math.min(x + w - 18, c.cx));
        ctx.fillStyle = edge; ctx.beginPath(); ctx.moveTo(px - 12, y + H); ctx.lineTo(px + 12, y + H); ctx.lineTo(px, y + H + 14); ctx.closePath(); ctx.fill();
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = c.next ? '#c9f3fc' : c.open ? '#ffe9b0' : '#d6d2cb';
      ctx.fillText(label, x + pad + lk, y + H / 2 + 1);
      if (lk) lock(ctx, x + pad + 10, y + H / 2 + 2, '#d6d2cb');
      // zona de toque: al menos 120 × 120, por debajo de los botones del HUD
      if (alpha > 0.6) {
        const tw2 = Math.max(120, w + 20), th = Math.max(120, H + 40);
        const bx = Math.max(0, Math.min(W - tw2, x + w / 2 - tw2 / 2)), by = Math.max(0, y + H / 2 - th / 2);
        const h = c.h;
        G.ui.buttons.push({ x: bx, y: by, w: tw2, h: th, z: -1, id: 'exit-' + h.id,
          onTap: () => { if (!G.runner.busy && !G.transitioning) { G.ui.invOpen = false; G.inventory.selected = null; E.audio.play('tap'); G.performVerb({ kind: 'hotspot', id: h.id, h }, 'exit', null); } } });
      }
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- toques cerca de zonas pequeñas
  const SMALL = { iglesia: ['cuerda_campana'], ribera: ['pertiga', 'exit_acena'], chamelo: ['paloduz'] };
  function nearSmall(G, sx, sy) {
    const S = G.S; if (!S) return null;
    const w = E.rc07 ? E.rc07.cam.toWorld(sx, sy) : [sx, sy], x = w[0] + S.camX, y = w[1];
    let best = null, bd = 1e9;
    for (const h of S.hotspots()) {
      if (!h.rect) continue;
      const small = (SMALL[S.def.id] || []).includes(h.id) || (h.exit && !SKIP[h.id] && !hidden(h));
      const [l, t, rw, rh] = h.rect; if (!small || (rw >= 120 && rh >= 120)) continue;
      const W2 = Math.max(120, rw), H2 = Math.max(120, rh), cx = l + rw / 2, cy = t + rh / 2;
      if (Math.abs(x - cx) > W2 / 2 || Math.abs(y - cy) > H2 / 2) continue;
      const d = Math.hypot(x - cx, y - cy); if (d < bd) { bd = d; best = h; }
    }
    return best ? { kind: 'hotspot', id: best.id, h: best } : null;
  }

  // ---------------------------------------------------------------- instalación
  E.rc18e = { marks, names: NAME };
  const inst0 = E.rc07 && E.rc07.install;
  if (inst0) E.rc07.install = G => {
    inst0(G);
    const ta0 = G.targetAt;
    G.targetAt = (sx, sy) => ta0(sx, sy) || nearSmall(G, sx, sy);
    const J = E.journey;
    if (J) {
      // el Portazgo no es un destino: fuera la chincheta y se renumera
      delete J.places.portazgo;
      const order = ['ribera', 'orilla', 'acena', 'chamelo', 'embarcadero', 'travesia', 'puerta_rio', 'plaza', 'iglesia', 'audiencia', 'alfar', 'corredera', 'taberna'];
      order.forEach((id, i) => { if (J.places[id]) J.places[id][0] = i + 1; });
      // la flecha flotante solo cuando la salida siguiente no lleva etiqueta (la barca)
      const g0 = J.guide;
      J.guide = (ctx, G2, S) => {
        const nx = nextStep(G), h = G.S && G.S.def.id;
        if (nx && nx.hotspot && nx.hotspot.exit && J.destination !== h) return;
        g0(ctx, G2, S);
      };
    }
  };
})(window.E1248 = window.E1248 || {});
