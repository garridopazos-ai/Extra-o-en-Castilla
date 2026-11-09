"""Paloduz (regaliz) en la orilla del arroyo del Chamelo, con el trazo del fondo (tinta marrón + acuarela).
  paloduz_mata.png  la mata (hojas compuestas y espigas lila), siempre visible        → x 646, y 552 (195×164)
  paloduz_raiz.png  raíces amarillas al aire en la orilla descarnada (se recogen)      → mismo lienzo y posición
  paloduz_item.png  icono del zurrón (96×96): tres raíces atadas
Uso: python make_paloduz.py → art/escenarios/chamelo/"""
import os, math, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'art', 'escenarios', 'chamelo')
os.makedirs(OUT, exist_ok=True)
S = 4 * 1.3     # se dibuja en coordenadas de 150×126 y sale a 1,3× (195×164)
K = 1.3
INK = (52, 36, 24, 255)
random.seed(1248)

def P(pts): return [(x * S, y * S) for x, y in pts]
def qpts(p0, p1, p2, n=20):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in (i / n for i in range(n + 1))]
def stroke(d, pts, w, col):
    d.line(P(pts), fill=col, width=max(1, int(w * S)), joint='curve')
    r = w * S / 2
    for x, y in P([pts[0], pts[-1]]): d.ellipse([x - r, y - r, x + r, y + r], fill=col)
def ellipse_pts(cx, cy, a, b, ang, n=18):
    ca, sa = math.cos(ang), math.sin(ang)
    return [(cx + a * math.cos(t) * ca - b * math.sin(t) * sa, cy + a * math.cos(t) * sa + b * math.sin(t) * ca) for t in (i / n * 2 * math.pi for i in range(n))]
def leaflet(d, cx, cy, a, b, ang, col):
    pts = ellipse_pts(cx, cy, a, b, ang)
    d.polygon(P(pts), fill=col, outline=INK, width=int(0.9 * S))
    # nervio central y un toque de luz
    ca, sa = math.cos(ang), math.sin(ang)
    stroke(d, [(cx - a * 0.7 * ca, cy - a * 0.7 * sa), (cx + a * 0.6 * ca, cy + a * 0.6 * sa)], 0.5, (70, 90, 40, 255))
def watercolor(im, seed):
    """grano de papel y bordes algo más oscuros, como el fondo"""
    W, H = im.size
    rnd = random.Random(seed)
    noise = Image.effect_noise((W, H), 28).filter(ImageFilter.GaussianBlur(1.2)).convert('L')
    r, g, b, a = im.split()
    def mod(ch): return ImageChops.multiply(ch, noise.point(lambda v: int(232 + (v - 128) * 0.18)).convert('L')).point(lambda v: min(255, int(v * 1.09)))
    edge = a.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(1)).point(lambda v: 255 - int(v * 0.25))
    r, g, b = (ImageChops.multiply(mod(c), edge) for c in (r, g, b))
    return Image.merge('RGBA', (r, g, b, a))

W, H = 150, 126
BASE = (66, 112)   # pie de la mata en el lienzo

