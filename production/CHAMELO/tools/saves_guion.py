# Guardados de prueba hechos con el botón real «Guardar partida» del menú de pausa, en momentos delicados
# (Alonso antes de la lanza, Alonso dormido, la balanza a mitad de secuencia, el eclipse a mitad de secuencia),
# y prueba de carga: python saves_guion.py crear <html> <dir> | cargar <html> <dir>
import sys, os, json, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'G10', 'tools'))
from pt_lib import Play
MODE, HTML, DIR = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(DIR, exist_ok=True)
G = 'LAB1248.G'
KEY = '1248_guion_rev2_save_v1'
def new_page():
    P = Play(HTML); P.ev('LAB1248.E.rc07.autoDegrade=false'); P.ev(f'{G}.newGame()'); P.pg.wait_for_timeout(1500); settle(P, 60); return P
def settle(P, maxs=30, adv=True):
    t0 = time.time()
    while time.time() - t0 < maxs:
        if P.ev('LAB1248.idle()'): return True
        if adv: P.ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()')
        P.pg.wait_for_timeout(220)
def jump(P, flags, scene, entry, inv=(), places=()):
    P.ev(f"Object.assign(LAB1248.state().flags, {json.dumps({k: True for k in flags})}); LAB1248.state().visited['{scene}']=1")
    for i in inv: P.ev(f"LAB1248.state().inventory.includes('{i}')||LAB1248.state().inventory.push('{i}')")
    for pl in places: P.ev(f"{G}.runner.run([{{npcPlace:{json.dumps(list(pl))}}}])")
    P.ev(f"{G}.runner.run([{{goto:['{scene}','{entry}']}}])"); P.pg.wait_for_timeout(2500)
def menu_save(P):   # toques reales: botón ☰ y «Guardar partida»
    b = P.ev("LAB1248.button('menu')"); P.ev(f"LAB1248.tapScreen({b['x']},{b['y']})"); P.pg.wait_for_timeout(400)
    b = P.ev("LAB1248.button('m-save')"); P.ev(f"LAB1248.tapScreen({b['x']},{b['y']})"); P.pg.wait_for_timeout(400)
    return P.ev(f"localStorage.getItem('{KEY}')")
A1 = ['mingo_robo', 'mingo_sigue', 'rueda_libre', 'sancha_conocida', 'rai_conocido', 'pide_paloduz', 'mapa_rai', 'cruzado', 'pase_puerta', 'nuno_conoce', 'p02_visto']
A2 = A1 + ['tiro_abierto', 'carbon_echado', 'embargo_aplazado', 'noche']
P4 = [f for f in A2 if f != 'noche'] + ['lanza_vista', 'alonso_nombre', 'noche_soto', 'requete_1', 'mapa_roto', 'confesion', 'oropesa_secuestrada', 'sancha_oculta']
TBP = [['requete_a', 'taberna', 1790, 796, 'right'], ['requete_b', 'taberna', 2250, 798, 'left'], ['requete_c', 'taberna', 2160, 808, 'left'], ['requete_d', 'taberna', 1700, 806, 'right'], ['sancha', 'taberna', 2300, 805, 'left']]
INV = ['telefono', 'mingo']
if MODE == 'crear':
    out = {}
    # 1) antes de la lanza: Alonso aún es «viejo soldado» (Corredera, de noche)
    P = new_page(); jump(P, A2, 'corredera', 'from_puerta', INV); settle(P, 20); out['pre_lanza'] = menu_save(P); P.close()
    # 2) Alonso dormido en la taberna, con la señora secuestrada
    P = new_page(); jump(P, P4, 'taberna', 'from_corredera', INV, TBP); settle(P, 30); out['alonso_dormido'] = menu_save(P); P.close()
    # 3) la balanza a mitad de secuencia: cuña puesta, aún sin rescate
    P = new_page(); jump(P, P4 + ['p04_visto', 'cuna_mesa_cogida'], 'taberna', 'from_corredera', INV + ['cuna17'], TBP); settle(P, 30)
    P.ev(f"(()=>{{const p={G}.player;p.x=1750;p.y=800;}})()"); P.pg.wait_for_timeout(1500)
    P.ev(f"(()=>{{const h={G}.S.def.hotspots.find(h=>h.id==='balanza');{G}.inventory.select('cuna17');{G}.performVerb({{kind:'hotspot',id:'balanza',h}},'use','cuna17')}})()")
    t0 = time.time()
    while time.time() - t0 < 20 and not P.ev("!!LAB1248.state().flags.cuna_puesta"): P.pg.wait_for_timeout(200)
    P.pg.wait_for_timeout(1500); out['balanza_medio'] = menu_save(P); print('balanza: cuña puesta', P.ev("!!LAB1248.state().flags.cuna_puesta"), 'rescatada', P.ev("!!LAB1248.state().flags.oropesa_rescatada")); P.close()
    # 4) el eclipse a mitad de secuencia (la Luna oscureciéndose, antes de «¡Ahora!»)
    P4b = [f for f in P4 if f != 'sancha_oculta'] + ['p04_visto', 'cuna_puesta', 'oropesa_rescatada', 'nuno_destituido', 'alfar_devuelto', 'requete_vuelve', 'poste_girado', 'requete_fin']
    IGL = [['lope', 'iglesia', 360, 792, 'right'], ['soldado', 'iglesia', 250, 800, 'right'], ['sancha', 'iglesia', 720, 805, 'left'], ['leonor', 'iglesia', 1010, 790, 'left']]
    P = new_page(); jump(P, P4b, 'iglesia', 'from_plaza', INV, IGL)
    t0 = time.time()
    while time.time() - t0 < 40 and not P.ev("!!LAB1248.state().flags.eclipse"): P.ev('LAB1248.G.ui.advance()'); P.pg.wait_for_timeout(250)
    P.pg.wait_for_timeout(1200); out['eclipse_medio'] = menu_save(P); print('eclipse: eclipse', P.ev("!!LAB1248.state().flags.eclipse"), 'luna_roja', P.ev("!!LAB1248.state().flags.luna_roja")); P.close()
    json.dump(out, open(os.path.join(DIR, 'saves.json'), 'w'))
    print({k: (len(v) if v else None) for k, v in out.items()})
