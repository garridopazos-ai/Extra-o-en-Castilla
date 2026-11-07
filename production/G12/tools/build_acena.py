# -*- coding: utf-8 -*-
"""Aceña mejorada (arte de César): limpia el HUD que traía la captura, pinta la puerta de salida (era un rectángulo crema),
y genera las piezas para la rueda en marcha:
  bg.webp            fondo 1600×900 (rueda parada con el tronco, tal cual el arte)
  ventana_libre.webp interior de la ventana SIN rueda ni tronco (cielo y agua) para cuando la rueda gira
  rueda.webp         la rueda completa, sin tronco, con transparencia, para girarla en el juego
  poste.webp         el poste central recortado (capa ordenada: los personajes pasan por detrás)
Uso: python build_acena.py  (lee art/escenarios/acena/acena_mejorada_original.jpg)"""
import os, math, cv2, numpy as np
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
D = os.path.join(ROOT, 'art', 'escenarios', 'acena')
im = cv2.imread(os.path.join(D, 'acena_mejorada_original.jpg'))
H, W = im.shape[:2]                      # 2576 × 1438
SX, SY = 1600 / W, 900 / H
rng = np.random.default_rng(7)

# ---------- 1) quitar el zurrón y el rótulo «ACEÑA · provisional» que venían en la captura: copiar tablas del suelo de la derecha
x0, x1, y0 = 0, 350, 1200
patch = im[y0:H, 720:720 + (x1 - x0)].copy()
mask = np.zeros((H - y0, x1 - x0), np.float32); mask[:, :] = 1
mask[:, -40:] = np.linspace(1, 0, 40)[None, :]; mask[:30, :] *= np.linspace(0, 1, 30)[:, None]
reg = im[y0:H, x0:x1].astype(np.float32)
im[y0:H, x0:x1] = (reg * (1 - mask[:, :, None]) + patch.astype(np.float32) * mask[:, :, None]).astype(np.uint8)

# ---------- 2) puerta de salida: hueco con luz de día (antes un rectángulo crema)
dx0, dx1, dy0, dy1 = 2386, 2548, 696, 1094
door = np.zeros((dy1 - dy0, dx1 - dx0, 3), np.float32)
for y in range(dy1 - dy0):
    t = y / (dy1 - dy0)
    if t < 0.55: c = np.array([226, 214, 186]) * (1 - t / 0.55) + np.array([214, 196, 150]) * (t / 0.55)        # cielo claro (BGR)
    elif t < 0.66: c = np.array([90, 150, 120])                                                                       # orilla verde
    elif t < 0.74: c = np.array([170, 150, 110])                                                                      # río
    else: c = np.array([120, 175, 205]) * (1 - (t - 0.74) / 0.26) + np.array([95, 140, 170]) * ((t - 0.74) / 0.26)  # camino de tierra
    door[y, :] = c
door += rng.normal(0, 3, door.shape)
door[:, :26] *= np.linspace(0.45, 1, 26)[None, :, None]                                    # grosor del muro (sombra a la izquierda)
im[dy0:dy1, dx0:dx1] = np.clip(door, 0, 255).astype(np.uint8)
cv2.rectangle(im, (dx0 - 2, dy0 - 2), (dx1 + 1, dy1), (24, 30, 40), 5)
# luz que entra al suelo
spill = np.zeros((H, W), np.float32)
cv2.fillPoly(spill, [np.array([[dx0 + 10, dy1], [dx1, dy1], [dx1 - 60, H], [dx0 - 340, H]], np.int32)], 1)
spill = cv2.GaussianBlur(spill, (0, 0), 34) * 0.11
im = np.clip(im.astype(np.float32) + spill[:, :, None] * np.array([150, 190, 230])[None, None, :], 0, 255).astype(np.uint8)

bg = cv2.resize(im, (1600, 900), interpolation=cv2.INTER_AREA)
cv2.imwrite(os.path.join(D, 'bg.webp'), bg, [cv2.IMWRITE_WEBP_QUALITY, 90])

