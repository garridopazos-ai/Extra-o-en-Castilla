import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); P.new(); G='LAB1248.G'
P.ev(f'{G}.state.inventory.push("pertiga_lazo"); {G}.goto("acena","from_ribera")'); P.pg.wait_for_timeout(1500); P.settle()
def dbg(l): print(l,P.ev(f'JSON.stringify({{busy:{G}.runner.busy,dbg:{G}.runner.debug(),dlg:{G}.dialogue.active,notes:{G}.ui.notes.length,bub:{G}.ui.bubbles.length,pend:!!{G}.pending,pm:LAB1248.player().moving,sel:{G}.inventory.selected,ov:{G}.ui.overlay,inv:{G}.ui.invOpen}})'))
r=P.verb('npc','duran','talk'); dbg('tras hablar-> '+str(r))
P.ev(f'{G}.dialogue.choose({G}.dialogue.options.findIndex(o=>o.o.text.startsWith("Nada")))'); r=P.settle(); dbg('tras Nada -> '+str(r))
P.verb('hotspot','rueda','use','pertiga_lazo'); dbg('tras rueda')
print('duran',P.ev('LAB1248.npc("duran")'),'player',P.ev('LAB1248.player()'))
print('path',P.ev(f'(()=>{{const r={G}.S.nav.findPath({G}.player.x,{G}.player.y,1515,780);return JSON.stringify(r&&{{partial:r.partial,target:r.target,n:r.path.length}})}})()'))
print('inside',P.ev(f'{G}.S.nav.inside({G}.player.x,{G}.player.y)'))
r=P.verb('hotspot','exit_ribera','exit'); dbg('exit '+str(r)); print('texto',P.ev(f'{G}.ui.bubbles.map(b=>b.text)')); print(P.ev('LAB1248.scene()'),P.ev('LAB1248.player()'))
P.close()
