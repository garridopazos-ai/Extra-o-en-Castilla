# -*- coding: utf-8 -*-
"""Mapa-portada de «1248 · Un extraño en Castilla»: Talavera ilustrada, colorida y disparatada (estilo aventura gráfica).
Genera art/portada/mapa_talavera.svg (1600x900) y lo renderiza a JPEG 2400x1350 con Playwright.
Uso: python make_map.py [salida_dir]"""
import random, math, html, os, sys
R=random.Random(1248)
W,H=1600,900
OUTL='#3b2417'
out=[]; A=out.append
def esc(t): return html.escape(t,quote=False)
def poly(pts,fill,stroke=OUTL,sw=1.6,extra=''):
    return '<polygon points="%s" fill="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round" %s/>'%(' '.join('%.1f,%.1f'%p for p in pts),fill,stroke,sw,extra)
def rect(x,y,w,h,fill,stroke=OUTL,sw=1.6,rx=0,extra=''):
    return '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%s" fill="%s" stroke="%s" stroke-width="%s" %s/>'%(x,y,w,h,rx,fill,stroke,sw,extra)
def circ(x,y,r,fill,stroke=OUTL,sw=1.4,extra=''):
    return '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" stroke="%s" stroke-width="%s" %s/>'%(x,y,r,fill,stroke,sw,extra)
def ell(x,y,rx,ry,fill,stroke=OUTL,sw=1.4,extra=''):
    return '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="%s" stroke="%s" stroke-width="%s" %s/>'%(x,y,rx,ry,fill,stroke,sw,extra)
def path(d,fill='none',stroke=OUTL,sw=1.6,extra=''):
    return '<path d="%s" fill="%s" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round" %s/>'%(d,fill,stroke,sw,extra)
def smooth(pts,closed=False):
    P=pts[:]; n=len(P)
    if closed: P=[P[-1]]+P+[P[0],P[1]]
    else: P=[P[0]]+P+[P[-1]]
    d='M%.1f,%.1f'%P[1]
    for i in range(1,len(P)-2):
        p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2]
        c1=(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6); c2=(p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6)
        d+=' C%.1f,%.1f %.1f,%.1f %.1f,%.1f'%(c1+c2+p2)
    return d+(' Z' if closed else '')
def text(t,x,y,size=20,fill=OUTL,font='TeX Gyre Chorus',anchor='middle',halo='#f7edcc',hw=5,rot=0,weight='normal',ls=0,italic=False):
    tr=' transform="rotate(%s %.1f %.1f)"'%(rot,x,y) if rot else ''
    st=' stroke="%s" stroke-width="%s" stroke-linejoin="round" paint-order="stroke"'%(halo,hw) if halo else ''
    it=' font-style="italic"' if italic else ''
    return '<text x="%.1f" y="%.1f" font-family="%s" font-size="%s" fill="%s" text-anchor="%s" font-weight="%s" letter-spacing="%s"%s%s%s>%s</text>'%(x,y,font,size,fill,anchor,weight,ls,st,tr,it,esc(t))
def tree(x,y,s=1,kind=None):
    kind=kind or R.choice(['round','round','round','pine','olive'])
    g='<g>'
    g+=ell(x+s*6,y+1,12*s,4*s,'rgba(60,70,20,.28)','none',0)
    if kind=='pine':
        g+=rect(x-1.5*s,y-6*s,3*s,7*s,'#6b4423',OUTL,1)
        for i,(w,yy) in enumerate([(13,-8),(10,-16),(7,-23)]):
            g+=poly([(x-w*s,y+yy*s),(x+w*s,y+yy*s),(x,y+(yy-12)*s)],['#2f6b3a','#3a7d44','#4a8f4e'][i],OUTL,1.2)
    elif kind=='olive':
        g+=rect(x-1.5*s,y-7*s,3*s,8*s,'#7a5a36',OUTL,1)
        g+=ell(x,y-13*s,11*s,8*s,'#8fa56a',OUTL,1.2)+ell(x-3*s,y-15*s,6*s,4*s,'#b3c487','none',0)
    else:
        g+=rect(x-2*s,y-8*s,4*s,9*s,'#6b4423',OUTL,1)
        c=R.choice(['#4f8f3f','#5da04a','#3f7f3a'])
        g+=circ(x,y-16*s,11*s,c,OUTL,1.3)+circ(x-3*s,y-19*s,6*s,'#86c066','none',0)+circ(x+5*s,y-13*s,5*s,'#3a6b33','none',0)
    return g+'</g>'
def house(x,by,w,h,roof,wall,door=True):
    g='<g>'
    g+=ell(x+4,by+2,w*.62,3.5,'rgba(70,40,20,.28)','none',0)
    g+=rect(x-w/2,by-h,w,h,wall,OUTL,1.3)
    g+=poly([(x+w/2,by-h),(x+w/2+5,by-h-3),(x+w/2+5,by-3),(x+w/2,by)],'rgba(90,60,30,.35)','none',0)
    hr=h*.62+4
    g+=poly([(x-w/2-4,by-h+1),(x-w/2+5,by-h-hr),(x+w/2-5,by-h-hr),(x+w/2+4,by-h+1)],roof,OUTL,1.4)
    for i in range(1,3):
        yy=by-h-hr*i/3; g+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="rgba(60,20,10,.4)" stroke-width=".9"/>'%(x-w/2+(5-4)*(1-i/3)-4*(i/3)+1,yy,x+w/2-1-(5-4)*(1-i/3)+4*(i/3),yy)
    if door: g+=path('M%.1f,%.1f v-%.1f a%.1f,%.1f 0 0 1 %.1f,0 v%.1f z'%(x-3.2,by,h*.38,3.2,3.2,6.4,h*.38),'#4a2c1a','none',0)
    if w>26: g+=rect(x+w*.22,by-h*.62,w*.14,h*.2,'#5b3b24','none',0)
    return g+'</g>'
