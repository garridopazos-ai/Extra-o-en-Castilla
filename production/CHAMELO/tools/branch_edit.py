import numpy as np, cv2
from PIL import Image
def shorten(rgb):
    """Higuera del soto: la rama horizontal (de ~2120 a ~2465) se corta en ~2300 con un remate redondo nuevo."""
    im = rgb.astype(np.float32)
    TIP, X1, Y0, Y1 = 2294, 2474, 440, 512
    w = X1 - TIP
    src = im[Y0:Y1, 1690:1690 + w].copy()                    # agua del mismo nivel del río, a la izquierda del tronco
    tgt = im[Y0:Y1, X1:X1 + 14].mean(1)
    src += (tgt - src.mean(1))[:, None, :]                    # igualada fila a fila con el agua de la derecha
    m = np.ones((Y1 - Y0, w), np.float32)
    m[:, -10:] *= np.linspace(1, 0, 10)[None, :]
    m[:4, :] *= np.linspace(0, 1, 4)[:, None]; m[-4:, :] *= np.linspace(1, 0, 4)[:, None]
    im[Y0:Y1, TIP:X1] = im[Y0:Y1, TIP:X1] * (1 - m[:, :, None]) + src * m[:, :, None]
    # remate: corte de madera clara con anillos y contorno de tinta (dibujado a 4× y reducido)
    S, cx, cy, rx, ry = 4, 2296, 467, 9.5, 16
    x0, y0, W, H = 2280, 446, 34, 44
    big = cv2.resize(im[y0:y0 + H, x0:x0 + W], (W * S, H * S), interpolation=cv2.INTER_CUBIC)
    c = (int((cx - x0) * S), int((cy - y0) * S)); ax = (int(rx * S), int(ry * S))
    cv2.ellipse(big, c, ax, 0, 0, 360, (204, 158, 104), -1, cv2.LINE_AA)
    for k, col in ((0.66, (170, 118, 70)), (0.34, (150, 100, 58))):
        cv2.ellipse(big, c, (int(ax[0] * k), int(ax[1] * k)), 0, 0, 360, col, int(1.3 * S), cv2.LINE_AA)
    cv2.ellipse(big, c, ax, 0, 0, 360, (44, 32, 26), int(2.2 * S), cv2.LINE_AA)
    im[y0:y0 + H, x0:x0 + W] = cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA)
    return np.clip(im, 0, 255).astype(np.uint8)
if __name__ == '__main__':
    rgb = np.array(Image.open('bgs/scenes_orilla_soto_acuarela.webp.png').convert('RGB'))
    out = Image.fromarray(shorten(rgb)); out.crop((1900, 330, 2650, 620)).save('rama_check.png')
