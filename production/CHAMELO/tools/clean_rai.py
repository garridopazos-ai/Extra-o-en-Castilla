"""Raimundo (hoja Flow de RC06): fuera la mancha de suelo pintado bajo los pies en reposo y habla, sin comerse piernas ni zapatos."""
import numpy as np, cv2
def clean_rai(rgba, fw=320, fh=288, rows=(0, 1, 2, 3), y0=252):
    a = rgba.copy()
    for r in rows:
        for c in range(a.shape[1] // fw):
            fr = a[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw]
            al = fr[:, :, 3] > 30
            if not al.any(): continue
            hsv = cv2.cvtColor(np.ascontiguousarray(fr[:, :, :3]), cv2.COLOR_RGB2HSV)
            sand = np.zeros(al.shape, bool)
            sand[y0:] = (hsv[y0:, :, 2] > 192) & (hsv[y0:, :, 1] < 128) & al[y0:]
            keep = al & ~sand
            # huecos pequeños dentro de zapatos (brillos) se recuperan; la mancha ancha entre los pies no
            closed = cv2.morphologyEx(keep.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)).astype(bool) & al
            keep[y0:] = closed[y0:]
            # solo lo que sigue unido al cuerpo (fuera trazos sueltos del suelo y motas)
            n, lab, st, _ = cv2.connectedComponentsWithStats(keep.astype(np.uint8), 8)
            if n > 1:
                big = st[1:, cv2.CC_STAT_AREA].argmax() + 1
                body = lab == big
                for i in range(1, n):
                    if i != big and st[i, cv2.CC_STAT_TOP] < y0 - 30 and st[i, cv2.CC_STAT_AREA] > 400: body |= lab == i   # p. ej. el bastón
                keep = body
            soft = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 0.6)
            fr[:, :, 3] = (fr[:, :, 3].astype(np.float32) * np.minimum(1, soft * 1.4)).astype(np.uint8)
    return a
if __name__ == '__main__':
    import sys
    from PIL import Image
    im = np.array(Image.open(sys.argv[1]).convert('RGBA'))
    out = clean_rai(im)
    fr = [Image.fromarray(out).crop((c * 320, r * 288, (c + 1) * 320, (r + 1) * 288)) for r, c in [(0, 0), (1, 3), (2, 3), (3, 6)]]
    W = Image.new('RGBA', (640 * 4, 576), (60, 140, 60, 255))
    for i, f in enumerate(fr): W.alpha_composite(f.resize((640, 576)), (i * 640, 0))
    W.convert('RGB').resize((1920, 432)).save(sys.argv[2])