def tower(x,by,w,h,wall='#e2d2ac',cap=None,flag=None):
    g='<g>'+ell(x+4,by+2,w*.7,4,'rgba(70,40,20,.3)','none',0)
    g+=rect(x-w/2,by-h,w,h,wall,OUTL,1.5)+rect(x+w/2-w*.22,by-h,w*.22,h,'rgba(90,60,30,.3)','none',0)
    n=3; cw=w/(2*n-1)
    for i in range(n): g+=rect(x-w/2+i*2*cw,by-h-6,cw,6,wall,OUTL,1.1)
    if cap: g+=poly([(x-w/2-3,by-h-5),(x,by-h-w*.95),(x+w/2+3,by-h-5)],cap,OUTL,1.4)
    g+=rect(x-1.3,by-h*.65,2.6,h*.22,'#3b2417','none',0)
    if flag: g+=path('M%.1f,%.1f v-16'%(x,by-h-(w*.95 if cap else 6)),'none',OUTL,1.3)+poly([(x,by-h-(w*.95 if cap else 6)-16),(x+13,by-h-(w*.95 if cap else 6)-12),(x,by-h-(w*.95 if cap else 6)-8)],flag,OUTL,1)
    return g+'</g>'
def label(t,x,y,size=19,rot=0,font='TeX Gyre Pagella',fill=OUTL,hw=5,weight='bold',ls=0):
    if t.startswith('('): weight='normal'
    return text(t,x,y,size,fill,font,'middle','#f8eed0',hw,rot,weight,ls,True)
def ribbon(t,x,y,w,h=34,fill='#f3e3b0',tc=OUTL,size=22,col2='#c94a35'):
    g='<g>'
    g+=poly([(x-w/2-22,y-h/2+8),(x-w/2+8,y-h/2+8),(x-w/2+8,y+h/2+8),(x-w/2-22,y+h/2+8),(x-w/2-10,y+8)],col2,OUTL,1.6)
    g+=poly([(x+w/2+22,y-h/2+8),(x+w/2-8,y-h/2+8),(x+w/2-8,y+h/2+8),(x+w/2+22,y+h/2+8),(x+w/2+10,y+8)],col2,OUTL,1.6)
    g+=rect(x-w/2,y-h/2,w,h,fill,OUTL,1.8,3)
    g+=text(t,x,y+size*.33,size,tc,'TeX Gyre Chorus','middle',None)
    return g+'</g>'
def signpost(x,y,boards):
    g=rect(x-2.5,y-52,5,56,'#7a5230',OUTL,1.2)
    for i,(t,dirn,col) in enumerate(boards):
        yy=y-48+i*17; w=len(t)*6.3+16
        if dirn>0: pts=[(x-4,yy),(x+w,yy),(x+w+9,yy+7),(x+w,yy+14),(x-4,yy+14)]; tx=x+w/2
        else: pts=[(x+4,yy),(x-w,yy),(x-w-9,yy+7),(x-w,yy+14),(x+4,yy+14)]; tx=x-w/2
        g+=poly(pts,col,OUTL,1.2)+text(t,tx,yy+11,10.5,OUTL,'TeX Gyre Heros','middle',None,0,0,'bold')
    return g
# ------------------------------------------------------------------ defs
A('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">'%(W,H,W,H))
A('''<defs>
<linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9b95c"/><stop offset=".45" stop-color="#d4c56f"/><stop offset="1" stop-color="#b4bc62"/></linearGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58bfd4"/><stop offset="1" stop-color="#2a82b8"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a1f08" stop-opacity=".42"/></radialGradient>
<filter id="wob" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 .25  0 0 0 0 .15  0 0 0 0 .05  0 0 0 .9 -.32"/></filter>
<filter id="blur2"><feGaussianBlur stdDeviation="2.2"/></filter>
<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
<clipPath id="inner"><rect x="30" y="30" width="1540" height="840" rx="10"/></clipPath>
</defs>''')
A('<rect width="1600" height="900" fill="#e8a323"/>')
A('<g clip-path="url(#inner)"><g filter="url(#wob)">')
A('<rect x="0" y="0" width="1600" height="900" fill="url(#land)"/>')
# ---- manchas de tierra (campos, prados, colinas suaves)
def blob(cx,cy,rx,ry,fill,n=9,jit=.22,op=1):
    pts=[]
    for i in range(n):
        a=2*math.pi*i/n; k=1+R.uniform(-jit,jit); pts.append((cx+math.cos(a)*rx*k,cy+math.sin(a)*ry*k))
    return path(smooth(pts,True),fill,'none',0,'opacity="%s"'%op)
for cx,cy,rx,ry,c in [(180,300,170,90,'#9fb558'),(420,120,200,60,'#8eaa52'),(1350,250,200,110,'#b9bc5c'),(1450,430,160,70,'#c3be63'),(560,760,260,70,'#9bb258'),(1000,760,230,60,'#a9b95e'),(1420,760,200,60,'#8fae55'),(280,440,150,40,'#c9c066'),(850,90,180,50,'#9cb75a')]:
    A(blob(cx,cy,rx,ry,c,op=.75))
