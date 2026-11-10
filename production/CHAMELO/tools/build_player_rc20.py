"""RC20 · hoja del protagonista ampliada. Parte de work/player_rc18/sheet.png (celda 240x372, 12 columnas) y
 - sustituye la marcha por la de PERFIL real (clip 1000700208, mirado a la derecha → se espeja para que el arte mire a la izquierda como el resto),
 - añade 'give' (clip 1000700225: tender la mano), 'pick' (1000700215: agacharse a coger, ida y vuelta) y 'look' (1000704365: mirar alrededor).
Croma verde con key2 (mayor componente conexa; la sombra verde oscura del clip 'agacharse' también se elimina).
Uso: python3 build_player_rc20.py <dir source_clips> <hoja rc18> <salida>"""
import cv2, numpy as np, os, sys, json
from scipy import ndimage as ndi
CLIPS, SHEET18, OUT = sys.argv[1].rstrip('/') + '/', sys.argv[2], sys.argv[3].rstrip('/') + '/'; os.makedirs(OUT, exist_ok=True)
CW, CH, GY, S, COLS = 240, 372, 364, 0.315, 12
def rd(name):
    cap = cv2.VideoCapture(CLIPS + name); fr = []
    while True:
        ok, im = cap.read()
        if not ok: break
        fr.append(im)
    return fr
def key2(bgr, lo=22.0, hi=48.0):
    f = bgr.astype(np.float32); B, G, R = f[..., 0], f[..., 1], f[..., 2]
    gex = G - np.maximum(R, B); a = 1.0 - np.clip((gex - lo) / (hi - lo), 0, 1); a = a * a * (3 - 2 * a)
    m = a > 0.5; lab, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab, range(1, n + 1)); keep = np.zeros(n + 1, bool)
        for i, s in enumerate(sizes):
            if s >= 0.02 * sizes.max(): keep[i + 1] = True
        a = a * ndi.binary_dilation(keep[lab], iterations=2)
    G2 = G - np.clip(G - np.maximum(R, B), 0, None) * 0.9
    return np.dstack([B, G2, R, a * 255 + 0.5]).clip(0, 255).astype(np.uint8)
def metrics(k):
    a = k[..., 3] > 128; yy, xx = np.where(a); b = yy.max(); top = yy.min(); h = b - top
    foot = yy > b - 0.10 * h; q = a[int(top + .25 * h):int(top + .55 * h)]
    return dict(b=float(b), top=float(top), fx=float(xx[foot].mean()), tx=float(np.where(q)[1].mean()))
def render(k, xref, gy):
    W = int(round(CW / S)); H = int(round(CH / S))
    M = np.float32([[1, 0, CW / 2 / S - xref], [0, 1, GY / S - gy]])
    f = k.astype(np.float32); a = f[..., 3:4] / 255.0
    pm = np.dstack([f[..., :3] * a, f[..., 3:4]])
    w = cv2.warpAffine(pm, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    r = cv2.resize(w, (CW, CH), interpolation=cv2.INTER_AREA)
    al = np.clip(r[..., 3:4], 0, 255); un = np.where(al > 0.5, r[..., :3] / (al / 255.0), 0)
    return np.dstack([un.clip(0, 255), al]).astype(np.uint8), (w[..., 3] > 128)
IDLE_TX, IDLE_FX = 391.3, 365.7      # reposo del clip 222 (referencia de la hoja RC18)
old = cv2.imread(SHEET18, cv2.IMREAD_UNCHANGED); assert old.shape[1] == COLS * CW
ROWS_OLD = old.shape[0] // CH                      # 10: idle 0, walk 1-3, talk 4-9
frames = {}
# ---- marcha de perfil (36 fot. del clip, espejada)
w = rd('jugador_marcha_perfil_1000700208.mp4'); seqw = list(range(52, 88))
kw = [key2(w[i][:, ::-1]) for i in seqw]; txw = np.median([metrics(k)['tx'] for k in kw])
frames['walk'] = [render(k, txw, metrics(k)['b']) for k in kw]
# ---- dar / tender la mano (sin espejo): sale, mantiene, vuelve (ida y vuelta)
g = rd('jugador_dar_1000700225.mp4'); out = list(range(28, 76, 4)); seqg = out + out[-2::-1]
kg = {i: key2(g[i]) for i in set(seqg)}; m0 = metrics(kg[28]); xg = m0['fx'] + (IDLE_TX - IDLE_FX); gyg = m0['b']
frames['give'] = [render(kg[i], xg, gyg) for i in seqg]
# ---- agacharse a coger (sin espejo): baja, aguanta, sube por el mismo camino
p = rd('jugador_agacharse_coger_1000700215.mp4'); dn = list(range(12, 60, 4)); seqp = dn + [dn[-1]] * 3 + dn[-2::-1]
kp = {i: key2(p[i]) for i in set(seqp)}; mp = metrics(kp[12]); xp = mp['fx'] + (IDLE_TX - IDLE_FX); gyp = mp['b']
frames['pick'] = [render(kp[i], xp, gyp) for i in seqp]
# ---- mirar alrededor (espejado): 2 fot. de cada 3, de la postura tranquila al final de la mirada
l = rd('jugador_mirar_alrededor_1000704365.mp4'); seql = list(range(10, 186, 7))
kl = {i: key2(l[i][:, ::-1]) for i in seql}; xl = np.median([metrics(kl[i])['tx'] for i in seql]); gyl = np.median([metrics(kl[i])['b'] for i in seql])
frames['look'] = [render(kl[i], xl, gyl) for i in seql]
# ---- hoja: se conservan idle y talk de la RC18; la marcha sustituye a la antigua (filas 1-3); lo demás, al final
order = ['give', 'pick', 'look']; rows = {'idle': 0, 'walk': 1, 'talk': 4}; r = ROWS_OLD
for n in order: rows[n] = r; r += int(np.ceil(len(frames[n]) / COLS))
sheet = np.zeros((r * CH, COLS * CW, 4), np.uint8); sheet[:ROWS_OLD * CH] = old; sheet[1 * CH:4 * CH] = 0
for n in ['walk'] + order:
    for j, (f, _) in enumerate(frames[n]):
        rr, cc = rows[n] + j // COLS, j % COLS; sheet[rr * CH:(rr + 1) * CH, cc * CW:(cc + 1) * CW] = f
ext = {n: (min(np.where(m.any(0))[0].min() * S for _, m in frames[n]), max(np.where(m.any(0))[0].max() * S for _, m in frames[n])) for n in frames}
print('extensión horizontal (centro 120):', {n: (round(a), round(b)) for n, (a, b) in ext.items()})
tp = min(np.where(m.any(1))[0].min() * S for n in frames for _, m in frames[n]); print('techo más alto en celda: %.1f px' % tp)
cv2.imwrite(OUT + 'sheet.png', sheet); cv2.imwrite(OUT + 'sheet.webp', sheet, [cv2.IMWRITE_WEBP_QUALITY, 85])
# paso de la marcha: velocidad media del pie apoyado ≈ 19 px/fot. de origen → ciclo de 36 fot. ≈ 684 px de origen
meta = dict(rows=rows, counts={n: len(v) for n, v in frames.items()}, cw=CW, ch=CH, cols=COLS, gy=GY, stride_src_px=684.0, stride=round(684 * S * 321 / CH))
json.dump(meta, open(OUT + 'meta.json', 'w')); print(meta, 'hoja', sheet.shape, os.path.getsize(OUT + 'sheet.webp'))
