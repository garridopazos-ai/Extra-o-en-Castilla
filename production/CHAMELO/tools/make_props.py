"""Objetos clave de la ribera, con el trazo del fondo (tinta marrón + acuarela):
  rope.png  cuerda atada al poste de amarre (tres vueltas bajo el aro de hierro, cabo colgando y rollo en el suelo)
            se coloca en x 1915, y 636 (145×90)
  pole.png  pértiga varada en la orilla, junto a la piedra (190×52), en x 858, y 712
Uso: python make_props.py → art/escenarios/ribera/{rope,pole}.png"""
import os, math, random
from PIL import Image, ImageDraw, ImageFilter
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'art', 'escenarios', 'ribera')
S = 4
INK = (46, 32, 24, 255)
def qpts(p0, p1, p2, n=24):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in (i / n for i in range(n + 1))]
def stroke(d, pts, w, col):
    pts = [(x * S, y * S) for x, y in pts]
    d.line(pts, fill=col, width=int(w * S), joint='curve')
    r = w * S / 2
    for x, y in (pts[0], pts[-1]): d.ellipse([x - r, y - r, x + r, y + r], fill=col)
def rope_seg(d, pts, w=6.2):
    stroke(d, pts, w + 2.6, INK)
    stroke(d, pts, w, (200, 163, 104, 255))
    stroke(d, [(x, y - w * 0.22) for x, y in pts], w * 0.35, (232, 204, 150, 255))      # brillo
    # trenzado: rayitas oblicuas
    for i in range(1, len(pts) - 1, 2):
        (x0, y0), (x1, y1) = pts[i - 1], pts[i + 1]
        dx, dy = x1 - x0, y1 - y0; l = math.hypot(dx, dy) or 1; nx, ny = -dy / l, dx / l
        cx, cy = pts[i]
        a = (cx + nx * w * 0.45 - dx / l * 1.4, cy + ny * w * 0.45 - dy / l * 1.4); b = (cx - nx * w * 0.45 + dx / l * 1.4, cy - ny * w * 0.45 + dy / l * 1.4)
        d.line([(a[0] * S, a[1] * S), (b[0] * S, b[1] * S)], fill=(128, 94, 54, 255), width=int(1.3 * S))
def make_rope():
    W, H = 145, 90
    im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    # sombra del rollo en el suelo
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
    ds.ellipse([84 * S, 74 * S, 140 * S, 88 * S], fill=(40, 25, 10, 90)); sh = sh.filter(ImageFilter.GaussianBlur(3 * S))
    im.alpha_composite(sh)
    # tres vueltas alrededor del poste (el poste va de x 12 a 85 en este lienzo)
    for k, y in enumerate((16, 25, 34)):
        rope_seg(d, qpts((10, y - 1), (48, y + 6), (87, y + 1)))
    # nudo y cabo que cae al suelo
    rope_seg(d, qpts((86, 24), (100, 30), (97, 48)) + qpts((97, 48), (94, 62), (104, 72))[1:])
    stroke(d, [(84, 21), (90, 27)], 9, INK); stroke(d, [(84, 21), (90, 27)], 6.5, (190, 152, 96, 255))
    # rollo en el suelo: dos vueltas en perspectiva
    for rx, ry, cy in ((22, 6.5, 79), (17, 5, 77)):
        pts = [(116 + rx * math.cos(t), cy + ry * math.sin(t)) for t in (i / 40 * 2 * math.pi for i in range(41))]
        rope_seg(d, pts, 5.4)
    rope_seg(d, qpts((104, 72), (108, 78), (118, 84)), 5.4)
    im = im.resize((W, H), Image.LANCZOS)
    im.save(os.path.join(OUT, 'rope.png')); return im
def make_pole():
    W, H = 190, 52
    im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
    ds.polygon([(14 * S, 38 * S), (180 * S, 26 * S), (184 * S, 34 * S), (16 * S, 47 * S)], fill=(45, 30, 15, 95)); sh = sh.filter(ImageFilter.GaussianBlur(3.2 * S))
    im.alpha_composite(sh)
    p0, p1 = (10, 35), (180, 20); th = 9.5
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]; l = math.hypot(dx, dy); nx, ny = -dy / l * th / 2, dx / l * th / 2
    body = [(p0[0] + nx, p0[1] + ny), (p1[0] + nx, p1[1] + ny), (p1[0] - nx, p1[1] - ny), (p0[0] - nx, p0[1] - ny)]
    d.polygon([(x * S, y * S) for x, y in body], fill=(162, 116, 70, 255), outline=None)
    # luz arriba, sombra abajo
    stroke(d, [(p0[0] - nx * 0.45, p0[1] - ny * 0.45), (p1[0] - nx * 0.45, p1[1] - ny * 0.45)], 2.6, (214, 172, 118, 255))
    stroke(d, [(p0[0] + nx * 0.55, p0[1] + ny * 0.55), (p1[0] + nx * 0.55, p1[1] + ny * 0.55)], 2.2, (118, 80, 46, 255))
    # vetas y nudos
    random.seed(4)
    for i in range(9):
        t = 0.08 + i * 0.1; x = p0[0] + dx * t; y = p0[1] + dy * t; o = random.uniform(-0.25, 0.25)
        stroke(d, [(x + nx * o, y + ny * o), (x + dx / l * random.uniform(8, 16) + nx * o, y + dy / l * 12 + ny * o)], 0.9, (120, 84, 50, 255))
    for t in (0.33, 0.71):
        x = p0[0] + dx * t; y = p0[1] + dy * t
        d.ellipse([(x - 2.6) * S, (y - 1.8) * S, (x + 2.6) * S, (y + 1.8) * S], fill=(96, 64, 36, 255))
    # contorno de tinta
    d.line([(x * S, y * S) for x, y in body + [body[0]]], fill=INK, width=int(2.2 * S), joint='curve')
    # punta cortada (madera clara) y punta gastada
    for (cx, cy), col in ((p1, (206, 160, 104, 255)), (p0, (176, 128, 80, 255))):
        r = th / 2 + 0.4
        d.ellipse([(cx - 2.6) * S, (cy - r) * S, (cx + 2.6) * S, (cy + r) * S], fill=col, outline=INK, width=int(1.8 * S))
    im = im.resize((W, H), Image.LANCZOS)
    im.save(os.path.join(OUT, 'pole.png')); return im
if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    r = make_rope(); p = make_pole()
    bg = Image.open('/tmp/claude-0/-home-claude/f4712dc8-8b9f-5103-a819-27050e2d19ad/scratchpad/bg_cur.png').convert('RGBA')
    bg.alpha_composite(r, (1915, 636)); bg.alpha_composite(p, (858, 712))
    a = bg.crop((1860, 540, 2100, 760)).resize((480, 440)); b = bg.crop((800, 660, 1100, 800)).resize((600, 280))
    W = Image.new('RGB', (1090, 440), 'white'); W.paste(a.convert('RGB'), (0, 0)); W.paste(b.convert('RGB'), (490, 0))
    W.save('/tmp/claude-0/-home-claude/f4712dc8-8b9f-5103-a819-27050e2d19ad/scratchpad/props_check.png')