# ---- campos de labor (franjas)
def field(x,y,w,h,col,col2,ang=-8,rows=None):
    g='<g transform="rotate(%s %.1f %.1f)">'%(ang,x+w/2,y+h/2)
    g+=rect(x,y,w,h,col,OUTL,1.1,3)
    n=rows or int(h/9)
    for i in range(1,n): g+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2.2" opacity=".75"/>'%(x+3,y+i*h/n,x+w-3,y+i*h/n,col2)
    return g+'</g>'
for f in [(60,230,120,62,'#e6c557','#c9972f',-6),(190,262,100,56,'#dcb94c','#b88a2a',5),(70,330,110,60,'#b5c76a','#7b9b3c',-3),(190,400,118,54,'#e9cf6a','#c79b36',4),(1230,160,130,56,'#e6c557','#c9972f',3),(1360,200,120,60,'#a9c366','#6f9340',-4),(1250,520+0,0,0,'#000','#000',0),
          (110,640,140,70,'#9b7ab0','#6a4b86',3),(260,690,120,58,'#c9d066','#8ea33f',-3),(420,650,150,64,'#e8c953','#c4952d',2),(1180,690,130,60,'#e6c557','#c9972f',-3),(1330,740,140,40,'#b5c76a','#7b9b3c',2)]:
    if f[2]>0: A(field(*f))
# ---- montañas (Sierra de Gredos) y colinas
def mountain(x,y,w,h,c1='#9a8f7f',c2='#7b6f63',snow=True):
    g=poly([(x-w/2,y),(x-w*.12,y-h),(x+w*.06,y-h*.86),(x+w*.18,y-h*.98),(x+w/2,y)],c1,OUTL,1.6)
    g+=poly([(x+w*.06,y-h*.86),(x+w*.18,y-h*.98),(x+w/2,y),(x+w*.1,y)],c2,'none',0,'opacity=".75"')
    if snow: g+=poly([(x-w*.12,y-h),(x-w*.2,y-h*.72),(x-w*.1,y-h*.78),(x-w*.04,y-h*.68),(x+w*.04,y-h*.8),(x+w*.06,y-h*.86)],'#fff8ea',OUTL,1.2)
    return g
for x,y,w,h in [(1010,185,230,110),(1180,190,260,150),(1340,200,300,175),(1500,195,250,120),(1100,170,160,70)]:
    A(mountain(x,y,w,h))
for i in range(30):
    A(tree(R.uniform(60,520),R.uniform(60,200),R.uniform(.8,1.15),R.choice(['pine','pine','round'])))
for i in range(16): A(tree(R.uniform(900,1100),R.uniform(70,170),R.uniform(.8,1.1),'pine'))
# ------------------------------------------------------------------ el Tajo
RIV=[(-60,545),(160,522),(340,548),(520,585),(700,572),(880,550),(1040,566),(1200,590),(1380,562),(1520,522),(1660,532)]
rd=smooth(RIV)
A(path(rd,'none','#6b8f3a',118,'opacity=".55"'))               # vega húmeda
A(path(rd,'none','#c9b27a',100))                               # arenal
A(path(rd,'none',OUTL,86))
A(path(rd,'none','url(#water)',82))
A(path(rd,'none','#7fd2e0',30,'opacity=".45"'))
for i in range(70):                                           # olas
    t=R.uniform(0,1); k=t*(len(RIV)-1); j=min(int(k),len(RIV)-2); f=k-j
    x=RIV[j][0]+(RIV[j+1][0]-RIV[j][0])*f; y=RIV[j][1]+(RIV[j+1][1]-RIV[j][1])*f+R.uniform(-30,30)
    A(path('M%.1f,%.1f q5,-5 10,0 q5,5 10,0'%(x,y),'none','#e9fbff',1.8,'opacity=".8"'))
# isletas con juncos
for x,y in [(470,596),(1290,600),(90,540)]:
    A(ell(x,y,26,8,'#c9b27a',OUTL,1.2))
    for k in range(6): A(path('M%.1f,%.1f q-2,-10 %.1f,-16'%(x-14+k*5.5,y,R.uniform(-4,4)),'none','#4d7a3b',1.8))
# ---- el monstruo del Tajo (vegetariano)
mx,my=640,580
for k,(dx,s) in enumerate([(0,1),(34,.85),(62,.7)]):
    A(path('M%.1f,%.1f a%.1f,%.1f 0 0 1 %.1f,0'%(mx+dx-14*s,my,14*s,16*s,28*s),'#3f9a5c',OUTL,1.8))
    A(path('M%.1f,%.1f q%.1f,-%.1f %.1f,0'%(mx+dx-8*s,my-6*s,8*s,9*s,16*s),'none','#f2d36b',2))
