"""Clips SIN fondo verde (fondo pintado fijo: papel, mar, arena) → recorte con «placa limpia» del fondo.
1) Modelo de fondo por fila: mediana de los bordes izquierdo y derecho del clip (el personaje nunca los pisa).
2) Placa limpia: para cada píxel, mediana de los fotogramas en que ese píxel se parece al modelo de su fila (fondo real con su textura);
   donde nunca se ve el fondo, el modelo de la fila.
3) Alfa = distancia en Lab entre el fotograma y la placa, con rampa suave (el humo claro queda semitransparente).
4) Se quitan islas pequeñas y la mancha de arena bajo los pies (sombras pintadas del fondo).
Uso como módulo: frames_rgba(clip_dir, idxs) → lista de fotogramas RGBA a tamaño del clip."""
import glob, os
import numpy as np, cv2
from scipy import ndimage as ndi

def lab_of(bgr): return cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)

def plate(files, every=4, edge=60, tau=30.0, band=128):
    ims = np.stack([cv2.imread(f) for f in files[::every]])        # N,H,W,3 uint8
    N, H, W = ims.shape[:3]
    pl = np.zeros((H, W, 3), np.uint8); hole = np.zeros((H, W), bool)
    for y0 in range(0, H, band):
        y1 = min(H, y0 + band)
        blk = ims[:, y0:y1]
        labs = np.stack([lab_of(b) for b in blk])                   # N,h,W,3
        border = np.concatenate([labs[:, :, :edge], labs[:, :, -edge:]], 2)
        row = np.median(border.transpose(1, 0, 2, 3).reshape(y1 - y0, -1, 3), 1)   # h,3
        d = np.sqrt(((labs - row[None, :, None, :]) ** 2).sum(-1))
        bgm = d < tau; del labs
        cnt = bgm.sum(0)
        st = np.where(bgm[..., None], blk.astype(np.float32), np.nan)
        with np.errstate(all='ignore'):
            med = np.nanmedian(st, 0)
        rowbgr = cv2.cvtColor(np.clip(row[:, None, :], 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)[:, 0, :].astype(np.float32)
        fb = np.repeat(rowbgr[:, None, :], W, 1)
        ok = (cnt >= 3) & ~np.isnan(med[..., 0])
        pl[y0:y1] = np.clip(np.where(ok[..., None], med, fb), 0, 255).astype(np.uint8)
        hole[y0:y1] = ~ok
    # donde el fondo no se ve nunca: relleno a partir de lo que lo rodea
    pl = cv2.inpaint(pl, (hole * 255).astype(np.uint8), 7, cv2.INPAINT_TELEA)
    return pl

def cut(bgr, pl, t0=7.0, t1=22.0, feet_band=None):
    d = np.sqrt(((lab_of(bgr) - lab_of(pl)) ** 2).sum(-1))
    a = np.clip((d - t0) / (t1 - t0), 0, 1); a = a * a * (3 - 2 * a)
    m = a > 0.5
    lab_, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab_, range(1, n + 1))
        keep = np.zeros(n + 1, bool); keep[1:] = sizes >= max(600, 0.004 * sizes.max())
        a = a * ndi.binary_dilation(keep[lab_], iterations=3)
    if feet_band is not None:            # arena/sombra pintada: poco saturada y clara, solo en la franja de los pies
        y0, y1 = feet_band
        L = lab_of(bgr)
        sat = np.sqrt((L[..., 1] - 128) ** 2 + (L[..., 2] - 128) ** 2)
        sand = np.zeros_like(m); sand[y0:y1] = (L[y0:y1, :, 0] > 150) & (sat[y0:y1] < 40)
        a = np.where(sand, a * 0.0, a)
    rgb = bgr[..., ::-1]
    return np.dstack([rgb, (a * 255 + 0.5).astype(np.uint8)])

def frames_rgba(clip_dir, idxs, feet_band=None):
    files = sorted(glob.glob(os.path.join(clip_dir, '*.png')))
    pl = plate(files)
    return [cut(cv2.imread(files[i]), pl, feet_band=feet_band) for i in idxs], pl

# ---------------- Alternativa (fondo con agua animada): modelo de color del fondo por franjas de filas ----------------
# El mar del clip está animado (olas), así que una placa fija no sirve. En su lugar: para cada franja de 32 filas, los colores
# que aparecen en los bordes izquierdo y derecho a lo largo de todo el clip (k-medias), y alfa = distancia al color de fondo más cercano.
def bg_model(files, every=6, edge=70, band=32, k=6):
    ims = [cv2.imread(f) for f in files[::every]]
    H = ims[0].shape[0]; model = []
    for y0 in range(0, H, band):
        y1 = min(H, y0 + band)
        px = np.concatenate([np.concatenate([lab_of(im[y0:y1, :edge]), lab_of(im[y0:y1, -edge:])], 1).reshape(-1, 3) for im in ims])
        sel = px[np.random.default_rng(1).choice(len(px), min(len(px), 6000), replace=False)]
        _, _, cen = cv2.kmeans(sel.astype(np.float32), k, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5), 2, cv2.KMEANS_PP_CENTERS)
        model.append((y0, y1, cen))
    return model

def cut_model(bgr, model, t0=12.0, t1=26.0, hole_max=2500):
    lab = lab_of(bgr); H, W = lab.shape[:2]; d = np.zeros((H, W), np.float32)
    for y0, y1, cen in model:
        blk = lab[y0:y1]
        dd = np.min(np.sqrt(((blk[:, :, None, :] - cen[None, None, :, :]) ** 2).sum(-1)), 2)
        d[y0:y1] = dd
    # la vecindad cuenta: el contorno de tinta y los trazos finos no deben agujerearse
    d = cv2.GaussianBlur(d, (0, 0), 1.0)
    a = np.clip((d - t0) / (t1 - t0), 0, 1); a = a * a * (3 - 2 * a)
    m = a > 0.5
    lab_, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab_, range(1, n + 1))
        keep = np.zeros(n + 1, bool); keep[1:] = sizes >= max(1500, 0.02 * sizes.max())
        m = keep[lab_]; a = a * ndi.binary_dilation(m, iterations=2)
    holes = ndi.binary_fill_holes(m) & ~m
    hl, hn = ndi.label(holes)
    if hn:
        hs = ndi.sum(holes, hl, range(1, hn + 1)); small = np.zeros(hn + 1, bool); small[1:] = hs < hole_max
        a = np.where(small[hl], 1.0, a)
    return np.dstack([bgr[..., ::-1], (a * 255 + 0.5).astype(np.uint8)])

def frames_model(clip_dir, idxs):
    files = sorted(glob.glob(os.path.join(clip_dir, '*.png')))
    model = bg_model(files)
    return [cut_model(cv2.imread(files[i]), model) for i in idxs]
