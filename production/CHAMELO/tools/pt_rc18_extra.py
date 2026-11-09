# RC18 · comprobaciones jugadas breves: Mingo da la pista sin abrir panel; el menú de pausa no ofrece el mapa hasta tenerlo.
import sys, os, json, time
__file__ = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt_rc18.py')
src = open(__file__).read(); head = src.split("print('— 1) soto")[0]
exec(head)
said, dl = tap_listen('npc', 'mingo') if ev(f"!!{G}.sceneNpcs.find(n=>n.def.id==='mingo')") else ([], False)
print('Mingo antes de unirse:', said)
jump(A1, 'ribera', 'from_acena')
said, dl = tap_listen('npc', 'mingo')
ok(not dl and any(t.startswith('Yo que tú') for t in said), 'Mingo da la pista directamente, sin panel ' + str(said))
ev("delete LAB1248.state().flags.mapa_rai")
b = ev("LAB1248.button('menu')"); ev(f"LAB1248.tapScreen({b['x']},{b['y']})"); P.pg.wait_for_timeout(500)
ok(not ev("LAB1248.button('m-map')"), 'menú de pausa sin «Mapa de Talavera» antes de tenerlo'); P.shot(tag + '_menu_sin_mapa')
c = ev("LAB1248.button('m-save') || LAB1248.button('menu')"); ev(f"{G}.ui.overlay=null; {G}.pause(false)")
ev("LAB1248.state().flags.mapa_rai=true"); P.pg.wait_for_timeout(600); b = ev("LAB1248.button('menu')"); ev(f"LAB1248.tapScreen({b['x']},{b['y']})"); P.pg.wait_for_timeout(500)
ok(bool(ev("LAB1248.button('m-map')")), 'con el mapa de Rai, la entrada aparece')
ev(f"{G}.ui.overlay=null; {G}.pause(false)")
print('RESULTADO:', 'TODO OK' if not fails else f'{len(fails)} fallos: ' + '; '.join(fails)); P.close()
