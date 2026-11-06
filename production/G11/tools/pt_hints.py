import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
P=Play(sys.argv[1]); P.new()
def o(l): print('%-34s -> %s'%(l,P.ev('LAB1248.G.ui.objective()')))
o('inicio'); P.verb('hotspot','acena_ext','look'); o('mirar aceña')
P.verb('hotspot','acena_ext','exit'); o('en la aceña (sin saber tronco)')
P.verb('hotspot','rueda','look'); o('mirar rueda')
P.verb('hotspot','exit_ribera','exit'); P.verb('hotspot','pertiga','pick'); o('pértiga')
P.verb('hotspot','poste','pick'); P.ev('LAB1248.G.inventory.combine("cuerda","pertiga")'); P.settle(); o('lazo')
P.verb('hotspot','acena_ext','exit'); P.verb('hotspot','rueda','use','pertiga_lazo'); P.settle(60); o('rueda libre')
print('hint text sample:',P.ev('(()=>{const h=LAB1248.E.DATA.hints;return h.length})()'))
print('errores:',P.ev('LAB1248.log().filter(e=>e.level!=="info")'))
P.close()
