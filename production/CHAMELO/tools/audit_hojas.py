# ¿Hay fotogramas de hojas de personaje con píxeles opacos pegados al borde de la celda? (= dibujo recortado)
import json,sys
from playwright.sync_api import sync_playwright
p=sync_playwright().start(); b=p.chromium.launch(args=['--allow-file-access-from-files']); pg=b.new_page()
pg.goto('file://'+sys.argv[1]); pg.wait_for_function('window.LAB1248 && LAB1248.ready()',timeout=90000)
r=pg.evaluate('''(async()=>{const E=LAB1248.E,D=E.DATA,out={};
 for(const [id,cd] of Object.entries(D.characters)){ if(cd.rig||!cd.sprite||!cd.sprite.sheet) continue;
  await E.assets.acquire({id:'char:'+id,src:cd.sprite.src,placeholder:'person'},'audit');
  const img=E.assets.get('char:'+id); if(!img){out[id]='sin imagen';continue}
  const sh=cd.sprite.sheet, fw=sh.frameW||sh.fw||sh.w, fh=sh.frameH||sh.fh||sh.h;
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
  const data=g.getImageData(0,0,c.width,c.height).data, W=c.width;
  const a=(x,y)=>data[(y*W+x)*4+3];
  const res={};
  for(const [an,A] of Object.entries(sh.anims)){ const row=A.row, n=A.frames||1, cols=sh.cols||Math.floor(img.width/fw);
    let worst={top:0,left:0,right:0,bottom:0},fr=0;
    for(let i=0;i<n;i++){ const idx=(A.start||0)+i, cx=(idx%cols)*fw, cy=(row+Math.floor(idx/cols))*fh; if(cy+fh>img.height) break; fr++;
      let t=0,l=0,rr=0,bb=0; for(let x=cx;x<cx+fw;x+=2){ if(a(x,cy)>40)t++; if(a(x,cy+fh-1)>40)bb++; } for(let y=cy;y<cy+fh;y+=2){ if(a(cx,y)>40)l++; if(a(cx+fw-1,y)>40)rr++; }
      worst.top=Math.max(worst.top,t);worst.left=Math.max(worst.left,l);worst.right=Math.max(worst.right,rr);worst.bottom=Math.max(worst.bottom,bb);}
    res[an]={frames:fr,...worst}; }
  out[id]={cell:[fw,fh],cols:sh.cols,res}; }
 return out})()''')
print(json.dumps(r,ensure_ascii=False,indent=0)[:5000]); b.close(); p.stop()
