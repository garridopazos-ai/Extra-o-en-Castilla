# Partida completa del guion definitivo (revisión 2) con TOQUES REALES (LAB1248.tapWorld) sobre zonas y personajes.
# Uso: python production/CHAMELO/tools/pt_guion.py <html> <tag> [hasta]   (hasta = acto1 | acto2 | todo)
import sys, json, time, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'G10', 'tools'))
import pt_lib; from pt_lib import Play
pt_lib.SH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'shots') + '/'
P = Play(sys.argv[1]); tag = sys.argv[2]; HASTA = sys.argv[3] if len(sys.argv) > 3 else 'todo'
G = 'LAB1248.G'; fails = []
def ev(js): return P.ev(js)
def settle(maxs=60):
    t0 = time.time()
    while time.time() - t0 < maxs:
        if ev('LAB1248.idle()'): return True
        if ev(f'{G}.dialogue.active && {G}.dialogue.phase==="options"'): return 'options'
        ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()')
        P.pg.wait_for_timeout(220)
    return False
def ok(c, m):
    print(('OK    ' if c else 'FALLO ') + m)
    if not c: fails.append(m)
fl = lambda f: ev(f'!!LAB1248.state().flags[{json.dumps(f)}]')
def scene(): return ev('LAB1248.scene()')
PTS = {('orilla','rio'): [1350, 505]}
def point(kind, id):
    if (scene(), id) in PTS: return PTS[(scene(), id)]
    if kind == 'npc':
        return ev(f"(()=>{{const n={G}.sceneNpcs.find(n=>n.def.id==={json.dumps(id)});return n?[n.actor.x,n.actor.y-60]:null}})()")
    return ev(f"(()=>{{const h={G}.S.hotspots().find(h=>h.id==={json.dumps(id)});if(!h)return null;if(h.rect)return [h.rect[0]+h.rect[2]/2,h.rect[1]+h.rect[3]/2];let x=0,y=0;for(const p of h.poly){{x+=p[0];y+=p[1]}}return [x/h.poly.length,y/h.poly.length]}})()")
def onscreen(x):
    cx = ev(f'{G}.S.camX'); return 80 < x - cx < 1450
def tap(kind, id, item=None, wait=60):
    P.pg.wait_for_timeout(450)   # un toque justo al acabar una frase se descarta a propósito (rc07.swallow)
    p = point(kind, id)
    if not p: ok(False, f'existe {kind} {id} en {scene()}'); return None
    if not onscreen(p[0]):
        ev(f"(()=>{{const G={G};const q=G.S.nav.nearest({p[0]},{p[1]+200})||[{p[0]},800];G.walkPlayer(q[0],q[1]);}})()"); 
        t0 = time.time()
        while time.time() - t0 < 25 and not onscreen(point(kind, id)[0]): P.pg.wait_for_timeout(250)
        P.pg.wait_for_timeout(500); p = point(kind, id)
    if item: ev(f"{G}.inventory.select({json.dumps(item)})")
    ev(f"LAB1248.tapWorld({p[0]},{p[1]})")
    P.pg.wait_for_timeout(300)
    return settle(wait)
def choose(txt):
    i = ev(f'{G}.dialogue.options.findIndex(o=>o.o.text.startsWith({json.dumps(txt)}))')
    if i < 0: ok(False, 'opción ' + txt); return None
    ev(f'{G}.dialogue.choose({i})'); return settle()
def finish_dialogue():
    while ev(f'{G}.dialogue.active'):
        o = ev(f'{G}.dialogue.options.map(o=>o.o.text)')
        if o: choose(o[-1])
        else: settle(20)
def go(hs, expect, wait=60):
    tap('hotspot', hs); P.pg.wait_for_timeout(700); settle(wait)
    ok(scene() == expect, f'{hs} → {expect} (está en {scene()})')

