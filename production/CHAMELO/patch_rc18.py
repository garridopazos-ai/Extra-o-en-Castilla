"""CHAMELO RC18 · correcciones de la auditoría de RC17 (docs/AUDITORIA_RC17.md), aplicadas SOBRE la build RC17 (que no se toca).
Uso: python production/CHAMELO/patch_rc18.py builds/1248_CHAMELO_RC17.html builds/1248_CHAMELO_RC18.html <dir hoja protagonista>
La hoja del protagonista se rehace con tools/build_player_rc18.py desde los mismos clips 216/222/223 (misma escala, +24 px arriba)."""
import sys, os, re, base64, json
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(sys.argv[1], encoding='utf-8').read(); PW = sys.argv[3]
def sub(old, new, n=1):
    global s
    assert s.count(old) == n, ('recuento', s.count(old), old[:90]); s = s.replace(old, new)
s = re.sub(r'CHAMELO RC17', 'CHAMELO RC18', s)
# ---- M1 · panel de diálogo: no se dibuja vacío mientras corren las acciones de un nodo; un toque adelanta sus frases
sub("    function drawDialogue(ctx) {\n      const D = G.dialogue;\n      if (!D.active) return;",
    "    function drawDialogue(ctx) {\n      const D = G.dialogue;\n      if (!D.active || D.phase === 'actions') return;")
sub("      if (G.dialogue.active) { G.dialogue.advance(); return; }",
    "      if (G.dialogue.active) { if (G.dialogue.phase === 'actions') G.ui.advance(); else G.dialogue.advance(); return; }")
# ---- M2 · «toca para continuar» alineado por su borde derecho, dentro del panel
sub("        TX.draw(ctx, '▸ toca para continuar', x + w - 36, y + h - 24, { size: 22, color: COL.dim, ui: true, align: 'right' }, 'bc');",
    "        { const tt = '▸ toca para continuar', to = { size: 22, color: COL.dim, ui: true }, te = TX.get(tt, to); TX.draw(ctx, tt, x + w - 36 - te.w / 2, y + h - 24, to, 'bc'); }")
# ---- M3 · bocadillos: solo de quien está en la escena; los comentarios sueltos no pasan a la siguiente
sub("        const a = b.actor;\n        const sc = S.depthScale(a.y);",
    "        const a = b.actor;\n        if (a !== G.player && !G.sceneNpcs.some(n => n.actor === a)) continue;\n        const sc = S.depthScale(a.y);")
sub("      G.npcs.sync();\n      const old = G.S;",
    "      G.npcs.sync();\n      G.ui.bubbles = G.ui.bubbles.filter(b => b.blocking);\n      const old = G.S;")
# ---- B6 · el menú de pausa no ofrece el mapa hasta tenerlo
sub("          { label: 'Mapa de Talavera', onTap: () => E.journey.open(G, U), id: 'm-map' },",
    "          ...(G.state.flags.mapa_rai ? [{ label: 'Mapa de Talavera', onTap: () => E.journey.open(G, U), id: 'm-map' }] : []),")
# ---- M7 / M8 · nombres del mapa: Plaza Mayor (no «Vista Pública») y la choza de Martín
sub("'Vista Pública']", "'Plaza Mayor']", 2)
sub("'ante la Vista Pública'", "'ante el arco de la Plaza Mayor'")
sub("'ante la choza de Alfonso'", "'ante la choza de Martín'")
# ---- B5 · frases del viajero que se adelantaban (el pórtico antes de la confesión; Nuño antes de conocerle)
sub("'¿Y si el portal se abre justo ahora que estoy mirando hacia otro lado?', ", "")
sub("'Si me quedo quieto mucho rato, seguro que Nuño me cobra por estar parado.', ", "")
# ---- M6 · comentarios espontáneos de la trama antigua (badajo robado, truco de Lope)
sub("    benito: ['Sin badajo, la campana solo dice «...».', ", "    benito: [")
sub("    lope: ['Martillo, yunque y misterio. Por ese orden.', 'Un herrero sin truco es un hombre que golpea cosas.'],",
    "    lope: ['¡Herraduras, rejas y orgullo! Lo último no se vende.'],")
# ---- M8 · sustitución de nombre acotada: solo el barquero (nunca «Alfonso IX», «Sancha Alfonso», «rey Alfonso»…)
sub("if (v.indexOf('Alfonso') >= 0) o[k] = v.replace(/Alfonso/g, 'Martín');",
    "if (v.indexOf('Alfonso') >= 0) o[k] = v.replace(/(\\S+\\s)?Alfonso(\\s+[IVX]+\\b)?/g, (m, pre, rn) => (rn || /^(Sancha|rey|Don|Doña)\\s$/.test(pre || '')) ? m : (pre || '') + 'Martín');")
# ---- B7 / B8 · el estado (eclipse, nombre de Alonso, tertulia) se actualiza en rc18 (bucle de juego), no al dibujar
sub("      if (id === 'iglesia' && f.eclipse) { if (!f.luna_roja) R17.moon = Math.min(1, R17.moon + dt / 7); else R17.moon = 1; moonDraw(ctx, 1010, 72, R17.moon, now); }",
    "      if (id === 'iglesia' && f.eclipse) moonDraw(ctx, 1010, 72, R17.moon, now);")
sub("      if (f.alonso_nombre && N.soldado.name !== 'Alonso') N.soldado.name = 'Alonso';\n", "")
sub("      if (E.rc14) E.rc14.scene = T({ all: ['oropesa_secuestrada', '!oropesa_rescatada'] }, G.state) || f.noche ? 'apagada' : 'taberna';\n", "")
# ---- B2 · monedas de la balanza, con el grupo desplazado 150 px
sub("coins(ctx, 2060 - Sc.camX, R17.coins)", "coins(ctx, 1910 - Sc.camX, R17.coins)")
# ---- M5 · hoja del protagonista rehecha desde los mismos clips: celda 240×372 (antes 348), pies en y 364 (antes 340), misma escala
meta = json.load(open(os.path.join(PW, 'meta.json'))); assert meta['ch'] == 372 and meta['gy'] == 364
k = meta['ch'] / 348.0
sub("const sheetPlayer = { frameW: 240, frameH: 348, anchor: [120, 340],", "const sheetPlayer = { frameW: 240, frameH: 372, anchor: [120, 364],")
sub("      name: 'El extraño', height: 300,", "      name: 'El extraño', height: %d," % round(300 * k))   # misma altura en pantalla con la celda más alta
webp = base64.b64encode(open(os.path.join(PW, 'sheet.webp'), 'rb').read()).decode()
s, n = re.subn(r'"assets/characters/player/sheet_g11\.webp":"data:image/webp;base64,[A-Za-z0-9+/=]+"',
               lambda m: '"assets/characters/player/sheet_g11.webp":"data:image/webp;base64,' + webp + '"', s)
assert n == 1, n
# ---- módulo de correcciones de datos
marker = "<script>/* src/main.js */"
sub(marker, "<script>/* CHAMELO RC18 · rc18.js */\n" + open(os.path.join(HERE, 'rc18.js'), encoding='utf-8').read() + "\n</script>\n" + marker)
open(sys.argv[2], 'w', encoding='utf-8').write(s)
print('ok', len(s) // 1024 // 1024, 'MB · altura protagonista', round(300 * k))
