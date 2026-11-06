import sys; sys.path.insert(0,'/home/claude/extra-o-en-castilla/production/G10/tools')
import pt_lib
from pt_lib import *
from PIL import Image
pt_lib.SH='/home/claude/extra-o-en-castilla/production/G11/shots/'
P=Play(sys.argv[1]); P.new(); P.pg.wait_for_timeout(500)
P.pg.mouse.click(60,860); P.pg.wait_for_timeout(2500); P.settle()
print('audio',P.ev('LAB1248.E.audio.state'),P.ev('LAB1248.E.audio.music'))
def strip(name,tx):
    P.ev(f'LAB1248.tapWorld({tx},800)'); fr=[]
    for i in range(6):
        P.pg.wait_for_timeout(230); P.pg.screenshot(path=pt_lib.SH+'w.png'); im=Image.open(pt_lib.SH+'w.png').copy()
        pl=P.ev('(()=>{const G=LAB1248.G;return [G.player.x-G.S.camX,G.player.y,G.player.facing]})()'); fr.append((im,pl))
    W=Image.new('RGB',(6*220,380))
    for i,(im,pl) in enumerate(fr):
        x=int(pl[0]); W.paste(im.crop((x-110,int(pl[1])-340,x+110,int(pl[1])+40)),(i*220,0))
    W.save(pt_lib.SH+name+'.png'); print(name,[f[1][2] for f in fr])
P.ev('LAB1248.G.player.x=900'); P.pg.wait_for_timeout(300); strip('dir_right',1300); P.settle(); strip('dir_left',700)
print('music',P.ev('LAB1248.E.audio.music'),'errores',P.ev('LAB1248.log().filter(e=>e.level!=="info")'))
P.close()