A(path('M%.1f,%.1f q4,-14 -6,-30 q-4,-8 4,-12'%(mx-20,my),'none',OUTL,13))
A(path('M%.1f,%.1f q4,-14 -6,-30 q-4,-8 4,-12'%(mx-20,my),'none','#3f9a5c',9.5))
A(ell(mx-10,my-44,15,10,'#3f9a5c',OUTL,1.6))
A(circ(mx-7,my-48,4.2,'#fff',OUTL,1)+circ(mx-6,my-48,1.8,OUTL,'none',0))
A(path('M%.1f,%.1f q4,3 8,0'%(mx-2,my-40),'none',OUTL,1.4))
A(path('M%.1f,%.1f l-3,-9 l6,-1 z'%(mx-14,my-53),'#f2d36b',OUTL,1))
A(path('M%.1f,%.1f q-6,-10 2,-14 l4,4'%(mx+3,my-44),'none','#c73a2c',1.8))   # flor en la boca
A(circ(mx+6,my-58,4,'#ff8fb8',OUTL,1))
for k in range(3): A(path('M%.1f,%.1f q8,-4 16,0'%(mx-40+k*55,my+12),'none','#e9fbff',2))
# ---- galeón perdido
gx,gy=1430,556
A(path('M%.1f,%.1f l70,0 l-10,16 l-52,0 z'%(gx-38,gy),'#8a5a32',OUTL,1.8))
A(rect(gx-30,gy+4,54,3,'#e9a523','none',0))
for mxx,hh in [(gx-12,58),(gx+14,46)]:
    A(path('M%.1f,%.1f v-%d'%(mxx,gy,hh),'none',OUTL,2.2))
    A(path('M%.1f,%.1f q12,%.1f 0,%.1f q-12,%.1f 0,%.1f'%(mxx-14,gy-hh+6,hh*.22,hh*.44,-hh*.22,-hh*.44),'#f6ecd2',OUTL,1.3))
    A(path('M%.1f,%.1f l28,0 q-2,%.1f -14,%.1f q-12,0 -14,-%.1f z'%(mxx-14,gy-hh+6,hh*.4,hh*.45,hh*.45),'#f6ecd2',OUTL,1.3))
A(poly([(gx-12,gy-58),(gx+6,gy-54),(gx-12,gy-50)],'#1d1d1d',OUTL,1))
A(circ(gx-6,gy-54,1.6,'#fff','none',0))
# ---- barca de Alfonso junto al embarcadero
A(path('M150,566 l52,0 l-8,9 l-36,0 z','#9a6a3a',OUTL,1.6)+path('M176,566 l14,-30','none',OUTL,2))
# ------------------------------------------------------------------ caminos
for d,w in [('M1120,642 C1180,690 1300,700 1380,760 S1520,840 1620,860',16),('M1120,500 C1110,470 1100,452 1090,440',14),('M1130,505 C1180,480 1220,450 1260,430',12),
            ('M860,505 L862,478',16),('M590,330 C500,330 420,360 300,420 S220,470 190,505',12),('M760,182 C720,140 640,110 560,60',10)]:
    A(path(d,'none','#a8814f',w+3,'opacity=".7"')); A(path(d,'none','#e8d29a',w))
# ------------------------------------------------------------------ Talavera
RING=[(610,215),(760,182),(930,175),(1088,206),(1136,300),(1102,428),(962,470),(860,478),(758,470),(642,432),(590,322)]
def inside(p,poly_):
    x,y=p; c=False; n=len(poly_)
    for i in range(n):
        x1,y1=poly_[i]; x2,y2=poly_[(i+1)%n]
        if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1: c=not c
    return c
A(path(smooth(RING,True),'#e7d6a6',OUTL,1.6))                  # suelo intramuros
for cx,cy,rx,ry in [(860,372,62,30)]: A(ell(cx,cy,rx,ry,'#f1e2b8',OUTL,1.2))   # plaza
for d in ['M860,470 C860,430 860,410 860,400','M800,372 C740,360 680,340 600,322','M920,368 C990,350 1060,320 1130,300','M870,345 C880,300 900,250 930,180','M1090,430 C1000,410 950,390 920,378']:
    A(path(d,'none','#d9c08a',11))
WH=26
def wall_seg(p,q):
    return poly([p,q,(q[0],q[1]+WH),(p[0],p[1]+WH)],'#d9c7a0',OUTL,1.5)+''.join(rect(p[0]+(q[0]-p[0])*t-3,p[1]+(q[1]-p[1])*t-5,6,5,'#d9c7a0',OUTL,1) for t in [i/8 for i in range(1,8)])
segs=[(RING[i],RING[(i+1)%len(RING)]) for i in range(len(RING))]
back=[s for s in segs if (s[0][1]+s[1][1])/2<330]; front=[s for s in segs if (s[0][1]+s[1][1])/2>=330]
for s in back: A(wall_seg(*s))
for p in RING:
    if p[1]<330: A(tower(p[0],p[1]+WH,30,52,'#e2d2ac'))
# edificios principales + casas (orden por profundidad)
items=[]
def church(x,by):
    g='<g>'+ell(x+10,by+3,80,7,'rgba(70,40,20,.3)','none',0)
    g+=rect(x-70,by-48,110,48,'#efe0b8',OUTL,1.6)
    g+=poly([(x-76,by-47),(x-62,by-80),(x+32,by-80),(x+46,by-47)],'#c4553a',OUTL,1.6)
    for k in range(4): g+=path('M%.1f,%.1f v-16 a5,5 0 0 1 10,0 v16'%(x-60+k*26,by-14),'#4a2c1a','none',0)
    g+=rect(x+34,by-120,34,120,'#efe0b8',OUTL,1.6)+rect(x+56,by-120,12,120,'rgba(90,60,30,.25)','none',0)
    for k in range(2): g+=path('M%.1f,%.1f v-14 a5,5 0 0 1 10,0 v14 z'%(x+39+k*14,by-86),'#3b2417','none',0)
    g+=poly([(x+30,by-120),(x+51,by-158),(x+72,by-120)],'#c4553a',OUTL,1.6)
    g+=path('M%.1f,%.1f v-18 M%.1f,%.1f h12'%(x+51,by-158,x+45,by-170),'none',OUTL,2.4)
    # nido de cigüeñas
    g+=ell(x+51,by-122,16,5,'#8a6a3a',OUTL,1.2)+ell(x+46,by-130,8,6,'#fff',OUTL,1.2)+path('M%.1f,%.1f l-12,2'%(x+40,by-131),'none','#e8502f',2.4)+circ(x+42,by-132,1,OUTL,'none',0)
    g+=path('M%.1f,%.1f l-6,-10 l12,0 z'%(x+50,by-124),'#1d1d1d','none',0)
    g+='</g>'; return g
