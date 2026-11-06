import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G11/shots/'
P=Play(sys.argv[1]); tag=sys.argv[2]; P.new(); P.pg.wait_for_timeout(1500)
P.shot(tag+'_ux_start')
def click_btn(id):
    b=P.ev(f'LAB1248.button({json.dumps(id)})'); c=P.ev(f'LAB1248.toClient({b["x"]},{b["y"]})'); P.pg.mouse.click(c['x'],c['y'])
print('hint button',P.ev('LAB1248.button("hint")'))
P.settle(40); click_btn('hint'); P.pg.wait_for_timeout(700); P.shot(tag+'_ux_hint1'); P.settle(40)
P.verb('hotspot','talavera','look'); print('sabe_cruzar',P.ev('!!LAB1248.state().flags.sabe_cruzar'))
# caminar con el jugador y capturar fotogramas
P.ev('LAB1248.tapWorld(1200,800)'); frames=[]
from PIL import Image
for i in range(8):
    P.pg.wait_for_timeout(180); P.pg.screenshot(path=pt_lib.SH+'w.png'); frames.append(Image.open(pt_lib.SH+'w.png').copy())
pl=P.ev('LAB1248.player()'); print('player',pl)
# recorte alrededor del jugador (pantalla)
import math
W=Image.new('RGB',(8*200,360))
for i,f in enumerate(frames):
    W.paste(f.crop((0,380,200,740)) if False else f.crop((f.width//2-100,450,f.width//2+100,810)),(i*200,0))
W.save(pt_lib.SH+tag+'_walk_strip.png')
P.settle(40)
# aceña desde la rueda exterior
P.verb('hotspot','rueda_ext','use','pertiga_lazo') if 'pertiga_lazo' in P.inv() else None
r=P.verb('hotspot','rueda_ext','exit'); print('tras tocar rueda exterior ->',P.ev('LAB1248.scene()'))
print('errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'),P.logs[:5])
P.close()
