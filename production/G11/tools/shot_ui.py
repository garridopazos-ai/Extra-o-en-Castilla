import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G11/shots/'
P=Play(sys.argv[1]); P.new(); P.pg.wait_for_timeout(500)
for k in ['title','menu']:
    P.ev(f"LAB1248.G.ui.overlay='{k}'"); P.pg.wait_for_timeout(600); P.shot('ui_'+k)
P.ev("LAB1248.G.state.ended=true;LAB1248.G.ui.overlay='end'"); P.pg.wait_for_timeout(600); P.shot('ui_end')
print(P.ev('LAB1248.log().filter(e=>e.level!=="info")'))
P.close()
