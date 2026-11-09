// CHAMELO RC16 · Amor inesperado con Elvira: tres momentos cortos en la Plaza del Pan y un gesto decisivo en la Vista contra Nuño.
// 1) «¿Y tú qué?» (la tablilla, el siglo XXI)  2) tras convocar la Vista: ella trae el recibo de la tasa de la rueda (cántaro boca abajo)
// 3) tras ganar a Nuño: la despedida. El recibo es una vía ALTERNATIVA para la Vista (no bloquea la anterior).
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues, I = D.items;
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const opt = (text, next, cond) => ({ text, next, if: cond });

  // ---------- objeto: recibo de la tasa de la rueda (arte provisional dibujado)
  I.recibo_tasa = { name: 'Recibo de la tasa de la rueda', short: 'Recibo',
    look: [{ say: 'Un recibo de pergamino: «Por haber tenido una rueda, tres dineros». Sellado con un cántaro boca abajo. Lo ha traído Elvira y lo ha puesto en mi mano con más cuidado del que pide un recibo.' }] };
  E.assets.registerPlaceholder('item_recibo_tasa', (w, h) => {
    const c = E.createCanvas(w, h), g = c.getContext('2d');
    g.save(); g.translate(w / 2, h / 2); g.rotate(-0.12);
    g.fillStyle = '#e9d6a2'; g.fillRect(-30, -38, 60, 76); g.strokeStyle = '#8c6b3a'; g.lineWidth = 3; g.strokeRect(-30, -38, 60, 76);
    g.fillStyle = '#5b4524'; for (let i = 0; i < 5; i++) g.fillRect(-21, -27 + i * 9, 42 - (i % 2) * 12, 3);
    g.fillStyle = '#9f3428'; g.beginPath(); g.arc(14, 24, 9, 0, 6.3); g.fill();
    g.fillStyle = '#e9d6a2'; g.fillRect(9, 20, 10, 4);   // cántaro boca abajo (marca)
    g.restore(); return c;
  });

  // ---------- Plaza: tres momentos con Elvira (dentro de su diálogo de la plaza)
  const nodes = L.elvira_plaza.nodes, hub = nodes.hub;
  hub.lines = [['elvira', '¿Pan de aceña? Harina de mi padre, horno prestado de Doña Sancha y cero tasa: Nuño todavía no ha descubierto cómo cobrar por algo que se vende solo.', '!amor1'],
    ['elvira', '¿Otra vez tú? Cuidado: a este paso Doña Sancha me cobra a mí la tasa de tener público.', 'amor1']];
  const extra = [
    opt('Cuéntame algo de ti, Elvira.', 'amor1', '!amor1'),
    opt('¿Has oído algo de Nuño y la Vista?', 'amor2', { all: ['vista_convocada', 'amor1', '!amor2'] }),
    opt('Ya está: Nuño ha pagado.', 'amor3', { all: ['final_listo', 'amor2', '!amor3'] })];
  hub.options.splice(hub.options.length - 1, 0, ...extra);

  nodes.amor1 = { lines: [
    ['elvira', 'De mí no hay mucho que contar. Molo harina, amaso, y me dicen que hablo demasiado. ¿Y tú? Llegaste con la ropa de otra parte y una tablilla que se enciende.'],
    ['player', 'Vengo de muy lejos. De un sitio donde el pan viene en bolsa y a nadie le tiembla la mano al abrirla.'],
    ['elvira', '¿En bolsa? Entonces, en tu tierra, el pan no se pelea. Qué soledad de pan.'],
    ['player', 'Pues sí. Aquí huele mejor, y se discute más.'],
    ['elvira', 'Aquí cuando alguien llega de lejos, la gente lo mira de lado. Tú miras el pan. Es un buen comienzo.'],
    ['mingo', '(a media voz, a la hogaza) Yo estoy aquí. Por si alguien lo quiere saber.']],
    actions: [{ set: 'amor1' }, { rel: ['mingo', 1] }, { note: 'Elvira sonríe a su cesto. Tú también. Ninguno de los dos mira al otro, que es exactamente cómo se nota.' }], next: 'hub' };

  nodes.amor2 = { lines: [
    ['elvira', 'Algo mejor que oírlo: lo llevo en el cesto. Nuño le tasó la rueda a mi padre y le dio un recibo. Con su sello, el cántaro boca abajo. Mi padre lo guardó en la artesa de la harina para no verlo.'],
    ['player', 'Entonces el sello de Nuño ya figura en un papel que no ha podido falsificar a su gusto.'],
    ['elvira', 'Tómalo. Úsalo bien. Y vuelve de una pieza: el aceñero ya tiene demasiadas ruedas paradas en casa.'],
    ['elvira', '(le pone el recibo en la mano y la deja un instante demasiado cerca de la suya)']],
    actions: [{ give: 'recibo_tasa' }, { set: 'amor2' }, { sfx: 'success' },
      { note: 'Mingo, en voz muy alta y con cara de inocencia: «¡Qué recibo tan largo! ¡Cuánto tiempo hace falta para sostener un recibo!»' },
      say('Mingo, cállate y come pan.', 'elvira')], next: 'hub' };

  nodes.amor3 = { lines: [
    ['elvira', 'Lo he oído desde la panadería. La plaza entera lo ha oído. Hasta Nuño, que no sabía que se podía pagar sin cobrar a nadie.'],
    ['player', 'Si el horno de Yuçaf hace lo que cree, quizá me llame pronto.'],
    ['elvira', 'No me lo digas. No me gustan las despedidas con explicaciones. Pero si alguna vez el mundo te trae de vuelta por el vado, que sepas que a la hora de comer hay pan en la aceña.'],
    ['player', 'Si vuelvo, llegaré con hambre.'],
    ['elvira', 'Entonces ya sabes cómo reconocerme: la que habla demasiado y ha guardado una hogaza para ti.']],
    actions: [{ set: ['amor3', 'hogaza_viaje'] }, { rel: ['mingo', 1] }, { sfx: 'success' },
      { note: 'Elvira te deja una hogaza envuelta en un paño. Pesa menos de lo que parece, y mucho más de lo que dice.' },
      say('Mingo no dice nada. Es la primera vez. Mingo también sabe despedirse.', 'mingo')], next: 'hub' };

  // ---------- Vista: el recibo como vía alternativa a (cartel + sello del alguacil)
  const may = L.mayordomo.nodes;
  may.recibo = { lines: [
    ['player', 'Presento el recibo de la rueda de Durán, sellado por el propio Nuño.'],
    ['mayordomo', 'Un cántaro boca abajo. Y es el mismo cántaro que firma la cancelación del cartel que alguien dice haber tachado. Nuño, ¿es vuestro este cántaro?'],
    ['nuno_aud', '¡Es… un cántaro muy parecido al mío! ¡Un cántaro que sin duda está de mi parte!'],
    ['mayordomo', 'Queda reconocido. Dos veces. ¿Qué dice la cláusula de la función?']],
    actions: [{ note: 'En la tribuna, una moza con el cesto del pan levanta la mano discretamente. Nadie sabe cuándo ha llegado. Tú sí.' }],
    options: [opt('Quien la suspenda paga la Pieza del Rey.', 'paga'), opt('Quien tenga el sello se queda con la plaza.', 'plaza')] };
  may.testigo.options.unshift(opt('Traigo el recibo de la rueda: lleva su cántaro boca abajo.', 'recibo', 'has:recibo_tasa'));

  // ---------- epílogo en el alfar: un guiño si hubo despedida
  S.alfar.onEnter = (S.alfar.onEnter || []).concat([{ if: { all: ['amor3', '!amor_alfar'] }, then: [
    { set: 'amor_alfar' },
    say('Yuçaf, ¿tú sabes qué lleva Mingo en la boca?', 'yucaf_alfar'),
    say('Pan de aceña. No me preguntes más; es lo único que me han dejado en paz hacer hoy.', 'mingo')] }]);

  // ---------- pistas
  const i = D.hints.findIndex(h => h.obj === 'Ganar la Vista Pública');
  D.hints.splice(i + 1, 0,
    { if: { all: ['vista_convocada', 'has:bando', '!has:recibo_tasa', 'elvira_en_plaza', 'amor1', '!amor2'] }, obj: 'Hablar con Elvira antes de la Vista', text: 'Elvira, en la Plaza del Pan, te dijo que de lo que no se dice se oye mucho. Pregúntale por Nuño y la Vista: puede traerte una prueba extra.' },
    { if: { all: ['vista_convocada', 'has:recibo_tasa'] }, obj: 'Ganar la Vista Pública', text: 'Con el recibo de la rueda y el cartel (o con el sello del alguacil) basta. Ve a la Vista Pública y habla con el mayordomo; tu testigo es Per de la Voz.' });
})(window.E1248);
