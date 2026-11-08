# -*- coding: utf-8 -*-
"""Corredera del Cristo · taberna de El Miedo (fondo PROVISIONAL, dibujo procedural en tinta + acuarela, 1600×900).
Composición: muralla del primer recinto (mampostería con verdugadas de ladrillo, almenas) de lado a lado; a la izquierda una
torre albarrana (planta rectangular, sillería en esquinas y arco alto que la une al adarve); a la derecha la taberna adosada a la
muralla (planta baja de piedra encalada, piso de entramado con balcón, tejado, chimenea, letrero «EL MIEDO» colgado de un hierro);
delante, la calle (corredera) de tierra con algún canto, mesa-tonel, banco y cántaros.
Salidas: izquierda → Puerta del Río (se llega por la ronda de la muralla, con un poste indicador en la Puerta del Río: poste_puerta.png). Puerta de la taberna (de momento cerrada: «dentro no cabe ni el miedo»).
Uso: python make_corredera.py → art/escenarios/corredera/{bg.jpg,bg.svg,front.png} y escribe las medidas útiles."""
import os, random, math, sys
R = random.Random(1248)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
OUT = os.path.join(ROOT, 'art', 'escenarios', 'corredera'); os.makedirs(OUT, exist_ok=True)
W, H = 1600, 900
INK = '#3b2417'
o = []; A = o.append
def P(pts, fill, sw=2.4, stroke=INK, extra=''):
    return '<polygon points="%s" fill="%s" stroke="%s" stroke-width="%.1f" stroke-linejoin="round" %s/>' % (' '.join('%.1f,%.1f' % p for p in pts), fill, stroke, sw, extra)
def Rr(x, y, w, h, fill, sw=2.0, rx=0, stroke=INK, extra=''):
    return '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="%s" stroke="%s" stroke-width="%.1f" %s/>' % (x, y, w, h, rx, fill, stroke, sw, extra)
def Pa(d, fill='none', sw=2.2, stroke=INK, extra=''):
    return '<path d="%s" fill="%s" stroke="%s" stroke-width="%.1f" stroke-linejoin="round" stroke-linecap="round" %s/>' % (d, fill, stroke, sw, extra)
def C(x, y, r, fill, sw=1.6, stroke=INK, extra=''):
    return '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" stroke="%s" stroke-width="%.1f" %s/>' % (x, y, r, fill, stroke, sw, extra)
def E(x, y, rx, ry, fill, sw=1.6, stroke=INK, extra=''):
    return '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="%s" stroke="%s" stroke-width="%.1f" %s/>' % (x, y, rx, ry, fill, stroke, sw, extra)
def jit(c, k=10):
    n = int(c[1:], 16); r, g, b = n >> 16, (n >> 8) & 255, n & 255
    d = R.randint(-k, k); return '#%02x%02x%02x' % tuple(max(0, min(255, v + d + R.randint(-3, 3))) for v in (r, g, b))

A('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">' % (W, H, W, H))
A('''<defs>
<filter id="wob" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter>
<filter id="wash" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="3" seed="3" result="t"/>
 <feColorMatrix in="t" type="matrix" values="0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .32  0 0 0 -1.4 .9" result="m"/><feComposite in="m" in2="SourceGraphic" operator="in" result="mm"/>
 <feBlend in="SourceGraphic" in2="mm" mode="multiply"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .2  0 0 0 -.9 .55"/></filter>
<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter><filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fa4d6"/><stop offset=".55" stop-color="#a9cde6"/><stop offset="1" stop-color="#e9e2c6"/></linearGradient>
<linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a77a"/><stop offset="1" stop-color="#b48c5e"/></linearGradient>
<linearGradient id="lamp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a0"/><stop offset="1" stop-color="#f0a040"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0c" stop-opacity=".35"/></radialGradient>
</defs>''')
A('<rect width="%d" height="%d" fill="url(#sky)"/>' % (W, H))
# nubes de acuarela
for (cx, cy, s) in [(180, 90, 1.1), (620, 60, .9), (1040, 110, 1.2), (1420, 70, .8)]:
    g = ''.join(E(cx + R.uniform(-70, 70) * s, cy + R.uniform(-12, 12), R.uniform(40, 80) * s, R.uniform(18, 30) * s, '#fbf7ee', 0, 'none', 'opacity=".9"') for _ in range(7))
    A('<g filter="url(#blur2)">' + g + '</g>')
