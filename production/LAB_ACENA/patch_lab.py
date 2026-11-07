"""LAB ACEÑA: variante de laboratorio sobre la última build G12 (no toca la línea principal).
Uso: python patch_lab.py builds/1248_LUNA_G12_ORILLA_RC04.html builds/1248_LAB_ACENA_RC01.html RC01
Antes: python production/LAB_ACENA/tools/build_assets.py (genera production/LAB_ACENA/assets/)."""
import sys, os, re, base64, io
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); AS = os.path.join(HERE, 'assets')
RC = sys.argv[3] if len(sys.argv) > 3 else 'RC01'
s = open(sys.argv[1], encoding='utf-8').read()
def sub(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:90]); s = s.replace(old, new)
# ---------- versión y guardado propios (no pisa partidas de la línea principal)
sub('G12 · ACTO I «LA ORILLA» · RC04</title>', 'LAB ACEÑA · ' + RC + '</title>')
s = s.replace('G12 · ACTO I «LA ORILLA» · RC04', 'LAB ACEÑA · ' + RC)
sub("ctx.fillText('G12 · RC04'", "ctx.fillText('LAB ACEÑA · " + RC + "'")
sub("saveKey: '1248_g12_rc03_save_v1'", "saveKey: '1248_lab_acena_" + RC.lower() + "_v1'")
# ---------- quitar restos de verde en los bordes de las hojas del viajero y de Durán (despill)
def despill(key):
    global s
    m = re.search('"' + re.escape(key) + r'":"data:image/webp;base64,([A-Za-z0-9+/=]+)"', s)
    im = np.array(Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert('RGBA')).astype(np.int16)
    r, g, b, a = im[:, :, 0], im[:, :, 1], im[:, :, 2], im[:, :, 3]
    lim = np.maximum(r, b) + 4
    fix = (a > 0) & (g > lim)
    im[:, :, 1] = np.where(fix, lim, g)
    buf = io.BytesIO(); Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(buf, 'WEBP', quality=90, method=5)
    s = s[:m.start(1)] + base64.b64encode(buf.getvalue()).decode() + s[m.end(1):]
    print('despill', key, int(fix.sum()), 'px')
despill('assets/characters/duran/sheet_g10.webp'); despill('assets/characters/player/sheet_g11.webp')
# ---------- recursos del laboratorio
def emb(path, f, mime): return '"' + path + '":"data:' + mime + ';base64,' + base64.b64encode(open(os.path.join(AS, f), 'rb').read()).decode() + '",'
key = '"assets/characters/player/sheet_g11.webp":"data:'
sub(key, emb('assets/scenes/acena_ext/bg.jpg', 'bg_ext.jpg', 'image/jpeg') + emb('assets/scenes/acena_ext/tronco.webp', 'tronco.webp', 'image/webp')
    + emb('assets/scenes/acena/muela_frente.webp', 'muela_frente.webp', 'image/webp') + emb('assets/characters/elvira/pose_portada.webp', 'elvira_pose.webp', 'image/webp') + key)
# ---------- botón de depuración en pantalla (bajo el del mapa); desactivado al inicio
sub("          if (E.journey) E.journey.button(ctx, G, U);\n", """          if (E.journey) E.journey.button(ctx, G, U);
          { const bx = 1530, by = 346, r = 34;   // LAB: depuración (suelo transitable, apoyos, zonas)
            U.buttons.push({ x: bx - r, y: by - r, w: 2 * r, h: 2 * r, id: 'lab-debug', onTap: () => G.debug.toggle() });
            ctx.fillStyle = G.debug.on ? 'rgba(40,120,60,.88)' : 'rgba(20,15,10,.7)'; ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill();
            ctx.strokeStyle = 'rgba(216,190,140,.7)'; ctx.lineWidth = 2; ctx.stroke();
            ctx.font = 'bold 19px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3dfb3'; ctx.fillText('DEP', bx, by + 1); }
""")
# ---------- sin tarjetas de capítulo en el laboratorio (tapan la escena cada vez que se entra)
sub("const c = id && CHAPTERS[id];", "const c = null;")
# ---------- contenido del laboratorio (tras G12)
marker = "<script>/* src/main.js */"
sub(marker, "<script>/* LAB ACEÑA */\n" + open(os.path.join(HERE, 'lab_acena.js'), encoding='utf-8').read() + "\n</script>\n" + marker)
open(sys.argv[2], 'w', encoding='utf-8').write(s); print('ok', len(s))
