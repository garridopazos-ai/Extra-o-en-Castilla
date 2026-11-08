"""RC13: viñeta del caldero de Rai en la visita al Chamelo, nombre «Rai» y el viejo soldado en Santa María."""
import sys, time, json
sys.path.insert(0, '/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import Play
html, out = sys.argv[1], sys.argv[2]
P = Play(html); ev = P.ev
ev('LAB1248.E.rc07.autoDegrade=false'); ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(1200)
def ok(c, m): print(('OK    ' if c else 'FALLO ') + m)
ok(ev("JSON.stringify(LAB1248.E.DATA).indexOf('Raimundo')") < 0, 'sin «Raimundo» en los textos')
ok(ev("LAB1248.E.DATA.npcs.leonor.name") == 'Rai', 'nombre del NPC: ' + ev("LAB1248.E.DATA.npcs.leonor.name"))
ev("(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];const s=G.state;['mingo_robo','trato_mingo','racimo_dado','mingo_sigue','rueda_libre','sabe_aceña','elvira_conoce_aceña'].forEach(f=>s.flags[f]=true);s.inventory.push('mingo');s.visited.chamelo=0;G.changeScene('chamelo','from_orilla');})()")
P.pg.wait_for_timeout(1500)
seen = None; t0 = time.time(); shots = 0
while time.time() - t0 < 120:
    if ev('LAB1248.E.rc07.vignetteOn()'):
        if seen is None: seen = time.time()
        if shots < 2 and time.time() - seen > (1.5 if shots == 0 else 4.0):
            P.pg.screenshot(path=out + '/vineta_%d.png' % shots); shots += 1
            print('  vídeo', ev("(()=>{const v=document.querySelector('video')||Object.values(LAB1248.E.rc07).find(x=>x&&x.tagName);return null})()"))
        P.pg.wait_for_timeout(250); continue
    if seen and time.time() - seen > 2: break
    if ev('LAB1248.idle()'): break
    ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()'); P.pg.wait_for_timeout(300)
ok(seen is not None, 'viñeta del caldero mostrada (%.1f s)' % ((time.time() - seen) if seen else 0))
for i in range(80):
    if ev('LAB1248.idle()'): break
    ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();else G.ui.advance();})()'); P.pg.wait_for_timeout(250)
ok(ev("!!LAB1248.state().flags.pista_leonor"), 'consejo de Rai completo (pista_leonor)')
# soldado
ev("(()=>{const G=LAB1248.G;G.runner.clear();G.dialogue.close();G.ui.bubbles=[];G.ui.notes=[];G.state.visited.iglesia=3;G.changeScene('iglesia','from_plaza');})()"); P.pg.wait_for_timeout(2000)
ok(ev("!!LAB1248.G.npc('soldado')"), 'viejo soldado en Santa María')
ev("(()=>{const G=LAB1248.G,n=G.sceneNpcs.find(n=>n.def.id==='soldado');G.performVerb({kind:'npc',id:'soldado',n},'talk',null);})()")
lines = []
for i in range(60):
    P.pg.wait_for_timeout(300)
    if ev('LAB1248.G.dialogue.active && LAB1248.G.dialogue.phase==="options"'):
        opts = ev('LAB1248.G.dialogue.options.map(o=>o.o.text)'); break
    ev('(()=>{const G=LAB1248.G;if(G.dialogue.active)G.dialogue.advance();})()')
print('  opciones:', opts)
P.pg.screenshot(path=out + '/soldado_dialogo.png')
for o in ['¿Quién sois?', '¿Vigiláis la campana?', '¿Y la punta de vuestra lanza?']:
    i = ev('LAB1248.G.dialogue.options.findIndex(x=>x.o.text===%s)' % json.dumps(o)); ev('LAB1248.G.dialogue.choose(%d)' % i)
    for k in range(40):
        P.pg.wait_for_timeout(250)
        if ev('LAB1248.G.dialogue.active && LAB1248.G.dialogue.phase==="options"'): break
        if k == 3: P.pg.screenshot(path=out + '/soldado_habla.png')
        ev('LAB1248.G.dialogue.advance()')
    ok(ev('LAB1248.G.dialogue.active'), 'opción «%s» y vuelta al menú' % o)
print('errores:', [l for l in P.logs if 'rror' in l or 'PAGEERR' in l][:5], ev('LAB1248.log().filter(e=>e.level!=="info").map(e=>e.msg||e.text||JSON.stringify(e)).slice(0,5)'))
P.close()