# ---------- 3) ventana sin rueda (cielo + agua) para la rueda en marcha
wx0, wx1, wy0, wy1 = 398, 850, 252, 1032
win = im[wy0:wy1, wx0:wx1].copy()
hsv = cv2.cvtColor(win, cv2.COLOR_BGR2HSV)
blue = (hsv[:, :, 0] > 82) & (hsv[:, :, 0] < 112) & (hsv[:, :, 1] > 30) & (hsv[:, :, 2] < 235)
rows = np.zeros((wy1 - wy0, 3), np.float32); last = None
for y in range(wy1 - wy0):
    sel = win[y][blue[y]]
    if len(sel) > 12: last = np.median(sel, axis=0)
    rows[y] = last if last is not None else win[y].mean(0)
rows = cv2.GaussianBlur(rows[:, None, :], (1, 0), sigmaX=1, sigmaY=9)[:, 0, :]
clean = np.repeat(rows[:, None, :], wx1 - wx0, axis=1)
clean += rng.normal(0, 2.2, clean.shape)
wl = int((960 - wy0))                                                                         # línea de agua
for i in range(60):                                                                            # espuma y corriente
    y = wl + rng.integers(-6, wy1 - wy0 - wl); x = rng.integers(0, wx1 - wx0); l = rng.integers(20, 90)
    cv2.ellipse(clean, (int(x), int(y)), (int(l), 3), 0, 0, 360, (226, 232, 232) if i % 3 else (150, 120, 100), -1)
clean = cv2.GaussianBlur(clean, (0, 0), 0.8)
cl = cv2.resize(np.clip(clean, 0, 255).astype(np.uint8), (round((wx1 - wx0) * SX), round((wy1 - wy0) * SY)), interpolation=cv2.INTER_AREA)
cv2.imwrite(os.path.join(D, 'ventana_libre.webp'), cl, [cv2.IMWRITE_WEBP_QUALITY, 90])

# ---------- 4) poste (capa ordenada)
px0, px1, py0, py1 = 1712, 1792, 380, 1132
cv2.imwrite(os.path.join(D, 'poste.webp'), cv2.resize(im[py0:py1, px0:px1], (round((px1 - px0) * SX), round((py1 - py0) * SY)), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 92])

# ---------- 5) la rueda completa, redibujada con la paleta y el trazo del arte (16 álabes, 12 radios, 12 abrazaderas)
CX, CY = 480, 640                       # centro del cubo en la imagen original
S = 760; c = S / 2                      # lienzo de la rueda en px de la imagen original
WOOD, WOODM, WOODD, INK, IRON, IRONH = '#7b5f48', '#66503e', '#4d3c31', '#2e221b', '#6e6b68', '#a3a7a6'
def pol(r, a): return (c + r * math.cos(a), c + r * math.sin(a))
def ring_sector(r0, r1, a0, a1):
    p0, p1, p2, p3 = pol(r1, a0), pol(r1, a1), pol(r0, a1), pol(r0, a0)
    big = 1 if a1 - a0 > math.pi else 0
    return 'M%.1f,%.1f A%.1f,%.1f 0 %d 1 %.1f,%.1f L%.1f,%.1f A%.1f,%.1f 0 %d 0 %.1f,%.1f Z' % (p0 + (r1, r1, big) + p1 + p2 + (r0, r0, big) + p3)
def rot_rect(r0, r1, w, a, fill, sw=5):
    pts = []
    for r, s in ((r0, -1), (r1, -1), (r1, 1), (r0, 1)):
        x, y = pol(r, a); pts.append((x + s * w / 2 * -math.sin(a), y + s * w / 2 * math.cos(a)))
    return '<polygon points="%s" fill="%s" stroke="%s" stroke-width="%d" stroke-linejoin="round"/>' % (' '.join('%.1f,%.1f' % p for p in pts), fill, INK, sw)
