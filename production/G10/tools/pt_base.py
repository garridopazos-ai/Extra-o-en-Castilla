import sys, json, time
from playwright.sync_api import sync_playwright
HTML=sys.argv[1]; SH='/home/claude/extra-o-en-castilla/production/G10/shots/'
tag=sys.argv[2] if len(sys.argv)>2 else 'base'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1600,'height':900})
    logs=[]; pg.on('console',lambda m: logs.append(m.type+': '+m.text)); pg.on('pageerror',lambda e: logs.append('PAGEERR '+str(e)))
    pg.goto('file://'+HTML); pg.wait_for_function('window.LAB1248 && LAB1248.ready()',timeout=60000)
    pg.evaluate('LAB1248.G.ui.overlay=null; LAB1248.G.paused=false')
    pg.evaluate('LAB1248.G.newGame()'); pg.wait_for_function('LAB1248.idle()',timeout=30000)
    print('scene',pg.evaluate('LAB1248.scene()'),'player',pg.evaluate('LAB1248.player()'))
    pg.wait_for_timeout(1500)
    pg.screenshot(path=SH+tag+'_01_start.png')
    print(json.dumps(pg.evaluate('LAB1248.log().filter(e=>e.level!=="info").slice(0,10)')))
    print('\n'.join(logs[:10]))
    b.close()
