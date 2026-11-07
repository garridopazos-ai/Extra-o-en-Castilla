# -*- coding: utf-8 -*-
"""G12 · Escenario ancho «La orilla · Soto de los Sifones» (4000×900) en acuarela, por capas de paralaje.
Salidas en art/escenarios/orilla/: far.jpg (cielo + orilla de enfrente, paralaje 0.55), near.webp (río, orilla, árboles; con alfa),
reeds_a.webp / reeds_b.webp (juncos de primer plano). De oeste (enlace con la ribera) a este (vado e Isla del Chamelo):
  0-400 camino desde la ribera · 450-1150 el sifón del aguador · 1300-1800 huerta y espantapájaros · 1900-2500 la higuera
  2600-3100 la parra del ciego · 3200-4000 el vado y la Isla del Chamelo."""
import random, math, os, sys, html
R = random.Random(1248)
OUTL = '#3b2a1c'
W, H = 4000, 900
FARW = int(1600 + (W - 1600) * 0.55)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', '..', '..', 'art', 'escenarios', 'orilla')
os.makedirs(OUT, exist_ok=True)

def smooth(pts, closed=False):
    P = pts[:]
    P = ([P[-1]] + P + [P[0], P[1]]) if closed else ([P[0]] + P + [P[-1]])
    d = 'M%.1f,%.1f' % P[1]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6); c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += ' C%.1f,%.1f %.1f,%.1f %.1f,%.1f' % (c1 + c2 + p2)
    return d + (' Z' if closed else '')
def P(d, fill='none', stroke='none', sw=0, op=1, extra=''):
    return '<path d="%s" fill="%s" stroke="%s" stroke-width="%s" opacity="%s" stroke-linecap="round" stroke-linejoin="round" %s/>' % (d, fill, stroke, sw, op, extra)
def blob(cx, cy, rx, ry, n=10, jit=.22):
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n; k = 1 + R.uniform(-jit, jit); pts.append((cx + math.cos(a) * rx * k, cy + math.sin(a) * ry * k))
    return smooth(pts, True)
def wash(d, col, op=.9, edge=None):
    """Mancha de acuarela: lavado + borde de pigmento más oscuro."""
    s = P(d, col, 'none', 0, op, 'filter="url(#wc)"')
    if edge: s += P(d, 'none', edge, 1.6, .55, 'filter="url(#wc)"')
    return s
def rect(x, y, w, h, fill, op=1, extra=''):
    return '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="%s" opacity="%s" %s/>' % (x, y, w, h, fill, op, extra)

DEFS = '''<defs>
<filter id="wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="4" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feMorphology in="d" operator="erode" radius="1.6" result="er"/><feComposite in="d" in2="er" operator="out" result="ring"/>
<feColorMatrix in="ring" type="matrix" values=".55 0 0 0 0  0 .5 0 0 0  0 0 .45 0 0  0 0 0 .55 0" result="edge"/>
<feMerge><feMergeNode in="d"/><feMergeNode in="edge"/></feMerge></filter>
<filter id="soft"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="soft3"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="9" result="t"/>
<feColorMatrix in="t" type="matrix" values="0 0 0 0 .42  0 0 0 0 .33  0 0 0 0 .2  0 0 0 -1.5 .82" result="g"/>
<feComposite in="g" in2="SourceAlpha" operator="in" result="gm"/><feTurbulence type="fractalNoise" baseFrequency=".006" numOctaves="2" seed="2" result="b"/>
<feColorMatrix in="b" type="matrix" values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .25  0 0 0 -.9 .5" result="bl"/><feComposite in="bl" in2="SourceAlpha" operator="in" result="blm"/>
<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gm"/><feMergeNode in="blm"/></feMerge></filter>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb6d2"/><stop offset=".55" stop-color="#cfdde0"/><stop offset="1" stop-color="#f1e6c8"/></linearGradient>
<linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fa9b4"/><stop offset=".5" stop-color="#5e8f9a"/><stop offset="1" stop-color="#4d7a7e"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb27c"/><stop offset="1" stop-color="#b8945c"/></linearGradient>
</defs>'''

def svg(w, h, body):
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">%s%s</svg>' % (w, h, w, h, DEFS, body)

