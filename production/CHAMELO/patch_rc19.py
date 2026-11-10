"""CHAMELO RC19 · correcciones tras la prueba de César del 10 nov (sobre RC18e, que no se toca).
Uso: python3 production/CHAMELO/patch_rc19.py builds/1248_CHAMELO_RC18e.html builds/1248_CHAMELO_RC19.html
  1) Sonido: fuera el zumbido continuo de abejas (ahora abejas sueltas y breves cerca de las colmenas), fuera los graves
     continuos del ambiente («room» y el ronroneo del fuego), filtro paso alto en todo el ambiente, empalme de bucles sin
     «bombeo» (equipotencia) y el viento más suave.
  2) Bocadillos: una frase de guion calla los comentarios sueltos de los demás, los comentarios no se pisan con nada y, si
     aun así dos coinciden, se apilan (nunca se superponen).
  3) La cartela de capítulo va arriba (compacta), por DEBAJO de los bocadillos y del HUD, y mientras sale no hay comentarios.
  4) Módulo rc19.js: trama del alfar (el lacre), noche en la taberna, cadena Mingo → Rai, proporciones de los personajes."""
import sys, os, re
src, dst = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(src, encoding='utf-8').read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:100]); s = s.replace(old, new)
rep("CHAMELO RC18e',", "CHAMELO RC19',")

# ---------------------------------------------------------------- 1 · SONIDO
# empalme de bucles en equipotencia (el lineal hundía 3 dB a mitad del empalme: «bombeo» cada 5–8 s)
rep("for (let i = 0; i < F; i++) { const t = i / F; tmp[i] = tmp[i] * t + tmp[n + i] * (1 - t); }",
    "for (let i = 0; i < F; i++) { const t = i / F; tmp[i] = tmp[i] * Math.sin(t * Math.PI / 2) + tmp[n + i] * Math.cos(t * Math.PI / 2); }")
# paso alto general del ambiente: sin retumbos que el móvil convierte en «zumbido de fondo»
rep("if (!bus) { bus = ac.createGain(); bus.gain.value = LEVELS.amb[lvl.amb][1]; bus.connect(E.audio.master); }",
    "if (!bus) { bus = ac.createGain(); bus.gain.value = LEVELS.amb[lvl.amb][1]; const hpf = ac.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 170; hpf.Q.value = 0.5; bus.connect(hpf); hpf.connect(E.audio.master); }")
rep("      if (P.room) loopLayer(bufs.brown, 0.05 * P.room, [['lowpass', 170]], 0);\n", "")
rep("      if (P.fire) loopLayer(bufs.brown, 0.06 * P.fire, [['lowpass', 260]], -0.4, [0.3, 0.3]);",
    "      if (P.fire) loopLayer(bufs.pink, 0.012 * P.fire, [['bandpass', 900, 0.6]], -0.4, [0.3, 0.3]);")
rep("if (P.wind) loopLayer(bufs.pink, 0.035 * P.wind,", "if (P.wind) loopLayer(bufs.pink, 0.022 * P.wind,")
# abejas: ni osciladores ni búfer continuo; solo algunas abejas sueltas que pasan zumbando (ver tick)
s, n = re.subn(r"      if \(P\.bees\) \{.*?      \} else beeNode = null;\n", "      beeNode = null;\n", s, count=1, flags=re.S)
assert n == 1, 'bloque de abejas'
rep("ev = { birds: now + rnd(1, 4),", "ev = { bee: now + rnd(2, 5), birds: now + rnd(1, 4),")
old_bee = re.search(r"      if \(beeNode && G\.player\) \{.*?\n", s).group(0)
new_bee = """      if (P.bees && G.player && now > ev.bee) {   // RC19: una o dos abejas sueltas que pasan zumbando (nada continuo)
        const d = Math.abs(G.player.x - P.bees[0]); ev.bee = now + rnd(5, 11);
        if (d < 700 && !G.transitioning && G.state.scene === group.id) {
          const n = 1 + Math.floor(Math.random() * 2), pan0 = clamp((P.bees[0] - G.player.x) / 900, -0.8, 0.8);
          for (let i = 0; i < n; i++) {
            const t0 = t + i * rnd(0.35, 0.8), f = rnd(250, 330), dur = rnd(0.5, 0.9), o = ac.createOscillator(), bp = ac.createBiquadFilter(), g = ac.createGain(), p = ac.createStereoPanner();
            o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t0); o.frequency.linearRampToValueAtTime(f * rnd(1.08, 1.22), t0 + dur * 0.5); o.frequency.linearRampToValueAtTime(f * rnd(0.9, 1.02), t0 + dur);
            bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 0.8;
            const v = 0.018 * clamp(1 - d / 800, 0.15, 1) * 2.5;
            g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
            p.pan.setValueAtTime(clamp(pan0 - 0.5, -0.9, 0.9), t0); p.pan.linearRampToValueAtTime(clamp(pan0 + 0.5, -0.9, 0.9), t0 + dur);
            o.connect(bp); bp.connect(g); g.connect(p); p.connect(group.g); o.start(t0); o.stop(t0 + dur + 0.05);
          }
        }
      }
"""
s = s.replace(old_bee, new_bee, 1)

