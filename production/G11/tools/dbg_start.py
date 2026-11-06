import sys
from playwright.sync_api import sync_playwright
F=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':915,'height':412},device_scale_factor=2)
    pg.goto('file://'+F); pg.wait_for_function('window.LAB1248 && LAB1248.G',timeout=60000); pg.wait_for_timeout(1500)
    c=pg.evaluate("LAB1248.toClient(420,832)"); pg.mouse.click(c['x'],c['y'])
    pg.wait_for_timeout(5000)
    print(pg.evaluate("""(()=>{const G=LAB1248.G,P=G.player;return {scene:LAB1248.scene(),p:P&&{x:P.x,y:P.y,vis:P.visible,hidden:P.hidden,anim:P.anim,alpha:P.alpha},cam:G.S&&G.S.camX,actors:G.S&&G.S.actors&&G.S.actors.length,ready:G.ready,trans:G.transitioning,overlay:G.ui.overlay,paused:G.paused}})()"""))
    pg.screenshot(path='/tmp/claude-0/-home-claude/f4712dc8-8b9f-5103-a819-27050e2d19ad/scratchpad/out/sh/dbg.png')
    b.close()
