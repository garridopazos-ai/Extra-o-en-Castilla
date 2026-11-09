# Prueba en ventana de móvil apaisado (915×412, táctil, DPR 2,625 como un Pixel 7) con TOQUES TÁCTILES reales (page.touchscreen.tap):
# portada → Nueva partida → robo del móvil → soto (curiosidad de Mingo, río, ciego) → pértiga → aceña (Durán, rueda con el zurrón) → Sancha.
# Registra el encuadre de Mingo en cada entrada y guarda capturas. Uso: python pt_movil.py <html> <dir capturas>
import sys, os, json, time
from playwright.sync_api import sync_playwright
HTML, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
p = sync_playwright().start(); b = p.chromium.launch(args=['--allow-file-access-from-files'])
ctx = b.new_context(viewport={'width': 915, 'height': 412}, device_scale_factor=2.625, is_mobile=True, has_touch=True)
pg = ctx.new_page(); logs = []
pg.on('console', lambda m: logs.append(m.type + ': ' + m.text)); pg.on('pageerror', lambda e: logs.append('PAGEERR ' + str(e)))
pg.goto('file://' + HTML); pg.wait_for_function('window.LAB1248 && LAB1248.ready()', timeout=90000)
ev = pg.evaluate; G = 'LAB1248.G'; fails = []
ev('LAB1248.E.rc07.autoDegrade=false')
def ok(c, m):
    print(('OK    ' if c else 'FALLO ') + m)
    if not c: fails.append(m)
def touch_logical(x, y):
    c = ev(f'LAB1248.toClient({x},{y})'); pg.touchscreen.tap(c['x'], c['y']); pg.wait_for_timeout(350)
def touch_world(x, y):
    c = ev(f'LAB1248.worldToClient({x},{y})'); pg.touchscreen.tap(c['x'], c['y']); pg.wait_for_timeout(350)
def touch_button(bid):
    bt = ev(f"LAB1248.button('{bid}')")
    if not bt: return False
    touch_logical(bt['x'], bt['y']); return True
def busy(): return ev(f"(()=>{{const G={G};return G.runner.busy||G.dialogue.active||G.ui.notes.length>0||G.transitioning||(G.player&&G.player.moving)}})()")
def advance_by_touch(maxs=60):
    t0 = time.time()
    while time.time() - t0 < maxs:
        if ev('LAB1248.idle()'): return True
        if ev(f'{G}.dialogue.active && {G}.dialogue.phase==="options"'):
            o = ev(f'{G}.dialogue.options.length'); bt = ev(f"LAB1248.button('opt:{o-1}')"); touch_logical(bt['x'], bt['y']); continue
        if ev(f"{G}.runner.busy||{G}.dialogue.active||{G}.ui.notes.length>0"): touch_logical(800, 300)
        pg.wait_for_timeout(450)
    return False
def scene(): return ev('LAB1248.scene()')
def target_point(kind, id, pts={}):
    if (scene(), id) in pts: return pts[(scene(), id)]
    if kind == 'npc': return ev(f"(()=>{{const n={G}.sceneNpcs.find(n=>n.def.id==='{id}');return n?[n.actor.x,n.actor.y-60]:null}})()")
    return ev(f"(()=>{{const h={G}.S.hotspots().find(h=>h.id==='{id}');if(!h)return null;if(h.rect)return [h.rect[0]+h.rect[2]/2,h.rect[1]+h.rect[3]/2];let x=0,y=0;for(const q of h.poly){{x+=q[0];y+=q[1]}}return [x/h.poly.length,y/h.poly.length]}})()")
PTS = {('orilla', 'rio'): [1350, 505]}
def walk_near(x):   # andar tocando el suelo hasta tener el punto en pantalla
    for _ in range(8):
        cx = ev(f'{G}.S.camX')
        if 80 < x - cx < 1450: return
        tx = min(max(x, cx + 200), cx + 1400); touch_world(tx, 800)
        t0 = time.time()
        while time.time() - t0 < 12 and ev(f'{G}.player && {G}.player.moving'): pg.wait_for_timeout(250)
