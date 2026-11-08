"""CHAMELO RC07+ (RC07, RC08...) sobre la build CHAMELO RC06 (referencias/1248_CHAMELO_RC06.html, hecha en otra sesión).
Uso: python production/CHAMELO/patch_rc07.py referencias/1248_CHAMELO_RC06.html builds/1248_CHAMELO_RC07.html [RC07]
Antes: python production/CHAMELO/tools/make_map_v2.py (mapa sin «¡TÚ ESTÁS AQUÍ!» pintado, con Isla del Chamelo y Soto de los Sifones)."""
import sys, os, re, base64
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..', '..')
RC = sys.argv[3] if len(sys.argv) > 3 else 'RC07'
s = open(sys.argv[1], encoding='utf-8').read()
n0 = len(s)
def sub(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:100]); s = s.replace(old, new)

# ---------- 1) peso: fuera imágenes repetidas (se queda la última asignación, que es la que usa el juego) y las que nada usa
EMB = re.compile(r'"([^"]{3,120})": ?"data:[a-z/+]+;base64,[A-Za-z0-9+/=]+"')
UNUSED = {'assets/scenes/orilla/far.jpg', 'assets/scenes/orilla/near.webp', 'assets/scenes/acena/bg.png', 'assets/scenes/acena/vano.jpg', 'assets/characters/elvira/chamelo.webp'}
ms = list(EMB.finditer(s)); last = {}
for m in ms: last[m.group(1)] = m.start()
cut = [m for m in ms if last[m.group(1)] != m.start() or m.group(1) in UNUSED]
for m in reversed(cut):
    a, b = m.start(), m.end()
    if s[b:b + 1] == ',': b += 1
    elif s[a - 1:a] == ',': a -= 1
    elif s[a - 2:a] == ', ': a -= 2
    s = s[:a] + s[b:]
    print('fuera', m.group(1))
# las referencias a esas capas ya no existen tras los bloques posteriores; la de la Elvira antigua se sustituye por su hoja Flow

# ---------- 2) versión (el guardado sigue siendo el de RC06: se puede continuar la partida)
s = s.replace('CHAMELO RC06', 'CHAMELO ' + RC)

# ---------- 3) audio: exponer contexto, mezcla y nivel de música
sub("E.audio = { unlock, play, ambient, suspend, resume, setMuted,",
    "E.audio = { unlock, play, ambient, suspend, resume, setMuted, get ctx() { return ctx; }, get master() { return master; }, get musicGain() { return musicGain; },")
sub("musicGain.gain.linearRampToValueAtTime(0.34, ctx.currentTime + 4);",
    "musicGain.gain.linearRampToValueAtTime(Math.max(0.0001, E.audio.musicLevel != null ? E.audio.musicLevel : 0.34), ctx.currentTime + 4);")

# ---------- 4) actor: prisa (doble toque) y fin de prisa al llegar
sub("const v = a.speed * Math.max(0.45, depthScale(a.y)) * dt;", "const v = a.speed * (a.hurry ? 1.85 : 1) * Math.max(0.45, depthScale(a.y)) * dt;")
sub("        a.moving = false; a.anim = 'idle';\n", "        a.moving = false; a.anim = 'idle'; a.hurry = false;\n")

# ---------- 5) marionetas: la sombra la pone la capa de luz cuando las pinta en su lienzo
sub("    // sombra\n    ctx.fillStyle = 'rgba(25,15,5,.28)'; ctx.beginPath(); ctx.ellipse(px, a.y, 46 * k, 9 * k, 0, 0, TAU); ctx.fill();",
    "    // sombra\n    if (!a._noShadow) { ctx.fillStyle = 'rgba(25,15,5,.28)'; ctx.beginPath(); ctx.ellipse(px, a.y, 46 * k, 9 * k, 0, 0, TAU); ctx.fill(); }")

# ---------- 6) bocadillos: siguen a la cámara cuando se acerca
sub("        const hx = a.x - S.camX, hy = E.actor.headY(a, sc) - 18;",
    "        let hx = a.x - S.camX, hy = E.actor.headY(a, sc) - 18;\n        if (E.rc07) { const p = E.rc07.cam.toScreen(hx, hy); hx = p[0]; hy = p[1]; }")

# ---------- 7) toques con la cámara acercada, doble toque = prisa, pulsación larga en el suelo = ver zonas
sub("      const x = sx + G.S.camX, y = sy;",
    "      const w = E.rc07 ? E.rc07.cam.toWorld(sx, sy) : [sx, sy];\n      const x = w[0] + G.S.camX, y = w[1];")
