"""Rai-gato (gato gris con bufanda roja y estrella) desde los clips de César sobre verde → hoja de sprites.
Clips (assets/source_clips/):
  rai_gato_sentarse_guino_1000703441.mp4  anda, se sienta, guiña, mira arriba y cierra los ojos (8,5 s)
  rai_gato_andar_8s_1000703424.mp4        ciclo de marcha en el sitio (8 s; el de 16 s es el mismo, más largo)
Cada clip se transforma con UNA escala y UN desplazamiento fijos (como una cámara), calibrados con la marcha:
la altura orejas-patas de la marcha mide lo mismo en todos y las patas caen en la misma línea.
Animaciones:
  walk_right  ciclo completo (28 fotogramas de vídeo → 14), por distancia (stride)
  idle_right  se sienta, se queda sentado (con un vistazo arriba y ojos cerrados de vez en cuando), se levanta y vuelve a sentarse
  sit_right   sentado, sin la entrada (tras un guiño o un bostezo)
  wink_right  guiño (Requeteconquista)
  yawn_right  mira arriba y cierra los ojos, satisfecho (el «bostezo» del regreso; no hay clip de bostezo con la boca abierta)
Uso: python build_gato.py → art/personajes/rai_gato/hoja.webp + hoja.json"""
import glob, os, json, subprocess, tempfile
import numpy as np, cv2
from PIL import Image
from build_talk import key, bg_color

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
CL = os.path.join(ROOT, 'assets', 'source_clips')
OUT = os.path.join(ROOT, 'art', 'personajes', 'rai_gato')
FW, FH, COLS = 200, 220, 8
FOOT_Y, FOOT_X, WALK_H = 192, 100, 170       # patas en y=192; la marcha mide 170 px de orejas a patas

