"""RC20 · hojas de sprites de personajes desde clips mp4 / GIF sobre fondo verde (o papel beige).
Cada personaje: fotogramas → croma → celda común (pies en la base, misma escala) → hoja webp + meta.json (frameW/H, ancla, filas, altura visible).
Uso: python3 build_npc_rc20.py <dir fuentes (adjuntos y source_clips)> <salida> [id ...]"""
import cv2, numpy as np, os, sys, json, glob
from PIL import Image, ImageSequence
from scipy import ndimage as ndi
SRC, OUT = sys.argv[1].rstrip('/') + '/', sys.argv[2].rstrip('/') + '/'
ONLY = set(sys.argv[3:])
def key_green(bgr, lo=22.0, hi=48.0):
    f = bgr.astype(np.float32); B, G, R = f[..., 0], f[..., 1], f[..., 2]
    gex = G - np.maximum(R, B); a = 1.0 - np.clip((gex - lo) / (hi - lo), 0, 1); a = a * a * (3 - 2 * a)
    m = a > 0.5; lab, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab, range(1, n + 1)); keep = np.zeros(n + 1, bool)
        for i, s in enumerate(sizes):
            if s >= 0.015 * sizes.max(): keep[i + 1] = True
        a = a * ndi.binary_dilation(keep[lab], iterations=2)
    G2 = G - np.clip(G - np.maximum(R, B), 0, None) * 0.9
    return np.dstack([B, G2, R, a * 255 + 0.5]).clip(0, 255).astype(np.uint8)
def key_paper(bgr):
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32); h, w = lab.shape[:2]; k = 12
    c = np.concatenate([lab[:k, :k].reshape(-1, 3), lab[:k, -k:].reshape(-1, 3), lab[-k:, :k].reshape(-1, 3), lab[-k:, -k:].reshape(-1, 3)]); b0 = np.median(c, 0)
    d = np.sqrt((lab[..., 1] - b0[1]) ** 2 + (lab[..., 2] - b0[2]) ** 2 + (0.5 * (lab[..., 0] - b0[0])) ** 2)
    a = np.clip((d - 9) / 14, 0, 1); a = a * a * (3 - 2 * a); m = a > 0.5; lab_, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab_, range(1, n + 1)); keep = np.zeros(n + 1, bool); keep[1:] = sizes >= 0.02 * sizes.max(); a = a * ndi.binary_dilation(keep[lab_], iterations=2)
    a = ndi.binary_fill_holes(a > 0.5).astype(np.float32) * a + (ndi.binary_fill_holes(a > 0.5) & (a <= 0.5)) * 1.0
    return np.dstack([bgr, np.clip(a, 0, 1) * 255]).astype(np.uint8)
def read_mp4(path, step=1, a=0, b=None):
    cap = cv2.VideoCapture(path); fr = []
    while True:
        ok, im = cap.read()
        if not ok: break
        fr.append(im)
    return fr[a:b:step]
def read_gif(path):
    im = Image.open(path); return [cv2.cvtColor(np.array(f.convert('RGB')), cv2.COLOR_RGB2BGR) for f in ImageSequence.Iterator(im)]
def bbox(k, thr=128):
    a = k[..., 3] > thr; ys = np.where(a.any(1))[0]; xs = np.where(a.any(0))[0]; return ys.min(), ys.max(), xs.min(), xs.max()
def feet_x(k):
    t, b, x0, x1 = bbox(k); a = k[..., 3] > 128; band = a[max(t, b - max(4, int(0.04 * (b - t)))):b + 1]; xs = np.where(band.any(0))[0]; return (xs.min() + xs.max()) / 2
def split_pair(k, cut):
    L = k.copy(); R = k.copy(); L[:, cut:, 3] = 0; R[:, :cut, 3] = 0; return L, R
