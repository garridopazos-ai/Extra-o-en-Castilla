# Pruebas jugadas específicas de RC18 (toques reales con LAB1248.tapWorld sobre zonas y personajes):
# 1) gag del soto al entrar, salir y volver; 2) Alonso dormido y en la iglesia; 3) abandonar y retomar el alfar y la balanza;
# 4) tarima de la Plaza Mayor; 5) bocadillos que no pasan de escena. Uso: python pt_rc18.py <html> <tag>
import sys, os, json, time
__file__p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt_guion.py')
src = open(__file__p).read().split("ev('LAB1248.E.rc07")[0]
sys.argv = [sys.argv[0], sys.argv[1], sys.argv[2], 'todo']; __file__ = __file__p
exec(src)
ev('LAB1248.E.rc07.autoDegrade=false'); ev(f'{G}.newGame()'); P.pg.wait_for_timeout(1500); settle(90)
def jump(flags, scene, entry, inv=('telefono', 'mingo'), places=()):
    ev(f"Object.assign(LAB1248.state().flags, {json.dumps({k: True for k in flags})}); LAB1248.state().visited['{scene}']=1")
    for i in inv: ev(f"LAB1248.state().inventory.includes('{i}')||LAB1248.state().inventory.push('{i}')")
    for pl in places: ev(f"{G}.runner.run([{{npcPlace:{json.dumps(list(pl))}}}])")
    ev(f"{G}.runner.clear(); {G}.dialogue.close(); {G}.runner.run([{{goto:['{scene}','{entry}']}}])"); P.pg.wait_for_timeout(2500); settle(40)
PTS[('audiencia', 'tarima')] = [1100, 610]   # la señora de Oropesa tapa el centro de la tarima
def tap_listen(kind, id, item=None):
    """toca como el jugador y anota lo que se dice (bocadillos y rótulos) hasta que vuelve el control"""
    tap(kind, id, item=item, wait=0); seen, dl = [], False; t0 = time.time()
    while time.time() - t0 < 40:
        st = ev(f"[{G}.ui.bubbles.map(b=>[b.text,b.blocking,b.t,b.actor.id]), {G}.ui.notes.map(n=>n.text), {G}.dialogue.active, LAB1248.idle()]")
        for b in st[0]:
            if b[0] not in seen: seen.append(b[0])
        for n in st[1]:
            if n not in seen: seen.append(n)
        dl = dl or st[2]
        if st[3] and time.time() - t0 > 1.0: break
        if any(b[1] and b[2] > 0.8 for b in st[0]) or (st[1] and True): ev(f'{G}.ui.advance()')
        if st[2]: ev(f'{G}.dialogue.advance()')
        P.pg.wait_for_timeout(250)
    return seen, dl
def clean(): return ev(f"!{G}.dialogue.active && {G}.ui.notes.length===0 && LAB1248.idle()")
def foreign(): return ev(f"{G}.ui.bubbles.filter(b=>b.actor!=={G}.player && !{G}.sceneNpcs.some(n=>n.actor===b.actor)).map(b=>b.text)")
A1 = ['mingo_robo', 'mingo_sigue', 'mingo_curioso', 'rueda_libre', 'sancha_conocida', 'rai_conocido', 'pide_paloduz', 'mapa_rai']
print('— 1) soto: entrar, gag, salir, volver')
jump(A1, 'ribera', 'from_acena'); go('exit_orilla', 'orilla')
tap('npc', 'ciego'); P.pg.wait_for_timeout(600)
saw_panel = False
for i in range(40):
    if ev(f'{G}.dialogue.active'): saw_panel = True
    if clean(): break
    ev(f'{G}.ui.advance()'); P.pg.wait_for_timeout(300)
