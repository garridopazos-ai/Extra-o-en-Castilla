import json, time
from playwright.sync_api import sync_playwright
SH='/home/claude/extra-o-en-castilla/production/G10/shots/'
class Play:
    def __init__(s,html,w=1600,h=900):
        s.p=sync_playwright().start()
        s.b=s.p.chromium.launch(args=['--use-gl=swiftshader','--allow-file-access-from-files'])
        s.pg=s.b.new_page(viewport={'width':w,'height':h})
        s.logs=[]; s.pg.on('console',lambda m: s.logs.append(m.type+': '+m.text)); s.pg.on('pageerror',lambda e: s.logs.append('PAGEERR '+str(e)))
        s.pg.goto('file://'+html); s.pg.wait_for_function('window.LAB1248 && LAB1248.ready()',timeout=60000)
        s.pg.evaluate('LAB1248.G.ui.overlay=null; LAB1248.G.paused=false')
    def ev(s,js): return s.pg.evaluate(js)
    def new(s):
        s.ev('LAB1248.G.newGame()'); s.pg.wait_for_function('LAB1248.idle()',timeout=30000); s.settle()
    def settle(s,maxs=40):
        """avanza frases/notas con toques hasta que el juego queda libre"""
        t0=time.time()
        while time.time()-t0<maxs:
            if s.ev('LAB1248.idle()'): return True
            if s.ev('LAB1248.G.dialogue.active && LAB1248.G.dialogue.phase==="options"'): return 'options'
            if s.ev('(()=>{const G=LAB1248.G;return G.runner.busy||G.dialogue.active||G.ui.notes.length>0})()'):
                s.ev('LAB1248.tapScreen(800,450)')
            s.pg.wait_for_timeout(260)
        return False
    def shot(s,name): s.pg.screenshot(path=SH+name+'.png')
    def flags(s): return s.ev('Object.keys(LAB1248.state().flags)')
    def inv(s): return s.ev('LAB1248.state().inventory')
    def verb(s,kind,id,verb='default',item=None):
        js='''(()=>{const G=LAB1248.G;let t;
        if(%s==="npc"){const n=G.sceneNpcs.find(n=>n.def.id===%s);t={kind:'npc',id:%s,n};}
        else{const h=G.S.def.hotspots.find(h=>h.id===%s);t={kind:'hotspot',id:%s,h};}
        G.performVerb(t,%s,%s);})()'''%(json.dumps(kind),json.dumps(id),json.dumps(id),json.dumps(id),json.dumps(id),json.dumps(verb),json.dumps(item))
        s.ev(js); return s.settle()
    def close(s):
        try: s.b.close(); s.p.stop()
        except Exception: pass
