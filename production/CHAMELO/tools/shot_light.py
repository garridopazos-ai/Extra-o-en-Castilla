"""Capturas de detalle de la luz de personajes: la misma pose con efectos SÍ/NO."""
import sys
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
from PIL import Image
html, out = sys.argv[1], sys.argv[2]
P = Play(html)
P.ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(1500)
CASES = [('acena', 1100, 800), ('ribera', 1500, 800), ('chamelo', 760, 760), ('alfar', 900, 790), ('plaza', 700, 780), ('portazgo', 600, 790)]
tiles = []
for sid, x, y in CASES:
    P.ev("(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];G.state.visited['%s']=3;G.changeScene('%s',Object.keys(LAB1248.E.DATA.scenes['%s'].entries)[0]);})()" % (sid, sid, sid))
    P.pg.wait_for_timeout(1500)
    P.ev("(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];G.ui.sceneTitle=null;G.player.x=%d;G.player.y=%d;G.player.path=[];G.player.moving=false;G.player.facing=G.player.lastH='right';})()" % (x, y))
    P.pg.wait_for_timeout(700)
    for on in (True, False):
        P.ev('LAB1248.E.rc07.fxOn=%s' % ('true' if on else 'false'))
        P.pg.wait_for_timeout(250)
        cx = P.ev('LAB1248.G.player.x - LAB1248.G.S.camX')
        P.pg.screenshot(path=out + '/_t.png', clip={'x': max(0, cx - 160), 'y': y - 330, 'width': 320, 'height': 360})
        tiles.append(Image.open(out + '/_t.png').copy())
P.ev('LAB1248.E.rc07.fxOn=true')
print([l for l in P.logs if 'rror' in l][:10])
P.close()
W = Image.new('RGB', (320 * 4 + 30, 360 * 3 + 20), 'white')
for i, t in enumerate(tiles):
    c, r = i % 4, i // 4
    W.paste(t, (c * 320 + (c // 2) * 30, r * 370))
W.save(out + '/luz_detalle.png')
