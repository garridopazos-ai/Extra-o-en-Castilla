"""Talavera de la portada de César (art/portada/portada_1248_elvira_original.jpg) recortada y pegada en el horizonte de puente y aceña.
Uso: python talavera_desde_portada.py -> art/escenarios/nuevos/{puente,acena}_talavera.jpg"""
import numpy as np, cv2
from PIL import Image, ImageFilter
ROOT='/home/claude/extra-o-en-castilla/'
cov=cv2.imread(ROOT+'art/portada/portada_1248_elvira_original.jpg')   # BGR
X0,Y0,X1,Y1=430,190,1130,302
crop=cov[Y0:Y1,X0:X1].copy(); h,w=crop.shape[:2]
b,g,r=[crop[...,i].astype(int) for i in range(3)]
# quitar el rasgo rojo del título y el pelo de los personajes (inpaint)
yy=np.arange(h)[:,None]; xx=np.arange(w)[None,:]
redish=(r>b+55)&(g<175)
reds=(redish&(yy<36)&(xx>205)&(xx<575))|(redish&(yy<9))|(((r+g+b)<420)&(yy<8))   # trazo del título y letras que asoman
hair=(xx>235)&(xx<345)&(yy>80)&(r<170)&(b<120)   # pelo del extraño
m=cv2.dilate((reds|hair).astype('uint8')*255,np.ones((5,5),np.uint8))
crop=cv2.inpaint(crop,m,5,cv2.INPAINT_TELEA)
rgb=cv2.cvtColor(crop,cv2.COLOR_BGR2RGB)
r,g,b=[rgb[...,i].astype(int) for i in range(3)]
sky=((b>=r-6)&(r+g+b>470))|((b>r+4)&(b>g-2))   # azul/blanco del cielo
sky=cv2.morphologyEx(sky.astype('uint8'),cv2.MORPH_OPEN,np.ones((2,2),np.uint8)).astype(bool)
alpha=(~sky).astype(float)
alpha=cv2.GaussianBlur(alpha,(0,0),0.8)
fade=np.clip((h-np.arange(h))/14.0,0,1)[:,None]; alpha=alpha*fade   # base difuminada hacia la loma
def paint(name,x,y,W,haze,hill,sub=0.0):
    bg=np.array(Image.open(ROOT+'art/escenarios/nuevos/%s.jpg'%name).convert('RGB')).astype(float)
    sc=W/w; H=int(h*sc)
    t=cv2.resize(rgb,(W,H),interpolation=cv2.INTER_AREA).astype(float); a=cv2.resize(alpha,(W,H),interpolation=cv2.INTER_AREA)
    t=t*(1-0.18)+np.array(haze,float)*0.18       # perspectiva aérea
    t=t*0.96                                        # un punto más cálido/oscuro para asentarlo en la acuarela
    reg=bg[y:y+H,x:x+W]; lum=reg.mean(2); mx=reg.max(2); mn=reg.min(2); sat=(mx-mn)/(mx+1)
    allow=((lum>150)&(sat<0.45)).astype('uint8')*255
    allow=cv2.GaussianBlur(cv2.erode(allow,np.ones((3,3),np.uint8)),(0,0),1.2)/255.0
    # loma bajo la villa
    ground=np.zeros((H,W)); ground[int(H*0.88):,:]=1; ground=cv2.GaussianBlur(ground,(0,0),2)
    allow=np.maximum(allow,ground*(lum>105))
    out=reg*(1-ground[...,None]*allow[...,None]*0.8)+np.array(hill,float)*ground[...,None]*allow[...,None]*0.8
    aa=(a*allow)[...,None]; out=out*(1-aa)+t*aa
    bg[y:y+H,x:x+W]=out
    Image.fromarray(bg.astype('uint8')).save(ROOT+'art/escenarios/nuevos/%s_talavera.jpg'%name,quality=92)
paint('puente',690,232,420,(240,226,196),(176,170,112))
paint('acena',380,288,520,(244,226,190),(170,168,108))
