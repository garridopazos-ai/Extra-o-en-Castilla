import cv2, numpy as np, json, os
BASE='/home/claude/extra-o-en-castilla/production/G10/work/vid/'
OUT='/home/claude/extra-o-en-castilla/production/G10/work/duran/'
os.makedirs(OUT,exist_ok=True)
CW,CH,GY_CELL,S = 176,348,340,0.2959   # celda, suelo dentro de la celda, escala fuente->celda
COLS=16
GROUND=1199.0

def rd(n,i): return cv2.imread(f'{BASE}k{n}/{i:03d}.png',cv2.IMREAD_UNCHANGED)
def metrics(k):
    a=k[...,3]>128; yy,xx=np.where(a); b=yy.max(); top=yy.min(); h=b-top
    foot=yy>b-0.10*h; fx=xx[foot].mean()
    q=a[int(top+.25*h):int(top+.55*h)]; tx=np.where(q)[1].mean()
    return dict(b=float(b),top=float(top),fx=float(fx),tx=float(tx))

# --- referencias de pies de los clips de pie
def clip_ref(n,idx):
    m=[metrics(rd(n,i)) for i in idx]
    return np.median([x['fx'] for x in m]),np.median([x['tx'] for x in m])
fx233,tx233=clip_ref(233,range(1,193,4)); fx234,tx234=clip_ref(234,range(1,193,4))
tx_stand=(tx233+tx234)/2; fx_stand=(fx233+fx234)/2
print('pies talk/listen',fx233,fx234,'torso',tx233,tx234)

def render(k,xref,gy):
    """Traslada (xref,gy) a (CW/2/S, GY_CELL/S) en lienzo fuente y reduce con INTER_AREA premultiplicado."""
    W=int(round(CW/S)); H=int(round(CH/S))
    M=np.float32([[1,0,CW/2/S-xref],[0,1,GY_CELL/S-gy]])
    f=k.astype(np.float32); a=f[...,3:4]/255.0
    pm=np.dstack([f[...,:3]*a,f[...,3:4]])
    w=cv2.warpAffine(pm,M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT,borderValue=0)
    r=cv2.resize(w,(CW,CH),interpolation=cv2.INTER_AREA)
    al=np.clip(r[...,3:4],0,255); un=np.where(al>0.5,r[...,:3]/(al/255.0),0)
    return np.dstack([un.clip(0,255),al]).astype(np.uint8), (w[...,3]>128)

frames={}; ext=[]
def add(name,fr):
    frames[name]=[f for f,_ in fr]
    for _,m in fr:
        xs=np.where(m.any(0))[0]; ext.append((name,xs.min()*S,xs.max()*S))

# reposo: frame de 234 más cercano a la media del bucle
seg=list(range(51,51+128))
th=[cv2.resize(rd(234,i).astype(np.float32),(60,106),interpolation=cv2.INTER_AREA) for i in seg]
mean=np.mean(th,0); rest_i=seg[int(np.argmin([np.abs(t-mean).mean() for t in th]))]
print('frame de reposo: 234 #',rest_i)
add('idle',[render(rd(234,rest_i),fx234,GROUND)])

# escucha: 234, bucle L=128 desde 51, paso 4 (6 fps)
add('listen',[render(rd(234,i),fx234,GROUND) for i in range(51,51+128,4)])
# habla: 233, bucle L=120 desde la mejor ventana; paso 3 (8 fps)
def best_start(n,L,lo,hi):
    T=[cv2.resize(rd(n,i).astype(np.float32),(60,106),interpolation=cv2.INTER_AREA) for i in range(1,193)]
    best=min((np.mean([np.abs(T[i+w]-T[i+L+w]).mean() for w in range(4)]),i) for i in range(lo,hi))
    return best[1]+1,best[0]
st,d=best_start(233,120,0,192-120-4); print('habla: inicio',st,'diff',round(float(d),2))
add('talk',[render(rd(233,i),fx233,GROUND) for i in range(st,st+120,3)])
# marcha: 252, bucle L=52, paso 2; pies fijados al suelo, torso alineado al de los clips de pie
st2,d2=best_start(252,52,60,192-52-4); print('marcha: inicio',st2,'diff',round(float(d2),2))
mw=[metrics(rd(252,i)) for i in range(st2,st2+52)]
txw=np.median([m['tx'] for m in mw]); xref_w=txw-(tx_stand-fx_stand)
walk=[]
for i in range(st2,st2+52,2):
    m=metrics(rd(252,i)); walk.append(render(rd(252,i),xref_w,m['b']))
add('walk',walk)

print({k:len(v) for k,v in frames.items()})
print('extensión horizontal máx por anim (px celda, centro=88):',{n:(round(min(e[1] for e in ext if e[0]==n),1),round(max(e[2] for e in ext if e[0]==n),1)) for n in frames})

# hoja: filas por animación, 16 columnas
order=['idle','walk','talk','listen']; rows={}; r=0
for n in order:
    rows[n]=r; r+=int(np.ceil(len(frames[n])/COLS))
sheet=np.zeros((r*CH,COLS*CW,4),np.uint8)
for n in order:
    for j,f in enumerate(frames[n]):
        rr=rows[n]+j//COLS; cc=j%COLS
        sheet[rr*CH:(rr+1)*CH,cc*CW:(cc+1)*CW]=f
cv2.imwrite(OUT+'sheet.png',sheet)
cv2.imwrite(OUT+'sheet.webp',sheet,[cv2.IMWRITE_WEBP_QUALITY,92])
json.dump(dict(rows=rows,counts={n:len(v) for n,v in frames.items()},cw=CW,ch=CH,cols=COLS,gy=GY_CELL,rest=rest_i,talk_start=st,walk_start=st2),open(OUT+'meta.json','w'))
print('hoja',sheet.shape,'webp',os.path.getsize(OUT+'sheet.webp'),'png',os.path.getsize(OUT+'sheet.png'))
