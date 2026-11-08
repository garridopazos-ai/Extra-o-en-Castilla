"""Hablar en juego: Elvira (aceña), Nuño (portazgo), Alfonso (embarcadero). Reposo → habla → escucha, misma posición."""
import sys
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
from PIL import Image
html, out = sys.argv[1], sys.argv[2]
P = Play(html); ev = P.ev
ev('LAB1248.E.rc07.autoDegrade=false')
ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(1200)
clr = "(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];G.ui.sceneTitle=null;})()"
rows = []
for sid, npc in [('acena', 'elvira_aceña'), ('portazgo', 'nuno_casa'), ('embarcadero', 'alfonso')]:
    ev("(()=>{const G=LAB1248.G;G.state.visited['%s']=3;G.changeScene('%s',Object.keys(LAB1248.E.DATA.scenes['%s'].entries)[0]);})()" % (sid, sid, sid))
    P.pg.wait_for_timeout(1800); ev(clr)
    ev("(()=>{const G=LAB1248.G,a=G.npc('%s');G.npcs.hold(a,true);LAB1248.E.actor.setPath(a,[]);a.anim='idle';G.player.x=a.x-260;G.player.y=a.y+10;G.player.path=[];})()" % npc)
    P.pg.wait_for_timeout(800)
    tiles = []
    def snap():
        x = ev("(()=>{const G=LAB1248.G,a=G.npc('%s');return LAB1248.E.rc07.cam.toScreen(a.x-G.S.camX,a.y)})()" % npc)
        P.pg.screenshot(path=out + '/_t.png', clip={'x': max(0, x[0] - 130), 'y': max(0, x[1] - 380), 'width': 260, 'height': 400}); tiles.append(Image.open(out + '/_t.png').copy())
    snap()
    ev("(()=>{const G=LAB1248.G,a=G.npc('%s');G.ui.say(a,'Esto es una frase de prueba bastante larga para ver la animación de hablar.',true);})()" % npc)
    for i in range(5): P.pg.wait_for_timeout(260); snap()
    ev("(()=>{const G=LAB1248.G;G.ui.bubbles=[];G.ui.say(G.player,'Y ahora escucha.',true);})()"); P.pg.wait_for_timeout(500); snap()
    ev(clr); ev("(()=>{const G=LAB1248.G,a=G.npc('%s');G.npcs.hold(a,false);})()" % npc)
    rows.append(tiles)
W = Image.new('RGB', (260 * 7, 400 * 3), 'white')
for r, t in enumerate(rows):
    for c, im in enumerate(t): W.paste(im.convert('RGB'), (c * 260, r * 400))
W.save(out + '/talk_check.png')
print([l for l in P.logs if 'rror' in l][:5])
P.close()
