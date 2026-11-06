import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); P.new(); tag=sys.argv[2]
P.verb('hotspot','inundacion','look'); P.pg.wait_for_timeout(600); P.shot(tag+'_flood_look')
print('cam',P.ev('LAB1248.G.S.camX'))
# ¿el hotspot es alcanzable con un toque real sobre el agua visible? 
for sx,sy in ((300,780),(200,820),(380,700),(150,650)):
    t=P.ev(f'(()=>{{const t=LAB1248.G.targetAt({sx},{sy});return t&&t.id}})()'); print('toque pantalla',sx,sy,'->',t)
P.close()