# tejados lejanos de la villa (por encima de la muralla)
A('<g filter="url(#wob)">')
x = 560
while x < 1600:
    w = R.uniform(70, 130); h = R.uniform(30, 60); y = 250 - h
    A(Rr(x, y + 18, w, h, jit('#e8d6b0'), 1.6))
    A(P([(x - 8, y + 20), (x + w / 2, y - 8), (x + w + 8, y + 20)], jit('#c4553a'), 1.6))
    x += w + R.uniform(-10, 20)
A(Rr(760, 120, 46, 140, '#e2d0a8', 2) + P([(752, 124), (783, 84), (814, 124)], '#b9482f', 2))      # campanario lejano (Santa María)
A(Rr(774, 150, 18, 24, '#3b2417', 0))
A('</g>')

# ---------------- muralla del primer recinto: mampostería con verdugadas de ladrillo
WY0, WY1 = 250, 694
A('<g filter="url(#wob)">')
A(Rr(-10, WY0, W + 20, WY1 - WY0, '#d6c39a', 2.6))
y = WY0 + 8
while y < WY1 - 6:
    band = (int((y - WY0) / 74) % 2 == 1) and (y - WY0) % 74 < 22
    if band:   # verdugada de ladrillo (tres hiladas)
        for k in range(2):
            xx = -10 + (k % 2) * 14
            while xx < W:
                A(Rr(xx, y + k * 7, 26, 6, jit('#b7653e', 12), .8, 1))
                xx += 28
        y += 16
    else:      # mampostería: cantos irregulares
        xx = -10
        while xx < W:
            w = R.uniform(22, 58); h = R.uniform(13, 24)
            A(Rr(xx, y + R.uniform(-3, 3), w, h, jit(R.choice(['#cdb88e', '#bfae8a', '#d8c7a0', '#b9a789', '#c7b28a', '#a99a80']), 10), 1.0, 7))
            xx += w + R.uniform(1, 4)
        y += 22
# almenas del adarve
for xx in range(0, W, 46):
    A(Rr(xx, WY0 - 28, 30, 30, jit('#d2bd94', 6), 2.2))
A(Rr(-10, WY0 - 4, W + 20, 10, '#c4ae84', 2))
# hierbas al pie de la muralla
A('</g>')

# ---------------- torre albarrana (planta rectangular, sillería en esquinas, arco alto hacia el adarve, almenas)
TX0, TX1, TY0, TY1 = 300, 520, 60, 700
A('<g filter="url(#wob)">')
# arco alto que la une a la muralla (a la derecha)
A(P([(TX1 - 4, 170), (680, 170), (680, 250), (TX1 - 4, 250)], '#cdb88e', 2.4))
A(Pa('M%d,250 L%d,215 Q%d,182 %d,182 Q%d,182 %d,215 L%d,250 Z' % (TX1 + 18, TX1 + 18, TX1 + 18, 600, 662, 662, 662), '#7d93a6', 2.4))   # luz del arco (cielo detrás)
for xx in range(TX1, 680, 44):
    A(Rr(xx, 140, 28, 30, jit('#d2bd94', 6), 2))
# cuerpo de la torre
A(Rr(TX0, TY0, TX1 - TX0, TY1 - TY0, '#cfba90', 3))
yy = TY0 + 6
while yy < TY1 - 10:
    xx = TX0 + 4
    while xx < TX1 - 6:
        w = R.uniform(24, 46); A(Rr(xx, yy, min(w, TX1 - 6 - xx), R.uniform(15, 20), jit(R.choice(['#cdb88e', '#c1ad86', '#d6c49c']), 8), 1.0, 5)); xx += w + 2
    yy += 21
# sillería en esquinas (bloques claros alternos)
for i, yy in enumerate(range(TY0, TY1 - 10, 30)):
    w = 46 if i % 2 else 30
    A(Rr(TX0, yy, w, 30, jit('#e6d6b2', 5), 1.8)); A(Rr(TX1 - w, yy, w, 30, jit('#e6d6b2', 5), 1.8))
