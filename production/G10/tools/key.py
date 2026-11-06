import cv2, numpy as np, sys, os, glob
from scipy import ndimage as ndi

def key_frame(bgr):
    f = bgr.astype(np.float32)
    B,G,R = f[...,0],f[...,1],f[...,2]
    gex = G - np.maximum(R,B)                 # exceso de verde
    # fondo ~ (10,158,74): gex ~ 84
    a = 1.0 - np.clip((gex-14.0)/(64.0-14.0),0,1)
    a = a*a*(3-2*a)
    # despill: en píxeles con alfa parcial o borde, limitar G a max(R,B)+0
    lim = np.maximum(R,B)
    spill = np.clip(G-lim,0,None)
    G2 = G - spill*0.9*(1-0.0)
    out = np.dstack([B,G2,R])
    # quitar islas: componente mayor de alfa>0.5 (+ dilatación para conservar bordes)
    m = a>0.5
    lab,n = ndi.label(m)
    if n>1:
        sizes = ndi.sum(m,lab,range(1,n+1))
        keep = np.zeros(n+1,bool); keep[1:] = sizes>=max(400,0.02*sizes.max())
        mk = keep[lab]
        mk = ndi.binary_dilation(mk,iterations=4)
        a = a*mk
    # rellenar agujeros pequeños interiores (alfa baja rodeada)
    return np.dstack([out.clip(0,255).astype(np.uint8),(a*255+0.5).astype(np.uint8)])

if __name__=='__main__':
    src,dst = sys.argv[1],sys.argv[2]
    os.makedirs(dst,exist_ok=True)
    for p in sorted(glob.glob(src+'/*.png')):
        im = cv2.imread(p)
        cv2.imwrite(os.path.join(dst,os.path.basename(p)),key_frame(im))
