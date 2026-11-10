"""CHAMELO RC21 · «El soto de noche» con la imagen de César, como escena propia (sobre RC20, que no se toca).
Uso: python3 production/CHAMELO/patch_rc21.py builds/1248_CHAMELO_RC20.html builds/1248_CHAMELO_RC21.html"""
import sys, os, base64, json
src, dst = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(src, encoding='utf-8').read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:100]); s = s.replace(old, new)
rep("CHAMELO RC20',", "CHAMELO RC21',")
rep("    orilla: { river: 0.42, birds: 1.2, wind: 0.2, cuckoo: 1 },", "    orilla: { river: 0.42, birds: 1.2, wind: 0.2, cuckoo: 1 },\n    soto_noche: { wind: 0.25, river: 0.18 },")
rep("if (id === 'orilla' && f.noche_soto && !f.requete_1) torch(ctx, 2672 - Sc.camX, 640, now);", "if (id === 'soto_noche' && f.noche_soto && !f.requete_1) torch(ctx, 632 - Sc.camX, 640, now);")
rep("(id === 'taberna' ? 0.08 : 0.62)", "(id === 'taberna' || id === 'soto_noche' ? 0.08 : 0.62)")
b64 = lambda p: 'data:image/webp;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
block = '<script>Object.assign(window.E1248_EMBED,' + json.dumps({'assets/rc21/soto_noche.webp': b64(os.path.join(HERE, 'work', 'rc21', 'soto_noche.webp'))}) + ');</script>\n'
mod = open(os.path.join(HERE, 'rc21.js'), encoding='utf-8').read()
rep('<script>/* src/main.js */', block + '<script>/* CHAMELO RC21 · rc21.js */\n' + mod + '</script>\n<script>/* src/main.js */')
open(dst, 'w', encoding='utf-8').write(s); print('ok', len(s) // 1024, 'KB')
