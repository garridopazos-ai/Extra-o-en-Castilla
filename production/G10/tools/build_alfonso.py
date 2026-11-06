"""Hoja de Alfonso desde 1000701584.mp4 (marcha de perfil, mira a la derecha, 720x1280, 24 fps).
Uso: ffmpeg -i clip.mp4 raw/%03d.png ; python key_alf.py raw k ; python build_alfonso.py <dir con k/> <salida>"""
import cv2, numpy as np, json, os, sys, glob
BASE=sys.argv[1].rstrip('/')+'/k/'; OUT=sys.argv[2].rstrip('/')+'/'; os.makedirs(OUT,exist_ok=True)
CW,CH,GY_CELL,S = 192,348,340,0.315
COLS=16; L=34; STEP=1
K=sorted(glob.glob(BASE+'*.png')); rd=lambda i: cv2.imread(K[i-1],cv2.IMREAD_UNCHANGED)
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
# reposo: el fotograma inicial con los pies más juntos
cand=range(1,13); ms={i:metrics(rd(i)) for i in cand}; ri=min(cand,key=lambda i:ms[i]['sep']); mi=ms[ri]
print('reposo: fotograma',ri,mi)
T=[cv2.resize(rd(i).astype(np.float32),(72,128),interpolation=cv2.INTER_AREA) for i in range(1,193)]
st=min((np.mean([np.abs(T[i+w]-T[i+L+w]).mean() for w in range(4)]),i) for i in range(24,192-L-4))[1]+1
print('marcha: inicio',st,'L',L)
frames={'idle':[render(rd(ri),mi['fx'],mi['b'])]}
mw=[metrics(rd(i)) for i in range(st,st+L)]; txw=np.median([m['tx'] for m in mw]); xref_w=txw-(mi['tx']-mi['fx'])
frames['walk']=[render(rd(i),xref_w,metrics(rd(i))['b']) for i in range(st,st+L,STEP)]
ext=[(np.where(m.any(0))[0].min()*S,np.where(m.any(0))[0].max()*S) for _,m in frames['walk']+frames['idle']]
print('extensión horizontal en celda (centro %d): %.1f .. %.1f'%(CW//2,min(e[0] for e in ext),max(e[1] for e in ext)))
order=['idle','walk']; rows={}; r=0
for n in order: rows[n]=r; r+=int(np.ceil(len(frames[n])/COLS))
sheet=np.zeros((r*CH,COLS*CW,4),np.uint8)
for n in order:
    for j,(f,_) in enumerate(frames[n]):
        rr=rows[n]+j//COLS; cc=j%COLS; sheet[rr*CH:(rr+1)*CH,cc*CW:(cc+1)*CW]=f
cv2.imwrite(OUT+'sheet.png',sheet); cv2.imwrite(OUT+'sheet.webp',sheet,[cv2.IMWRITE_WEBP_QUALITY,92])
json.dump(dict(rows=rows,counts={n:len(v) for n,v in frames.items()},cw=CW,ch=CH,cols=COLS,gy=GY_CELL,rest=ri,walk_start=st,L=L,fps=24,
  stride_src_px=float(12.754*L)),open(OUT+'meta.json','w'))
print('hoja',sheet.shape,'webp',os.path.getsize(OUT+'sheet.webp'))
