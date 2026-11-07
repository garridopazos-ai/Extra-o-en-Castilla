import sys
from playwright.sync_api import sync_playwright
F=sys.argv[1]; out='/home/claude/extra-o-en-castilla/production/G12/shots/'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1600,'height':900}); errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') else None); pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file://'+F); pg.wait_for_function('window.LAB1248 && LAB1248.G',timeout=60000); pg.wait_for_timeout(1500)
    pg.screenshot(path=out+'rc11_titulo.png')
    c=pg.evaluate("LAB1248.toClient(420,832)"); pg.mouse.click(c['x'],c['y']); pg.wait_for_timeout(5000)
    print('escena',pg.evaluate("LAB1248.scene()"),'jugador',pg.evaluate("!!LAB1248.G.player && LAB1248.G.player.visible!==false"),'errores',errs)
    pg.screenshot(path=out+'rc11_inicio.png'); b.close()
