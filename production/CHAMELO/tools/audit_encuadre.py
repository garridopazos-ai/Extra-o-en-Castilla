# Repite pt_guion.py y, en cada pausa, anota cajas de personajes en pantalla: fuera de cuadro, tapados por la interfaz, solapados.
import sys, json, time
src = open('/home/claude/extra-o-en-castilla/production/CHAMELO/tools/pt_guion.py').read()
__file__ = '/home/claude/extra-o-en-castilla/production/CHAMELO/tools/pt_guion.py'
sys.argv = [sys.argv[0], '/home/claude/extra-o-en-castilla/builds/1248_CHAMELO_RC17.html', 'fa', 'todo']
SNAP = []
JS = '''(()=>{const G=LAB1248.G,E=LAB1248.E;if(!G.S||G.transitioning)return null;const S=G.S,out=[];
 for(const a of G.actorsInScene()){ if(a.visible===false) continue; const sc=S.depthScale(a.y)*(a.def.scale||1); const hb=E.actor.hitBox(a,sc);
   let x0=hb[0]-S.camX,x1=x0+hb[2],y0=hb[1],y1=hb[1]+hb[3]; if(E.rc07){const p=E.rc07.cam.toScreen(x0,y0),q=E.rc07.cam.toScreen(x1,y1);x0=p[0];y0=p[1];x1=q[0];y1=q[1];}
   out.push({id:a.id,x0:Math.round(x0),x1:Math.round(x1),y0:Math.round(y0),y1:Math.round(y1)}); }
 return {scene:S.def.id,cam:Math.round(S.camX),dlg:G.dialogue.active,notes:G.ui.notes.length,actors:out}})()'''
exec(src.split("ev('LAB1248.E.rc07")[0])
_settle = settle
def settle(maxs=60):
    r = _settle(maxs)
    s = ev(JS)
    if s: SNAP.append(s)
    return r
P.settle = settle
exec("ev('LAB1248.E.rc07" + src.split("ev('LAB1248.E.rc07", 1)[1].replace('P.close()', ''))
json.dump(SNAP, open('/tmp/claude-0/-home-claude-extra-o-en-castilla/79f9475d-2f84-589d-adcf-fe68a17a495d/scratchpad/frames.json', 'w'))
P.close()
