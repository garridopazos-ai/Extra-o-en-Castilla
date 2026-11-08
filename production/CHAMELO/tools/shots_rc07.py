"""Capturas de RC07 a tamaño real: atmósfera por escena y mapa con la posición exacta."""
import sys
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
html, out = sys.argv[1], sys.argv[2]
P = Play(html); ev = P.ev
ev('LAB1248.E.rc07.autoDegrade=false')
ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(1500)
ev("(()=>{const s=LAB1248.G.state;['mingo_robo','trato_mingo','racimo_dado','mingo_sigue','rueda_libre','sabe_aceña','elvira_conoce_aceña'].forEach(f=>s.flags[f]=true);s.inventory.push('mingo');})()")
def go(sid, entry=None, x=None, y=None, wait=2500):
    ev("(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];G.state.visited['%s']=3;G.changeScene('%s',%s);})()" % (sid, sid, ("'%s'" % entry) if entry else "Object.keys(LAB1248.E.DATA.scenes['%s'].entries)[0]" % sid))
    P.pg.wait_for_timeout(1400)
    ev("(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];G.ui.sceneTitle=null;})()")
    if x is not None: ev("(()=>{const G=LAB1248.G;G.player.x=%d;G.player.y=%d;G.player.path=[];G.player.moving=false;})()" % (x, y))
    P.pg.wait_for_timeout(wait)
for sid, e, x, y in [('acena', None, 1100, 790), ('chamelo', None, 760, 760), ('alfar', None, 1100, 790), ('portazgo', None, 600, 790), ('orilla', 'from_ribera', 2300, 780), ('ribera', 'from_orilla', 900, 800)]:
    go(sid, e, x, y); P.pg.screenshot(path=out + '/atm_' + sid + '.png')
    if sid in ('orilla', 'chamelo'):
        ev("LAB1248.E.journey.open(LAB1248.G, LAB1248.G.ui)"); P.pg.wait_for_timeout(600); P.pg.screenshot(path=out + '/mapa_' + sid + '.png'); ev("LAB1248.E.journey.close(LAB1248.G, LAB1248.G.ui)")
ev("LAB1248.E.journey.setDestination('plaza')"); ev("LAB1248.E.journey.open(LAB1248.G, LAB1248.G.ui)"); P.pg.wait_for_timeout(600); P.pg.screenshot(path=out + '/mapa_ruta.png')
print([l for l in P.logs if 'rror' in l][:10])
P.close()
