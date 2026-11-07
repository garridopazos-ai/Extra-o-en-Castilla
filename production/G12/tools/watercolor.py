"""Acabado acuarela para fondos pintados (offline). Uso: python watercolor.py entrada salida [fuerza 0..1]
Pasos: lavados planos (filtro de preservación de bordes) · sangrado de color · bordes de pigmento oscurecidos (wet edges)
· granulado del pigmento · papel de acuarela (textura) · paleta cálida y algo desaturada, como las acuarelas del mural."""
import sys, cv2, numpy as np
src, dst = sys.argv[1], sys.argv[2]; K = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
alpha = im[:, :, 3] if im.shape[2] == 4 else None
bgr = im[:, :, :3]
h, w = bgr.shape[:2]
rng = np.random.default_rng(1248)
# 1) lavados: simplifica detalle fino (mean-shift + edge preserving)
wash = cv2.pyrMeanShiftFiltering(bgr, sp=int(4 * K) + 2, sr=int(14 * K) + 6)
wash = cv2.edgePreservingFilter(wash, flags=1, sigma_s=12, sigma_r=0.22)
# 2) sangrado: mezcla suave con versión desenfocada y desplazada por ruido (bordes irregulares)
noise = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), 3)
noise2 = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), 3)
s = 1.8 * K / (noise.std() + 1e-6)
mx, my = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
bleed = cv2.remap(wash, mx + noise * s, my + noise2 * s, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
f = bleed.astype(np.float32) / 255.0
# 3) bordes de pigmento: donde cambia el color, el pigmento se acumula (oscurece un poco)
lab = cv2.cvtColor(bleed, cv2.COLOR_BGR2LAB).astype(np.float32)
gx = cv2.Sobel(lab[:, :, 0], cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(lab[:, :, 0], cv2.CV_32F, 0, 1, ksize=3)
edge = np.clip(np.hypot(gx, gy) / 160.0, 0, 1)
edge = cv2.GaussianBlur(edge, (0, 0), 1.2)
f *= (1 - 0.32 * K * edge)[:, :, None]
# 4) granulado: ruido de alta frecuencia que oscurece más en tonos medios
gran = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), 0.9)
gran = (gran - gran.min()) / (gran.max() - gran.min())
mid = 1 - np.abs(f.mean(axis=2) - 0.5) * 2
f *= (1 - 0.10 * K * gran * mid)[:, :, None]
# 5) papel: fibras + manchas de humedad (multiplicativo, muy sutil) y luz del papel en las altas luces
paper = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), 2.2)
paper = cv2.normalize(paper, None, 0, 1, cv2.NORM_MINMAX)
blot = cv2.GaussianBlur(rng.standard_normal((h // 8, w // 8)).astype(np.float32), (0, 0), 3)
blot = cv2.resize(cv2.normalize(blot, None, 0, 1, cv2.NORM_MINMAX), (w, h))
f *= (0.93 + 0.07 * paper)[:, :, None] * (0.95 + 0.05 * blot)[:, :, None]
paper_col = np.array([0.86, 0.93, 0.97], np.float32)  # papel crudo (BGR)
f = f * (1 - 0.10 * K) + paper_col * 0.10 * K * (f.mean(axis=2, keepdims=True) > 0.7)
# 6) paleta: algo menos saturada y más cálida (las acuarelas del mural)
hsv = cv2.cvtColor(np.clip(f * 255, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
hsv[:, :, 1] *= 1 - 0.16 * K
hsv[:, :, 2] = np.clip(hsv[:, :, 2] * (1 + 0.04 * K) + 4 * K, 0, 255)
out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
if alpha is not None: out = np.dstack([out, alpha])
cv2.imwrite(dst, out, [cv2.IMWRITE_WEBP_QUALITY, 88] if dst.endswith('.webp') else [cv2.IMWRITE_JPEG_QUALITY, 88])
print('ok', dst, out.shape)