# ---------------------------------------------------------------- 2 · BOCADILLOS
rep("""    U.say = (actor, text, blocking) => {
      U.bubbles = U.bubbles.filter(b => b.actor !== actor);""",
"""    U.say = (actor, text, blocking) => {
      // RC19: nunca dos voces a la vez. Un comentario suelto no sale si ya habla alguien de guion (ni si ya hay otro
      // comentario de otro personaje); una frase de guion calla de inmediato los comentarios sueltos de los demás.
      const live = U.bubbles.filter(b => !b.done && b.actor !== actor);
      if (!blocking && (live.some(b => b.blocking) || (actor !== G.player && live.length))) return { actor, text, t: 0, dur: 0, done: true, blocking: false };
      if (blocking) U.bubbles = U.bubbles.filter(b => b.blocking || b.actor === actor);
      U.bubbles = U.bubbles.filter(b => b.actor !== actor);""")
a0 = s.index("    function drawBubbles(ctx, S) {")
a1 = s.index("    function drawBag(ctx) {")
s = s[:a0] + """    function drawBubbles(ctx, S) {
      // RC19: se calcula primero el hueco de cada bocadillo; si dos coinciden, el segundo se apila encima (o debajo) del primero.
      const items = [];
      for (const b of U.bubbles) {
        if (b.done) continue;
        const a = b.actor;
        if (a !== G.player && !G.sceneNpcs.some(n => n.actor === a)) continue;
        const sc = S.depthScale(a.y);
        let hx = a.x - S.camX, hy = E.actor.headY(a, sc) - 18;
        if (E.rc07) { const p = E.rc07.cam.toScreen(hx, hy); hx = p[0]; hy = p[1]; }
        const e = TX.get(b.text, { size: 38, color: '#ffffff', bold: true, maxW: 700, align: 'center', stroke: 'rgba(12,8,4,.96)', strokeW: 0.22, halo: true });
        items.push({ b, e, x: Math.max(16, Math.min(C.W - e.w - 16, hx - e.w / 2)), y: Math.max(16, hy - e.h) });
      }
      items.sort((p, q) => (q.b.blocking ? 1 : 0) - (p.b.blocking ? 1 : 0) || p.b.t - q.b.t === 0 ? 0 : (q.b.blocking ? 1 : 0) - (p.b.blocking ? 1 : 0) || q.b.t - p.b.t);
      const placed = [], M = 10;
      const hit = (it, y) => placed.find(r => it.x < r.x + r.w + M && it.x + it.e.w + M > r.x && y < r.y + r.h + M && y + it.e.h + M > r.y);
      for (const it of items) {
        let y = it.y, r = hit(it, y), guard = 0;
        while (r && guard++ < 6) { y = r.y - it.e.h - M; r = hit(it, y); }            // hacia arriba
        if (r || y < 12) { y = it.y; guard = 0; r = hit(it, y); while (r && guard++ < 6) { y = r.y + r.h + M; r = hit(it, y); } }   // si no cabe, hacia abajo
        it.y = Math.max(8, Math.min(C.H - it.e.h - 8, y)); placed.push({ x: it.x, y: it.y, w: it.e.w, h: it.e.h });
      }
      for (const it of items) {
        const b = it.b, e = it.e, x = it.x, y = it.y;
        ctx.globalAlpha = Math.min(1, b.t * 8);
        ctx.drawImage(e.canvas, x, y, e.w, e.h);
        if (b.blocking && b.t > 0.6) {   // «▸»: esta frase espera; un toque la adelanta
          const tx = Math.min(C.W - 30, x + e.w + 10), ty = y + e.h - 22;
          ctx.globalAlpha = 0.6 + 0.4 * Math.sin(b.t * 6); ctx.fillStyle = '#ffd36b'; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(tx, ty - 12); ctx.lineTo(tx + 18, ty); ctx.lineTo(tx, ty + 12); ctx.closePath(); ctx.stroke(); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

""" + s[a1:]

