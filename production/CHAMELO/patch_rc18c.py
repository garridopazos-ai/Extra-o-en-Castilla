# RC18b → RC18c: puzle del paloduz según el guion (mata visible en la orilla del Chamelo, recoger raíz, dársela a Rai).
# Uso: python3 patch_rc18c.py builds/1248_CHAMELO_RC18b.html builds/1248_CHAMELO_RC18c.html
import sys, os, base64, json
src, dst = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); ART = os.path.join(HERE, '..', '..', 'art', 'escenarios', 'chamelo')
s = open(src, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80]); s = s.replace(old, new)
rep("CHAMELO RC18b',", "CHAMELO RC18c',")
b64 = lambda f: 'data:image/png;base64,' + base64.b64encode(open(os.path.join(ART, f), 'rb').read()).decode()
embed = {'assets/scenes/chamelo/paloduz_mata.png': b64('paloduz_mata.png'), 'assets/scenes/chamelo/paloduz_raiz.png': b64('paloduz_raiz.png'),
         'assets/items/paloduz.png': b64('paloduz_item.png')}
mod = open(os.path.join(HERE, 'rc18c.js'), encoding='utf-8').read()
rep('<script>/* src/main.js */', '<script>Object.assign(window.E1248_EMBED,' + json.dumps(embed) + ');</script>\n'
    '<script>/* CHAMELO RC18c · rc18c.js */\n' + mod + '</script>\n<script>/* src/main.js */')
open(dst, 'w', encoding='utf-8').write(s); print('ok', len(s))
