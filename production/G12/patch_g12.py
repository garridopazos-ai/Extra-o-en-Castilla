"""G12 · Acto I «La orilla». Construye sobre el patch de G11 (G10 RC02 → G11) y añade: marionetas (g12_rig.js), compañero Mingo
(g12_companion.js), escenario ancho de la orilla y contenido del Acto I (g12_content.js).
Uso: python patch_g12.py <G10_RC02.html> <salida.html> <RCnn>"""
import sys, os, base64, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..', '..')
RC = sys.argv[3] if len(sys.argv) > 3 else 'RC01'
tmp = os.path.join(tempfile.gettempdir(), 'g12_base.html')
subprocess.check_call([sys.executable, os.path.join(ROOT, 'production', 'G11', 'patch_g11.py'), sys.argv[1], tmp], stdout=subprocess.DEVNULL)
tmp2 = os.path.join(tempfile.gettempdir(), 'g12_base_rc10.html')
subprocess.check_call([sys.executable, os.path.join(HERE, 'patch_g11_rc10.py'), tmp, tmp2], stdout=subprocess.DEVNULL)   # tarjetas de capítulo (G11 RC10)
s = open(tmp2, encoding='utf-8').read()
def sub(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:90]); s = s.replace(old, new)
# ---------- versión
s = s.replace('JUEGO COMPLETO · G11 · RC10', 'G12 · ACTO I «LA ORILLA» · ' + RC).replace('Candidato G11 · RC10', 'Candidato G12 · ' + RC)
s = s.replace("ctx.fillText('G11 · RC10', C.W - 48, 828)", "ctx.fillText('G12 · " + RC + "', C.W - 48, 828)")
sub("saveKey: '1248_g11_rc09_save_v1'", "saveKey: '1248_g12_" + RC.lower() + "_save_v1'")
sub("npc: { duran: '#c9e6ff',", "npc: { mingo: '#ffcf6b', ciego: '#c8d8ff', duran: '#c9e6ff',")
# ---------- capítulos: la orilla entra como capítulo II
for old, new in [("ribera:      ['I', 'Talavera, 1248. Llueve en el Tajo y el río ha decidido salirse.'],", "ribera:      ['I', 'Talavera, 1248. Un forastero, un río y un estómago vacío.'],\n      orilla:      ['II', 'Un soto, un sifón, un ciego y un ladrón de muy corta estatura.'],"),
                 ("acena:       ['II',", "acena:       ['III',"), ("embarcadero: ['III',", "embarcadero: ['IV',"), ("travesia:    ['IV',", "travesia:    ['V',"),
                 ("puerta_rio:  ['V',", "puerta_rio:  ['VI',"), ("plaza:       ['VI',", "plaza:       ['VII',"), ("iglesia:     ['VII',", "iglesia:     ['VIII',"),
                 ("portazgo:    ['VIII',", "portazgo:    ['IX',"), ("audiencia:   ['IX',", "audiencia:   ['X',"), ("alfar:       ['X',", "alfar:       ['XI',")]:
    sub(old, new)
# ---------- marionetas: dibujo en vivo y sin hoja que cargar
sub("      const img = E.assets.get('char:' + charId);\n", "      if (a.def.rig) { E.rig.draw(ctx, a, S.depthScale(a.y) * (a.def.scale || 1), S.camX); return; }\n      const img = E.assets.get('char:' + charId);\n")
sub("        return E.assets.acquire({ id: 'char:' + cid,", "        return cd.rig ? null : E.assets.acquire({ id: 'char:' + cid,")
# ---------- capas anchas con paralaje: copiar solo la parte visible (la lejana de la orilla mide 2920 px)
sub("    } else ctx.drawImage(img, x, L.y || 0, L.w, L.h);\n    ctx.globalAlpha = 1;",
    "    } else if (L.w > C.W && img.width === L.w && img.height === L.h) {\n      const sx = Math.max(0, -x), dx = Math.max(0, x), sw = Math.min(L.w - sx, C.W - dx);\n      if (sw > 0) ctx.drawImage(img, sx, 0, sw, L.h, dx, L.y || 0, sw, L.h);\n    } else ctx.drawImage(img, x, L.y || 0, L.w, L.h);\n    ctx.globalAlpha = 1;")
# ---------- compañero
sub("      G.sceneNpcs = G.npcs.inScene(sceneId);\n      E.scene.updateCamera(S, G.player.x, 0, true, G.display.k);",
    "      if (E.companion) E.companion.place(G, sceneId, e);\n      G.sceneNpcs = G.npcs.inScene(sceneId);\n      E.scene.updateCamera(S, G.player.x, 0, true, G.display.k);")
