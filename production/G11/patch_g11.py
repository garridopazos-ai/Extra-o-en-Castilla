"""G10 RC02 -> G11 COMPLETO RC02. Uso: python patch_g11.py <entrada.html> <salida.html>"""
import sys, os, re, json, base64
HERE=os.path.dirname(os.path.abspath(__file__))
s=open(sys.argv[1],encoding='utf-8').read()
def sub(old,new,n=1):
    global s
    assert s.count(old)==n,('recuento',s.count(old),old[:80]); s=s.replace(old,new)
sub("Ribera → Aceña → Embarcadero · RC02","JUEGO COMPLETO · G11 · RC08",s.count("Ribera → Aceña → Embarcadero · RC02"))
s=s.replace("RIBERA → ACEÑA → EMBARCADERO · RC02","JUEGO COMPLETO · G11 · RC08")
sub("saveKey: '1248_g10_rc01_save_v1'","saveKey: '1248_g11_rc08_save_v1'")
sub("npc: { duran: '#c9e6ff', alfonso: '#ffd0b8' }","npc: { duran: '#c9e6ff', alfonso: '#ffd0b8', alfonso_b: '#ffd0b8', gil_a: '#d7d7e6', gil_b: '#d7d7e6', yucaf: '#ffe9a8', yucaf_alfar: '#ffe9a8', nuno_puerta: '#e2a8ff', nuno_casa: '#e2a8ff', nuno_aud: '#e2a8ff', sancha: '#ffd9e6', lope: '#ffb890', pregonero: '#ffd24d', benito: '#cfe8c0', mayordomo: '#a8c8ff' }")
sub("LAB01 · MOTOR · gráficos y textos provisionales","Juego completo · candidato G11 · arte provisional")
sub("'Juego completo · candidato G11 · arte provisional', C.W / 2, 350, { size: 26, color: COL.dim, ui: true }","'Candidato G11 · RC08 · arte provisional', C.W / 2, 350, { size: 26, color: '#fff3d6', stroke: 'rgba(0,0,0,.85)', ui: true }")
sub("'Reiniciar laboratorio'","'Reiniciar partida'",2)
sub("panel(ctx, 'Fin del laboratorio 01', [","panel(ctx, 'FIN · 1248 · Un extraño en Castilla', [")
sub("""          'La barca de Alfonso se aparta de la orilla.',
          'Talavera queda atrás, entre la bruma del Tajo.',
          '',""","""          'El horno de los Olleros se apaga con un último destello azul.',
          s.flags.nuno_derrotado ? 'Talavera aún habla del día en que Don Nuño de Mala-Cuenta abrió la bolsa.' : 'Don Nuño sigue cobrando.',
          '',""")
sub("'Durán: ' + (s.relations.duran || 0) + ' · Alfonso: ' + (s.relations.alfonso || 0) + ' · Reputación: ' + s.reputation,","'Durán: ' + (s.relations.duran || 0) + ' · Alfonso: ' + (s.relations.alfonso || 0) + ' · Yuçaf: ' + (s.relations.yucaf || 0) + ' · Reputación: ' + s.reputation,")

# ---------- protagonista: hoja generada desde los clips 216 (marcha), 222 (reposo), 223 (habla)
PW=os.path.join(HERE,'work','player'); meta=json.load(open(os.path.join(PW,'meta.json'))); R=meta['rows']; C=meta['counts']
webp=base64.b64encode(open(os.path.join(PW,'sheet.webp'),'rb').read()).decode()
ms=list(re.finditer(r'"assets/characters/player/sheet\.png":"data:image/png;base64,[A-Za-z0-9+/=]+"',s)); assert len(ms)==2
for i,m in reversed(list(enumerate(ms))):
    s=s[:m.start()]+('"assets/characters/player/sheet_g11.webp":"data:image/webp;base64,'+webp+'"' if i==0 else '"_player_old":""')+s[m.end():]
