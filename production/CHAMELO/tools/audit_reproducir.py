import sys, os, json, time
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib; from pt_lib import Play
pt_lib.SH = sys.argv[2] + '/'
P = Play(sys.argv[1]); G = 'LAB1248.G'; ev = P.ev
def settle(maxs=30):
    t0 = time.time()
    while time.time() - t0 < maxs:
        if ev('LAB1248.idle()'): return True
        if ev(f'{G}.dialogue.active && {G}.dialogue.phase==="options"'): return 'options'
        ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()'); P.pg.wait_for_timeout(200)
def jump(flags, scene, entry):
    ev(f"Object.assign(LAB1248.state().flags, {json.dumps({k: True for k in flags})}); LAB1248.state().visited['{scene}']=1")
    ev(f"{G}.runner.clear(); {G}.dialogue.close(); {G}.runner.run([{{goto:['{scene}','{entry}']}}])"); P.pg.wait_for_timeout(2500); settle(40)
ev('LAB1248.E.rc07.autoDegrade=false'); ev(f'{G}.newGame()'); P.pg.wait_for_timeout(1500); settle(60)
base = ['mingo_robo', 'mingo_sigue', 'rueda_libre', 'sancha_conocida', 'rai_conocido', 'mapa_rai', 'cruzado', 'pase_puerta']
# 1) ciego: rótulo arriba con el panel abierto
jump(base, 'orilla', 'from_chamelo')
ev(f"(()=>{{const t={{kind:'npc',id:'ciego',n:{G}.sceneNpcs.find(n=>n.def.id==='ciego')}};{G}.performVerb(t,'talk')}})()")
for i in range(40):
    P.pg.wait_for_timeout(300)
    st = ev(f"[{G}.dialogue.active, {G}.ui.notes.length, {G}.dialogue.phase, ({G}.dialogue.line||{{}}).text]")
    if st[0] and st[1]: P.shot('ver_ciego_panel_y_rotulo'); print('ciego: panel + rótulo a la vez ->', st); break
    if st[0] and st[2] == 'lines' and i > 3: ev(f'{G}.dialogue.advance()')
settle(30)
# 2) indicador «toca para continuar»
jump(base, 'acena', 'from_ribera')
ev(f"(()=>{{const t={{kind:'npc',id:'duran',n:{G}.sceneNpcs.find(n=>n.def.id==='duran')}};{G}.performVerb(t,'talk')}})()")
for i in range(30):
    P.pg.wait_for_timeout(300)
    if ev(f"{G}.dialogue.active && {G}.dialogue.phase==='lines'"): P.pg.wait_for_timeout(400); P.shot('ver_panel_dialogo'); print('panel de diálogo capturado'); break
settle(10); ev(f'{G}.dialogue.close()'); settle(10)
# 3) tarima de la Plaza Mayor tras la destitución
jump(base + ['p02_visto', 'embargo_aplazado', 'lanza_vista', 'alonso_nombre', 'requete_1', 'confesion', 'oropesa_secuestrada', 'oropesa_rescatada', 'nuno_destituido', 'alfar_devuelto', 'requete_vuelve'], 'audiencia', 'from_plaza')
ev(f"(()=>{{const h={G}.S.def.hotspots.find(h=>h.id==='tarima');{G}.performVerb({{kind:'hotspot',id:'tarima',h}},'use')}})()")
r = None
for i in range(30):
    P.pg.wait_for_timeout(300)
    if ev(f"{G}.dialogue.active && {G}.dialogue.phase==='options'"): r = ev(f"[{G}.dialogue.id, {G}.dialogue.options.map(o=>o.o.text)]"); break
    if ev(f"{G}.dialogue.active"): ev(f'{G}.dialogue.advance()')
print('tarima ->', r); P.shot('ver_tarima_vista')
if r:
    ev(f"{G}.dialogue.choose(0)"); settle(10)
    o = ev(f"{G}.dialogue.options.map(o=>o.o.text)"); print('  siguiente:', o)
ev(f'{G}.dialogue.close()'); settle(5)
# 4) Alonso dormido (P04) y su diálogo
jump([], 'taberna', 'from_corredera')
ev("LAB1248.state().flags.oropesa_rescatada=false; delete LAB1248.state().flags.oropesa_rescatada")
ev(f"(()=>{{const n={G}.npcs.get('soldado');}})()")
jump([], 'taberna', 'from_corredera')
ev(f"(()=>{{const n={G}.sceneNpcs.find(n=>n.def.id==='soldado'); if(!n) return; {G}.performVerb({{kind:'npc',id:'soldado',n}},'talk')}})()")
for i in range(30):
    P.pg.wait_for_timeout(300)
    if ev(f"{G}.dialogue.active && {G}.dialogue.phase==='options'"): print('Alonso (con la señora secuestrada) ->', ev(f"{G}.dialogue.options.map(o=>o.o.text)")); break
    if ev(f"{G}.dialogue.active"): ev(f'{G}.dialogue.advance()')
print('errores:', ev('LAB1248.log().filter(e=>e.level!=="info")')[:3]); P.close()
