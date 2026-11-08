# Prueba corta del tramo final: salta a la Vista ganada, entra en el alfar, duerme y usa el horno (sin recorrer toda la partida)
import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib; from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/CHAMELO/shots/'
P=Play(sys.argv[1]); tag=sys.argv[2]
P.ev('LAB1248.E.rc07.autoDegrade=false'); P.ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(800)
def settle(maxs=60):
    t0=time.time()
    while time.time()-t0<maxs:
        if P.ev('LAB1248.idle()'): return True
        P.ev('(()=>{const G=LAB1248.G;if(G.dialogue.active&&G.dialogue.phase!=="options")G.dialogue.advance();else if(!G.dialogue.active)G.ui.advance();})()'); P.pg.wait_for_timeout(260)
    return False
P.settle=settle; settle(120)
P.ev("(()=>{const G=LAB1248.G;Object.assign(G.state.flags,{pase_puerta:true,mingo_sigue:true,final_listo:true,epilogo_visto:true,barca_libre:true,cruzado:true});G.runner.run([{goto:['alfar','from_plaza']}])})()")
P.pg.wait_for_timeout(2500); settle(90)
def ok(c,m): print(('OK  ' if c else 'FALLO ')+m)
ok(P.ev('LAB1248.scene()')=='alfar','en el alfar')
P.verb('hotspot','pajar','use'); settle(60); ok(not P.ev('!!LAB1248.state().flags.durmio'),'sin comer no se duerme')
P.ev("LAB1248.state().flags.comido=true")
P.verb('hotspot','pajar','use'); P.pg.wait_for_timeout(500); settle(90); ok(P.ev('!!LAB1248.state().flags.durmio'),'duerme tras comer'); P.pg.wait_for_timeout(1500); P.shot(tag+'_noche2')
P.verb('hotspot','horno','use','telefono'); P.pg.wait_for_timeout(2500); settle(60); ok(P.ev('!!LAB1248.state().ended'),'horno → fin')
print('errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'),[l for l in P.logs if not l.startswith(('log','info'))][:5]); P.close()
