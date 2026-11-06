import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); tag=sys.argv[2]; P.new(); G='LAB1248.G'
print('debug (artefactos) activado:',P.ev(f'{G}.debug.on'))
def pl(): return P.ev('(p=>[Math.round(p.x),Math.round(p.y)])(LAB1248.player())')
def cam(): return P.ev(f'{G}.S.camX')
def tgt(x,y): return P.ev(f'(()=>{{const t={G}.targetAt(x=>0,0)}})()') 
def at(x,y):
    return P.ev(f'(()=>{{const t={G}.targetAt({x}-{G}.S.camX,{y});return t?(t.kind+":"+t.id):null}})()')
def tap(x,y):
    P.ev(f'LAB1248.tapWorld({x},{y})'); return P.settle()
def look(label): print('%-34s scene=%s pos=%s cam=%s inv=%s'%(label,P.ev('LAB1248.scene()'),pl(),cam(),P.inv()))
def sel(i): P.ev(f'{G}.inventory.selected={json.dumps(i)}')
# --- zonas: qué se pulsa en cada punto visible del dibujo
checks=[('copa del fresno',200,150,'fresno'),('tronco del fresno',90,500,'fresno'),('muralla',900,380,'talavera'),('muralla der.',1500,330,'talavera'),
 ('río',1000,520,'rio'),('piedras del río',1200,745,'rocas'),('pértiga',940,760,'pertiga'),('moneda (brillo)',1760,630,'moneda'),
 ('poste',1972,600,'poste'),('puerta aceña',2030,410,'exit_acena'),('rueda vista fuera',1750,420,'rueda_ext'),('edificio aceña',1900,200,'acena_ext'),
 ('camino inundado',500,780,'inundacion'),('salida embarcadero',100,700,'exit_embarcadero')]
for n,x,y,exp in checks:
    r=at(x,y); print(('OK ' if r and r.endswith(exp) else 'XX '),n,(x,y),'->',r)
look('inicio')
tap(940,780); look('pértiga (toque en el suelo cercano)') if False else None
# toques reales sobre los objetos
P.ev(f'LAB1248.tapWorld(940,760)'); P.settle(); look('tras pulsar pértiga')
P.ev(f'LAB1248.tapWorld(1972,600)'); P.settle(); look('tras pulsar poste')
P.ev(f'{G}.inventory.combine("cuerda","pertiga")'); P.settle(); look('combinar')
sel('pertiga_lazo'); P.ev(f'LAB1248.tapWorld(1760,630)'); P.settle(); look('lazo sobre la moneda')
P.ev(f'LAB1248.tapWorld(2030,410)'); P.settle(); look('puerta de la aceña')
print('escena:',P.ev('LAB1248.scene()'))
P.shot(tag+'_acena_in')
# aceña
def at2(x,y): return at(x,y)
for n,x,y in (('rueda',300,350),('muela',770,500),('sacos',1280,650),('Durán',None,None)):
    if x: print(n,at2(x,y))
P.ev(f'LAB1248.tapWorld({P.ev(G+".npc(\'duran\').x")},{P.ev(G+".npc(\'duran\').y-150")})'); r=P.settle(); print('hablar con Durán por toque ->',r)
if r=='options':
    idx=P.ev(f'{G}.dialogue.options.findIndex(o=>o.o.text.startsWith("Nada"))'); P.ev(f'{G}.dialogue.choose({idx})'); P.settle()
sel('pertiga_lazo') if 'pertiga_lazo' in P.inv() else sel('pertiga')
P.ev('LAB1248.tapWorld(300,350)'); P.settle(); look('palanca sobre la rueda'); print('flags',P.flags())
P.pg.wait_for_timeout(800); P.shot(tag+'_wheel')
