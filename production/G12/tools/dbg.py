import sys,json
from playwright.sync_api import sync_playwright
F=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1600,'height':900})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: m.type in('error','warning') and errs.append(m.text))
    pg.goto('file://'+F); pg.wait_for_function('window.LAB1248 && LAB1248.G && LAB1248.G.ready',timeout=60000)
    pg.evaluate('LAB1248.G.newGame()')
    for i in range(8):
        pg.wait_for_timeout(1500)
        print(pg.evaluate("JSON.stringify({run:LAB1248.G.runner.debug(),bub:LAB1248.G.ui.bubbles.map(b=>b.text.slice(0,30)),notes:LAB1248.G.ui.notes.map(n=>n.text.slice(0,30)),scene:LAB1248.scene(),npcs:LAB1248.G.sceneNpcs.map(n=>n.def.id+'@'+Math.round(n.actor.x)+','+Math.round(n.actor.y)+(n.actor.moving?'M':''))})"))
    pg.screenshot(path='/home/claude/extra-o-en-castilla/production/G12/shots/dbg.png')
    print(errs[:8]); b.close()
