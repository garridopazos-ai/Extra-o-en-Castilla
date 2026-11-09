# Volcado de RC17: todas las cadenas de E.DATA con su ruta + análisis de alcance de diálogos y zonas
import json,sys
from playwright.sync_api import sync_playwright
p=sync_playwright().start(); b=p.chromium.launch(args=['--allow-file-access-from-files']); pg=b.new_page()
pg.goto('file://'+sys.argv[1]); pg.wait_for_function('window.LAB1248 && LAB1248.ready()',timeout=90000)
d=pg.evaluate('''(()=>{const D=LAB1248.E.DATA;const out=[];
 const walk=(o,path,seen)=>{if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);for(const k of Object.keys(o)){const v=o[k];if(typeof v==='string'){if(v.length>3&&/\\s/.test(v))out.push([path+'.'+k,v])}else if(typeof v==='object')walk(v,path+'.'+k,seen)}};
 for(const k of ['scenes','npcs','dialogues','items','hints','generic','characters']) walk(D[k],k,new Set());
 // diálogos referenciados desde verbos/escenas
 const refs={};const scan=(o,from,seen)=>{if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);if(typeof o.dialogue==='string'){(refs[o.dialogue]=refs[o.dialogue]||[]).push(from)}for(const v of Object.values(o))if(typeof v==='object')scan(v,from,seen)};
 for(const [id,n] of Object.entries(D.npcs)) scan(n.verbs,'npc:'+id+(n.presentWhen?' [present '+JSON.stringify(n.presentWhen)+']':''),new Set());
 for(const [id,s] of Object.entries(D.scenes)) for(const h of s.hotspots||[]) scan(h.verbs,'hs:'+id+'.'+h.id+(h.visibleWhen?' [vis '+JSON.stringify(h.visibleWhen)+']':''),new Set());
 for(const [id,s] of Object.entries(D.scenes)) scan([s.onEnter,s.firstEnter],'scene:'+id,new Set());
 const dl={};for(const [id,L] of Object.entries(D.dialogues))dl[id]={npc:L.npc,refs:refs[id]||[]};
 // diálogos con notas o frases en «actions» (se muestran fuera del panel)
 const inAct={};for(const [id,L] of Object.entries(D.dialogues))for(const [nid,n] of Object.entries(L.nodes||{})){const a=JSON.stringify([n.actions||[],(n.options||[]).map(o=>o.actions||[])]);const c=(a.match(/"(say|note|bark)"/g)||[]).length+(a.includes('mingoHint')?1:0);if(c)inAct[id+'.'+nid]=c}
 return {strings:out,dl,inAct,mayTarima:D.scenes.audiencia.hotspots.find(h=>h.id==='tarima')}})()''')
json.dump(d,open(sys.argv[2],'w'),ensure_ascii=False,indent=0); b.close(); p.stop(); print(len(d['strings']),'cadenas')
