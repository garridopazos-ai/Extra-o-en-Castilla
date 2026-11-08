"""RC14: Puerta del Río → Corredera del Cristo por la ronda, tertulia del soldado, aventuras rotando, desconocidos, mapa y vuelta."""
import sys, time, json
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
html, out = sys.argv[1], sys.argv[2]
P = Play(html); ev = P.ev
ev('LAB1248.E.rc07.autoDegrade=false'); ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(1200)
def ok(c, m): print(('OK    ' if c else 'FALLO ') + m)
def settle(maxs=60):
    t0 = time.time()
    while time.time() - t0 < maxs:
        if ev('LAB1248.idle()'): return True
        if ev('LAB1248.G.dialogue.active && LAB1248.G.dialogue.phase==="options"'): return 'options'
        ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()'); P.pg.wait_for_timeout(250)
ev("(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];G.state.flags.cruzado=true;G.state.visited.puerta_rio=3;G.changeScene('puerta_rio','start');})()")
P.pg.wait_for_timeout(1800); settle(30)
ev("(()=>{const G=LAB1248.G;G.player.x=1800;G.player.y=800;G.S.camF=600;})()"); P.pg.wait_for_timeout(1200)
P.pg.screenshot(path=out + '/c14_poste.png')
ev("(()=>{const G=LAB1248.G;const h=G.S.def.hotspots.find(h=>h.id==='exit_corredera');G.performVerb({kind:'hotspot',id:h.id,h},'exit',null);})()")
P.pg.wait_for_function("LAB1248.scene()==='corredera' && !LAB1248.G.transitioning", timeout=30000)
ok(True, 'se llega a la Corredera por la ronda de la muralla')
settle(40)
ok(ev("['soldado','arriero','peregrina'].every(id=>!!LAB1248.G.npc(id))"), 'soldado, arriero y peregrina en escena')
# tertulia: esperar a que hablen solos
said = set()
for i in range(70):
    P.pg.wait_for_timeout(500)
    for b in ev("LAB1248.G.ui.bubbles.filter(b=>b.tert).map(b=>b.actor.id+': '+b.text)"): said.add(b)
    if len(said) >= 3: break
P.pg.screenshot(path=out + '/c14_tertulia.png')
ok(len(said) >= 3, 'tertulia espontánea (%d frases): %s' % (len(said), sorted(said)[:3]))
# aventuras desde el diálogo
ev("(()=>{const G=LAB1248.G,n=G.sceneNpcs.find(n=>n.def.id==='soldado');G.performVerb({kind:'npc',id:'soldado',n},'talk',null);})()")
r = settle(60)
seen = []
for k in range(3):
    i = ev("LAB1248.G.dialogue.options.findIndex(o=>o.o.text.startsWith('Contadnos'))")
    if i < 0: ok(False, 'opción contar'); break
    ev('LAB1248.G.dialogue.choose(%d)' % i)
    lines = []
    for j in range(40):
        P.pg.wait_for_timeout(250)
        for b in ev("(()=>{const l=LAB1248.G.dialogue.line;return l?[l.who+': '+l.text]:[]})()"): 
            if b not in lines: lines.append(b)
        if j == 6 and k == 0: P.pg.screenshot(path=out + '/c14_aventura.png')
        if ev('LAB1248.G.dialogue.active && LAB1248.G.dialogue.phase==="options"'): break
        ev('LAB1248.G.dialogue.advance()')
    seen.append(lines[2] if len(lines) > 2 else lines)
ok(len(set(map(str, seen))) == 3, 'tres aventuras distintas seguidas: %s' % [str(s)[:60] for s in seen])
i = ev("LAB1248.G.dialogue.options.findIndex(o=>o.o.text.startsWith('Nada'))"); ev('LAB1248.G.dialogue.choose(%d)' % i); settle(30)
for npc in ('arriero', 'peregrina'):
    ev("(()=>{const G=LAB1248.G,n=G.sceneNpcs.find(n=>n.def.id==='%s');G.performVerb({kind:'npc',id:'%s',n},'talk',null);})()" % (npc, npc))
    r = settle(40); ok(r == 'options', 'diálogo con ' + npc)
    i = ev("LAB1248.G.dialogue.options.length-1"); ev('LAB1248.G.dialogue.choose(%d)' % i); settle(20)
ev("LAB1248.E.journey.open(LAB1248.G, LAB1248.G.ui)"); P.pg.wait_for_timeout(600); P.pg.screenshot(path=out + '/c14_mapa.png')
ok(ev("LAB1248.E.journey.places.corredera && LAB1248.E.journey.places.corredera[3]") == 'Corredera del Cristo', 'pin en el mapa')
ev("LAB1248.E.journey.setDestination('plaza')"); P.pg.wait_for_timeout(300); ev("LAB1248.E.journey.close(LAB1248.G, LAB1248.G.ui)")
ev("(()=>{const G=LAB1248.G;const h=G.S.def.hotspots.find(h=>h.id==='exit_puerta');G.performVerb({kind:'hotspot',id:h.id,h},'exit',null);})()")
P.pg.wait_for_function("LAB1248.scene()==='puerta_rio' && !LAB1248.G.transitioning", timeout=30000); ok(True, 'vuelta a la Puerta del Río')
ok(not ev("!!LAB1248.G.npcs.inScene('iglesia').find(n=>n.def.id==='soldado')"), 'el soldado ya no está en Santa María')
print('errores:', [l for l in P.logs if 'rror' in l or 'PAGEERR' in l][:5], ev("LAB1248.log().filter(e=>e.level!=='info').map(e=>JSON.stringify(e).slice(0,160)).slice(0,5)"))
P.close()
