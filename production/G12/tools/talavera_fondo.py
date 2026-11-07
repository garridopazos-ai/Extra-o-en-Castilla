"""Dibuja la Talavera de 1248 (provisional, procedural) en el horizonte de los fondos del puente y la aceña.
Uso: python talavera_fondo.py  -> art/escenarios/nuevos/{puente,acena}_talavera.jpg (+ capa suelta en production/G12/walkmaps/)"""
import random, numpy as np
from PIL import Image, ImageDraw, ImageFilter
ROOT='/home/claude/extra-o-en-castilla/'
SS=4
def town(w,h,seed,haze,HILL):
    """Capa RGBA (w x h) con el perfil de la villa: cerca con almenas, torres albarranas, alcázar, campanario de Santa María y casas."""
    rnd=random.Random(seed); W,H=w*SS,h*SS
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    wall=(228,196,142); wallsh=(188,156,112); roof=(196,106,70); roofsh=(160,84,60); ink=(92,70,52,200)
    base=int(H*0.96); lw=max(2,int(SS*0.9))
    def box(x0,y0,x1,y1,c,sh=None):
        d.rectangle([x0,y0,x1,y1],fill=c+(255,),outline=ink,width=lw)
        if sh: d.rectangle([x0+(x1-x0)*0.62,y0+lw,x1-lw,y1-lw],fill=sh+(255,))
    def merlons(x0,x1,y,n,hh):
        step=(x1-x0)/n
        for i in range(n):
            if i%2==0: d.rectangle([x0+i*step,y-hh,x0+(i+1)*step,y],fill=wall+(255,),outline=ink,width=lw)
    def gable(x0,x1,ytop,ybase,c,csh):
        mid=(x0+x1)/2; d.polygon([(x0-SS,ybase),(mid,ytop),(x1+SS,ybase)],fill=c+(255,),outline=ink)
        d.polygon([(mid,ytop),(x1+SS,ybase),(mid,ybase)],fill=csh+(255,))
    # casas del fondo (cuestas)
    x=W*0.04
    while x<W*0.96:
        bw=rnd.uniform(0.035,0.06)*W; bh=rnd.uniform(0.22,0.34)*H; top=base-bh-rnd.uniform(0,0.12)*H
        box(x,top,x+bw,base,wall,wallsh); gable(x,x+bw,top-bw*0.30,top,roof,roofsh)
        if rnd.random()<0.5: d.rectangle([x+bw*0.3,top+bh*0.3,x+bw*0.42,top+bh*0.55],fill=(110,84,62,230))
        x+=bw*rnd.uniform(0.55,0.9)
    # cerca: lienzo de muralla con almenas y torres
    wy=base-H*0.30
    box(W*0.02,wy,W*0.98,base,wall,None); merlons(W*0.02,W*0.98,wy,int(w/5)*2,H*0.05)
    for i in range(int(w/9)):   # saeteras
        px=W*0.04+i*(W*0.92)/int(w/9); d.rectangle([px,wy+H*0.08,px+SS*1.2,wy+H*0.15],fill=(90,68,52,230))
    for tx,th,tw in ((0.12,0.62,0.05),(0.33,0.55,0.045),(0.66,0.58,0.05),(0.90,0.52,0.045)):
        x0=W*tx; x1=x0+W*tw; yt=base-H*th
        box(x0,yt,x1,base,wall,wallsh); merlons(x0-SS,x1+SS,yt,3,H*0.045)
        d.rectangle([x0+(x1-x0)*0.4,yt+H*0.08,x0+(x1-x0)*0.6,yt+H*0.16],fill=(90,68,52,230))
    # alcázar: gran torre del homenaje a la izquierda
    ax0=W*0.20; ax1=ax0+W*0.09; ay=base-H*0.88
    box(ax0,ay,ax1,base,wall,wallsh); merlons(ax0-SS*1.5,ax1+SS*1.5,ay,5,H*0.06)
    for k in range(2): d.rectangle([ax0+(ax1-ax0)*(0.2+0.4*k),ay+H*0.14,ax0+(ax1-ax0)*(0.32+0.4*k),ay+H*0.26],fill=(90,68,52,230))
    # Santa María la Mayor: campanario cuadrado con vanos y chapitel bajo
    cx0=W*0.47; cx1=cx0+W*0.05; cy=base-H*0.95
    box(cx0,cy,cx1,base,(214,170,128),(180,140,106)); 
    for k in range(2): d.rounded_rectangle([cx0+(cx1-cx0)*(0.18+0.42*k),cy+H*0.12,cx0+(cx1-cx0)*(0.40+0.42*k),cy+H*0.30],radius=SS*2,fill=(80,60,46,230))
    d.polygon([(cx0-SS,cy),((cx0+cx1)/2,cy-H*0.16),(cx1+SS,cy)],fill=roof+(255,),outline=ink)
    # nave de la colegiata junto al campanario
    box(W*0.52,base-H*0.40,W*0.60,base,wall,wallsh); gable(W*0.52,W*0.60,base-H*0.52,base-H*0.40,roof,roofsh)
    mound=[(0,H)]+[(i*W/40, H*(0.90+0.035*np.sin(i*0.9+seed)+0.02*np.sin(i*2.3))) for i in range(41)]+[(W,H)]
    d.polygon(mound,fill=HILL+(255,))
    # bruma: atenúa hacia el color del cielo (perspectiva aérea)
    a=np.array(im).astype(float); sky=np.array(haze,float)
    a[...,:3]=a[...,:3]*(1-0.16)+sky*0.16
    im=Image.fromarray(a.astype('uint8'),'RGBA').filter(ImageFilter.GaussianBlur(SS*0.35))
    return im.resize((w,h),Image.LANCZOS)

