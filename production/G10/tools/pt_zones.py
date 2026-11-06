import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); tag=sys.argv[2]; P.new(); G='LAB1248.G'
P.ev(f'{G}.debug.on=true')
# dibuja hotspots a mano sobre el lienzo: usamos la capa debug del propio juego
for name,x,y in (('right',1700,805),('mid',1000,805),('left',300,780)):
    P.ev(f'{G}.runner.run([{{walk:[{x},{y}]}}])')
    for _ in range(80):
        P.pg.wait_for_timeout(200)
        if P.ev('LAB1248.idle()'): break
    P.pg.wait_for_timeout(500); P.shot(f'{tag}_zones_{name}')
    print(name,'cam',P.ev(f'{G}.S.camX'))
P.close()
