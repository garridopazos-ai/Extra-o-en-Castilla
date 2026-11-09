# RC18c → RC18d: Rai-gato con el arte de César (hoja de tools/build_gato.py) en lugar del gato negro dibujado por código.
# Uso: python3 patch_rc18d.py builds/1248_CHAMELO_RC18c.html builds/1248_CHAMELO_RC18d.html
import sys, os, base64, json
src, dst = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); GATO = os.path.join(HERE, '..', '..', 'art', 'personajes', 'rai_gato')
s = open(src, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80]); s = s.replace(old, new)
rep("CHAMELO RC18c',", "CHAMELO RC18d',")
embed = {'assets/characters/gato/hoja.webp': 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(GATO, 'hoja.webp'), 'rb').read()).decode()}
mod = open(os.path.join(HERE, 'rc18d.js'), encoding='utf-8').read()
assert mod.count('/*HOJA_GATO*/null') == 1
mod = mod.replace('/*HOJA_GATO*/null', open(os.path.join(GATO, 'hoja.json')).read())
rep('<script>/* src/main.js */', '<script>Object.assign(window.E1248_EMBED,' + json.dumps(embed) + ');</script>\n'
    '<script>/* CHAMELO RC18d · rc18d.js */\n' + mod + '</script>\n<script>/* src/main.js */')
open(dst, 'w', encoding='utf-8').write(s); print('ok', len(s))