items.append((300,church(760,300)))
def nuno_house(x,by):
    g='<g>'+ell(x+8,by+3,62,6,'rgba(70,40,20,.3)','none',0)
    g+=rect(x-56,by-54,112,54,'#f6e7c3',OUTL,1.6)
    g+=poly([(x-62,by-53),(x-48,by-84),(x+48,by-84),(x+62,by-53)],'#e8b52c',OUTL,1.6)   # tejado dorado (¡pagado por todos!)
    for k in range(5): g+=rect(x-46+k*20,by-42,10,15,'#4f8fd6',OUTL,1)
    g+=path('M%.1f,%.1f v-22 a10,10 0 0 1 20,0 v22 z'%(x-10,by),'#7a2c6a',OUTL,1.3)
    g+=rect(x-36,by-26,72,4,'#7a2c6a','none',0)
    g+=path('M%.1f,%.1f v-34'%(x,by-84),'none',OUTL,2)+poly([(x,by-118),(x+34,by-112),(x,by-104)],'#9b3fb0',OUTL,1.2)
    g+=path('M%.1f,%.1f q5,-5 9,0 q4,-5 9,0'%(x+4,by-110),'none','#f6e7c3',2)   # bigote en la bandera
    return g+'</g>'
items.append((262,nuno_house(1000,262)))
items.append((236,tower(1060,236,44,96,'#e9d9b0','#2f56a8','#c73a2c')))   # alcázar
def fountain(x,y): return ell(x,y,18,7,'#9fd6e6',OUTL,1.4)+rect(x-2.5,y-20,5,20,'#d9c7a0',OUTL,1)+path('M%.1f,%.1f q-8,2 -12,12 M%.1f,%.1f q8,2 12,12'%(x,y-20,x,y-20),'none','#4fb3d4',2)
items.append((372,fountain(860,372)))
items.append((360,rect(816,334,7,22,'#9a6a3a',OUTL,1)+poly([(806,334),(832,334),(828,326),(810,326)],'#c73a2c',OUTL,1)))   # tarima del pregonero
roofs=['#c4553a','#d9703f','#b9482f','#cf5f3a','#d9824a']; walls=['#f6ead0','#f0e2bc','#ead6ac','#f3e4c4']
reserved=[(760,250,95,70),(1000,240,70,50),(1060,200,30,60),(860,372,75,40)]
for row,yy in enumerate(range(212,470,23)):
    x=600+(row%2)*14
    while x<1140:
        x+=R.uniform(28,40); p=(x,yy+R.uniform(-3,3))
        ok=inside((p[0],p[1]-8),RING) and inside((p[0]-14,p[1]),RING) and inside((p[0]+14,p[1]),RING)
        if ok and not any(abs(p[0]-a)<b and abs(p[1]-c)<d for a,c,b,d in reserved) and R.random()>.12:
            w=R.uniform(22,32); h=R.uniform(14,20)
            items.append((p[1],house(p[0],p[1],w,h,R.choice(roofs),R.choice(walls))))
for y,g in sorted(items,key=lambda t:t[0]): A(g)
# muralla delantera y Puerta del Río
for s in front: A(wall_seg(*s))
for p in RING:
    if p[1]>=330 and abs(p[0]-860)>20: A(tower(p[0],p[1]+WH,30,50,'#e2d2ac'))
A(tower(860,502,58,74,'#e9d9b0',None,'#e9a523'))
A(path('M848,502 v-22 a12,12 0 0 1 24,0 v22 z','#3b2417','none',0))
# ------------------------------------------------------------------ alfares (fuera de murallas, al este)
for x,y in [(1210,400),(1290,372),(1350,430)]:
    for k in range(5): A(circ(x+R.uniform(-4,4)+k*3,y-44-k*20,8+k*4,'#d6e3ea','none',0,'opacity="%.2f" filter="url(#blur2)"'%(.75-k*.12)))
    A(path('M%.1f,%.1f a26,30 0 0 1 52,0 z'%(x-26,y),'#c9774a',OUTL,1.7)+path('M%.1f,%.1f v-10 a7,7 0 0 1 14,0 v10 z'%(x-7,y),'#ffb347',OUTL,1.2)+circ(x,y-30,5,'#3b2417','none',0))
for k in range(9):                                     # cacharros secándose
    x=1180+k*22; y=470+(k%2)*4
    col=R.choice(['#2f56a8','#f6ecd2','#e9a523'])
    A(path('M%.1f,%.1f q-9,-4 -7,-14 q2,-6 4,-8 h6 q2,2 4,8 q2,10 -7,14 z'%(x,y),col,OUTL,1.2))
    if col=='#f6ecd2': A(path('M%.1f,%.1f q3,-3 6,0'%(x-3,y-8),'none','#2f56a8',1.6))
A(house(1250,452,40,20,'#c4553a','#f3e4c4')); A(house(1395,470,34,18,'#d9703f','#f6ead0'))
# cántaro gigante (monumento al cántaro)
A(path('M1420,410 q-28,-10 -24,-44 q4,-20 14,-26 h20 q10,6 14,26 q4,34 -24,44 z','#f6ecd2',OUTL,2)+path('M1404,372 q16,-10 32,0 M1402,388 q18,8 36,0','none','#2f56a8',2.6)+rect(1410,334,20,8,'#e9a523',OUTL,1.4))
# ------------------------------------------------------------------ puente viejo (roto) y portazgo
A(rect(1102,500,40,62,'#d4bf97',OUTL,1.8)+rect(1102,602,40,44,'#d4bf97',OUTL,1.8))
for y0 in (514,536,612,630):
    A(path('M1102,%d a6,8 0 0 0 0,14'%y0,'#2a6f99',OUTL,1.4))