def paint(name,place,haze,seed,hillcol):
    bg=Image.open(ROOT+'art/escenarios/nuevos/%s.jpg'%name).convert('RGB'); arr=np.array(bg).astype(float)
    x,y,w,h=place; t=town(w,h,seed,haze,hillcol); ta=np.array(t).astype(float)
    # zona donde puede ir la villa: cielo/lomas lejanas claras y sin tinta (no pisa árboles, puente ni casas)
    reg=arr[y:y+h,x:x+w]; lum=reg.mean(2); mx=reg.max(2); mn=reg.min(2); sat=(mx-mn)/(mx+1)
    sky=(lum>196)&(sat<0.35)
    hill=(lum>120)&(lum<=196)&(sat<0.5)&(reg[...,1]>reg[...,2]+8)
    allowed=Image.fromarray(((sky|hill)*255).astype('uint8')).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    m=np.array(allowed).astype(float)/255
    dark=(lum<105); m=np.where(dark,0,np.maximum(m,np.where(np.arange(h)[:,None]>int(h*0.80),1.0,0)))
    al=ta[...,3]/255*m
    # loma bajo la villa (ancla la silueta al horizonte)
    hy=int(h*0.86); ground=np.zeros((h,w)); ground[hy:,:]=1; ground=np.array(Image.fromarray((ground*255).astype('uint8')).filter(ImageFilter.GaussianBlur(3))).astype(float)/255*m*0.9
    out=reg.copy()
    out=out*(1-ground[...,None])+np.array(hillcol,float)*ground[...,None]
    out=out*(1-al[...,None])+ta[...,:3]*al[...,None]
    arr[y:y+h,x:x+w]=out
    res=Image.fromarray(arr.astype('uint8')); res.save(ROOT+'art/escenarios/nuevos/%s_talavera.jpg'%name,quality=92)
    t.save(ROOT+'production/G12/walkmaps/talavera_capa_%s.png'%name)
    return res
# (x, y, ancho, alto) en el lienzo 1600x900
paint('puente',(735,205,300,135),(240,226,196),7,(176,170,112))
paint('acena',(430,300,380,115),(244,226,190),11,(170,168,108))
