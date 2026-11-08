"""Clips de Flow (fondo verde) → filas nuevas en la hoja de sprites de un personaje.
- Recorte por distancia de color al verde del fondo (en Lab), con el umbral sacado del ruido del propio fondo:
  sirve igual para verdes saturados (Elvira, Nuño) que para el verde grisáceo del clip de Alfonso.
- Quitar el reflejo verde SOLO en el borde (Elvira lleva vestido verde: un despill global se lo comería).
- Escala y posición iguales a las del reposo que ya está en la hoja (misma altura visible, mismos pies), para que no salte al cambiar.
- Bucle: el tramo del clip cuyo primer y último fotograma más se parecen (cierre sin salto), a 8 fps.
Uso como módulo: build(clip_dir, sheet_rgba, sheet_def, idle_key, n_frames, step) → (sheet_nueva, fila_inicial, info)."""
import glob, os
import numpy as np, cv2
from scipy import ndimage as ndi

def bg_color(lab):
    h, w = lab.shape[:2]; k = 40
    c = np.concatenate([lab[:k, :k].reshape(-1, 3), lab[:k, -k:].reshape(-1, 3), lab[-k:, :k].reshape(-1, 3), lab[-k:, -k:].reshape(-1, 3)])
    return np.median(c, 0), c

def key(bgr, bg=None):
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    b0, corners = bg_color(lab) if bg is None else bg
    d = np.sqrt((lab[..., 1] - b0[1]) ** 2 + (lab[..., 2] - b0[2]) ** 2 + (0.35 * (lab[..., 0] - b0[0])) ** 2)
    dc = np.sqrt((corners[:, 1] - b0[1]) ** 2 + (corners[:, 2] - b0[2]) ** 2 + (0.35 * (corners[:, 0] - b0[0])) ** 2)
    t0 = np.percentile(dc, 99.5) + 3; t1 = t0 + 16
    a = np.clip((d - t0) / (t1 - t0), 0, 1); a = a * a * (3 - 2 * a)
    m = a > 0.5
    lab_, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab_, range(1, n + 1))
        keep = np.zeros(n + 1, bool); keep[1:] = sizes >= max(300, 0.01 * sizes.max())
        a = a * ndi.binary_dilation(keep[lab_], iterations=3)
    # reflejo verde solo en el borde (franja de ~4 px hacia dentro y la zona semitransparente)
    edge = (a < 0.98) | (ndi.distance_transform_edt(a > 0.5) < 4)
    f = bgr.astype(np.float32); B, G, R = f[..., 0], f[..., 1], f[..., 2]
    lim = np.maximum(R, B) + 2
    G2 = np.where(edge & (G > lim), lim, G)
    out = np.dstack([R, G2, B, a * 255]).clip(0, 255).astype(np.uint8)   # RGBA
    return out

def figure_stats(alpha, thr=128):
    ys = np.where(alpha.max(1) > thr)[0]; xs = np.where(alpha.max(0) > thr)[0]
    top, bot = ys[0], ys[-1]
    band = alpha[bot - max(3, int(0.04 * (bot - top))):bot + 1] > thr
    fx = np.where(band.any(0))[0]
    return top, bot, (fx.min() + fx.max()) / 2, xs.min(), xs.max()

def idle_stats(sheet, sd, key_):
    an = sd['anims'][key_]; fw, fh, cols = sd['frameW'], sd['frameH'], sd.get('cols') or 1
    T, Bt, F = [], [], []
    for fi in range(min(an['frames'], 8)):
        r = an['row'] + fi // cols; c = fi % cols
        a = sheet[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw, 3]
        t, b, fx, _, _ = figure_stats(a); T.append(t); Bt.append(b); F.append(fx)
    return float(np.median(T)), float(np.median(Bt)), float(np.median(F))

