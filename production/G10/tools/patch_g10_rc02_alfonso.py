"""RC01 -> RC02: Alfonso con clip real (reposo + marcha de perfil). Uso: python patch_g10_rc02_alfonso.py <entrada.html> <salida.html>"""
import re, base64, json, sys, os
HERE=os.path.dirname(os.path.abspath(__file__)); W=os.path.join(HERE,'..','work','alfonso')+'/'
s=open(sys.argv[1],encoding='utf-8').read()
def sub1(old,new,s):
    assert s.count(old)==1,('no único/ausente',s.count(old),old[:90]); return s.replace(old,new)
s=sub1("RIBERA → ACEÑA → EMBARCADERO · RC01","RIBERA → ACEÑA → EMBARCADERO · RC02",s)
s=sub1("Ribera → Aceña → Embarcadero · RC01","Ribera → Aceña → Embarcadero · RC02",s)
meta=json.load(open(W+'meta.json')); R=meta['rows']; C=meta['counts']
webp=base64.b64encode(open(W+'sheet.webp','rb').read()).decode()
m=re.search(r'"assets/characters/alfonso/sheet\.png":"data:image/png;base64,[A-Za-z0-9+/=]+"',s); assert m
s=s[:m.start()]+'"assets/characters/alfonso/sheet_g10.webp":"data:image/webp;base64,'+webp+'"'+s[m.end():]
# L=34 fotogramas a 24 fps; stride = zancada del ciclo en px de juego a escala 1 (altura 300): 433.6 px fuente * 0.315 * (300/348)
stride=round(meta['stride_src_px']*0.315*300/meta['ch'])
s=sub1("  D.characters = {\n","""  // Alfonso: hoja generada desde el clip de marcha 1000701584 (perfil, mira a la derecha). Reposo = un fotograma con respiración.
  // De momento no hay clips de habla ni de escucha: al hablar usa el reposo con un ligero cabeceo procedural.
  const sheetAlfonso = { frameW: %d, frameH: %d, anchor: [%d, %d], cols: %d, baseFacing: 'right', anims: {
    idle_right: { row: %d, frames: 1, fps: 1, breath: true },
    walk_right: { row: %d, frames: %d, fps: 24, stride: %d } } };

  D.characters = {
"""%(meta['cw'],meta['ch'],meta['cw']//2,meta['gy'],meta['cols'],R['idle'],R['walk'],C['walk'],stride),s)
a=s.index("    alfonso: {\n      name: 'Alfonso'"); b=s.index("    }\n  };\n})(window.E1248",a)
s=s[:a]+"""    alfonso: {
      name: 'Alfonso', height: 300, speed: 100, hit: [-55, -300, 110, 300], orient: 'lr',
      sprite: { src: 'assets/characters/alfonso/sheet_g10.webp', sheet: sheetAlfonso,
        placeholderOpts: { skin: '#c98e68', hair: '#3a2a20', beard: '#3a2a20', top: '#7b5a3a', sleeve: '#6a4c30', legs: '#4a3a2a', shoes: '#2f2218', hat: '#8a6a3a' } }
"""+s[b:]
# cabeceo al hablar cuando la hoja no tiene animación de habla propia
s=sub1("    return { row, col, flip, breath: !!an.breath, shake: base === 'work' && !key.startsWith('work') };",
       "    return { row, col, flip, breath: !!an.breath, shake: base === 'work' && !key.startsWith('work'), nod: base === 'talk' && !key.startsWith('talk') };",s)
s=sub1("    const sc = f.breath ? 1 + 0.006 * Math.sin(a.animT * 1.9) : 1;",
       "    let sc = f.breath ? 1 + 0.006 * Math.sin(a.animT * 1.9) : 1;\n    if (f.nod) sc *= 1 + 0.011 * Math.max(0, Math.sin(a.animT * 9.5)) + 0.004 * Math.sin(a.animT * 4.1);",s)
open(sys.argv[2],'w',encoding='utf-8').write(s); print('ok',len(s),'stride',stride)
