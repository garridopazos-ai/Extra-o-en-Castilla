import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); tag=sys.argv[2]; P.new()
G='LAB1248.G'
def st(label,r=None):
    print('%-38s scene=%-11s pos=%s inv=%s %s'%(label,P.ev('LAB1248.scene()'),P.ev('(p=>p&&[Math.round(p.x),Math.round(p.y)])(LAB1248.player())'),P.inv(),'' if r in (True,None) else r))
def choose(txt):
    idx=P.ev(f'{G}.dialogue.options.findIndex(o=>o.o.text.startsWith({json.dumps(txt)}))'); 
    if idx<0: print('  !! opción no encontrada:',txt,P.ev(f'{G}.dialogue.options.map(o=>o.o.text)')); return
    P.ev(f'{G}.dialogue.choose({idx})'); return P.settle()
def talk_until_options(kind,id):
    P.verb(kind,id,'talk')
st('inicio')
P.verb('hotspot','pertiga','pick'); P.verb('hotspot','poste','pick'); st('pértiga y cuerda')
P.ev(f'{G}.inventory.combine("cuerda","pertiga")'); P.settle(); st('combinar')
P.verb('hotspot','moneda','use','pertiga_lazo'); st('moneda')
P.verb('hotspot','exit_acena','exit'); st('entrar aceña')
# hablar con Durán
r=P.verb('npc','duran','talk'); st('hablar con Durán ->',r)
print('  duran pos',P.ev('LAB1248.npc("duran")'))
if r=='options':
    choose('¿Qué le pasa'); 
    r=P.settle(); 
    if r=='options': choose('Nada, gracias.')
st('tras hablar')
P.verb('hotspot','rueda','use','pertiga_lazo'); st('palanca en la rueda')
print('  flags',P.flags())
P.shot(tag+'_wheel_done')
# bajo del todo: esperar y coger el saco
P.pg.wait_for_timeout(500); st('esperar reacción')
P.verb('hotspot','exit_ribera','exit'); st('salir a ribera')
P.verb('hotspot','exit_embarcadero','exit'); st('camino al embarcadero')
P.pg.wait_for_timeout(800); P.shot(tag+'_embarcadero')
r=P.verb('npc','alfonso','talk'); st('hablar con Alfonso',r)
if r=='options':
    choose('Te traigo esto'); 
    r=P.settle()
    if r=='options': choose('Aquí tienes la moneda'); r=P.settle()
st('entregas')
print('  flags',P.flags())
P.verb('hotspot','barca','use'); st('subir a la barca')
print('  ended',P.ev('LAB1248.state().ended'),'overlay',P.ev(f'{G}.ui.overlay'))
P.shot(tag+'_end')
print('errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'),P.logs[:5])
P.close()
