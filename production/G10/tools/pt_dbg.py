import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); P.new()
G='LAB1248.G'
print(P.ev(f'({G}.debug.on, JSON.stringify({{busy:{G}.runner.busy,trans:{G}.transitioning,overlay:{G}.ui.overlay,paused:{G}.paused,portrait:{G}.display.portrait}}))'))
r=P.verb('hotspot','pertiga','pick'); print('pick pértiga ->',r,P.inv(),P.ev('LAB1248.player()'))
print(P.ev(f'JSON.stringify({{busy:{G}.runner.busy,pending:!!{G}.pending,dbg:{G}.runner.debug()}})'))
P.shot('dbg1'); P.close()
