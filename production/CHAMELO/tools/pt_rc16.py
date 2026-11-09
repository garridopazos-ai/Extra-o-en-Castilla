# RC16: amor con Elvira (3 momentos en la plaza) + recibo en la Vista
import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib; from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/CHAMELO/shots/'
P=Play(sys.argv[1]); tag=sys.argv[2]; G='LAB1248.G'
P.ev('LAB1248.E.rc07.autoDegrade=false'); P.ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(800)
def settle(maxs=60):
    t0=time.time()
    while time.time()-t0<maxs:
        if P.ev('LAB1248.idle()'): return True
        if P.ev(f'{G}.dialogue.active && {G}.dialogue.phase==="options"'): return 'options'
        P.ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()'); P.pg.wait_for_timeout(260)
    return False
P.settle=settle; settle(120)
def ok(c,m): print(('OK  ' if c else 'FALLO ')+m)
fl=lambda f: P.ev(f'!!LAB1248.state().flags[{json.dumps(f)}]')
def choose(t):
    i=P.ev(f'{G}.dialogue.options.findIndex(o=>o.o.text.startsWith({json.dumps(t)}))'); ok(i>=0,'opción '+t)
    if i>=0: P.ev(f'{G}.dialogue.choose({i})'); return settle(60)

ok(True,'inicio')
P.ev("Object.assign(LAB1248.state().flags,{mingo_sigue:true,trato_mingo:true,mingo_robo:true,racimo_dado:true,rueda_libre:true,pase_puerta:true,chamelo_familia:true,cruzado:true})")
P.ev(f"{G}.runner.run([{{goto:['plaza','from_puerta']}}])"); P.pg.wait_for_timeout(3000); settle(60)
ok(fl('elvira_en_plaza'),'Elvira en la plaza')
def opts(): return P.ev(f'{G}.dialogue.options.map(o=>o.o.text)')
def hablar():
    r=P.verb('npc','elvira','talk'); return r
def fin():
    while P.ev(f'{G}.dialogue.active'):
        o=opts(); 
        if o: choose(o[-1])
        else: settle(30)
    settle(30)
r=hablar(); ok('Cuéntame algo de ti, Elvira.' in opts(),'opción amor1 disponible')
ok(not any(t.startswith('¿Has oído') or t.startswith('Ya está') for t in opts()),'amor2/3 ocultos al principio')
choose('Cuéntame algo'); ok(fl('amor1'),'amor1'); P.shot(tag+'_amor1'); fin()
r=hablar(); ok(not any(t.startswith('Cuéntame') for t in opts()),'amor1 no se repite'); ok(not any(t.startswith('¿Has oído') for t in opts()),'amor2 oculto sin Vista'); fin()
# Vista convocada -> recibo
P.ev("LAB1248.state().flags.vista_convocada=true")
r=hablar(); choose('¿Has oído algo de Nuño'); ok(fl('amor2'),'amor2'); ok('recibo_tasa' in P.inv(),'recibo en el zurrón'); P.shot(tag+'_amor2'); fin()
# Vista con el recibo + cartel, sin sello alguacil
P.ev("LAB1248.state().flags.has_bando=true")
P.ev("(()=>{const s=LAB1248.state(); if(!s.inventory.includes('bando')) s.inventory.push('bando');})()")
P.ev(f"{G}.runner.run([{{goto:['audiencia','from_plaza']}}])"); P.pg.wait_for_timeout(2500); settle(60)
ok(P.ev('LAB1248.scene()')=='audiencia','en la audiencia')
r=P.verb('npc','mayordomo','talk'); 
if r!='options': r=settle(30)
choose('Sacar un dinero'); choose('Per de la Voz')
ok(any(t.startswith('Traigo el recibo') for t in opts()),'opción del recibo en la Vista'); choose('Traigo el recibo'); P.shot(tag+'_vista')
choose('Quien la suspenda'); settle(90); ok(fl('final_listo'),'Vista ganada con el recibo (sin sello del alguacil)'); ok(fl('nuno_derrotado'),'Nuño paga')
# despedida
P.ev(f"{G}.runner.run([{{goto:['plaza','from_audiencia']}}])"); P.pg.wait_for_timeout(2500); settle(60)
r=hablar(); choose('Ya está: Nuño'); ok(fl('amor3'),'amor3 despedida'); P.shot(tag+'_amor3'); fin()
P.ev(f"{G}.runner.run([{{goto:['alfar','from_plaza']}}])"); P.pg.wait_for_timeout(2500); settle(90)
ok(fl('amor_alfar'),'guiño en el alfar')
print('errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'),[l for l in P.logs if not l.startswith(('log','info'))][:5]); P.close()
