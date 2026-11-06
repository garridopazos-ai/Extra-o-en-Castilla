import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G11/shots/'
P=Play(sys.argv[1]); P.new()
P.ev('(()=>{const s=LAB1248.state();["barca_libre","met_alfonso"].forEach(f=>s.flags[f]=true);})()')
P.ev("LAB1248.G.goto('travesia','start')"); P.pg.wait_for_timeout(2500); P.shot('trav1')
P.settle(60); print(P.ev('LAB1248.scene()'), P.logs[:5], P.ev('LAB1248.log().filter(e=>e.level!=="info")'))
P.close()
