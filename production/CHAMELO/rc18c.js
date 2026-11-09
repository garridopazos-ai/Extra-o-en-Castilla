// CHAMELO RC18c · Puzle del paloduz según el guion definitivo (docs/GUION_DEFINITIVO.md, Puzle 01):
// el paloduz se encuentra mirando el entorno cercano (una mata en la orilla del arroyo del Chamelo, con las raíces al aire),
// se recoge y se le da a Rai. Mingo deja de ser la «moneda» (dárselo a un brujo no se le ocurre a nadie): queda solo el chiste.
// Se carga tras rc18.js (y tras patch_rc18b.py). Arte: production/CHAMELO/tools/make_paloduz.py.
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues;
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const note = text => ({ note: text });
  const CHM = S.chamelo;

  // ---- objeto
  D.items.paloduz = { name: 'Paloduz', icon: 'assets/items/paloduz.png', look: [say('Raíz de paloduz: regaliz de verdad, con tierra incluida.')] };

  // ---- la mata en la orilla (siempre) y sus raíces al aire (hasta que las coges)
  CHM.layers.push(
    { id: 'paloduz_mata', z: 'back', x: 646, y: 552, w: 195, h: 163, src: 'assets/scenes/chamelo/paloduz_mata.png' },
    { id: 'paloduz_raiz', z: 'back', x: 646, y: 552, w: 195, h: 163, src: 'assets/scenes/chamelo/paloduz_raiz.png', visibleWhen: '!paloduz_cogido' });
  const COGER = [
    say('Tiro de una raíz… y sale entera. Huele a regaliz.'),
    { give: 'paloduz' }, { set: 'paloduz_cogido' }, { sfx: 'pick' },
    { if: 'mingo_sigue', then: [say('¡Paloduz! Eso se masca.', 'mingo')] }];
  CHM.hotspots.push(
    // raíces: zona de toque generosa y destello de objeto clave (keyPoints: pick + visibleWhen)
    { id: 'paloduz', name: 'Raíces de paloduz', rect: [662, 676, 166, 44], walkTo: [745, 730], visibleWhen: '!paloduz_cogido', verbs: {
      look: [say('Raíces amarillas al aire: el arroyo le ha comido la orilla a esa mata.')],
      pick: COGER } },
    { id: 'mata_paloduz', name: 'Mata de paloduz', rect: [688, 556, 122, 118], walkTo: [745, 730], mingo: 'Eso es paloduz. Se masca.', verbs: {
      look: [say('Una mata de hojas menudas y espigas lilas, con los pies en el arroyo.')],
      pick: [{ if: 'paloduz_cogido', then: [say('Ya tengo raíz. La mata, que siga a lo suyo.')], else: COGER }] } });

  // ---- Rai: pide paloduz y dice dónde crece; se le paga dándoselo o, simplemente, hablándole con él en el zurrón
  const TRATO = [
    say('Toma: paloduz de tu orilla.'),
    { take: 'paloduz' },
    note('(Rai lo muerde. Cierra los ojos. Suspira.)'),
    say('Paloduz de la vega. Gloria bendita.', 'leonor'),
    { if: 'mingo_sigue', then: [say('¿Quieres el mío? Está chupado, pero poco.', 'mingo')] },
    note('(Sin mirar, despliega un mapa. Del revés.)'),
    say('Está del revés.'),
    say('Para el que viene de lejos, todo está del revés.', 'leonor'),
    { set: ['pide_paloduz', 'mapa_rai'] }, { sfx: 'success' },
    say('¿Qué tal el viaje? …Digo, el camino.', 'leonor'),
    note('Nuevo: el mapa de Rai (botón de la derecha).')];
  // si coges la raíz antes de que Rai la pida, la petición va primero
  const CON_PETICION = [{ if: '!pide_paloduz', then: [say('Necesito saber dónde estoy. ¿Tienes un mapa?'),
    say('Mapas tengo. Pero el saber se paga en paloduz.', 'leonor'), say('Mira qué casualidad.')] }, ...TRATO];
  Object.assign(N.leonor.verbs, {
    talk: [{ if: { all: ['has:paloduz', '!mapa_rai'] }, then: CON_PETICION, else: [{ dialogue: 'rai17' }] }],
    'give:paloduz': CON_PETICION,
    'give:mingo': [{ if: 'mapa_rai', then: [say('A mí no me cambies por nada.', 'mingo')],
      else: [say('A mí no me cambies por un mapa. El paloduz está en la orilla del arroyo.', 'mingo')] }]
  });
  const R = L.rai17;
  R.start = [{ if: 'confesion', node: 'despues' }, { if: 'mapa_rai', node: 'mapa' }, { if: 'pide_paloduz', node: 'otra' }, { node: 'pide' }];
  R.nodes.pide.lines = [['player', 'Necesito saber dónde estoy. ¿Tienes un mapa?'], ['leonor', 'Mapas tengo. Pero el saber se paga en paloduz.'],
    ['leonor', 'Crece ahí, en la orilla del arroyo. A mí me da pereza agacharme.']];
  R.nodes.otra = { lines: [['leonor', 'Paloduz. En la orilla del arroyo: raíces amarillas. No tiene pérdida.']], next: 'end' };

  // ---- pistas del «?»
  const i = D.hints.findIndex(h => h.obj === 'Conseguir paloduz');
  const nuevas = [
    { if: { all: ['has:paloduz', '!mapa_rai'] }, obj: 'Pagar a Rai', text: 'Ya tienes el paloduz: habla con Rai.' },
    { if: { all: ['pide_paloduz', '!mapa_rai'] }, obj: 'Conseguir paloduz', text: 'Rai dice que crece en la orilla del arroyo, junto a la pasarela: busca unas raíces amarillas al aire.' }];
  if (i >= 0) D.hints.splice(i, 1, ...nuevas); else D.hints.unshift(...nuevas);
})(window.E1248);
