import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G12/shots/'
P=Play(sys.argv[1])
P.ev("LAB1248.G.goto('acena','from_ribera')"); P.pg.wait_for_timeout(1500); P.settle(40); P.pg.wait_for_timeout(3000); P.settle(10)
P.shot('acena_parada')
P.ev("LAB1248.state().flags.rueda_libre=true; LAB1248.G.onStateChanged()"); P.pg.wait_for_timeout(1200); P.shot('acena_gira')
print(P.logs[-5:]); P.close()