else:
    saves = json.load(open(os.path.join(DIR, 'saves.json')))
    def load(name):
        P = Play(HTML); P.ev('LAB1248.E.rc07.autoDegrade=false')
        P.ev(f"localStorage.setItem('{KEY}', {json.dumps(saves[name])})")
        b = P.ev("LAB1248.button('t-continue')")
        P.ev(f"{G}.ui.overlay='title'"); P.pg.wait_for_timeout(500)
        b = P.ev("LAB1248.button('t-continue')")
        if b: P.ev(f"LAB1248.tapScreen({b['x']},{b['y']})")
        else: P.ev(f'{G}.loadGame()')
        P.pg.wait_for_timeout(3000); return P
    res = {}
    # pre_lanza: cargar tras haber oído «Alonso» en otra partida de la misma sesión
    P = load('pre_lanza'); P.ev("LAB1248.E.DATA.npcs.soldado.name='Alonso'"); P.ev(f'{G}.loadGame()'); P.pg.wait_for_timeout(3000)
    res['pre_lanza: nombre del soldado'] = P.ev("LAB1248.G.npcName('soldado')"); P.close()
    # alonso_dormido: hablarle
    P = load('alonso_dormido'); settle(P, 10)
    P.ev(f"(()=>{{const n={G}.sceneNpcs.find(n=>n.def.id==='soldado'); if(n) {G}.performVerb({{kind:'npc',id:'soldado',n}},'talk')}})()")
    seen, menu = [], None
    for i in range(50):
        P.pg.wait_for_timeout(250)
        seen += [t for t in P.ev(f"{G}.ui.bubbles.map(b=>b.text)") if t not in seen]
        if P.ev(f"{G}.dialogue.active"):
            if P.ev(f"{G}.dialogue.phase==='options'"): menu = P.ev(f"{G}.dialogue.options.map(o=>o.o.text)"); break
            P.ev(f"{G}.dialogue.advance()")
        if 'Zzz' in ' '.join(seen): break
    res['alonso_dormido: abre menú'] = menu; res['alonso_dormido: bocadillos'] = seen
    res['alonso_dormido: cuadrilla en la taberna'] = P.ev(f"{G}.sceneNpcs.map(n=>n.def.id).filter(i=>i.startsWith('requete')).length"); P.close()
    # balanza_medio: ¿se puede terminar el rescate?
    P = load('balanza_medio'); settle(P, 10)
    res['balanza_medio: cuña en el zurrón tras cargar'] = P.ev("LAB1248.state().inventory.includes('cuna17')")
    item = 'cuna17' if res['balanza_medio: cuña en el zurrón tras cargar'] else None
    P.ev(f"(()=>{{const h={G}.S.def.hotspots.find(h=>h.id==='balanza');{G}.performVerb({{kind:'hotspot',id:'balanza',h}},'use',{json.dumps(item)})}})()"); settle(P, 90)
    res['balanza_medio: rescate completado'] = P.ev("!!LAB1248.state().flags.oropesa_rescatada"); res['balanza_medio: escena'] = P.ev('LAB1248.scene()'); P.close()
    # eclipse_medio: esperar y tocar la cuerda
    P = load('eclipse_medio'); P.pg.wait_for_timeout(9000); settle(P, 10)
    P.ev(f"(()=>{{const h={G}.S.def.hotspots.find(h=>h.id==='cuerda_campana');{G}.performVerb({{kind:'hotspot',id:'cuerda_campana',h}},'use')}})()"); P.pg.wait_for_timeout(1500)
    res['eclipse_medio: luna_roja tras cargar'] = P.ev("!!LAB1248.state().flags.luna_roja"); res['eclipse_medio: respuesta'] = P.ev(f"{G}.ui.bubbles.map(b=>b.text)")
    settle(P, 60); res['eclipse_medio: llega al presente'] = P.ev("!!LAB1248.state().flags.presente"); P.close()
    for k, v in res.items(): print(f'{k}: {v}')
    print('errores consola: ninguno comprobado aquí (ver pt_guion)')