stride=round(meta['stride_src_px']*0.315*300/meta['ch'])
sheet_js="""  // Protagonista: hoja desde los clips 216 (marcha, el arte mira a la izquierda, %d fot.), 222 (reposo) y 223 (habla, ida y vuelta). Pies en (120,340).
  const sheetPlayer = { frameW: %d, frameH: %d, anchor: [%d, %d], cols: %d, baseFacing: 'left', anims: {
    idle_left: { row: %d, frames: 1, fps: 1, breath: true },
    walk_left: { row: %d, frames: %d, fps: 24, stride: %d },
    talk_left: { row: %d, frames: %d, fps: 8 } } };

  D.characters = {
"""%(C['walk'],meta['cw'],meta['ch'],meta['cw']//2,meta['gy'],meta['cols'],R['idle'],R['walk'],C['walk'],stride,R['talk'],C['talk'])
sub("  D.characters = {\n",sheet_js)
a=s.index("    player: {\n      name: 'El extraño'"); b=s.index("    duran: {",a)
s=s[:a]+"""    player: {
      name: 'El extraño', height: 300, speed: 180, hit: [-50, -300, 100, 300], orient: 'lr',
      sprite: { src: 'assets/characters/player/sheet_g11.webp', sheet: sheetPlayer,
        placeholderOpts: { skin: '#e2b48f', hair: '#2b211c', top: '#4f6d8f', hood: '#3f5873', sleeve: '#4f6d8f', legs: '#2f3f5c', shoes: '#eeeeee' } }
    },
"""+s[b:]

# ---------- charco: borde suave en lugar de recorte duro
sub("      g.restore();\n      S.floodPaint = { paint, x, y };","""      // orilla blanda: el agua se desvanece hacia el borde y deja ver el barro húmedo de debajo (sin recorte duro)
      g.globalCompositeOperation = 'destination-out'; g.lineJoin = 'round';
      g.filter = 'blur(10px)'; g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 34; floodShape(g, flood, x, y); g.stroke();
      g.filter = 'blur(5px)'; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 14; g.stroke();
      g.filter = 'none'; g.globalCompositeOperation = 'source-over';
      g.restore();
      S.floodPaint = { paint, x, y };""")

sub("      g.globalAlpha = .55; g.strokeStyle = '#d9e4d6'; g.lineWidth = 3; floodShape(g, flood, x, y); g.stroke();\n      g.globalAlpha = .25; g.lineWidth = 9; g.stroke();\n","      g.globalAlpha = 1;\n")
# ---------- botón de pista «?» y objetivo en el menú
sub("          drawMenuBtn(ctx);\n","          drawMenuBtn(ctx);\n          drawHintBtn(ctx);\n          if (E.journey) E.journey.button(ctx, G, U);\n")
sub("      if (S && !U.overlay) {\n        drawBubbles(ctx, S);","      if (S && !U.overlay) {\n        if (E.journey && !G.dialogue.active) E.journey.guide(ctx, G, S);\n        drawBubbles(ctx, S);")
sub("          { label: 'Guardar partida',","          { label: 'Mapa de Talavera', onTap: () => E.journey.open(G, U), id: 'm-map' },\n          { label: 'Guardar partida',")
sub("items.forEach((b, i) => button(ctx, { x: 520, y: 240 + i * 78, w: 560, h: 64, size: 30, ...b }));","items.forEach((b, i) => button(ctx, { x: 520, y: 224 + i * 64, w: 560, h: 54, size: 28, ...b }));")
sub("    combine: () => {","    campana: () => { tone(196, 1.2, 'sine', 0.14); tone(392, 0.72, 'sine', 0.08); tone(496, 0.44, 'triangle', 0.06); tone(812, 0.17, 'sine', 0.045); },\n    combine: () => {")
sub("    function itemIcon(id) {","""    // Pista contextual: la primera de E.DATA.hints cuya condición se cumple. Si el jugador lleva un rato sin avanzar, el botón late.
    function currentHint() { for (const h of (E.DATA.hints || [])) if (E.state.test(h.if, G.state)) return h; return null; }
    U.objective = () => { const h = currentHint(); return h ? h.obj : ''; };
    function drawHintBtn(ctx) {
      const x = 1530, y = 160, r = 40;
      const sig = Object.keys(G.state.flags).length + ':' + G.state.inventory.length + ':' + G.state.scene;
      if (U._hs !== sig) { U._hs = sig; U._ht = G.time; }
      const idle = G.time - U._ht, pulse = idle > 40 ? 0.5 + 0.5 * Math.sin(G.time * 5) : 0;
      U.buttons.push({ x: x - r, y: y - r, w: r * 2, h: r * 2, id: 'hint', onTap: () => {
        E.audio.play('tap'); if (G.runner.busy) return;
        const h = currentHint(); U._ht = G.time;
        G.runner.run([{ note: 'PISTA · ' + (h ? h.text : 'Explora, habla con todo el mundo y prueba los objetos del zurrón con lo que veas.') }]);
      } });
      ctx.fillStyle = 'rgba(20,15,10,.7)'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = pulse ? 'rgba(255,225,140,' + (0.5 + pulse * 0.5) + ')' : COL.panelLine; ctx.lineWidth = 2 + pulse * 5; ctx.stroke();
      TX.draw(ctx, '?', x, y + 2, { size: 46, bold: true, color: COL.gold, ui: true }, 'cc');
    }

    function itemIcon(id) {""")
sub("panel(ctx, 'Pausa', [saved ? 'Último guardado: ' + saved.at.slice(0, 19).replace('T', ' ') : 'Sin partida guardada']);","panel(ctx, 'Pausa', [U.objective() ? 'Objetivo: ' + U.objective() : 'Sin objetivo pendiente']);")


# ---------- banda sonora: «Caminos de Castilla» (MP3 96 kbps incrustado, bucle, se funde al entrar y respeta el silencio/pausa del motor)
mus=base64.b64encode(open(os.path.join(HERE,'..','..','assets','music','caminos_de_castilla_96k.mp3'),'rb').read()).decode()
sub("  let muted = false, wantedAmbient = null;","  let muted = false, wantedAmbient = null;\n  let musicSrc = null, musicGain = null, musicBuf = null, musicLoading = false;")
sub("    if (ctx.state === 'suspended') ctx.resume().catch(() => {});\n    if (wantedAmbient && !ambSrc) ambient(wantedAmbient);","""    if (ctx.state === 'suspended') ctx.resume().then(startMusic).catch(() => {}); else startMusic();
    if (wantedAmbient && !ambSrc) ambient(wantedAmbient);""")
sub("  function tone(freq, dur, type, vol, slide) {","""  // Banda sonora (window.E1248_MUSIC = MP3 en base64): se reproduce en streaming con un <audio> en bucle (sin decodificar ~60 MB en memoria) y entra con fundido; el volumen general y el silencio los gobierna `master`.
  function startMusic() {
    if (!ctx || ctx.state !== 'running' || musicSrc || musicLoading || !window.E1248_MUSIC) return;
    musicLoading = true;
    try {
      const bin = atob(window.E1248_MUSIC), u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      window.E1248_MUSIC = null;
      const el = new Audio(URL.createObjectURL(new Blob([u], { type: 'audio/mpeg' })));
      el.loop = true; el.preload = 'auto';
      musicSrc = ctx.createMediaElementSource(el);
      musicGain = ctx.createGain(); musicGain.gain.setValueAtTime(0.0001, ctx.currentTime); musicGain.gain.linearRampToValueAtTime(0.34, ctx.currentTime + 4);
      musicSrc.connect(musicGain); musicGain.connect(master);
      el.play().then(() => { musicLoading = false; musicBuf = el; }, e => { musicLoading = false; musicSrc = null; E.log.warn('Música: ' + e.message); });
    } catch (e) { musicLoading = false; E.log.warn('Música: ' + e.message); }
  }

  function tone(freq, dur, type, vol, slide) {""")
sub("get state() { return ctx ? ctx.state : 'sin-iniciar'; } };","get state() { return ctx ? ctx.state : 'sin-iniciar'; }, get music() { return { playing: !!musicSrc, loading: musicLoading, decoded: !!musicBuf }; } };")


# ---------- ilustraciones del mural (acuarelas del padre de César): título, pausa y final
ART=os.path.join(HERE,'..','..','art','ilustraciones_mural')
def b64(f): return base64.b64encode(open(os.path.join(ART,f),'rb').read()).decode()
illus_js="window.E1248_ILLUS={map:'data:image/jpeg;base64,"+base64.b64encode(open(os.path.join(HERE,'..','..','art','portada','mapa_talavera.jpg'),'rb').read()).decode()+"',pause:'data:image/jpeg;base64,"+b64('game_pescador_orilla.jpg')+"',end:'data:image/jpeg;base64,"+b64('game_gente_ribera.jpg')+"'};\nE1248.illus={};for(const k in window.E1248_ILLUS){const im=new Image();im.src=window.E1248_ILLUS[k];E1248.illus[k]=im;}"
sub("    function panel(ctx, title, lines) {\n      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, C.W, C.H);","""    function drawIllus(ctx, key) {
      const im = E.illus && E.illus[key];
      if (im && im.complete && im.naturalWidth) { ctx.drawImage(im, 0, 0, C.W, C.H); return true; }
      return false;
    }
    function panel(ctx, title, lines) {
      const ill = drawIllus(ctx, title === 'Pausa' ? 'pause' : String(title).startsWith('FIN') ? 'end' : '');
      ctx.fillStyle = ill ? 'rgba(0,0,0,.28)' : 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, C.W, C.H);""")
# ---------- portada: mapa ilustrado de Talavera (art/portada/mapa_talavera.jpg, generado por tools/make_map.py) con zoom de entrada a «¡Tú estás aquí!»
ta=s.index("      } else if (U.overlay === 'title') {"); tb=s.index("      } else if (U.overlay === 'end') {",ta)
s=s[:ta]+"""      } else if (U.overlay === 'title') {
        const now = performance.now(), Z = U.titleZoom, FX = 300, FY = 652;
        U.buttons.push({ x: 0, y: 0, w: C.W, h: C.H, z: -2, onTap: () => { if (U.titleZoom) U.titleZoom.t0 = -1e9; }, id: 'ov-bg' });
        const k = Z ? Math.min(1, (now - Z.t0) / 1600) : 0, e = k * k * (3 - 2 * k), sc = 1 + e * 3.4;
        const im = E.illus && E.illus.map;
        if (im && im.complete && im.naturalWidth) {
          ctx.save(); ctx.translate(FX + (C.W / 2 - FX) * e, FY + (C.H / 2 - FY) * e); ctx.scale(sc, sc); ctx.translate(-FX, -FY);
          ctx.drawImage(im, 0, 0, C.W, C.H); ctx.restore();
        } else {
          ctx.fillStyle = '#1a120b'; ctx.fillRect(0, 0, C.W, C.H);
          TX.draw(ctx, '1248', C.W / 2, 160, { size: 120, color: COL.gold, bold: true, stroke: 'rgba(0,0,0,.8)' }, 'tc');
          TX.draw(ctx, 'Un extraño en Castilla', C.W / 2, 310, { size: 54, color: COL.ink, italic: true, stroke: 'rgba(0,0,0,.8)' }, 'tc');
        }
        if (!Z) {
          const p = (now % 1500) / 1500, r = 22 + p * 54;
          ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,236,120,' + (1 - p).toFixed(3) + ')';
          ctx.beginPath(); ctx.ellipse(FX, FY, r, r * 0.6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
          ctx.fillStyle = 'rgba(30,18,8,.80)'; ctx.fillRect(30, 792, C.W - 60, 78);
          ctx.fillStyle = 'rgba(233,165,35,.9)'; ctx.fillRect(30, 792, C.W - 60, 3);
          const saved = E.save.read();
          button(ctx, { x: 200, y: 801, w: 440, h: 62, label: 'Nueva partida', primary: true, id: 't-new', onTap: () => { E.audio.unlock && E.audio.unlock(); U.titleZoom = { t0: performance.now() }; } });
          button(ctx, { x: 670, y: 801, w: 440, h: 62, label: saved ? 'Continuar' : 'Continuar (sin guardado)', disabled: !saved, id: 't-continue', onTap: () => { if (saved) { U.overlay = null; G.loadGame(); } } });
          button(ctx, { x: 1140, y: 801, w: 280, h: 62, size: 26, label: 'Pantalla completa', id: 't-fs', onTap: () => G.fullscreen() });
          ctx.save(); ctx.font = '15px sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,240,210,.7)'; ctx.fillText('G11 · RC08', C.W - 48, 828); ctx.fillText('arte provisional', C.W - 48, 850); ctx.restore();
        } else {
          if (k > 0.55) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, (k - 0.55) / 0.42).toFixed(3) + ')'; ctx.fillRect(0, 0, C.W, C.H); }
          if (k >= 1) { U.titleZoom = null; U.overlay = null; G.newGame(); U.fade = 1; U.fadeTarget = 0; }
        }
"""+s[tb:]
sub("      } else if (U.overlay === 'title') {","      } else if (U.overlay === 'map') {\n        E.journey.draw(ctx, G, U, button);\n      } else if (U.overlay === 'title') {")

# ---------- ritmo de lectura: las frases duraban 1,3 s + 42 car/s (ilegible en móvil). Ahora ~14 car/s, mínimos más largos,
# un toque sigue adelantando, indicador «▸» en los bocadillos que esperan y opción «Texto: lento/normal/rápido» en la pausa.
sub("    textSpeed: 42,                  // caracteres/segundo para calcular duración de frases","    textSpeed: (() => { try { return +localStorage.getItem('1248_textSpeed') || 14; } catch (e) { return 14; } })(),   // caracteres/segundo (lectura cómoda en móvil)")
sub("      const n = { text, t: 0, dur: Math.max(2.8, 1.4 + text.length / C.textSpeed), done: false };","      const n = { text, t: 0, dur: Math.max(3.6, 1.8 + text.length / C.textSpeed), done: false };")
sub("      const b = { actor, text, t: 0, dur: 1.3 + text.length / C.textSpeed, blocking, done: false };","      const b = { actor, text, t: 0, dur: blocking ? Math.max(2.6, 1.3 + text.length / C.textSpeed) : 2 + text.length / C.textSpeed, blocking, done: false };")
sub("""        ctx.drawImage(e.canvas, x, y, e.w, e.h);
        ctx.globalAlpha = 1;
      }
    }""","""        ctx.drawImage(e.canvas, x, y, e.w, e.h);
        if (b.blocking && b.t > 0.6) {   // «▸»: esta frase espera; un toque la adelanta
          const tx = Math.min(C.W - 30, x + e.w + 10), ty = y + e.h - 22;
          ctx.globalAlpha = 0.6 + 0.4 * Math.sin(b.t * 6); ctx.fillStyle = '#ffd36b'; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(tx, ty - 12); ctx.lineTo(tx + 18, ty); ctx.lineTo(tx, ty + 12); ctx.closePath(); ctx.stroke(); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }""")
sub("          { label: 'Mapa de Talavera', onTap: () => E.journey.open(G, U), id: 'm-map' },","""          { label: 'Mapa de Talavera', onTap: () => E.journey.open(G, U), id: 'm-map' },
          { label: 'Texto: ' + (C.textSpeed <= 10 ? 'lento' : C.textSpeed >= 20 ? 'rápido' : 'normal'), id: 'm-text', onTap: () => {
            C.textSpeed = C.textSpeed <= 10 ? 14 : C.textSpeed >= 20 ? 10 : 22; try { localStorage.setItem('1248_textSpeed', String(C.textSpeed)); } catch (e) {} } },""")

ph=open(os.path.join(HERE,'g11_placeholders.js'),encoding='utf-8').read()
ct=open(os.path.join(HERE,'g11_content.js'),encoding='utf-8').read()+'\n'+open(os.path.join(HERE,'g11_juglar.js'),encoding='utf-8').read()+'\n'+open(os.path.join(HERE,'g11_journey.js'),encoding='utf-8').read()
marker="<script>/* src/main.js */"
assert s.count(marker)==1
s=s.replace(marker,"<script>/* g11 placeholders */\n"+ph+"\n</script>\n<script>/* g11 content */\n"+ct+"\n</script>\n"+marker)
s=s.replace(marker,"<script>/* ilustraciones */\n"+illus_js+"\n</script>\n"+marker,1)
s=s.replace(marker,"<script>/* música */\nwindow.E1248_MUSIC='"+mus+"';\n</script>\n"+marker,1)
open(sys.argv[2],'w',encoding='utf-8').write(s); print('ok',len(s))