# ========================================================= CAPA LEJANA (cielo, sierra, orilla de enfrente, Talavera)
def far_layer():
    b = [rect(0, 0, FARW, 480, 'url(#sky)')]
    for i in range(16):   # nubes húmedas
        cx, cy = R.uniform(0, FARW), R.uniform(40, 230); rx = R.uniform(90, 220)
        b.append(P(blob(cx, cy, rx, rx * .32, 12, .3), '#fbf7ee', 'none', 0, .85, 'filter="url(#soft)"'))
        b.append(P(blob(cx + 10, cy + rx * .16, rx * .8, rx * .14, 10, .3), '#b8c4cc', 'none', 0, .35, 'filter="url(#soft)"'))
    # sierra lejana (Gredos), azulada
    pts = [(-20, 360)] + [(x, 300 + 40 * math.sin(x / 260) + 25 * math.sin(x / 97 + 1) + R.uniform(-8, 8)) for x in range(0, FARW + 60, 60)] + [(FARW + 20, 360)]
    b.append(wash(smooth(pts) + ' L%d,480 L-20,480 Z' % (FARW + 20), '#9fb0c2', .8))
    # colinas y campos de enfrente
    pts = [(-20, 392)] + [(x, 372 + 16 * math.sin(x / 180 + 2) + R.uniform(-5, 5)) for x in range(0, FARW + 60, 50)] + [(FARW + 20, 392)]
    b.append(wash(smooth(pts) + ' L%d,480 L-20,480 Z' % (FARW + 20), '#a9b06c', .9, '#6f7a40'))
    for i in range(22):
        x = R.uniform(0, FARW); w = R.uniform(80, 200)
        b.append(wash(blob(x, R.uniform(392, 420), w, 10, 8, .25), R.choice(['#d8c070', '#c7b45e', '#9fae5a', '#b9a65a']), .8))
    # alamedas
    for i in range(70):
        x = R.uniform(0, FARW); hgt = R.uniform(40, 80)
        if 160 < x < 1000 and R.random() < .7: continue
        b.append(wash(blob(x, 412 - hgt / 2, 9, hgt / 2, 8, .2), R.choice(['#5f7f45', '#6e8e4e', '#4f6e3e']), .85))
    # Talavera al otro lado (oeste de la orilla): muralla, torres, Santa María y tejados
    wx0, wx1, wy = 180, 980, 405
    b.append(wash('M%d,%d L%d,%d L%d,%d L%d,%d Z' % (wx0, wy, wx1, wy, wx1 - 10, wy - 34, wx0 + 10, wy - 32), '#d8c29a', .95, '#8a6e48'))
    for x in range(wx0 + 6, wx1 - 6, 14): b.append(rect(x, wy - 40, 7, 7, '#d8c29a', .95))
    for i in range(46):
        x = R.uniform(wx0 + 20, wx1 - 30); y = wy - 34 - R.uniform(0, 26); w = R.uniform(18, 34); hh = R.uniform(14, 22)
        b.append(rect(x, y - hh, w, hh, R.choice(['#efe2c4', '#e8d6b0', '#f4ead2']), .95))
        b.append(P('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z' % (x - 3, y - hh, x + w / 2, y - hh - 9, x + w + 3, y - hh), R.choice(['#c0603e', '#b0553a', '#c97048']), 'none', 0, .95))
    for x, hh in [(240, 70), (420, 84), (610, 64), (850, 76), (940, 60)]:
        b.append(wash('M%d,%d h26 v-%d h-26 Z' % (x, wy - 30, hh), '#d4bd92', .97, '#7a6040'))
        for k in range(3): b.append(rect(x + k * 9, wy - 30 - hh - 6, 7, 7, '#d4bd92', .97))
    b.append(wash('M690,%d h60 v-70 h-60 Z' % (wy - 30), '#ecdcb8', .97, '#7a6040'))                       # Santa María
    b.append(wash('M690,%d l30,-22 l30,22 Z' % (wy - 100), '#c0603e', .97))
    b.append(wash('M750,%d h24 v-118 h-24 Z' % (wy - 30), '#ecdcb8', .97, '#7a6040'))
    b.append(wash('M748,%d l14,-30 l14,30 Z' % (wy - 148), '#c0603e', .97))
    b.append(P('M762,%d v-14 M756,%d h12' % (wy - 178, wy - 172), 'none', '#5a4030', 2))
    b.append(P('M746,%d q16,-6 32,0' % (wy - 150), 'none', '#efe6d4', 5))                                  # nido de cigüeñas
    # bruma de lejanía sobre todo
    b.append(rect(0, 300, FARW, 180, '#f1e6c8', .18))
    return svg(FARW, 480, '<g filter="url(#paper)">' + ''.join(b) + '</g>')

