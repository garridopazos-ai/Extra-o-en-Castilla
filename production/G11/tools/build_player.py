"""Hoja del protagonista desde los clips 216 (marcha, 3/4 a la derecha), 222 (reposo) y 223 (habla). 720x1280, 24 fps, croma ya aplicado.
Uso: python build_player.py <dir con k216 k222 k223> <salida>"""
import cv2, numpy as np, json, os, sys, glob
BASE=sys.argv[1].rstrip('/')+'/'; OUT=sys.argv[2].rstrip('/')+'/'; os.makedirs(OUT,exist_ok=True)
CW,CH,GY_CELL,S = 240,348,340,0.315
COLS=12; L=36; WALK_START=133; TALK_A,TALK_B,TALK_STEP=1,121,2
K=lambda c: sorted(glob.glob(BASE+'k%s/*.png'%c)); rd=lambda c,i: cv2.imread(K(c)[i-1],cv2.IMREAD_UNCHANGED)
def metrics(k):
    a=k[...,3]>128; yy,xx=np.where(a); b=yy.max(); top=yy.min(); h=b-top
    foot=yy>b-0.10*h; q=a[int(top+.25*h):int(top+.55*h)]
    return dict(b=float(b),top=float(top),fx=float(xx[foot].mean()),tx=float(np.where(q)[1].mean()),sep=float(xx[foot].max()-xx[foot].min()))
def render(k,xref,gy):
    W=int(round(CW/S)); H=int(round(CH/S))
    M=np.float32([[1,0,CW/2/S-xref],[0,1,GY_CELL/S-gy]])
    f=k.astype(np.float32); a=f[...,3:4]/255.0
    pm=np.dstack([f[...,:3]*a,f[...,3:4]])
    w=cv2.warpAffine(pm,M,(W,H),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT,borderValue=0)
    r=cv2.resize(w,(CW,CH),interpolation=cv2.INTER_AREA)
    al=np.clip(r[...,3:4],0,255); un=np.where(al>0.5,r[...,:3]/(al/255.0),0)
    return np.dstack([un.clip(0,255),al]).astype(np.uint8),(w[...,3]>128)
# reposo: de 222, el fotograma tranquilo (tras colocarse la chaqueta) con los pies más juntos
cand=range(150,190); ms={i:metrics(rd('222',i)) for i in cand}; ri=min(cand,key=lambda i:ms[i]['sep']); mi=ms[ri]
print('reposo 222: fotograma',ri,mi)
frames={'idle':[render(rd('222',ri),mi['tx'],mi['b'])]}
# marcha: ciclo L fotogramas de 216, centrado por el torso (mismo desfase torso-pies que el reposo para que no «salte» al parar)
mw=[metrics(rd('216',i)) for i in range(WALK_START,WALK_START+L)]; txw=np.median([m['tx'] for m in mw])
frames['walk']=[render(rd('216',i),txw,metrics(rd('216',i))['b']) for i in range(WALK_START,WALK_START+L)]
# OJO: en los clips del protagonista (216/222/223) el arte MIRA A LA IZQUIERDA (la mochila queda a la derecha). La hoja se declara con baseFacing:'left'.
# habla: gesto de 223, ida y vuelta (sin saltos de bucle)
seq=list(range(TALK_A,TALK_B+1,TALK_STEP)); seq=seq+seq[-2:0:-1]
mt=[metrics(rd('223',i)) for i in seq[:len(seq)//2+1]]; txt=np.median([m['tx'] for m in mt])
cache={}
def tk(i):
    if i not in cache: cache[i]=render(rd('223',i),txt,metrics(rd('223',i))['b'])
    return cache[i]
frames['talk']=[tk(i) for i in seq]
order=['idle','walk','talk']; rows={}; r=0
for n in order: rows[n]=r; r+=int(np.ceil(len(frames[n])/COLS))
sheet=np.zeros((r*CH,COLS*CW,4),np.uint8)
for n in order:
    for j,(f,_) in enumerate(frames[n]):
        rr=rows[n]+j//COLS; cc=j%COLS; sheet[rr*CH:(rr+1)*CH,cc*CW:(cc+1)*CW]=f
cv2.imwrite(OUT+'sheet.png',sheet); cv2.imwrite(OUT+'sheet.webp',sheet,[cv2.IMWRITE_WEBP_QUALITY,85])
ext=[(np.where(m.any(0))[0].min()*S,np.where(m.any(0))[0].max()*S) for n in order for _,m in frames[n]]
print('extensión horizontal en celda (centro %d): %.1f .. %.1f'%(CW//2,min(e[0] for e in ext),max(e[1] for e in ext)))
json.dump(dict(rows=rows,counts={n:len(v) for n,v in frames.items()},cw=CW,ch=CH,cols=COLS,gy=GY_CELL,L=L,stride_src_px=516.0),open(OUT+'meta.json','w'))
print('hoja',sheet.shape,'webp',os.path.getsize(OUT+'sheet.webp'),rows,{n:len(v) for n,v in frames.items()})
