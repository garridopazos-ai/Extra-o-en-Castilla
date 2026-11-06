import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); P.new(); G='LAB1248.G'
def pl(): return P.ev('(p=>[Math.round(p.x),Math.round(p.y)])(LAB1248.player())')
def tap(x,y):
    P.ev(f'LAB1248.tapWorld({x},{y})'); P.pg.wait_for_timeout(500); return P.settle()
def look(l): print('%-30s pos=%s cam=%s inv=%s flags=%s'%(l,pl(),P.ev(f'{G}.S.camX'),P.inv(),[f for f in P.flags() if f.endswith('cogida')]))
tap(940,760); look('pértiga')
tap(1972,600); look('poste')
P.ev(f'{G}.inventory.combine("cuerda","pertiga")'); P.settle(); look('combinar')
# moneda sin objeto
tap(1760,630); look('moneda con la mano')
# moneda con el lazo
P.ev(f'{G}.inventory.selected="pertiga_lazo"'); tap(1760,630); look('moneda con lazo')
tap(2030,410); print('escena',P.ev('LAB1248.scene()'))
print('err',P.ev('LAB1248.log().filter(e=>e.level!=="info")'))
P.close()
