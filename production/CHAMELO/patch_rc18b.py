# RC18 → RC18b: solo tres cambios pedidos por César (9 nov):
#  1) abejas: zumbido de enjambre (ruido + voces desafinadas, sin osciladores puros) que se calla al salir de la escena;
#  2) zurrón arriba a la derecha, junto al menú, con hueco para el dedo;
#  3) Sancha: fuera la alusión a la envidia de Mingo (ausente); una réplica breve del viajero.
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()

def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, (n, old[:90])
    s = s.replace(old, new)

rep("CHAMELO RC18',", "CHAMELO RC18b',")

# ---------- 1 · ABEJAS
rep("""        const o1 = ac.createOscillator(), o2 = ac.createOscillator(); o1.type = 'triangle'; o2.type = 'triangle'; o1.frequency.value = 196; o2.frequency.value = 203.5;
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 1.1;
        const g = ac.createGain(); g.gain.value = 0; const p = ac.createStereoPanner();
        const fl = ac.createOscillator(), flg = ac.createGain(); fl.frequency.value = 9; flg.gain.value = 6; fl.connect(flg); flg.connect(o1.frequency); flg.connect(o2.frequency);
        o1.connect(bp); o2.connect(bp); bp.connect(g); g.connect(p); p.connect(group.g); o1.start(); o2.start(); fl.start();
        group.nodes.push(o1, o2, fl); beeNode = { g, p, x: P.bees[0], v: P.bees[1] };""",
"""        // RC18b · zumbido de enjambre: 7 abejas en bucle (diente de sierra con tono que deriva y tiembla, volumen que va y viene)
        // más un soplo de alas; filtrado suave 160–1100 Hz, sin resonancias ni tonos puros (los «pitidos» de antes).
        if (!bufs.buzz) bufs.buzz = loopBuf(3, (d, sr) => {
          for (let v = 0; v < 7; v++) {
            const f0 = 205 + Math.random() * 45, r1 = 0.15 + Math.random() * 0.5, r2 = 0.9 + Math.random() * 1.6, ra = 0.08 + Math.random() * 0.3;
            const p1 = Math.random() * TAU, p2 = Math.random() * TAU, pa = Math.random() * TAU;
            let ph = Math.random(), j = 0;
            for (let i = 0; i < d.length; i++) {
              const t = i / sr; j = 0.999 * j + 0.001 * (Math.random() * 2 - 1);
              ph += f0 * (1 + 0.035 * Math.sin(TAU * r1 * t + p1) + 0.012 * Math.sin(TAU * r2 * t + p2) + 0.6 * j) / sr; ph -= Math.floor(ph);
              const a = 0.5 + 0.5 * Math.sin(TAU * ra * t + pa);
              d[i] += (2 * ph - 1) * (0.25 + 0.75 * a * a);
            }
          }
          for (let i = 0; i < d.length; i++) d[i] += (Math.random() * 2 - 1) * 0.5;
        });
        const s = ac.createBufferSource(); s.buffer = bufs.buzz; s.loop = true; s.loopStart = 0; s.loopEnd = bufs.buzz.duration;
        const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 160; hp.Q.value = -3;
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = -3;
        const g = ac.createGain(); g.gain.value = 0; const p = ac.createStereoPanner();
        s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(p); p.connect(group.g); s.start(0, Math.random() * bufs.buzz.duration);
        group.nodes.push(s); beeNode = { g, p, src: s, x: P.bees[0], v: P.bees[1] };""")

# al salir: las abejas se apagan enseguida (0,2 s), sin esperar al fundido largo del resto del paisaje
rep("""      const g = group, t = ac.currentTime;
      g.g.gain.cancelScheduledValues(t);""",
"""      const g = group, t = ac.currentTime;
      if (beeNode) { const b = beeNode.g.gain; b.cancelScheduledValues(t); b.setValueAtTime(b.value, t); b.linearRampToValueAtTime(0, t + 0.2); try { beeNode.src.stop(t + 0.3); } catch (e) {} }
      g.g.gain.cancelScheduledValues(t);""")

# y en cuanto empieza el cambio de escena (fundido a negro) o la escena ya no es la suya, volumen 0
rep("""      if (beeNode && G.player) { const d = Math.abs(G.player.x - beeNode.x), v = 0.12 * beeNode.v * clamp(1 - d / 1100, 0, 1) ** 2; beeNode.g.gain.setTargetAtTime(v, t, 0.3);""",
"""      if (beeNode && G.player) { const away = G.transitioning || G.state.scene !== group.id, d = Math.abs(G.player.x - beeNode.x), v = away ? 0 : 0.28 * beeNode.v * clamp(1 - d / 1100, 0, 1) ** 2; beeNode.g.gain.setTargetAtTime(v, t, away ? 0.06 : 0.3);""")

# ---------- 2 · ZURRÓN arriba a la derecha, a la izquierda del menú (1530,66 r40)
rep("""      const x = 78, y = 822, r = 54;
      U.buttons.push({ x: x - r, y: y - r, w: r * 2, h: r * 2, onTap:""",
"""      const x = 1404, y = 66, r = 44, hit = 54;   // RC18b: junto al menú; zona de toque 108 px con ~30 px libres hasta la del menú
      U.buttons.push({ x: x - hit, y: y - hit, w: hit * 2, h: hit * 2, onTap:""")
rep("""      ctx.fillStyle = '#c9a46a'; rr(ctx, x - 26, y - 14, 52, 40, 10); ctx.fill();
      ctx.strokeStyle = '#c9a46a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y - 14, 16, Math.PI, 0); ctx.stroke();
      const n = G.state.inventory.length;
      if (n) { ctx.fillStyle = '#b5482e'; ctx.beginPath(); ctx.arc(x + 38, y - 38, 18, 0, Math.PI * 2); ctx.fill(); TX.draw(ctx, String(n), x + 38, y - 38, { size: 24, bold: true, ui: true }, 'cc'); }""",
"""      ctx.fillStyle = '#c9a46a'; rr(ctx, x - 22, y - 10, 44, 34, 9); ctx.fill();
      ctx.strokeStyle = '#c9a46a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - 10, 13, Math.PI, 0); ctx.stroke();
      const n = G.state.inventory.length;
      if (n) { ctx.fillStyle = '#b5482e'; ctx.beginPath(); ctx.arc(x - 32, y + 30, 16, 0, Math.PI * 2); ctx.fill(); TX.draw(ctx, String(n), x - 32, y + 30, { size: 22, bold: true, ui: true }, 'cc'); }""")

# ---------- 3 · SANCHA
rep("""      note('(Te sacude la harina de los hombros con dos palmadas. Mingo se queda blanco… de envidia.)'),""",
"""      note('(Te sacude la harina de los hombros con dos palmadas.)'),
      say('Gracias. Un poco más y me mete en el horno.'),""")

open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
