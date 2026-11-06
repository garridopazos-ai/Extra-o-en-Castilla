import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
html=sys.argv[1]; tag=sys.argv[2]
P=Play(html); P.new()
print('start',P.ev('LAB1248.player()'),'scene',P.ev('LAB1248.scene()'))
def step(label,fn):
    r=fn(); print('%-34s -> scene=%s player=%s inv=%s'%(label,P.ev('LAB1248.scene()'),P.ev('(p=>p&&[Math.round(p.x),Math.round(p.y)])(LAB1248.player())'),P.inv()),r if r not in (True,None) else '')
# hotspots de la escena: ¿alcanzables desde el inicio?
for hid in ('pertiga','poste','moneda','exit_acena','inundacion','exit_embarcadero'):
    r=P.ev('''(()=>{const G=LAB1248.G,h=G.S.def.hotspots.find(h=>h.id==="%s");const wt=h.walkTo;const r=G.S.nav.findPath(G.player.x,G.player.y,wt[0],wt[1]);
      return {walkTo:wt,reach:!!r&&!r.partial&&Math.hypot(r.target[0]-wt[0],r.target[1]-wt[1])<40,target:r&&r.target,partial:r&&r.partial}})()'''%hid)
    print('hotspot',hid,r)
step('mirar inundación',lambda:P.verb('hotspot','inundacion','look'))
step('intentar ir al embarcadero',lambda:P.verb('hotspot','exit_embarcadero','exit'))
step('coger pértiga',lambda:P.verb('hotspot','pertiga','pick'))
step('coger cuerda',lambda:P.verb('hotspot','poste','pick'))
P.ev('LAB1248.G.inventory.combine("cuerda","pertiga")'); P.settle(); print('combo ->',P.inv())
step('moneda con pértiga+lazo',lambda:P.verb('hotspot','moneda','use','pertiga_lazo'))
P.shot(tag+'_r1')
step('entrar en la aceña',lambda:P.verb('hotspot','exit_acena','exit'))
P.pg.wait_for_timeout(800); P.shot(tag+'_r2_acena')
print('errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'),P.logs[:5])
P.close()
