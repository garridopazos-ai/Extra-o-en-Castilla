# -*- coding: utf-8 -*-
"""Mapa v2 para CHAMELO RC07 (sobre production/G11/tools/make_map.py):
- sin el «¡TÚ ESTÁS AQUÍ!» pintado (ahora lo marca el juego en vivo, en el punto exacto) ni el viajero dibujado junto al portal;
- añade la Isla del Chamelo (casa de Raimundo, colmenas, vado) y el Soto de los Sifones en la orilla sur.
Uso: python make_map_v2.py  → art/portada/mapa_talavera_v2.svg/.jpg"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..', '..', '..')
src = open(os.path.join(ROOT, 'production', 'G11', 'tools', 'make_map.py'), encoding='utf-8').read()
def rep(old, new):
    global src
    assert src.count(old) == 1, old[:60]; src = src.replace(old, new)
# 1) fuera el viajero pintado (el juego lo dibuja en su sitio real)
i = src.index("A(ell(px+22,py+2,7,2.5"); j = src.index("# el móvil") + len("# el móvil")
src = src[:i] + "pass" + src[j:]
# 2) el lazo rojo «¡TÚ ESTÁS AQUÍ!» pasa a ser un rótulo de lugar
rep("A(ribbon('¡TÚ ESTÁS AQUÍ!',300,724,206,36,'#c73a2c','#fff6dc',24,'#8e2418'))",
    "A(label('Aquí apareció un extraño',300,708,16)); A(label('(y aún no sabe por qué)',300,724,13))")
# 3) el rótulo del río se aparta para dejar sitio a la isla
rep("A(text('Río Tajo',960,575,28,", "A(text('Río Tajo',806,566,28,")
# 4) Isla del Chamelo y vado
rep("# ---- el monstruo del Tajo (vegetariano)", """# ---- Isla del Chamelo: casa de Raimundo, colmenas y el vado de piedras
ix,iy=990,568
A(ell(ix,iy+3,48,14,'#c9b27a',OUTL,1.4)); A(ell(ix,iy,41,10.5,'#86b552',OUTL,1.1))
A(tree(ix-28,iy+3,.5,'round')); A(tree(ix+32,iy+4,.46,'round'))
A(house(ix+8,iy+5,22,13,'#b98a3a','#efe0b8'))
A(path('M%.1f,%.1f q3,-6 6,-2 q3,-7 7,-1'%(ix+13,iy-14),'none','#d6e3ea',1.6,'opacity=".9"'))   # humo de la chimenea
for k in range(3): A(path('M%.1f,%.1f a5,6 0 0 1 10,0 z'%(ix-22+k*10,iy+7),'#e9a523',OUTL,1)+path('M%.1f,%.1f h7'%(ix-20.5+k*10,iy+3.5),'none',OUTL,.8))
for bx,by in [(ix-26,iy-8),(ix-14,iy-12),(ix-4,iy-7)]: A(circ(bx,by,1.7,'#f2c400',OUTL,.7))
for k,(x,y) in enumerate([(978,585),(972,594),(967,603),(963,612)]): A(ell(x,y,4.4,2.3,'#d9c7a0',OUTL,.8))
# ---- el monstruo del Tajo (vegetariano)""")
# 5) rótulos nuevos
rep("('Galeón perdido',1440,612,17)", "('Soto de los Sifones',836,640,17),('(ciego y parra incluidos)',836,655,13),('Isla del Chamelo',1004,600,16),('(abejas con mal genio)',1004,615,12),('Galeón perdido',1440,612,17)")
# 6) salida
rep("open(os.path.join(OUT,'mapa_talavera.svg')", "open(os.path.join(OUT,'mapa_talavera_v2.svg')")
src = src.replace("os.path.join(OUT,'mapa_talavera.jpg')", "os.path.join(OUT,'mapa_talavera_v2.jpg')")
src = src.replace("os.path.join(os.path.dirname(__file__),'..','..','..','art','portada')", repr(os.path.join(ROOT, 'art', 'portada')))
sys.argv = [sys.argv[0]]
exec(compile(src, 'make_map_v2', 'exec'), {'__name__': '__main__', '__file__': os.path.join(ROOT, 'production', 'G11', 'tools', 'make_map.py')})