def build(clip_dir, sheet, sd, idle_key, n_frames=24, step=3, skip=6, preview=None, still=False):
    """still=True: añade al final un fotograma quieto (la cara más «neutra» del bucle) para escuchar/reposo."""
    files = sorted(glob.glob(os.path.join(clip_dir, '*.png')))
    first = cv2.imread(files[len(files) // 2])
    lab = cv2.cvtColor(first, cv2.COLOR_BGR2LAB).astype(np.float32); bg = bg_color(lab)
    small = []
    for p in files:
        im = cv2.imread(p); small.append(cv2.resize(im, (90, 160), interpolation=cv2.INTER_AREA).astype(np.float32))
    L = n_frames * step; best = None
    for s in range(skip, len(files) - L - 1):
        e = np.abs(small[s] - small[s + L]).mean()
        if best is None or e < best[0]: best = (e, s)
    s0 = best[1]; idx = [s0 + i * step for i in range(n_frames)]
    keyed = [key(cv2.imread(files[i]), bg) for i in idx]
    still_i = None
    if still:
        tops = [figure_stats(k[..., 3]) for k in keyed]
        t = int(np.median([x[0] for x in tops])); b = int(np.median([x[1] for x in tops])); hh = int(0.2 * (b - t))
        faces = np.stack([k[t:t + hh].astype(np.float32) for k in keyed]); med = np.median(faces, 0)
        still_i = int(np.argmin([np.abs(f - med).mean() for f in faces]))
        keyed.append(keyed[still_i].copy())
    st = [figure_stats(k[..., 3]) for k in keyed]
    ctop = np.median([x[0] for x in st]); cbot = np.median([x[1] for x in st]); cfx = np.median([x[2] for x in st])
    itop, ibot, ifx = idle_stats(sheet, sd, idle_key)
    sc = (ibot - itop) / (cbot - ctop)
    fw, fh, cols = sd['frameW'], sd['frameH'], sd.get('cols') or 8
    rows = (len(keyed) + cols - 1) // cols
    H0, W0 = sheet.shape[:2]
    out = np.zeros((H0 + rows * fh, max(W0, cols * fw), 4), np.uint8); out[:H0, :W0] = sheet
    widths = []
    for i, k in enumerate(keyed):
        Hc, Wc = k.shape[:2]
        # premultiplicado para escalar sin halo verde/negro
        pm = k.astype(np.float32); pm[..., :3] *= pm[..., 3:] / 255
        M = np.float32([[sc, 0, ifx - cfx * sc], [0, sc, ibot - cbot * sc]])
        w = cv2.warpAffine(pm, M, (fw, fh), flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0))
        al = w[..., 3:]; rgb = np.where(al > 0, w[..., :3] * 255 / np.maximum(al, 1e-3), 0)
        fr = np.dstack([rgb, al]).clip(0, 255).astype(np.uint8)
        r = H0 // fh + i // cols; c = i % cols
        out[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw] = fr
        xs = np.where(fr[..., 3].max(0) > 40)[0]; widths.append((xs.min(), xs.max()) if len(xs) else None)
    info = dict(still=still_i, frames=len(keyed), start=s0, idx=idx, seam=round(float(best[0]), 2), scale=round(float(sc), 4), row=H0 // fh, rows=rows, clip_h=float(cbot - ctop), idle=(itop, ibot, ifx), xrange=(min(w[0] for w in widths if w), max(w[1] for w in widths if w)))
    if preview:
        from PIL import Image
        strip = Image.new('RGBA', (fw * min(n_frames, 12) + fw, fh), (60, 140, 60, 255))
        ar = sd['anims'][idle_key]; r0 = ar['row']
        strip.alpha_composite(Image.fromarray(sheet[r0 * fh:(r0 + 1) * fh, 0:fw]), (0, 0))
        for i in range(min(n_frames, 12)):
            r = H0 // fh + (2 * i) // cols; c = (2 * i) % cols
            strip.alpha_composite(Image.fromarray(out[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw]), (fw * (i + 1), 0))
        strip.convert('RGB').save(preview)
    return out, info
