import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/LAB_ACENA/shots/'
P=Play(sys.argv[1]); P.ev('LAB1248.G.newGame()'); P.pg.wait_for_timeout(800); P.settle(60); P.pg.wait_for_timeout(500)
P.shot('ext'); print(P.ev("LAB1248.scene()"), P.ev("[LAB1248.G.player.x,LAB1248.G.player.y]"))
P.verb('hotspot','puerta','exit'); P.pg.wait_for_timeout(1200); P.settle(60); P.pg.wait_for_timeout(1500); P.settle(5)
P.shot('int'); print(P.ev("LAB1248.scene()"), P.logs[-5:])
P.ev('LAB1248.G.debug.toggle()'); P.pg.wait_for_timeout(500); P.shot('int_debug')
P.close()
