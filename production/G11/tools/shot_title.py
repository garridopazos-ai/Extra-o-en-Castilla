import sys,time; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from playwright.sync_api import sync_playwright
F=sys.argv[1]; O=sys.argv[2]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':915,'height':412},device_scale_factor=2.6)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
    pg.goto('file://'+F); pg.wait_for_function('window.LAB1248 && LAB1248.G',timeout=60000); pg.wait_for_timeout(1500)
    pg.screenshot(path=O+'/t0_title.png')
    bt=pg.evaluate("(()=>{const b=LAB1248.G.ui.findButton('t-new');return b&&[b.x,b.y,b.w,b.h]})()"); print('btn',bt)
    # coords lógicos -> pantalla
    r=pg.evaluate("(()=>{const c=document.querySelector('canvas').getBoundingClientRect();return [c.left,c.top,c.width,c.height]})()")
    x=r[0]+(bt[0]+bt[2]/2)/1600*r[2]; y=r[1]+(bt[1]+bt[3]/2)/900*r[3]; pg.mouse.click(x,y)
    pg.wait_for_timeout(700); pg.screenshot(path=O+'/t1_zoom.png')
    pg.wait_for_timeout(1300); pg.screenshot(path=O+'/t2_after.png')
    pg.wait_for_timeout(2500); pg.screenshot(path=O+'/t3_game.png')
    print('scene',pg.evaluate("LAB1248.G.state.scene"),'overlay',pg.evaluate("LAB1248.G.ui.overlay"),'music',pg.evaluate("LAB1248.E.audio.music"))
    print('errs',errs[:5]); b.close()
