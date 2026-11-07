"""RC10 -> RC11: la portada ilustrada (art/portada/portada_1248_game.jpg) pasa a ser la pantalla de título. Uso: python patch_g11_rc11.py <RC10> <RC11>"""
import sys,os,base64
HERE=os.path.dirname(os.path.abspath(__file__))
s=open(sys.argv[1],encoding='utf-8').read()
def sub(o,n):
    global s
    assert s.count(o)==1,(s.count(o),o[:70]); s=s.replace(o,n)
s=s.replace("RC10","RC11")
b=base64.b64encode(open(os.path.join(HERE,'..','..','art','portada','portada_1248_game.jpg'),'rb').read()).decode()
sub("E1248_ILLUS={map:'data:image/jpeg","E1248_ILLUS={cover:'data:image/jpeg;base64,"+b+"',map:'data:image/jpeg")
sub("Z = U.titleZoom, FX = 300, FY = 652;","Z = U.titleZoom, FX = 800, FY = 450;")
sub("sc = 1 + e * 3.4;","sc = 1;")
sub("const im = E.illus && E.illus.map;\n        if (im && im.complete","const im = E.illus && (E.illus.cover || E.illus.map);\n        if (im && im.complete")
sub("const p = (now % 1500) / 1500, r = 22 + p * 54;","const p = 1, r = 0;")
sub("ctx.beginPath(); ctx.ellipse(FX, FY, r, r * 0.6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();","ctx.restore();")
open(sys.argv[2],'w',encoding='utf-8').write(s); print('ok')
