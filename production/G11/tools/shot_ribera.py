import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G11/shots/'
P=Play(sys.argv[1]); P.new(); P.settle()
P.ev('LAB1248.G.debug.on=true') if len(sys.argv)>3 and sys.argv[3]=='dbg' else None
P.ev("(()=>{const G=LAB1248.G;G.player.x=1900;G.player.y=800;})()"); P.pg.wait_for_timeout(1500); P.shot(sys.argv[2]+'_ribera_der')
P.ev("(()=>{const G=LAB1248.G;G.player.x=600;G.player.y=800;})()"); P.pg.wait_for_timeout(1500); P.shot(sys.argv[2]+'_ribera_izq')
P.close()
