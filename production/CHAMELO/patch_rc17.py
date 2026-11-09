"""CHAMELO RC17 · Guion definitivo (revisión 2). Parches de texto del motor + módulo rc17.js.
Uso: python production/CHAMELO/patch_rc17.py <entrada: cadena hasta rc15> <salida.html> [RC17]"""
import sys, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
RC = sys.argv[3] if len(sys.argv) > 3 else 'RC17'
s = open(sys.argv[1], encoding='utf-8').read()
def sub(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:90]); s = s.replace(old, new)
s = re.sub(r'CHAMELO RC\d\d', 'CHAMELO ' + RC, s)
# 1) acción propia del guion {rc17:...}
sub("      E.log.warn('Acción desconocida: ' + JSON.stringify(a));",
    "      if (a.rc17 !== undefined && E.rc17) return E.rc17.act(a.rc17, G);\n      E.log.warn('Acción desconocida: ' + JSON.stringify(a));")
# 2) guardado propio: las partidas de la trama antigua no se mezclan
sub("saveKey: '1248_g12_rc03_save_v1'", "saveKey: '1248_guion_rev2_save_v1'")
# 3) tarjetas de capítulo del guion definitivo
i = s.index('const CHAPTERS = {'); j = s.index('};', i) + 2
s = s[:i] + """const CHAPTERS = {
      ribera:      ['I', 'Junio de 1248. Un forastero y un río que no esperaba visita.'],
      orilla:      ['II', 'Un soto, una higuera y un ladrón de muy corta estatura.'],
      acena:       ['III', 'Aquí se muele el pan de media comarca… cuando la rueda gira.'],
      chamelo:     ['IV', 'Una isla, un sabio y un mapa que no se regala.'],
      embarcadero: ['V', 'Una barca y un barquero que cobra a la vuelta.'],
      puerta_rio:  ['VI', 'La muralla de Talavera. Dos guardias y ninguna idea.'],
      plaza:       ['VII', 'Pan, chismes y una campana que espera su noche.'],
      alfar:       ['VIII', 'Un horno, un alfarero y un acreedor con lacre.'],
      corredera:   ['IX', 'Una torre, una muralla y una taberna con mal nombre.'],
      taberna:     ['X', 'La Taberna del Miedo. Aquí las batallas crecen con el vino.'],
      audiencia:   ['XI', 'La Plaza Mayor. Hoy se juzga a quien juzgaba.'],
      iglesia:     ['XII', 'Santa María, su campana y la noche de la Luna roja.']
    };""" + s[j:]
# 4) pantalla final
i = s.index("panel(ctx, 'FIN · 1248 · Un extraño en Castilla', [")
j = s.index(']);', i) + 3
s = s[:i] + """panel(ctx, 'FIN · 1248 · Un extraño en Castilla', [
          'Una hogaza todavía caliente y un gato que bosteza.',
          'Talavera, junio de 1248: Nuño destituido, el alfar de Yuçaf a salvo',
          'y la Requeteconquista discutiendo la fecha. Allí sigue.',
          '',
          'Tiempo de juego: ' + Math.round(s.time / 60) + ' min',
          'Guion: César · Arte provisional en parte (marionetas y efectos)'
        ]);""" + s[j:]
# 5) módulo de historia
marker = "<script>/* src/main.js */"
sub(marker, "<script>/* CHAMELO " + RC + " · rc17.js */\n" + open(os.path.join(HERE, 'rc17.js'), encoding='utf-8').read() + "\n</script>\n" + marker)
open(sys.argv[2], 'w', encoding='utf-8').write(s)
print('ok', len(s) // 1024 // 1024, 'MB')
