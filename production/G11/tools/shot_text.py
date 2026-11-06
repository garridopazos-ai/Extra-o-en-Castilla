import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G11/shots/'
P=Play(sys.argv[1]); P.new()
P.ev("LAB1248.G.runner.run([{say:'Mi móvil dice «Has llegado». Me gustaría saber adónde, la verdad, porque esto no parece Talavera.'}])")
import time; t0=time.time()
P.pg.wait_for_timeout(1200); P.shot('txt_bubble')
print('dur', P.ev("LAB1248.G.ui.bubbles.map(b=>[b.text.length,+b.dur.toFixed(2),b.blocking])"))
P.pg.wait_for_function('LAB1248.G.ui.bubbles.length==0',timeout=20000); print('desaparece tras %.1f s'%(time.time()-t0))
P.ev("LAB1248.G.ui.overlay='menu'; LAB1248.G.pause(true)"); P.pg.wait_for_timeout(300); P.shot('txt_menu')
b=P.ev("LAB1248.button('m-text')"); P.ev(f"LAB1248.tapScreen({b['x']},{b['y']})"); P.pg.wait_for_timeout(200)
print('speed', P.ev('LAB1248.E.CONFIG.textSpeed'), P.ev("localStorage.getItem('1248_textSpeed')"))
P.close()
