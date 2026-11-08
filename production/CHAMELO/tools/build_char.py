"""Personaje NUEVO a partir de clips de Flow con fondo verde → hoja de sprites completa.
Todas las animaciones comparten escala (misma altura cabeza-pies) y apoyo (mismos pies), aunque cada clip esté encuadrado distinto.
Uso: python build_char.py  → genera la hoja del viejo soldado en art/personajes/viejo_soldado/ y escribe el JSON de la hoja."""
import glob, os, json, subprocess, tempfile
import numpy as np, cv2
from build_talk import key, bg_color

def body_stats(alpha, thr=128, head_frac=0.72):
    ys = np.where(alpha.max(1) > thr)[0]; xs = np.where(alpha.max(0) > thr)[0]
    x0, x1, bot = xs.min(), xs.max(), ys[-1]
    cols = alpha[:, x0:x0 + int((x1 - x0) * head_frac)] > thr       # sin la lanza (a la derecha)
    head = np.where(cols.any(1))[0][0]
    band = alpha[bot - max(3, int(0.04 * (bot - head))):bot + 1] > thr
    fx = np.where(band.any(0))[0]
    return head, bot, (fx.min() + fx.max()) / 2

def pick_loop(files, n, step, skip=4):
    small = [cv2.resize(cv2.imread(p), (90, 160), interpolation=cv2.INTER_AREA).astype(np.float32) for p in files]
    L = n * step; best = None
    for s in range(skip, len(files) - L):
        e = np.abs(small[s] - small[s + L]).mean()
        if best is None or e < best[0]: best = (e, s)
    return [best[1] + i * step for i in range(n)], best[0]

def build(clips, fw=192, fh=288, cols=8, body_px=250, foot_y=280, foot_x=None):
    """clips: [(nombre_anim, carpeta_de_png, n_fotogramas, paso, fps)] → (hoja RGBA, anims, info)"""
    foot_x = fw / 2 if foot_x is None else foot_x
    frames, anims, info, row = [], {}, {}, 0
    for name, d, n, step, fps in clips:
        files = sorted(glob.glob(os.path.join(d, '*.png')))
        bg = bg_color(cv2.cvtColor(cv2.imread(files[len(files) // 2]), cv2.COLOR_BGR2LAB).astype(np.float32))
        idx, seam = pick_loop(files, n, step)
        keyed = [key(cv2.imread(files[i]), bg) for i in idx]
        st = np.array([body_stats(k[..., 3]) for k in keyed])
        head, bot, fx = np.median(st[:, 0]), np.median(st[:, 1]), np.median(st[:, 2])
        sc = body_px / (bot - head)
        start = len(frames)
        while start % cols: frames.append(None); start += 1      # cada animación empieza en fila nueva
        for k in keyed:
            pm = k.astype(np.float32); pm[..., :3] *= pm[..., 3:] / 255
            M = np.float32([[sc, 0, foot_x - fx * sc], [0, sc, foot_y - bot * sc]])
            w = cv2.warpAffine(pm, M, (fw, fh), flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0))
            al = w[..., 3:]; rgb = np.where(al > 0, w[..., :3] * 255 / np.maximum(al, 1e-3), 0)
            frames.append(np.dstack([rgb, al]).clip(0, 255).astype(np.uint8))
        anims[name] = {'row': start // cols, 'frames': n, 'fps': fps}
        info[name] = dict(start=idx[0], seam=round(float(seam), 2), scale=round(float(sc), 4))
    rows = (len(frames) + cols - 1) // cols
    sheet = np.zeros((rows * fh, cols * fw, 4), np.uint8)
    for i, f in enumerate(frames):
        if f is None: continue
        r, c = i // cols, i % cols; sheet[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw] = f
    return sheet, anims, info

if __name__ == '__main__':
    import sys
    from PIL import Image
    ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
    OUT = os.path.join(ROOT, 'art', 'personajes', 'viejo_soldado'); os.makedirs(OUT, exist_ok=True)
    CL = os.path.join(ROOT, 'assets', 'source_clips')
    with tempfile.TemporaryDirectory() as td:
        dirs = {}
        for n in ('soldado_reposo_1000703352', 'soldado_habla_1000703353'):
            dirs[n] = os.path.join(td, n); os.makedirs(dirs[n])
            subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(CL, n + '.mp4'), dirs[n] + '/%04d.png'], check=True)
        sheet, anims, info = build([('idle_right', dirs['soldado_reposo_1000703352'], 16, 4, 6),
                                    ('talk_right', dirs['soldado_habla_1000703353'], 24, 3, 8)])
    Image.fromarray(sheet).save(os.path.join(OUT, 'hoja.webp'), quality=88, method=5)
    meta = {'frameW': 192, 'frameH': 288, 'cols': 8, 'anchor': [96, 280], 'baseFacing': 'right', 'anims': anims}
    json.dump(meta, open(os.path.join(OUT, 'hoja.json'), 'w'), indent=1)
    print(sheet.shape, anims, info, os.path.getsize(os.path.join(OUT, 'hoja.webp')) // 1024, 'KB')
