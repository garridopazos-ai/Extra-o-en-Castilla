"""CHAMELO RC20 · material nuevo (animaciones, imágenes), narrador y chiste de la aldea (sobre RC19, que no se toca).
Uso: python3 production/CHAMELO/patch_rc20.py builds/1248_CHAMELO_RC19.html builds/1248_CHAMELO_RC20.html
  1) Sonido: fuera las abejas sueltas (el ruido desagradable de la pantalla de Rai), arroyo y pájaros del Chamelo más suaves,
     el efecto «magic» de las viñetas solo suena una vez por secuencia y menos denso.
  2) Hojas nuevas: jugador (marcha de perfil, dar, coger, mirar), viejo soldado (con marcha), bucles de Yuçaf, Lope, Oropesa,
     pregonero y los dos Giles; vídeos del hechizo de Rai; imágenes de Talavera, Sifones de noche, calle del mercado y taberna de noche.
  3) Módulo rc20.js: narrador (cartelas y vidascalias), explicación de Rai en compases, aldea de los que llegan tarde, taberna de noche."""
import sys, os, re, json, base64
src, dst = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(HERE, 'work')
s = open(src, encoding='utf-8').read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:100]); s = s.replace(old, new)
rep("CHAMELO RC19',", "CHAMELO RC20',")

# ---------------------------------------------------------------- 1 · SONIDO
s, n = re.subn(r"      if \(P\.bees && G\.player && now > ev\.bee\) \{.*?\n      \}\n", "", s, count=1, flags=re.S)
assert n == 1, 'bloque de abejas'
rep("chamelo: { brook: 0.9, bees: [308, 1], birds: 1 },", "chamelo: { brook: 0.5, birds: 0.7 },")
rep("for (let i = 0; i < 26; i++) { const tt = t + 0.6 + Math.random() * 5.4, f = rnd(170, 420); tone(tt, f, f * 1.6, 0.09, 0.03, 'sine', rnd(-0.3, 0.3), M); }",
    "for (let i = 0; i < 9; i++) { const tt = t + 0.6 + Math.random() * 5.4, f = rnd(260, 420); tone(tt, f, f * 1.4, 0.09, 0.016, 'sine', rnd(-0.3, 0.3), M); }")
rep("    snd.event('magic');\n    return () => vig.done;", "    if (!RC._mg || performance.now() - RC._mg > 14000) snd.event('magic');\n    RC._mg = performance.now();\n    return () => vig.done;")
# la taberna ya tiene su imagen nocturna: el velo azul de la noche se queda en un toque
rep("RC9.nightT = f.noche ? 0.62 :", "RC9.nightT = f.noche ? (id === 'taberna' ? 0.08 : 0.62) :")

# ---------------------------------------------------------------- 2 · RECURSOS
b64 = lambda path, mime: 'data:' + mime + ';base64,' + base64.b64encode(open(path, 'rb').read()).decode()
meta = {'player': json.load(open(os.path.join(W, 'player_rc20', 'meta.json'))), 'npc': {}}
embed = {}
for cid in ['soldado', 'yucaf', 'lope', 'gil_a', 'gil_b', 'oropesa', 'pregonero', 'req_fila', 'req_corro']:
    d = os.path.join(W, 'npc_rc20', cid); meta['npc'][cid] = json.load(open(os.path.join(d, 'meta.json')))
    if cid != 'soldado': embed['assets/rc20/' + cid + '.webp'] = b64(os.path.join(d, 'sheet.webp'), 'image/webp')
for n_ in ['muralla_aerea', 'talavera_hoy', 'sifones_noche', 'calle_mercado', 'taberna_noche']:
    embed['assets/rc20/' + n_ + '.webp'] = b64(os.path.join(W, 'rc20', n_ + '.webp'), 'image/webp')
# hojas que sustituyen a las existentes (misma clave)
for key, f in [('assets/characters/player/sheet_g11.webp', os.path.join(W, 'player_rc20', 'sheet.webp')),
               ('assets/characters/soldado/hoja.webp', os.path.join(W, 'npc_rc20', 'soldado', 'sheet.webp'))]:
    data = b64(f, 'image/webp')
    s, n = re.subn(re.escape('"' + key + '":"data:image/webp;base64,') + r'[A-Za-z0-9+/=]+"', lambda m: '"' + key + '":"' + data + '"', s)
    assert n == 1, key
videos = {k: b64(os.path.join(W, 'rc20', k + '.webm'), 'video/webm') for k in ['rai_hechizo', 'rai_humo']}
block = ('<script>Object.assign(window.E1248_EMBED,' + json.dumps(embed) + ');\n'
         'window.E1248_VIDEOS = Object.assign(window.E1248_VIDEOS || {}, ' + json.dumps(videos) + ');\n'
         'window.E1248_RC20_META = ' + json.dumps(meta) + ';</script>\n')
mod = open(os.path.join(HERE, 'rc20.js'), encoding='utf-8').read()
rep('<script>/* src/main.js */', block + '<script>/* CHAMELO RC20 · rc20.js */\n' + mod + '</script>\n<script>/* src/main.js */')
open(dst, 'w', encoding='utf-8').write(s); print('ok', len(s) // 1024, 'KB')