# almenas y matacán
for xx in range(TX0 - 6, TX1, 42):
    A(Rr(xx, TY0 - 34, 28, 36, jit('#d9c7a0', 5), 2.2))
A(Rr(TX0 - 10, TY0 - 4, TX1 - TX0 + 20, 12, '#c4ae84', 2.2))
# saeteras
for (sx, sy) in [(410, 170), (410, 330), (410, 470)]:
    A(Rr(sx - 5, sy - 26, 10, 52, '#2c1d14', 1.6, 4))
# arco bajo (el antiguo foso pasaba por debajo): hueco oscuro en la base
A(Pa('M342,700 L342,600 Q342,548 410,548 Q478,548 478,600 L478,700 Z', '#4a3a2e', 3))
A(Pa('M352,700 L352,604 Q352,560 410,560 Q468,560 468,604 L468,700', 'none', 1.4, '#6a5444'))
A('</g>')
# vencejos posados / nido de cigüeña en lo alto (guiño)
A('<g filter="url(#wob)">' + E(470, 24, 30, 8, '#8a6a44', 2) + ''.join(Pa('M%d,%d l%d,-6' % (446 + k * 8, 26, R.randint(-6, 6)), 'none', 1.4, '#5a4028') for k in range(7)) + '</g>')

A('<g opacity=".28" filter="url(#blur6)">' + P([(TX1, TY0 + 40), (TX1 + 70, TY0 + 90), (TX1 + 70, 694), (TX1, 694)], '#3a2a40', 0) + '</g>')
A('<g opacity=".3" filter="url(#blur6)">' + Rr(-10, 680, W + 20, 18, '#3a2a40', 0) + '</g>')
# ---------------- taberna «El Miedo», adosada a la muralla
A('<g filter="url(#wob)">')
BX0, BX1 = 900, 1500
A(P([(BX0 - 20, 330), (BX1 + 20, 330), (BX1 + 40, 380), (BX0 - 40, 380)], '#b9482f', 2.6))           # alero del piso
A(Rr(BX0, 380, BX1 - BX0, 300, '#efe3c6', 3))                                                          # planta baja encalada
A('<g opacity=".3" filter="url(#blur6)">' + Rr(BX0, 380, BX1 - BX0, 26, '#3a2a40', 0) + Rr(BX0 + 20, 200, BX1 - BX0 - 40, 18, '#3a2a40', 0) + Rr(BX1 - 40, 380, 40, 300, '#3a2a40', 0) + '</g>')
for _ in range(26):   # piedra que asoma bajo la cal
    sx, sy = R.uniform(BX0 + 10, BX1 - 60), R.uniform(390, 650)
    A(Rr(sx, sy, R.uniform(22, 44), R.uniform(12, 18), jit('#cdb88e', 8), 1.0, 5, extra='opacity=".85"'))
A(Rr(BX0, 640, BX1 - BX0, 40, '#cdb88e', 2.4))                                                         # zócalo
# piso de entramado (madera + adobe) sobre el alero
A(Rr(BX0 + 20, 200, BX1 - BX0 - 40, 132, '#ecdcb8', 3))
for xx in range(BX0 + 20, BX1 - 20, 64): A(Rr(xx, 200, 12, 132, '#6b4a2e', 1.6))
A(Rr(BX0 + 20, 200, BX1 - BX0 - 40, 12, '#6b4a2e', 1.6)); A(Rr(BX0 + 20, 262, BX1 - BX0 - 40, 10, '#6b4a2e', 1.4))
for xx in range(BX0 + 20, BX1 - 84, 128): A(Pa('M%d,212 L%d,262' % (xx + 12, xx + 76), 'none', 7, '#6b4a2e'))
A(P([(BX0 - 10, 200), (BX0 + 120, 120), (BX1 - 120, 120), (BX1 + 10, 200)], '#c4553a', 3))         # tejado
A('<clipPath id="roof"><polygon points="%d,200 %d,120 %d,120 %d,200"/></clipPath>' % (BX0 - 10, BX0 + 120, BX1 - 120, BX1 + 10))
A('<g clip-path="url(#roof)">' + ''.join(Pa('M%d,200 L%d,120' % (xx, xx + (1200 - xx) * 0.18), 'none', 1.3, '#8e3a26') for xx in range(BX0 - 10, BX1 + 10, 20)) + ''.join(Pa('M%d,%d L%d,%d' % (BX0 - 10, yy, BX1 + 10, yy), 'none', 1, '#a84530') for yy in (140, 160, 180)) + '</g>')
A(Rr(1360, 70, 44, 70, '#cdb88e', 2.4) + Rr(1354, 62, 56, 12, '#b9a789', 2))                          # chimenea
# ventanas del piso con postigos y macetas
for wx in (980, 1220):
    A(Rr(wx, 220, 70, 46, '#3b2a20', 2) + Rr(wx - 26, 218, 24, 50, '#5c7a54', 1.8) + Rr(wx + 72, 218, 24, 50, '#5c7a54', 1.8))
    A(Rr(wx - 6, 272, 82, 10, '#6b4a2e', 1.6))
    for k in range(3): A(Rr(wx + 4 + k * 24, 256, 16, 16, '#b8653e', 1.2) + C(wx + 12 + k * 24, 252, 9, '#6f9a4a', 1.2) + C(wx + 10 + k * 24, 246, 3, '#e04a3a', 0))
