"""RC09: desbordamiento, cuerda/pértiga, destello, texto de bocadillos y tira de Durán andando (pies apoyados)."""
import sys
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
from PIL import Image
html, out = sys.argv[1], sys.argv[2]
P = Play(html); ev = P.ev
ev('LAB1248.E.rc07.autoDegrade=false')
ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(1200)
clr = "(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];G.ui.sceneTitle=null;})()"
ev(clr)
ev("(()=>{const G=LAB1248.G;G.player.x=1000;G.player.y=815;G.S.camF=0;G.S.camX=0;})()"); P.pg.wait_for_timeout(500)
ev("LAB1248.G.ui.say(LAB1248.G.player, 'Mi móvil dice «Has llegado». Me gustaría saber adónde.', true)"); P.pg.wait_for_timeout(900)
P.pg.screenshot(path=out + '/c9_ribera_inundada.png')
ev(clr); ev("(()=>{const G=LAB1248.G;G.player.x=1750;G.player.y=815;G.S.camF=1000;G.S.camX=1000;})()"); P.pg.wait_for_timeout(600)
P.pg.screenshot(path=out + '/c9_ribera_cuerda.png')
ev("(()=>{const G=LAB1248.G;G.state.flags.rueda_libre=true;G.player.x=1000;G.S.camF=0;G.S.camX=0;})()"); P.pg.wait_for_timeout(600)
P.pg.screenshot(path=out + '/c9_ribera_seca.png')
# Durán andando en la aceña: tira de fotogramas
ev("(()=>{const G=LAB1248.G;G.state.visited.acena=3;G.changeScene('acena',Object.keys(LAB1248.E.DATA.scenes.acena.entries)[0]);})()"); P.pg.wait_for_timeout(1800); ev(clr)
ev("(()=>{const G=LAB1248.G;const d=G.npc('duran');d.x=1250;d.y=780;LAB1248.E.actor.setPath(d,[[450,780]]);})()")
tiles = []
for i in range(14):
    P.pg.wait_for_timeout(110)
    x = ev("LAB1248.G.npc('duran').x - LAB1248.G.S.camX")
    P.pg.screenshot(path=out + '/_d.png', clip={'x': max(0, x - 110), 'y': 470, 'width': 220, 'height': 340})
    tiles.append(Image.open(out + '/_d.png').copy())
W = Image.new('RGB', (220 * 7, 340 * 2))
for i, t in enumerate(tiles): W.paste(t, ((i % 7) * 220, (i // 7) * 340))
W.save(out + '/c9_duran_tira.png')
print([l for l in P.logs if 'rror' in l][:5])
P.close()
