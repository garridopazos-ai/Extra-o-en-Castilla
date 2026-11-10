// CHAMELO RC21 · «El soto de noche» pasa a ser una escena propia con la imagen de César (claro de bosque, estanque y luna roja).
// De noche (noche_soto y aún sin requete_1) la orilla de día se salta: el soto de los Sifones es un sotobosque (soto = arboleda)
// y los conspiradores se reúnen en este claro. Los cuatro, el gato y el mapa se mudan aquí.
(function (E) {
  'use strict';
  const D = E.DATA, S = D.scenes, N = D.npcs;
  const say = text => ({ say: text });
  const OR = S.orilla, TB = S.taberna, DX = -2040;          // los conspiradores estaban en x≈2560–2780 de la orilla (4000 px); ahora en 520–740
  const NIGHT = { all: ['noche_soto', '!requete_1'] };

  // 1 · la escena
  const mapaLayers = OR.layers.filter(l => l.id === 'mapa_suelo' || l.id === 'mapa_roto');
  OR.layers = OR.layers.filter(l => !mapaLayers.includes(l));
  S.soto_noche = {
    id: 'soto_noche', name: 'El soto de noche · Sifones', width: 1600, height: 900, camera: 'fixed',
    depth: { yFar: 650, sFar: 0.74, yNear: 885, sNear: 1 }, ambientSound: { cutoff: 900, vol: 0.1 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/rc21/soto_noche.webp' }]
      .concat(mapaLayers.map(l => Object.assign({}, l))),
    ambient: [],
    walk: { outer: [[40, 692], [1560, 692], [1560, 770], [1290, 790], [1290, 862], [300, 862], [300, 822], [40, 800]], holes: [] },
    entries: { default: { x: 130, y: 770, facing: 'right' }, from_orilla: { x: 130, y: 770, facing: 'right' }, from_chamelo: { x: 1200, y: 760, facing: 'left' } },
    onEnter: [{ if: NIGHT, then: [{ wait: 0.6 }, say('Antorchas. Y cuatro señores que no se ponen de acuerdo en nada.')] }],
    hotspots: [
      { id: 'exit_ribera', name: 'Ribera', rect: [0, 640, 90, 245], walkTo: [45, 790], exit: { to: 'ribera', entry: 'from_orilla' }, verbs: { look: [say('Por ahí se vuelve a la ribera y a la aceña.')] } },
      { id: 'luna', name: 'Luna roja', rect: [1300, 30, 190, 150], walkTo: [1250, 790], verbs: { look: [say('Una luna roja como un ascua. Mala noche para fiarse de un mapa.')] } },
      { id: 'estanque', name: 'Estanque', rect: [1080, 520, 520, 140], walkTo: [1250, 790], verbs: { look: [say('Un estanque con la luna dentro. Ni el gato se atreve a beberla.')] } }
    ] };
  // el mapa del suelo: colocado respecto al cabecilla (antes 2600,722 → ahora 560,722)
  S.soto_noche.layers.forEach(l => { if (l.id === 'mapa_suelo') l.x = 560; if (l.id === 'mapa_roto') l.x = 550; });

  // 2 · mudanza de los conspiradores y del gato (coordenadas −2040 en x)
  for (const id of ['requete_a', 'requete_b', 'requete_c', 'requete_d', 'gato']) { const n = N[id]; if (!n) continue; n.scene = 'soto_noche'; n.start = [n.start[0] + DX, n.start[1]]; }
  { const g = N.gato.verbs.talk[0].else; g.forEach(st => { if (st.npcWalk && /^(gato|requete_)/.test(st.npcWalk[0])) st.npcWalk = [st.npcWalk[0], st.npcWalk[1] + DX, st.npcWalk[2]]; }); }

  // 3 · la orilla de día no se pisa de noche: se redirige al claro
  OR.onEnter = [{ if: NIGHT, then: [{ goto: ['soto_noche', 'from_orilla'] }] }];
  { const th = TB.onEnter[0].then, i = th.findIndex(x => x.goto && x.goto[0] === 'orilla'); if (i >= 0) th[i] = { goto: ['soto_noche', 'default'] }; }
})(window.E1248 = window.E1248 || {});
