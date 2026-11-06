import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G11/shots/'
P=Play(sys.argv[1]); P.new()
P.ev("LAB1248.G.goto('acena','from_ribera')"); P.settle(40); P.pg.wait_for_timeout(500)
P.ev("(()=>{LAB1248.G.dialogue.open('duran')})()")
P.pg.wait_for_timeout(900); 
import time
for i in range(3):
    P.shot('f_talk%d'%i); P.ev('LAB1248.tapScreen(800,450)'); P.pg.wait_for_timeout(500)
P.close()