b = []
b.append('<filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9 .08" numOctaves="2" seed="3" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 .2 0 0 0 0 .13 0 0 0 0 .08 0 0 0 -1.2 .62" result="v"/><feComposite in="v" in2="SourceAlpha" operator="in" result="vm"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="vm"/></feMerge></filter>')
b.append('<g filter="url(#g)">')
for k in range(16):                                                   # álabes (palas)
    a = k * 2 * math.pi / 16 + 0.08
    b.append(rot_rect(282, 352, 36, a, WOODM))
    b.append(rot_rect(300, 350, 12, a - 0.012, WOOD, 0))
b.append('<circle cx="%.1f" cy="%.1f" r="269" fill="none" stroke="%s" stroke-width="62"/>' % (c, c, WOOD))     # llanta
b.append('<circle cx="%.1f" cy="%.1f" r="300" fill="none" stroke="%s" stroke-width="7"/><circle cx="%.1f" cy="%.1f" r="238" fill="none" stroke="%s" stroke-width="7"/>' % (c, c, INK, c, c, INK))
for k in range(28):                                                   # vetas de la llanta
    a = k * 2 * math.pi / 28; r = 255 + (k % 3) * 14
    b.append('<path d="M%.1f,%.1f A%d,%d 0 0 1 %.1f,%.1f" fill="none" stroke="%s" stroke-width="2.4" opacity=".7"/>' % (pol(r, a) + (r, r) + pol(r, a + 0.13) + (WOODD,)))
for k in range(12):                                                   # radios
    a = k * 2 * math.pi / 12
    b.append(rot_rect(48, 246, 24, a, WOODM, 5))
    b.append(rot_rect(60, 240, 7, a - 0.01, WOOD, 0))
for k in range(12):                                                   # abrazaderas de hierro con remaches
    a = k * 2 * math.pi / 12 + math.pi / 12
    b.append('<path d="%s" fill="%s" stroke="%s" stroke-width="5"/>' % (ring_sector(236, 302, a - 0.07, a + 0.07), IRON, INK))
    for r in (252, 286):
        for da in (-0.035, 0.035):
            x, y = pol(r, a + da); b.append('<circle cx="%.1f" cy="%.1f" r="4.2" fill="%s" stroke="%s" stroke-width="1.6"/>' % (x, y, IRONH, INK))
b.append('<circle cx="%.1f" cy="%.1f" r="58" fill="%s" stroke="%s" stroke-width="7"/>' % (c, c, WOOD, INK))              # cubo
b.append('<circle cx="%.1f" cy="%.1f" r="50" fill="none" stroke="%s" stroke-width="10"/>' % (c, c, IRON))
for k in range(8):
    x, y = pol(50, k * math.pi / 4); b.append('<circle cx="%.1f" cy="%.1f" r="4" fill="%s" stroke="%s" stroke-width="1.5"/>' % (x, y, IRONH, INK))
b.append('<polygon points="%s" fill="#3a2418" stroke="%s" stroke-width="4"/>' % (' '.join('%.1f,%.1f' % pol(27, k * math.pi / 4 + math.pi / 8) for k in range(8)), INK))
b.append('</g>')
svg = '<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">%s</svg>' % (S, S, S, S, ''.join(b))
open(os.path.join(D, 'rueda.svg'), 'w').write(svg)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(viewport={'width': S, 'height': S})
    pg.set_content('<html><body style="margin:0;background:transparent">' + svg + '</body></html>')
    pg.screenshot(path=os.path.join(D, 'rueda.png'), omit_background=True); br.close()
from PIL import Image
Image.open(os.path.join(D, 'rueda.png')).save(os.path.join(D, 'rueda.webp'), quality=92, method=5); os.remove(os.path.join(D, 'rueda.png'))
print('rueda: centro en juego (%.1f, %.1f), lado %.1f · ventana juego x %.1f-%.1f y %.1f-%.1f · poste x %.1f y %.1f-%.1f' % (
    CX * SX, CY * SY, S * SX, wx0 * SX, wx1 * SX, wy0 * SY, wy1 * SY, px0 * SX, py0 * SY, py1 * SY))
