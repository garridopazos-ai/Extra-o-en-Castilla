"""Capturas para César: llegada al Chamelo (cámara y luz), mapa con el viajero."""
import sys
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
html, out = sys.argv[1], sys.argv[2]
P = Play(html); ev = P.ev
ev('LAB1248.E.rc07.autoDegrade=false')
ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(1500)
ev("(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];const s=G.state;['mingo_robo','trato_mingo','racimo_dado','mingo_sigue','rueda_libre','sabe_aceña','elvira_conoce_aceña'].forEach(f=>s.flags[f]=true);s.inventory.push('mingo');s.visited.orilla=3;G.changeScene('orilla','from_chamelo');})()")
P.pg.wait_for_timeout(2500)
ev("(()=>{const G=LAB1248.G;G.runner.clear();G.ui.bubbles=[];G.ui.notes=[];G.state.visited.chamelo=0;G.changeScene('chamelo','from_orilla');})()")
P.pg.wait_for_timeout(1200)
for i in range(40):
    P.pg.wait_for_timeout(500)
    b = ev("LAB1248.G.ui.bubbles.filter(b=>b.blocking&&!b.done).map(b=>b.actor.id+': '+b.text)")
    if b and 'mingo' in b[0] and ev('LAB1248.E.rc07.cam.z') > 1.02:
        P.pg.wait_for_timeout(700); P.pg.screenshot(path=out + '/hero_chamelo.png'); print('captura', b); break
    ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()')
for i in range(80):
    if ev('LAB1248.idle()'): break
    ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()'); P.pg.wait_for_timeout(300)
P.pg.wait_for_timeout(2500); P.pg.screenshot(path=out + '/hero_chamelo_reparto.png')
print([l for l in P.logs if 'rror' in l][:5])
P.close()
