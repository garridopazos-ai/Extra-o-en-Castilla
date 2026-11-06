import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G11/shots/'
P=Play(sys.argv[1]); tag=sys.argv[2]; P.new()
G='LAB1248.G'
def st(label,r=None):
    print('%-30s %-11s obj=[%s] %s'%(label,P.ev('LAB1248.scene()'),P.ev('LAB1248.G.ui.objective()'),'' if r in (True,None) else r))
def choose(txt):
    idx=P.ev(f'{G}.dialogue.options.findIndex(o=>o.o.text.startsWith({json.dumps(txt)}))')
    if idx<0: print('  !! opción no encontrada:',txt,P.ev(f'{G}.dialogue.options.map(o=>o.o.text)')); return 'noopt'
    P.ev(f'{G}.dialogue.choose({idx})'); return P.settle()
def talk(npc,*opts):
    r=P.verb('npc',npc,'talk')
    for o in opts:
        if r!='options': print('  !! no hay opciones para',o,r); return r
        r=choose(o)
    while r=='options':
        opts=P.ev(f'{G}.dialogue.options.map(o=>o.o.text)')
        bye=[o for o in opts if o.split()[0].strip('.,') in ('Hasta','Adiós','Luego','Nada','Ya','Siento')]
        r=choose(bye[0] if bye else opts[-1])
    return r
def give(npc,item): return P.verb('npc',npc,'give',item)
def need(flag):
    ok=P.ev(f'!!LAB1248.state().flags[{json.dumps(flag)}]'); print('  [flag %s = %s]'%(flag,ok)); return ok
# --- tramo 1 (ya probado) ---
P.verb('hotspot','pertiga','pick'); P.verb('hotspot','poste','pick')
P.ev(f'{G}.inventory.combine("cuerda","pertiga")'); P.settle()
P.verb('hotspot','moneda','use','pertiga_lazo'); P.verb('hotspot','exit_acena','exit')
r=P.verb('npc','duran','talk'); 
if r=='options': choose('¿Qué le pasa'); r=P.settle()
if r=='options': choose('Nada, gracias.')
P.verb('hotspot','rueda','use','pertiga_lazo'); P.pg.wait_for_timeout(600); P.settle()
P.verb('hotspot','exit_ribera','exit'); P.verb('hotspot','exit_embarcadero','exit'); P.pg.wait_for_timeout(600)
r=P.verb('npc','alfonso','talk')
if r=='options': choose('Te traigo esto'); r=P.settle()
if r=='options': choose('Aquí tienes la moneda'); r=P.settle()
st('tramo 1 hecho'); need('barca_libre')
# --- travesía ---
P.verb('hotspot','barca','use'); st('barca ->')
P.pg.wait_for_timeout(1000); P.settle(60); st('tras travesía'); need('cruzado')
P.shot(tag+'_puerta')
# --- puerta del río ---
P.verb('hotspot','exit_plaza','exit'); st('intento entrar sin pase')
P.verb('hotspot','tarifas','look'); P.verb('hotspot','mojon','look')
P.verb('hotspot','ladrillos','pick'); P.verb('hotspot','viga','pick'); st('cuña y viga')
r=talk('yucaf'); st('hablar con Yuçaf',r)
P.verb('hotspot','carreta','use','pertiga_lazo' if 'pertiga_lazo' in P.inv() else 'viga'); st('palanca sin cuña (debe fallar)')
need('carreta_libre')
P.verb('hotspot','carreta','use','cuna'); st('calzar')
P.shot(tag+'_carreta')
P.verb('hotspot','carreta','use','viga'); st('palanca con viga'); P.pg.wait_for_timeout(800); P.settle(60); st('tras reacciones')
need('carreta_libre'); need('nuno_conoce'); need('pase_puerta'); need('tiene_sello_gremio')
P.shot(tag+'_nuno_gate')
P.verb('hotspot','bando','look'); P.verb('hotspot','bando','pick'); st('bando'); 
# --- plaza ---
P.verb('hotspot','exit_plaza','exit'); st('a la plaza'); P.pg.wait_for_timeout(600); P.settle(); P.shot(tag+'_plaza')
talk('sancha','¿Sabe algo de Fray Benito'); need('sabe_badajo')
talk('lope'); 
r=give('lope','cantaro'); st('trueque con Lope',r); need('tiene_badajo')
talk('pregonero','¿Cómo llego a Don Nuño')
P.verb('hotspot','exit_iglesia','exit'); st('iglesia'); P.shot(tag+'_iglesia')
give('benito','badajo'); st('badajo a Benito'); need('tiene_sello_parroquia')
P.verb('hotspot','exit_plaza','exit'); st('plaza otra vez')
# --- portazgo ---
P.verb('hotspot','exit_portazgo','exit'); st('portazgo'); P.shot(tag+'_portazgo')
P.verb('hotspot','sello','pick'); st('sello sin distraer (debe fallar)'); need('sello_cogido')
r=give('nuno_casa','telefono'); st('espejo a Nuño',r); need('nuno_ensimismado')
P.pg.wait_for_timeout(500); P.shot(tag+'_nuno_espejo')
P.verb('hotspot','sello','pick'); st('sello alguacil'); need('tiene_sello_alguacil')
P.verb('hotspot','exit_plaza','exit')
# --- audiencia ---
P.verb('hotspot','exit_audiencia','exit'); st('audiencia'); P.shot(tag+'_audiencia')
r=talk('mayordomo','Presento mi licencia'); st('vista pública',r); need('final_listo')
P.pg.wait_for_timeout(500); P.settle(90); st('tras final'); P.shot(tag+'_alfar')
print('  inv',P.inv())
# --- epílogo ---
P.settle(90)
P.verb('hotspot','horno','use','telefono'); st('horno'); P.pg.wait_for_timeout(2500)
print('  ended',P.ev('LAB1248.state().ended'),'overlay',P.ev(f'{G}.ui.overlay'))
P.shot(tag+'_end')
print('errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'))
print('logs:',[l for l in P.logs if not l.startswith('log') and not l.startswith('info')][:10])
P.close()
