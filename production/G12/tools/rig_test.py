import sys, json
from playwright.sync_api import sync_playwright
LOOKS = json.load(open(sys.argv[1])) ; OUT = sys.argv[2]
html = """<html><body style='margin:0;background:#cdbf8a'><canvas id=c width=1600 height=900></canvas><script>@@RIG@@</script><script>
const E=window.E1248; const ctx=document.getElementById('c').getContext('2d');
const LOOKS=@@LOOKS@@;
window.frame=(t,mode)=>{ ctx.fillStyle='#d8cfa8'; ctx.fillRect(0,0,1600,900); ctx.fillStyle='#b9ad7c'; ctx.fillRect(0,600,1600,300);
 let x=120; LOOKS.forEach((L,i)=>{ const h=L.height||300; const a={visible:true,def:{rig:L,height:h},animT:t+i*0.7,x:x,y:(i%2? 840:560),facing:'right',lastH:'right',
   anim: mode==='walk'?'walk':(mode==='work'?'work':'idle'), moving: mode==='walk', walkDist: t*180, talking: mode==='talk', listening:false};
   E.rig.draw(ctx,a,i%2?1:0.8,0); ctx.fillStyle='#000'; ctx.font='18px sans-serif'; ctx.fillText(L.name||'',x-40,(i%2?870:590)); x+=Math.max(150,h*0.5)+40; }); };
</script></body></html>""".replace("@@RIG@@", open('g12_rig.js').read()).replace("@@LOOKS@@", json.dumps(LOOKS))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width':1600,'height':900})
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.set_content(html)
    for mode in sys.argv[3].split(','):
        for j,t in enumerate([0.1,0.35]):
            pg.evaluate(f"frame({t},'{mode}')"); pg.screenshot(path=f'{OUT}_{mode}{j}.png')
    print('errs', errs); b.close()
