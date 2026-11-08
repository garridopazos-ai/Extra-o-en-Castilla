// CHAMELO RC07 · luz, atmósfera, cámara, sonido de ambiente, carisma y mapa con posición exacta.
// Se instala sobre el motor de CHAMELO RC06 desde createGame (E.rc07.install(G)); no cambia ni la trama ni los datos de guardado.
//  · Luz: contraluz (rim) del lado de la luz de cada escena + sombra propia y oclusión en los pies; sprites con caché por fotograma,
//    marionetas dibujadas a un lienzo propio. Se puede apagar en el menú («Efectos visuales»).
//  · Atmósfera: gradación y viñeta, rayos de luz, polvo en suspensión, vilanos, hojas, pájaros, peces que saltan, abejas, humo, palomas.
//  · Cámara: acercamiento suave en conversaciones y escenas, paneo de presentación en lugares anchos, anticipación al andar, temblor.
//  · Sonido: el ruido marrón continuo se sustituye por paisajes sonoros suaves por escena; volúmenes de Música y Ambiente en el menú.
//  · Carisma: comentarios espontáneos, iconos (! ? ♪), saltitos al coger cosas, frases de espera del viajero.
//  · Mapa: Soto de los Sifones e Isla del Chamelo; el viajero aparece en el punto exacto del mapa según dónde está dentro del lugar.
(function (E) {
  'use strict';
  const C = E.CONFIG, T = E.state.test, TAU = Math.PI * 2;
  const RC = E.rc07 = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem('1248_rc07_' + k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('1248_rc07_' + k, String(v)); } catch (e) {} }
  };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function norm(v) { const l = Math.hypot(v[0], v[1]) || 1; v[0] /= l; v[1] /= l; return v; }
  RC.fxOn = store.get('fx', '1') === '1';
  RC.rigFx = true; RC.spriteFx = true; RC.atmFx = true;
  // Si el móvil no llega (fotogramas de más de ~26 ms durante 3 s seguidos), se rebajan efectos por escalones.
  RC.autoDegrade = true; let slowT = 0, ema = 0.016, degraded = 0;
  function guard(dt, G) {
    if (!RC.autoDegrade || !RC.fxOn || !dt || dt > 0.1) return;
    ema += (dt - ema) * 0.05;
    slowT = ema > 0.026 ? slowT + dt : 0;
    if (slowT > 3 && degraded < 2) { slowT = 0; ema = 0.016; degraded++; if (degraded === 1) RC.rigFx = false; else RC.atmFx = false; if (G.ui.toast) G.ui.toast('Efectos reducidos para ir más fluido'); }
  }
  RC.toggleFx = () => { RC.fxOn = !RC.fxOn; store.set('fx', RC.fxOn ? '1' : '0'); if (RC.fxOn) { RC.rigFx = RC.spriteFx = RC.atmFx = true; } };

  // =====================================================================================================
  // 1 · LUZ DE PERSONAJES
  // dir = hacia dónde está la luz (vector desde el personaje). rim = color del contraluz; shade = color de la sombra propia.
  const EXT = { dir: [-0.78, -0.62], rim: '#ffe0a0', rimA: 0.92, shade: '#4a4272', shadeA: 0.34, foot: '#6a5848' };
  const LIGHT = {
    ribera: {}, orilla: {}, embarcadero: {}, travesia: { rimA: 0.9 }, puerta_rio: {}, plaza: {}, iglesia: {}, audiencia: {},
    chamelo: { rim: '#fff0b4', shade: '#585078', shadeA: 0.3 },
    acena: { dir: [-1, -0.3], rim: '#cfe5ff', rimA: 0.95, shade: '#251d33', shadeA: 0.5, rim2: { dir: [1, -0.25], col: '#ffe2a6', a: 0.6 } },
    alfar: { dir: [-1, 0.05], rim: '#ff9c55', rimA: 0.62, shade: '#3a2638', shadeA: 0.42, rim2: { dir: [1, -0.35], col: '#e2f1ff', a: 0.75 } },
    portazgo: { dir: [-1, -0.55], rim: '#ffd894', rimA: 0.9, shade: '#3a2a3e', shadeA: 0.44 }
  };
  function lightFor(S) {
    const o = LIGHT[S.def.id]; if (!o) return null;
    if (!o._n) { const m = { ...EXT, ...o }; Object.assign(o, m); o.dir = norm(o.dir.slice()); if (o.rim2) o.rim2.dir = norm(o.rim2.dir.slice()); o._n = 1; }
    return o;
  }
  // lienzos reutilizables: se agrandan por escalones de 16 px (al andar en profundidad no se crea uno nuevo por fotograma)
  function slot(s, W, H) {
    let c = s.c;
    if (!c || c.width < W || c.height < H || c.width > W + 96 || c.height > H + 96) c = s.c = E.createCanvas(Math.ceil(W / 16) * 16, Math.ceil(H / 16) * 16);
    return c;
  }
  // contraluz: la silueta menos la silueta desplazada hacia la sombra (3 escalones = borde suave)
  function buildRim(c, paint, L, d, col) {
    const g = c.getContext('2d'), W = c.width, H = c.height;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    paint(g, 0, 0);
    g.globalCompositeOperation = 'source-in';
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, col); gr.addColorStop(0.62, col); gr.addColorStop(1, hexA(col, 0.2));
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-out';
    const ex = -L[0] * d, ey = -L[1] * d;
    g.globalAlpha = 0.42; paint(g, ex, ey);
    g.globalAlpha = 0.6; paint(g, 2 * ex, 2 * ey);
    g.globalAlpha = 1; paint(g, 3 * ex, 3 * ey);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  // sombra propia: degradado de lado a lado del cuerpo (luz → sombra) y oclusión hacia los pies
  function buildShade(c, paint, L, ax, ay, bw, col, foot) {
    const g = c.getContext('2d'), W = c.width, H = c.height;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
    paint(g, 0, 0);
    g.globalCompositeOperation = 'source-in';
    const cy = ay - bw * 1.4;
    const gr = g.createLinearGradient(ax + L[0] * bw * 0.55, cy + L[1] * bw * 0.55, ax - L[0] * bw * 0.65, cy - L[1] * bw * 0.65);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.42, '#f2eff4'); gr.addColorStop(1, col);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'multiply';
    const y0 = ay - bw * 0.95, gv = g.createLinearGradient(0, y0, 0, ay);
    gv.addColorStop(0, '#ffffff'); gv.addColorStop(1, foot);
    g.fillStyle = gv; g.fillRect(0, y0, W, H - y0);
    g.globalCompositeOperation = 'destination-in'; paint(g, 0, 0);
    g.globalCompositeOperation = 'source-over';
  }
  function composite(ctx, fx, L, x, y, w, h) {
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = L.shadeA; ctx.drawImage(fx.shade.c, x, y, w, h);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = L.rimA; ctx.drawImage(fx.rim.c, x, y, w, h);
    if (L.rim2) { ctx.globalAlpha = L.rim2.a; ctx.drawImage(fx.rim2.c, x, y, w, h); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  // Sprites (hojas de animación): los lienzos de luz se rehacen solo cuando cambia el fotograma o el tamaño.
  function spriteLight(ctx, a, S, L, k) {
    const charId = a.def.charId || a.def.id, sheet = a.def.sprite && a.def.sprite.sheet;
    const e = E.assets.entry('char:' + charId), img = E.assets.get('char:' + charId);
    if (!img || !e || !e.final || !sheet || !a.visible) return;
    const scale = S.depthScale(a.y) * (a.def.scale || 1);
    const f = E.actor.frameFor(a, sheet);
    const s = (a.def.height / sheet.frameH) * scale, w = sheet.frameW * s, h = sheet.frameH * s;
    const pad = 6, qw = Math.max(9, Math.round(w * k / 3) * 3), kk = qw / w;
    const W = qw + 2 * pad, H = Math.round(h * kk) + 2 * pad;
    const fx = a._fx || (a._fx = { rim: {}, rim2: {}, shade: {} });
    const key = f.row + ':' + f.col + ':' + (f.flip ? 1 : 0) + ':' + qw + ':' + S.def.id + ':' + charId + ':' + f.anchor[0] + ':' + f.anchor[1];
    if (fx.key !== key) {
      fx.key = key;
      const sx = f.col * sheet.frameW, sy = f.row * sheet.frameH, dw = W - 2 * pad, dh = H - 2 * pad;
      const paint = (g, ox, oy) => {
        if (f.flip) { g.save(); g.translate(pad + ox + dw, pad + oy); g.scale(-1, 1); g.drawImage(img, sx, sy, sheet.frameW, sheet.frameH, 0, 0, dw, dh); g.restore(); }
        else g.drawImage(img, sx, sy, sheet.frameW, sheet.frameH, pad + ox, pad + oy, dw, dh);
      };
      const ax = f.anchor[0] * s * kk, ay = f.anchor[1] * s * kk;
      fx.axc = pad + (f.flip ? dw - ax : ax); fx.ayc = pad + ay; fx.kk = kk;
      const hpx = a.def.height * scale * kk;
      buildShade(slot(fx.shade, W, H), paint, L.dir, fx.axc, fx.ayc, 0.3 * hpx, L.shade, L.foot);
      const d = Math.max(1, 0.0065 * hpx);
      buildRim(slot(fx.rim, W, H), paint, L.dir, d, L.rim);
      if (L.rim2) buildRim(slot(fx.rim2, W, H), paint, L.rim2.dir, d, L.rim2.col);
    }
    let sc = f.breath ? 1 + 0.006 * Math.sin(a.animT * 1.9) : 1;
    if (f.nod) sc *= 1 + 0.011 * Math.max(0, Math.sin(a.animT * 9.5)) + 0.004 * Math.sin(a.animT * 4.1);
    const rot = f.shake ? Math.sin(a.animT * 11) * 0.010 : 0;
    ctx.save(); ctx.translate(a.x - S.camX, a.y); if (rot) ctx.rotate(rot); if (sc !== 1) ctx.scale(1, sc);
    const c = fx.shade.c;
    composite(ctx, fx, L, -fx.axc / fx.kk, -fx.ayc / fx.kk, c.width / fx.kk, c.height / fx.kk);
    ctx.restore();
  }
  // Marionetas (dibujadas por código): se pintan a un lienzo propio y desde ahí se calculan sombra y contraluz.
  // Marionetas (dibujadas por código): se pintan a un lienzo propio (nítido, se ve tal cual) y la luz se calcula
  // a media resolución a partir de él (el contraluz sale algo más suave y cuesta la cuarta parte).
  function rigLight(ctx, a, S, L, k) {
    if (!a.visible) return;
    const scale = S.depthScale(a.y) * (a.def.scale || 1), hs = a.def.height * scale;
    const Wl = hs * 0.95, Hl = hs * 1.32, fy = Hl * 0.9, pad = 6, R = 0.5;
    const W = Math.ceil(Wl * k) + 2 * pad, H = Math.ceil(Hl * k) + 2 * pad, w2 = Math.ceil(W * R), h2 = Math.ceil(H * R);
    const fx = a._fx || (a._fx = { rim: {}, rim2: {}, shade: {}, body: {} });
    if (!fx.body) fx.body = {};
    const body = slot(fx.body, W, H), g = body.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, body.width, body.height);
    g.setTransform(k, 0, 0, k, pad, pad); g.translate(0, fy - a.y);
    a._noShadow = true; E.rig.draw(g, a, scale, a.x - Wl / 2); a._noShadow = false;
    g.setTransform(1, 0, 0, 1, 0, 0);
    const px = a.x - S.camX, kr = (a.def.height / 300) * scale;
    ctx.fillStyle = 'rgba(25,15,5,.28)'; ctx.beginPath(); ctx.ellipse(px, a.y, 46 * kr, 9 * kr, 0, 0, TAU); ctx.fill();
    const x0 = px - Wl / 2 - pad / k, y0 = a.y - fy - pad / k;
    ctx.drawImage(body, 0, 0, W, H, x0, y0, W / k, H / k);
    const paint = (gg, ox, oy) => gg.drawImage(body, 0, 0, W, H, ox, oy, w2, h2);
    const sh = slot(fx.shade, w2, h2);
    buildShade(sh, paint, L.dir, (pad + Wl / 2 * k) * R, (pad + fy * k) * R, 0.3 * hs * k * R, L.shade, L.foot);
    const d = Math.max(0.7, 0.0065 * hs * k * R);
    buildRim(slot(fx.rim, w2, h2), paint, L.dir, d, L.rim);
    if (L.rim2) buildRim(slot(fx.rim2, w2, h2), paint, L.rim2.dir, d, L.rim2.col);
    composite(ctx, fx, L, x0, y0, sh.width / (k * R), sh.height / (k * R));
  }

  // =====================================================================================================
  // 2 · ATMÓSFERA POR ESCENA (coordenadas del mundo de cada escena)
  const GR_DAY = ['rgba(255,214,150,.13)', 'rgba(40,40,90,.07)'], SUN = [-60, -90, 950, 0.22];
  const ATM = {
    ribera: { sun: SUN, grade: GR_DAY, vig: 0.24, birds: 1, fish: [300, 520, 1450, 650], seeds: 12, leaves: [0, 1100, 30, 250] },
    orilla: { sun: SUN, grade: GR_DAY, vig: 0.22, birds: 1.2, fish: [200, 440, 3200, 590], seeds: 20, leaves: [1700, 2450, 80, 420], smoke: [[3625, 205, 0.45]], flies: [[1580, 610], [2760, 600]] },
    embarcadero: { sun: SUN, grade: GR_DAY, vig: 0.24, birds: 1, fish: [480, 420, 1450, 700], seeds: 10, leaves: [0, 480, 20, 240] },
    travesia: { sun: SUN, grade: GR_DAY, vig: 0.2, birds: 0.8, fish: [80, 430, 1520, 860] },
    chamelo: { sun: SUN, grade: ['rgba(255,226,160,.10)', 'rgba(70,60,40,.06)'], vig: 0.22, birds: 0.6, seeds: 12, bees: [[240, 560], [308, 562], [375, 556]], smoke: [[1390, 160, 1]], flies: [[300, 650], [1470, 760]], sparkle: [560, 618, 980, 688] },
    acena: { grade: ['rgba(30,40,70,.10)', 'rgba(20,10,5,.16)'], vig: 0.4, shafts: [{ poly: [[250, 642], [528, 642], [820, 900], [60, 900]], col: '200,225,255', a: 0.3 }, { poly: [[1482, 686], [1584, 686], [1660, 900], [1290, 900]], col: '255,235,190', a: 0.24 }], dust: [240, 170, 560, 700, 40] },
    alfar: { grade: ['rgba(255,170,90,.06)', 'rgba(40,20,10,.12)'], vig: 0.32, glow: [[318, 646, 135, '255,84,18', 0.26, 'lighter']], embers: [250, 630, 380, 680], shafts: [{ poly: [[1452, 670], [1560, 670], [1650, 900], [1140, 900]], col: '255,240,210', a: 0.26 }], dust: [1100, 300, 500, 540, 22] },
    portazgo: { grade: ['rgba(255,200,130,.08)', 'rgba(40,20,10,.12)'], vig: 0.32, shafts: [{ poly: [[0, 70], [170, 70], [780, 870], [380, 870]], col: '255,226,170', a: 0.22 }], dust: [60, 150, 720, 650, 30] },
    iglesia: { sun: SUN, grade: GR_DAY, vig: 0.24, birds: 0.8, seeds: 8 },
    plaza: { sun: SUN, grade: GR_DAY, vig: 0.22, birds: 0.6, seeds: 8, pigeons: [520, 705, 1350, 800, 6] },
    puerta_rio: { sun: SUN, grade: GR_DAY, vig: 0.22, birds: 0.8, seeds: 8, fish: [20, 430, 390, 610] },
    audiencia: { sun: SUN, grade: GR_DAY, vig: 0.24, birds: 0.5, pigeons: [560, 795, 1300, 860, 4] }
  };
  let A = null;           // estado de atmósfera de la escena actual
  const soft = (() => { const c = E.createCanvas(64, 64), g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c; })();
  function screenCanvas(cfg) {
    const c = E.createCanvas(320, 180), g = c.getContext('2d');
    if (cfg.grade) { const gr = g.createLinearGradient(0, 0, 0, 180); gr.addColorStop(0, cfg.grade[0]); gr.addColorStop(0.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, cfg.grade[1]); g.fillStyle = gr; g.fillRect(0, 0, 320, 180); }
    if (cfg.vig) { const r = g.createRadialGradient(160, 92, 70, 160, 92, 205); r.addColorStop(0, 'rgba(10,6,20,0)'); r.addColorStop(1, 'rgba(10,6,20,' + cfg.vig + ')'); g.fillStyle = r; g.fillRect(0, 0, 320, 180); }
    return c;
  }
  function shaftCanvas(list) {
    const c = E.createCanvas(800, 450), g = c.getContext('2d');
    g.filter = 'blur(10px)';
    for (const s of list) {
      const ys = s.poly.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const gr = g.createLinearGradient(0, y0 / 2, 0, y1 / 2); gr.addColorStop(0, 'rgba(' + s.col + ',' + s.a + ')'); gr.addColorStop(1, 'rgba(' + s.col + ',0)');
      g.fillStyle = gr; g.beginPath(); s.poly.forEach((p, i) => i ? g.lineTo(p[0] / 2, p[1] / 2) : g.moveTo(p[0] / 2, p[1] / 2)); g.closePath(); g.fill();
    }
    g.filter = 'none';
    return c;
  }
  function glowCanvas(col) { const c = E.createCanvas(128, 128), g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(' + col + ',1)'); r.addColorStop(0.4, 'rgba(' + col + ',.45)'); r.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return c; }

  function atmosEnter(S) {
    const cfg = ATM[S.def.id] || {};
    A = { cfg, S, t: 0, scr: screenCanvas(cfg), shafts: cfg.shafts ? shaftCanvas(cfg.shafts) : null, glows: (cfg.glow || []).map(g => ({ g, c: glowCanvas(g[3]) })), sun: cfg.sun ? glowCanvas('255,228,176') : null,
      dust: [], seeds: [], leaves: [], birds: [], birdT: rnd(4, 10), fish: [], fishT: rnd(3, 8), puffs: [], embers: [], pigeons: [], sparks: [] };
    if (cfg.dust) { const [x, y, w, h, n] = cfg.dust; for (let i = 0; i < n; i++) A.dust.push({ x: x + Math.random() * w, y: y + Math.random() * h, vx: rnd(-6, 6), vy: rnd(-4, 4), p: Math.random() * TAU, r: rnd(1.2, 2.8) }); }
    for (let i = 0; i < (cfg.seeds || 0); i++) A.seeds.push({ x: Math.random() * C.W, y: rnd(260, 720), vx: rnd(10, 26), p: Math.random() * TAU, r: rnd(1.4, 2.6) });
    if (cfg.leaves) for (let i = 0; i < 6; i++) A.leaves.push(newLeaf(cfg.leaves, true));
    if (cfg.pigeons) { const [x0, y0, x1, y1, n] = cfg.pigeons; for (let i = 0; i < n; i++) A.pigeons.push({ x: rnd(x0, x1), y: rnd(y0, y1), hx: 0, dir: Math.random() < 0.5 ? -1 : 1, st: 'ground', t: Math.random() * 3, vx: 0, vy: 0, back: 0 }); }
    if (cfg.sparkle) for (let i = 0; i < 12; i++) A.sparks.push({ x: rnd(cfg.sparkle[0], cfg.sparkle[2]), y: rnd(cfg.sparkle[1], cfg.sparkle[3]), p: Math.random() * TAU, s: rnd(0.6, 1.4) });
  }
  function newLeaf(r, any) { return { x: rnd(r[0], r[1]), y: any ? rnd(r[2], r[3] + 300) : rnd(r[2], r[3]), vy: rnd(28, 46), p: Math.random() * TAU, sw: rnd(14, 30), col: pick(['#8aa04a', '#a9b552', '#c9a83e', '#6f8e3c']), r: rnd(3, 5) }; }

  function atmosUpdate(dt, G) {
    if (!A) return;
    const cfg = A.cfg, S = A.S, cam = S.camX;
    A.t += dt;
    for (const d of A.dust) { d.p += dt * 0.7; d.x += (d.vx + Math.sin(d.p) * 4) * dt; d.y += (d.vy + Math.cos(d.p * 0.8) * 3) * dt; const [x, y, w, h] = cfg.dust; if (d.x < x) d.x += w; if (d.x > x + w) d.x -= w; if (d.y < y) d.y += h; if (d.y > y + h) d.y -= h; }
    for (const s of A.seeds) { s.p += dt; s.x += s.vx * dt; s.y += Math.sin(s.p * 0.9) * 9 * dt; if (s.x > C.W + 10) { s.x = -10; s.y = rnd(260, 720); } }
    if (cfg.leaves) for (let i = 0; i < A.leaves.length; i++) { const l = A.leaves[i]; l.p += dt * 1.6; l.y += l.vy * dt; l.x += Math.sin(l.p) * l.sw * dt + 6 * dt; if (l.y > cfg.leaves[3] + 420) A.leaves[i] = newLeaf(cfg.leaves); }
    // pájaros: bandadas que cruzan el cielo de vez en cuando
    if (cfg.birds) { A.birdT -= dt; if (A.birdT <= 0) { A.birdT = rnd(14, 30) / cfg.birds; const dir = Math.random() < 0.5 ? 1 : -1, y = rnd(70, 250), n = 2 + Math.floor(Math.random() * 4), v = rnd(110, 170); for (let i = 0; i < n; i++) A.birds.push({ x: dir > 0 ? -40 - i * rnd(24, 40) : C.W + 40 + i * rnd(24, 40), y: y + rnd(-22, 22), v: v * dir, p: Math.random() * TAU, s: rnd(0.8, 1.2) }); } }
    for (const b of A.birds) { b.x += b.v * dt; b.p += dt * 11; b.y += Math.sin(b.p * 0.2) * 6 * dt; }
    A.birds = A.birds.filter(b => b.x > -200 && b.x < C.W + 200);
    // peces que saltan (con «plop» si se ven)
    if (cfg.fish) { A.fishT -= dt; if (A.fishT <= 0) { A.fishT = rnd(6, 15); const [x0, y0, x1, y1] = cfg.fish; const lo = Math.max(x0, cam + 80), hi = Math.min(x1, cam + C.W - 80); if (hi > lo) { A.fish.push({ x: rnd(lo, hi), y: rnd(y0, y1), t: 0, dir: Math.random() < 0.5 ? -1 : 1, s: rnd(0.7, 1.1), snd: 0 }); } } }
    for (const f of A.fish) { f.t += dt; if (f.t > 0.62 && !f.snd) { f.snd = 1; snd.event('plop'); } }
    A.fish = A.fish.filter(f => f.t < 1.8);
    // humo de chimeneas
    for (const [x, y, k] of cfg.smoke || []) { if (Math.random() < dt * 3) A.puffs.push({ x: x + rnd(-3, 3) * k, y, k, t: 0, d: rnd(3.5, 5.5) }); }
    for (const p of A.puffs) { p.t += dt; p.y -= 20 * p.k * dt; p.x += (7 + p.t * 3) * p.k * dt; }
    A.puffs = A.puffs.filter(p => p.t < p.d);
    // ascuas del horno
    if (cfg.embers && Math.random() < dt * 4) { const [x0, y0, x1, y1] = cfg.embers; A.embers.push({ x: rnd(x0, x1), y: rnd(y0, y1), t: 0, d: rnd(0.8, 1.6), vx: rnd(-10, 10) }); }
    for (const e of A.embers) { e.t += dt; e.y -= 34 * dt; e.x += e.vx * dt; }
    A.embers = A.embers.filter(e => e.t < e.d);
    // palomas: picotean; si el viajero se acerca, salen volando y vuelven al rato
    if (cfg.pigeons && G.player) {
      const [x0, y0, x1, y1] = cfg.pigeons; let flew = false;
      for (const p of A.pigeons) {
        p.t += dt;
        if (p.st === 'ground') {
          if (Math.abs(G.player.x - p.x) < 170 && Math.abs(G.player.y - p.y) < 110 && G.player.moving) { p.st = 'fly'; p.vx = (p.x < G.player.x ? -1 : 1) * rnd(150, 230); p.vy = -rnd(180, 260); p.dir = Math.sign(p.vx); flew = true; }
          else if (p.t > 2.5 && Math.random() < dt * 0.6) { p.t = 0; p.dir = Math.random() < 0.5 ? -1 : 1; p.hx = rnd(10, 40) * p.dir; }
          if (p.hx) { const st = Math.sign(p.hx) * Math.min(Math.abs(p.hx), 22 * dt); p.x += st; p.hx -= st; p.x = clamp(p.x, x0, x1); }
        } else if (p.st === 'fly') {
          p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 40 * dt;
          if (p.y < -40) { p.st = 'away'; p.back = rnd(12, 22); }
        } else if (p.st === 'away') {
          p.back -= dt; if (p.back <= 0) { p.st = 'land'; p.tx = rnd(x0, x1); p.ty = rnd(y0, y1); p.x = p.tx + rnd(-300, 300); p.y = -30; p.dir = Math.sign(p.tx - p.x) || 1; }
        } else if (p.st === 'land') {
          const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
          if (d < 6) { p.st = 'ground'; p.t = 0; } else { const v = Math.min(d, 200 * dt); p.x += dx / d * v; p.y += dy / d * v; }
        }
      }
      if (flew) snd.event('flap');
    }
  }
  function atmosWorld(ctx, G) {
    if (!A) return;
    const cfg = A.cfg, cam = A.S.camX, t = A.t;
    if (A.shafts) { ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 0.6); ctx.drawImage(A.shafts, -cam, 0, 1600, 900); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    for (const { g, c } of A.glows) { const [x, y, r, , a, mode] = g; const fl = 0.78 + 0.14 * Math.sin(t * 7.3) + 0.08 * Math.sin(t * 13.1); ctx.globalCompositeOperation = mode || 'screen'; ctx.globalAlpha = a * fl; ctx.drawImage(c, x - r - cam, y - r, r * 2, r * 2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    for (const d of A.dust) { const a = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(d.p * 2.3)); ctx.fillStyle = 'rgba(255,244,214,' + a.toFixed(3) + ')'; ctx.fillRect(d.x - cam - d.r / 2, d.y - d.r / 2, d.r, d.r); }
    for (const e of A.embers) { const a = (1 - e.t / e.d) * (0.6 + 0.4 * Math.sin(e.t * 30)); ctx.fillStyle = 'rgba(255,' + (140 + (e.t * 60 | 0)) + ',60,' + a.toFixed(3) + ')'; ctx.fillRect(e.x - cam - 1.5, e.y - 1.5, 3, 3); }
    for (const p of A.puffs) { const u = p.t / p.d, r = (8 + u * 30) * p.k, a = 0.32 * (1 - u) * Math.min(1, p.t * 3); ctx.globalAlpha = a; ctx.drawImage(soft, p.x - cam - r, p.y - r, r * 2, r * 2); }
    ctx.globalAlpha = 1;
    for (const s of A.sparks) { const a = Math.max(0, Math.sin(t * 2.2 * s.s + s.p)); if (a < 0.2) continue; const x = s.x - cam, l = 5 * a * s.s; ctx.strokeStyle = 'rgba(255,255,240,' + (a * 0.8).toFixed(3) + ')'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - l, s.y); ctx.lineTo(x + l, s.y); ctx.moveTo(x, s.y - l); ctx.lineTo(x, s.y + l); ctx.stroke(); }
    for (const f of A.fish) {
      const x = f.x - cam;
      if (f.t < 0.62) { const u = f.t / 0.62, hx = x + f.dir * (u - 0.5) * 70 * f.s, hy = f.y - Math.sin(u * Math.PI) * 46 * f.s; ctx.save(); ctx.translate(hx, hy); ctx.rotate(f.dir * (u - 0.5) * 2.2); ctx.scale(f.dir, 1); ctx.fillStyle = '#c7d3d8'; ctx.beginPath(); ctx.ellipse(0, 0, 11 * f.s, 4 * f.s, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-10 * f.s, 0); ctx.lineTo(-17 * f.s, -5 * f.s); ctx.lineTo(-17 * f.s, 5 * f.s); ctx.closePath(); ctx.fill(); ctx.restore(); }
      for (const [x0, k] of [[x - f.dir * 35 * f.s, 0], [x + f.dir * 35 * f.s, 0.62]]) { const u = (f.t - k) / 1.1; if (u > 0 && u < 1) { ctx.strokeStyle = 'rgba(240,250,255,' + (0.7 * (1 - u)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x0, f.y + 2, 6 + u * 26 * f.s, 2 + u * 7 * f.s, 0, 0, TAU); ctx.stroke(); } }
    }
    for (const l of A.leaves) { const x = l.x - cam; if (x < -20 || x > C.W + 20) continue; ctx.save(); ctx.translate(x, l.y); ctx.rotate(Math.sin(l.p) * 0.9); ctx.fillStyle = l.col; ctx.beginPath(); ctx.ellipse(0, 0, l.r * 1.6, l.r * 0.8, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    for (const s of A.seeds) { ctx.fillStyle = 'rgba(255,255,250,.75)'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,250,.45)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - 3, s.y + 5); ctx.stroke(); }
    for (const b of A.birds) { const w = 9 * b.s, f = Math.sin(b.p) * 5 * b.s; ctx.strokeStyle = 'rgba(45,40,55,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x - w, b.y - f); ctx.quadraticCurveTo(b.x - w / 2, b.y - 3 - f / 2, b.x, b.y); ctx.quadraticCurveTo(b.x + w / 2, b.y - 3 - f / 2, b.x + w, b.y - f); ctx.stroke(); }
    if (cfg.bees) for (let h = 0; h < cfg.bees.length; h++) { const [hx, hy] = cfg.bees[h]; for (let i = 0; i < 3; i++) { const ph = h * 2.1 + i * 2.4, x = hx + Math.sin(t * 2.3 + ph) * 30 + Math.sin(t * 5.7 + ph * 1.7) * 8 - cam, y = hy - 22 + Math.sin(t * 3.1 + ph * 0.7) * 18; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(x - 1, y - 3, 2.6, 1.6 + Math.abs(Math.sin(t * 60 + i)), 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a2014'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill(); ctx.fillStyle = '#f2c400'; ctx.fillRect(x - 1.2, y - 0.8, 1.6, 1.6); } }
    for (const [fx0, fy0] of cfg.flies || []) for (let i = 0; i < 2; i++) { const ph = i * 3.3 + fx0 * 0.01, x = fx0 + Math.sin(t * 0.7 + ph) * 90 + Math.sin(t * 1.9 + ph) * 20 - cam, y = fy0 + Math.sin(t * 1.1 + ph * 1.3) * 36 - 20, fl = Math.abs(Math.sin(t * 16 + ph)); ctx.fillStyle = i ? '#ffd34d' : '#ffffff'; ctx.beginPath(); ctx.ellipse(x - 3 * fl, y, 4 * fl + 0.6, 3, -0.4, 0, TAU); ctx.ellipse(x + 3 * fl, y, 4 * fl + 0.6, 3, 0.4, 0, TAU); ctx.fill(); }
    for (const p of A.pigeons) {
      if (p.st === 'away') continue;
      const sc = A.S.depthScale(Math.max(p.y, 620)) * 1.05, x = p.x - cam, y = p.y, fly = p.st !== 'ground';
      const bob = fly ? 0 : Math.max(0, Math.sin(p.t * 4 + p.x)) * 3;
      ctx.save(); ctx.translate(x, y); ctx.scale(p.dir * sc, sc);
      if (!fly) { ctx.fillStyle = 'rgba(30,20,10,.22)'; ctx.beginPath(); ctx.ellipse(0, 1, 10, 3, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#b5654a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(-2, 0); ctx.moveTo(2, -4); ctx.lineTo(3, 0); ctx.stroke(); }
      ctx.fillStyle = '#8d93a3'; ctx.beginPath(); ctx.ellipse(0, -9, 11, 6.5, -0.15, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6d7383'; ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(-17, -12); ctx.lineTo(-15, -6); ctx.closePath(); ctx.fill();
      if (fly) { const w = Math.sin(A.t * 26 + p.x) * 10; ctx.fillStyle = '#a3a9b8'; ctx.beginPath(); ctx.moveTo(-3, -11); ctx.quadraticCurveTo(-6, -24 - w, 6, -26 - w); ctx.lineTo(4, -11); ctx.fill(); }
      else { ctx.fillStyle = '#7b8191'; ctx.beginPath(); ctx.ellipse(-1, -10, 7, 3.5, -0.2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#7f86a0'; ctx.beginPath(); ctx.arc(9, -16 + bob, 4.4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5fa07a'; ctx.beginPath(); ctx.arc(7.5, -12.5 + bob * 0.5, 3, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e8b04a'; ctx.beginPath(); ctx.moveTo(13, -16 + bob); ctx.lineTo(17, -15 + bob); ctx.lineTo(13, -14 + bob); ctx.fill();
      ctx.fillStyle = '#1a1010'; ctx.fillRect(10, -17.5 + bob, 1.6, 1.6);
      ctx.restore();
    }
  }
  function atmosScreen(ctx) {
    if (!A) return;
    if (A.sun) { const [x, y, r, a] = A.cfg.sun; ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a * (0.92 + 0.08 * Math.sin(A.t * 0.4)); ctx.drawImage(A.sun, x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    if (A.scr && (A.cfg.grade || A.cfg.vig)) ctx.drawImage(A.scr, 0, 0, C.W, C.H);
  }

  // =====================================================================================================
  // 3 · CÁMARA
  const cam = RC.cam = { z: 1, tz: 1, fx: 800, fy: 450, sx: 0, sy: 0, sh: 0, shT: 0, shD: 1, lb: 0, busyT: 0, rate: 2.4, la: 0 };
  RC.camOn = true;
  cam.toWorld = (x, y) => [cam.fx + (x - cam.fx) / cam.z - cam.sx, cam.fy + (y - cam.fy) / cam.z - cam.sy];
  cam.toScreen = (x, y) => [cam.fx + (x + cam.sx - cam.fx) * cam.z, cam.fy + (y + cam.sy - cam.fy) * cam.z];
  cam.shake = (amp, dur) => { cam.sh = Math.max(cam.sh, amp); cam.shD = dur || 0.5; cam.shT = cam.shD; };
  function cameraUpdate(dt, G) {
    const S = G.S; if (!S || !G.player) return;
    const dlg = G.dialogue.active, blocking = G.ui.bubbles.filter(b => b.blocking && !b.done && b.actor);
    cam.busyT = (G.runner.busy && blocking.length) ? cam.busyT + dt : 0;
    const cine = RC.camOn && !G.ui.overlay && (dlg || cam.busyT > 0.9);
    let tz = 1;
    if (cine) {
      const npc = dlg ? G.dialogueNpc() : null;
      const actors = dlg ? [G.player, npc].filter(Boolean) : [G.player, ...blocking.map(b => b.actor)];
      let x0 = 1e9, x1 = -1e9, hy = 1e9;
      for (const a of actors) { if (!a || !a.visible) continue; const hx = a.x - S.camX; x0 = Math.min(x0, hx - 70); x1 = Math.max(x1, hx + 70); hy = Math.min(hy, E.actor.headY(a, S.depthScale(a.y))); }
      if (x1 > x0) {
        const mx = clamp((x0 + x1) / 2, 60, C.W - 60), my = clamp(hy + 30, 120, 640);
        tz = dlg ? 1.1 : 1.06;
        if (mx - x0 > 1) tz = Math.min(tz, (mx - 24) / (mx - x0));
        if (x1 - mx > 1) tz = Math.min(tz, (C.W - 24 - mx) / (x1 - mx));
        tz = Math.max(1, tz);
        if (cam.z < 1.005) { cam.fx = mx; cam.fy = my; }
        else { cam.fx += (mx - cam.fx) * Math.min(1, dt * 1.5); cam.fy += (my - cam.fy) * Math.min(1, dt * 1.5); }
        cam.rate = 1.6;
      }
    }
    cam.tz = tz;
    cam.z += (cam.tz - cam.z) * Math.min(1, dt * cam.rate);
    if (Math.abs(cam.z - cam.tz) < 0.0008) cam.z = cam.tz;
    if (cam.z === 1 && !cine) cam.rate = 2.4;
    cam.lb += ((cine ? 1 : 0) - cam.lb) * Math.min(1, dt * 3);
    if (cam.shT > 0) { cam.shT -= dt; const a = cam.sh * Math.max(0, cam.shT / cam.shD); cam.sx = rnd(-a, a); cam.sy = rnd(-a, a) * 0.6; } else { cam.sx = cam.sy = 0; cam.sh = 0; }
  }
  // Primera visita: paneo de presentación en lugares anchos, «asentamiento» de cámara en los fijos.
  function cameraEnter(S, G) {
    const first = G.state.visited[S.def.id] === 1;
    cam.z = 1; cam.tz = 1; cam.busyT = 0;
    if (!first || !RC.camOn) return;
    const quiet = (S.def.firstEnter || []).every(st => st.note || st.set || st.wait != null || (st.say && (!st.who || st.who === 'player')));
    if (S.def.width > C.W && quiet) {
      const right = G.player.x < S.def.width / 2, from = right ? S.def.width - C.W : 0;
      S._pan = { t: 0, hold: 1.0, dur: clamp(Math.abs(from - clamp(G.player.x - C.W / 2, 0, S.def.width - C.W)) / 700, 2.2, 4.5), from };
      S.camF = S._pan.from; S.camX = S.camF;
    } else if (S.def.width <= C.W) { cam.z = 1.12; cam.fx = 800; cam.fy = 470; cam.rate = 1.3; }
  }
  function installCamera(G) {
    const upd = E.scene.updateCamera;
    E.scene.updateCamera = (S, px, dt, snap, k) => {
      const p = S._pan;
      if (p && !snap) {
        if (G.player && (G.player.moving || G.dialogue.active)) p.cancel = true;
        p.t += dt;
        const target = clamp(px - C.W / 2, 0, S.def.width - C.W);
        const u = p.cancel ? 1 : p.t < p.hold ? 0 : Math.min(1, (p.t - p.hold) / p.dur), e = u * u * (3 - 2 * u);
        if (p.cancel) { S._pan = null; S.camF = S.camF == null ? target : S.camF; return upd(S, px, dt, false, k); }
        S.camF = p.from + (target - p.from) * e; S.camX = Math.round(S.camF * k) / k;
        if (u >= 1) S._pan = null;
        return;
      }
      if (S.def.width > C.W && G.player) {
        const want = G.player.moving ? (G.player.lastH === 'left' ? -150 : 150) : 0;
        cam.la += (want - cam.la) * Math.min(1, dt * 1.2);
        px += cam.la;
      }
      return upd(S, px, dt, snap, k);
    };
  }

  // =====================================================================================================
  // 4 · SONIDO: paisajes sonoros suaves por escena (sintetizados) + volúmenes de Música y Ambiente
  const LEVELS = { music: [['alta', 0.46], ['media', 0.3], ['baja', 0.16], ['no', 0]], amb: [['alto', 1], ['medio', 0.6], ['bajo', 0.35], ['no', 0]] };
  const lvl = { music: +store.get('music', 1), amb: +store.get('amb', 2) };
  RC.levelName = k => LEVELS[k][lvl[k]][0];
  RC.cycle = k => { lvl[k] = (lvl[k] + 1) % LEVELS[k].length; store.set(k, lvl[k]); snd.applyLevels(); };
  E.audio.musicLevel = LEVELS.music[lvl.music][1];
  const SOUND = {
    ribera: { river: 0.5, birds: 1, wind: 0.15 },
    orilla: { river: 0.42, birds: 1.2, wind: 0.2, cuckoo: 1 },
    embarcadero: { river: 0.55, birds: 0.8, wind: 0.25, ducks: 1 },
    travesia: { lap: 0.8, river: 0.25, birds: 0.4, wind: 0.3 },
    chamelo: { brook: 0.9, bees: [308, 1], birds: 1 },
    acena: { room: 0.45, mill: 1 },
    puerta_rio: { wind: 0.6, birds: 0.6, river: 0.18 },
    plaza: { crowd: 0.24, birds: 0.4, pigeons: 1 },
    iglesia: { wind: 0.5, birds: 0.7, swallows: 1 },
    alfar: { fire: 0.5, room: 0.3 },
    portazgo: { room: 0.35, coins: 1 },
    audiencia: { crowd: 0.3, birds: 0.3, pigeons: 0.6 }
  };
  const snd = RC.snd = (() => {
    let ac = null, bus = null, group = null, bufs = null, ev = {}, prof = null, duck = 1, beeNode = null;
    function ok() { ac = E.audio.ctx; return !!(ac && ac.state === 'running' && E.audio.master && !E.audio.muted); }
    function loopBuf(secs, gen) {
      const sr = ac.sampleRate, n = Math.floor(sr * secs), F = Math.floor(sr * 0.35), tmp = new Float32Array(n + F);
      gen(tmp, sr);
      let peak = 0; for (let i = 0; i < tmp.length; i++) peak = Math.max(peak, Math.abs(tmp[i]));
      const k = peak ? 0.6 / peak : 1;
      for (let i = 0; i < F; i++) { const t = i / F; tmp[i] = tmp[i] * t + tmp[n + i] * (1 - t); }
      const b = ac.createBuffer(1, n, sr), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = tmp[i] * k; return b;
    }
    function pink(d) { let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898; d[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362; b6 = w * 0.115926; } }
    function brown(d) { let b = 0; for (let i = 0; i < d.length; i++) { b = 0.985 * b + 0.015 * (Math.random() * 2 - 1); d[i] = b; } }
    function buffers() {
      if (bufs) return bufs;
      bufs = {};
      bufs.pink = loopBuf(6, pink);
      bufs.brown = loopBuf(6, brown);
      bufs.babble = loopBuf(5, (d, sr) => { pink(d); let e = 0.5, tg = 0.5, nx = 0; for (let i = 0; i < d.length; i++) { if (i >= nx) { tg = 0.15 + Math.random() * 0.85; nx = i + Math.floor(sr * (0.03 + Math.random() * 0.09)); } e += (tg - e) * 0.004; d[i] *= e; } });
      bufs.lap = loopBuf(7.8, (d, sr) => { brown(d); for (let i = 0; i < d.length; i++) { const t = i / sr, s = Math.max(0, Math.sin(TAU * t / 2.6 + Math.sin(t * 0.7))); d[i] *= 0.25 + s * s * s * 1.6; } });
      bufs.murmur = loopBuf(6, (d, sr) => {
        for (let v = 0; v < 7; v++) { let y1 = 0, y2 = 0, w = 0, r = 0.985, env = 0, tg = 0, nx = 0;
          for (let i = 0; i < d.length; i++) {
            if (i >= nx) { const syl = Math.random() < 0.75; tg = syl ? 0.4 + Math.random() * 0.6 : 0; w = TAU * (250 + Math.random() * 700) / sr; nx = i + Math.floor(sr * (syl ? 0.12 + Math.random() * 0.16 : 0.15 + Math.random() * 0.5)); }
            env += (tg - env) * 0.0025; const x = (Math.random() * 2 - 1) * (1 - r); const y = 2 * r * Math.cos(w) * y1 - r * r * y2 + x; y2 = y1; y1 = y; d[i] += y * env;
          } }
      });
      return bufs;
    }
    function loopLayer(buf, gain, filters, pan, lfo) {
      const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = 0; s.loopEnd = buf.duration;
      let node = s;
      for (const [type, f, q] of filters) { const bq = ac.createBiquadFilter(); bq.type = type; bq.frequency.value = f; if (q) bq.Q.value = q; node.connect(bq); node = bq; }
      gain *= 8;   // nivel de mezcla (medido: «bajo» ≈ −47 dBFS, unos 10 dB por debajo del ruido de RC06)
      const g = ac.createGain(); g.gain.value = gain; node.connect(g);
      if (lfo) { const o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = lfo[0]; og.gain.value = gain * lfo[1]; o.connect(og); og.connect(g.gain); o.start(); group.nodes.push(o); }
      const p = ac.createStereoPanner(); p.pan.value = pan || 0; g.connect(p); p.connect(group.g);
      s.start(0, Math.random() * buf.duration); group.nodes.push(s);
      return g;
    }
    function start(sceneId) {
      if (!ok()) return;
      buffers();
      if (!bus) { bus = ac.createGain(); bus.gain.value = LEVELS.amb[lvl.amb][1]; bus.connect(E.audio.master); }
      stop();
      prof = SOUND[sceneId] || {};
      const t = ac.currentTime;
      group = { g: ac.createGain(), nodes: [], id: sceneId };
      group.g.gain.setValueAtTime(0.0001, t); group.g.gain.linearRampToValueAtTime(1, t + 1.6); group.g.connect(bus);
      const P = prof;
      if (P.river) { loopLayer(bufs.pink, 0.05 * P.river, [['lowpass', 650], ['highpass', 90]], -0.5, [0.07, 0.25]); loopLayer(bufs.pink, 0.04 * P.river, [['lowpass', 900], ['highpass', 140]], 0.55, [0.11, 0.3]); }
      if (P.brook) { loopLayer(bufs.babble, 0.09 * P.brook, [['bandpass', 1500, 0.7], ['highpass', 350]], 0.15); }
      if (P.lap) loopLayer(bufs.lap, 0.12 * P.lap, [['lowpass', 600]], 0);
      if (P.wind) loopLayer(bufs.pink, 0.035 * P.wind, [['bandpass', 520, 0.5]], -0.2, [0.05, 0.6]);
      if (P.room) loopLayer(bufs.brown, 0.05 * P.room, [['lowpass', 170]], 0);
      if (P.crowd) { loopLayer(bufs.murmur, 0.1 * P.crowd, [['lowpass', 1600], ['highpass', 180]], -0.35); loopLayer(bufs.murmur, 0.08 * P.crowd, [['lowpass', 1400], ['highpass', 200]], 0.4); }
      if (P.fire) loopLayer(bufs.brown, 0.06 * P.fire, [['lowpass', 260]], -0.4, [0.3, 0.3]);
      if (P.mill) group.millWater = loopLayer(bufs.babble, 0, [['bandpass', 900, 0.6]], -0.5);
      if (P.bees) {
        const o1 = ac.createOscillator(), o2 = ac.createOscillator(); o1.type = 'triangle'; o2.type = 'triangle'; o1.frequency.value = 196; o2.frequency.value = 203.5;
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 1.1;
        const g = ac.createGain(); g.gain.value = 0; const p = ac.createStereoPanner();
        const fl = ac.createOscillator(), flg = ac.createGain(); fl.frequency.value = 9; flg.gain.value = 6; fl.connect(flg); flg.connect(o1.frequency); flg.connect(o2.frequency);
        o1.connect(bp); o2.connect(bp); bp.connect(g); g.connect(p); p.connect(group.g); o1.start(); o2.start(); fl.start();
        group.nodes.push(o1, o2, fl); beeNode = { g, p, x: P.bees[0], v: P.bees[1] };
      } else beeNode = null;
      const now = performance.now() / 1000;
      ev = { birds: now + rnd(1, 4), cuckoo: now + rnd(8, 18), ducks: now + rnd(6, 16), pigeons: now + rnd(3, 8), swallows: now + rnd(4, 9), drip: now + rnd(1, 3), splash: now, creak: now + rnd(5, 10), crackle: now, coins: now + rnd(6, 12) };
    }
    function stop() {
      if (!group || !ac) return;
      const g = group, t = ac.currentTime;
      g.g.gain.cancelScheduledValues(t); g.g.gain.setValueAtTime(g.g.gain.value, t); g.g.gain.linearRampToValueAtTime(0.0001, t + 1.2);
      setTimeout(() => { for (const n of g.nodes) { try { n.stop(); } catch (e) {} } try { g.g.disconnect(); } catch (e) {} }, 1400);
      group = null; beeNode = null;
    }
    // ---- sonidos sueltos (todos muy bajos) ----
    function tone(t, f0, f1, dur, vol, type, pan, dest) {
      const o = ac.createOscillator(), g = ac.createGain(), p = ac.createStereoPanner();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      vol *= dest ? 1 : 2.5;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.012, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      p.pan.value = pan || 0; o.connect(g); g.connect(p); p.connect(dest || (group ? group.g : bus)); o.start(t); o.stop(t + dur + 0.03);
    }
    function burst(t, dur, vol, ftype, f, q, pan, dest) {
      const s = ac.createBufferSource(); s.buffer = bufs.pink; const bq = ac.createBiquadFilter(); bq.type = ftype; bq.frequency.value = f; if (q) bq.Q.value = q;
      const g = ac.createGain(), p = ac.createStereoPanner(); p.pan.value = pan || 0;
      vol *= 2.5;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(bq); bq.connect(g); g.connect(p); p.connect(dest || (group ? group.g : bus)); s.start(t, Math.random() * 4); s.stop(t + dur + 0.05);
    }
    function bird(t) {
      const pan = rnd(-0.85, 0.85), kind = Math.random();
      if (kind < 0.4) { const n = 4 + Math.floor(Math.random() * 5), f = rnd(3000, 3900); for (let i = 0; i < n; i++) tone(t + i * 0.075, f + (i % 2) * 380, f + (i % 2) * 380 - 200, 0.05, 0.014, 'sine', pan); }
      else if (kind < 0.75) { const n = 2 + Math.floor(Math.random() * 2); for (let i = 0; i < n; i++) tone(t + i * rnd(0.12, 0.2), rnd(3200, 3700), rnd(2500, 2900), 0.07, 0.016, 'sine', pan); }
      else { let tt = t; for (let i = 0; i < 4; i++) { const f = rnd(1500, 2500), d = rnd(0.11, 0.19); tone(tt, f, f * rnd(0.92, 1.12), d, 0.013, 'sine', pan); tt += d + 0.03; } }
    }
    function event(name) {
      if (!ok() || !bufs) return;
      const t = ac.currentTime + 0.01;
      if (name === 'plop') { tone(t, 950, 280, 0.09, 0.03, 'sine', rnd(-0.5, 0.5)); burst(t + 0.02, 0.14, 0.02, 'lowpass', 1300, 0, rnd(-0.5, 0.5)); }
      else if (name === 'flap') { for (let i = 0; i < 9; i++) burst(t + i * 0.055 + Math.random() * 0.02, 0.035, 0.03, 'bandpass', 1300, 1.2, rnd(-0.4, 0.4)); }
      else if (name === 'pop') tone(t, 620, 1250, 0.07, 0.035, 'sine', 0, E.audio.master);
      else if (name === 'twinkle') { tone(t, 1568, 1568, 0.18, 0.03, 'triangle', 0, E.audio.master); tone(t + 0.08, 2093, 2093, 0.22, 0.025, 'triangle', 0, E.audio.master); }
    }
    function tick(G) {
      if (!group || !ok()) return;
      const now = performance.now() / 1000, t = ac.currentTime + 0.02, P = prof;
      if (P.birds && now > ev.birds) { ev.birds = now + rnd(2.5, 8) / P.birds; bird(t); }
      if (P.cuckoo && now > ev.cuckoo) { ev.cuckoo = now + rnd(22, 40); const pan = rnd(-0.7, 0.7); for (let r = 0; r < 2; r++) { tone(t + r * 0.9, 660, 650, 0.26, 0.02, 'triangle', pan); tone(t + r * 0.9 + 0.32, 528, 520, 0.34, 0.02, 'triangle', pan); } }
      if (P.ducks && now > ev.ducks) { ev.ducks = now + rnd(18, 34); const pan = rnd(-0.8, 0.8), n = 2 + Math.floor(Math.random() * 2); for (let i = 0; i < n; i++) { tone(t + i * 0.22, 330, 280, 0.13, 0.012, 'sawtooth', pan); burst(t + i * 0.22, 0.1, 0.01, 'bandpass', 1100, 3, pan); } }
      if (P.pigeons && now > ev.pigeons) { ev.pigeons = now + rnd(6, 14) / P.pigeons; const pan = rnd(-0.6, 0.6); tone(t, 330, 300, 0.3, 0.012, 'sine', pan); tone(t + 0.34, 360, 290, 0.5, 0.012, 'sine', pan); }
      if (P.swallows && now > ev.swallows) { ev.swallows = now + rnd(8, 16); const pan = rnd(-0.8, 0.8), n = 3 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) tone(t + i * 0.09, rnd(5200, 6000), rnd(4500, 5000), 0.03, 0.008, 'sine', pan); }
      if (P.coins && now > ev.coins) { ev.coins = now + rnd(12, 24); for (let i = 0; i < 3; i++) { tone(t + i * 0.16, 2400 + i * 160, 2380, 0.28, 0.012, 'sine', 0.6); tone(t + i * 0.16, 3150, 3100, 0.2, 0.006, 'sine', 0.6); } }
      if (P.fire && now > ev.crackle) { ev.crackle = now + rnd(0.05, 0.45); burst(t, rnd(0.008, 0.025), rnd(0.015, 0.045), 'highpass', 1800, 0, rnd(-0.6, -0.1)); }
      if (P.mill) {
        const on = T('rueda_libre', G.state);
        if (group.millWater) group.millWater.gain.setTargetAtTime(on ? 0.5 : 0, t, 0.6);
        if (on && now > ev.splash) { ev.splash = now + rnd(0.38, 0.48); burst(t, 0.16, 0.035, 'bandpass', rnd(700, 1100), 1.4, -0.45); if (Math.random() < 0.5) tone(t, 78, 60, 0.12, 0.03, 'sine', -0.3); }
        if (!on && now > ev.drip) { ev.drip = now + rnd(2.2, 5.5); tone(t, 1800, 1050, 0.07, 0.02, 'sine', -0.5); tone(t + 0.19, 1800, 1050, 0.07, 0.007, 'sine', -0.6); }
        if (now > ev.creak) { ev.creak = now + rnd(9, 17); tone(t, 140, 96, 0.5, 0.008, 'sawtooth', rnd(-0.3, 0.3)); }
      }
      if (beeNode && G.player) { const d = Math.abs(G.player.x - beeNode.x), v = 0.12 * beeNode.v * clamp(1 - d / 1100, 0, 1) ** 2; beeNode.g.gain.setTargetAtTime(v, t, 0.3); beeNode.p.pan.setTargetAtTime(clamp((beeNode.x - G.player.x) / 900, -0.9, 0.9), t, 0.3); }
      // conversaciones: el ambiente y la música se apartan un poco
      const talking = G.dialogue.active || G.ui.bubbles.some(b => b.blocking && !b.done);
      const want = talking ? 0.62 : 1;
      if (Math.abs(want - duck) > 0.01) { duck = want; bus.gain.setTargetAtTime(LEVELS.amb[lvl.amb][1] * duck, t, 0.4); const mg = E.audio.musicGain; if (mg && E.audio.musicLevel != null) mg.gain.setTargetAtTime(E.audio.musicLevel * (talking ? 0.8 : 1), t, 0.5); }
    }
    function applyLevels() {
      E.audio.musicLevel = LEVELS.music[lvl.music][1];
      if (!ac) return;
      const t = ac.currentTime;
      if (bus) bus.gain.setTargetAtTime(LEVELS.amb[lvl.amb][1] * duck, t, 0.2);
      const mg = E.audio.musicGain; if (mg) { mg.gain.cancelScheduledValues(t); mg.gain.setTargetAtTime(E.audio.musicLevel, t, 0.2); }
    }
    return { start, stop, tick, event, applyLevels, ready: () => ok(), get scene() { return group && group.id; } };
  })();
  let wantedScene = null;
  E.audio.ambient = spec => { /* sustituido: el paisaje sonoro lo arranca la escena (ver update) */ };

  // =====================================================================================================
  // 5 · CARISMA: comentarios espontáneos, iconos y reacciones
  const BARKS = {
    mingo: ['Si alguien pregunta, yo no he estado aquí. Ni allí.', 'Mi plan es sencillo: tú te metes en líos y yo como.', '¿En tu tierra los ladrones tienen gremio? Pregunto por un amigo.', 'Huele a pan. Me voy a desmayar cerca, por si acaso.', 'Tienes cara de llevar dinero. Lástima que no lo lleves.'],
    ciego: ['Dicen que soy ciego. Yo digo que el mundo está muy mal iluminado.', '¿Mingo? No lo he visto. Literalmente.', 'Huelo uvas. Y huelo a un niño que huele uvas.', 'Forastero, no hace falta que me hagáis señas. Ya sé que me estáis haciendo señas.'],
    duran: ['Treinta y uno, treinta y dos... ¿Quién me ha movido un saco?', 'Una aceña parada es como un molinero sin chismes: no sirve de nada.', 'Si el Tajo sube un palmo más, cobro el pan a precio de pescado.'],
    elvira_aceña: ['Llevas las botas más raras de Castilla. Y mira que he visto botas.', '¿De verdad en tu tiempo la harina viene en cajas? Qué tristeza de molinos.', 'Mi padre dice que no hable con forasteros. Por eso hablo bajito.'],
    elvira: ['Mingo, deja la miel. Te estoy viendo. Bueno, te estoy oyendo masticar.', 'Raimundo dice que lee el futuro en las abejas. El mío dice «siéntate».'],
    leonor: ['¿Hechicero? Apicultor con buena fama, que no es lo mismo.', 'Las abejas me avisan de las visitas. Esta vez han dicho «otra vez el niño».', 'La miel lo cura todo. Menos la curiosidad: esa la empeora.'],
    alfonso: ['Una moneda por cruzar. Dos si cantas. Tres si cantas mal.', 'El Tajo me conoce. Por eso no me ahoga: le daría vergüenza.', 'Esta barca tiene más remiendos que mi capa. Y aguanta mejor.'],
    alfonso_b: ['Rema tú si quieres; yo ya he remado esta mañana. Y la de ayer.', 'Si ves al monstruo del Tajo, no le mires a los ojos. Es muy tímido.'],
    nuno_puerta: ['Tasa por pararse a mirar. Ya me la debes.', 'Respirad, respirad: la primera bocanada es gratis.'],
    nuno_casa: ['Si sonríes, es tasa de alegría. Yo no sonrío: ahorro.', 'Un buen alguacil cobra hasta lo que no existe. Sobre todo lo que no existe.'],
    nuno_aud: ['Que conste en acta que este acta tiene tasa.'],
    yucaf: ['El barro tiene paciencia. Yo también, hasta que alguien me tasa.'],
    yucaf_alfar: ['Un buen cántaro guarda el agua y los secretos. Los malos, solo el agua.', 'El horno está dormido. Cuando despierta, hasta el barro se pone nervioso.'],
    mayordomo: ['Orden en la sala. Bueno, en la plaza. Orden donde sea.', 'He visto pleitos por una gallina. Este promete más.'],
    benito: ['Sin badajo, la campana solo dice «...».', 'Dios aprieta pero no ahoga. Nuño aprieta y además cobra.'],
    sancha: ['Si Nuño huele mi pan, me cobra el olor.', 'Pan de Talavera: duro por fuera, tierno por dentro. Como yo.'],
    lope: ['Martillo, yunque y misterio. Por ese orden.', 'Un herrero sin truco es un hombre que golpea cosas.'],
    gil_a: ['Gil, ¿qué vigilamos?', 'Yo vigilo la entrada. Él vigila que yo vigile.'],
    gil_b: ['La orden, Gil. Vigilamos la orden.', 'Si entra, mal. Si no entra, también mal. Me encanta este trabajo.']
  };
  const QUIPS = ['Sin cobertura. Lógico: faltan siete siglos para la primera antena.', 'Nota mental: en 1248 no hay cafeterías. Ni café.', 'Si me quedo quieto mucho rato, seguro que Nuño me cobra por estar parado.', 'Respira. Es solo la Edad Media. ¿Qué podría salir mal?', '¿Y si el portal se abre justo ahora que estoy mirando hacia otro lado?', 'Mi madre no se va a creer nada de esto. Yo tampoco, la verdad.'];
  const MORE_GENERIC = {
    look: ['Muy medieval. Muy... marrón.', 'Interesante. En un museo tendría su cartelito.', 'Si lo miro más rato, me cobrarán tasa de mirada.'],
    pick: ['Lo dejo donde está. Parece feliz ahí.', 'Pesa más que mi conciencia.'],
    use: ['Ni idea. En el siglo XXI esto lo resolvía un tutorial.', 'Lo intento con convicción. Fracaso con convicción.'],
    talk: ['Silencio. Mejor conversación que muchas de mi oficina.'],
    useWrong: ['Ni el rey Fernando lo aprobaría, y está muy ocupado.', 'Lo junto, lo separo, lo vuelvo a juntar... nada.'],
    giveNo: ['Me mira como si le ofreciera un recibo.', 'Gracias, pero no, gracias.'],
    unreachable: ['Ni estirándome. Y eso que una vez hice yoga.']
  };
  const em = [];           // iconos sobre las cabezas
  let reveal = 0, sparkle = null;
  RC.emote = (a, s, d) => { if (!a) return; for (let i = em.length - 1; i >= 0; i--) if (em[i].a === a) em.splice(i, 1); em.push({ a, s, t: 0, d: d || 1.4 }); snd.event('pop'); };
  RC.hop = a => { if (a) a._hop = 0.001; };
  RC.wobble = a => { if (a) a._wob = 0.001; };
  RC.lastBusy = 0;
  RC.swallow = () => performance.now() / 1000 - RC.lastBusy < 0.35;
  RC.quiet = (G, n) => !!(G.runner.busy || G.dialogue.active || G.ui.notes.length || G.ui.overlay || G.ui.bubbles.some(b => !b.done && b.actor !== n.actor));
  RC.reveal = () => { reveal = 2.4; snd.event('twinkle'); };
  const bark = { last: 0, per: {}, idx: {}, enter: 0 };
  let lastInput = 0, lastQuip = 0, qi = Math.floor(Math.random() * QUIPS.length);
  function barksUpdate(G, now) {
    const busy = G.runner.busy || G.dialogue.active || G.ui.notes.length || G.ui.overlay || G.transitioning;
    if (busy) { if (G.ui.bubbles.some(b => b.bark)) G.ui.bubbles = G.ui.bubbles.filter(b => !b.bark); return; }
    if (G.ui.bubbles.length) { bark.last = Math.max(bark.last, now - 4); return; }
    if (now - bark.enter < 7 || now - bark.last < 11) return;
    const S = G.S, p = G.player; if (!S || !p) return;
    // frase de espera del viajero
    if (now - lastInput > 32 && now - lastQuip > 50 && !p.moving) { lastQuip = now; bark.last = now; const b = G.ui.say(p, QUIPS[qi++ % QUIPS.length], false); b.bark = true; return; }
    const cand = [];
    for (const n of G.sceneNpcs) {
      const id = n.def.id, list = BARKS[id], a = n.actor; if (!list || !a.visible || a.hold) continue;
      const sx = a.x - S.camX; if (sx < 80 || sx > C.W - 80) continue;
      if (Math.abs(a.x - p.x) > 900 || now - (bark.per[id] || -99) < 30) continue;
      if (id === 'mingo' && (!E.companion || !E.companion.present(G))) continue;
      cand.push(n);
    }
    if (!cand.length || Math.random() > 0.5) { bark.last = now - 6; return; }
    const n = pick(cand), id = n.def.id, list = BARKS[id];
    bark.per[id] = now; bark.last = now;
    const i = bark.idx[id] = ((bark.idx[id] == null ? Math.floor(Math.random() * list.length) : bark.idx[id]) + 1) % list.length;
    const b = G.ui.say(n.actor, list[i], false); b.bark = true;
    if (id === 'mingo' && Math.random() < 0.3) RC.emote(n.actor, '♪', 1.2);
  }
  function drawEmotes(ctx, S, dt) {
    for (let i = em.length - 1; i >= 0; i--) {
      const e = em[i]; e.t += dt; if (e.t > e.d || !e.a.visible) { em.splice(i, 1); continue; }
      const sc = S.depthScale(e.a.y); let [x, y] = cam.toScreen(e.a.x - S.camX, E.actor.headY(e.a, sc) - 34);
      const pop = e.t < 0.25 ? 0.6 + 0.55 * Math.sin(e.t / 0.25 * Math.PI * 0.75) : 1, fade = Math.min(1, (e.d - e.t) / 0.3);
      y = Math.max(40, y - Math.min(1, e.t * 6) * 10);
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y); ctx.scale(pop, pop);
      ctx.fillStyle = '#fff8e6'; ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 23, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-6, 20); ctx.lineTo(0, 32); ctx.lineTo(6, 20); ctx.closePath(); ctx.fill();
      ctx.font = 'bold 30px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = e.s === '!' ? '#c0392b' : e.s === '?' ? '#2f56a8' : '#7a4a10'; ctx.fillText(e.s, 0, 2);
      ctx.restore();
    }
    if (sparkle) {
      sparkle.t += dt; const a = sparkle.a; if (sparkle.t > 0.8 || !a) sparkle = null;
      else { const sc = S.depthScale(a.y), [x, y] = cam.toScreen(a.x - S.camX, E.actor.headY(a, sc) + 40), u = sparkle.t / 0.8;
        for (let i = 0; i < 7; i++) { const ang = i / 7 * TAU + u, r = 30 + u * 60, sx = x + Math.cos(ang) * r, sy = y + Math.sin(ang) * r * 0.7, l = 7 * (1 - u); ctx.strokeStyle = 'rgba(255,230,140,' + (1 - u).toFixed(3) + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx - l, sy); ctx.lineTo(sx + l, sy); ctx.moveTo(sx, sy - l); ctx.lineTo(sx, sy + l); ctx.stroke(); } }
    }
  }
  function drawReveal(ctx, S, G, dt) {
    if (reveal <= 0) return;
    reveal -= dt;
    const a = Math.min(1, reveal * 2, (2.4 - reveal) * 5), t = 2.4 - reveal;
    ctx.save(); ctx.globalAlpha = a;
    const lab = (s, x, y) => { ctx.font = 'bold 22px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(20,12,6,.9)'; ctx.strokeText(s, x, y); ctx.fillStyle = '#ffe9a8'; ctx.fillText(s, x, y); };
    for (const h of S.hotspots()) {
      let cx, cy; if (h.rect) { cx = h.rect[0] + h.rect[2] / 2; cy = h.rect[1] + h.rect[3] / 2; } else { cx = h.poly.reduce((s, p) => s + p[0], 0) / h.poly.length; cy = h.poly.reduce((s, p) => s + p[1], 0) / h.poly.length; }
      const [x, y] = cam.toScreen(cx - S.camX, cy); if (x < -50 || x > C.W + 50) continue;
      const r = 14 + 4 * Math.sin(t * 6 + cx);
      ctx.strokeStyle = h.exit ? 'rgba(118,215,238,.95)' : 'rgba(255,214,110,.95)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = h.exit ? 'rgba(118,215,238,.5)' : 'rgba(255,214,110,.5)'; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill();
      lab((h.exit ? '➜ ' : '') + h.name, x, y - 30);
    }
    for (const n of G.sceneNpcs) { const ac = n.actor; if (!ac.visible) continue; const [x, y] = cam.toScreen(ac.x - S.camX, E.actor.headY(ac, S.depthScale(ac.y)) - 16); lab(G.npcName(n.def.id), x, y); }
    ctx.restore();
  }

  // =====================================================================================================
  // 6 · MAPA: lugares nuevos, numeración en orden de historia y posición exacta del viajero
  const PLACE_FIX = {
    ribera: [1, 300, 652, 'Ribera del Tajo'], orilla: [2, 738, 624, 'Soto de los Sifones'], acena: [3, 505, 628, 'Aceña de Durán'], chamelo: [4, 1048, 562, 'Isla del Chamelo'],
    embarcadero: [5, 180, 572, 'Embarcadero'], travesia: [6, 520, 562, 'Travesía del Tajo'], puerta_rio: [7, 860, 500, 'Puerta del Río'], plaza: [8, 860, 372, 'Plaza del Pan'],
    iglesia: [9, 780, 284, 'Santa María'], portazgo: [10, 1000, 236, 'Casa del Portazgo'], audiencia: [11, 986, 390, 'Vista Pública'], alfar: [12, 1300, 446, 'Alfar de Yuçaf']
  };
  // escena x → punto del mapa (se interpola entre puntos de control)
  const TRACK = {
    ribera: [[0, 222, 646], [1300, 345, 657], [2000, 498, 652], [2600, 572, 650]],
    orilla: [[0, 580, 650], [1600, 742, 640], [3200, 955, 626], [4000, 1046, 634]],
    embarcadero: [[0, 128, 598], [700, 176, 584], [2000, 226, 640]],
    puerta_rio: [[0, 780, 520], [1400, 856, 508], [2200, 905, 506]],
    plaza: [[0, 842, 404], [1500, 872, 384], [2600, 918, 372]],
    acena: [[0, 486, 636], [1600, 524, 636]], iglesia: [[0, 768, 300], [1600, 794, 300]], portazgo: [[0, 988, 252], [1600, 1014, 252]],
    audiencia: [[0, 974, 404], [1600, 1000, 404]], alfar: [[0, 1286, 462], [1600, 1314, 462]], chamelo: [[0, 966, 574], [1600, 1008, 574]]
  };
  const ROUTE = [[180, 548], [330, 538], [500, 574], [650, 556], [780, 528], [858, 512]];
  const LANDMARKS = {
    ribera: [[0, 'camino del embarcadero'], [450, 'bajo el fresno'], [1100, 'frente al azud'], [1900, 'a la puerta de la aceña'], [2480, 'camino del soto']],
    orilla: [[0, 'saliendo de la ribera'], [200, 'junto al mojón'], [1000, 'junto al banco'], [1550, 'en la huerta del espantapájaros'], [2100, 'bajo la higuera'], [2750, 'bajo la parra del ciego'], [3220, 'frente al vado del Chamelo']],
    embarcadero: [[450, 'en el muelle'], [1100, 'junto a la red'], [1750, 'ante la choza de Alfonso']],
    puerta_rio: [[150, 'en la orilla'], [750, 'al pie de la torre'], [1400, 'ante el portón']],
    plaza: [[150, 'junto a la Puerta del Río'], [550, 'entre los puestos de pan'], [1150, 'junto a la fuente'], [1500, 'ante Santa María'], [1980, 'frente al Portazgo'], [2280, 'ante la Vista Pública'], [2500, 'camino del alfar']]
  };
  function along(pts, x) {
    if (x <= pts[0][0]) return [pts[0][1], pts[0][2]];
    for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const a = pts[i - 1], b = pts[i], u = (x - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; }
    const l = pts[pts.length - 1]; return [l[1], l[2]];
  }
  function mapPos(G) {
    const S = G.S; if (!S || !G.player) return null;
    const id = S.def.id;
    if (id === 'travesia') { const u = clamp(0.15 + S.time / 30, 0.15, 0.85) * (ROUTE.length - 1), i = Math.min(ROUTE.length - 2, Math.floor(u)), f = u - i; return [ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * f, ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * f]; }
    const tr = TRACK[id]; if (!tr) { const p = E.journey.places[id]; return p ? [p[1], p[2] + 18] : null; }
    const [x, y] = along(tr, G.player.x);
    return [x, y + clamp((G.player.y - 760) / 40, -3, 4)];
  }
  RC.mapPos = mapPos;
  function landmark(G) { const L = LANDMARKS[G.S.def.id]; if (!L) return ''; let best = L[0]; for (const l of L) if (Math.abs(l[0] - G.player.x) < Math.abs(best[0] - G.player.x)) best = l; return best[1]; }
  function drawMini(ctx, a, x, y, hgt) {
    const def = a.def, id = def.charId || def.id, sheet = def.sprite && def.sprite.sheet, img = E.assets.get('char:' + id), e = E.assets.entry('char:' + id);
    if (!img || !sheet || !e || !e.final) return;
    const names = Object.keys(sheet.anims), k = names.find(n => n.startsWith('idle')) || names[0], an = sheet.anims[k];
    const anc = an.anchor || sheet.anchor, sc = hgt / anc[1];
    const base = k.endsWith('left') ? 'left' : 'right', flip = (a.lastH || 'right') !== base;
    ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, 0, an.row * sheet.frameH, sheet.frameW, sheet.frameH, -anc[0] * sc, -anc[1] * sc, sheet.frameW * sc, sheet.frameH * sc);
    ctx.restore();
  }
  // Pantalla del mapa propia: chinchetas más pequeñas, sin rótulos encima del dibujo, el viajero en su punto exacto,
  // la ruta sale de donde está él y la barra de abajo dice el lugar y el sitio concreto («junto a la fuente»).
  function edgesOf(from) {
    const sc = E.DATA.scenes[from], P = E.journey.places; if (!sc) return [];
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
  function mtxt(ctx, s, x, y, size, color, align, bold) {
    ctx.font = (bold ? 'bold ' : '') + size + 'px system-ui, sans-serif'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size / 5); ctx.strokeStyle = 'rgba(25,15,8,.9)'; ctx.strokeText(s, x, y); ctx.fillStyle = color; ctx.fillText(s, x, y);
  }
  function installMap(G) {
    const J = E.journey; if (!J) return;
    Object.assign(J.places, PLACE_FIX);
    J.draw = (ctx, G2, U, button) => {
      const P = J.places, now = performance.now(), h = G.S && G.S.def.id, dest = J.destination;
      const st = dest && h && dest !== h ? (route(G, h, dest) || route(G, h, dest, true) || []) : [];
      const me = mapPos(G);
      U.buttons.push({ x: 0, y: 0, w: C.W, h: C.H, z: -2, onTap: () => {}, id: 'map-bg' });
      const im = E.illus && E.illus.map;
      if (im && im.complete && im.naturalWidth) ctx.drawImage(im, 0, 0, C.W, C.H); else { ctx.fillStyle = '#2a2016'; ctx.fillRect(0, 0, C.W, C.H); }
      ctx.fillStyle = 'rgba(10,6,2,.12)'; ctx.fillRect(0, 0, C.W, C.H);
      if (st.length) {
        const pts = (me ? [me] : [[P[h][1], P[h][2]]]).concat(st.map(e => [P[e.to][1], P[e.to][2]]));
        ctx.save(); ctx.setLineDash([16, 12]); ctx.lineDashOffset = -now / 40; ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(20,40,60,.8)'; ctx.lineWidth = 10; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
        ctx.strokeStyle = '#76d7ee'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
      }
      const visited = G.state.visited || {};
      for (const id in P) {
        const [n, x, y, label] = P[id], cur = id === h, vis = !!visited[id], dst = id === dest;
        ctx.beginPath(); ctx.arc(x, y, 19, 0, TAU);
        ctx.fillStyle = cur ? '#ffd578' : vis ? '#2f6b55' : '#4a3d30'; ctx.fill();
        ctx.lineWidth = dst ? 5 : 2.5; ctx.strokeStyle = dst ? '#76d7ee' : '#f3dfb3'; ctx.stroke();
        mtxt(ctx, String(n), x, y + 1, 19, cur ? '#2a1a08' : '#ffffff', 'center', true);
        if (dst) mtxt(ctx, 'Destino · ' + label, x, y - 36, 21, '#bff0fb', 'center', true);
        U.buttons.push({ x: x - 32, y: y - 32, w: 64, h: 64, id: 'pin-' + id, onTap: () => { J.setDestination(dest === id ? null : id); E.audio.play('tap'); } });
      }
      if (me) {
        const [x, y] = me, u = (now % 1600) / 1600;
        ctx.save();
        ctx.fillStyle = 'rgba(30,15,5,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 2, 15, 5, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,92,60,' + (1 - u).toFixed(3) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y + 2, 14 + u * 34, 5 + u * 12, 0, 0, TAU); ctx.stroke();
        const m = E.companion && E.companion.present(G) ? G.npc('mingo') : null;
        if (m) drawMini(ctx, m, x - 17, y + 1, 44);
        drawMini(ctx, G.player, x, y + 2, 64);
        ctx.fillStyle = '#c73a2c'; ctx.strokeStyle = '#3b2417'; ctx.lineWidth = 2;
        const by = y - 92 - Math.abs(Math.sin(now / 300)) * 6;
        ctx.beginPath(); ctx.moveTo(x - 28, by - 16); ctx.lineTo(x + 28, by - 16); ctx.lineTo(x + 28, by + 10); ctx.lineTo(x + 6, by + 10); ctx.lineTo(x, by + 20); ctx.lineTo(x - 6, by + 10); ctx.lineTo(x - 28, by + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.font = 'bold 20px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff6dc'; ctx.fillText('TÚ', x, by - 2);
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(30,18,8,.88)'; ctx.fillRect(30, 792, C.W - 60, 78);
      ctx.fillStyle = 'rgba(233,165,35,.9)'; ctx.fillRect(30, 792, C.W - 60, 3);
      const next = st[0], blocked = next && next.when && !T(next.when, G.state), lm = h && P[h] ? landmark(G) : '';
      const line1 = h && P[h] ? 'Estás en ' + P[h][3] + (lm ? ' · ' + lm : '') : 'Talavera, 1248';
      const line2 = !dest ? 'Toca un número para marcar adónde quieres ir.'
        : dest === h ? 'Ya estás en ' + P[dest][3] + '.'
        : next ? (blocked ? 'Paso cerrado por ahora: ' : 'Siguiente paso: ') + ((next.hotspot && next.hotspot.name) || P[next.to][3]) + ' → ' + P[dest][3]
        : 'Sin camino conocido hacia ' + P[dest][3] + '.';
      mtxt(ctx, line1, 60, 816, 24, '#ffe9a8', 'left', true);
      mtxt(ctx, line2, 60, 848, 21, '#f4e5c8', 'left', false);
      if (st.length) button(ctx, { x: 1040, y: 801, w: 250, h: 62, size: 26, label: 'Seguir ruta', primary: true, id: 'map-follow', onTap: () => J.close(G, U) });
      button(ctx, { x: 1310, y: 801, w: 240, h: 62, size: 26, label: 'Volver', primary: !st.length, id: 'map-close', onTap: () => J.close(G, U) });
    };
  }

  // =====================================================================================================
  // 7 · INSTALACIÓN
  RC.install = G => {
    RC.G = G;
    // ritmo un poco más ágil para el viajero en lugares de 2600–4000 px
    if (E.DATA.characters.player.speed < 225) E.DATA.characters.player.speed = 225;
    for (const k in MORE_GENERIC) if (E.DATA.generic[k]) E.DATA.generic[k].push(...MORE_GENERIC[k]);
    installCamera(G);
    installMap(G);
    const di = G.input.drain;
    G.input.drain = () => { const evs = di(); if (evs.length) lastInput = performance.now() / 1000; return evs; };
    const play0 = E.audio.play;
    E.audio.play = name => {
      play0(name);
      if (!G.player) return;
      if (name === 'nope') { RC.emote(G.player, '?', 1.3); RC.wobble(G.player); }
      else if (name === 'pick') { RC.hop(G.player); sparkle = { a: G.player, t: 0 }; }
      else if (name === 'success') { RC.hop(G.player); RC.emote(G.player, '♪', 1.6); }
      else if (name === 'wheel') cam.shake(7, 0.7);
    };
    // personajes: saltito / meneo + luz
    const draw0 = G.drawActor;
    G.drawActor = (ctx, a, S) => {
      let hop = 0, wob = 0;
      if (a._hop) { a._hop += G.lastFrameDt || 0.016; const u = a._hop / 0.42; if (u >= 1) a._hop = 0; else hop = Math.sin(u * Math.PI) * 16 * S.depthScale(a.y); }
      if (a._wob) { a._wob += G.lastFrameDt || 0.016; const u = a._wob / 0.5; if (u >= 1) a._wob = 0; else wob = Math.sin(u * TAU * 2) * 0.06 * (1 - u); }
      const tr = hop || wob, px = a.x - S.camX;
      if (tr) { ctx.save(); ctx.translate(px, a.y - hop); ctx.rotate(wob); ctx.translate(-px, -a.y); }
      const L = RC.fxOn ? lightFor(S) : null;
      if (L && a.def.rig && RC.rigFx) rigLight(ctx, a, S, L, G.display.k);
      else { draw0(ctx, a, S); if (L && !a.def.rig && RC.spriteFx) spriteLight(ctx, a, S, L, G.display.k); }
      if (tr) ctx.restore();
    };
    // mundo: actualización de cámara/atmósfera/sonido + dibujo con cámara y gradación
    let lastS = null, lastDlg = false;
    const sceneDraw = E.scene.draw;
    E.scene.draw = (ctx, S, G2) => {
      const dt = G.paused || G.display.portrait ? 0 : Math.min(0.05, G.lastFrameDt || 0.016), now = performance.now() / 1000;
      if (S !== lastS && G.player && !G.transitioning) {
        lastS = S; atmosEnter(S); cameraEnter(S, G); bark.enter = now; em.length = 0; reveal = 0;
        wantedScene = S.def.id;
      }
      if (wantedScene && snd.scene !== wantedScene && snd.ready()) snd.start(wantedScene);
      if (G.runner.busy || G.dialogue.active || G.ui.notes.length) RC.lastBusy = now;
      if (dt) { guard(G.lastFrameDt, G); atmosUpdate(dt, G); cameraUpdate(dt, G); snd.tick(G); barksUpdate(G, now); }
      if (G.dialogue.active && !lastDlg) { const n = G.dialogueNpc(); if (n) RC.emote(n, '!', 1.1); }
      lastDlg = G.dialogue.active;
      const z = cam.z, zoom = z !== 1 || cam.sx || cam.sy;
      if (zoom) { ctx.save(); ctx.translate(cam.fx, cam.fy); ctx.scale(z, z); ctx.translate(-cam.fx + cam.sx, -cam.fy + cam.sy); }
      sceneDraw(ctx, S, G2);
      if (RC.fxOn && RC.atmFx) atmosWorld(ctx, G);
      if (zoom) ctx.restore();
      if (RC.fxOn && RC.atmFx) atmosScreen(ctx);
      if (cam.lb > 0.01) { const h = 34 * cam.lb; ctx.fillStyle = 'rgba(8,5,3,.92)'; ctx.fillRect(0, 0, C.W, h); ctx.fillRect(0, C.H - h, C.W, h); }
    };
    const ui0 = G.ui.draw;
    G.ui.draw = (ctx, S) => {
      if (S && !G.ui.overlay) { const dt = G.paused ? 0 : Math.min(0.05, G.lastFrameDt || 0.016); drawEmotes(ctx, S, dt); drawReveal(ctx, S, G, dt); }
      ui0(ctx, S);
    };
  };
})(window.E1248);
