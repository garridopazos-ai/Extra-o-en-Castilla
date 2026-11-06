import re, base64, json, sys
W='/home/claude/extra-o-en-castilla/production/G10/work/'
src=open(W+'base.html',encoding='utf-8').read()
out_path=sys.argv[1]
def sub1(old,new,s):
    assert s.count(old)==1,('no único/ausente',s.count(old),old[:90])
    return s.replace(old,new)
s=src

# ---------- versión / título / clave de guardado ----------
s=sub1("<title>1248 · LAB G05.1 · Mapeado</title>","<title>1248 · LUNA G10 · Ribera → Aceña → Embarcadero · RC01</title>",s)
s=sub1("version: '1248 · LUNA G05 · RIBERA + VIAJERO · 0.1',","version: '1248 · LUNA G10 · RIBERA → ACEÑA → EMBARCADERO · RC01',",s)
s=sub1("saveKey: '1248_g051_mapeado_save_v1',","saveKey: '1248_g10_rc01_save_v1',",s)

# ---------- hoja de Durán incrustada (webp) ----------
webp=base64.b64encode(open(W+'duran/sheet.webp','rb').read()).decode()
m=re.search(r'"assets/characters/duran/sheet\.png":"data:image/png;base64,[A-Za-z0-9+/=]+"',s); assert m
s=s[:m.start()]+'"assets/characters/duran/sheet_g10.webp":"data:image/webp;base64,'+webp+'"'+s[m.end():]

# ---------- actor.js: marcha ligada a la distancia, estados, hojas con varias filas/columnas y orientación base ----------
s=sub1("      a.facing = computeFacing(a, dx, dy);\n      if (d <= v)",
       "      a.facing = computeFacing(a, dx, dy);\n      a.walkDist = (a.walkDist || 0) + Math.min(d, v) / Math.max(0.45, depthScale(a.y)); // distancia recorrida en unidades de escala 1\n      if (d <= v)",s)
i0=s.index("  // Resuelve la fila de animación disponible en la hoja de sprites.")
i1=s.index("  // Caja de impacto para toques")
NEW_ACTOR='''  // Resuelve la animación y el fotograma. La hoja puede declarar:
  //   baseFacing:'left'|'right'  hacia dónde mira el arte (por defecto 'right'; se espeja al otro lado)
  //   cols:n                     fotogramas por fila (una animación larga ocupa varias filas)
  //   anims.walk_*.stride:px     distancia de suelo (escala 1) que recorre el ciclo completo: la marcha avanza por distancia, no por tiempo
  //   anims.*.breath:true        respiración procedural (animación de un solo fotograma)
  // Estados: talk (habla), listen (escucha), work/idle/walk. Los que falten caen a idle.
  function frameFor(a, sheet) {
    const anims = sheet.anims, bf = sheet.baseFacing || 'right';
    const lr = (a.facing === 'left' || a.facing === 'right') ? a.facing : a.lastH;
    const base = a.talking ? 'talk' : (a.listening && !a.moving ? 'listen' : a.anim);
    const pick = b => {
      const k = b + '_' + lr; if (anims[k]) return [k, false];
      const kb = b + '_' + bf; if (anims[kb]) return [kb, lr !== bf];
      return null;
    };
    const r = pick(base) || pick('idle') || ['idle_right', lr === 'left'];
    const key = r[0], flip = r[1];
    const an = anims[key] || anims.idle_right;
    if (a._st !== key) { a._st = key; a._t0 = a.animT; }
    let fi;
    if (an.stride && key.startsWith('walk')) fi = Math.floor((((a.walkDist || 0) / an.stride) % 1 + 1) % 1 * an.frames) % an.frames;
    else fi = Math.floor((a.animT - a._t0) * (an.fps || 8)) % an.frames;
    const cols = sheet.cols || 0;
    const row = cols ? an.row + Math.floor(fi / cols) : an.row, col = cols ? fi % cols : fi;
    return { row, col, flip, breath: !!an.breath, shake: base === 'work' && !key.startsWith('work') };
  }

  function draw(ctx, a, sheetEntry, sheet, scale, camX) {
    if (!a.visible || !sheetEntry) return;
    const f = frameFor(a, sheet);
    const s = (a.def.height / sheet.frameH) * scale;
    const w = sheet.frameW * s, h = sheet.frameH * s;
    const ax = sheet.anchor[0] * s, ay = sheet.anchor[1] * s;
    const sx = f.col * sheet.frameW, sy = f.row * sheet.frameH;
    const px = a.x - camX;
    // Sombra de contacto: elipse precalculada (sin shadowBlur).
    const sh = E.assets.get('fx_shadow');
    if (sh) ctx.drawImage(sh, px - w * 0.36, a.y - 10 * scale, w * 0.72, 20 * scale);
    // Respiración (reposo) y esfuerzo (work sin animación propia): transformaciones baratas ancladas en los pies.
    const sc = f.breath ? 1 + 0.006 * Math.sin(a.animT * 1.9) : 1;
    const rot = f.shake ? Math.sin(a.animT * 11) * 0.010 : 0;
    if (f.flip || sc !== 1 || rot) {
      ctx.save(); ctx.translate(px, a.y); if (rot) ctx.rotate(rot); ctx.scale(f.flip ? -1 : 1, sc);
      ctx.drawImage(sheetEntry, sx, sy, sheet.frameW, sheet.frameH, -ax, -ay, w, h);
      ctx.restore();
    } else ctx.drawImage(sheetEntry, sx, sy, sheet.frameW, sheet.frameH, px - ax, a.y - ay, w, h);
  }

'''
s=s[:i0]+NEW_ACTOR+s[i1:]

