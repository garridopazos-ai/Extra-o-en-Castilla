"""G11 RC09 -> G11 RC10: tarjetas de capítulo en la primera visita a cada lugar. Uso: python patch_g11_rc10.py <RC09.html> <RC10.html>"""
import sys
s=open(sys.argv[1],encoding='utf-8').read()
def sub(old,new,n=1):
    global s
    assert s.count(old)==n,('recuento',s.count(old),old[:80]); s=s.replace(old,new)
s=s.replace("RC09","RC10")
sub("    U.showSceneTitle = text => { U.sceneTitle = { text, t: 0 }; };",
"""    // Tarjeta de capítulo (RC10): primera visita a un lugar = cartela grande con número, nombre y frase; si no, el rótulo pequeño de siempre.
    const CHAPTERS = {
      ribera:      ['I', 'Talavera, 1248. Llueve en el Tajo y el río ha decidido salirse.'],
      acena:       ['II', 'Aquí se muele el pan de media comarca... cuando la rueda gira.'],
      embarcadero: ['III', 'Una barca, un barquero y un cabo muy bien atado.'],
      travesia:    ['IV', 'Cruzar el Tajo sin mojarse: objetivo ambicioso.'],
      puerta_rio:  ['V', 'La muralla de Talavera. Dos guardias y un reglamento.'],
      plaza:       ['VI', 'Pan, chismes y una campana que no suena.'],
      iglesia:     ['VII', 'Santa María calla. Alguien se ha llevado el badajo.'],
      portazgo:    ['VIII', 'Aquí se tasa hasta el aire. Con sello, claro.'],
      audiencia:   ['IX', 'La Vista Pública. Que hable quien tenga papel.'],
      alfar:       ['X', 'El horno de los Olleros: la última puerta.']
    };
    U.showSceneTitle = (text, id) => { const c = id && CHAPTERS[id]; U.sceneTitle = c ? { text, t: 0, card: c, dur: 4.2 } : { text, t: 0, dur: 2.6 }; };""")
sub("if (U.sceneTitle.t > 2.6) U.sceneTitle = null;","if (U.sceneTitle.t > U.sceneTitle.dur) U.sceneTitle = null;")
sub("""      const s = U.sceneTitle; if (!s) return;
      ctx.globalAlpha = Math.min(1, s.t * 3, (2.6 - s.t) * 2);""","""      const s = U.sceneTitle; if (!s) return;
      if (s.card) {
        const a = Math.min(1, s.t * 2.5, (s.dur - s.t) * 2.5), y = 250;
        ctx.save(); ctx.globalAlpha = a * 0.82;
        const g = ctx.createLinearGradient(0, y - 20, 0, y + 250);
        g.addColorStop(0, 'rgba(24,14,6,0)'); g.addColorStop(0.12, 'rgba(24,14,6,.9)'); g.addColorStop(0.88, 'rgba(24,14,6,.9)'); g.addColorStop(1, 'rgba(24,14,6,0)');
        ctx.fillStyle = g; ctx.fillRect(0, y - 20, C.W, 270);
        ctx.globalAlpha = a; ctx.fillStyle = 'rgba(233,165,35,.9)'; ctx.fillRect(C.W / 2 - 220, y + 30, 440, 3); ctx.fillRect(C.W / 2 - 220, y + 222, 440, 3);
        TX.draw(ctx, 'Capítulo ' + s.card[0], C.W / 2, y + 48, { size: 28, color: '#e6c98a', italic: true, stroke: 'rgba(0,0,0,.8)' }, 'tc');
        TX.draw(ctx, s.text, C.W / 2, y + 96, { size: 66, color: COL.gold, bold: true, stroke: 'rgba(0,0,0,.85)' }, 'tc');
        TX.draw(ctx, s.card[1], C.W / 2, y + 176, { size: 30, color: '#fff3d6', stroke: 'rgba(0,0,0,.85)' }, 'tc');
        ctx.restore(); return;
      }
      ctx.globalAlpha = Math.min(1, s.t * 3, (2.6 - s.t) * 2);""")
sub("""      G.ui.showSceneTitle(def.name);
      const first = !G.state.visited[sceneId];""","""      const first = !G.state.visited[sceneId];
      G.ui.showSceneTitle(def.name, first && !savedPos ? sceneId : null);""")
open(sys.argv[2],'w',encoding='utf-8').write(s); print('ok',len(s))
