"""Voces fuera de plano: al entrar en el soto no debe hablar nadie que no se vea. Captura de Mingo en la rama (acortada)."""
import sys, time
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
html, out = sys.argv[1], sys.argv[2]
P = Play(html); ev = P.ev
ev('LAB1248.E.rc07.autoDegrade=false')
def settle(maxs=90):
    t0 = time.time()
    while time.time() - t0 < maxs:
        if ev('LAB1248.idle()'): return True
        if ev('LAB1248.G.dialogue.active && LAB1248.G.dialogue.phase==="options"'): return 'options'
        ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()'); P.pg.wait_for_timeout(250)
SEEN = {}
def watch(secs):
    t0 = time.time()
    while time.time() - t0 < secs:
        for b in ev("(()=>{const G=LAB1248.G,S=G.S;return G.ui.bubbles.filter(b=>!b.done&&b.actor).map(b=>[b.actor.id,Math.round(LAB1248.E.rc07.cam.toScreen(b.actor.x-S.camX,b.actor.y)[0]),b.text,b.blocking])})()"):
            SEEN[(b[0], b[2])] = (b[1], b[3])
        if ev('LAB1248.G.runner.busy || LAB1248.G.ui.notes.length'): ev('(()=>{const G=LAB1248.G;G.ui.advance();})()')
        P.pg.wait_for_timeout(300)
ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(1000); watch(4); settle(120)
ev("(()=>{const G=LAB1248.G;const h=G.S.def.hotspots.find(h=>h.id==='exit_orilla');G.performVerb({kind:'hotspot',id:h.id,h},'exit',null);})()")
P.pg.wait_for_function("LAB1248.scene()==='orilla' && !LAB1248.G.transitioning", timeout=60000)
watch(40)
off = {k: v for k, v in SEEN.items() if not (0 < v[0] < 1600)}
print('bocadillos vistos:', len(SEEN)); print('fuera de plano:', off)
for k, v in SEEN.items(): print('  ', v, k[0], '|', k[1][:70])
# hasta la higuera: Mingo en la rama
ev("LAB1248.tapWorld(2050, 780)"); P.pg.wait_for_timeout(9000); settle(20)
print('mingo', ev("LAB1248.npc('mingo')"), 'perch?', ev("LAB1248.G.npc('mingo').y < 550"))
P.pg.screenshot(path=out + '/mingo_rama.png')
print([l for l in P.logs if 'rror' in l][:5])
P.close()