# ========================================================= CAPA CERCANA
def tree_canopy(cx, cy, rx, ry, cols, n=26, leaf=34):
    s = [wash(blob(cx, cy + ry * .15, rx * 1.02, ry * .95, 14, .18), '#3f5e2e', .9)]   # masa en sombra
    pts = []
    for i in range(n * 2):
        a = R.uniform(0, 2 * math.pi); r = R.uniform(0, 1) ** .55
        pts.append((cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r))
    pts.sort(key=lambda p: p[1] - p[0] * .3, reverse=True)      # de abajo-derecha (sombra) a arriba-izquierda (luz)
    for i, (x, y) in enumerate(pts):
        t = i / len(pts)
        base = cols[min(len(cols) - 1, int(t * len(cols)))]
        s.append(wash(blob(x, y, leaf * R.uniform(.55, 1.0), leaf * R.uniform(.4, .75), 8, .3), base, .78))
    for i in range(n // 2):
        x = cx - rx * .3 + R.uniform(-rx * .5, rx * .4); y = cy - ry * .4 + R.uniform(-ry * .4, ry * .3)
        s.append(P(blob(x, y, leaf * .4, leaf * .28, 7, .3), '#c9d98a', 'none', 0, .5))
    return ''.join(s)
def reeds(x, y, n, hgt, col='#6d7f3c'):
    s = []
    for i in range(n):
        xx = x + R.uniform(-n * 3, n * 3); h = hgt * R.uniform(.6, 1.1); bend = R.uniform(-18, 18)
        s.append(P('M%.1f,%.1f q%.1f,%.1f %.1f,%.1f' % (xx, y, bend * .3, -h * .6, bend, -h), 'none', R.choice([col, '#56692e', '#879a4a']), R.uniform(2.5, 4.5), .95))
        if R.random() < .3: s.append(P(blob(xx + bend, y - h - 8, 3.5, 11, 6, .1), '#6a4a2a', 'none', 0, .95))   # espadaña
    return ''.join(s)

def near_layer():
    b = []
    # río
    top = [(x, 425 + 6 * math.sin(x / 300)) for x in range(-20, W + 40, 80)]
    b.append(P(smooth(top) + ' L%d,600 L-20,600 Z' % (W + 20), 'url(#river)', 'none', 0, 1))
    for i in range(260):   # reflejos y corrientes
        x = R.uniform(0, W); y = R.uniform(440, 565); l = R.uniform(30, 120)
        b.append(P('M%.1f,%.1f q%.1f,-3 %.1f,0' % (x, y, l / 2, l), 'none', R.choice(['#e8f2ee', '#cfe2df', '#3f6a70']), R.uniform(1.2, 2.6), R.uniform(.25, .6)))
    b.append(rect(0, 425, W, 30, '#a9b06c', .25, 'filter="url(#soft3)"'))   # reflejo de la otra orilla
    b.append(rect(0, 415, W, 18, '#e9e2c8', .35, 'filter="url(#soft3)"'))   # bruma de río (une capas)
    # Isla del Chamelo (este): arena, sauces, chozo con humo, barca
    ix0, ix1, iy = 3280, 3930, 515
    b.append(wash(blob((ix0 + ix1) / 2, iy, (ix1 - ix0) / 2, 34, 14, .12), '#d9c08a', .95, '#8a6a3a'))
    b.append(tree_canopy(3450, 430, 110, 70, ['#6f8e4a', '#86a55a', '#5c7a3e'], 20, 30))
    b.append(tree_canopy(3740, 420, 140, 80, ['#7a9a52', '#6a8a48', '#9ab668'], 24, 32))
    for x in (3440, 3470, 3735, 3760): b.append(wash('M%d,%d q-4,-40 2,-80 h7 q4,40 2,80 Z' % (x, iy), '#7a5a3a', .95, '#3b2a1c'))
    b.append(wash('M3580,505 l40,-48 l40,48 Z', '#c9a96a', .97, '#6a4a2a'))       # chozo de juncos
    b.append(wash('M3608,505 v-20 a12,12 0 0 1 24,0 v20 Z', '#4a3020', .97))
    for k in range(5): b.append(P(blob(3626 + k * 8, 440 - k * 26, 10 + k * 5, 8 + k * 4, 8, .3), '#e9eef0', 'none', 0, .6 - k * .1, 'filter="url(#soft3)"'))
    b.append(wash('M3850,540 l70,0 l-10,12 l-50,0 Z', '#8a5a32', .97, '#3b2a1c'))
    for x in (3520, 3545, 3560): b.append(P(blob(x, 500, 5, 4, 6, .2), '#f2c94c', 'none', 0, 1))   # colmenas (abejas)
    b.append(wash('M3500,505 h40 v-26 q-20,-14 -40,0 Z', '#c99a5a', .97, '#6a4a2a'))
    # orilla cercana: arena húmeda, prado y camino
    shore = [(x, 565 + 8 * math.sin(x / 210 + 1) + R.uniform(-4, 4)) for x in range(-20, W + 40, 60)]
    b.append(P(smooth(shore) + ' L%d,900 L-20,900 Z' % (W + 20), '#bfa16c', 'none', 0, 1))
    b.append(wash(smooth([(x, y + 22) for x, y in shore]) + ' L%d,900 L-20,900 Z' % (W + 20), 'url(#ground)', 1))
    road = smooth([(x, 700 + 22 * math.sin(x / 520) + R.uniform(-3, 3)) for x in range(-20, W + 40, 80)]) + ' ' + ' '.join('L%.1f,%.1f' % (x, 812 + 18 * math.sin(x / 470 + 2)) for x in range(W + 20, -40, -80)) + ' Z'
    b.append(wash(road, '#dcc28c', .9, '#a8875a'))
    for i in range(70): x = R.uniform(0, W); b.append(P('M%.1f,%.1f q30,-2 60,0' % (x, R.uniform(712, 800)), 'none', '#b89a64', 2, .5))
    b.append(rect(0, 830, W, 70, '#6a5a32', .22, 'filter="url(#soft)"'))
    for i in range(90):   # manchas de hierba
        x = R.uniform(0, W); y = R.uniform(640, 890)
        b.append(wash(blob(x, y, R.uniform(30, 110), R.uniform(6, 18), 8, .3), R.choice(['#a8a85a', '#97a050', '#b6aa62', '#8d9a4a']), .55))
    for i in range(240):  # matas y flores
        x = R.uniform(0, W); y = R.uniform(630, 895)
        if R.random() < .7: b.append(P('M%.1f,%.1f l-4,-14 M%.1f,%.1f l1,-17 M%.1f,%.1f l5,-13' % (x, y, x + 3, y, x + 6, y), 'none', R.choice(['#6d7f3c', '#56692e', '#879a4a']), 2.2, .9))
        else: b.append(P(blob(x, y - 4, 4, 3.5, 6, .2), R.choice(['#d8452f', '#e9d24a', '#f2efe4', '#9a6ac0']), 'none', 0, .95))
    # vado: piedras medio sumergidas camino de la isla
    for k, (x, y) in enumerate([(3160, 600), (3215, 575), (3265, 553), (3305, 535)]):
        b.append(wash(blob(x, y, 24 - k * 2, 9 - k, 9, .2), '#9a9282', .95, '#4a4436'))
        b.append(P('M%d,%d q12,-4 24,0' % (x - 22, y + 3), 'none', '#e8f2ee', 2, .7))
    b.append(wash('M3080,640 h10 v-90 h-10 Z', '#7a5a3a', 1, '#3b2a1c'))                     # poste del vado con letrero
    b.append(wash('M3040,560 h96 v34 h-96 Z', '#e8d8b0', 1, '#6a4a2a'))
    # ---- oeste: camino desde la ribera y mojón
    b.append(wash('M150,700 q10,-46 30,-46 q20,0 26,46 Z', '#bdb4a2', 1, '#5a5446'))
    # ---- el sifón del aguador (450-1150): caños de barro sobre caballetes que cruzan hacia el río
    pipe = [(470, 640), (560, 560), (700, 540), (860, 548), (1000, 520), (1090, 470), (1120, 430)]
    for (x0, y0), (x1, y1) in zip(pipe, pipe[1:]):
        b.append(P('M%.1f,%.1f L%.1f,%.1f' % (x0, y0, x1, y1), 'none', '#6a3a22', 22, 1))
        b.append(P('M%.1f,%.1f L%.1f,%.1f' % (x0, y0, x1, y1), 'none', '#c8743e', 17, 1))
        b.append(P('M%.1f,%.1f L%.1f,%.1f' % (x0, y0 - 5, x1, y1 - 5), 'none', '#e69a5c', 4, .8))
        b.append(P(blob(x1, y1, 13, 13, 8, .1), '#a85a2e', '#5a2a14', 2, 1))
    for x, y in [(560, 560), (700, 540), (860, 548), (1000, 520)]:
        b.append(P('M%d,%d l-26,%d M%d,%d l26,%d M%d,%d h40' % (x, y + 8, 650 - y, x, y + 8, 650 - y, x - 20, y + 60), 'none', '#6a4a2a', 7, 1))
    for k in range(4): b.append(P(blob(1118, 452 + k * 30, 4, 7, 6, .1), '#bfe2ea', 'none', 0, .8))   # goteo
    b.append(wash('M380,650 a55,40 0 0 1 110,0 Z', '#c8743e', 1, '#5a2a14'))                  # tinaja-depósito
    b.append(wash('M400,615 h70 v-10 h-70 Z', '#8a4a26', 1))
    for x, y in [(620, 690), (660, 700), (600, 705)]: b.append(wash(blob(x, y, 22, 8, 8, .2), '#b8683a', 1, '#5a2a14'))   # caños rotos
    b.append(wash('M900,660 h120 v-50 h-120 Z', '#e8d8b0', 1, '#6a4a2a'))                    # tablón con el «plano»
    for k in range(4): b.append(P('M%d,%d h%d' % (912, 622 + k * 10, R.randint(60, 96)), 'none', '#6a5030', 2, .8))
    # ---- huerta (1300-1800): tapia de adobe, coles, espantapájaros con cuervo
    b.append(wash('M1280,650 L1290,585 L1820,581 L1830,650 Z', '#c9a873', .97, '#7a5a3a'))
    for x in range(1300, 1820, 26): b.append(P('M%d,%d h20' % (x, 585 + R.uniform(-2, 2)), 'none', '#a8875a', 4, 1))
    for r_ in range(3):
        for x in range(1320 + r_ * 12, 1800, 46): b.append(wash(blob(x, 606 + r_ * 13, 15, 9, 8, .2), R.choice(['#7fa45a', '#94b86a', '#6a9050']), .95, '#3f5a2e'))
    ex, ey = 1600, 612
    b.append(P('M%d,%d v-130 M%d,%d h90' % (ex, ey, ex - 45, ey - 100), 'none', '#6a4a2a', 7))
    b.append(wash('M%d,%d l30,0 l10,70 l-50,0 Z' % (ex - 15, ey - 108), '#8a6a4a', 1, '#3b2a1c'))      # sayo
    b.append(wash(blob(ex, ey - 122, 16, 18, 8, .15), '#e2cfa0', 1, '#6a5030'))                       # cabeza de saco
    b.append(wash('M%d,%d l60,0 l-14,-12 l-32,0 Z' % (ex - 30, ey - 136), '#5a4a38', 1, '#2a2018'))   # sombrero
    b.append(P('M%d,%d l6,6 l6,-6 M%d,%d q6,6 12,0' % (ex - 8, ey - 126, ex - 6, ey - 114), 'none', '#3b2a1c', 2))
    b.append(wash('M%d,%d q12,-14 26,-4 l8,-2 l-6,6 q-8,10 -26,4 Z' % (ex + 22, ey - 150), '#2a2a32', 1))   # cuervo
    b.append(P(blob(ex + 40, ey - 154, 2, 2, 5, 0), '#f2c94c'))
    # ---- higuera (1900-2500): tronco retorcido y copa de hojas grandes; rama baja donde se esconde Mingo
    hx = 2160
    b.append(wash('M%d,640 C%d,560 %d,520 %d,430 L%d,430 C%d,520 %d,560 %d,640 Z' % (hx - 70, hx - 40, hx - 60, hx - 30, hx + 30, hx + 20, hx + 40, hx + 70), '#8a7a66', 1, '#3b2a1c'))
    for k in range(7): b.append(P('M%d,640 C%d,560 %d,520 %d,440' % (hx - 50 + k * 15, hx - 30 + k * 10, hx - 50 + k * 14, hx - 25 + k * 8), 'none', '#5a4a3a', 2, .45))
    b.append(P('M%d,470 C%d,450 %d,430 %d,470' % (hx + 10, hx + 80, hx + 160, hx + 230), 'none', '#5a4a3a', 30))    # rama baja (Mingo, y≈468)
    b.append(P('M%d,470 C%d,450 %d,430 %d,470' % (hx + 10, hx + 80, hx + 160, hx + 230), 'none', '#8a7a66', 24))
    b.append(P('M%d,440 C%d,380 %d,330 %d,300' % (hx - 10, hx - 60, hx - 140, hx - 190), 'none', '#8a7a66', 20))
    b.append(tree_canopy(hx - 20, 255, 300, 150, ['#3f6a32', '#4f7a3a', '#5f8a42', '#6f9a4a', '#86ac5a'], 60, 40))
    for i in range(14): b.append(P(blob(hx + R.uniform(-240, 240), 330 + R.uniform(-110, 110), 8, 10, 6, .1), '#6a3a6a', '#2a1030', 1.5, .95))   # higos
    # ---- la parra del ciego (2600-3100): pérgola, racimos, banco de piedra, jarra
    for x in (2640, 2780, 2920, 3060):
        b.append(wash('M%d,650 h14 v-210 h-14 Z' % x, '#7a5a3a', 1, '#3b2a1c'))
    b.append(wash('M2620,440 h470 v14 h-470 Z', '#8a6a4a', 1, '#3b2a1c'))
    b.append(tree_canopy(2850, 420, 260, 50, ['#7a9a4a', '#8aaa52', '#6a8a42'], 40, 30))
    for x in (2690, 2760, 2840, 2930, 3010):
        for k in range(9): b.append(P(blob(x + (k % 3) * 9 - 9, 470 + (k // 3) * 9 + (k % 3) * 2, 5.5, 5.5, 6, .1), '#5a2e6a', '#2a1030', 1.2, 1))
    b.append(wash('M2760,640 h170 v-30 h-170 Z', '#b0a690', 1, '#5a5446'))                    # banco
    b.append(wash('M2950,640 q-14,-10 -10,-34 q2,-10 10,-14 h12 q8,4 10,14 q4,24 -10,34 Z', '#c8743e', 1, '#5a2a14'))   # jarra
    return svg(W, H, '<g filter="url(#paper)">' + ''.join(b) + '</g>')

def reeds_sprite(seed):
    R.seed(seed)
    return svg(320, 280, '<g filter="url(#paper)">' + reeds(160, 280, 26, 250) + reeds(110, 280, 10, 180, '#5c6e30') + '</g>')

def render(svgs):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, s, w, h, fmt in svgs:
            open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8').write(s)
            pg = b.new_page(viewport={'width': w, 'height': h})
            pg.set_content('<html><body style="margin:0;background:transparent">' + s + '</body></html>'); pg.wait_for_timeout(300)
            path = os.path.join(OUT, name + '.png')
            pg.screenshot(path=path, omit_background=True, clip={'x': 0, 'y': 0, 'width': w, 'height': h}); pg.close()
            from PIL import Image
            im = Image.open(path)
            if fmt == 'jpg': im.convert('RGB').save(os.path.join(OUT, name + '.jpg'), quality=86)
            else: im.save(os.path.join(OUT, name + '.webp'), quality=86, method=5)
            os.remove(path)
            print(name, w, h)
        b.close()

render([('far', far_layer(), FARW, 480, 'jpg'), ('near', near_layer(), W, H, 'webp'),
        ('reeds_a', reeds_sprite(7), 320, 280, 'webp'), ('reeds_b', reeds_sprite(11), 320, 280, 'webp')])