# puerta de la taberna (arco de medio punto, madera) y luz cálida
DX0, DX1, DY0 = 1060, 1180, 470
A(Pa('M%d,680 L%d,%d Q%d,%d %d,%d Q%d,%d %d,%d L%d,680 Z' % (DX0 - 14, DX0 - 14, DY0, DX0 - 14, DY0 - 64, (DX0 + DX1) / 2, DY0 - 64, DX1 + 14, DY0 - 64, DX1 + 14, DY0, DX1 + 14), '#d8c49c', 2.6))
A(Pa('M%d,680 L%d,%d Q%d,%d %d,%d Q%d,%d %d,%d L%d,680 Z' % (DX0, DX0, DY0, DX0, DY0 - 52, (DX0 + DX1) / 2, DY0 - 52, DX1, DY0 - 52, DX1, DY0, DX1), '#6e4a2c', 2.6))
for xx in range(DX0 + 20, DX1, 20): A(Pa('M%d,%d L%d,680' % (xx, DY0 - 40 if abs(xx - (DX0 + DX1) / 2) < 40 else DY0 - 10, xx), 'none', 1.4, '#4a3020'))
A(Rr(DX0 + 6, 540, 40, 60, '#ffcf7a', 1.6, 4))                       # puerta entornada: luz de dentro
A(Pa('M%d,540 l40,0 l0,60 l-40,0' % (DX0 + 6), 'none', 1.2, '#b06a2a'))
for (ny, nx) in [(520, DX0 + 86), (600, DX0 + 86)]: A(C(nx, ny, 3, '#2a2a2a', 1))
# farol
A(Pa('M1196,430 l30,0 l0,14', 'none', 3, '#2a2420') + P([(1214, 444), (1238, 444), (1242, 480), (1210, 480)], 'url(#lamp)', 2) + Pa('M1212,444 l14,-10 l14,10', 'none', 2))
A(C(1226, 462, 34, 'url(#glow)', 0, 'none'))
# letrero colgado de un hierro: «EL MIEDO» y una cara de susto
A(Pa('M1300,410 L1420,410 M1310,410 q20,22 40,0', 'none', 4, '#2a2420'))
A(Pa('M1330,410 l0,22 M1400,410 l0,22', 'none', 2, '#2a2420'))
A(Rr(1310, 432, 110, 86, '#c99a5a', 2.6, 6))
A(Rr(1316, 438, 98, 74, 'none', 1.4, 4, '#7a5530'))
A(C(1365, 466, 17, '#f4e6c8', 1.8) + C(1359, 461, 4.2, '#fff', 1.2) + C(1372, 461, 4.2, '#fff', 1.2) + C(1359, 462, 1.8, INK, 0) + C(1372, 462, 1.8, INK, 0) + E(1366, 474, 4, 5, INK, 0))
A(Pa('M1350,452 l6,-6 M1381,452 l-6,-6', 'none', 1.6))      # cejas de susto
A('<text x="1365" y="505" font-family="TeX Gyre Bonum, Georgia, serif" font-weight="bold" font-size="17" text-anchor="middle" fill="%s" letter-spacing="1">EL MIEDO</text>' % INK)
# pequeña ventana de la planta baja con reja
A(Rr(940, 470, 64, 64, '#3b2a20', 2.2) + ''.join(Pa('M%d,470 l0,64' % (952 + k * 14), 'none', 2, '#2a2420') for k in range(4)) + Pa('M940,502 l64,0', 'none', 2, '#2a2420'))
# ristras de ajos y pimientos junto a la puerta
for (rx, col) in [(1018, '#efe6d0'), (1206, '#c7372a')]:
    A(Pa('M%d,420 l0,90' % rx, 'none', 1.4, '#7a5530'))
    for k in range(7): A(E(rx + (k % 2) * 6 - 3, 432 + k * 11, 6, 6 if col == '#efe6d0' else 4, col, 1.2))