sub("      const wx = ev.x + G.S.camX, wy = ev.y;\n      const r = G.S.nav.findPath(G.player.x, G.player.y, wx, wy);\n      if (r) { E.actor.setPath(G.player, r.path); G.marker = { x: r.target[0], y: r.target[1], t: 0 }; }",
    "      const ww = E.rc07 ? E.rc07.cam.toWorld(ev.x, ev.y) : [ev.x, ev.y];\n      const wx = ww[0] + G.S.camX, wy = ww[1];\n"
    "      const again = !!(G.marker && G.player.moving && Math.hypot(G.marker.x - wx, G.marker.y - wy) < 90);\n"
    "      const r = G.S.nav.findPath(G.player.x, G.player.y, wx, wy);\n"
    "      if (r) { E.actor.setPath(G.player, r.path); G.marker = { x: r.target[0], y: r.target[1], t: 0 }; G.player.hurry = again; }")
sub("        if (t) { G.ui.verbMenu = { x: ev.x, y: ev.y, target: t, verbs: verbsFor(t) }; E.audio.play('tap'); }\n        return;",
    "        if (t) { G.ui.verbMenu = { x: ev.x, y: ev.y, target: t, verbs: verbsFor(t) }; E.audio.play('tap'); }\n        else if (E.rc07) E.rc07.reveal();\n        return;")
sub("    G.performVerb = (t, verb, item) => {\n      if (G.runner.busy || G.transitioning) return;\n",
    "    G.performVerb = (t, verb, item) => {\n      if (G.runner.busy || G.transitioning) return;\n"
    "      // segundo toque sobre el mismo objetivo mientras se camina: prisa (y en salidas, se sale ya)\n"
    "      if (G.pending && G.pending.t.id === t.id && G.pending.verb === verb && (G.pending.item || null) === (item || null) && G.player.moving) {\n"
    "        G.player.hurry = true;\n"
    "        if (verb === 'exit') { const p = G.player.path, last = p[p.length - 1]; if (last) { G.player.x = last[0]; G.player.y = last[1]; G.player.path = [last]; } }\n"
    "        return;\n      }\n")
sub("      else if (k === 'Escape') {", "      else if (k === 'Escape' && G.ui.overlay === 'map') E.journey.close(G, G.ui);\n      else if ((k === 'm' || k === 'M') && E.journey && (!G.ui.overlay || G.ui.overlay === 'map')) G.ui.overlay === 'map' ? E.journey.close(G, G.ui) : E.journey.open(G, G.ui);\n      else if (k === 'Escape') {")

# ---------- 8) menú en dos columnas con Música / Ambiente / Efectos visuales
sub("          { label: 'Sonido: ' + (E.audio.muted ? 'NO' : 'SÍ'), onTap: () => E.audio.setMuted(!E.audio.muted), id: 'm-sound' },",
    "          { label: 'Sonido: ' + (E.audio.muted ? 'NO' : 'SÍ'), onTap: () => E.audio.setMuted(!E.audio.muted), id: 'm-sound' },\n"
    "          { label: 'Música: ' + E.rc07.levelName('music'), onTap: () => E.rc07.cycle('music'), id: 'm-music' },\n"
    "          { label: 'Ambiente: ' + E.rc07.levelName('amb'), onTap: () => E.rc07.cycle('amb'), id: 'm-amb' },\n"
    "          { label: 'Efectos visuales: ' + (E.rc07.fxOn ? 'SÍ' : 'NO'), onTap: () => E.rc07.toggleFx(), id: 'm-fx' },")
sub("        items.forEach((b, i) => button(ctx, { x: 520, y: 224 + i * 64, w: 560, h: 54, size: 28, ...b }));",
    "        const half = Math.ceil(items.length / 2);\n"
    "        items.forEach((b, i) => button(ctx, { x: i < half ? 428 : 812, y: 236 + (i % half) * 76, w: 360, h: 62, size: 26, ...b }));")

# ---------- 8a) Mingo como compañero: su hoja de sprites se carga también en la escena a la que llega siguiendo al viajero
#      (en RC06 pasó de marioneta a sprite y desaparecía al cambiar de lugar)
sub("      for (const id of Object.keys(E.DATA.npcs)) { const m = G.state.npcs[id]; if ((m ? m.scene : E.DATA.npcs[id].scene) === sceneId) chars.add(E.DATA.npcs[id].character); }\n",
    "      for (const id of Object.keys(E.DATA.npcs)) { const m = G.state.npcs[id]; if ((m ? m.scene : E.DATA.npcs[id].scene) === sceneId) chars.add(E.DATA.npcs[id].character); }\n"
    "      if (E.companion && E.DATA.npcs.mingo && T('mingo_sigue', G.state)) chars.add(E.DATA.npcs.mingo.character);\n")