# ---------- personajes: Durán con los clips ----------
meta=json.load(open(W+'duran/meta.json')); R=meta['rows']; C=meta['counts']
s=sub1("  D.characters = {\n", """  // Durán: hoja generada desde los clips de vídeo (habla 1000700233, escucha 1000700234, marcha 1000700252).
  // Celda 176×348, pies en (88,340), el arte mira a la izquierda (se espeja a la derecha). 16 fotogramas por fila.
  const sheetDuran = { frameW: %d, frameH: %d, anchor: [%d, %d], cols: %d, baseFacing: 'left', anims: {
    idle_left:   { row: %d, frames: 1,  fps: 1, breath: true },
    walk_left:   { row: %d, frames: %d, fps: 12, stride: 125 },
    talk_left:   { row: %d, frames: %d, fps: 8 },
    listen_left: { row: %d, frames: %d, fps: 6 } } };

  D.characters = {
"""%(meta['cw'],meta['ch'],meta['cw']//2,meta['gy'],meta['cols'],R['idle'],R['walk'],C['walk'],R['talk'],C['talk'],R['listen'],C['listen']),s)
s=sub1("""      name: 'Durán', height: 310, speed: 230, hit: [-60, -300, 120, 300], orient: 'lr',
      sprite: { src: 'assets/characters/duran/sheet.png', sheet,""","""      name: 'Durán', height: 327, speed: 105, hit: [-60, -300, 120, 300], orient: 'lr',
      sprite: { src: 'assets/characters/duran/sheet_g10.webp', sheet: sheetDuran,""",s)

# ---------- game.js: estado «escucha» ----------
s=sub1("      if (!G.dialogue.active) for (const a of G.actorsInScene()) a.talking = G.ui.bubbles.some(b => b.actor === a && !b.done);\n",
"""      if (!G.dialogue.active) for (const a of G.actorsInScene()) a.talking = G.ui.bubbles.some(b => b.actor === a && !b.done);
      // Escucha: el interlocutor de la conversación mientras no le toca hablar (incluye cuando el jugador elige opción);
      // fuera de diálogo, el NPC retenido mientras otro habla. Al acabar o saltar la frase vuelve solo a reposo.
      const dn = G.dialogue.active ? G.dialogueNpc() : null;
      for (const n of G.sceneNpcs) {
        const a = n.actor;
        a.listening = !a.talking && (dn === a || (a.hold && G.ui.bubbles.some(b => b.actor && b.actor !== a && !b.done)));
      }
""",s)
exec(open(W+'../tools/patch_g10_zones.py').read())
open(out_path,'w',encoding='utf-8').write(s)
print('ok',len(s))
