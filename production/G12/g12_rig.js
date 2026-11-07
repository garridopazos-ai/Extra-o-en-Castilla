// G12 · Marionetas articuladas dibujadas en vivo (sin hojas de sprites).
// Cada personaje se describe con un «look» (complexión, ropa, pelo, sombrero, cara...) y se anima por huesos:
// marcha con pies plantados (cinemática inversa: el pie apoyado no patina), respiración, parpadeo, habla con boca y gesto,
// escucha con cabeceo y «trabajos» (martillo, bastón, malabares, pregón...). Coste: ~30 trazados por personaje y fotograma.
// Unidades del esqueleto: 300 = altura del personaje; se escala a def.height × profundidad.
(function (E) {
  'use strict';
  const TAU = Math.PI * 2;
  const BUILDS = {
    adult: { leg: 146, torso: 88, neck: 7, head: 30, sh: 24, hip: 20, belly: 0, lean: 0.03, arm: 102 },
    thin: { leg: 152, torso: 90, neck: 9, head: 28, sh: 20, hip: 17, belly: 0, lean: 0.02, arm: 108 },
    fat: { leg: 134, torso: 96, neck: 4, head: 31, sh: 28, hip: 27, belly: 20, lean: -0.03, arm: 98 },
    old: { leg: 138, torso: 88, neck: 6, head: 30, sh: 22, hip: 20, belly: 5, lean: 0.14, arm: 100 },
    child: { leg: 116, torso: 74, neck: 6, head: 40, sh: 19, hip: 15, belly: 2, lean: 0.01, arm: 86 },
    woman: { leg: 142, torso: 88, neck: 9, head: 29, sh: 21, hip: 24, belly: 4, lean: 0.01, arm: 98 }
  };
  const cache = new Map();
  function shade(hex, k) {
    const key = hex + k; let v = cache.get(key); if (v) return v;
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (k <= 1) { r *= k; g *= k; b *= k; } else { const t = k - 1; r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t; }
    v = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')'; cache.set(key, v); return v;
  }
  const smooth = u => u * u * (3 - 2 * u);
  function noise(t, s) { return Math.sin(t * 1.7 + s) * 0.5 + Math.sin(t * 3.1 + s * 2.3) * 0.3 + Math.sin(t * 5.3 + s * 0.7) * 0.2; }

  // proporciones normalizadas a 300 de altura
  function bodyOf(look) {
    if (look._b) return look._b;
    const B = { ...BUILDS[look.build || 'adult'] };
    const tot = B.leg + B.torso + B.neck + B.head * 2;
    const k = 300 / tot;
    for (const key of ['leg', 'torso', 'neck', 'head', 'sh', 'hip', 'belly', 'arm']) B[key] *= k;
    B.D = B.leg * 0.98;          // distancia de suelo por ciclo completo de marcha (dos pasos)
    look._b = B; return B;
  }

  // ---------- trazos ----------
  function blob(ctx, col, ol, w) {
    ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = w || 2.6; ctx.strokeStyle = ol; ctx.stroke();
  }
  // miembro: cápsula de grosor variable entre dos puntos
  function limb(ctx, x1, y1, x2, y2, w1, w2, col, back) {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    ctx.beginPath();
    ctx.moveTo(x1 + nx * w1, y1 + ny * w1);
    ctx.lineTo(x2 + nx * w2, y2 + ny * w2);
    ctx.arc(x2, y2, w2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
    ctx.lineTo(x1 - nx * w1, y1 - ny * w1);
    ctx.arc(x1, y1, w1, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true);
    ctx.closePath();
    const c = back ? shade(col, 0.78) : col;
    blob(ctx, c, shade(col, 0.42), 2.4);
  }
  function ik(hx, hy, fx, fy, a, b, forward) {
    let dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy);
    const max = a + b - 0.5; if (d > max) { const s = max / d; dx *= s; dy *= s; d = max; }
    const th = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    const ang = forward ? th - al : th + al;
    return [hx + Math.cos(ang) * a, hy + Math.sin(ang) * a, hx + dx, hy + dy];
  }

  // ---------- pose ----------
  // Devuelve posiciones de pies, cadera, hombros, manos y cabeza (y hacia abajo, origen en el suelo bajo la cadera).
  function pose(a, look, B, phase, mode, t) {
    const L = B.leg * 0.985, D = B.D, ST = 0.6;
    const P = { mode };
    const foot = q => {
      q = ((q % 1) + 1) % 1;
      if (q < ST) return [D * 0.3 - (q / ST) * D * 0.6, 0];
      const u = (q - ST) / (1 - ST);
      return [-D * 0.3 + smooth(u) * D * 0.6, -Math.sin(Math.PI * u) * B.leg * 0.15];
    };
    let fA, fB, hipH, sway = 0;
    if (mode === 'walk') {
      fA = foot(phase); fB = foot(phase + 0.5);
      const reach = f => f[1] === 0 ? Math.sqrt(Math.max(1, L * L - f[0] * f[0])) : 1e9;
      hipH = Math.min(reach(fA), reach(fB));
      if (hipH > 1e8) hipH = L * 0.97;
      hipH += 9;   // compensa tobillo (7) y encaje de cadera (4): pierna de apoyo casi recta
    } else {
      const w = noise(t * 0.35, look.seed || 1) * 2.2;
      sway = w;
      fA = [9 - w * 0.2, 0]; fB = [-9 - w * 0.2, 0];
      hipH = Math.sqrt(L * L - 81) + 9.5 + Math.sin(t * 1.8) * 0.6;
    }
    const lean = B.lean + (mode === 'walk' ? 0.05 : 0);
    P.hip = [sway * 0.5, -hipH];
    P.fA = fA; P.fB = fB;
    // hombros: el tronco se inclina hacia delante con «lean»
    const ty = -hipH - B.torso, tx = P.hip[0] + Math.sin(lean) * B.torso;
    const breath = mode === 'walk' ? 0 : Math.sin(t * 1.9) * 1.2;
    P.sh = [tx, ty - breath];
    P.neck = [tx + 3, ty - breath - B.neck];
    P.head = [P.neck[0] + 4 + Math.sin(lean) * 6, P.neck[1] - B.head * 0.92];
    return P;
  }

  // ---------- partes ----------
  function drawLeg(ctx, look, B, hip, f, back) {
    const a = B.leg * 0.51, b = B.leg * 0.49;
    const hx = hip[0] + (back ? -B.hip * 0.35 : B.hip * 0.35), hy = hip[1] + 4;
    const [kx, ky, fx, fy] = ik(hx, hy, f[0], f[1] - 7, a, b, true);
    const legCol = look.legs || '#5a4632', w = B.hip * 0.5;
    limb(ctx, hx, hy, kx, ky, w, w * 0.8, legCol, back);
    limb(ctx, kx, ky, fx, fy, w * 0.8, w * 0.55, look.shins || legCol, back);
    // pie
    const shoe = look.shoes === 'bare' ? (look.skin || '#d9a07a') : (look.shoeCol || '#3a2a1c');
    ctx.beginPath();
    const fl = B.leg * (look.shoes === 'bare' ? 0.2 : 0.23), lift = f[1] < -1 ? 0.22 : 0;
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(lift);
    ctx.moveTo(-8, -5); ctx.quadraticCurveTo(-9, 7, 0, 7); ctx.lineTo(fl, 7); ctx.quadraticCurveTo(fl + 6, 2, fl - 4, -5); ctx.closePath();
    blob(ctx, back ? shade(shoe, 0.75) : shoe, shade(shoe, 0.4), 2.2);
    ctx.restore();
    return [kx, ky];
  }
  function drawArm(ctx, look, B, sh, phi, bend, back, holdUp) {
    const ua = B.arm * 0.52, fa = B.arm * 0.48;
    const sx = sh[0] + (back ? -B.sh * 0.35 : B.sh * 0.2), sy = sh[1] + 8;
    const ex = sx + Math.sin(phi) * ua, ey = sy + Math.cos(phi) * ua;
    const hx = ex + Math.sin(phi + bend) * fa, hy = ey + Math.cos(phi + bend) * fa;
    const sl = look.sleeve || look.top || '#7a5a3a', w = B.sh * 0.34;
    limb(ctx, sx, sy, ex, ey, w, w * 0.85, sl, back);
    limb(ctx, ex, ey, hx, hy, w * 0.85, w * 0.7, look.cuffs ? sl : (look.forearm || sl), back);
    ctx.beginPath(); ctx.arc(hx, hy + 2, w * 0.82, 0, TAU);
    const sk = look.skin || '#d9a07a';
    blob(ctx, back ? shade(sk, 0.8) : sk, shade(sk, 0.5), 2);
    return [hx, hy];
  }
  function drawTorso(ctx, look, B, P, kA, kB) {
    const top = look.top || '#7a5a3a', [hx, hy] = P.hip, [sx, sy] = P.sh;
    const bw = B.sh, belly = B.belly, hipW = B.hip;
    // falda de la túnica: del talle hasta las rodillas (sigue a las rodillas al andar)
    const len = look.tunicLen == null ? 0.45 : look.tunicLen;
    ctx.beginPath();
    ctx.moveTo(sx - bw * 0.85, sy + 6);
    ctx.quadraticCurveTo(sx - bw * 0.95, (sy + hy) / 2, hx - hipW * 1.05, hy + 2);
    if (len > 0) {
      const hemY = hy + B.leg * len, minK = Math.min(kA[0], kB[0], hx - hipW), maxK = Math.max(kA[0], kB[0], hx + hipW);
      ctx.lineTo(minK - 10 - len * 10, hemY);
      ctx.quadraticCurveTo((minK + maxK) / 2, hemY + 6, maxK + 12 + len * 10, hemY);
    }
    ctx.lineTo(hx + hipW * 1.05 + belly * 0.3, hy + 2);
    ctx.bezierCurveTo(hx + hipW + belly * 1.4, hy - 20, sx + bw * 0.9 + belly * 0.9, sy + B.torso * 0.45, sx + bw * 0.85, sy + 6);
    ctx.quadraticCurveTo(sx, sy - 6, sx - bw * 0.85, sy + 6);
    ctx.closePath();
    blob(ctx, top, shade(top, 0.42), 2.8);
    // sombra lateral (volumen)
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(40,20,10,.16)'; ctx.fillRect(sx - bw * 1.6, sy - 10, bw * 0.75, B.torso + B.leg);
    ctx.fillStyle = 'rgba(255,240,210,.12)'; ctx.fillRect(sx + bw * 0.2, sy, bw * 0.35, B.torso);
    if (look.patch) { ctx.fillStyle = look.patch; ctx.fillRect(hx + 2, hy - 30, 15, 13); ctx.strokeStyle = shade(look.patch, 0.5); ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.strokeRect(hx + 2, hy - 30, 15, 13); ctx.setLineDash([]); }
    if (look.apron) {
      ctx.beginPath(); ctx.moveTo(sx - bw * 0.1, sy + 22); ctx.lineTo(sx + bw * 0.85 + belly * 0.8, sy + 24); ctx.lineTo(hx + hipW + belly * 0.6 + 8, hy + B.leg * 0.45); ctx.lineTo(hx - 4, hy + B.leg * 0.45); ctx.closePath();
      blob(ctx, look.apron, shade(look.apron, 0.55), 2);
    }
    ctx.restore();
    if (look.belt) { ctx.strokeStyle = look.belt; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(hx - hipW * 1.05, hy - 6); ctx.lineTo(hx + hipW * 1.05 + belly * 0.5, hy - 4); ctx.stroke(); }
    if (look.cape) {
      ctx.beginPath(); ctx.moveTo(sx - bw * 0.7, sy - 2); ctx.quadraticCurveTo(sx - bw * 1.7, hy, sx - bw * 1.3, hy + B.leg * 0.55); ctx.lineTo(sx - bw * 0.4, hy + B.leg * 0.5); ctx.quadraticCurveTo(sx - bw * 0.5, sy + 30, sx + bw * 0.3, sy - 2); ctx.closePath();
      blob(ctx, shade(look.cape, 0.85), shade(look.cape, 0.4), 2.4);
    }
    if (look.collar) { ctx.beginPath(); ctx.ellipse(sx + 2, sy + 2, bw * 0.75, 8, 0, 0, TAU); blob(ctx, look.collar, shade(look.collar, 0.5), 2); }
  }

  function drawHead(ctx, look, B, P, st) {
    const r = B.head, [cx, cy] = P.head, skin = look.skin || '#d9a07a', ol = shade(skin, 0.45);
    ctx.save(); ctx.translate(cx, cy + r * 0.6); ctx.rotate(st.tilt || 0); ctx.translate(0, -r * 0.6);
    // pelo de detrás / capucha
    if (look.hat === 'hood' || look.hat === 'toca') {
      ctx.beginPath(); ctx.ellipse(-r * 0.15, -r * 0.05, r * 1.18, r * 1.2, 0, 0, TAU); blob(ctx, look.hatCol || '#6a5a40', shade(look.hatCol || '#6a5a40', 0.45), 2.6);
    } else if (look.hairStyle === 'long') {
      ctx.beginPath(); ctx.moveTo(-r * 0.9, -r * 0.3); ctx.quadraticCurveTo(-r * 1.25, r * 0.9, -r * 0.5, r * 1.3); ctx.lineTo(r * 0.1, r * 0.9); ctx.lineTo(0, -r); ctx.closePath(); blob(ctx, look.hair || '#3a2a20', shade(look.hair || '#3a2a20', 0.5), 2.2);
    }
    // oreja + cara
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, -r * 0.2);
    ctx.bezierCurveTo(-r * 0.95, -r * 1.15, r * 0.75, -r * 1.2, r * 0.88, -r * 0.25);   // cráneo
    ctx.quadraticCurveTo(r * 0.95, r * 0.25, r * 0.85, r * 0.45);                       // frente-mejilla
    ctx.quadraticCurveTo(r * 0.7, r * 0.98, r * 0.05, r * 0.95);                        // mandíbula
    ctx.quadraticCurveTo(-r * 0.75, r * 0.85, -r * 0.85, -r * 0.2);
    ctx.closePath();
    blob(ctx, skin, ol, 2.6);
    ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(70,30,20,.14)'; ctx.beginPath(); ctx.ellipse(-r * 0.75, r * 0.2, r * 0.55, r * 1.2, 0, 0, TAU); ctx.fill(); ctx.restore();
    if (look.cheeks) { ctx.fillStyle = 'rgba(220,90,80,.28)'; ctx.beginPath(); ctx.ellipse(r * 0.5, r * 0.32, r * 0.2, r * 0.13, 0, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(-r * 0.32, r * 0.05, r * 0.16, r * 0.22, 0, 0, TAU); blob(ctx, skin, ol, 2);    // oreja
    // barba
    if (look.beard) {
      const bc = look.beardCol || look.hair || '#3a2a20';
      ctx.beginPath();
      if (look.beard === 'full') { ctx.moveTo(-r * 0.25, r * 0.15); ctx.quadraticCurveTo(-r * 0.1, r * 1.45, r * 0.55, r * 1.12); ctx.quadraticCurveTo(r * 0.95, r * 0.75, r * 0.82, r * 0.42); ctx.quadraticCurveTo(r * 0.45, r * 0.55, r * 0.3, r * 0.35); ctx.closePath(); }
      else if (look.beard === 'goatee') { ctx.moveTo(r * 0.35, r * 0.62); ctx.quadraticCurveTo(r * 0.45, r * 1.35, r * 0.75, r * 0.85); ctx.closePath(); }
      else if (look.beard === 'stubble') { ctx.moveTo(-r * 0.2, r * 0.3); ctx.quadraticCurveTo(r * 0.1, r * 1.0, r * 0.8, r * 0.5); ctx.quadraticCurveTo(r * 0.3, r * 0.75, -r * 0.2, r * 0.3); }
      if (look.beard !== 'moustache') blob(ctx, look.beard === 'stubble' ? 'rgba(60,40,30,.35)' : bc, look.beard === 'stubble' ? 'rgba(0,0,0,0)' : shade(bc, 0.5), 2);
    }
    // nariz
    const nz = look.nose === 'big' ? 1.4 : look.nose === 'hook' ? 1.2 : look.nose === 'small' ? 0.8 : 1;
    ctx.beginPath(); ctx.moveTo(r * 0.82, -r * 0.08);
    if (look.nose === 'hook') ctx.bezierCurveTo(r * (0.95 + 0.4 * nz), -r * 0.12, r * (0.98 + 0.35 * nz), r * 0.32, r * 0.84, r * 0.3);
    else ctx.bezierCurveTo(r * (0.92 + 0.3 * nz), r * 0.0, r * (0.98 + 0.32 * nz), r * 0.34, r * 0.82, r * 0.32);
    blob(ctx, shade(skin, look.nose === 'big' ? 0.93 : 1), ol, 2.2);
    if (look.nose === 'big') { ctx.fillStyle = 'rgba(200,70,60,.3)'; ctx.beginPath(); ctx.arc(r * 1.12, r * 0.22, r * 0.14, 0, TAU); ctx.fill(); }
    // ojos
    const ey = -r * 0.12, ex = r * 0.48;
    if (look.eyes === 'blind') {
      ctx.strokeStyle = shade(skin, 0.35); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(ex - r * 0.16, ey); ctx.quadraticCurveTo(ex, ey + r * 0.08, ex + r * 0.16, ey); ctx.stroke();
    } else if (st.blink) {
      ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(ex - r * 0.15, ey + 2); ctx.lineTo(ex + r * 0.15, ey + 2); ctx.stroke();
    } else {
      const big = look.build === 'child' ? 1.25 : 1;
      ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.15 * big, r * 0.19 * big, 0, 0, TAU); blob(ctx, '#fbf6ea', '#2a1a10', 1.6);
      ctx.fillStyle = '#21140c'; ctx.beginPath(); ctx.arc(ex + r * 0.06 + (st.look || 0) * r * 0.05, ey + r * 0.02, r * 0.075 * big, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + r * 0.08, ey - r * 0.03, r * 0.025 * big, 0, TAU); ctx.fill();
    }
    // ceja (expresión)
    const mood = st.mood || look.mood || 'neutral';
    const browY = ey - r * 0.3 - (st.brow || 0) * r * 0.08, bc = look.browCol || look.hair || '#3a2a20';
    ctx.strokeStyle = bc; ctx.lineWidth = r * 0.09; ctx.lineCap = 'round';
    ctx.beginPath();
    if (mood === 'grumpy' || mood === 'sly') { ctx.moveTo(ex - r * 0.2, browY - r * 0.06); ctx.lineTo(ex + r * 0.2, browY + r * 0.06); }
    else if (mood === 'worried') { ctx.moveTo(ex - r * 0.2, browY + r * 0.05); ctx.lineTo(ex + r * 0.2, browY - r * 0.05); }
    else { ctx.moveTo(ex - r * 0.2, browY); ctx.quadraticCurveTo(ex, browY - r * 0.1, ex + r * 0.22, browY); }
    ctx.stroke();
    // boca
    const mx = r * 0.66, my = r * 0.55;
    if (st.mouth > 0.15) {
      ctx.beginPath(); ctx.ellipse(mx, my, r * 0.14, r * (0.05 + 0.16 * st.mouth), 0, 0, TAU); blob(ctx, '#5a1e18', '#2a0e0a', 1.5);
      if (look.build === 'child') { ctx.fillStyle = '#fff'; ctx.fillRect(mx - r * 0.1, my - r * 0.07, r * 0.07, r * 0.06); }
    } else {
      ctx.strokeStyle = shade(skin, 0.35); ctx.lineWidth = 2.4; ctx.beginPath();
      if (mood === 'grin' || mood === 'happy' || mood === 'sly') { ctx.moveTo(mx - r * 0.2, my - r * 0.05); ctx.quadraticCurveTo(mx, my + r * 0.14, mx + r * 0.2, my - r * 0.08); }
      else if (mood === 'grumpy') { ctx.moveTo(mx - r * 0.18, my + r * 0.04); ctx.quadraticCurveTo(mx, my - r * 0.06, mx + r * 0.18, my + r * 0.05); }
      else { ctx.moveTo(mx - r * 0.16, my); ctx.lineTo(mx + r * 0.16, my + r * 0.02); }
      ctx.stroke();
      if (mood === 'grin') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(mx - r * 0.12, my); ctx.lineTo(mx + r * 0.1, my + r * 0.01); ctx.lineTo(mx, my + r * 0.07); ctx.closePath(); ctx.fill(); }
    }
    if (look.beard === 'moustache' || look.moustache) {
      const bc2 = look.beardCol || look.hair || '#2a2018';
      ctx.beginPath(); ctx.moveTo(mx - r * 0.3, my - r * 0.02); ctx.quadraticCurveTo(mx, my - r * 0.26, mx + r * 0.3, my - r * 0.06);
      ctx.quadraticCurveTo(mx + r * 0.52, my - r * 0.1, mx + r * 0.55, my - r * 0.32); ctx.quadraticCurveTo(mx + r * 0.48, my + r * 0.02, mx + r * 0.1, my - r * 0.04);
      ctx.quadraticCurveTo(mx - r * 0.2, my + r * 0.02, mx - r * 0.3, my - r * 0.02); ctx.closePath(); blob(ctx, bc2, shade(bc2, 0.5), 1.6);
    }
    if (look.freckles) { ctx.fillStyle = 'rgba(150,80,40,.55)'; for (const [fx, fy] of [[0.35, 0.18], [0.5, 0.25], [0.42, 0.3], [0.6, 0.15], [0.28, 0.28]]) { ctx.beginPath(); ctx.arc(r * fx, r * fy, r * 0.03, 0, TAU); ctx.fill(); } }
    // pelo y sombreros
    const hair = look.hair || '#3a2a20';
    if (look.hairStyle === 'mop') {
      ctx.beginPath(); ctx.moveTo(-r * 0.95, r * 0.15);
      const spikes = [[-1.05, -0.5], [-0.8, -1.05], [-0.4, -1.25], [0.0, -1.18], [0.45, -1.2], [0.8, -0.95], [1.0, -0.55], [0.7, -0.6], [0.5, -0.45], [0.2, -0.55], [-0.2, -0.4], [-0.55, -0.15]];
      for (const [px, py] of spikes) ctx.lineTo(r * px, r * py);
      ctx.closePath(); blob(ctx, hair, shade(hair, 0.5), 2.4);
    } else if (look.hairStyle === 'tonsure') {
      ctx.beginPath(); ctx.moveTo(-r * 0.92, r * 0.1); ctx.quadraticCurveTo(-r * 1.0, -r * 0.6, -r * 0.55, -r * 0.82); ctx.quadraticCurveTo(0, -r * 0.62, r * 0.6, -r * 0.82); ctx.quadraticCurveTo(r * 0.8, -r * 0.62, r * 0.82, -r * 0.45); ctx.quadraticCurveTo(0, -r * 0.42, -r * 0.6, -r * 0.2); ctx.closePath(); blob(ctx, hair, shade(hair, 0.5), 2);
    } else if (look.hairStyle !== 'bald' && look.hat !== 'hood' && look.hat !== 'toca') {
      ctx.beginPath(); ctx.moveTo(-r * 0.9, r * 0.1); ctx.bezierCurveTo(-r * 1.05, -r * 1.2, r * 0.85, -r * 1.3, r * 0.88, -r * 0.4);
      ctx.quadraticCurveTo(r * 0.3, -r * 0.62, -r * 0.2, -r * 0.4); ctx.quadraticCurveTo(-r * 0.5, -r * 0.1, -r * 0.6, r * 0.12); ctx.closePath(); blob(ctx, hair, shade(hair, 0.5), 2.2);
    }
    const hc = look.hatCol || '#5a4a38';
    if (look.hat === 'cap') { ctx.beginPath(); ctx.moveTo(-r * 0.95, -r * 0.45); ctx.quadraticCurveTo(-r * 0.6, -r * 1.45, r * 0.6, -r * 1.05); ctx.quadraticCurveTo(r * 1.0, -r * 0.7, r * 0.9, -r * 0.5); ctx.closePath(); blob(ctx, hc, shade(hc, 0.45), 2.4); }
    else if (look.hat === 'brim') { ctx.beginPath(); ctx.ellipse(r * 0.05, -r * 0.62, r * 1.45, r * 0.22, -0.06, 0, TAU); blob(ctx, hc, shade(hc, 0.45), 2.4); ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.65); ctx.quadraticCurveTo(-r * 0.6, -r * 1.55, r * 0.1, -r * 1.5); ctx.quadraticCurveTo(r * 0.75, -r * 1.45, r * 0.75, -r * 0.68); ctx.closePath(); blob(ctx, shade(hc, 1.08), shade(hc, 0.45), 2.4); }
    else if (look.hat === 'bonete') { ctx.beginPath(); ctx.moveTo(-r * 0.92, -r * 0.5); ctx.lineTo(-r * 0.75, -r * 1.35); ctx.lineTo(r * 0.75, -r * 1.35); ctx.lineTo(r * 0.92, -r * 0.5); ctx.closePath(); blob(ctx, hc, shade(hc, 0.45), 2.4); if (look.feather) { ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 1.3); ctx.quadraticCurveTo(-r * 1.4, -r * 2.4, -r * 1.6, -r * 1.2); ctx.quadraticCurveTo(-r * 1.0, -r * 1.7, -r * 0.4, -r * 1.3); blob(ctx, look.feather, shade(look.feather, 0.5), 1.6); } }
    else if (look.hat === 'helmet') { ctx.beginPath(); ctx.moveTo(-r * 0.98, -r * 0.35); ctx.quadraticCurveTo(-r * 0.9, -r * 1.55, r * 0.15, -r * 1.55); ctx.quadraticCurveTo(r * 1.0, -r * 1.4, r * 0.98, -r * 0.35); ctx.closePath(); blob(ctx, '#9aa0a8', '#3e4248', 2.4); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-r * 0.3, -r * 1.35, r * 0.18, r * 0.8); }
    else if (look.hat === 'turban') { ctx.beginPath(); ctx.ellipse(0, -r * 0.82, r * 1.02, r * 0.55, 0, 0, TAU); blob(ctx, hc, shade(hc, 0.5), 2.4); ctx.strokeStyle = shade(hc, 0.75); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * 0.9, -r * 0.7); ctx.quadraticCurveTo(0, -r * 1.25, r * 0.9, -r * 0.95); ctx.stroke(); }
    else if (look.hat === 'hood' || look.hat === 'toca') { ctx.beginPath(); ctx.moveTo(-r * 1.1, r * 0.5); ctx.bezierCurveTo(-r * 1.25, -r * 1.45, r * 0.95, -r * 1.55, r * 0.92, -r * 0.42); ctx.quadraticCurveTo(r * 0.25, -r * 0.85, -r * 0.35, -r * 0.3); ctx.quadraticCurveTo(-r * 0.6, r * 0.2, -r * 0.55, r * 0.6); ctx.closePath(); blob(ctx, hc, shade(hc, 0.45), 2.4); }
    ctx.restore();
  }

  // ---------- estado de animación ----------
  function stateOf(a, look, t) {
    const st = { mouth: 0, tilt: 0, blink: false, brow: 0, look: 0, mood: a.mood || null };
    const bl = (t + (look.seed || 0) * 0.37) % 3.9; st.blink = bl > 3.75;
    if (a.talking) {
      const m = Math.abs(Math.sin(t * 13)) * (0.5 + 0.5 * Math.abs(noise(t * 2.2, 3)));
      st.mouth = m; st.tilt = noise(t * 1.4, 5) * 0.06; st.brow = 0.6 + 0.4 * Math.sin(t * 2.3);
    } else if (a.listening) {
      st.tilt = 0.05 + Math.max(0, Math.sin(t * 2.1)) * 0.06; st.brow = 0.3;
    } else st.tilt = noise(t * 0.4, 7) * 0.035;
    if (look.eyes !== 'blind') st.look = noise(t * 0.6, 11);
    return st;
  }

  function draw(ctx, a, scale, camX) {
    if (!a.visible) return;
    const look = a.def.rig, B = bodyOf(look), t = a.animT;
    const k = (a.def.height / 300) * scale;
    const walking = a.anim === 'walk' && a.moving;
    const mode = walking ? 'walk' : 'idle';
    const phase = walking ? ((a.walkDist || 0) / (B.D * a.def.height / 300)) % 1 : 0;
    const P = pose(a, look, B, phase, mode, t);
    const st = stateOf(a, look, t);
    const lr = (a.facing === 'left' || a.facing === 'right') ? a.facing : a.lastH;
    const dir = lr === 'left' ? -1 : 1;
    const px = a.x - camX;
    // sombra
    ctx.fillStyle = 'rgba(25,15,5,.28)'; ctx.beginPath(); ctx.ellipse(px, a.y, 46 * k, 9 * k, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(px, a.y); ctx.scale(dir * k, k); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // brazos: oscilación opuesta a las piernas / reposo / habla / trabajo
    let aF, aB, bF = 0.35, bB = 0.3, hold = false;
    if (walking) { const s = Math.sin(phase * TAU); aF = -s * 0.5; aB = s * 0.5; bF = 0.3 + Math.max(0, s) * 0.4; bB = 0.3 + Math.max(0, -s) * 0.4; }
    else { aF = 0.12 + Math.sin(t * 1.9) * 0.02; aB = -0.05; }
    const work = !walking && a.anim === 'work' ? (look.work || 'fidget') : null;
    if (a.talking && !walking) { const g = Math.max(0, Math.sin(t * 2.6 + 1)); aF = 0.25 + g * 0.9; bF = 0.5 + g * 1.1; }
    if (work === 'hammer') { const h = (t * 2.2) % 1; aF = 2.6 - (h < 0.75 ? h / 0.75 * 1.6 : 1.6 - (h - 0.75) / 0.25 * 1.6); bF = 0.9; }
    else if (work === 'juggle') { aF = 1.9 + Math.sin(t * 7) * 0.4; bF = 1.0; aB = 1.7 + Math.sin(t * 7 + Math.PI) * 0.4; bB = 1.0; }
    else if (work === 'shout') { aF = 2.5; bF = 0.6; }
    else if (work === 'tap' || look.stick) { aF = 0.75; bF = 0.25; }
    else if (work === 'stir') { aF = 0.9 + Math.sin(t * 3) * 0.25; bF = 0.9 + Math.cos(t * 3) * 0.3; }
    else if (work === 'scratch') { const s = (t % 4) < 2; aF = s ? 2.9 : 0.12; bF = s ? 2.2 + Math.sin(t * 18) * 0.15 : 0.35; }
    if (work === 'shout' || work === 'scratch') st.mouth = work === 'shout' ? 0.6 + 0.4 * Math.abs(Math.sin(t * 6)) : st.mouth;
    // orden: brazo de detrás, pierna de detrás, pierna delantera, tronco, cabeza, brazo delantero
    drawArm(ctx, look, B, P.sh, aB, bB, true);
    const kB = drawLeg(ctx, look, B, P.hip, P.fB, true);
    const kA = drawLeg(ctx, look, B, P.hip, P.fA, false);
    drawTorso(ctx, look, B, P, kA, kB);
    if (look.sling) { ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(P.hip[0] + 10, P.hip[1] - 4); ctx.quadraticCurveTo(P.hip[0] + 18, P.hip[1] + 26, P.hip[0] + 4, P.hip[1] + 34); ctx.stroke(); }
    drawHead(ctx, look, B, P, st);
    const hand = drawArm(ctx, look, B, P.sh, aF, bF, false);
    // objetos en la mano
    if (look.stick) {
      const tap = work === 'tap' || walking ? Math.max(0, Math.sin(t * (walking ? 6 : 3.2))) * 14 : 0;
      ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(hand[0] - 2, hand[1] - 18); ctx.lineTo(hand[0] + 26, -tap); ctx.stroke();
      ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 2; ctx.stroke();
    }
    if (work === 'hammer') { ctx.save(); ctx.translate(hand[0], hand[1]); ctx.rotate(-aF + 0.3); ctx.fillStyle = '#5a3a1e'; ctx.fillRect(-3, -30, 6, 34); ctx.fillStyle = '#555c66'; ctx.fillRect(-12, -40, 24, 14); ctx.restore(); }
    if (work === 'juggle') { for (let i = 0; i < 3; i++) { const u = ((t * 1.3 + i / 3) % 1), x = P.sh[0] - 22 + u * 50, y = P.head[1] - 40 - Math.sin(u * Math.PI) * 60; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); blob(ctx, '#9a8a70', '#3a3020', 1.5); } }
    if (look.prop === 'scroll') { ctx.save(); ctx.translate(hand[0], hand[1]); ctx.fillStyle = '#efe2bf'; ctx.strokeStyle = '#6a5030'; ctx.lineWidth = 2; ctx.fillRect(-4, -26, 30, 34); ctx.strokeRect(-4, -26, 30, 34); ctx.restore(); }
    if (look.prop === 'keys') { ctx.strokeStyle = '#b8932a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hand[0] + 4, hand[1] + 10, 7, 0, TAU); ctx.stroke(); }
    if (look.prop === 'grapes' && a.def.rigProp !== false) { for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(hand[0] + 4 + (i % 3) * 7 - (i > 5 ? 0 : 0), hand[1] + 6 + Math.floor(i / 3) * 7, 4.6, 0, TAU); blob(ctx, '#6a3a7a', '#2a1030', 1.2); } }
    ctx.restore();
  }

  E.rig = { draw, bodyOf };
})(window.E1248 = window.E1248 || {});
