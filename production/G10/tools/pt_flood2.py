import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
from pt_lib import *
P=Play(sys.argv[1]); tag=sys.argv[2]; P.new(); G='LAB1248.G'
def pl(): return P.ev('(p=>[Math.round(p.x),Math.round(p.y)])(LAB1248.player())')
def tap(x,y):
    P.ev(f'LAB1248.tapWorld({x},{y})'); P.pg.wait_for_timeout(500); return P.settle()
# 1) caminar hacia el agua desde la derecha: cerca de la orilla, por varias alturas
for ty in (730,800,870):
    P.ev(f'{G}.player.x=900;{G}.player.y={ty}'); P.pg.wait_for_timeout(300)
    r=tap(300,ty); p=pl()
    # distancia al borde visible del agua (floodEdge) a esa y
    edge=P.ev(f'(()=>{{const f=E1248.DATA.scenes.ribera.flood;let best=1e9;for(let i=0;i<f.length;i++){{const a=f[i],b=f[(i+1)%f.length];const dx=b[0]-a[0],dy=b[1]-a[1];let t=((p=>({p}))(0),0);}}return 0}})()')
    print('destino x=300 y=%d -> se detiene en %s (agua visible empieza hacia x≈%s)'%(ty,p,'?'))
# 2) con borde exacto: pies dentro del polígono visible?
inside=P.ev('''(()=>{const f=E1248.DATA.scenes.ribera.flood,p=LAB1248.player();let c=false;
 for(let i=0,j=f.length-1;i<f.length;j=i++){const [xi,yi]=f[i],[xj,yj]=f[j];if((yi>p.y)!=(yj>p.y)&&p.x<(xj-xi)*(p.y-yi)/(yj-yi)+xi)c=!c;}return c})()''')
print('pies dentro del agua visible:',inside)
P.ev(f'{G}.player.x=900;{G}.player.y=800'); P.pg.wait_for_timeout(300)
tap(300,800); P.pg.wait_for_timeout(600); P.shot(tag+'_flood_stop')
# desde la izquierda de nuevo: inaccesible
P.ev(f'{G}.player.x=200;{G}.player.y=800'); P.pg.wait_for_timeout(300)
tap(900,800); print('desde la orilla izq. hacia la dcha ->',pl())
# tocar salida embarcadero con agua: bloqueada
P.ev(f'{G}.player.x=900;{G}.player.y=800'); P.pg.wait_for_timeout(300)
tap(100,700); print('salida embarcadero con agua: escena',P.ev('LAB1248.scene()'),pl()); P.shot(tag+'_flood_blocked')
print('err',P.ev('LAB1248.log().filter(e=>e.level!=="info")'))
P.close()
