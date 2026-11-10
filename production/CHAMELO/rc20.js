// CHAMELO RC20 · material nuevo y narrador. Se carga tras rc19.js.
//  · Jugador: marcha de perfil, «dar», agacharse a coger, mirar alrededor (hoja ampliada).
//  · Viejo soldado: hoja nueva con marcha.
//  · Yuçaf, Lope, Oropesa, pregonero y los dos Giles: los bucles dibujados de hablar/reposo sustituyen a la marioneta mientras
//    no andan (al andar se sigue usando la marioneta, que sí camina).
//  · Narrador: cartelas a pantalla completa («Esa misma noche…») y vidascalias (banda inferior) para orientar al espectador.
//  · Imágenes nuevas: Talavera 1248 (vista aérea), Talavera hoy, Sifones de noche, taberna de noche, calle del mercado (aldea).
//  · La aldea de los que llegan tarde: el chiste se cuenta con calendario, cartel y narración.
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, CH = D.characters;
  const R17 = E.rc17, TAU = Math.PI * 2, META = window.E1248_RC20_META || {};
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const note = text => ({ note: text });
  const cap = k => ({ rc17: 'cap:' + k });
  const H = (sc, id) => (S[sc].hotspots || []).find(h => h.id === id);
  const R20 = E.rc20 = { cap: null, revert: null, idleT: 0, idleNext: 7 };

  // ---------------------------------------------------------------- imágenes incrustadas (carga perezosa)
  const imgs = {};
  function img(name) {
    if (imgs[name]) return imgs[name];
    const src = (window.E1248_EMBED || {})['assets/rc20/' + name + '.webp']; if (!src) return null;
    const im = new Image(); im.src = src; imgs[name] = im; return im;
  }
  const ready = im => !!(im && im.complete && im.naturalWidth > 0);
  const FPS = { yucaf: { idle: 4.5, talk: 5.9 }, lope: { idle: 4.5, talk: 5.9, talk2: 6.7 }, gil_a: { talk: 5.5 }, gil_b: { talk: 5.5 },
    oropesa: { talk: 3, talk2: 3, talk3: 3, talk4: 3 }, pregonero: { talk: 3.3 }, req_fila: { talk: 4.5 }, req_fila2: { talk: 4.5 }, req_corro: { talk: 4.5 } };
  // dibuja un fotograma de una hoja nueva: (x, pies y) en pantalla, vis = altura visible en px de pantalla
  function drawSheet(ctx, id, anim, t, x, footY, vis, flip) {
    const m = META.npc && META.npc[id], im = img(id); if (!m || !ready(im)) return;
    const n = m.counts[anim] || 1, fps = (FPS[id] && FPS[id][anim]) || 5, fi = n > 1 ? Math.floor(t * fps) % n : 0;
    const row = m.rows[anim] + Math.floor(fi / m.cols), col = fi % m.cols, s = vis / m.figPx;
    ctx.save(); ctx.translate(x, footY); if (flip) ctx.scale(-1, 1);
    ctx.drawImage(im, col * m.frameW, row * m.frameH, m.frameW, m.frameH, -m.anchor[0] * s, -m.anchor[1] * s, m.frameW * s, m.frameH * s);
    ctx.restore();
  }

  // ---------------------------------------------------------------- 1 · JUGADOR
  { const P = CH.player.sprite.sheet, pm = META.player;
    if (pm) Object.assign(P.anims, {
      walk_left: { row: pm.rows.walk, frames: pm.counts.walk, fps: 24, stride: pm.stride },
      give_left: { row: pm.rows.give, frames: pm.counts.give, fps: 16 },
      pick_left: { row: pm.rows.pick, frames: pm.counts.pick, fps: 14 },
      look_left: { row: pm.rows.look, frames: pm.counts.look, fps: 7 } }); }

  // ---------------------------------------------------------------- 2 · VIEJO SOLDADO (hoja nueva con marcha)
  { const m = META.npc && META.npc.soldado;
    if (m) {
      CH.soldado.sprite.sheet = { frameW: m.frameW, frameH: m.frameH, cols: m.cols, anchor: m.anchor, baseFacing: 'right', anims: {
        walk_right: { row: m.rows.walk, frames: m.counts.walk, fps: 12, stride: 120 },
        idle_right: { row: m.rows.idle, frames: m.counts.idle, fps: 6 },
        talk_right: { row: m.rows.talk, frames: m.counts.talk, fps: 6 } } };
      CH.soldado.height = Math.round(292 * m.frameH / m.figPx);
    } }

  // ---------------------------------------------------------------- 3 · LOS DOS GILES (dos figuras distintas, el segundo más bajo)
  if (CH.guardia && !CH.gil_b) CH.gil_b = Object.assign({}, CH.guardia, { height: Math.round(CH.guardia.height * 0.797) });
  for (const id of ['gil_b', 'gil_alfar_b']) if (N[id]) N[id].character = 'gil_b';
  // personaje→hoja de bucles; altura visible objetivo a escala 1 (el viajero mide 309)
  const HY = {
    yucaf: ['yucaf', 270], yucaf_alfar: ['yucaf', 270], yucaf_aud: ['yucaf', 270], lope: ['lope', 283], pregonero: ['pregonero', 275], pregonero_vista: ['pregonero', 275],
    oropesa: ['oropesa', 272], gil_a: ['gil_a', 272], gil_alfar_a: ['gil_a', 272], gil_b: ['gil_b', 217], gil_alfar_b: ['gil_b', 217] };
  const rig0 = E.rig.draw;
  E.rig.draw = (ctx, a, scale, camX) => {
    const hy = HY[a.id], m = hy && META.npc && META.npc[hy[0]];
    if (!m || !a.visible || (a.anim === 'walk' && a.moving)) return rig0(ctx, a, scale, camX);
    const im = img(hy[0]); if (!ready(im)) return rig0(ctx, a, scale, camX);
    const px = a.x - camX, vis = hy[1] * scale, s = vis / m.figPx;
    const talk = !!a.talking, vars = Object.keys(m.rows).filter(k => k.startsWith('talk'));
    if (talk && !a._v20t) a._v20 = ((a._v20 === undefined ? -1 : a._v20) + 1) % Math.max(1, vars.length);
    a._v20t = talk;
    const anim = talk && vars.length ? vars[a._v20 || 0] : (m.rows.idle !== undefined ? 'idle' : 'talk');
    if (a._k20 !== anim) { a._k20 = anim; a._t20 = a.animT; }
    const lr = (a.facing === 'left' || a.facing === 'right') ? a.facing : a.lastH, flip = lr !== m.base;
    if (!a._noShadow) { const sh = E.assets.get('fx_shadow'), w = Math.max(90 * scale, m.figW * s * 0.7); if (sh) ctx.drawImage(sh, px - w / 2, a.y - 10 * scale, w, 20 * scale); }
    const n = m.counts[anim] || 1, fps = (FPS[hy[0]] && FPS[hy[0]][anim]) || 5, fi = n > 1 ? Math.floor((a.animT - a._t20) * fps) % n : 0;
    const row = m.rows[anim] + Math.floor(fi / m.cols), col = fi % m.cols, br = n === 1 ? 1 + 0.006 * Math.sin(a.animT * 1.9) : 1;
    ctx.save(); ctx.translate(px, a.y); ctx.scale(flip ? -1 : 1, br);
    ctx.drawImage(im, col * m.frameW, row * m.frameH, m.frameW, m.frameH, -m.anchor[0] * s, -m.anchor[1] * s, m.frameW * s, m.frameH * s);
    ctx.restore();
  };

  // ---------------------------------------------------------------- 4 · NARRADOR: cartelas y vidascalias
  const CAPS = {
    llegada: { bg: 'muralla_aerea', kicker: 'Talavera de la Reina · 1248', text: 'Murallas, un puente de piedra y campanas. A esta ciudad ha ido a parar el forastero.', dur: 6 },
    tarde: { bg: 'taberna_noche', kicker: 'Esa misma noche', text: 'Cae la noche sobre Talavera. En la Taberna del Miedo, el forastero se acuesta rendido.', dur: 5.5 },
    soto: { bg: 'sifones_noche', kicker: 'Mientras tanto, en el Soto de los Sifones…', text: 'Cuatro hombres, una antorcha y un mapa. Llevan toda la noche discutiendo por dónde atacar Talavera.', dur: 7, sprite: { id: 'req_fila', anim: 'talk', x: 0.5, foot: 0.69, h: 0.4 } },
    isla: { bg: null, kicker: 'Una hora después · Isla del Chamelo', text: 'El mapa, roto en cuatro. Los conspiradores, en retirada. Y el forastero, corriendo a pedirle cuentas a Rai.', dur: 6 },
    amanecer: { bg: 'muralla_aerea', kicker: 'Al amanecer · Talavera de la Reina', text: 'La noche ha sido larga. Y Talavera se despierta con una noticia que corre de boca en boca.', dur: 6 },
    hoy: { bg: 'talavera_hoy', kicker: 'Talavera de la Reina · hoy', text: 'Casi ocho siglos después, el Tajo sigue pasando por Talavera. Ahora, bajo un puente atirantado.', dur: 6.5 },
    // vidascalias: banda inferior sobre la propia escena
    despierta: { band: true, kicker: 'Antes del amanecer', text: 'Un golpe en la puerta del cuarto despierta al forastero. Es Rai, y trae prisa.' },
    rai2: { band: true, kicker: 'La noche del hechizo', text: 'Hace unos días, Rai quiso mirar el futuro en su caldero. Una cosa sencilla, según él.' },
    rai3: { band: true, kicker: 'Y entonces…', text: 'El caldero se desbocó. Salió humo de colores, un destello… y el forastero apareció en 1248.' },
    rai4: { band: true, kicker: 'Cómo volver', text: 'El hechizo se abrió una noche de eclipse. Solo otro eclipse, y la campana de Santa María, pueden volver a abrirlo.' },
    oropesa: { band: true, kicker: 'En la Taberna del Miedo', text: 'Al fondo, atada a una silla, la señora de Oropesa. Cuatro hombres la vigilan desde anoche.' },
    plaza: { band: true, kicker: 'Plaza del Pan', text: 'El pregonero lleva un buen rato gritando en mitad de la plaza. Algo ha pasado esta noche.' }
  };
  const ALD_BEATS = [0, 5.2, 10.4, 15.8], ALD_END = 22;
  const ALD_TXT = ['Al otro lado del camino hay una aldea donde todo se hace… mañana.',
    'Mañana abren el horno. Mañana arreglan el puente. Mañana empieza el ataque.',
    'Pero cuando llega el mañana… ya es hoy. Y hoy, claro, todavía no toca.',
    'Así que los cuatro conspiradores siguen allí, preparando el ataque para mañana. «Mañana fue ayer», dicen. Desde hace siglos.'];
  function startCap(key) {
    if (key === 'aldea') { R20.cap = { key, mode: 'aldea', t: 0, closing: 0, def: { dur: ALD_END } }; }
    else { const def = CAPS[key]; if (!def) return; R20.cap = { key, mode: def.band ? 'band' : 'card', t: 0, closing: 0, def: Object.assign({ dur: def.dur || Math.max(3.6, 1.8 + def.text.length / 15) }, def) }; }
    return () => !R20.cap;
  }
  const act0 = R17.act;
  R17.act = (name, G) => {
    if (typeof name === 'string' && name.startsWith('cap:')) return startCap(name.slice(4));
    if (name === 'aldea') return startCap('aldea');
    return act0(name, G);
  };
  function wrap(ctx, text, maxW) {
    const out = []; let line = '';
    for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out;
  }
  function cover(ctx, im, W, Hh, zoom, pan) {
    const r = Math.max(W / im.naturalWidth, Hh / im.naturalHeight) * zoom, w = im.naturalWidth * r, h = im.naturalHeight * r;
    ctx.drawImage(im, (W - w) * (0.5 + pan), (Hh - h) * 0.5, w, h);
  }
  // panel de pergamino con pestaña roja (como las viñetas del juego)
  function panel(ctx, C, kicker, text, a, bottom) {
    ctx.save(); ctx.globalAlpha = a; ctx.font = 'italic 38px Georgia, serif';
    const maxW = 1180, lines = wrap(ctx, text, maxW), lh = 50, pw = Math.min(C.W - 120, Math.max(...lines.map(l => ctx.measureText(l).width)) + 120), ph = lines.length * lh + 64;
    const x = (C.W - pw) / 2, y = bottom - ph, rise = (1 - a) * 14;
    ctx.translate(0, rise);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + 8, y + 10, pw, ph);
    ctx.fillStyle = '#efe0bb'; ctx.fillRect(x, y, pw, ph); ctx.strokeStyle = '#3b2417'; ctx.lineWidth = 4; ctx.strokeRect(x, y, pw, ph);
    ctx.lineWidth = 1.5; ctx.strokeRect(x + 8, y + 8, pw - 16, ph - 16);
    ctx.fillStyle = '#2a1a0c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, C.W / 2, y + 32 + lh / 2 + i * lh - 4));
    if (kicker) {
      ctx.font = 'italic bold 25px Georgia, serif'; const kw = ctx.measureText(kicker).width + 44;
      ctx.fillStyle = '#c73a2c'; ctx.fillRect(x + 28, y - 22, kw, 42); ctx.strokeStyle = '#3b2417'; ctx.lineWidth = 3; ctx.strokeRect(x + 28, y - 22, kw, 42);
      ctx.fillStyle = '#fff6dc'; ctx.textAlign = 'left'; ctx.fillText(kicker, x + 50, y - 1);
    }
    ctx.restore();
  }
  function hint(ctx, C, t) {
    if (t < 1.1) return; ctx.save(); ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 5); ctx.fillStyle = '#ffd36b'; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 4;
    const x = C.W - 70, y = C.H - 60; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 22, y); ctx.lineTo(x, y + 14); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
  }
  function bubble(ctx, text, x, y, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.font = 'bold 30px Georgia, serif'; const w = ctx.measureText(text).width + 40, h = 56;
    ctx.fillStyle = '#fffaf0'; ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, 14); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 10, y - 1); ctx.lineTo(x, y + 20); ctx.lineTo(x + 12, y - 1); ctx.closePath(); ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a1a0c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y - h / 2 + 2); ctx.restore();
  }
  function drawAldea(ctx, C, c) {
    const t = c.t, bi = ALD_BEATS.reduce((r, b, i) => t >= b ? i : r, 0), bt = t - ALD_BEATS[bi];
    ctx.fillStyle = '#120d08'; ctx.fillRect(0, 0, C.W, C.H);
    const bg = img('calle_mercado'); if (ready(bg)) cover(ctx, bg, C.W, C.H, 1.03 + t * 0.002, 0); ctx.fillStyle = 'rgba(30,18,6,.12)'; ctx.fillRect(0, 0, C.W, C.H);
    // título
    const ta = Math.min(1, t / 0.6); ctx.save(); ctx.globalAlpha = ta; ctx.font = 'italic bold 36px Georgia, serif';
    const title = 'La aldea de los que siempre llegan tarde', tw = ctx.measureText(title).width + 70;
    ctx.fillStyle = '#c73a2c'; ctx.fillRect(C.W / 2 - tw / 2, 34, tw, 64); ctx.strokeStyle = '#3b2417'; ctx.lineWidth = 4; ctx.strokeRect(C.W / 2 - tw / 2, 34, tw, 64);
    ctx.fillStyle = '#fff6dc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, C.W / 2, 68); ctx.restore();
    // cartel de madera: CERRADO · ABRIMOS MAÑANA (cuelga a la izquierda, siempre)
    const sa = Math.min(1, Math.max(0, (t - 0.5) / 0.6)), sx = 250, sy = 255 + Math.sin(t * 1.3) * 2;
    ctx.save(); ctx.globalAlpha = sa; ctx.strokeStyle = '#3a2412'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx - 120, sy - 60); ctx.lineTo(sx - 120, sy); ctx.moveTo(sx + 120, sy - 60); ctx.lineTo(sx + 120, sy); ctx.stroke();
    ctx.fillStyle = '#8a5a30'; ctx.fillRect(sx - 170, sy, 340, 128); ctx.strokeRect(sx - 170, sy, 340, 128);
    ctx.fillStyle = '#f1dfb0'; ctx.font = 'bold 40px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CERRADO', sx, sy + 38);
    ctx.font = 'italic bold 30px Georgia, serif'; ctx.fillText('abrimos mañana', sx, sy + 88); ctx.restore();
    // calendario de pared (a la derecha): cada hoja que cae dice «mañana»
    const cx = 1330, cy = 230, days = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    const di = bi < 1 ? 0 : Math.floor((t - ALD_BEATS[1]) * (bi >= 2 ? 1.5 : 0.35)) % 7, ca = Math.min(1, Math.max(0, (t - ALD_BEATS[1] + 0.2) / 0.5));
    if (bi >= 1 && ca > 0) {
      ctx.save(); ctx.globalAlpha = ca; ctx.translate(cx, cy);
      ctx.fillStyle = '#fffaf0'; ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 4; ctx.fillRect(-120, -30, 240, 300); ctx.strokeRect(-120, -30, 240, 300);
      ctx.fillStyle = '#c73a2c'; ctx.fillRect(-120, -30, 240, 64); ctx.strokeRect(-120, -30, 240, 64);
      ctx.fillStyle = '#fff6dc'; ctx.font = 'bold 40px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(days[di], 0, 4);
      const flip = (t * 1.5) % 1; if (bi >= 2 && flip < 0.18) { ctx.save(); ctx.translate(0, 34); ctx.scale(1, 1 - flip / 0.18); ctx.fillStyle = '#e9ddc0'; ctx.fillRect(-120, 0, 240, 236); ctx.restore(); }
      ctx.fillStyle = '#2a1a0c'; ctx.font = 'bold 36px Georgia, serif'; ctx.fillText('HOY', 0, 100);
      ctx.save(); ctx.translate(0, 190); ctx.rotate(-0.12); ctx.strokeStyle = '#c73a2c'; ctx.lineWidth = 6; ctx.strokeRect(-92, -34, 184, 68);
      ctx.fillStyle = '#c73a2c'; ctx.font = 'italic bold 38px Georgia, serif'; ctx.fillText('¡MAÑANA!', 0, 3); ctx.restore(); ctx.restore();
    }
    // los cuatro conspiradores en corro (entran en el compás 2)
    const ga = Math.min(1, Math.max(0, (t - ALD_BEATS[1]) / 0.8));
    if (ga > 0) { ctx.save(); ctx.globalAlpha = ga; drawSheet(ctx, 'req_corro', 'talk', t, C.W * 0.5, C.H * 0.84 - 40 * (1 - ga), C.H * 0.44, false); ctx.restore(); }
    if (bi === 1 && bt > 0.9) bubble(ctx, '¡Mañana tomamos Talavera!', C.W * 0.5 - 150, C.H * 0.84 - C.H * 0.44 - 8, Math.min(1, (bt - 0.9) * 3));
    if (bi === 2) bubble(ctx, ['¡Hoy no, mañana!', '¡Mañana sin falta!', '¡Hoy toca descansar!'][Math.floor(t * 0.9) % 3], C.W * 0.5 - 150, C.H * 0.84 - C.H * 0.44 - 8, 1);
    if (bi >= 3) bubble(ctx, '«Mañana fue ayer»', C.W * 0.5 - 150, C.H * 0.84 - C.H * 0.44 - 8, Math.min(1, bt * 3));
    panel(ctx, C, null, ALD_TXT[bi], Math.min(1, bt * 3.5), C.H - 36);
    hint(ctx, C, bt);
  }
  function capDraw(ctx, dt) {
    const c = R20.cap; if (!c) return; const C = E.CONFIG; c.t += dt;
    if (c.t > c.def.dur && !c.closing) c.closing = 0.001;
    if (c.closing) { c.closing += dt; if (c.closing > 0.5) { R20.cap = null; return; } }
    const out = c.closing ? Math.max(0, 1 - c.closing / 0.5) : 1;
    if (c.mode === 'aldea') { ctx.save(); ctx.globalAlpha = Math.min(1, c.t / 0.6) * out; drawAldea(ctx, C, c); ctx.restore(); return; }
    const a = Math.min(1, c.t / 0.55) * out, d = c.def;
    if (c.mode === 'band') { panel(ctx, C, d.kicker, d.text, Math.min(1, c.t / 0.4) * out, C.H - 70); hint(ctx, C, c.t); return; }
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#0b0805'; ctx.fillRect(0, 0, C.W, C.H);
    const bg = d.bg && img(d.bg);
    if (ready(bg)) { cover(ctx, bg, C.W, C.H, 1 + c.t * 0.006, -0.04 + c.t * 0.004);
      const g = ctx.createLinearGradient(0, 0, 0, C.H); g.addColorStop(0, 'rgba(8,5,2,.35)'); g.addColorStop(0.45, 'rgba(8,5,2,0)'); g.addColorStop(1, 'rgba(8,5,2,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, C.W, C.H); }
    else { ctx.strokeStyle = 'rgba(233,165,35,.55)'; ctx.lineWidth = 3; ctx.strokeRect(46, 46, C.W - 92, C.H - 92); ctx.strokeRect(58, 58, C.W - 116, C.H - 116); }
    if (d.sprite) { const sp = d.sprite; drawSheet(ctx, sp.id, sp.anim, c.t, C.W * sp.x, C.H * sp.foot, C.H * sp.h, false); }
    panel(ctx, C, d.kicker, d.text, Math.min(1, Math.max(0, (c.t - 0.45) / 0.5)), C.H - 54);
    hint(ctx, C, c.t); ctx.restore();
  }
  // gestos: sonido sutil de pasar página no (silencio, solo texto); los toques saltan
  function capAdvance() {
    const c = R20.cap; if (!c) return false;
    if (c.mode === 'aldea') {
      const bi = ALD_BEATS.reduce((r, b, i) => c.t >= b ? i : r, 0);
      if (c.t - ALD_BEATS[bi] > 0.9 && !c.closing) { if (bi < ALD_BEATS.length - 1) c.t = ALD_BEATS[bi + 1]; else c.closing = 0.001; }
      return true;
    }
    if (c.t > 1.0 && !c.closing) c.closing = 0.001;
    return true;
  }

  // ---------------------------------------------------------------- 5 · GUION: transiciones y narrador
  const PL = S.plaza, TB = S.taberna, CHM = S.chamelo, OR = S.orilla, RB = S.ribera;
  // 5a · llegada a Talavera
  PL.firstEnter.unshift(cap('llegada'));
  // 5b · noche en la taberna: cartela al irse a dormir, vidascalia al despertar, cartela del soto al salir
  { const b0 = TB.onEnter[0], th = b0.then;
    let i = th.findIndex(x => x.rc17 === 'fadeout'); if (i >= 0) th.splice(i + 1, 0, cap('tarde'));
    i = th.findIndex(x => x.note && /Un golpe en la puerta/.test(x.note)); if (i >= 0) th.splice(i, 1, cap('despierta'));
    i = th.length - 2; if (th[i] && th[i].rc17 === 'fadeout') th.splice(i + 1, 0, cap('soto')); }
  // 5c · el gato: tras la retirada, cartela hacia la isla
  { const g = N.gato.verbs.talk[0].else, i = g.findIndex(x => x.rc17 === 'fadeout'); if (i >= 0) g.splice(i + 1, 0, cap('isla')); }
  // 5d · la explicación de Rai, en compases, con narrador y los clips del hechizo
  { const f = CHM.onEnter[1];
    f.then = [{ wait: 0.5 },
      say('¿Me he perdido algo?', 'leonor'),
      note('(Rai tiene la túnica llena de pelos negros. Muchos.)'),
      say('Rai. ¿Qué me pasó? ¿Por qué estoy aquí?'),
      say('Siéntate. Te lo cuento… pero no te rías.', 'leonor'),
      cap('rai2'),
      { vineta: ['rai_hechizo', 'Rai, mago de la isla'] },
      say('Pretendía mirar el futuro. Una cosa sencilla.', 'leonor'),
      cap('rai3'),
      { vineta: ['rai_humo', 'El caldero se desbocó'] },
      say('¿Y me trajiste aquí?'),
      say('La magia nunca fue una ciencia exacta.', 'leonor'),
      cap('rai4'),
      say('Te devuelvo la noche del eclipse, el 7 de junio.', 'leonor'),
      say('Con la Luna roja, la campana de Talavera abre la puerta.', 'leonor'),
      say('Tú encuentra a quien la arregle. Yo me encargo de que Talavera aguante hasta entonces.', 'leonor'),
      { set: 'confesion' }, { rc17: 'fadeout' }, { rc17: 'day' },
      cap('amanecer'),
      { npcPlace: ['sancha', 'plaza', 470, 790, 'right'] },
      { goto: ['plaza', 'from_puerta'] }]; }
  // 5e · la noticia del secuestro: se ve venir (la gente, el pregonero) en vez de caer de golpe
  { const f = PL.onEnter[0];
    f.then = [{ wait: 0.5 }, cap('plaza'), { set: 'oropesa_secuestrada' },
      say('¡Silencio, que pregono! ¡Han secuestrado a la señora de Oropesa!', 'pregonero'),
      say('¡Piden su peso en oro!', 'pregonero'),
      say('Anoche vi a cuatro subirla a los cuartos de la Taberna del Miedo.', 'sancha'),
      { npcWalk: ['sancha', 80, 790] },
      { npcPlace: ['sancha', 'taberna', 2300, 805, 'left'] }, { set: 'sancha_oculta' },
      { rc17: 'cuadrillaTaberna' },
      note('OBJETIVO: rescatar a la señora de Oropesa.')]; }
  // 5f · la señora, atada: se presenta la escena antes de que hable
  { const p = TB.onEnter[1]; if (p && p.then) { const i = p.then.findIndex(x => x.say && /Soltadme/.test(x.say)); if (i >= 0) p.then.splice(i, 0, cap('oropesa')); } }
  // 5g · epílogo: «Talavera, hoy» con la imagen del puente actual
  { const f = RB.onEnter.find(x => x.if && x.if.all && x.if.all.includes('presente')); if (f) { const i = f.then.findIndex(x => x.note === 'Talavera, hoy.'); if (i >= 0) f.then.splice(i, 1, cap('hoy')); } }

  // ---------------------------------------------------------------- 6 · TABERNA DE NOCHE (imagen nueva de César)
  { const bg = TB.layers.find(l => l.id === 'bg');
    if (bg && !TB.layers.some(l => l.id === 'bg_noche')) {
      bg.visibleWhen = '!noche';
      TB.layers.splice(TB.layers.indexOf(bg) + 1, 0, { id: 'bg_noche', z: 'back', x: 0, y: 0, w: 2700, h: 900, src: 'assets/rc20/taberna_noche.webp', visibleWhen: 'noche' }); } }

  // ---------------------------------------------------------------- 7 · INSTALACIÓN: anims del jugador, cartelas, toques
  const inst0 = E.rc07 && E.rc07.install;
  if (inst0) E.rc07.install = G => {
    inst0(G);
    const playOnce = (name, dur) => { const p = G.player; if (!p || p.moving || p.talking || G.transitioning || !G.S) return; p.anim = name; R20.revert = { anim: name, t: dur }; R20.idleT = 0; };
    const inv = G.inventory;
    if (inv && inv.add) { const add0 = inv.add; inv.add = function () { const r = add0.apply(inv, arguments); if (arguments[0] !== 'mingo') playOnce('pick', 1.86); return r; }; }
    if (inv && inv.remove) { const rem0 = inv.remove; inv.remove = function () { const r = rem0.apply(inv, arguments); if (arguments[0] !== 'mingo') playOnce('give', 1.45); return r; }; }
    const draw0 = E.scene.draw;
    E.scene.draw = (ctx, Sc, G2) => {
      draw0(ctx, Sc, G2);
      const p = G.player, dt = G.paused ? 0 : Math.min(0.05, G.lastFrameDt || 0.016); if (!p) return;
      if (R20.revert) { R20.revert.t -= dt; if (R20.revert.t <= 0) { if (p.anim === R20.revert.anim) p.anim = 'idle'; R20.revert = null; } }
      // mirar alrededor cuando lleva rato quieto (nunca durante diálogos, guiones, cartelas ni notas)
      const busy = p.moving || p.talking || p.anim !== 'idle' || G.dialogue.active || G.runner.busy || G.ui.notes.length || G.transitioning || R20.cap || G.ui.overlay;
      if (busy) R20.idleT = 0; else { R20.idleT += dt; if (R20.idleT > R20.idleNext) { R20.idleT = 0; R20.idleNext = 6 + Math.random() * 5; p.anim = 'look'; R20.revert = { anim: 'look', t: 3.7 }; } }
    };
    const ui0 = G.ui.draw;
    G.ui.draw = (ctx, Sc) => { ui0(ctx, Sc); if (R20.cap) capDraw(ctx, G.paused ? 0 : Math.min(0.05, G.lastFrameDt || 0.016)); };
    const adv0 = G.ui.advance;
    G.ui.advance = () => { if (R20.cap) return capAdvance(); return adv0(); };
  };
  // pruebas: acceso a las cartelas
  R20.caps = CAPS; R20.start = startCap;
})(window.E1248 = window.E1248 || {});
