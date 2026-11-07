"""Recursos del laboratorio de la aceña → production/LAB_ACENA/assets/
  elvira_pose.webp   Elvira recortada de la portada (GrabCut con pistas de pelo), en espejo para que mire a la derecha
  muela_frente.webp  la muela y la tolva recortadas del fondo interior (tapa los pies de quien está detrás)
  tronco.webp        tronco calzado junto al eje, pintado en acuarela con tinta para el exterior
  bg_ext.jpg         exterior de acuarela de César (art/escenarios/nuevos/acena.jpg)"""
import os, cv2, numpy as np, shutil, math
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets'); os.makedirs(OUT, exist_ok=True)
# ---- Elvira
por = cv2.imread(os.path.join(ROOT, 'art/portada/portada_1248_elvira_original.jpg'))
im = por[225:941, 850:1150].copy(); h, w = im.shape[:2]
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
mask = np.full((h, w), cv2.GC_BGD, np.uint8)
cv2.fillPoly(mask, [np.array([(70,72),(205,78),(232,150),(255,250),(250,300),(286,420),(298,715),(8,715),(14,300),(12,215),(14,150),(45,88)], np.int32)], cv2.GC_PR_FGD)
zone = np.zeros((h, w), np.uint8)
cv2.fillPoly(zone, [np.array([(60,70),(210,75),(235,150),(258,330),(225,335),(205,250),(60,250),(10,240),(10,150)], np.int32)], 1)
brown = (hsv[:,:,0] >= 3) & (hsv[:,:,0] <= 24) & (hsv[:,:,1] > 60) & (hsv[:,:,2] > 35) & (hsv[:,:,2] < 175)
hair = cv2.morphologyEx(((zone > 0) & brown).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3,3), np.uint8)) > 0
mask[hair] = cv2.GC_FGD
cv2.ellipse(mask, (120,175), (40,50), 0, 0, 360, cv2.GC_FGD, -1)
cv2.fillPoly(mask, [np.array([(55,225),(205,225),(220,300),(50,300)], np.int32)], cv2.GC_FGD)       # cuello y escote
cv2.rectangle(mask, (70,290), (220,520), cv2.GC_FGD, -1); cv2.rectangle(mask, (110,520), (220,700), cv2.GC_FGD, -1)
blue = (hsv[:,:,0] >= 90) & (hsv[:,:,0] <= 130) & (hsv[:,:,1] > 40)
mask[blue & (mask != cv2.GC_FGD)] = cv2.GC_BGD
mask[415:, 262:] = cv2.GC_BGD                                                                          # manga del guardia
bgd = np.zeros((1,65)); fgd = np.zeros((1,65))
cv2.grabCut(im, mask, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
a = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(a); a = np.where(lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
a = cv2.morphologyEx(a, cv2.MORPH_CLOSE, np.ones((5,5), np.uint8)); a = cv2.erode(a, np.ones((2,2), np.uint8))
a = cv2.GaussianBlur(a, (0,0), 0.9)
rgba = np.dstack([im, a])[:, ::-1]                                                                     # espejo: mira a la derecha
cv2.imwrite(os.path.join(OUT, 'elvira_pose.webp'), rgba, [cv2.IMWRITE_WEBP_QUALITY, 92])
# ---- muela (y tolva) como capa delantera
bg = cv2.imread(os.path.join(ROOT, 'art/escenarios/acena/bg.webp'))
x0, y0, x1, y1 = 632, 376, 904, 680
m = np.zeros((900, 1600), np.uint8)
cv2.ellipse(m, (767, 561), (134, 36), 0, 0, 360, 255, -1)                                              # cara superior de la piedra
cv2.rectangle(m, (636, 561), (899, 668), 255, -1); cv2.ellipse(m, (767, 668), (132, 10), 0, 0, 180, 255, -1)   # tambor
cv2.fillPoly(m, [np.array([(716,380),(816,380),(792,470),(778,548),(756,548),(742,470)], np.int32)], 255)       # tolva
m = cv2.GaussianBlur(m, (0,0), 1.0)
cv2.imwrite(os.path.join(OUT, 'muela_frente.webp'), np.dstack([bg[y0:y1, x0:x1], m[y0:y1, x0:x1]]), [cv2.IMWRITE_WEBP_QUALITY, 92])
# ---- tronco (acuarela con tinta, a juego con el exterior)
W, H = 300, 128; t = np.zeros((H, W, 4), np.uint8)
body = np.zeros((H, W), np.uint8)
cv2.ellipse(body, (40, 64), (26, 44), 0, 0, 360, 255, -1); cv2.rectangle(body, (40, 22), (262, 106), 255, -1); cv2.ellipse(body, (262, 64), (24, 42), 0, 0, 360, 255, -1)
col = np.zeros((H, W, 3), np.float32)
for y in range(H):
    k = 1 - abs(y - 60) / 60.0
    col[y, :] = np.array([62, 98, 140]) * (0.75 + 0.35 * k)          # BGR pardo
rng = np.random.default_rng(3)
col += rng.normal(0, 6, col.shape)
for i in range(14):                                                    # vetas
    yy = rng.integers(28, 100); cv2.line(col, (int(rng.integers(50, 120)), int(yy)), (int(rng.integers(160, 250)), int(yy + rng.integers(-4, 4))), (40, 62, 92), 2)
cv2.ellipse(col, (262, 64), (22, 40), 0, 0, 360, (120, 170, 205), -1)  # testa clara
for r in (8, 16, 26, 34): cv2.ellipse(col, (262, 64), (int(r * 0.55), r), 0, 0, 360, (80, 120, 160), 2)
cv2.line(col, (200, 30), (236, 18), (150, 200, 225), 6); cv2.line(col, (200, 30), (236, 18), (40, 50, 60), 1)   # cuña nueva
ink = cv2.Canny(body, 50, 150); ink = cv2.dilate(ink, np.ones((3,3), np.uint8))
col[ink > 0] = (34, 42, 52)
t[:, :, :3] = np.clip(col, 0, 255).astype(np.uint8); t[:, :, 3] = cv2.GaussianBlur(body, (0,0), 1.0)
M = cv2.getRotationMatrix2D((W / 2, H / 2), 10, 1.0); t = cv2.warpAffine(t, M, (W, H), borderValue=(0,0,0,0))
cv2.imwrite(os.path.join(OUT, 'tronco.webp'), cv2.resize(t, (150, 64), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 92])
shutil.copy(os.path.join(ROOT, 'art/escenarios/nuevos/acena.jpg'), os.path.join(OUT, 'bg_ext.jpg'))
print('ok', sorted(os.listdir(OUT)))
