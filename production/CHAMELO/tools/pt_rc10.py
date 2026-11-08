# RC10: Elvira con motivo (aceña → Chamelo con consejo de Raimundo → pan de aceña en la plaza)
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
# aceña: motivo
P.ev("Object.assign(LAB1248.state().flags,{mingo_sigue:true,trato_mingo:true,mingo_robo:true,racimo_dado:true,rueda_libre:true,pase_puerta:true})")
P.ev(f"{G}.runner.run([{{goto:['acena','from_ribera']}}])"); P.pg.wait_for_timeout(2500); settle(60)
ok(P.ev('LAB1248.scene()')=='acena','en la aceña'); r=P.verb('npc','elvira_aceña','talk'); ok(P.ev('LAB1248.log().length>=0'),'Elvira habla en la aceña'); P.shot(tag+'_acena')
# Chamelo: visita
P.ev(f"{G}.runner.run([{{goto:['chamelo','from_orilla']}}])"); P.pg.wait_for_timeout(2500); settle(120)
ok(P.ev('LAB1248.scene()')=='chamelo','en el Chamelo'); ok(fl('chamelo_familia'),'visita completa (chamelo_familia)'); ok(fl('pista_leonor'),'consejo de Raimundo (pista_leonor)')
print('  en escena:',P.ev(f"{G}.sceneNpcs.map(n=>n.def.id+'@'+Math.round(n.x))"),'jugador',P.ev('LAB1248.player().x')); P.shot(tag+'_chamelo')
ok(not P.ev("!!LAB1248.state().flags.elvira_en_plaza"),'aún en el Chamelo')
# plaza: Elvira vende pan
P.ev(f"{G}.runner.run([{{goto:['plaza','from_puerta']}}])"); P.pg.wait_for_timeout(3000); settle(60)
ok(fl('elvira_en_plaza'),'Elvira llega a la plaza'); ok(P.ev(f"!!{G}.sceneNpcs.find(n=>n.def.id==='elvira')"),'Elvira visible en la plaza'); P.shot(tag+'_plaza')
r=P.verb('npc','elvira','talk'); ok(r=='options','diálogo de Elvira con opciones')
choose('¿Qué te dijo Rai'); choose('Tengo hambre'); 
while P.ev(f'{G}.dialogue.active'):
    o=P.ev(f'{G}.dialogue.options.map(o=>o.o.text)'); choose(o[-1]) if o else settle(30)
settle(60); ok(fl('comido'),'Elvira da pan (comido)'); P.shot(tag+'_pan')
P.ev(f"{G}.runner.run([{{goto:['acena','from_ribera']}}])"); P.pg.wait_for_timeout(2500); settle(60)
ok(not P.ev(f"!!{G}.sceneNpcs.find(n=>n.def.id==='elvira_aceña')"),'ya no está en la aceña')
print('errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'),[l for l in P.logs if not l.startswith(('log','info'))][:5]); P.close()