# ---------- 8b) los comentarios de rutina de los vecinos esperan a que no hable nadie
sub("        if (T(st.if, G.state) && G.time - n.lastBark > (st.every || 18)) { n.lastBark = G.time; G.speak(n.def.id, st.bark, false); }",
    "        if (T(st.if, G.state) && G.time - n.lastBark > (st.every || 18) && !(E.rc07 && E.rc07.quiet(G, n))) { n.lastBark = G.time; G.speak(n.def.id, st.bark, false); }")

# ---------- 9) instalación de RC07 al crear el juego
sub("      if (G.runner.busy) return;\n      if (G.ui.invOpen && !G.inventory.selected)", "      if (G.runner.busy) return;\n      if (E.rc07 && E.rc07.swallow()) return;      // toque «sobrante» al terminar una frase\n      if (G.ui.invOpen && !G.inventory.selected)")
sub("    return G;\n  }\n\n  E.createGame = createGame;", "    if (E.rc07) E.rc07.install(G);\n    return G;\n  }\n\n  E.createGame = createGame;")

# ---------- 10) mapa ilustrado v2
i = s.index("window.E1248_ILLUS={map:'data:image/jpeg;base64,") + len("window.E1248_ILLUS={map:'data:image/jpeg;base64,")
j = s.index("'", i)
s = s[:i] + base64.b64encode(open(os.path.join(ROOT, 'art', 'portada', 'mapa_talavera_v2.jpg'), 'rb').read()).decode() + s[j:]

# ---------- 10b) imágenes retocadas dentro de la build (RC08)
import io, numpy as np, cv2
from PIL import Image
sys.path.insert(0, os.path.join(HERE, 'tools'))
from branch_edit import shorten
def embed_img(key):
    m = re.search('"' + re.escape(key) + r'": ?"data:(image/[a-z]+);base64,([A-Za-z0-9+/=]+)"', s)
    return m, Image.open(io.BytesIO(base64.b64decode(m.group(2))))
def put_img(m, im, fmt, **kw):
    global s
    buf = io.BytesIO(); im.save(buf, fmt, **kw)
    s = s[:m.start(1)] + 'image/' + fmt.lower() + ';base64,' + base64.b64encode(buf.getvalue()).decode() + s[m.end(2):]
# la rama de la higuera del soto era desproporcionadamente larga: se corta con un remate nuevo
m, im = embed_img('assets/scenes/orilla/soto_acuarela.webp')
put_img(m, Image.fromarray(shorten(np.array(im.convert('RGB')))), 'WEBP', quality=88, method=5)
# Raimundo: restos del suelo pintado bajo los pies (franja de arena) y motas sueltas en su hoja Flow
def clean_sheet(key, fw, fh, feet_band):
    m, im = embed_img(key)
    a = np.array(im.convert('RGBA'))
    H, W = a.shape[:2]
    for r in range(H // fh):
        for c in range(W // fw):
            fr = a[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw]
            if fr[:, :, 3].max() == 0: continue
            if feet_band:
                y0 = fh - feet_band
                hsv = cv2.cvtColor(np.ascontiguousarray(fr[y0:, :, :3]), cv2.COLOR_RGB2HSV)
                sand = (hsv[:, :, 2] > 150) & (hsv[:, :, 1] < 110) & (hsv[:, :, 0] < 35)
                fr[y0:, :, 3][sand] = 0
            al = (fr[:, :, 3] > 30).astype(np.uint8)
            n, lab, st, _ = cv2.connectedComponentsWithStats(al, 8)
            if n > 2:
                big = st[1:, cv2.CC_STAT_AREA].argmax() + 1
                for i in range(1, n):
                    if i != big and st[i, cv2.CC_STAT_AREA] < 400: fr[:, :, 3][lab == i] = 0
    put_img(m, Image.fromarray(a), 'WEBP', quality=90, method=5)
from clean_rai import clean_rai
m, im = embed_img('assets/characters/raimundo/flow.webp')
put_img(m, Image.fromarray(clean_rai(np.array(im.convert('RGBA')))), 'WEBP', quality=90, method=5)

# ---------- 11) módulo RC07 antes de main.js
marker = "<script>/* src/main.js */"
sub(marker, "<script>/* CHAMELO " + RC + ": luz, atmósfera, cámara, sonido, carisma y mapa */\n" + open(os.path.join(HERE, 'rc07.js'), encoding='utf-8').read() + "\n</script>\n" + marker)
open(sys.argv[2], 'w', encoding='utf-8').write(s)
print('ok', n0 // 1024 // 1024, 'MB ->', len(s) // 1024 // 1024, 'MB')
