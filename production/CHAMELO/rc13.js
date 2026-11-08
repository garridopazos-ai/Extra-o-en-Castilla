// CHAMELO RC13 · Rai consulta el caldero (viñeta con el clip de César) y el viejo soldado en el atrio de Santa María.
// Material: assets/source_clips/rai_hechizo_caldero_1000703343.mp4 (→ art/videos/rai_caldero.mp4, viñeta),
//           soldado_reposo_1000703352.mp4 + soldado_habla_1000703353.mp4 (→ art/personajes/viejo_soldado/hoja.webp, tools/build_char.py).
// El nombre «Raimundo» pasa a «Rai» en todo el juego (lo hace rc07.js al instalar, sobre todos los textos).
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues;
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const opt = (text, next, cond) => ({ text, next, if: cond });
  const pingpong = n => { const a = []; for (let i = 0; i < n; i++) a.push(i); for (let i = n - 2; i > 0; i--) a.push(i); return a; };

  // ---------- 1) Chamelo: antes del consejo, Rai le pregunta al caldero
  const then = S.chamelo.onEnter[0].then;
  const k = then.findIndex(a => a.say && /en serio/.test(a.say) && a.who === 'elvira');
  if (k >= 0) then.splice(k + 1, 0,
    say('Para eso no basta con miel. Un momento: le pregunto al caldero.', 'leonor'),
    say('¿Qué caldero?'),
    { vineta: ['rai_caldero', 'El caldero de Rai'] },
    say('Ese caldero.', 'leonor'),
    say('¿De dónde ha salido? ¿Y adónde se ha ido?', 'mingo'),
    say('De donde salen todos: de ninguna parte. Y se ha ido sin pagar portazgo, que es lo más mágico que verás hoy.', 'leonor'),
    say('Bien. El caldero dice…', 'leonor'));
  // repetir el truco después
  const rai = N.leonor;
  rai.verbs.talk = [{ if: 'pista_leonor', then: [{ dialogue: 'rai' }], else: rai.verbs.talk }];
  L.rai = { npc: 'leonor', start: 'hub', nodes: {
    hub: { lines: [['leonor', 'Si vais río arriba, cerrad la cancela. Las abejas tienen mejor educación que las cabras.']],
      options: [opt('¿Me enseñas otra vez el truco del caldero?', 'caldero'), opt('¿Por qué «Rai»?', 'nombre'), opt('Nada, gracias.', 'end')] },
    caldero: { lines: [['leonor', 'Los trucos buenos no se repiten. Los malos, todos los días. Mira.']], actions: [{ vineta: ['rai_caldero', 'El caldero de Rai'] }, say('¿Lo ves? Tampoco ha pagado portazgo esta vez.', 'leonor')], next: 'hub' },
    nombre: { lines: [['leonor', 'Porque así cabe en la túnica. Mi madre quería ponerme Raimundo de las Tres Abejas, pero no había tela.']], next: 'hub' } } };

  // ---------- 2) El viejo soldado (atrio de Santa María)
  D.characters.soldado = {
    name: 'Viejo soldado', height: 328, speed: 110, orient: 'lr', hit: [-60, -300, 120, 300],
    sprite: { src: 'assets/characters/soldado/hoja.webp', placeholderOpts: { skin: '#d9a685', top: '#b8452f', apron: '#e2c99a' },
      sheet: { frameW: 192, frameH: 288, cols: 8, anchor: [96, 280], baseFacing: 'right', anims: {
        idle_right: { row: 0, frames: 30, fps: 6, seq: pingpong(16) },
        talk_right: { row: 2, frames: 46, fps: 8, seq: pingpong(24) } } } }
  };
  N.soldado = {
    id: 'soldado', name: 'Viejo soldado', character: 'soldado', scene: 'iglesia', start: [1160, 786], facing: 'left', talkDistance: 135,
    routines: [{ steps: [{ wait: 9 }, { bark: '¡Alto! ¿Quién va? …Ah, una paloma. Pase, pase.', every: 40 }, { wait: 12 },
      { bark: 'En Las Navas no había tasas. Había moros, calor y moscas. Pero tasas, ninguna.', every: 50 }] }],
    verbs: {
      talk: [{ dialogue: 'soldado' }],
      look: [say('Un soldado viejo, con más remiendos que cota de malla y una lanza a la que le falta la parte que pincha.')],
      'give:badajo': [say('¿La lengua de la campana? Eso, a fray Benito. Yo solo la vigilo. Bueno, la vigilaba.', 'soldado')],
      'give:higos': [say('Higos del soto… En Sevilla comíamos higos secos y suela de bota. Guárdalos, que tú estás más flaco.', 'soldado')]
    }
  };
  L.soldado = { npc: 'soldado', start: [{ if: '!soldado_conocido', node: 'intro' }, { node: 'hub' }], nodes: {
    intro: { lines: [['soldado', '¡Alto! ¿Quién va?'], ['player', 'Un… forastero. Desarmado. Y con hambre.'],
      ['soldado', 'Perdona, paisano. Treinta y seis años de guerra y todavía le doy el alto a las palomas.']], actions: [{ set: 'soldado_conocido' }], next: 'hub' },
    hub: { lines: [['soldado', '¿Qué se te ofrece?']],
      options: [opt('¿Quién sois?', 'quien'), opt('¿Vigiláis la campana?', 'campana'), opt('¿Qué significan los toques?', 'toques'),
        opt('¿Y la punta de vuestra lanza?', 'lanza'), opt('¿Qué sabéis de Don Nuño?', 'nuno'), opt('Nada, gracias.', 'adios')] },
    quien: { lines: [['soldado', 'Soldado del rey. Estuve en Las Navas de Tolosa, en el año doce. Era joven, tenía la lanza entera y todos los dientes.'],
      ['soldado', 'Ahora vuelvo del cerco de Sevilla: el rey Fernando sigue allí, apretando. A mí me mandaron a casa por viejo… y a vigilar esta campana.']], next: 'hub' },
    campana: { lines: [['soldado', 'Me lo encargó el concejo. Nadie me dijo que había que vigilar también el badajo.']], actions: [{ if: 'campana_arreglada',
      then: [say('Ya tiene su lengua otra vez. Ahora vigilo que nadie la toque cuatro veces: con cuatro viene el superior de fray Benito.', 'soldado')],
      else: [say('Se lo llevó Lope, el herrero, «a soldar». Le di el alto. Me dio los buenos días. Empate.', 'soldado')] }], next: 'hub' },
    toques: { lines: [['soldado', 'Uno, se abren los puestos. Dos, se recoge. Tres, todo el mundo a la Vista, y allí hasta el alguacil tiene que dar la cara.'],
      ['soldado', 'En mi tiempo, tres toques era «¡a las armas!». Ahora es «¡a los papeles!». Talavera ha cambiado mucho.']], next: 'hub' },
    lanza: { lines: [['soldado', 'Se partió en Jaén, contra una muralla muy terca. La punta se la quedó la muralla; el palo, yo. Es más fiel que muchos.']], next: 'hub' },
    nuno: { lines: [['soldado', 'Nuño no ha visto una batalla en su vida. Cuando sonaban los cuernos, él contaba los carros de la intendencia… y les ponía tasa.'],
      ['soldado', 'Si alguna vez lo pillas en un renuncio, pídelo en Vista pública. Delante de todos, hasta los sinvergüenzas se ponen derechos.']], next: 'hub' },
    adios: { lines: [['soldado', 'Circula, paisano. Y si ves a Nuño, dile que la guerra se hace con hierro, no con tasas.']], next: 'end' } } };
})(window.E1248);
