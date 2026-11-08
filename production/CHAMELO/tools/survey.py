"""Recorrido visual de una build: una captura por escena y volcado de personajes/escenas."""
import sys, json
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
html = sys.argv[1]; out = sys.argv[2]
P = Play(html)
info = P.ev('''(()=>{const D=LAB1248.E.DATA;const ch={};for(const [k,c] of Object.entries(D.characters)){ch[k]={rig:!!c.rig,src:c.sprite&&c.sprite.src,anims:c.sprite&&c.sprite.sheet?Object.keys(c.sprite.sheet.anims):null,height:c.height}}
const sc={};for(const [k,s] of Object.entries(D.scenes)){sc[k]={w:s.width,cam:s.camera,amb:s.ambientSound,name:s.name,layers:s.layers.map(l=>l.id+':'+(l.src||l.placeholder)),npcs:Object.values(D.npcs).filter(n=>n.scene===k).map(n=>n.id)}}
return {ch,sc,start:D.start}})()''')
json.dump(info, open(out + '/info.json', 'w'), ensure_ascii=False, indent=1)
P.ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(1500)
for sid in info['sc']:
    P.ev('LAB1248.G.runner.clear(); LAB1248.G.dialogue.close(); LAB1248.G.ui.bubbles=[]; LAB1248.G.ui.notes=[]')
    P.ev('LAB1248.G.state.visited[%r]=1; LAB1248.G.changeScene(%r, Object.keys(LAB1248.E.DATA.scenes[%r].entries)[0])' % (sid, sid, sid))
    P.pg.wait_for_timeout(1400)
    P.ev('LAB1248.G.runner.clear(); LAB1248.G.dialogue.close(); LAB1248.G.ui.bubbles=[]; LAB1248.G.ui.notes=[]; LAB1248.G.ui.overlay=null')
    P.pg.wait_for_timeout(500)
    P.shot_path = out + '/' + sid + '.png'
    P.pg.screenshot(path=P.shot_path)
P.ev("LAB1248.G.ui.overlay='map'"); P.pg.wait_for_timeout(500); P.pg.screenshot(path=out + '/_mapa.png')
print('\n'.join(l for l in P.logs if 'rror' in l or 'PAGEERR' in l)[:3000])
P.close()
