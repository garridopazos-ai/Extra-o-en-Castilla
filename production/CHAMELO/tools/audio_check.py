"""Nivel del ambiente por escena (sin música): RMS en dBFS medido a la salida general."""
import sys, json
from playwright.sync_api import sync_playwright
html = sys.argv[1]
p = sync_playwright().start(); b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files'])
pg = b.new_page(viewport={'width': 1600, 'height': 900}); logs = []
pg.on('pageerror', lambda e: logs.append('PAGEERR ' + str(e))); pg.on('console', lambda m: logs.append(m.text) if m.type == 'error' else None)
pg.goto('file://' + html); pg.wait_for_function('window.LAB1248 && LAB1248.ready()', timeout=90000)
ev = pg.evaluate
ev('LAB1248.E.rc07.autoDegrade=false')
c = ev("(()=>{const b=LAB1248.button('t-new');return LAB1248.toClient(b.x,b.y)})()"); pg.mouse.click(c['x'], c['y']); pg.wait_for_timeout(3500)
ev("""(()=>{const A=LAB1248.E.audio;const mg=A.musicGain; if(mg){mg.gain.cancelScheduledValues(0);mg.gain.value=0;} A.musicLevel=0;
const an=A.ctx.createAnalyser(); an.fftSize=4096; A.master.connect(an); window.__an=an;})()""")
for sid in ['ribera', 'orilla', 'acena', 'chamelo', 'embarcadero', 'travesia', 'puerta_rio', 'plaza', 'iglesia', 'portazgo', 'audiencia', 'alfar']:
    ev("(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];G.state.visited['%s']=3;G.changeScene('%s',Object.keys(LAB1248.E.DATA.scenes['%s'].entries)[0]);})()" % (sid, sid, sid))
    pg.wait_for_timeout(2500)
    vals = []
    for i in range(16):
        pg.wait_for_timeout(250)
        vals.append(ev("(()=>{const a=new Float32Array(__an.fftSize);__an.getFloatTimeDomainData(a);let s=0,pk=0;for(const v of a){s+=v*v;pk=Math.max(pk,Math.abs(v));}return [Math.sqrt(s/a.length),pk]})()"))
    import math
    rms = sum(v[0] for v in vals) / len(vals); pk = max(v[1] for v in vals)
    print('%-12s ambiente=%s  RMS %.1f dBFS  pico %.1f dBFS' % (sid, ev('LAB1248.E.rc07.snd.scene'), 20 * math.log10(max(rms, 1e-9)), 20 * math.log10(max(pk, 1e-9))))
print('errores', logs[:8])
b.close(); p.stop()
