"""Recorrido completo del laboratorio, en los dos órdenes: A) tronco antes de Elvira, B) tronco solo después."""
import sys, json; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/LAB_ACENA/shots/'
F=sys.argv[1]; ok=[]
def chk(name, cond): ok.append((name, bool(cond))); print(('OK  ' if cond else 'FALLO ')+name)
def fl(P): return P.ev("Object.keys(LAB1248.state().flags)")
def pos(P): return P.ev("[Math.round(LAB1248.G.player.x),Math.round(LAB1248.G.player.y),LAB1248.G.player.lastH]")
def choose(P, txt):
    o=P.ev("(LAB1248.G.dialogue.options||[]).map(o=>o.o.text)")
    i=[k for k,t in enumerate(o) if t.startswith(txt)]
    if not i: print('   opciones:',o); return False
    P.ev(f"LAB1248.G.dialogue.choose({i[0]})"); return P.settle(80)
def walk_try(P, x, y):
    P.ev(f"LAB1248.G.walkPlayer({x},{y})"); P.pg.wait_for_timeout(300); P.settle(30); P.pg.wait_for_timeout(2500)
    return pos(P)
for orden in ('A','B'):
    print('==== orden', orden)
    P=Play(F); P.ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(800); P.settle(60)
    chk(orden+' empieza fuera', P.ev("LAB1248.scene()")=='acena_ext')
    # agua: el Tajo y el caz no son transitables
    chk(orden+' caz no transitable', not P.ev("LAB1248.G.S.nav.inside(850,640)"))
    chk(orden+' río no transitable', not P.ev("LAB1248.G.S.nav.inside(400,560)"))
    p=walk_try(P, 860, 640); chk(orden+' tocar el caz no mete al viajero en el agua (y>=690): %s'%p, p[1]>=690)
    P.verb('hotspot','rueda','look'); P.settle()
    if orden=='A':
        P.verb('hotspot','tronco','look'); P.settle(); chk('A tronco visto antes', 'tronco_visto' in fl(P))
    P.verb('hotspot','puerta','exit'); P.pg.wait_for_timeout(1200); P.settle(60)
    chk(orden+' dentro', P.ev("LAB1248.scene()")=='acena'); p=pos(P); chk(orden+' aparece junto a la puerta interior %s'%p, abs(p[0]-1490)<40 and abs(p[1]-712)<30)
    if orden=='A': P.shot('lab_interior_llegada')
    chk(orden+' muela no transitable', not P.ev("LAB1248.G.S.nav.inside(770,700)"))
    p=walk_try(P, 770, 700); chk(orden+' no atraviesa la muela %s'%p, not P.ev(f"(()=>{{const x={p[0]},y={p[1]};return x>630&&x<912&&y>652&&y<746}})()"))
    r=P.verb('npc','elvira','talk'); P.settle(80)
    if orden=='A': P.shot('lab_elvira')
    choose(P,'Estoy perdido'); 
    choose(P,'¿Por qué está parada')
    chk(orden+' pista dada y gag de Durán', all(k in fl(P) for k in ('pista_elvira','gag_duran')))
    if P.ev("LAB1248.G.dialogue.active"): choose(P,'Hasta luego')
    P.verb('hotspot', P.ev("LAB1248.G.S.hotspots().find(h=>h.exit).id"), 'exit'); P.pg.wait_for_timeout(1200); P.settle(60)
    p=pos(P); chk(orden+' sale junto al umbral exterior %s'%p, P.ev("LAB1248.scene()")=='acena_ext' and abs(p[0]-1256)<40 and abs(p[1]-712)<30)
    P.verb('hotspot','tronco','look'); P.settle(60); chk(orden+' tronco confirma la pista', 'tronco_confirmado' in fl(P))
    if orden=='A': P.shot('lab_exterior_final')
    P.verb('hotspot','puerta','exit'); P.pg.wait_for_timeout(1200); P.settle(60)
    P.verb('npc','elvira','talk'); P.settle(60)
    o=P.ev("(LAB1248.G.dialogue.options||[]).map(o=>o.o.text)"); print('   opciones al volver:',o)
    chk(orden+' reconoce la confirmación', any(t.startswith('Tenías razón') for t in o))
    choose(P,'Tenías razón'); 
    if P.ev("LAB1248.G.dialogue.active"): choose(P,'Hasta luego')
    d=P.ev("(()=>{const n=LAB1248.G.sceneNpcs.find(n=>n.def.id==='duran');return [Math.round(n.actor.x),Math.round(n.actor.y)]})()")
    chk(orden+' el gag no se repite (Durán en su sitio %s)'%d, abs(d[0]-1290)<30)
    print('   banderas:', fl(P)); print('   errores:', P.errors if hasattr(P,'errors') else '', P.logs[-3:])
    P.close()
print('RESUMEN', sum(1 for n,c in ok if c), '/', len(ok))
