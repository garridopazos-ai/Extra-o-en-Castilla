"""G10 RC02 -> G11 COMPLETO RC01. Uso: python patch_g11.py <entrada.html> <salida.html>"""
import sys, os
HERE=os.path.dirname(os.path.abspath(__file__))
s=open(sys.argv[1],encoding='utf-8').read()
def sub(old,new,n=1):
    global s
    assert s.count(old)==n,('recuento',s.count(old),old[:80]); s=s.replace(old,new)
sub("Ribera → Aceña → Embarcadero · RC02","JUEGO COMPLETO · G11 · RC01",s.count("Ribera → Aceña → Embarcadero · RC02"))
s=s.replace("RIBERA → ACEÑA → EMBARCADERO · RC02","JUEGO COMPLETO · G11 · RC01")
sub("saveKey: '1248_g10_rc01_save_v1'","saveKey: '1248_g11_rc01_save_v1'")
sub("npc: { duran: '#c9e6ff', alfonso: '#ffd0b8' }","npc: { duran: '#c9e6ff', alfonso: '#ffd0b8', alfonso_b: '#ffd0b8', gil_a: '#d7d7e6', gil_b: '#d7d7e6', yucaf: '#ffe9a8', yucaf_alfar: '#ffe9a8', nuno_puerta: '#e2a8ff', nuno_casa: '#e2a8ff', nuno_aud: '#e2a8ff', sancha: '#ffd9e6', lope: '#ffb890', pregonero: '#ffd24d', benito: '#cfe8c0', mayordomo: '#a8c8ff' }")
sub("LAB01 · MOTOR · gráficos y textos provisionales","Juego completo · candidato G11 · arte provisional")
sub("'Reiniciar laboratorio'","'Reiniciar partida'",2)
sub("panel(ctx, 'Fin del laboratorio 01', [","panel(ctx, 'FIN · 1248 · Un extraño en Castilla', [")
sub("""          'La barca de Alfonso se aparta de la orilla.',
          'Talavera queda atrás, entre la bruma del Tajo.',
          '',""","""          'El horno de los Olleros se apaga con un último destello azul.',
          s.flags.nuno_derrotado ? 'Don Nuño de Mala-Cuenta carga cántaros hasta Toledo. A pie.' : 'Don Nuño sigue cobrando.',
          '',""")
sub("'Durán: ' + (s.relations.duran || 0) + ' · Alfonso: ' + (s.relations.alfonso || 0) + ' · Reputación: ' + s.reputation,","'Durán: ' + (s.relations.duran || 0) + ' · Alfonso: ' + (s.relations.alfonso || 0) + ' · Yuçaf: ' + (s.relations.yucaf || 0) + ' · Reputación: ' + s.reputation,")
ph=open(os.path.join(HERE,'g11_placeholders.js'),encoding='utf-8').read()
ct=open(os.path.join(HERE,'g11_content.js'),encoding='utf-8').read()
marker="<script>/* src/main.js */"
assert s.count(marker)==1
s=s.replace(marker,"<script>/* g11 placeholders */\n"+ph+"\n</script>\n<script>/* g11 content */\n"+ct+"\n</script>\n"+marker)
open(sys.argv[2],'w',encoding='utf-8').write(s); print('ok',len(s))
