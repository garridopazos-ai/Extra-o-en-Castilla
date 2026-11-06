/* G11 · arte PROVISIONAL de los capítulos nuevos (todo dibujado por código; se sustituye por arte final sin tocar la lógica) */
(function (E) {
  'use strict';
  const A = E.assets, cv = (w, h) => E.createCanvas(w, h);
  const rnd = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const vg = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
  const sky = (g, w, h, a, b) => { g.fillStyle = vg(g, 0, h, [[0, a], [1, b]]); g.fillRect(0, 0, w, h); };
  const label = (g, t, x, y) => { g.font = '600 20px system-ui,sans-serif'; g.fillStyle = 'rgba(255,255,255,.4)'; g.fillText(t, x, y); };
  const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const clouds = (g, w, y, r, n) => { g.fillStyle = 'rgba(255,248,235,.5)'; for (let i = 0; i < n; i++) { const cx = (i + .5) * w / n, s = 40 + r() * 50; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(cx + (k - 1.5) * s * .6, y + r() * 40, s * .7, s * .3, 0, 0, 7); g.fill(); } } };
  const merlons = (g, x0, x1, y, c) => { g.fillStyle = c; for (let x = x0; x < x1; x += 28) g.fillRect(x, y - 16, 16, 16); };
  const ground = (g, w, y0, h, c1, c2, r) => {
    g.fillStyle = vg(g, y0, h, [[0, c1], [1, c2]]); g.fillRect(0, y0, w, h - y0);
    g.strokeStyle = 'rgba(60,40,20,.18)'; g.lineWidth = 2;
    for (let i = 0; i < w / 14; i++) { const x = r() * w, y = y0 + 20 + r() * (h - y0 - 20); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + r() * 30, y + 2); g.stroke(); }
  };
  const arch = (g, x, y, w, h, c, inner) => {
    g.fillStyle = c; g.fillRect(x - 14, y - 14, w + 28, h + 14);
    g.fillStyle = inner; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.quadraticCurveTo(x + w / 2, y - w * .35, x + w, y + w / 2); g.lineTo(x + w, y + h); g.closePath(); g.fill();
  };
  const water = (g, x, y, w, h, r) => {
    g.fillStyle = vg(g, y, y + h, [[0, '#6f8f97'], [.5, '#4f7480'], [1, '#3d5d63']]); g.fillRect(x, y, w, h);
    g.strokeStyle = 'rgba(220,235,235,.18)'; g.lineWidth = 2;
    for (let i = 0; i < w / 30; i++) { const xx = x + r() * w, yy = y + 10 + r() * (h - 20); g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + 20 + r() * 50, yy); g.stroke(); }
  };

  // ---------- Travesía ----------
  A.registerPlaceholder('g11_travesia', (w, h) => {
    const c = cv(w, h), g = c.getContext('2d'), r = rnd(11);
    sky(g, w, 400, '#e9b98a', '#f5e3c0'); clouds(g, w, 120, r, 5);
    g.fillStyle = '#8a7f6a'; g.beginPath(); g.moveTo(0, 330); for (let x = 0; x <= w; x += 60) g.lineTo(x, 300 - 40 * Math.sin(x / 210)); g.lineTo(w, 360); g.lineTo(0, 360); g.fill();
    rect(g, '#b89f7c', 900, 296, 600, 46); merlons(g, 900, 1500, 300, '#b89f7c');
    for (const x of [960, 1100, 1260, 1400]) { rect(g, '#a88f6c', x, 240, 36, 100); merlons(g, x, x + 36, 244, '#a88f6c'); }
    rect(g, '#c9b089', 1180, 190, 56, 150);
    water(g, 0, 335, w, 565, r); label(g, 'TRAVESÍA DEL TAJO · provisional', 24, 880);
    return c;
  });
  A.registerPlaceholder('g11_boat_big', (w, h) => {
    const c = cv(w, h), g = c.getContext('2d');
    g.fillStyle = '#5a3a24'; g.beginPath(); g.moveTo(10, 90); g.lineTo(w - 10, 90); g.lineTo(w - 70, h - 10); g.lineTo(70, h - 10); g.closePath(); g.fill();
    rect(g, '#7a5434', 14, 90, w - 28, 14);
    g.strokeStyle = '#3e2a1a'; g.lineWidth = 3; for (let x = 90; x < w - 90; x += 70) { g.beginPath(); g.moveTo(x, 110); g.lineTo(x - 10, h - 14); g.stroke(); }
    rect(g, '#6a4a30', 90, 70, 150, 16); rect(g, '#6a4a30', w - 240, 70, 150, 16);
    g.strokeStyle = '#7a5434'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(w - 60, 90); g.lineTo(w + 0, -10); g.stroke();
    return c;
  });

  // ---------- Puerta del Río ----------
  A.registerPlaceholder('g11_puerta', (w, h) => {
    const c = cv(w, h), g = c.getContext('2d'), r = rnd(23);
    sky(g, w, 520, '#7fa9d6', '#f1e4c9'); clouds(g, w, 120, r, 6);
    water(g, 0, 420, 480, 130, r);                                 // recodo del Tajo a la izquierda
    for (const x of [60, 160, 330]) { rect(g, '#5b4a2e', x, 380, 10, 50); g.fillStyle = '#c9a53a'; g.beginPath(); g.ellipse(x + 5, 360, 26, 46, 0, 0, 7); g.fill(); }
    rect(g, '#b79b74', 450, 160, 1750, 470); merlons(g, 450, 2200, 160, '#b79b74');
    g.fillStyle = 'rgba(90,60,40,.18)'; for (let y = 200; y < 620; y += 40) g.fillRect(450, y, 1750, 3);
    rect(g, '#a68562', 780, 70, 480, 560); merlons(g, 780, 1260, 70, '#a68562');   // torre albarrana
    arch(g, 930, 330, 180, 160, '#8a4a34', '#6e5b43');                                // arco de ladrillo mudéjar
    arch(g, 1370, 380, 200, 270, '#8a4a34', '#2a1d14');                               // puerta del postigo
    g.fillStyle = '#5a3a24'; g.fillRect(1390, 470, 160, 180); g.strokeStyle = '#2a1d14'; g.lineWidth = 4;
    for (let x = 1410; x < 1550; x += 30) { g.beginPath(); g.moveTo(x, 470); g.lineTo(x, 650); g.stroke(); }
    rect(g, '#d9c9a0', 1630, 540, 90, 60);                                            // banco de portazgo
    rect(g, '#7b6a4c', 1600, 440, 160, 12);                                            // toldo
    g.fillStyle = '#6a2a2a'; g.beginPath(); g.moveTo(1830, 90); g.lineTo(1910, 110); g.lineTo(1830, 150); g.fill(); rect(g, '#3a2a1e', 1826, 80, 6, 300);   // pendón
    ground(g, w, 630, h, '#c9a96a', '#9a7d49', r);
    g.strokeStyle = 'rgba(80,55,30,.35)'; g.lineWidth = 10; for (const y of [740, 800]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 6); g.stroke(); }
    label(g, 'PUERTA DEL RÍO · provisional', 24, 880);
    return c;
  });
  const cart = (tilt) => (w, h) => {
    const c = cv(w, h), g = c.getContext('2d'); g.translate(w / 2, h - 6); g.rotate(tilt); g.translate(-w / 2, -(h - 6));
    rect(g, '#6a4a30', 20, 110, w - 60, 70);
    for (let i = 0; i < 9; i++) { g.fillStyle = ['#c8763c', '#e6d3a3', '#3d6ea5'][i % 3]; g.beginPath(); g.ellipse(50 + i * 36, 96 - (i % 2) * 22, 22, 28, 0, 0, 7); g.fill(); }
    g.strokeStyle = '#3e2a1a'; g.lineWidth = 8; g.beginPath(); g.arc(120, h - 50, 46, 0, 7); g.stroke(); g.beginPath(); g.arc(w - 120, h - 50, 46, 0, 7); g.stroke();
    g.lineWidth = 5; for (const cx of [120, w - 120]) for (let a = 0; a < 6; a++) { g.beginPath(); g.moveTo(cx, h - 50); g.lineTo(cx + 46 * Math.cos(a * 1.047), h - 50 + 46 * Math.sin(a * 1.047)); g.stroke(); }
    g.strokeStyle = '#4a3322'; g.lineWidth = 9; g.beginPath(); g.moveTo(w - 40, 150); g.lineTo(w + 0, 120); g.stroke();
    return c;
  };
  A.registerPlaceholder('g11_cart_stuck', (w, h) => cart(-0.09)(w, h));
  A.registerPlaceholder('g11_cart_free', (w, h) => cart(0)(w, h));
  A.registerPlaceholder('g11_bando', (w, h) => { const c = cv(w, h), g = c.getContext('2d'); rect(g, '#e8dcb8', 0, 0, w, h); g.strokeStyle = '#6b5a3a'; g.lineWidth = 2; for (let y = 16; y < h - 8; y += 14) { g.beginPath(); g.moveTo(10, y); g.lineTo(w - 10 - (y % 3) * 8, y); g.stroke(); } rect(g, '#a33', w - 30, h - 30, 18, 18); return c; });

  // ---------- Plaza del Pan ----------
  A.registerPlaceholder('g11_plaza', (w, h) => {
    const c = cv(w, h), g = c.getContext('2d'), r = rnd(31);
    sky(g, w, 420, '#8db4de', '#f4e6cb'); clouds(g, w, 100, r, 7);
    rect(g, '#b79b74', 0, 230, w, 420);
    for (let x = 0; x < w; x += 180) { rect(g, ['#c9ad80', '#b99c6e', '#cdb58c'][(x / 180) % 3 | 0], x, 250 + (x % 3) * 18, 170, 400); g.fillStyle = '#7b5b45'; g.fillRect(x - 6, 240 + (x % 3) * 18, 182, 14); }
    for (let x = 40; x < w; x += 180) { rect(g, '#3a2a1e', x + 40, 340, 36, 56); rect(g, '#3a2a1e', x + 100, 340, 36, 56); }
    // iglesia
    rect(g, '#cdb58c', 1340, 140, 380, 520); rect(g, '#bfa475', 1620, 20, 110, 640); merlons(g, 1620, 1730, 36, '#bfa475');
    arch(g, 1470, 470, 130, 190, '#8a4a34', '#2a1d14'); g.fillStyle = '#c9a53a'; g.beginPath(); g.arc(1675, 120, 24, 0, 7); g.fill();
    // casa del portazgo
    rect(g, '#d2bd94', 1800, 300, 350, 360); rect(g, '#7b3a2a', 1780, 270, 390, 40); arch(g, 1930, 480, 90, 180, '#6e4a34', '#2a1d14');
    rect(g, '#f0e2b8', 1850, 380, 250, 50); g.font = '700 26px system-ui'; g.fillStyle = '#6a2a2a'; g.fillText('PORTAZGO Y TASAS', 1862, 414);
    // arco de la plaza mayor y calle de olleros
    arch(g, 2230, 340, 120, 330, '#8a4a34', '#8aa0b8'); arch(g, 2440, 400, 120, 270, '#8a4a34', '#6e4a30');
    ground(g, w, 640, h, '#c9b78d', '#a68d63', r);
    // puestos
    rect(g, '#b33', 280, 450, 290, 36); rect(g, '#6a4a30', 300, 486, 12, 200); rect(g, '#6a4a30', 540, 486, 12, 200); rect(g, '#d9b26a', 296, 650, 270, 40);
    rect(g, '#555', 640, 470, 320, 30); rect(g, '#6a4a30', 650, 500, 12, 190); rect(g, '#6a4a30', 930, 500, 12, 190); rect(g, '#2a2a2a', 700, 650, 200, 40);
    g.fillStyle = '#e8a23a'; g.beginPath(); g.ellipse(800, 640, 70, 18, 0, 0, 7); g.fill();
    // fuente
    rect(g, '#9a9488', 1070, 640, 160, 70); g.fillStyle = '#6f8f97'; g.fillRect(1080, 650, 140, 18); rect(g, '#9a9488', 1140, 540, 20, 110);
    // tablón de bandos
    rect(g, '#5a3a24', 260, 300, 8, 150);
    label(g, 'PLAZA DEL PAN · provisional', 24, 880);
    return c;
  });

  // ---------- Iglesia ----------
  A.registerPlaceholder('g11_iglesia', (w, h) => {
    const c = cv(w, h), g = c.getContext('2d'), r = rnd(41);
    sky(g, w, 400, '#9ec1e3', '#f4e6cb'); clouds(g, w, 90, r, 4);
    rect(g, '#cdb58c', 0, 160, w, 500); rect(g, '#bfa475', 120, 20, 260, 640); merlons(g, 120, 380, 36, '#bfa475');
    arch(g, 170, 90, 160, 120, '#8a4a34', '#1c1612'); g.fillStyle = '#b8902a'; g.beginPath(); g.moveTo(205, 120); g.lineTo(295, 120); g.lineTo(310, 200); g.lineTo(190, 200); g.fill();
    rect(g, '#444', 245, 195, 12, 40);
    for (const x of [620, 900, 1180]) arch(g, x, 260, 110, 260, '#8a4a34', '#2a2a44');
    arch(g, 1430, 400, 130, 260, '#6e4a34', '#2a1d14');
    ground(g, w, 650, h, '#bfa98a', '#8a7556', r);
    rect(g, '#7a5a3a', 560, 700, 240, 24); rect(g, '#7a5a3a', 580, 724, 14, 40); rect(g, '#7a5a3a', 770, 724, 14, 40);
    label(g, 'ATRIO DE SANTA MARÍA · provisional', 24, 880);
    return c;
  });
  A.registerPlaceholder('g11_campana_cuerda', (w, h) => { const c = cv(w, h), g = c.getContext('2d'); rect(g, '#b0915c', w / 2 - 4, 0, 8, h); return c; });

  // ---------- Alfar de Yuçaf ----------
  A.registerPlaceholder('g11_alfar', (w, h) => {
    const c = cv(w, h), g = c.getContext('2d'), r = rnd(51);
    rect(g, '#9a7d57', 0, 0, w, 660); g.fillStyle = 'rgba(60,40,20,.12)'; for (let y = 40; y < 660; y += 44) g.fillRect(0, y, w, 3);
    rect(g, '#3b2a1c', 0, 0, w, 90);
    rect(g, '#7a5a3a', 600, 190, 840, 14); for (let x = 620; x < 1420; x += 58) { g.fillStyle = ['#c8763c', '#e6d3a3', '#3d6ea5'][(x / 58 | 0) % 3]; g.beginPath(); g.ellipse(x + 20, 160, 22, 30, 0, 0, 7); g.fill(); }
    rect(g, '#7a5a3a', 600, 360, 840, 14); for (let x = 640; x < 1400; x += 76) { g.fillStyle = ['#e6d3a3', '#c8763c'][(x / 76 | 0) % 2]; g.beginPath(); g.ellipse(x + 20, 330, 26, 32, 0, 0, 7); g.fill(); }
    arch(g, 1460, 300, 100, 360, '#6e4a34', '#8aa0b8');
    ground(g, w, 650, h, '#a08460', '#6f5a3c', r);
    // horno
    rect(g, '#8a5a3a', 90, 220, 440, 440); g.fillStyle = '#6a4228'; g.beginPath(); g.arc(310, 220, 220, Math.PI, 0); g.fill();
    arch(g, 230, 440, 160, 220, '#4a2a1a', '#120a06');
    label(g, 'ALFAR DE YUÇAF · provisional', 24, 880);
    return c;
  });
  A.registerPlaceholder('g11_horno_fuego', (w, h) => { const c = cv(w, h), g = c.getContext('2d'); const gr = g.createRadialGradient(w / 2, h * .7, 4, w / 2, h * .7, w / 2); gr.addColorStop(0, 'rgba(255,230,120,1)'); gr.addColorStop(.4, 'rgba(255,140,40,.8)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); return c; });
  A.registerPlaceholder('g11_torno', (w, h) => { const c = cv(w, h), g = c.getContext('2d'); rect(g, '#6a4a30', 10, h * .45, w - 20, 14); rect(g, '#6a4a30', 20, h * .45, 12, h * .55); rect(g, '#6a4a30', w - 32, h * .45, 12, h * .55); g.fillStyle = '#8a7a5a'; g.beginPath(); g.ellipse(w / 2, h * .42, w * .32, 14, 0, 0, 7); g.fill(); g.fillStyle = '#c8763c'; g.beginPath(); g.ellipse(w / 2, h * .3, 30, 34, 0, 0, 7); g.fill(); return c; });

  // ---------- Casa del Portazgo (interior) ----------
  A.registerPlaceholder('g11_portazgo', (w, h) => {
    const c = cv(w, h), g = c.getContext('2d'), r = rnd(61);
    rect(g, '#8a6a4a', 0, 0, w, 650); g.fillStyle = 'rgba(40,25,10,.15)'; for (let x = 0; x < w; x += 80) g.fillRect(x, 0, 4, 650);
    rect(g, '#3b2a1c', 0, 0, w, 80); rect(g, '#d9c9a0', 640, 130, 320, 220); g.strokeStyle = '#6b5a3a'; g.lineWidth = 3; g.strokeRect(640, 130, 320, 220);
    g.font = '700 28px system-ui'; g.fillStyle = '#6a2a2a'; g.fillText('TARIFAS (provisional)', 668, 175);
    g.font = '20px system-ui'; g.fillStyle = '#4a3a22'; ['Entrar: 2d', 'Estar: 3d', 'Salir: 4d', 'Mirar: 1d', 'Respirar: suspendido'].forEach((t, i) => g.fillText(t, 668, 210 + i * 28));
    for (let i = 0; i < 6; i++) { rect(g, '#7a5a3a', 1100, 150 + i * 70, 400, 10); for (let k = 0; k < 6; k++) { g.fillStyle = ['#c8763c', '#e6d3a3', '#7a8a5a'][k % 3]; g.fillRect(1116 + k * 62, 110 + i * 70, 40, 40); } }
    arch(g, 140, 300, 150, 360, '#6e4a34', '#8aa0b8');
    ground(g, w, 650, h, '#8a6240', '#5d4129', r);
    label(g, 'CASA DEL PORTAZGO · provisional', 24, 880);
    return c;
  });
  A.registerPlaceholder('g11_mesa', (w, h) => { const c = cv(w, h), g = c.getContext('2d'); rect(g, '#5a3a24', 0, 20, w, 28); rect(g, '#4a2f1d', 16, 48, 18, h - 48); rect(g, '#4a2f1d', w - 34, 48, 18, h - 48); rect(g, '#e8dcb8', w * .3, 6, 120, 18); rect(g, '#2a1d14', w * .62, 4, 26, 18); return c; });

  // ---------- Audiencia (plaza mayor) ----------
  A.registerPlaceholder('g11_audiencia', (w, h) => {
    const c = cv(w, h), g = c.getContext('2d'), r = rnd(71);
    sky(g, w, 420, '#8db4de', '#f4e6cb'); clouds(g, w, 90, r, 5);
    rect(g, '#b79b74', 0, 220, w, 430); for (let x = 0; x < w; x += 200) { rect(g, ['#c9ad80', '#cdb58c'][(x / 200) % 2 | 0], x, 260, 190, 390); rect(g, '#3a2a1e', x + 60, 340, 40, 60); }
    for (const [x, col] of [[300, '#a33'], [700, '#1d3b73'], [1100, '#a33'], [1500, '#1d3b73']]) { rect(g, '#3a2a1e', x, 70, 8, 330); g.fillStyle = col; g.beginPath(); g.moveTo(x + 8, 80); g.lineTo(x + 110, 100); g.lineTo(x + 8, 150); g.fill(); }
    ground(g, w, 640, h, '#c9b78d', '#a68d63', r);
    rect(g, '#7a5a3a', 480, 600, 640, 60); rect(g, '#6a4a30', 480, 660, 640, 18); rect(g, '#1d3b73', 700, 560, 200, 40);
    label(g, 'PLAZA MAYOR · VISTA PÚBLICA · provisional', 24, 880);
    return c;
  });

  // ---------- Iconos de objetos (96×96) ----------
  const icon = d => (w, h) => { const c = cv(w || 96, h || 96), g = c.getContext('2d'); d(g, c.width); return c; };
  A.registerPlaceholder('item_cuna', icon((g, w) => { g.fillStyle = '#9a6a3a'; g.beginPath(); g.moveTo(12, w - 20); g.lineTo(w - 12, w - 20); g.lineTo(w - 12, w - 50); g.closePath(); g.fill(); }));
  A.registerPlaceholder('item_viga', icon((g, w) => { g.fillStyle = '#7a5434'; g.save(); g.translate(w / 2, w / 2); g.rotate(-.7); g.fillRect(-44, -9, 88, 18); g.restore(); }));
  A.registerPlaceholder('item_cantaro', icon((g, w) => { g.fillStyle = '#c8763c'; g.beginPath(); g.ellipse(w / 2, w / 2 + 6, 26, 32, 0, 0, 7); g.fill(); g.fillStyle = '#3d6ea5'; g.fillRect(w / 2 - 22, w / 2 - 2, 44, 8); g.fillStyle = '#c8763c'; g.fillRect(w / 2 - 9, 12, 18, 18); }));
  const sello = col => icon((g, w) => { g.fillStyle = '#4a3322'; g.fillRect(w / 2 - 7, 14, 14, 36); g.fillStyle = col; g.beginPath(); g.arc(w / 2, 64, 22, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(w / 2 - 10, 58, 20, 5); });
  A.registerPlaceholder('item_sello_gremio', sello('#c8763c')); A.registerPlaceholder('item_sello_parroquia', sello('#6a3a8a')); A.registerPlaceholder('item_sello_alguacil', sello('#a33'));
  A.registerPlaceholder('item_badajo', icon((g, w) => { g.strokeStyle = '#555'; g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2, 46); g.stroke(); g.fillStyle = '#444'; g.beginPath(); g.arc(w / 2, 62, 20, 0, 7); g.fill(); }));
  A.registerPlaceholder('item_bando', icon((g, w) => { g.fillStyle = '#e8dcb8'; g.fillRect(18, 10, w - 36, w - 20); g.strokeStyle = '#6b5a3a'; g.lineWidth = 2; for (let y = 24; y < w - 18; y += 11) { g.beginPath(); g.moveTo(26, y); g.lineTo(w - 26, y); g.stroke(); } g.fillStyle = '#a33'; g.fillRect(w - 40, w - 30, 16, 16); }));
})(window.E1248 = window.E1248 || {});
