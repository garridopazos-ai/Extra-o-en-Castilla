# RC18d → RC18e: Prioridad 1 (comprensión y navegación) de la revisión del Protocolo Luna.
# Uso: python3 patch_rc18e.py builds/1248_CHAMELO_RC18d.html builds/1248_CHAMELO_RC18e.html
import sys, os
src, dst = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(src, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80]); s = s.replace(old, new)
rep("CHAMELO RC18d',", "CHAMELO RC18e',")
# etiquetas de salida, dibujadas justo antes de la flecha del mapa (debajo de bocadillos y HUD)
rep("        if (E.journey && !G.dialogue.active) E.journey.guide(ctx, G, S);",
    "        if (E.rc18e) E.rc18e.marks(ctx, G, S);\n        if (E.journey && !G.dialogue.active) E.journey.guide(ctx, G, S);")
# ruido: el aviso técnico de rendimiento no sale en pantalla (se sigue degradando igual)
rep(" if (G.ui.toast) G.ui.toast('Efectos reducidos para ir más fluido');", "")
# Martín cobra «a la vuelta»: fuera la frase suelta que dice lo contrario
rep("'Una moneda por cruzar. Dos si cantas. Tres si cantas mal.', ", "")
mod = open(os.path.join(HERE, 'rc18e.js'), encoding='utf-8').read()
rep('<script>/* src/main.js */', '<script>/* CHAMELO RC18e · rc18e.js */\n' + mod + '</script>\n<script>/* src/main.js */')
open(dst, 'w', encoding='utf-8').write(s); print('ok', len(s))
