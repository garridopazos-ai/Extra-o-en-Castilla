"""CHAMELO RC09 sobre la última candidata (RC08): «comer de verdad» y «encontrar dónde dormir».
Uso: python production/CHAMELO/patch_rc09.py builds/1248_CHAMELO_RC08.html builds/1248_CHAMELO_RC09.html [RC09]"""
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
RC = sys.argv[3] if len(sys.argv) > 3 else 'RC09'
s = open(sys.argv[1], encoding='utf-8').read()
def sub(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:90]); s = s.replace(old, new)
import re
s = re.sub(r'CHAMELO RC\d\d', 'CHAMELO ' + RC, s)
# acción propia del guion
sub("      E.log.warn('Acción desconocida: ' + JSON.stringify(a));",
    "      if (a.rc09 !== undefined && E.rc09) return E.rc09.act(a.rc09, G);\n      E.log.warn('Acción desconocida: ' + JSON.stringify(a));")
marker = "<script>/* src/main.js */"
sub(marker, "<script>/* CHAMELO " + RC + ": comer de verdad y dormir */\n" + open(os.path.join(HERE, 'rc09.js'), encoding='utf-8').read() + "\n</script>\n" + marker)
open(sys.argv[2], 'w', encoding='utf-8').write(s)
print('ok', len(s) // 1024 // 1024, 'MB')