def make_mata():
    im = Image.new('RGBA', (int(W * S), int(H * S)), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    greens = [(118, 146, 62, 255), (134, 160, 70, 255), (100, 130, 56, 255), (146, 168, 82, 255)]
    # tallos con hojas compuestas (pares de foliolos), en abanico
    stems = [(-62, 64, 0.95), (-36, 92, 1.0), (-10, 104, 1.0), (16, 100, 1.0), (42, 86, 0.95), (66, 58, 0.9), (-80, 40, 0.8), (84, 36, 0.8)]
    for k, (dx, h, sc) in enumerate(stems):
        p0 = BASE; p2 = (BASE[0] + dx, BASE[1] - h); p1 = (BASE[0] + dx * 0.25, BASE[1] - h * 0.65)
        line = qpts(p0, p1, p2, 24)
        stroke(d, line, 1.6, INK); stroke(d, line, 0.9, (96, 120, 50, 255))
        for i in range(6, 25, 3):
            x, y = line[i]; x0, y0 = line[i - 1]
            ang = math.atan2(y - y0, x - x0)
            sz = (6.4 - i * 0.08) * sc
            col = greens[(k + i) % len(greens)]
            for side in (-1, 1):
                a2 = ang + side * 1.05
                leaflet(d, x + math.cos(a2) * sz * 1.1, y + math.sin(a2) * sz * 1.1, sz * 1.15, sz * 0.62, a2, col)
        leaflet(d, p2[0] + math.cos(math.atan2(p2[1] - line[-2][1], p2[0] - line[-2][0])) * 4, p2[1] - 3, 5 * sc, 3 * sc, -1.4, greens[k % 4])
    # espigas de flor lila (como las del regaliz), tres
    for (dx, h) in ((-22, 118), (6, 122), (30, 112)):
        top = (BASE[0] + dx, BASE[1] - h); mid = (BASE[0] + dx * 0.6, BASE[1] - h * 0.55)
        line = qpts(BASE, mid, top, 18)
        stroke(d, line[8:], 1.4, INK); stroke(d, line[8:], 0.8, (96, 120, 50, 255))
        for i in range(12, 19):
            x, y = line[i]
            for s in (-1, 1):
                cx, cy = x + s * (2.6 - (i - 12) * 0.2), y + random.uniform(-1, 1)
                col = random.choice([(176, 156, 214, 255), (156, 136, 200, 255), (196, 180, 226, 255)])
                d.ellipse(P([(cx - 2.3, cy - 2.0), (cx + 2.3, cy + 2.0)]), fill=col, outline=INK, width=int(0.7 * S))
    im = im.resize((int(W * K), int(H * K)), Image.LANCZOS)
    return watercolor(im, 1)

def root(d, pts, w):
    stroke(d, pts, w + 2.0, INK)
    stroke(d, pts, w, (226, 168, 62, 255))
    stroke(d, [(x, y - w * 0.25) for x, y in pts], w * 0.35, (240, 210, 140, 255))     # luz
    for i in range(2, len(pts) - 1, 3):                                                # anillos de la corteza
        (x0, y0), (x1, y1) = pts[i - 1], pts[i + 1]; dx, dy = x1 - x0, y1 - y0; l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l * w * 0.5, dx / l * w * 0.5; cx, cy = pts[i]
        d.line(P([(cx + nx, cy + ny), (cx - nx * 0.6, cy - ny * 0.6)]), fill=(150, 104, 46, 255), width=int(0.8 * S))
    for i in range(3, len(pts), 4):                                                    # raicillas
        x, y = pts[i]; ang = random.uniform(0.6, 2.4)
        stroke(d, [(x, y), (x + math.cos(ang) * 6, y + math.sin(ang) * 6)], 0.6, INK)

def make_raiz():
    im = Image.new('RGBA', (int(W * S), int(H * S)), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    # orilla descarnada: tierra oscura bajo la mata
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
    ds.ellipse(P([(24, 100), (126, 124)]), fill=(60, 40, 20, 110)); sh = sh.filter(ImageFilter.GaussianBlur(2.5 * S)); im.alpha_composite(sh)
    earth = [(30, 112), (44, 104), (66, 102), (92, 103), (114, 108), (122, 115), (100, 119), (66, 120), (40, 118)]
    d.polygon(P(earth), fill=(132, 96, 58, 255), outline=INK, width=int(1.1 * S))
    for x, y in ((48, 110), (78, 114), (104, 112)): d.ellipse(P([(x - 3, y - 1.5), (x + 3, y + 1.5)]), fill=(98, 70, 40, 255))
    # raíces amarillas que salen de la orilla hacia el camino
    root(d, qpts((52, 106), (40, 113), (20, 116)), 5.2)
    root(d, qpts((64, 107), (80, 118), (108, 120)), 6.2)
    root(d, qpts((72, 105), (100, 105), (130, 112)), 5.6)
    root(d, qpts((60, 108), (58, 116), (64, 122)), 4.2)
    im = im.resize((int(W * K), int(H * K)), Image.LANCZOS)
    return watercolor(im, 2)

def make_item():
    s = 96; im = Image.new('RGBA', (int(s * S), int(s * S)), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    root(d, qpts((14, 70), (46, 52), (84, 22)), 7.0)
    root(d, qpts((12, 58), (44, 48), (80, 34)), 6.0)
    root(d, qpts((22, 82), (52, 60), (88, 44)), 6.4)
    # atadijo de esparto
    stroke(d, [(40, 46), (50, 66)], 4.4, INK); stroke(d, [(40, 46), (50, 66)], 2.8, (190, 170, 110, 255))
    im = im.resize((s, s), Image.LANCZOS)
    return watercolor(im, 3)

if __name__ == '__main__':
    make_mata().save(os.path.join(OUT, 'paloduz_mata.png'))
    make_raiz().save(os.path.join(OUT, 'paloduz_raiz.png'))
    make_item().save(os.path.join(OUT, 'paloduz_item.png'))
    print('ok', OUT)
