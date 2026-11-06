import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); P.new(); G='LAB1248.G'
P.ev(f'{G}.goto("embarcadero","from_ribera")'); P.pg.wait_for_timeout(2200); P.settle()
print('Alfonso:',P.ev(f'(a=>[Math.round(a.x),Math.round(a.y),a.facing,a._st])({G}.npc("alfonso"))'))
P.pg.wait_for_timeout(800); P.shot('rc02_alfonso_idle')
# hablar con él: caminar hasta Alfonso, comprobar estados
P.ev(f'(()=>{{const G={G};const n=G.sceneNpcs.find(n=>n.def.id==="alfonso");G.performVerb({{kind:"npc",id:"alfonso",n}},"talk",null)}})()')
tl=[]
for i in range(60):
    P.pg.wait_for_timeout(250)
    tl.append(P.ev(f'(a=>a._st+"|talk="+a.talking+"|listen="+!!a.listening+"|"+Math.round(a.x))({G}.npc("alfonso"))'))
    if P.ev(f'{G}.dialogue.active && {G}.dialogue.phase==="lines"') and i%3==0: P.ev(f'{G}.dialogue.advance()')
    if P.ev(f'{G}.dialogue.active && {G}.dialogue.phase==="options"'): break
print('estados en diálogo:',sorted(set(t.split('|')[0]+'|'+t.split('|')[1] for t in tl)))
P.shot('rc02_alfonso_talk')
idx=P.ev(f'{G}.dialogue.options.findIndex(o=>o.o.text.startsWith("Nada"))'); 
if idx>=0: P.ev(f'{G}.dialogue.choose({idx})')
P.settle()
# hacerlo caminar: ordenar un desplazamiento y capturar fotogramas
P.ev(f'{G}.runner.run([{{walk:[1200,780],who:"alfonso"}}])')
P.ev(f'(()=>{{const a={G}.npc("alfonso");a.hold=false;E1248.actor.setPath(a,[[a.x,a.y],[1250,790]]);}})()')
for k,w in enumerate((350,500,500)):
    P.pg.wait_for_timeout(w); P.shot('rc02_alfonso_walk%d'%k)
print('Alfonso tras caminar:',P.ev(f'(a=>[Math.round(a.x),Math.round(a.y),a.facing,a._st,a.walkDist&&Math.round(a.walkDist)])({G}.npc("alfonso"))'))
print('errores',P.ev('LAB1248.log().filter(e=>e.level!=="info")'),P.logs[:4])
P.close()