def frames_of(mp4, td, scale=None):
    d = os.path.join(td, os.path.basename(mp4)); os.makedirs(d)
    vf = ['-vf', f'scale={scale}'] if scale else []
    subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, *vf, d + '/%04d.png'], check=True)
    files = sorted(glob.glob(d + '/*.png'))
    bg = bg_color(cv2.cvtColor(cv2.imread(files[len(files) // 2]), cv2.COLOR_BGR2LAB).astype(np.float32))
    out = []
    for f in files:
        k = key(cv2.imread(f), bg).astype(np.float32)
        r, g, b = k[..., 0], k[..., 1], k[..., 2]
        k[..., 1] = np.minimum(g, np.maximum(r, b))           # sin verde en los bordes (el gato no tiene verde)
        out.append(k)
    return out

def feet_y(a):
    ys, xs = np.where(a > 128); x0, x1 = xs.min(), xs.max()
    return ys[xs > x0 + 0.55 * (x1 - x0)].max()               # patas delanteras (la cola cae a la izquierda)

def calib(keyed, walk_idx):
    tops, feet, cx = [], [], []
    for i in walk_idx:
        a = keyed[i][..., 3]; ys, xs = np.where(a > 128)
        tops.append(ys.min()); feet.append(feet_y(a)); cx.append((xs.min() + xs.max()) / 2)
    t, f, x = np.median(tops), np.median(feet), np.median(cx)
    s = WALK_H / (f - t)
    return np.float32([[s, 0, FOOT_X - x * s], [0, s, FOOT_Y - f * s]])

def place(k, M):
    pm = k.copy(); pm[..., :3] *= pm[..., 3:] / 255
    w = cv2.warpAffine(pm, M, (FW, FH), flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0))
    al = w[..., 3:]; rgb = np.where(al > 0, w[..., :3] * 255 / np.maximum(al, 1e-3), 0)
    return np.dstack([rgb, al]).clip(0, 255).astype(np.uint8)

def loop_start(keyed, L, skip=10):
    sm = [cv2.resize(k, (60, 106), interpolation=cv2.INTER_AREA) for k in keyed]
    best = min(range(skip, len(sm) - L), key=lambda s: np.abs(sm[s] - sm[s + L]).mean())
    return best

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        A = frames_of(os.path.join(CL, 'rai_gato_sentarse_guino_1000703441.mp4'), td)
        W = frames_of(os.path.join(CL, 'rai_gato_andar_8s_1000703424.mp4'), td, '360:640')
    MA, MW = calib(A, range(0, 18)), calib(W, range(0, len(W), 4))
    # --- marcha: un ciclo completo (28 fotogramas a 24 fps), uno de cada dos
    P = 28; s0 = loop_start(W, P)
    walk = [place(W[i], MW) for i in range(s0, s0 + P, 2)]
    # --- clip A por tramos (índices del vídeo a 24 fps)
    seg = {'sentarse': range(18, 43, 3), 'calmaA': range(45, 73, 3), 'guino': range(74, 93, 2),
           'calmaB': range(93, 112, 3), 'arriba': range(114, 163, 3), 'calmaC': range(165, 202, 3)}
    afr, at = [], {}
    for n, r in seg.items():
        at[n] = list(range(len(afr), len(afr) + len(r))); afr += [place(A[i], MA) for i in r]
    frames = walk + [None] * ((-len(walk)) % COLS)
    rowA = len(frames) // COLS
    frames += afr
    rows = (len(frames) + COLS - 1) // COLS
    sheet = np.zeros((rows * FH, COLS * FW, 4), np.uint8)
    for i, f in enumerate(frames):
        if f is not None: sheet[(i // COLS) * FH:(i // COLS + 1) * FH, (i % COLS) * FW:(i % COLS + 1) * FW] = f
    rev = lambda l: l[::-1]
    pp = lambda l: l + rev(l)[1:-1]
    calma = pp(at['calmaA']) * 3 + at['calmaA'] + at['calmaB'] + pp(at['calmaC']) * 2 + at['calmaC'] + rev(at['calmaB'])[:1]
    sentado = calma + rev(at['calmaB']) + rev(at['calmaA']) + pp(at['calmaA']) * 2 + at['calmaA'] + at['calmaB'] + at['arriba'] + at['calmaC'] + \
        pp(at['calmaC']) * 2 + rev(at['calmaC']) + rev(at['calmaB']) + rev(at['calmaA'])
    idle = at['sentarse'] + sentado + rev(at['sentarse'])          # se sienta… y al final se levanta (vuelve a empezar de pie)
    sit = sentado + at['calmaA'][1:] + rev(at['calmaA'])[1:]
    wink = at['guino'] + [at['calmaB'][0]] * 8
    yawn = at['arriba'] + [at['calmaC'][0]] * 4
    anims = {'walk_right': {'row': 0, 'frames': len(walk), 'fps': 12, 'stride': 66},
             'idle_right': {'row': rowA, 'frames': len(idle), 'fps': 8, 'seq': idle},
             'sit_right': {'row': rowA, 'frames': len(sit), 'fps': 8, 'seq': sit},
             'wink_right': {'row': rowA, 'frames': len(wink), 'fps': 12, 'seq': wink},
             'yawn_right': {'row': rowA, 'frames': len(yawn), 'fps': 8, 'seq': yawn}}
    Image.fromarray(sheet).save(os.path.join(OUT, 'hoja.webp'), quality=86, method=5)
    meta = {'frameW': FW, 'frameH': FH, 'cols': COLS, 'anchor': [FOOT_X, FOOT_Y], 'baseFacing': 'right', 'anims': anims}
    json.dump(meta, open(os.path.join(OUT, 'hoja.json'), 'w'))
    print(sheet.shape, {k: (v['frames'], round(v['frames'] / v['fps'], 1)) for k, v in anims.items()}, 'loop', s0,
          os.path.getsize(os.path.join(OUT, 'hoja.webp')) // 1024, 'KB')
