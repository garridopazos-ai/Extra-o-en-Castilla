import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
from PIL import Image
P=Play(sys.argv[1]); tag=sys.argv[2]; P.new(); G='LAB1248.G'
P.ev(f'{G}.goto("acena","from_ribera")'); P.pg.wait_for_timeout(1800); P.settle()
# dejar a Durán quieto en un punto despejado y mirar a la derecha/izquierda
P.ev(f'''(()=>{{const n={G}.npcs.get("duran");{G}.npcs.hold(n.actor,true);n.actor.x=900;n.actor.y=790;n.actor.facing=n.actor.lastH="left";{G}.player.x=1300;{G}.player.y=790;}})()''')
crops=[]
def snap(label,setup):
    P.ev(f'(()=>{{const a={G}.npc("duran");{setup}}})()'); P.pg.wait_for_timeout(1100)
    P.pg.screenshot(path=SH+f'{tag}_d_{label}.png',clip={'x':760,'y':440,'width':300,'height':400})
    crops.append(Image.open(SH+f'{tag}_d_{label}.png'))
snap('idle','a.talking=false;a.listening=false;a.anim="idle"')
snap('talk','a.talking=true;a.listening=false')
snap('talk_r','a.facing=a.lastH="right"')
snap('listen','a.talking=false;a.listening=true;a.facing=a.lastH="left"')
snap('work','a.listening=false;a.anim="work"')
P.ev(f'(()=>{{const a={G}.npc("duran");a.listening=false;a.talking=false;{G}.npcs.hold(a,false)}})()')
# marcha: de 700 a 1200
P.ev(f'{G}.runner.run([{{npcWalk:["duran",700,790]}}])'); P.pg.wait_for_timeout(2500)
snap('walk','void 0')
W=sum(c.width for c in crops); o=Image.new('RGB',(W,400)); x=0
for c in crops: o.paste(c,(x,0)); x+=c.width
o.save(SH+f'{tag}_duran_states.png')
print('stride/fps ok; errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'),P.logs[:4])
P.close()
