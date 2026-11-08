// CHAMELO RC10 · Elvira con motivo: pide consejo a Raimundo en el Chamelo y luego vende pan de aceña en la Plaza del Pan.
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues;
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const opt = (text, next, cond) => ({ text, next, if: cond });

  // ---------- 1) Aceña: por qué va al Chamelo
  N.elvira_aceña.verbs.talk = [{ if: 'rueda_libre', then: [
    say('Desde que Nuño le tasó la rueda, mi padre apenas habla. Voy al Chamelo a pedirle consejo a Raimundo: sabe todo lo que cruza el vado.', 'elvira_aceña'),
    say('Ven con Mingo; a Raimundo le cae bien. Eso, o le cae mal; con él nunca se sabe.', 'elvira_aceña')
  ], else: [
    say('La aceña está parada y el vado del Chamelo, inundado. Cuando vuelva a girar la rueda iré a pedirle consejo a Raimundo, que sabe de todo lo que pasa por el río.', 'elvira_aceña')
  ] }];
  N.elvira_aceña.presentWhen = '!chamelo_familia';   // tras la visita, Elvira baja a la villa

  // ---------- 2) Chamelo: la visita con motivo (se conservan los paseos del principio y el gag de la «familia»)
  const then = S.chamelo.onEnter[0].then, walks = then.filter(a => a.npcWalk);
  then.length = 0;
  then.push(...walks,
    say('Raimundo, perdona que llegue sin avisar. Vengo a pedirte consejo.', 'elvira'),
    say('¡Consejo! Lo mío es la miel y la prestidigitación. Pero bienvenidos, familia.', 'leonor'),
    say('¿Familia? No, no. Nosotros…'),
    say('Padre, me prometiste que hoy sí ibas a reconocerme.', 'mingo'),
    say('¿Y cómo se llama tu padre?', 'elvira'),
    say('No sé. Tú siempre le dices «ven un momento».', 'mingo'),
    say('Bueno, entrad. Tengo pan con miel.', 'leonor'),
    say('Mamá, ¿puedo coger dos?', 'mingo'),
    { note: 'Elvira y tú, a la vez: «Uno».' },
    say('¿Veis? Ya os sale solo.', 'mingo'),
    say('Raimundo, en serio. Mi padre lleva tres días sin hablar de la rueda desde que Nuño se la tasó, y no sé qué hacer.', 'elvira'),
    say('Mi consejo es en tres partes. Primera: anoche vi a alguien cruzar el vado con un saco. Cada vez que lo apoyaba en una piedra sonaba a barro cocido.', 'leonor'),
    say('¿Iba hacia la aceña?', 'elvira'),
    say('Sí. Y, al volver, el saco ya no sonaba.', 'leonor'),
    { set: 'pista_leonor' },
    say('Segunda: cuando alguien calla, no le preguntes; mira lo que carga. Tercera: baja a la villa. En la Plaza del Pan, lo que no se dice, se vende.', 'leonor'),
    say('Entonces bajaré con pan de la aceña. Vender es la mejor manera de oír.', 'elvira'),
    say('Te acompañamos. A la plaza, quiero decir.'),
    say('Padres juntos al mercado. ¡Qué ilusión de familia!', 'mingo'),
    { set: 'chamelo_familia' });

  // ---------- 3) Plaza del Pan: Elvira vende pan de aceña (es la misma Elvira: se muda a la plaza al llegar)
  N.elvira.verbs.talk = [{ if: 'elvira_en_plaza', then: [{ dialogue: 'elvira_plaza' }],
    else: [say('Quédate un rato, que luego bajo a la villa con pan de la aceña. Raimundo dice que allí se oye todo.', 'elvira')] }];
  N.elvira.verbs.look = [{ if: 'elvira_en_plaza', then: [say('Elvira, con un cesto de panes de aceña. Se nota que le gusta más hablar que vender.')], else: [say('Elvira. Tiene la manera de mirar de quien está pensando en tres cosas a la vez, y una de ellas no es la que dice.')] }];
  N.elvira.routines = [{ when: 'elvira_en_plaza', steps: [{ wait: 6 }, { bark: '¡Pan de aceña! ¡Sin tasa de aire ni tasa de mostrador!', every: 28 }] }];
  const place = [{ if: { all: ['chamelo_familia', '!elvira_en_plaza'] }, then: [
    { npcPlace: ['elvira', 'plaza', 650, 795, 'left'] }, { set: 'elvira_en_plaza' }] }];
  S.plaza.onEnter = place.concat(S.plaza.onEnter || []);
  const eat = [
    { set: ['hogaza_ganada', 'comido'] }, { sfx: 'success' },
    { note: '(Elvira parte una hogaza de aceña y te da la mitad. Mingo recibe la otra, con las dos manos.)' },
    say('¡Pan de molinera! ¡Y calentito! ¿Cuánto cuesta?', 'mingo'),
    say('Nada. Pero luego tendrás que decirle a Sancha que no me has visto.', 'elvira'),
    say('Esto, en mi siglo, lo venderían en una tienda con luz de neón y una fila de ocho personas.'),
    { rel: ['mingo', 1] },
    say('Pues ahora te toca una fila de una persona. Y la persona soy yo.', 'elvira'),
    { note: 'Elvira se ríe. Tú también. Mingo pone cara de haber visto un fantasma.' }];
  L.elvira_plaza = { npc: 'elvira', start: [{ node: 'hub' }], nodes: {
    hub: { lines: [['elvira', '¿Pan de aceña? Harina de mi padre, horno prestado de Doña Sancha y cero tasa: Nuño todavía no ha descubierto cómo cobrar por algo que se vende solo.']],
      options: [
        opt('Tengo hambre.', 'hambre', '!comido'),
        opt('¿Qué te dijo Raimundo?', 'rai'),
        opt('¿Y tu padre?', 'padre'),
        opt('Luego hablamos.', 'end')] },
    hambre: { lines: [['elvira', 'Hombre, eso se arregla. Toma.']], actions: eat, next: 'hub' },
    rai: { lines: [['elvira', 'Que mire lo que carga quien calla. Y que lo que no se dice en la plaza, se vende.'],
      ['elvira', 'Y que a veces el mejor consejo es el que viene contigo a la plaza. Eso último lo ha dicho mirándote.'],
      ['player', 'Raimundo es un hombre muy observador.'], ['elvira', 'Y muy pesado. Con cariño.']], next: 'hub' },
    padre: { lines: [['elvira', 'Duerme poco y hace como que no le importa la rueda. Si ve que me ríes los chistes... se le pasa la mitad.'],
      ['player', 'Entonces voy a tener que contar mejores chistes.']], next: 'hub' } } };

  // ---------- hambre: pista con la tercera vía
  for (const h of D.hints) if (h.obj === 'Comer de verdad') h.text += ' Si ya has estado en el Chamelo, Elvira vende pan de aceña en la plaza.';
})(window.E1248);