# ---------------------------------------------------------------- 3 · CARTELA DE CAPÍTULO: arriba, compacta, por debajo de bocadillos y HUD
b0 = s.index("      if (s.card) {\n        const a = Math.min(1, s.t * 2.5, (s.dur - s.t) * 2.5), y = 250;")
b1 = s.index("      ctx.globalAlpha = Math.min(1, s.t * 3, (2.6 - s.t) * 2);")
s = s[:b0] + """      if (s.card) {
        const a = Math.min(1, s.t * 2.5, (s.dur - s.t) * 2.5), y = 34;
        ctx.save(); ctx.globalAlpha = a * 0.78;
        const g = ctx.createLinearGradient(0, y - 14, 0, y + 206);
        g.addColorStop(0, 'rgba(24,14,6,0)'); g.addColorStop(0.14, 'rgba(24,14,6,.86)'); g.addColorStop(0.86, 'rgba(24,14,6,.86)'); g.addColorStop(1, 'rgba(24,14,6,0)');
        ctx.fillStyle = g; ctx.fillRect(0, y - 14, C.W, 220);
        ctx.globalAlpha = a; ctx.fillStyle = 'rgba(233,165,35,.9)'; ctx.fillRect(C.W / 2 - 300, y + 20, 600, 3); ctx.fillRect(C.W / 2 - 300, y + 176, 600, 3);
        TX.draw(ctx, 'Capítulo ' + s.card[0], C.W / 2, y + 34, { size: 26, color: '#e6c98a', italic: true, stroke: 'rgba(0,0,0,.8)' }, 'tc');
        TX.draw(ctx, s.text, C.W / 2, y + 68, { size: 58, color: COL.gold, bold: true, stroke: 'rgba(0,0,0,.85)' }, 'tc');
        TX.draw(ctx, s.card[1], C.W / 2, y + 130, { size: 28, color: '#fff3d6', stroke: 'rgba(0,0,0,.85)' }, 'tc');
        ctx.restore(); return;
      }
""" + s[b1:]
rep("""        if (E.rc18e) E.rc18e.marks(ctx, G, S);
        if (E.journey && !G.dialogue.active) E.journey.guide(ctx, G, S);
        drawBubbles(ctx, S);""", """        if (E.rc18e) E.rc18e.marks(ctx, G, S);
        if (E.journey && !G.dialogue.active) E.journey.guide(ctx, G, S);
        drawSceneTitle(ctx);   // RC19: la cartela va debajo de los bocadillos y del HUD
        drawBubbles(ctx, S);""")
rep("        drawToasts(ctx);\n        drawSceneTitle(ctx);\n", "        drawToasts(ctx);\n")
# sin comentarios sueltos mientras sale la cartela
rep("RC.quiet = (G, n) => !!(G.runner.busy ||", "RC.quiet = (G, n) => !!(G.ui.sceneTitle || G.runner.busy ||")
rep("    const busy = G.runner.busy || G.dialogue.active || G.ui.notes.length || G.ui.overlay || G.transitioning;",
    "    const busy = G.runner.busy || G.dialogue.active || G.ui.notes.length || G.ui.overlay || G.transitioning || G.ui.sceneTitle;")

# ---------------------------------------------------------------- 4 · módulo de datos
mod = open(os.path.join(HERE, 'rc19.js'), encoding='utf-8').read()
rep('<script>/* src/main.js */', '<script>/* CHAMELO RC19 · rc19.js */\n' + mod + '</script>\n<script>/* src/main.js */')
open(dst, 'w', encoding='utf-8').write(s); print('ok', len(s))
