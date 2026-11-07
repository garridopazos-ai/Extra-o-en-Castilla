import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from playwright.sync_api import sync_playwright
F=sys.argv[1]; SH='/home/claude/extra-o-en-castilla/production/LAB_ACENA/shots/'
def run(vp, dsf, tag):
    with sync_playwright() as p:
        b=p.chromium.launch(); pg=b.new_page(viewport=vp, device_scale_factor=dsf)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+F); pg.wait_for_function('window.LAB1248 && LAB1248.G && LAB1248.G.ready',timeout=60000)
        ev=pg.evaluate
        ev('LAB1248.G.newGame()'); pg.wait_for_timeout(1500)
        for i in range(40):
            if not ev('LAB1248.G.runner.busy') and not ev('LAB1248.G.ui.notes.length'): break
            ev('LAB1248.tapScreen(800,450)'); pg.wait_for_timeout(250)
        ev('LAB1248.G.walkPlayer(1180,740)'); pg.wait_for_timeout(4500)
        pg.screenshot(path=SH+tag+'_exterior.png')
        ev("LAB1248.state().flags.pista_elvira=false; LAB1248.G.goto('acena','from_ext')"); pg.wait_for_timeout(1500)
        for i in range(10): ev('LAB1248.tapScreen(800,450)'); pg.wait_for_timeout(200)
        ev('LAB1248.G.walkPlayer(1045,756)'); pg.wait_for_timeout(3500)
        ev("LAB1248.G.runner.run([{npcWalk:['duran',930,772]},{npcFace:['duran','player']},{face:'left'},{say:'Si ya habéis terminado de miraros, ese saco también quiere que alguien le haga caso.', who:'duran'}])"); pg.wait_for_timeout(5200)
        pg.screenshot(path=SH+tag+'_interior.png')
        print(tag, 'errores', errs); b.close()
run({'width':1600,'height':900},1,'juego')
run({'width':915,'height':412},2.6,'movil')
