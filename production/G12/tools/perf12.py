import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1])
P.ev("LAB1248.state().flags.mingo_sigue=true; LAB1248.state().flags.mingo_robo=true; LAB1248.G.goto('orilla','from_ribera')"); P.pg.wait_for_timeout(1500); P.settle(30)
P.ev("LAB1248.G.walkPlayer(3000,760)"); P.ev('LAB1248.resetPerf()'); P.pg.wait_for_timeout(6000)
print('orilla',P.ev('LAB1248.perf()'))
P.ev("LAB1248.G.goto('plaza','from_puerta')"); P.pg.wait_for_timeout(1500); P.settle(30); P.ev('LAB1248.resetPerf()'); P.pg.wait_for_timeout(4000)
print('plaza',P.ev('LAB1248.perf()')); P.shot('../../G12/shots/g12_plaza_rigs'); print(P.logs[-5:])
P.close()