def pack(frames_by_anim, fig_px=330, margin_top=0.06, pad_x=14, flip=False, scale_ref=None):
    """frames_by_anim: {anim: [rgba,...]}. Cada animación se escala para que la altura MEDIANA de su figura sea fig_px
    (los clips vienen con escalas distintas y así nunca «cambia de tamaño» al pasar de reposo a hablar o andar)."""
    fl = lambda k: k[:, ::-1] if flip else k
    SA = {an: fig_px / float(scale_ref or np.median([bbox(fl(k))[1] - bbox(fl(k))[0] for k in v])) for an, v in frames_by_anim.items()}
    ext_l = max(max(feet_x(fl(k)) - bbox(fl(k))[2] for k in v) * SA[an] for an, v in frames_by_anim.items())
    ext_r = max(max(bbox(fl(k))[3] - feet_x(fl(k)) for k in v) * SA[an] for an, v in frames_by_anim.items())
    half = int(np.ceil(max(ext_l, ext_r))) + pad_x; CW = 2 * half; CH = int(round(fig_px * (1 + margin_top))) + 6; GY = CH - 4
    cells = {}
    for an, v in frames_by_anim.items():
        S = SA[an]; cells[an] = []
        for k in v:
            k = fl(k)
            t, b, x0, x1 = bbox(k); fx = feet_x(k)
            M = np.float32([[S, 0, half - fx * S], [0, S, GY - b * S]])
            f = k.astype(np.float32); a = f[..., 3:4] / 255.0; pm = np.dstack([f[..., :3] * a, f[..., 3:4]])
            w = cv2.warpAffine(pm, M, (CW, CH), flags=cv2.INTER_AREA if S < 1 else cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
            al = np.clip(w[..., 3:4], 0, 255); un = np.where(al > 0.5, w[..., :3] / np.maximum(al / 255.0, 1e-3), 0)
            cells[an].append(np.dstack([un.clip(0, 255), al]).astype(np.uint8))
    cols = 8 if CW < 260 else 6 if CW < 400 else 4; rows = {}; r = 0
    for an, v in cells.items(): rows[an] = r; r += int(np.ceil(len(v) / cols))
    sheet = np.zeros((r * CH, cols * CW, 4), np.uint8)
    for an, v in cells.items():
        for j, c in enumerate(v): rr, cc = rows[an] + j // cols, j % cols; sheet[rr * CH:(rr + 1) * CH, cc * CW:(cc + 1) * CW] = c
    return sheet, dict(frameW=CW, frameH=CH, cols=cols, anchor=[half, GY], rows=rows, counts={a: len(v) for a, v in cells.items()}, figPx=float(fig_px), figW=float(max(ext_l, ext_r) * 2))
def save(cid, sheet, meta, extra=None):
    os.makedirs(OUT + cid, exist_ok=True); cv2.imwrite(OUT + cid + '/sheet.webp', sheet, [cv2.IMWRITE_WEBP_QUALITY, 82])
    meta.update(extra or {}); json.dump(meta, open(OUT + cid + '/meta.json', 'w'))
    print(cid, sheet.shape, os.path.getsize(OUT + cid + '/sheet.webp') // 1024, 'KB', meta['counts'], 'celda', meta['frameW'], 'x', meta['frameH'])
def pingpong(seq): return seq + seq[-2:0:-1]
JOBS = {}
def job(f): JOBS[f.__name__] = f; return f

@job
def soldado():
    walk = read_mp4(SRC + 'soldado_marcha_1000703362.mp4'); rep = read_mp4(SRC + 'soldado_reposo_1000703352.mp4'); hab = read_mp4(SRC + 'soldado_habla_1000703353.mp4')
    K = lambda fr, idx: [key_green(fr[i]) for i in idx]
    fr = {'walk': K(walk, range(17, 42)), 'idle': K(rep, range(0, 96, 4)), 'talk': K(hab, range(0, 192, 4))}
    sheet, meta = pack(fr, fig_px=300)
    save('soldado', sheet, meta, dict(visible=292, flip=False, base='right'))

@job
def yucaf():
    g = read_gif(SRC + '9c4ae236-image.gif'); g2 = read_gif(SRC + 'e0536998-image.gif')
    fr = {'idle': [key_green(x) for x in g2], 'talk': [key_green(x) for x in g]}
    sheet, meta = pack(fr, fig_px=330); save('yucaf', sheet, meta, dict(visible=266, base='left'))

@job
def lope():
    a = [read_gif(SRC + n + '-image.gif') for n in ('5b95f9cc', '42c00232', '9565e835')]
    fr = {'idle': [key_green(x) for x in a[1]], 'talk': [key_green(x) for x in a[2]], 'talk2': [key_green(x) for x in a[0]]}
    sheet, meta = pack(fr, fig_px=330); save('lope', sheet, meta, dict(visible=278, base='left'))

@job
def giles():
    g = read_gif(SRC + 'a73ff8ff-image.gif'); ks = [key_green(x) for x in g]
    # corte entre los dos cuerpos: columna con menos alfa en el tramo central
    prof = np.mean([(k[..., 3] > 128).sum(0) for k in ks], 0); w = len(prof); lo, hi = int(w * 0.3), int(w * 0.6); cut = lo + int(np.argmin(prof[lo:hi]))
    print('giles corte x', cut, 'de', w)
    def biggest(k):
        m = k[..., 3] > 128; lab, n = ndi.label(m)
        if n > 1:
            sz = ndi.sum(m, lab, range(1, n + 1)); keepm = np.isin(lab, [i + 1 for i, v in enumerate(sz) if v > 0.05 * sz.max()]); k = k.copy(); k[..., 3] = np.where(ndi.binary_dilation(keepm, iterations=3), k[..., 3], 0)
        return k
    A, B = zip(*[tuple(biggest(x) for x in split_pair(k, cut)) for k in ks])
    # escala común: la altura del alto fija la escala de ambos (relación real entre ellos), cada uno con su celda
    ha = np.median([bbox(k)[1] - bbox(k)[0] for k in A]); hb = np.median([bbox(k)[1] - bbox(k)[0] for k in B])
    print('altura relativa (bajo/alto)', hb / ha)
    sa, ma = pack({'idle': [A[0]], 'talk': list(A)}, fig_px=330); save('gil_a', sa, ma, dict(visible=268, base='left'))
    sb, mb = pack({'idle': [B[0]], 'talk': list(B)}, fig_px=330 * hb / ha, scale_ref=None); save('gil_b', sb, mb, dict(visible=268 * hb / ha, base='left'))

@job
def oropesa():
    ns = ['5895c678', '6acfd62b', '04df9d50', '12e59799']; gs = [read_gif(SRC + n + '-image.gif') for n in ns]
    fr = {'idle': [key_green(gs[0][0])]}
    for i, g in enumerate(gs): fr['talk' + ('' if i == 0 else str(i + 1))] = [key_green(x) for x in g]
    sheet, meta = pack(fr, fig_px=330); save('oropesa', sheet, meta, dict(visible=268, base='left'))

@job
def pregonero():
    g = read_gif(SRC + '9afeeb32-image.gif'); ks = [key_paper(x) for x in g]
    fr = {'idle': [ks[0]], 'talk': ks}
    sheet, meta = pack(fr, fig_px=330); save('pregonero', sheet, meta, dict(visible=270, base='right'))

@job
def requetes():
    out = {}
    for tag, n in (('fila', '72b729af'), ('fila2', 'de1ca094'), ('corro', 'ed72704b')):
        out[tag] = [key_green(x) for x in read_gif(SRC + n + '-image.gif')]
    for tag, v in out.items():
        sheet, meta = pack({'idle': [v[0]], 'talk': v}, fig_px=330); save('req_' + tag, sheet, meta, dict(visible=268, base='left'))

if __name__ == '__main__':
    for n, f in JOBS.items():
        if not ONLY or n in ONLY: f()