ok(fl('uvas_ciego') and not saw_panel, 'gag de las uvas como secuencia directa (sin panel de diálogo)')
ok(clean(), 'al acabar: control devuelto, sin rótulos ni panel'); P.shot(tag + '_soto_tras_gag')
go('exit_ribera', 'ribera'); ok(not foreign(), 'en la ribera no aparecen bocadillos del soto (' + str(foreign()) + ')')
go('exit_orilla', 'orilla'); P.pg.wait_for_timeout(800)
ok(ev(f"!!{G}.sceneNpcs.find(n=>n.def.id==='ciego')"), 'al volver, el ciego sigue bajo su parra')
said, _ = tap_listen('npc', 'ciego'); settle(20)
ok(any('Se acabó el racimo' in t for t in said) and clean(), 'segunda vez: una frase y control devuelto ' + str(said))
print('— 2) Alonso dormido y en la iglesia')
TBP = [['requete_a', 'taberna', 1640, 796, 'right'], ['requete_b', 'taberna', 2100, 798, 'left'], ['requete_c', 'taberna', 2010, 808, 'left'], ['requete_d', 'taberna', 1550, 806, 'right'], ['sancha', 'taberna', 2150, 805, 'left']]
P4 = A1 + ['cruzado', 'pase_puerta', 'p02_visto', 'tiro_abierto', 'carbon_echado', 'embargo_aplazado', 'lanza_vista', 'alonso_nombre', 'noche_soto', 'requete_1', 'mapa_roto', 'confesion', 'oropesa_secuestrada', 'sancha_oculta']
jump(P4, 'taberna', 'from_corredera', places=TBP)
said, dl = tap_listen('npc', 'soldado'); settle(20)
ok(not dl and any('Zzz' in t for t in said), 'Alonso dormido: una frase breve, sin menú ' + str(said))
print('— 3a) abandonar y retomar la balanza')
tap('hotspot', 'mesa'); ok('cuna17' in P.inv(), 'coger la cuña de la mesa coja')
go('exit_corredera', 'corredera'); go('porche', 'taberna')
ok('cuna17' in P.inv() and fl('p04_visto') and not fl('oropesa_rescatada'), 'al volver: la cuña sigue en el zurrón y la señora sigue allí')
tap('hotspot', 'balanza', item='cuna17', wait=180); P.pg.wait_for_timeout(1500); settle(180)
ok(fl('oropesa_rescatada') and fl('nuno_destituido') and fl('tras_destitucion'), f'rescate y destitución tras retomar (está en {scene()})')
print('— 4) Plaza Mayor: la tarima ya no abre la Vista antigua; Yuçaf y el pregonero no se duplican')
go('exit_plaza', 'plaza') if scene() == 'puerta_rio' else None
ev("LAB1248.state().visited.puerta_rio=1")
jump(['requete_vuelve'], 'audiencia', 'from_plaza')
said, dl = tap_listen('hotspot', 'tarima'); settle(10)
ok(not dl and any('tarima' in t.lower() for t in said), 'tarima: solo una frase ' + str(said))
ok(ev("LAB1248.G.S.def.name") == 'Plaza Mayor', 'la escena se llama «Plaza Mayor»')
ok(not ev(f"!!{G}.sceneNpcs.find(n=>n.def.id==='yucaf_aud'||n.def.id==='pregonero_vista')"), 'Yuçaf y el pregonero ya no están duplicados aquí')
print('— 3b) abandonar y retomar el alfar (otra partida)')
ev(f'{G}.newGame()'); P.pg.wait_for_timeout(1500); settle(60)
jump(A1 + ['cruzado', 'pase_puerta', 'nuno_conoce'], 'plaza', 'from_puerta', places=[['sancha', 'alfar', 880, 815, 'left']])
go('exit_alfar', 'alfar', 90); ok(fl('alfar_activo'), 'alfar: Nuño quiere precintar')
tap('hotspot', 'tiro'); ok(fl('tiro_abierto'), 'abrir el tiro')
go('exit_plaza', 'plaza'); go('exit_alfar', 'alfar', 60)
ok(fl('alfar_activo') and ev(f"!!{G}.sceneNpcs.find(n=>n.def.id==='nuno_alfar')"), 'al volver: Nuño sigue y el tiro sigue abierto')
tap('hotspot', 'carbon', wait=120); ok(fl('embargo_aplazado'), 'palada de carbón tras retomar → embargo aplazado')
print('— 2b) Alonso en la iglesia (tras «¡Ahora!»)')
IGL = [['lope', 'iglesia', 360, 792, 'right'], ['soldado', 'iglesia', 250, 800, 'right'], ['sancha', 'iglesia', 720, 805, 'left'], ['leonor', 'iglesia', 1010, 790, 'left']]
jump(P4 + ['requete_vuelve', 'requete_fin', 'oropesa_rescatada', 'nuno_destituido', 'campana_lista', 'eclipse', 'luna_roja', 'noche'], 'iglesia', 'from_plaza', places=IGL)
said, dl = tap_listen('npc', 'soldado'); settle(20)
ok(not dl and len(said) >= 1 and 'cuerda' in ' '.join(said), 'Alonso en la iglesia: una frase, sin menú ' + str(said)); P.shot(tag + '_iglesia_alonso')
errs = ev('LAB1248.log().filter(e=>e.level!=="info")'); logs = [l for l in P.logs if 'PAGEERR' in l or l.startswith('error')]
ok(not errs and not logs, '0 errores ' + str(errs[:3]) + str(logs[:3]))
print('RESULTADO:', 'TODO OK' if not fails else f'{len(fails)} fallos: ' + '; '.join(fails)); P.close()
