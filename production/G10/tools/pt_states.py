import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); P.new(); G='LAB1248.G'
P.ev(f'{G}.goto("acena","from_ribera")'); P.pg.wait_for_timeout(1800); P.settle()
P.ev('''window.__tl=[];window.__last='';
setInterval(()=>{const G=LAB1248.G;const a=G.npc('duran');if(!a)return;
 const k=(a._st||'?')+'|talk='+a.talking+'|listen='+!!a.listening+'|hold='+a.hold+'|dlg='+(G.dialogue.active?G.dialogue.phase:'-');
 if(k!==window.__last){window.__last=k;window.__tl.push([Math.round(performance.now()),k]);}},50);''')
# toque real sobre Durán para hablar: camina hacia él
n=P.ev(f'(()=>{{const a={G}.npc("duran");return [a.x,a.y]}})()'); print('Durán en',n)
P.ev(f'(()=>{{const G={G};const n=G.sceneNpcs.find(n=>n.def.id==="duran");G.performVerb({{kind:"npc",id:"duran",n}},"talk",null)}})()')
# avanzar a mano: esperar líneas de Durán, luego del jugador, luego opciones
def wait_phase(ph,t=15):
    for _ in range(t*10):
        if P.ev(f'{G}.dialogue.active && {G}.dialogue.phase==="{ph}"'): return True
        P.pg.wait_for_timeout(100)
    return False
for i in range(40):
    if P.ev(f'{G}.dialogue.active && {G}.dialogue.phase==="options"'): break
    P.pg.wait_for_timeout(700)
    if i==1: P.ev(f'{G}.dialogue.skip()')      # saltar el resto de líneas de golpe
    else: P.ev(f'{G}.dialogue.advance()')
print('opciones:',P.ev(f'{G}.dialogue.options.map(o=>o.o.text)'))
P.pg.wait_for_timeout(600)
P.ev(f'{G}.dialogue.choose(1)')          # «¿Dónde estamos?» -> habla jugador y luego Durán
for i in range(12):
    P.pg.wait_for_timeout(500); P.ev(f'{G}.dialogue.advance()')
    if P.ev(f'{G}.dialogue.phase==="options"'): break
P.pg.wait_for_timeout(400)
P.ev(f'{G}.dialogue.choose({G}.dialogue.options.findIndex(o=>o.o.text.startsWith("Nada")))')
for i in range(20):
    if not P.ev(f'{G}.dialogue.active'): break
    P.pg.wait_for_timeout(600); P.ev(f'{G}.dialogue.skip()' if i%2 else f'{G}.dialogue.advance()')
P.pg.wait_for_timeout(1500)
print('dialogo activo:',P.ev(f'{G}.dialogue.active'))
prev=None
for t,k in P.ev('window.__tl'):
    print(t,k)
print('errores',P.ev('LAB1248.log().filter(e=>e.level!=="info")'))
P.close()
