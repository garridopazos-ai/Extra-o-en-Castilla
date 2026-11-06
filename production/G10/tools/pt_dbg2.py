import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); P.new(); G='LAB1248.G'
P.ev(f'{G}.state.inventory.push("pertiga"); {G}.goto("acena","from_ribera")'); P.pg.wait_for_timeout(1500); P.settle()
P.verb('hotspot','rueda','use','pertiga'); print('flags',P.flags())
for i in range(4):
    print(i,P.ev(f'JSON.stringify({{busy:{G}.runner.busy,dbg:{G}.runner.debug(),dlg:{G}.dialogue.active,notes:{G}.ui.notes.length,bub:{G}.ui.bubbles.length,pend:!!{G}.pending,trans:{G}.transitioning,pm:LAB1248.player().moving}})'))
    P.pg.wait_for_timeout(700)
r=P.verb('hotspot','exit_ribera','exit'); print('exit ->',r,P.ev('LAB1248.scene()'),P.ev('LAB1248.player()'))
print(P.ev(f'JSON.stringify({{busy:{G}.runner.busy,dbg:{G}.runner.debug(),pend:!!{G}.pending}})'))
P.close()
