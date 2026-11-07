import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G12/shots/'
import os; os.makedirs(pt_lib.SH,exist_ok=True)
P=Play(sys.argv[1]); P.ev('LAB1248.G.newGame()'); P.pg.wait_for_function('LAB1248.scene()',timeout=30000)
P.pg.wait_for_timeout(1200)
print('scene',P.ev('LAB1248.scene()'),'title',P.ev('JSON.stringify(LAB1248.G.ui.sceneTitle)'))
P.shot('rc10_ribera_card')
P.settle()
P.verb('hotspot','pertiga','pick'); P.verb('hotspot','poste','pick')
P.verb('hotspot','exit_acena','exit'); P.pg.wait_for_timeout(1500)
print('scene',P.ev('LAB1248.scene()'),'title',P.ev('JSON.stringify(LAB1248.G.ui.sceneTitle)'))
P.shot('rc10_acena_card')
P.settle(); P.verb('hotspot','exit_ribera','exit'); P.pg.wait_for_timeout(1500)
print('revisit ribera, card?',P.ev('JSON.stringify(LAB1248.G.ui.sceneTitle)'))
print('LOGS',[l for l in P.logs if l.startswith(('error','PAGEERR','warning'))])
P.close()