for x0 in (1100,1140): A(path('M%d,500 v62 M%d,602 v44'%(x0,x0),'none','#b49a72',4))
A(path('M1104,562 l6,8 l6,-4 l8,6 l6,-6 l10,6','none',OUTL,1.6)+path('M1104,602 l8,-6 l6,4 l8,-5 l14,5','none',OUTL,1.6))
A(poly([(1150,560),(1162,584),(1138,584)],'#ff7a1a',OUTL,1.2)+rect(1140,575,20,3,'#fff','none',0))   # cono de obras
A(rect(1160,520,46,22,'#f6ecd2',OUTL,1.2,2)+text('OBRAS',1183,535,11,'#c73a2c','TeX Gyre Heros','middle',None,0,0,'bold'))
A(path('M1183,542 v12','none',OUTL,2))
A(house(1072,512,36,22,'#b9482f','#f0e2bc'))           # caseta del portazgo
A(path('M1088,500 l44,-8','none','#c73a2c',4)+path('M1096,498.6 l6,-1 M1112,495.8 l6,-1 M1126,493.3 l6,-1','none','#fff',4))
A(rect(1052,506,12,8,'#e9a523',OUTL,1))                 # cofre de monedas
# ------------------------------------------------------------------ aceña de Durán, embarcadero y la llegada
A(rect(340,470,70,44,'#efe0b8',OUTL,1.6)+poly([(334,471),(346,446),(404,446),(416,471)],'#b9482f',OUTL,1.6)+path('M352,514 v-16 a6,6 0 0 1 12,0 v16 z','#4a2c1a','none',0))
A(rect(318,512,110,10,'#8a6a3a',OUTL,1.4))              # azud
A(circ(430,520,30,'none',OUTL,6)+circ(430,520,30,'none','#9a6a3a',3.5))
for k in range(8):
    a=k*math.pi/4; A(path('M430,520 l%.1f,%.1f'%(math.cos(a)*30,math.sin(a)*30),'none','#7a5230',2.6))
A(circ(430,520,6,'#5b3b24',OUTL,1.2))
A(path('M404,548 q14,6 26,0 q14,-6 28,0','none','#e9fbff',2.4))
A(rect(150,520,62,8,'#9a6a3a',OUTL,1.4))               # embarcadero
for x in (156,176,196,208): A(path('M%d,528 v14'%x,'none',OUTL,3))
# portal temporal + el extraño
px,py=262,492
A(ell(px,py+4,30,9,'rgba(40,20,80,.25)','none',0))
for k,(r,c) in enumerate([(30,'#7a4cff'),(23,'#36d6ff'),(16,'#ff5cd6'),(9,'#fff6a8')]):
    A(path('M%.1f,%.1f a%.1f,%.1f 0 1 1 %.1f,%.1f'%(px-r,py-20,r,r*.9,r*1.9,r*.4),'none',c,4.2,'opacity=".9"'))
for k in range(9):
    a=R.uniform(0,6.28); rr=R.uniform(36,48)
    A(path('M%.1f,%.1f l3,-7 l3,7 l-3,7 z'%(px+math.cos(a)*rr,py-20+math.sin(a)*rr*.8),'#fff6a8','#ff9f1a',1))
