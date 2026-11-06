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
# --- tramo 1 ---
P.verb('hotspot','pertiga','pick'); P.verb('hotspot','poste','pick')
P.ev(f'{G}.inventory.combine("cuerda","pertiga")'); P.settle()
P.verb('hotspot','moneda','use','pertiga_lazo'); P.verb('hotspot','exit_acena','exit')
r=P.verb('npc','duran','talk')
if r=='options': choose('¿Qué le pasa'); r=P.settle()
if r=='options': choose('Nada, gracias.')
P.verb('hotspot','rueda','use','pertiga_lazo'); P.pg.wait_for_timeout(600); P.settle()
st('rueda'); need('rueda_libre')
P.verb('hotspot','exit_ribera','exit'); P.verb('hotspot','exit_embarcadero','exit'); P.pg.wait_for_timeout(600)
talk('alfonso','¿Y cómo se entra'); st('alfonso: reto')
P.verb('hotspot','barca','use','pertiga_lazo'); st('cabo suelto'); need('barca_libre')
# --- travesía ---
P.verb('hotspot','barca','use'); P.pg.wait_for_timeout(1000); P.settle(60); st('tras travesía'); need('cruzado')
P.shot(tag+'_puerta')
# --- puerta del río: los dos Giles ---
P.verb('hotspot','exit_plaza','exit'); st('intento entrar')
r=talk('gil_a'); st('gil sin reglamento',r)
P.verb('hotspot','tarifas','look'); st('reglamento'); need('regla_postigo')
r=talk('gil_a','Para demostrarlo'); P.pg.wait_for_timeout(800); P.settle(60); st('paradoja',r); need('pase_puerta'); need('nuno_conoce')
P.verb('hotspot','bando','look'); P.verb('hotspot','bando','pick'); st('cartel'); print('  inv',P.inv())
# carreta opcional
P.verb('hotspot','ladrillos','pick'); P.verb('hotspot','viga','pick'); P.verb('hotspot','carreta','use','cuna'); P.verb('hotspot','carreta','use','viga'); P.pg.wait_for_timeout(600); P.settle(60); st('carreta (opcional)'); need('carreta_libre')
# --- plaza: Lope ---
P.verb('hotspot','exit_plaza','exit'); P.pg.wait_for_timeout(600); P.settle(); st('plaza'); P.shot(tag+'_plaza')
talk('lope','¿Hay un imán'); st('lope 1')
P.verb('hotspot','banco_lope','look'); P.verb('hotspot','banco_lope','use','telefono'); st('hilo'); need('hilo_visto'); P.shot(tag+'_hilo')
talk('lope','La llamas con la boca'); st('lope desenmascarado'); need('lope_derrotado')
P.verb('hotspot','exit_audiencia','exit'); st('vista sin convocar (debe fallar)')
# --- iglesia: campana ---
P.verb('hotspot','exit_iglesia','exit'); st('iglesia')
give('benito','badajo'); st('badajo'); need('campana_arreglada')
r=P.verb('hotspot','campana','use'); print('  toque',r)
choose('Dar un toque'); st('un toque')
choose('Dar tres toques'); P.settle(); st('tres toques'); need('vista_convocada')
P.verb('hotspot','exit_plaza','exit')
# --- portazgo: retrato ---
P.verb('hotspot','exit_portazgo','exit'); st('portazgo')
P.verb('hotspot','sello','pick'); st('sello sin distraer'); need('sello_cogido')
P.verb('hotspot','atril_nuno','use','telefono'); P.pg.wait_for_timeout(600); P.settle(); st('retrato'); need('nuno_ensimismado'); P.shot(tag+'_retrato')
P.verb('hotspot','sello','pick'); P.pg.wait_for_timeout(600); P.settle(); st('sello'); need('sello_cogido')
P.verb('hotspot','exit_plaza','exit')
# --- mapa de viaje: destino alfar ---
P.ev("LAB1248.E.journey.setDestination('audiencia')"); P.pg.wait_for_timeout(300); P.shot(tag+'_guia')
P.ev("LAB1248.E.journey.open(LAB1248.G, LAB1248.G.ui)"); P.pg.wait_for_timeout(400); P.shot(tag+'_mapa'); P.ev("LAB1248.E.journey.close(LAB1248.G, LAB1248.G.ui)")
# --- vista pública ---
P.verb('hotspot','exit_audiencia','exit'); P.pg.wait_for_timeout(600); P.settle(); st('audiencia'); P.shot(tag+'_audiencia')
r=talk('mayordomo','Sacar un dinero','Per de la Voz','La marca del cartel','Quien la suspenda'); P.settle(60); st('vista',r); need('final_listo')
print('  inv',P.inv())
P.verb('hotspot','exit_plaza','exit'); P.verb('hotspot','exit_alfar','exit'); P.pg.wait_for_timeout(600); P.settle(90); st('alfar')
P.verb('hotspot','horno','use','telefono'); P.pg.wait_for_timeout(2500); P.settle(60); st('horno')
print('  ended',P.ev('LAB1248.state().ended'),'overlay',P.ev(f'{G}.ui.overlay'))
print('errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'))
print('logs:',[l for l in P.logs if not l.startswith('log') and not l.startswith('info')][:10])
P.close()