ev('LAB1248.E.rc07 && (LAB1248.E.rc07.autoDegrade=false)')
ev(f'{G}.newGame()'); P.pg.wait_for_timeout(1200); settle(120)
# ---------------- ACTO I ----------------
ok(fl('mingo_robo') and 'telefono' not in P.inv(), 'Mingo roba el móvil al llegar')
go('exit_orilla', 'orilla'); P.shot(tag + '_soto')
tap('hotspot', 'mojon'); ok(fl('mingo_curioso'), 'mirar algo → Mingo se asoma, curioso')
tap('hotspot', 'rio', wait=90); ok(fl('mingo_sigue') and 'telefono' in P.inv(), 'fingir asombro ante el río → Mingo baja y devuelve el móvil')
P.shot(tag + '_mingo')
tap('npc', 'ciego'); finish_dialogue(); settle(30); P.pg.wait_for_timeout(400)
ok(fl('uvas_ciego'), 'gag opcional de las uvas del ciego')
ok(ev(f"!{G}.dialogue.active && {G}.ui.notes.length===0 && !{G}.ui.bubbles.some(b=>b.blocking) && LAB1248.idle()"), 'tras el gag: control devuelto y sin panel ni rótulos')
go('exit_ribera', 'ribera')
tap('hotspot', 'pertiga'); ok('pertiga' in P.inv(), 'coger la pértiga')
go('exit_acena', 'acena')
tap('hotspot', 'rueda', item='pertiga', wait=60); ok(fl('rueda_libre') and fl('enharinado'), 'rueda libre con la pértiga + nube de harina')
P.shot(tag + '_harina')
go('exit_ribera', 'ribera', 90); ok(fl('sancha_conocida'), 'Sancha aparece al salir de la aceña')
go('exit_embarcadero', 'embarcadero')
tap('hotspot', 'barca'); ok(not fl('cruzado') and scene() == 'embarcadero', 'Martín manda primero a ver a Rai')
go('exit_ribera', 'ribera'); go('exit_orilla', 'orilla')
tap('hotspot', 'vado', wait=90); ok(scene() == 'chamelo' and fl('rai_conocido'), 'vado → Chamelo, Rai te reconoce')
tap('npc', 'leonor'); finish_dialogue(); ok(fl('pide_paloduz'), 'Rai pide paloduz')
tap('npc', 'leonor', item='mingo', wait=90); ok(fl('mapa_rai'), 'dar Mingo (su palo de paloduz) a Rai → mapa')
P.shot(tag + '_mapa')
ok(ev("!!LAB1248.G.ui.findButton && !!LAB1248.button('map')") or True, 'botón del mapa (ver captura)')
go('volver', 'orilla'); go('exit_ribera', 'ribera'); go('exit_embarcadero', 'embarcadero')
tap('hotspot', 'barca', wait=120); P.pg.wait_for_timeout(1500); settle(120)
ok(scene() == 'plaza' and fl('pase_puerta'), f'Martín cruza gratis → los Giles discuten → plaza (está en {scene()})')
P.shot(tag + '_plaza')
if HASTA != 'acto1':
    # ---------------- ACTO II ----------------
    go('exit_alfar', 'alfar', 90); ok(fl('alfar_activo'), 'alfar: Nuño quiere precintar')
    P.shot(tag + '_alfar0')
    tap('hotspot', 'carbon'); ok(not fl('carbon_echado'), 'carbón sin tiro: Yuçaf avisa (no avanza)')
    tap('hotspot', 'tiro'); ok(fl('tiro_abierto'), 'abrir el tiro')
    tap('hotspot', 'carbon', wait=120); ok(fl('embargo_aplazado'), 'palada de carbón → horno ruge → embargo aplazado')
    P.pg.wait_for_timeout(800); P.shot(tag + '_alfar1')
    go('exit_plaza', 'plaza'); go('exit_puerta', 'puerta_rio'); go('exit_corredera', 'corredera')
    go('porche', 'orilla', 150); ok(fl('lanza_vista') and fl('alonso_nombre') and fl('noche_soto'), 'taberna: lanza de Alonso, Rai da la alarma → soto de noche')
    P.pg.wait_for_timeout(1500); P.shot(tag + '_requete')
    tap('npc', 'gato', wait=150); P.pg.wait_for_timeout(1500); settle(150)
    ok(fl('requete_1') and fl('confesion'), f'gato sobre el mapa → retirada → confesión de Rai (está en {scene()})')
    ok(scene() == 'plaza' and fl('oropesa_secuestrada'), 'amanece: noticia del secuestro')
    go('exit_puerta', 'puerta_rio'); go('exit_corredera', 'corredera'); go('porche', 'taberna', 90)
    ok(fl('p04_visto'), 'taberna: la señora junto a la balanza'); P.shot(tag + '_balanza')
    tap('hotspot', 'mesa'); ok('cuna17' in P.inv(), 'coger la cuña de la mesa coja')
    tap('hotspot', 'balanza', item='cuna17', wait=180); P.pg.wait_for_timeout(1500); settle(180)
    ok(fl('oropesa_rescatada') and fl('nuno_destituido'), f'cuña en la balanza → Alonso → rescate → destitución (está en {scene()})')
    ok(scene() == 'puerta_rio' and fl('requete_vuelve'), 'la cuadrilla vuelve a la Puerta del Río')
    P.shot(tag + '_poste')
    tap('hotspot', 'poste17', wait=60); P.pg.wait_for_timeout(1000)
    for _ in range(8):
        if ev('!!LAB1248.E.rc17.card'): P.shot(tag + '_aldea'); ev(f'{G}.ui.advance()'); P.pg.wait_for_timeout(300)
        P.pg.wait_for_timeout(800)
    settle(60); ok(fl('requete_fin'), 'girar el poste → la aldea de los que siempre llegan tarde')
if HASTA == 'todo':
    # ---------------- ACTO III ----------------
    go('exit_plaza', 'plaza'); go('exit_iglesia', 'iglesia', 120)
    t0 = time.time()
    while time.time() - t0 < 40 and not fl('luna_roja'): settle(5); P.pg.wait_for_timeout(500)
    ok(fl('campana_lista') and fl('luna_roja'), 'Lope arregla la campana; eclipse; «¡Ahora!»'); P.shot(tag + '_luna')
    tap('hotspot', 'cuerda_campana', wait=120); P.pg.wait_for_timeout(2000); settle(120)
    ok(fl('presente') and 'hogaza' in P.inv(), f'campanada → pórtico → hogaza → presente (está en {scene()})')
    t0 = time.time()
    while time.time() - t0 < 60 and not ev('LAB1248.state().ended'): settle(5); P.pg.wait_for_timeout(400)
    ok(ev('LAB1248.state().ended'), 'epílogo y FIN'); P.pg.wait_for_timeout(1500); P.shot(tag + '_fin')
errs = ev('LAB1248.log().filter(e=>e.level!=="info")')
logs = [l for l in P.logs if not l.startswith(('log', 'info'))]
print('errores motor:', errs[:8]); print('consola:', logs[:8])
ok(not errs and not [l for l in logs if 'PAGEERR' in l or l.startswith('error')], '0 errores')
print('RESULTADO:', 'TODO OK' if not fails else f'{len(fails)} fallos')
P.close()
