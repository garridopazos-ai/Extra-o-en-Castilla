"""Pruebas de las novedades de CHAMELO RC07: arranque real desde la portada (audio), cámara, mapa, zonas, prisa, menú, comentarios, paneo, rendimiento."""
import sys, json, time
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from playwright.sync_api import sync_playwright
html, out = sys.argv[1], sys.argv[2]
p = sync_playwright().start(); b = p.chromium.launch(args=['--use-gl=swiftshader', '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'])
pg = b.new_page(viewport={'width': 1600, 'height': 900}); logs = []
pg.on('console', lambda m: logs.append(m.type + ': ' + m.text)); pg.on('pageerror', lambda e: logs.append('PAGEERR ' + str(e)))
pg.goto('file://' + html); pg.wait_for_function('window.LAB1248 && LAB1248.ready()', timeout=90000)
ev = pg.evaluate
ev('LAB1248.E.rc07.autoDegrade=false')
def shot(n): pg.screenshot(path=out + '/' + n + '.png')
def settle(maxs=60):
    t0 = time.time()
    while time.time() - t0 < maxs:
        if ev('LAB1248.idle()'): return True
        if ev('LAB1248.G.dialogue.active && LAB1248.G.dialogue.phase==="options"'): return 'options'
        ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()'); pg.wait_for_timeout(300)
    return False
def click_btn(id):
    c = ev("(()=>{const b=LAB1248.button(%s);return b&&LAB1248.toClient(b.x,b.y)})()" % json.dumps(id)); pg.mouse.click(c['x'], c['y']); return c
R = {}
shot('f00_portada')
click_btn('t-new'); pg.wait_for_timeout(2600)
R['audio'] = ev('LAB1248.E.audio.state'); pg.wait_for_timeout(1500)
R['ambiente'] = ev('LAB1248.E.rc07.snd.scene')
# cinemática de llegada: debería haber acercamiento y bandas
zs = []
for i in range(12):
    pg.wait_for_timeout(700); zs.append(round(ev('LAB1248.E.rc07.cam.z'), 3))
    if i == 6: shot('f01_llegada_cine')
R['zoom_cinematica'] = zs
settle(120); pg.wait_for_timeout(2500)
R['zoom_tras'] = round(ev('LAB1248.E.rc07.cam.z'), 3)
# mapa con la tecla M
pg.keyboard.press('m'); pg.wait_for_timeout(600); R['overlay_m'] = ev('LAB1248.G.ui.overlay'); R['mapa_pos'] = ev('LAB1248.E.rc07.mapPos(LAB1248.G)'); shot('f02_mapa_ribera')
pg.keyboard.press('Escape'); pg.wait_for_timeout(300); R['overlay_esc'] = ev('LAB1248.G.ui.overlay')
# pulsación larga en el suelo: ver zonas
ev("LAB1248.tapScreen(800, 860, 'long')"); pg.wait_for_timeout(700); shot('f03_zonas')
# doble toque: prisa
tx = ev("LAB1248.G.player.x") - 500; ty = ev("LAB1248.G.player.y")
ev("LAB1248.tapWorld(%d, %d)" % (tx, ty)); pg.wait_for_timeout(250); ev("LAB1248.tapWorld(%d, %d)" % (tx + 8, ty)); pg.wait_for_timeout(120)
R['prisa'] = ev('LAB1248.G.player.hurry'); pg.wait_for_timeout(3000)
# salida con doble toque: se sale ya
t0 = time.time()
ev("(()=>{const G=LAB1248.G;const h=G.S.def.hotspots.find(h=>h.id==='exit_acena');G.performVerb({kind:'hotspot',id:h.id,h},'exit',null);})()"); pg.wait_for_timeout(150)
ev("(()=>{const G=LAB1248.G;const h=G.S.def.hotspots.find(h=>h.id==='exit_acena');G.performVerb({kind:'hotspot',id:h.id,h},'exit',null);})()")
pg.wait_for_function("LAB1248.scene()==='acena' && !LAB1248.G.transitioning", timeout=20000); R['salida_rapida_s'] = round(time.time() - t0, 2)
pg.wait_for_timeout(1200); settle(60); shot('f04_acena')
# conversación con Durán: acercamiento
ev("(()=>{const G=LAB1248.G;const n=G.sceneNpcs.find(n=>n.def.id==='duran');G.performVerb({kind:'npc',id:'duran',n},'talk',null);})()")
for i in range(30):
    pg.wait_for_timeout(300)
    if ev('LAB1248.G.dialogue.active'): break