# placa de la calle
A(Rr(1424, 404, 66, 30, '#f2e6c8', 1.8, 3) + '<text x="1457" y="417" font-family="TeX Gyre Pagella, Georgia, serif" font-size="9.5" text-anchor="middle" fill="%s">CORREDERA</text><text x="1457" y="428" font-family="TeX Gyre Pagella, Georgia, serif" font-size="9.5" text-anchor="middle" fill="%s">DEL CRISTO</text>' % (INK, INK))
A('</g>')

# ---------------- calle (corredera): tierra batida con cantos y rodadas
A('<g filter="url(#wob)">')
A(P([(-10, 690), (W + 10, 690), (W + 10, H + 10), (-10, H + 10)], 'url(#street)', 2.4))
A('</g>')
for _ in range(90):
    x, y = R.uniform(0, W), R.uniform(700, 900); s = 0.5 + (y - 680) / 220
    A(E(x, y, R.uniform(5, 12) * s, R.uniform(1.8, 3.6) * s, jit(R.choice(['#d8bf92', '#bda07a', '#c9b08a', '#a98a64']), 6), 1.0 * s, '#7a5a3a', 'opacity=".8"'))
for k in range(3):   # rodadas de carro
    y = 760 + k * 50
    A(Pa('M-10,%d C400,%d 900,%d 1610,%d' % (y, y - 6, y + 8, y - 4), 'none', 2.2, '#8e6a44', 'opacity=".45"'))
# hierbas al pie de muros
for x in list(range(0, 300, 18)) + list(range(530, 900, 22)) + list(range(1500, 1600, 16)):
    h = R.uniform(10, 26); A(Pa('M%.1f,%d q-4,-%.1f -8,-%.1f M%.1f,%d q2,-%.1f 6,-%.1f' % (x, 682, h * .6, h, x + 4, 682, h * .7, h * 1.1), 'none', 2, '#5f7d3a'))
# mobiliario de la taberna en la calle: tonel-mesa, banco, cántaros (se dibujan en el fondo; el banco lleva hueco de paso)
A('<g filter="url(#wob)">')
A(E(1300, 742, 46, 10, '#6e4a2c', 2.2) + Rr(1258, 664, 84, 80, '#8a5a34', 2.4, 10) + E(1300, 664, 42, 10, '#a06a3e', 2.2))
for yy in (680, 724): A(Pa('M1258,%d q42,8 84,0' % yy, 'none', 3, '#3b3530'))
A(Rr(1270, 640, 22, 26, '#b8653e', 1.6, 5) + Rr(1300, 646, 18, 20, '#e8d8b0', 1.4, 4) + E(1309, 646, 9, 3, '#6b4a2e', 1))   # jarra y vaso
A(Rr(1360, 700, 150, 16, '#8a5a34', 2.2, 3) + Rr(1368, 716, 10, 34, '#6e4a2c', 1.8) + Rr(1490, 716, 10, 34, '#6e4a2c', 1.8))   # banco
A(E(1545, 726, 22, 26, '#c97a4a', 2) + E(1545, 702, 12, 4, '#7a4a2a', 1.6))   # cántaro grande
A('</g>')
# rueda de carro apoyada en la muralla (izquierda, junto a la torre)
A('<g filter="url(#wob)">' + C(600, 640, 52, 'none', 7, '#6e4a2c') + C(600, 640, 52, 'none', 2, INK) + ''.join(Pa('M600,640 l%.1f,%.1f' % (52 * math.cos(a), 52 * math.sin(a)), 'none', 4, '#6e4a2c') for a in [k * math.pi / 4 for k in range(8)]) + C(600, 640, 9, '#4a3020', 1.6) + '</g>')
def signpost(x, y, boards, h=150):
    g = '<g filter="url(#wob)">' + Rr(x - 6, y - h, 12, h, '#6e4a2c', 2.2) + P([(x - 8, y - h), (x, y - h - 10), (x + 8, y - h)], '#6e4a2c', 2)
    for i, (txt, d, w) in enumerate(boards):
        w = len(txt) * 8.9 + 30
        by = y - h + 14 + i * 34
        pts = [(x - 4, by), (x + d * (w - 14), by), (x + d * w, by + 13), (x + d * (w - 14), by + 26), (x - 4, by + 26)] if d > 0 else \
              [(x + 4, by), (x - (w - 14), by), (x - w, by + 13), (x - (w - 14), by + 26), (x + 4, by + 26)]
        g += P(pts, '#e8d3a2', 2) + '<text x="%.1f" y="%.1f" font-family="TeX Gyre Bonum, Georgia, serif" font-weight="bold" font-size="12.5" text-anchor="middle" fill="%s">%s</text>' % (x + d * (w / 2 - 4), by + 17.5, INK, txt)
    return g + '</g>'
