"""Movimiento de raíz de un ciclo de andar: cuánto retrocede el pie apoyado entre fotogramas (en px de la hoja).
Sirve para (1) saber la zancada real del ciclo y (2) repartir los fotogramas según el avance real (pies sin patinar)."""
import numpy as np
def root_motion(sheet_rgba, fw, fh, cols, row, frames, anchor_y, facing, band=16):
    back = 1 if facing == 'left' else -1          # el pie apoyado se va hacia atrás: +x si mira a la izquierda
    def band_mask(fi):
        r = row + (fi // cols if cols else 0); c = fi % cols if cols else fi
        fr = sheet_rgba[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw, 3]
        y1 = min(fh, anchor_y + 3); y0 = y1 - band
        return (fr[y0:y1] > 80).astype(np.float32)
    masks = [band_mask(i) for i in range(frames)]
    inc = []
    for i in range(frames):
        A, B = masks[i], masks[(i + 1) % frames]
        best, bs = -1, 0
        for s in range(-6, 30):
            sh = back * s
            if sh >= 0: ov = (A[:, :A.shape[1] - sh] * B[:, sh:]).sum() if sh else (A * B).sum()
            else: ov = (A[:, -sh:] * B[:, :B.shape[1] + sh]).sum()
            score = ov - 0.02 * abs(s)
            if score > best: best, bs = score, s
        inc.append(max(0, bs))
    return inc
if __name__ == '__main__':
    import sys, json
    from PIL import Image
    a = np.array(Image.open(sys.argv[1]).convert('RGBA'))
    fw, fh, cols, row, frames, ay = map(int, sys.argv[2:8]); facing = sys.argv[8]; h = float(sys.argv[9]); stride = float(sys.argv[10])
    inc = root_motion(a, fw, fh, cols, row, frames, ay, facing)
    L = sum(inc); world = L * h / fh
    print('incrementos', inc); print('ciclo %d px de hoja -> zancada %.0f (configurada %.0f, ratio %.2f)' % (L, world, stride, world / stride))
