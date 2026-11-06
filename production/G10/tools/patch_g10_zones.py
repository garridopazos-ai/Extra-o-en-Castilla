# ---------- ribera: zonas pulsables, camino inundado y salida (se ejecuta dentro de patch_g10.py; usa s y sub1) ----------
# 1) zonas que no coincidían con el dibujo
s=sub1("{ id: 'talavera', name: 'Talavera', rect: [700, 160, 1300, 175],","{ id: 'talavera', name: 'Talavera', rect: [60, 290, 1560, 160],",s)
s=sub1("{ id: 'fresno', name: 'Fresno', rect: [560, 190, 300, 420],","{ id: 'fresno', name: 'Fresno', poly: [[0, 0], [430, 0], [430, 330], [170, 330], [190, 650], [0, 700]],",s)
s=sub1("{ id: 'acena_ext', name: 'Tejado de la aceña', rect: [2190, 380, 380, 200],","{ id: 'acena_ext', name: 'Aceña', rect: [1680, 105, 500, 370],",s)
s=sub1("{ id: 'rocas', name: 'Piedras', rect: [1440, 660, 150, 60],","{ id: 'rocas', name: 'Piedras', rect: [1120, 700, 215, 95],",s)
# rueda vista desde fuera (antes no era pulsable)
s=sub1("        { id: 'exit_acena', name: 'Puerta de la aceña',","""        { id: 'rueda_ext', name: 'Rueda de la aceña', rect: [1630, 290, 230, 300], walkTo: [1760, 790],
          verbs: { look: [{ if: 'rueda_libre', then: [{ say: 'La rueda gira y el agua vuelve al caz.' }],
                           else: [{ say: 'La rueda está parada y el agua se sale del caz por el camino. Algo la bloquea.' }, { say: 'Tendré que mirarla desde dentro de la aceña.' }] }] } },
        { id: 'exit_acena', name: 'Puerta de la aceña',""",s)
# 2) huecos de nav que no correspondían a nada visible
s=sub1(" { id: 'tronco_fresno', poly: [[680, 690], [742, 690], [744, 714], [678, 714]] },\n          { id: 'rocas', poly: [[1450, 678], [1560, 672], [1580, 712], [1440, 716]] },\n","\n",s)
# 3) río: ya no se solapa con la orilla ni con la inundación
s=sub1("poly: [[0, 340], [2600, 340], [2600, 600], [0, 600]],\n          verbs: { look: [{ say: 'El Tajo. Más","poly: [[0, 455], [2600, 455], [2600, 600], [1900, 690], [1000, 705], [640, 690], [640, 600], [0, 600]],\n          verbs: { look: [{ say: 'El Tajo. Más",s)
# 4) salida al embarcadero: mayor y a pie de la orilla
s=sub1("rect: [0, 640, 95, 250], walkTo: [150, 735],","rect: [0, 600, 340, 300], walkTo: [150, 735],",s)
# 5) agua: la forma visible es la del suelo; el viajero se detiene en tierra firme (pasa por el borde ensanchado)
s=sub1("  D.scenes = {\n    // ===================================================== A · RIBERA","""  // Borde de paso: el contorno visible ensanchado ~34 px, para que el viajero (cuya sombra y pies tienen ancho) se pare en seco
  const floodNav = [[355, 534], [347, 544], [346, 554], [359, 583], [357, 621], [379, 678], [397, 693], [394, 719], [415, 753], [405, 789], [419, 812], [409, 847], [426, 874], [419, 896], [422, 900], [434, 900], [449, 900], [627, 900], [648, 900], [656, 900], [657, 896], [638, 852], [642, 818], [615, 789], [621, 775], [620, 765], [576, 690], [529, 644], [485, 609], [442, 543], [378, 528]];

  D.scenes = {
    // ===================================================== A · RIBERA""",s)
s=sub1("{ id: 'inundacion', when: '!rueda_libre', poly: floodEdge }","{ id: 'inundacion', when: '!rueda_libre', poly: floodNav }",s)
# 6) pintura del agua: toma agua real del río, orilla húmeda con espuma
i0=s.index("    if (!S.floodPaint) {")
i1=s.index("    const { paint, x, y } = S.floodPaint;")
NEWPAINT='''    if (!S.floodPaint) {
      const x = 340, y = 530, w = 316, h = 370;
      const paint = E.createCanvas(w, h);
      const g = paint.getContext('2d');
      const river = E.assets.get('ribera:bg');
      // orilla húmeda: barro oscuro que se difumina hacia fuera
      g.lineJoin = 'round';
      floodShape(g, flood, x, y);
      g.strokeStyle = 'rgba(58,45,28,.30)'; g.lineWidth = 34; g.stroke();
      g.strokeStyle = 'rgba(58,45,28,.42)'; g.lineWidth = 20; g.stroke();
      g.strokeStyle = 'rgba(48,38,24,.55)'; g.lineWidth = 9; g.stroke();
      g.save();
      floodShape(g, flood, x, y);
      g.clip();
      // base turbia y, encima, agua real recortada del río del fondo (misma luz, mismos reflejos)
      g.fillStyle = '#5b7a76'; g.fillRect(0, 0, w, h);
      if (river) {
        g.globalAlpha = .92;
        for (let k = 0, ty = 0; ty < h; ty += 92, k++) {   // teselas espejadas: sin costuras visibles
          g.save(); g.translate(0, ty + (k % 2 ? 92 : 0)); g.scale(1, k % 2 ? -1 : 1);
          g.drawImage(river, 770 + (k % 3) * 40, 575, 260, 108, 0, 0, w, 92); g.restore();
        }
        g.globalAlpha = .22; g.fillStyle = '#6b5a3a'; g.fillRect(0, 0, w, h);   // un poco de barro en suspensión
      }
      // espuma/reflejo en el borde interior
      g.globalAlpha = .55; g.strokeStyle = '#d9e4d6'; g.lineWidth = 3; floodShape(g, flood, x, y); g.stroke();
      g.globalAlpha = .25; g.lineWidth = 9; g.stroke();
      g.globalAlpha = 1; g.lineCap = 'round';
      const grain = (i, n) => ((Math.sin(i * 91.7 + n * 41.3) * 43758.5453) % 1 + 1) % 1;
      for (let i = 0; i < 160; i++) {
        const px = grain(i, 1) * w, py = grain(i, 2) * h, len = 3 + grain(i, 3) * 19;
        g.strokeStyle = i % 3 ? 'rgba(220,235,225,.20)' : 'rgba(30,60,64,.20)';
        g.lineWidth = .8 + grain(i, 4) * 2.2;
        g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + len * .42, py + len * .27, px + len * .73, py + len * .67); g.stroke();
      }
      g.restore();
      S.floodPaint = { paint, x, y };
    }
'''

s=s[:s.index("    if (!S.floodPaint) {")]+NEWPAINT+s[s.index("    const { paint, x, y } = S.floodPaint;"):]

s=sub1("        { say: 'Vale. Respira. Primero, averigua dónde estás.' }\n","        { say: 'Vale. Respira. Primero, averigua dónde estás.' },\n        { say: 'A la izquierda el camino se mete en el agua. A la derecha hay un molino de agua.' }\n",s)