A(signpost(176, 700, [('PUERTA DEL RÍO', -1, 130)]))
A('<rect width="%d" height="%d" filter="url(#grain)" opacity=".45"/>' % (W, H))
A('<rect width="%d" height="%d" fill="url(#vig)"/>' % (W, H))
A('</svg>')
svg = '\n'.join(o)
open(os.path.join(OUT, 'bg.svg'), 'w', encoding='utf-8').write(svg)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1.5)
    pg.set_content('<html><body style="margin:0;background:#000">' + svg + '</body></html>'); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(OUT, '_bg_big.png'), clip={'x': 0, 'y': 0, 'width': W, 'height': H}); b.close()
from PIL import Image
import numpy as np, cv2
im = np.array(Image.open(os.path.join(OUT, '_bg_big.png')).convert('RGB').resize((W, H), Image.LANCZOS)).astype(np.float32)
rng = np.random.default_rng(5)
def noise(scale, sig):
    n = rng.normal(0, 1, (H // scale + 2, W // scale + 2)).astype(np.float32)
    n = cv2.resize(n, (W + 2 * scale, H + 2 * scale), interpolation=cv2.INTER_CUBIC)[scale:scale + H, scale:scale + W]
    return cv2.GaussianBlur(n, (0, 0), sig)
# pigmento irregular (acuarela): variación de valor a baja frecuencia, algo de color, y bordes de «charco» más oscuros
low = noise(40, 8); mid = noise(10, 3); hi = rng.normal(0, 1, (H, W)).astype(np.float32)
for c, k in enumerate((1.0, 0.92, 0.85)):
    im[..., c] *= 1 + 0.045 * low * k + 0.02 * mid
im = cv2.bilateralFilter(np.clip(im, 0, 255).astype(np.uint8), 7, 30, 6).astype(np.float32)
im *= (1 + 0.018 * hi)[..., None]
Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'bg.jpg'), quality=88)
os.remove(os.path.join(OUT, '_bg_big.png'))
defs = svg[svg.index('<defs>'):svg.index('</defs>') + 7]
post = '<svg xmlns="http://www.w3.org/2000/svg" width="260" height="240" viewBox="0 0 260 240">' + defs + signpost(30, 236, [('CORREDERA DEL CRISTO', 1, 162), ('TABERNA «EL MIEDO»', 1, 146)], 214) + '</svg>'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 260, 'height': 240}, device_scale_factor=2)
    pg.set_content('<html><body style="margin:0;background:transparent">' + post + '</body></html>'); pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(OUT, '_post.png'), omit_background=True, clip={'x': 0, 'y': 0, 'width': 260, 'height': 240}); b.close()
Image.open(os.path.join(OUT, '_post.png')).resize((260, 240), Image.LANCZOS).save(os.path.join(OUT, 'poste_puerta.png')); os.remove(os.path.join(OUT, '_post.png'))
print('ok', os.path.getsize(os.path.join(OUT, 'bg.jpg')) // 1024, 'KB')