A(ell(px+22,py+2,7,2.5,'rgba(0,0,0,.3)','none',0))
A(rect(px+17,py-16,4,17,'#3c5a8a',OUTL,1)+rect(px+23,py-16,4,17,'#3c5a8a',OUTL,1))   # vaqueros
A(rect(px+15,py-36,14,22,'#2d3a52',OUTL,1.2,3)+rect(px+27,py-34,7,14,'#8a5a32',OUTL,1,2))   # chaqueta y mochila
A(circ(px+22,py-42,7,'#e7b48c',OUTL,1.2)+path('M%.1f,%.1f q7,-8 14,0'%(px+15,py-44),'#3b2417',OUTL,1))
A(rect(px+11,py-31,5,7,'#111',OUTL,1,1)+rect(px+12,py-30,3,4,'#7fd2ff','none',0))   # el móvil
# ------------------------------------------------------------------ dragón dormido abrazado a un cántaro
dx,dy=1390,112
A(path('M%.1f,%.1f q-50,-10 -70,10 q-20,22 10,30 q40,8 70,-6 q20,-12 -10,-34 z'%(dx+30,dy-6),'#5fae4f',OUTL,2))
for k in range(6): A(poly([(dx-30+k*12,dy-12+abs(k-2.5)*2),(dx-24+k*12,dy-24+abs(k-2.5)*2),(dx-18+k*12,dy-12+abs(k-2.5)*2)],'#e9a523',OUTL,1.1))
A(path('M%.1f,%.1f q30,10 46,-6 q6,-8 -2,-12'%(dx+60,dy+16),'none',OUTL,10)+path('M%.1f,%.1f q30,10 46,-6 q6,-8 -2,-12'%(dx+60,dy+16),'none','#5fae4f',6.5))
A(poly([(dx+104,dy-4),(dx+116,dy-10),(dx+110,dy+4)],'#e9a523',OUTL,1))
A(ell(dx-44,dy+10,22,15,'#5fae4f',OUTL,2))
A(path('M%.1f,%.1f q6,4 12,0'%(dx-52,dy+6),'none',OUTL,1.8))     # ojo cerrado
A(circ(dx-62,dy+16,1.6,OUTL,'none',0)+circ(dx-58,dy+17,1.6,OUTL,'none',0))
A(poly([(dx-40,dy-4),(dx-34,dy-16),(dx-30,dy-2)],'#f6ecd2',OUTL,1))
A(path('M%.1f,%.1f q8,-26 30,-26 q-6,14 4,22 q-14,0 -34,4 z'%(dx-6,dy-10),'#8fd07a',OUTL,1.6))   # ala
A(path('M%.1f,%.1f q-9,-4 -7,-14 q2,-6 4,-8 h6 q2,2 4,8 q2,10 -7,14 z'%(dx-16,dy+26),'#f6ecd2',OUTL,1.3)+path('M%.1f,%.1f q3,-3 6,0'%(dx-19,dy+18),'none','#2f56a8',1.6))
for k,(s,o) in enumerate([(14,0),(18,16),(22,34)]): A(text('z',dx-70-o,dy-16-o,s,'#2f56a8','TeX Gyre Bonum','middle','#f8eed0',3,-10,'bold'))
# ------------------------------------------------------------------ orilla sur: olivos, aldea, molino, ovni
for i in range(26): A(tree(R.uniform(700,960),R.uniform(650,770),R.uniform(.85,1.05),'olive'))
for i in range(14): A(tree(R.uniform(40,420),R.uniform(600,640),R.uniform(.8,1),'round'))
for i in range(10): A(tree(R.uniform(1460,1560),R.uniform(600,700),R.uniform(.8,1),'round'))
for x,y in [(1000,700),(1040,716),(980,736),(1060,748)]: A(house(x,y,26,15,R.choice(roofs),R.choice(walls)))
# molino de viento (anacronismo: aún faltan siglos y un hidalgo)
wx,wy=1190,732
A(path('M%.1f,%.1f l-12,0 l4,-44 l16,0 l4,44 z'%(wx+12,wy),'#f6ead0',OUTL,1.6)+poly([(wx-6,wy-44),(wx+2,wy-58),(wx+10,wy-44)],'#8a5a32',OUTL,1.4))
for a in (20,110,200,290):
    r=math.radians(a); A(path('M%.1f,%.1f l%.1f,%.1f'%(wx+2,wy-48,math.cos(r)*34,math.sin(r)*34),'none',OUTL,4)+path('M%.1f,%.1f l%.1f,%.1f'%(wx+2,wy-48,math.cos(r)*34,math.sin(r)*34),'none','#f6ead0',2))
# ovni abduciendo una oveja
ux,uy=420,652
A(poly([(ux-14,uy+4),(ux+14,uy+4),(ux+34,uy+82),(ux-34,uy+82)],'rgba(255,250,170,.55)','none',0))
A(ell(ux,uy,40,11,'#c9d3dc',OUTL,1.8)+path('M%.1f,%.1f a18,15 0 0 1 36,0'%(ux-18,uy-6),'#9fe3ff',OUTL,1.6))
for k in range(5): A(circ(ux-28+k*14,uy+2,2.4,['#ff5cd6','#fff6a8','#36d6ff'][k%3],'none',0))
A(ell(ux,uy+52,12,8,'#ffffff',OUTL,1.4)+circ(ux+11,uy+48,4.5,'#3b2417',OUTL,1)+path('M%.1f,%.1f v6 M%.1f,%.1f v6'%(ux-5,uy+59,ux+5,uy+59),'none',OUTL,1.8))
# ------------------------------------------------------------------ rosa de los vientos (con gallina)
cx,cy=1475,330
A(circ(cx,cy,42,'#f6ecd2',OUTL,1.8)+circ(cx,cy,34,'none','#c94a35',1.2))
for k in range(8):
    a=math.radians(k*45-90); l=40 if k%2==0 else 24; b=math.radians(k*45-90+90)
    A(poly([(cx+math.cos(a)*l,cy+math.sin(a)*l),(cx+math.cos(b)*6,cy+math.sin(b)*6),(cx,cy),(cx-math.cos(b)*6,cy-math.sin(b)*6)],['#2f56a8','#e9a523'][k%2],OUTL,1.2))
