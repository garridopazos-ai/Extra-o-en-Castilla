import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); P.ev("LAB1248.G.goto('acena','from_ext')"); P.pg.wait_for_timeout(1500)
print(P.ev("LAB1248.G.S.def.layers.map(l=>l.id+':'+l.z+':'+(l.sortY||''))"))
print(P.ev("(()=>{const im=LAB1248.E.assets.get('acena:muela_frente');return im?[im.width,im.height]:null})()"))
print(P.ev("LAB1248.G.S.layers.map(l=>l.key+':'+(LAB1248.E.assets.get(l.key)?LAB1248.E.assets.get(l.key).width:'NO'))")); print(P.ev("LAB1248.G.actorsInScene().map(a=>a.id+'@'+Math.round(a.y))"))
print(P.ev("JSON.stringify((LAB1248.G.S.sortLayers||LAB1248.G.S.sorted||[]).map(l=>l.id||l.def&&l.def.id))"))
P.close()
