# Capturas de control del guion definitivo (RC17): saltos de estado directos, sin recorrer la partida.
# Uso: python production/CHAMELO/tools/shots_guion.py <html> <tag>
import sys, os, json, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'G10', 'tools'))
import pt_lib; from pt_lib import Play
pt_lib.SH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shots') + '/'
P = Play(sys.argv[1]); tag = sys.argv[2]; G = 'LAB1248.G'
ev = P.ev
def settle(maxs=40):
    t0 = time.time()
    while time.time() - t0 < maxs:
        if ev('LAB1248.idle()'): return True
        ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()'); P.pg.wait_for_timeout(200)
def jump(flags, scene, entry, inv=(), wait=2500, adv=True):
    ev(f"LAB1248.state().visited['{scene}']=1")
    ev(f"Object.assign(LAB1248.state().flags, {json.dumps({k: True for k in flags})})")
    for i in inv: ev(f"LAB1248.state().inventory.includes('{i}')||LAB1248.state().inventory.push('{i}')")
    ev(f"{G}.runner.clear(); {G}.dialogue.close(); {G}.runner.run([{{goto:['{scene}','{entry}']}}])"); P.pg.wait_for_timeout(wait)
    if adv: settle(40)
ev('LAB1248.E.rc07.autoDegrade=false'); ev(f'{G}.newGame()'); P.pg.wait_for_timeout(1500); settle(60)
base = ['mingo_robo', 'mingo_sigue', 'rueda_libre', 'sancha_conocida', 'rai_conocido', 'pide_paloduz', 'mapa_rai', 'cruzado', 'pase_puerta', 'p02_visto', 'embargo_aplazado', 'lanza_vista', 'alonso_nombre', 'noche_soto', 'requete_1', 'confesion', 'oropesa_secuestrada']
# 1) taberna: la balanza
ev("LAB1248.E.rc17.act('cuadrillaTaberna', LAB1248.G)")
jump(base, 'taberna', 'from_corredera', ['telefono', 'mingo'])
ev(f"(()=>{{const p={G}.player;p.x=1650;p.y=800;}})()"); P.pg.wait_for_timeout(2500); P.shot(tag + '_balanza')
# 2) Puerta del Río: la cuadrilla y el poste; luego la viñeta de la aldea
for id, x, y, f in [('requete_a', 1800, 760, 'right'), ('requete_b', 1915, 800, 'left'), ('requete_c', 1690, 805, 'right'), ('requete_d', 2010, 775, 'left')]:
    ev(f"LAB1248.G.runner.run([{{npcPlace:['{id}','puerta_rio',{x},{y},'{f}']}}])")
jump(['oropesa_rescatada', 'nuno_destituido', 'alfar_devuelto', 'requete_vuelve', 'p04_visto'], 'puerta_rio', 'from_plaza')
ev(f"(()=>{{const p={G}.player;p.x=1600;p.y=790;}})()"); P.pg.wait_for_timeout(2500); P.shot(tag + '_poste')
ev("LAB1248.state().flags.poste_girado=true"); P.pg.wait_for_timeout(300); P.shot(tag + '_poste_girado')
ev("LAB1248.E.rc17.card={t:0}"); P.pg.wait_for_timeout(5600); P.shot(tag + '_aldea'); ev('LAB1248.E.rc17.card=null')
# 3) iglesia: eclipse y pórtico
for id, x, y, f in [('lope', 360, 792, 'right'), ('soldado', 250, 800, 'right'), ('sancha', 720, 805, 'left'), ('leonor', 1010, 790, 'left')]:
    ev(f"LAB1248.G.runner.run([{{npcPlace:['{id}','iglesia',{x},{y},'{f}']}}])")
jump(['requete_fin', 'campana_lista', 'noche', 'eclipse'], 'iglesia', 'from_plaza')
ev("LAB1248.E.rc17.moon=0.5"); P.pg.wait_for_timeout(200); P.shot(tag + '_eclipse_mitad')
ev("LAB1248.state().flags.luna_roja=true; LAB1248.E.rc17.moon=1; LAB1248.E.rc17.lift=0.001; LAB1248.E.rc17.portal=0.001"); P.pg.wait_for_timeout(2600); P.shot(tag + '_portal')
# 4) presente: la ribera de hoy y el gato
ev("(()=>{const f=LAB1248.state().flags;delete f.noche;delete f.eclipse;delete f.mingo_sigue;f.presente=true;f.fin=true;})()")
ev("LAB1248.E.rc17.lift=0; LAB1248.E.rc17.portal=0")
ev("LAB1248.G.runner.run([{npcPlace:['gato','ribera',1960,772,'left']},{npcPlace:['mingo','nada',0,0,'left']}])")
jump([], 'ribera', 'presente')
ev("(()=>{const a=LAB1248.G.npc('gato'); if(a) a.anim='yawn';})()"); P.pg.wait_for_timeout(400); P.shot(tag + '_presente')
errs = ev('LAB1248.log().filter(e=>e.level!=="info")'); logs = [l for l in P.logs if 'PAGEERR' in l or l.startswith('error')]
print('errores:', errs[:5], logs[:5]); P.close()
