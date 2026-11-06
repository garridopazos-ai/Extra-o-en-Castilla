"""Croma verde saturado para los clips del protagonista (216/222/223). Uso: python key_player.py <dir png> <dir salida>"""
import cv2, numpy as np, sys, os, glob
from scipy import ndimage as ndi
def key_frame(bgr, lo=28.0, hi=72.0):
    f = bgr.astype(np.float32); B,G,R = f[...,0],f[...,1],f[...,2]
    gex = G - np.maximum(R,B)
    a = 1.0 - np.clip((gex-lo)/(hi-lo),0,1); a = a*a*(3-2*a)
    G2 = G - np.clip(G-np.maximum(R,B),0,None)*0.9
    out = np.dstack([B,G2,R])
    m = a>0.5; lab,n = ndi.label(m)
    if n>1:
        sizes = ndi.sum(m,lab,range(1,n+1)); keep = np.zeros(n+1,bool); keep[1:] = sizes>=max(400,0.02*sizes.max())
        a = a*ndi.binary_dilation(keep[lab],iterations=3)
    return np.dstack([out.clip(0,255).astype(np.uint8),(a*255+0.5).astype(np.uint8)])
if __name__=='__main__':
    src,dst = sys.argv[1],sys.argv[2]; os.makedirs(dst,exist_ok=True)
    for p in sorted(glob.glob(src+'/*.png')): cv2.imwrite(os.path.join(dst,os.path.basename(p)),key_frame(cv2.imread(p)))