sub("      G.npcs.update(dt, G.S, G.sceneNpcs);\n", "      G.npcs.update(dt, G.S, G.sceneNpcs);\n      if (E.companion) E.companion.update(G, dt);\n")
# ---------- acciones nuevas de guion
sub("      E.log.warn('Acción desconocida: ' + JSON.stringify(a));", """      if (a.npcPlace !== undefined) {   // [id, escena, x, y, orientación]: recoloca un NPC (aunque esté en otra escena)
        const [id, sc, x, y, f] = a.npcPlace, n = G.npcs.get(id); if (!n) return;
        n.mem.scene = sc; n.mem.x = x; n.mem.y = y; if (f) n.mem.facing = f;
        const ac = n.actor; ac.x = x; ac.y = y; E.actor.setPath(ac, []); ac.scripted = false; ac._fixed = false; if (f) ac.facing = ac.lastH = f;
        G.onStateChanged(); return;
      }
      if (a.npcSpeed !== undefined) { const n = G.npc(a.npcSpeed[0]); if (n) n.speed = a.npcSpeed[1]; return; }
      if (a.mood !== undefined) { const ac = G.actorById(a.mood[0]); if (ac) ac.mood = a.mood[1]; return; }
      if (a.mingoHint) return G.speak('mingo', E.companion.hintLine(G), true);
      E.log.warn('Acción desconocida: ' + JSON.stringify(a));""")
# ---------- «Usar Mingo con…» y comentarios de Mingo al mirar
sub("      if (item) return verbs[verb + ':' + item] || verbs[verb + ':*'] || generic(verb, item);",
    "      if (item === 'mingo' && verb === 'use') return verbs['use:mingo'] || (E.companion && E.companion.present(G) ? E.companion.refuse() : [{ say: 'Mingo no está aquí. Seguramente robando algo.' }]);\n"
    "      if (item) return verbs[verb + ':' + item] || verbs[verb + ':*'] || generic(verb, item);")
sub("      return verbs[verb] || generic(verb);\n    }",
    "      const base = verbs[verb] || generic(verb);\n      if (verb === 'look' && t.kind === 'hotspot' && t.h.mingo && E.companion && E.companion.present(G)) return base.concat([{ say: t.h.mingo, who: 'mingo' }]);\n      return base;\n    }")
# ---------- ambientes que giran: recorte opcional (la rueda de la aceña gira dentro de la ventana)
sub("        ctx.save(); ctx.translate(x, a.y); ctx.rotate(a._ang);",
    "        ctx.save(); if (a.clipRect) { ctx.beginPath(); ctx.rect(a.clipRect[0] - S.camX, a.clipRect[1], a.clipRect[2], a.clipRect[3]); ctx.clip(); }\n        ctx.translate(x, a.y); ctx.rotate(a._ang);")
# ---------- arte de la orilla
ART = os.path.join(ROOT, 'art', 'escenarios', 'orilla')
def emb(path, f, mime): return '"' + path + '":"data:' + mime + ';base64,' + base64.b64encode(open(os.path.join(ART, f), 'rb').read()).decode() + '",'
key = '"assets/characters/player/sheet_g11.webp":"data:'
sub(key, emb('assets/scenes/orilla/far.jpg', 'far.jpg', 'image/jpeg') + emb('assets/scenes/orilla/near.webp', 'near.webp', 'image/webp')
    + emb('assets/scenes/orilla/reeds_a.webp', 'reeds_a.webp', 'image/webp') + emb('assets/scenes/orilla/reeds_b.webp', 'reeds_b.webp', 'image/webp') + key)
AC = os.path.join(ROOT, 'art', 'escenarios', 'acena')
def emb2(path, f, mime): return '"' + path + '":"data:' + mime + ';base64,' + base64.b64encode(open(os.path.join(AC, f), 'rb').read()).decode() + '",'
sub(key, emb2('assets/scenes/acena/bg_g12.webp', 'bg.webp', 'image/webp') + emb2('assets/scenes/acena/ventana_libre.webp', 'ventana_libre.webp', 'image/webp')
    + emb2('assets/scenes/acena/rueda.webp', 'rueda.webp', 'image/webp') + emb2('assets/scenes/acena/poste.webp', 'poste.webp', 'image/webp') + key)
# ---------- scripts G12 (tras el contenido G11)
js = '\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in ('g12_rig.js', 'g12_companion.js', 'g12_content.js'))
marker = "<script>/* src/main.js */"
sub(marker, "<script>/* G12: marionetas, compañero, Acto I */\n" + js + "\n</script>\n" + marker)
open(sys.argv[2], 'w', encoding='utf-8').write(s); print('ok', len(s))
