"""Zancada real de cada ciclo de andar: velocidad del pie apoyado (px de hoja por fotograma) × fotogramas × (altura / alto del fotograma).
Si la zancada configurada es menor, los pies patinan hacia atrás («cinta de correr»); si es mayor, patinan hacia delante."""
import numpy as np, sys, json
from PIL import Image
def runs_at(a, y0, y1):
    xs = np.where(a[y0:y1].any(0))[0]; out = []
    if len(xs):
        s = p = xs[0]
        for x in xs[1:]:
            if x > p + 3: out.append((s, p)); s = x
            p = x
        out.append((s, p))
    return out
def planted_speed(im, fw, fh, cols, row, frames, ay, facing, seq=None):
    back = 1 if facing == 'left' else -1
    seq = seq or list(range(frames)); R = []
    for fi in seq:
        r = row + fi // cols; c = fi % cols
        a = im[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw, 3] > 80
        R.append(runs_at(a, ay - 5, ay + 1))
    d = []
    for i in range(len(seq)):
        A, B = R[i], R[(i + 1) % len(seq)]
        for (s0, e0) in A:
            for (s1, e1) in B:
                m = back * ((s1 + e1) / 2 - (s0 + e0) / 2)
                if 2 <= m <= 22 and min(e0, e1) - max(s0, s1) > -4: d.append(m)
    return float(np.median(d)) if d else None, len(d)
if __name__ == '__main__':
    sheets = json.load(open(sys.argv[1])); bg = sys.argv[2]
    FILES = {'player': 'characters_player_sheet_g11.webp.png', 'duran': 'characters_duran_sheet_g10.webp.png', 'alfonso': 'characters_alfonso_sheet_g10.webp.png', 'elvira': 'characters_elvira_flow_rc01.webp.png', 'mingo': 'characters_mingo_flow_rc01.webp.png', 'leonor': 'characters_raimundo_flow.webp.png', 'nuno': 'characters_nuno_flow.webp.png'}
    for k, f in FILES.items():
        c = sheets[k]; s = c['sheet']; im = np.array(Image.open(bg + '/' + f).convert('RGBA'))
        for n, an in s['anims'].items():
            if not n.startswith('walk'): continue
            facing = n.split('_')[1]; ay = (an.get('anchor') or s['anchor'])[1]
            v, nd = planted_speed(im, s['fw'], s['fh'], s['cols'], an['row'], an['frames'], ay, facing)
            real = v * an['frames'] * c['h'] / s['fh'] if v else None
            print('%-8s %-10s %2d fot. pie apoyado %.1f px/fot (n=%d) -> zancada real %.0f · configurada %d · ratio %.2f' % (k, n, an['frames'], v or 0, nd, real or 0, an['stride'], (real or 0) / an['stride']))
    im = np.array(Image.open(bg + '/' + FILES['duran']).convert('RGBA'))
    seq = list(range(0, 7)) + list(range(14, 26))
    v, nd = planted_speed(im, 176, 348, 16, 1, 26, 340, 'left', seq)
    print('duran (19 fot. sin el tramo arrastrado) pie %.1f -> zancada %.0f (h 327)' % (v, v * 19 * 327 / 348))
