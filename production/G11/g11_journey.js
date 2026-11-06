// Mapa de viaje dentro del juego (idea tomada de «El juglar que faltaba», rehecha en el lienzo y sobre el mapa ilustrado).
// Botón de mapa bajo «?»: muestra el mapa con los lugares numerados (dónde estás, visitados, por descubrir).
// Tocar un lugar lo marca como destino: se dibuja la ruta y, ya en la escena, una flecha señala la salida siguiente.
(function (E) {
  'use strict';
  const PLACES = {
    ribera:      [1, 300, 652, 'Ribera del Tajo'],
    acena:       [2, 505, 628, 'Aceña de Durán'],
    embarcadero: [3, 180, 572, 'Embarcadero'],
    travesia:    [4, 520, 562, 'Travesía del Tajo'],
    puerta_rio:  [5, 860, 500, 'Puerta del Río'],
    plaza:       [6, 860, 372, 'Plaza del Pan'],
    iglesia:     [7, 780, 284, 'Santa María'],
    alfar:       [8, 1300, 446, 'Alfar de Yuçaf'],
    portazgo:    [9, 1000, 236, 'Casa del Portazgo'],
    audiencia:   [10, 986, 390, 'Vista Pública']
  };
  let destination = null, trackedState = null;
  const here = G => G.S && G.S.def.id;

  function edges(from) {
    const sc = E.DATA.scenes[from]; if (!sc) return [];
    const out = sc.hotspots.filter(h => h.exit && PLACES[h.exit.to]).map(h => ({ to: h.exit.to, hotspot: h, when: h.exit.when }));
    if (from === 'embarcadero') out.push({ to: 'travesia', hotspot: sc.hotspots.find(h => h.id === 'barca'), when: 'barca_libre' });
    if (from === 'travesia') out.push({ to: 'puerta_rio' });
    return out;
  }
  function route(G, from, to, allowClosed) {
    const queue = [{ at: from, steps: [] }], seen = new Set([from]);
    for (let i = 0; i < queue.length; i++) {
      const { at, steps } = queue[i];
      if (at === to) return steps;
      for (const e of edges(at)) {
        if (seen.has(e.to) || (!allowClosed && e.when && !E.state.test(e.when, G.state))) continue;
        seen.add(e.to); queue.push({ at: e.to, steps: steps.concat([e]) });
      }
    }
    return null;
  }
  function steps(G) {
    if (trackedState && trackedState !== G.state) destination = null;   // partida nueva o cargada
    trackedState = G.state;
    const h = here(G);
    if (!destination || !h || destination === h) return [];
    return route(G, h, destination) || route(G, h, destination, true) || [];
  }
  function open(G, U) { U.overlay = 'map'; G.pause(true); E.audio.play('tap'); }
  function close(G, U) { U.overlay = null; G.pause(false); }

  function txt(ctx, s, x, y, size, color, align, bold) {
    ctx.font = (bold ? 'bold ' : '') + size + 'px system-ui, sans-serif'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 5); ctx.strokeStyle = 'rgba(25,15,8,.9)'; ctx.strokeText(s, x, y);
    ctx.fillStyle = color; ctx.fillText(s, x, y);
  }

  E.journey = {
    places: PLACES,
    get destination() { return destination; },
    setDestination(id) { destination = id; },
    // botón redondo bajo «?»
    button(ctx, G, U) {
      const x = 1530, y = 254, r = 40;
      U.buttons.push({ x: x - r, y: y - r, w: r * 2, h: r * 2, id: 'map', onTap: () => open(G, U) });
      ctx.fillStyle = 'rgba(20,15,10,.7)'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = destination ? 'rgba(118,215,238,.95)' : 'rgba(216,190,140,.7)'; ctx.lineWidth = destination ? 4 : 2; ctx.stroke();
      // icono: mapa plegado en tres
      const xs = [x - 20, x - 7, x + 7, x + 20], ys = [[y - 13, y + 15], [y - 17, y + 11], [y - 13, y + 15], [y - 17, y + 11]];
      ctx.beginPath(); ctx.moveTo(xs[0], ys[0][0]); for (let i = 1; i < 4; i++) ctx.lineTo(xs[i], ys[i][0]);
      for (let i = 3; i >= 0; i--) ctx.lineTo(xs[i], ys[i][1]); ctx.closePath();
      ctx.fillStyle = '#f0d9a0'; ctx.fill(); ctx.strokeStyle = '#5b3b24'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); for (let i = 1; i < 3; i++) { ctx.moveTo(xs[i], ys[i][0]); ctx.lineTo(xs[i], ys[i][1]); } ctx.stroke();
      ctx.fillStyle = '#c73a2c'; ctx.beginPath(); ctx.arc(x + 1, y - 2, 4, 0, Math.PI * 2); ctx.fill();
    },
    open, close,
    // pantalla del mapa (U.overlay === 'map')
    draw(ctx, G, U, button) {
      const C = E.CONFIG, now = performance.now(), h = here(G), st = steps(G);
      U.buttons.push({ x: 0, y: 0, w: C.W, h: C.H, z: -2, onTap: () => {}, id: 'map-bg' });
      const im = E.illus && E.illus.map;
      if (im && im.complete && im.naturalWidth) ctx.drawImage(im, 0, 0, C.W, C.H);
      else { ctx.fillStyle = '#2a2016'; ctx.fillRect(0, 0, C.W, C.H); }
      ctx.fillStyle = 'rgba(10,6,2,.18)'; ctx.fillRect(0, 0, C.W, C.H);
      // ruta
      if (st.length && h) {
        const pts = [h].concat(st.map(s => s.to)).map(id => PLACES[id]);
        ctx.save(); ctx.setLineDash([16, 12]); ctx.lineDashOffset = -now / 40; ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(20,40,60,.8)'; ctx.lineWidth = 11; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[1], p[2]) : ctx.moveTo(p[1], p[2])); ctx.stroke();
        ctx.strokeStyle = '#76d7ee'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
      }
      // lugares
      const visited = G.state.visited || {};
      for (const id in PLACES) {
        const [n, x, y, label] = PLACES[id], cur = id === h, vis = !!visited[id], dst = id === destination;
        if (cur) { const p = (now % 1400) / 1400; ctx.strokeStyle = 'rgba(255,224,120,' + (1 - p).toFixed(3) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 26 + p * 30, 0, Math.PI * 2); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fillStyle = cur ? '#ffd578' : vis ? '#2f6b55' : '#4a3d30'; ctx.fill();
        ctx.lineWidth = dst ? 6 : 3; ctx.strokeStyle = dst ? '#76d7ee' : '#f3dfb3'; ctx.stroke();
        txt(ctx, String(n), x, y + 1, 24, cur ? '#2a1a08' : '#ffffff', 'center', true);
        if (cur || dst) txt(ctx, (cur ? 'Estás aquí · ' : 'Destino · ') + label, x, y - 42, 22, cur ? '#ffe9a8' : '#bff0fb', 'center', true);
        U.buttons.push({ x: x - 34, y: y - 34, w: 68, h: 68, id: 'pin-' + id, onTap: () => { destination = destination === id ? null : id; E.audio.play('tap'); } });
      }
      // barra inferior: itinerario y botones
      ctx.fillStyle = 'rgba(30,18,8,.86)'; ctx.fillRect(30, 792, C.W - 60, 78);
      ctx.fillStyle = 'rgba(233,165,35,.9)'; ctx.fillRect(30, 792, C.W - 60, 3);
      const next = st[0], blocked = next && next.when && !E.state.test(next.when, G.state);
      const line1 = h && PLACES[h] ? 'Estás en ' + PLACES[h][3] : 'Talavera, 1248';
      const line2 = !destination ? 'Toca un número para marcar adónde quieres ir.'
        : destination === h ? 'Ya estás en ' + PLACES[destination][3] + '.'
        : next ? (blocked ? 'Paso cerrado por ahora: ' : 'Siguiente paso: ') + ((next.hotspot && next.hotspot.name) || PLACES[next.to][3]) + ' → ' + PLACES[destination][3]
        : 'Sin camino conocido hacia ' + PLACES[destination][3] + '.';
      txt(ctx, line1, 60, 816, 24, '#ffe9a8', 'left', true);
      txt(ctx, line2, 60, 848, 21, '#f4e5c8', 'left', false);
      if (st.length) button(ctx, { x: 1040, y: 801, w: 250, h: 62, size: 26, label: 'Seguir ruta', primary: true, id: 'map-follow', onTap: () => close(G, U) });
      button(ctx, { x: 1310, y: 801, w: 240, h: 62, size: 26, label: 'Volver', primary: !st.length, id: 'map-close', onTap: () => close(G, U) });
    },
    // en la escena: flecha hacia la salida que lleva al destino
    guide(ctx, G, S) {
      if (!destination || !S) return;
      const h = here(G);
      if (destination === h) { destination = null; G.ui.toast && G.ui.toast('Has llegado: ' + PLACES[h][3]); return; }
      const next = steps(G)[0];
      if (!next || !next.hotspot || !next.hotspot.rect || G.runner.busy || G.dialogue.active || G.ui.notes.length) return;
      const [left, top, width] = next.hotspot.rect, W = E.CONFIG.W;
      const rawX = left + width / 2 - S.camX, x = Math.max(110, Math.min(W - 150, rawX)), y = Math.max(70, top - 18);
      const ok = !next.when || E.state.test(next.when, G.state);
      const dir = rawX < 110 ? '←' : rawX > W - 150 ? '→' : '↓';
      const bob = Math.sin(performance.now() / 220) * 5;
      txt(ctx, dir + ' ' + (ok ? next.hotspot.name : next.hotspot.name + ' (cerrado)'), x, y + bob, 28, ok ? '#ffe092' : '#ffc1a3', 'center', true);
    }
  };
})(window.E1248 = window.E1248 || {});
