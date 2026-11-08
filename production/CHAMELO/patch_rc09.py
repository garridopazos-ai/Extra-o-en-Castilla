"""CHAMELO RC09/RC10... (módulo por argumento 4: rc09.js por defecto) sobre la última candidata (RC08): «comer de verdad» y «encontrar dónde dormir».
Uso: python production/CHAMELO/patch_rc09.py builds/1248_CHAMELO_RC08.html builds/1248_CHAMELO_RC09.html [RC09]"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
RC = sys.argv[3] if len(sys.argv) > 3 else 'RC09'
MOD = sys.argv[4] if len(sys.argv) > 4 else 'rc09.js'
s = open(sys.argv[1], encoding='utf-8').read()
def sub(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:90]); s = s.replace(old, new)
import re
s = re.sub(r'CHAMELO RC\d\d', 'CHAMELO ' + RC, s)
# acción propia del guion
if 'rc09' not in s.split('src/main.js')[0][-3000:] and s.count('a.rc09 !== undefined') == 0:
  sub("      E.log.warn('Acción desconocida: ' + JSON.stringify(a));",
    "      if (a.rc09 !== undefined && E.rc09) return E.rc09.act(a.rc09, G);\n      E.log.warn('Acción desconocida: ' + JSON.stringify(a));")
if MOD == 'rc10.js':   # la hoja de Elvira también se carga en la villa (se muda a la plaza tras la visita al Chamelo)
    sub("if (E.companion && E.DATA.npcs.mingo && T('mingo_sigue', G.state)) chars.add(E.DATA.npcs.mingo.character);\n",
        "if (E.companion && E.DATA.npcs.mingo && T('mingo_sigue', G.state)) chars.add(E.DATA.npcs.mingo.character);\n      if (E.DATA.npcs.elvira && T('chamelo_familia', G.state)) chars.add(E.DATA.npcs.elvira.character);\n")
marker = "<script>/* src/main.js */"
sub(marker, "<script>/* CHAMELO " + RC + " · " + MOD + " */\n" + open(os.path.join(HERE, MOD), encoding='utf-8').read() + "\n</script>\n" + marker)
open(sys.argv[2], 'w', encoding='utf-8').write(s)
print('ok', len(s) // 1024 // 1024, 'MB')