def tap(kind, id, item=None):
    pg.wait_for_timeout(450); q = target_point(kind, id, PTS)
    if not q: ok(False, f'existe {id} en {scene()}'); return
    walk_near(q[0]); q = target_point(kind, id, PTS)
    if item:
        touch_button('bag'); pg.wait_for_timeout(300); touch_button('item:' + item); pg.wait_for_timeout(300)
    touch_world(q[0], q[1]); pg.wait_for_timeout(500); advance_by_touch(90)
def mingo_frame():
    r = ev(f"""(()=>{{const G={G},E=LAB1248.E;const n=G.sceneNpcs.find(n=>n.def.id==='mingo');if(!n)return null;const a=n.actor,S=G.S;
      const hb=E.actor.hitBox(a,S.depthScale(a.y));const x0=hb[0]-S.camX,x1=x0+hb[2];return {{x0:Math.round(x0),x1:Math.round(x1),y1:Math.round(hb[1]+hb[3])}}}})()""")
    if not r: return None
    vis = (min(r['x1'], 1600) - max(r['x0'], 0)) / (r['x1'] - r['x0']); bag = r['x0'] < 135 and r['y1'] > 768
    return round(vis, 2), bag
# portada
ev(f"{G}.ui.overlay='title'"); pg.wait_for_timeout(800)
ok(touch_button('t-new'), 'portada: «Nueva partida» con el dedo'); pg.wait_for_timeout(3500)
advance_by_touch(120); ok(scene() == 'ribera' and ev("!!LAB1248.state().flags.mingo_robo"), 'llegada y robo del móvil (toques)')
pg.screenshot(path=OUT + '/movil_ribera.png')
tap('hotspot', 'exit_orilla'); advance_by_touch(60); ok(scene() == 'orilla', 'al soto')
tap('hotspot', 'mojon'); ok(ev("!!LAB1248.state().flags.mingo_curioso"), 'mirar el mojón → Mingo curioso')
tap('hotspot', 'rio'); ok(ev("!!LAB1248.state().flags.mingo_sigue"), 'mirar el río → Mingo baja y se une')
pg.screenshot(path=OUT + '/movil_soto.png')
tap('npc', 'ciego'); ok(ev("!!LAB1248.state().flags.uvas_ciego") and ev('LAB1248.idle()') and not ev(f'{G}.dialogue.active'), 'gag de las uvas (toques) y control devuelto')
frames = {}
tap('hotspot', 'exit_ribera'); advance_by_touch(30); frames['ribera'] = mingo_frame()
tap('hotspot', 'pertiga'); ok('pertiga' in ev('LAB1248.state().inventory'), 'coger la pértiga')
tap('hotspot', 'exit_acena'); advance_by_touch(30); frames['acena'] = mingo_frame()
tap('npc', 'duran')
pg.wait_for_timeout(300)
tap('hotspot', 'rueda', item='pertiga'); ok(ev("!!LAB1248.state().flags.rueda_libre"), 'rueda: zurrón → pértiga → rueda (toques)')
tap('hotspot', 'exit_ribera'); advance_by_touch(60); ok(ev("!!LAB1248.state().flags.sancha_conocida"), 'Sancha al salir de la aceña')
pg.screenshot(path=OUT + '/movil_sancha.png')
# panel de diálogo en móvil: hablar con Durán y fotografiar el panel
tap('hotspot', 'exit_acena'); advance_by_touch(30)
q = target_point('npc', 'duran'); touch_world(q[0], q[1])
for i in range(30):
    pg.wait_for_timeout(300)
    if ev(f"{G}.dialogue.active && {G}.dialogue.phase==='lines'"): pg.wait_for_timeout(500); pg.screenshot(path=OUT + '/movil_panel.png'); break
advance_by_touch(30)
print('encuadre de Mingo al entrar (fracción visible, bajo el zurrón):', frames)
ok(all(v and v[0] >= 0.95 and not v[1] for v in frames.values()), 'Mingo entra dentro del cuadro y fuera del zurrón')
errs = ev('LAB1248.log().filter(e=>e.level!=="info")'); bad = [l for l in logs if 'PAGEERR' in l or l.startswith('error')]
ok(not errs and not bad, '0 errores ' + str(errs[:2]) + str(bad[:2]))
print('RESULTADO:', 'TODO OK' if not fails else f'{len(fails)} fallos: ' + '; '.join(fails)); b.close(); p.stop()
