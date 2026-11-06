import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
P=Play(sys.argv[1]); P.new(); P.pg.wait_for_timeout(500)
P.pg.mouse.click(1500,40) if False else None
P.ev("LAB1248.G.goto('acena','from_ribera')"); P.settle(40)
P.pg.mouse.click(300,300)  # desbloquea audio (+ arranca música)
P.pg.wait_for_timeout(1500)
P.ev('LAB1248.resetPerf()'); P.pg.wait_for_timeout(6000)
print(sys.argv[2],P.ev('LAB1248.perf()'), P.ev('LAB1248.E.audio.music'))
# fotograma de Durán en movimiento: ¿cambia a ritmo regular?
P.ev('LAB1248.resetPerf()'); idx=[]
for i in range(40):
    idx.append(P.ev('(()=>{const n=LAB1248.G.sceneNpcs.find(n=>n.def.id==="duran");return n&&[Math.round(n.actor.x),Math.round(n.actor.walkDist||0),n.actor.anim]})()')); P.pg.wait_for_timeout(100)
print(idx[:40])
P.close()