A(circ(cx,cy,5,'#c94a35',OUTL,1.2))
for t,dx_,dy_ in [('N',0,-50),('S',0,62),('E',56,6),('O',-56,6)]: A(text(t,cx+dx_,cy+dy_,17,OUTL,'TeX Gyre Bonum','middle','#f8eed0',4,0,'bold'))
A(ell(cx+2,cy-74,10,7,'#fff',OUTL,1.3)+circ(cx+11,cy-80,4.5,'#fff',OUTL,1.2)+poly([(cx+15,cy-81),(cx+20,cy-79),(cx+15,cy-77)],'#e9a523',OUTL,.8)+path('M%.1f,%.1f q2,-5 4,0 q2,-5 4,0'%(cx+8,cy-84),'#e8502f',OUTL,.8))
A(path('M%.1f,%.1f v4 M%.1f,%.1f v4'%(cx,cy-67,cx+4,cy-67),'none','#e9a523',1.5))
# ------------------------------------------------------------------ rótulos
A(signpost(1470,772,[('TOLEDO',1,'#f3e3b0'),('SEVILLA (el rey va)',-1,'#f3e3b0'),('MADRID: ¿qué Madrid?',-1,'#e8c9a0')]))
A(text('TALAVERA',870,118,44,'#c94a35','TeX Gyre Bonum','middle','#f8eed0',7,0,'bold',9))
A(label('(lo de «de la Reina» llegará en el siglo XIV)',870,142,17))
A(ribbon('¡TÚ ESTÁS AQUÍ!',262,408,206,36,'#c73a2c','#fff6dc',24,'#8e2418'))
L=[('Puerta del Río',860,534,21),('Plaza',905,392,17),('Santa María',760,322,20),('(cigüeñas incluidas)',760,338,15),('Casa de Don Nuño · Audiencia',1000,284,18),('(tejado dorado, pagado por todos)',1000,300,15),
   ('Alcázar',1062,254,16),('Alfares',1300,500,22),('(barro, fuego y paciencia)',1300,517,15),('Monumento al Cántaro',1420,432,15),('Portazgo',1010,496,18),('(se paga hasta por mirar)',1010,512,14),
   ('Puente Viejo',1225,664,19),('(en obras desde los romanos)',1225,681,15),('Aceña de Durán',376,436,20),('Embarcadero',184,598,19),('Monstruo del Tajo',648,630,18),('(vegetariano)',648,646,15),
   ('Galeón perdido',1440,612,17),('(«¿esto es el mar?»)',1440,628,15),('Aquí hay dragones',1400,160,20),('(dormidos, por suerte)',1400,177,15),('Sierra de Gredos',1180,58,19),
   ('(oveja en prácticas de vuelo)',420,764,15),('Gigante',1190,758,17),('(dentro de unos 350 años)',1190,774,14),('Aldea de los que llegan tarde',985,784,16)]
for t,x,y,s in L: A(label(t,x,y,s))
A(text('Río Tajo',960,575,28,'#1f4f86','TeX Gyre Chorus','middle','#bfefff',5,-2))
# cartela
A(rect(40,224,330,112,'#f6ecd2',OUTL,2,6)+rect(46,230,318,100,'none','#c94a35',1.2,4))
for i,t in enumerate(['Mapa fiel y verídico de Talavera','y sus alrededores · Año de 1248','El rey Fernando III, de viaje: está','conquistando Sevilla. Nadie vigila.','(Casi todo lo que ves es cierto. Casi.)']):
    A(text(t,205,252+i*18,15,OUTL,'TeX Gyre Pagella','middle',None,0,0,'bold' if i<2 else 'normal',0,True))
# título
A(path('M40,58 q250,-26 500,0 v138 q-250,-22 -500,0 z','#f6ecd2',OUTL,2.4))
A(path('M40,58 q-18,8 -6,20 q6,-10 6,-20 M540,58 q18,8 6,20 q-6,-10 -6,-20','#e2cf9e',OUTL,2))
A(text('1248',290,138,92,'#c94a35','TeX Gyre Bonum','middle','#3b2417',6,0,'bold',4))
A(text('Un extraño en Castilla',290,182,40,'#2f56a8','TeX Gyre Chorus','middle','#f6ecd2',3))
A('</g>')
A('<rect x="0" y="0" width="1600" height="900" filter="url(#grain)" opacity=".55"/>')
A('<rect x="0" y="0" width="1600" height="900" fill="url(#vig)"/>')
A('</g>')
# ------------------------------------------------------------------ marco de azulejo talaverano
A('<rect x="30" y="30" width="1540" height="840" rx="10" fill="none" stroke="%s" stroke-width="4"/>'%OUTL)
A('<rect x="6" y="6" width="1588" height="888" rx="6" fill="none" stroke="#2f56a8" stroke-width="3"/>')
def rosette(x,y,r):
    g=''
    for k in range(8):
        a=k*45; g+='<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#2f56a8" stroke="#1d3a78" stroke-width=".8" transform="rotate(%d %.1f %.1f)"/>'%(x,y-r*.55,r*.26,r*.5,a,x,y)
    return g+circ(x,y,r*.32,'#7fa6e6','#1d3a78',.8)+circ(x,y,r*.12,'#e9a523','none',0)
def scroll(x,y,horiz=True):
    if horiz: return path('M%.1f,%.1f q8,-9 16,0 t16,0'%(x-16,y),'none','#2f56a8',2.6)
    return path('M%.1f,%.1f q-9,8 0,16 t0,16'%(x,y-16),'none','#2f56a8',2.6)
for x in range(60,1560,80):
    A(rosette(x,18,13)+rosette(x,882,13))
    if x+40<1560: A(scroll(x+40,18)+scroll(x+40,882))
for y in range(98,830,80):
    A(rosette(18,y,13)+rosette(1582,y,13))
    if y+40<830: A(scroll(18,y+40,False)+scroll(1582,y+40,False))
for x,y in [(18,18),(1582,18),(18,882),(1582,882)]: A(circ(x,y,15,'#c94a35','#1d3a78',1.4)+rosette(x,y,11))
A('</svg>')
svg='\n'.join(out)
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(__file__),'..','..','..','art','portada')
os.makedirs(OUT,exist_ok=True)
open(os.path.join(OUT,'mapa_talavera.svg'),'w',encoding='utf-8').write(svg)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1600,'height':900},device_scale_factor=1.5)
    pg.set_content('<html><body style="margin:0;background:#000">'+svg+'</body></html>'); pg.wait_for_timeout(400)
    pg.screenshot(path=os.path.join(OUT,'mapa_talavera.jpg'),type='jpeg',quality=86,clip={'x':0,'y':0,'width':1600,'height':900})
    b.close()
print('ok',os.path.getsize(os.path.join(OUT,'mapa_talavera.jpg')))