pg.wait_for_timeout(1800); R['zoom_dialogo'] = round(ev('LAB1248.E.rc07.cam.z'), 3); shot('f05_dialogo_duran')
settle(5)
for i in range(6):
    if not ev('LAB1248.G.dialogue.active'): break
    n = ev('LAB1248.G.dialogue.options ? LAB1248.G.dialogue.options.length : 0')
    if n: ev('LAB1248.G.dialogue.choose(%d)' % (n - 1))
    settle(20)
pg.wait_for_timeout(2500); R['zoom_fin_dialogo'] = round(ev('LAB1248.E.rc07.cam.z'), 3)
# menú
click_btn('menu'); pg.wait_for_timeout(500); shot('f06_menu')
click_btn('m-amb'); pg.wait_for_timeout(200); R['ambiente_nivel'] = ev("LAB1248.E.rc07.levelName('amb')"); click_btn('m-amb'); click_btn('m-amb'); click_btn('m-amb')
R['ambiente_nivel_vuelta'] = ev("LAB1248.E.rc07.levelName('amb')")
ev('LAB1248.G.ui.overlay=null; LAB1248.G.pause(false)')
# comentarios espontáneos: 45 s sin tocar nada
barks = set()
for i in range(90):
    pg.wait_for_timeout(500)
    for t in ev('LAB1248.G.ui.bubbles.map(b=>(b.bark?"*":"")+b.actor.id+": "+b.text)'): barks.add(t)
R['comentarios'] = sorted(barks)
# paneo de presentación: primera visita al embarcadero
ev("(()=>{const G=LAB1248.G;G.state.visited.embarcadero=0;G.changeScene('embarcadero','from_ribera');})()")
cams = []
for i in range(14):
    pg.wait_for_timeout(350); cams.append(ev('LAB1248.G.S && LAB1248.G.S.camX'))
    if i == 3: shot('f07_paneo_inicio')
R['paneo_camX'] = cams
settle(20)
ev("(()=>{const G=LAB1248.G;G.state.visited.plaza=0;G.state.flags.pase_puerta=true;G.changeScene('plaza','from_puerta');})()"); pg.wait_for_timeout(1500); settle(30); pg.wait_for_timeout(1500); shot('f08_plaza_palomas')
# palomas: el viajero se acerca y salen volando
ev("LAB1248.tapWorld(900, 760)"); pg.wait_for_timeout(2500); shot('f09_palomas_vuelan')
# mapa en la plaza
pg.keyboard.press('m'); pg.wait_for_timeout(600); shot('f10_mapa_plaza'); R['mapa_plaza'] = ev('LAB1248.E.rc07.mapPos(LAB1248.G)'); pg.keyboard.press('m'); pg.wait_for_timeout(300)
# rendimiento (relativo, en headless sin GPU): efectos SÍ / NO
for on in ('true', 'false'):
    ev('LAB1248.E.rc07.fxOn=%s' % on); pg.wait_for_timeout(500); ev('LAB1248.resetPerf()'); pg.wait_for_timeout(4000)
    R['perf_fx_' + on] = ev('(()=>{const p=LAB1248.perf();return {fps:p.fps,p50:p.p50,p95:p.p95}})()')
ev('LAB1248.E.rc07.fxOn=true')
R['errores'] = [l for l in logs if 'rror' in l or 'PAGEERR' in l][:10]
for k, v in R.items(): print(k, '=', v)
b.close(); p.stop()
