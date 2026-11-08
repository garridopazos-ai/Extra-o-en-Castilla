// CHAMELO RC15 · Arte de César para La Taberna del Miedo: exterior en la Corredera del Cristo (porche con tertulia pintada,
// muralla, torre con arco, cipreses) e interior (barra, chimenea, mesas, escalera). El soldado y sus dos oyentes pasan dentro.
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues;
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const opt = (text, next, cond) => ({ text, next, if: cond });

  // ---------- exterior (1600×900, cámara fija)
  S.corredera = {
    id: 'corredera', name: 'Corredera del Cristo', width: 1600, height: 900, camera: 'fixed',
    depth: { yFar: 718, sFar: 0.55, yNear: 800, sNear: 0.62 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 1600, h: 900, src: 'assets/scenes/corredera/exterior.jpg' }],
    ambient: [],
    walk: { outer: [[20, 720], [1585, 720], [1585, 800], [20, 800]],
      holes: [{ id: 'toneles', poly: [[500, 720], [660, 720], [660, 758], [500, 758]] }, { id: 'banco', poly: [[20, 720], [282, 720], [282, 754], [20, 754]] }] },
    entries: { default: { x: 1540, y: 765, facing: 'left' }, from_puerta: { x: 1540, y: 765, facing: 'left' }, from_taberna: { x: 385, y: 774, facing: 'right' } },
    firstEnter: [{ note: 'Corredera del Cristo. La muralla vieja, una torre con su arco… y una taberna con un nombre muy poco tranquilizador.' },
      say('«La Taberna del Miedo». Pues buen sitio para quedar con alguien.')],
    hotspots: [
      { id: 'exit_puerta', name: 'Ronda de la muralla: Puerta del Río', rect: [1530, 540, 70, 270], walkTo: [1565, 768], exit: { to: 'puerta_rio', entry: 'from_corredera' } },
      { id: 'porche', name: 'Porche de la taberna', rect: [268, 530, 228, 215], walkTo: [385, 774], exit: { to: 'taberna', entry: 'from_corredera' },
        verbs: { look: [say('En el porche, un abuelo de barba blanca cuenta una batalla a una pareja que no se atreve a parpadear.'), say('Dentro se oye más jaleo. Y huele a leña y a guiso.')],
          talk: [say('Perdón, ¿se puede…?'), { note: '«¡Chsss! Que ahora viene lo de los cuarenta jinetes», te suelta la moza del porche sin apartar los ojos del abuelo. Mejor entrar.' }] } },
      { id: 'letrero', name: 'Letrero de la taberna', rect: [505, 455, 135, 125], walkTo: [575, 774], verbs: { look: [
        say('«La Taberna del Miedo». Con una jarra pintada debajo: por lo visto, el miedo se cura con espuma.')] } },
      { id: 'farol', name: 'Farol', rect: [652, 498, 48, 74], walkTo: [640, 774], verbs: { look: [say('Un farol encendido en pleno día. O el tabernero es muy previsor, o muy miedoso. Con ese nombre, apuesto por lo segundo.')] } },
      { id: 'toneles', name: 'Toneles', rect: [498, 612, 165, 145], walkTo: [585, 776], verbs: { look: [say('Toneles con un mantel de cuadros encima. La mesa más honrada de Talavera: no cobra por sentarse.')],
        pick: [say('Con lo que pesa uno de estos, me ganaría la amistad del tabernero y una hernia.')] } },
      { id: 'escudo', name: 'Escudo de la cruz', rect: [142, 572, 56, 66], walkTo: [175, 772], verbs: { look: [say('Un escudo con una cruz roja. Aquí paran soldados y peregrinos. Y ahora, un señor del siglo XXI.')] } },
      { id: 'vid', name: 'Parra', rect: [0, 496, 205, 80], walkTo: [120, 772], verbs: { look: [say('Una parra con racimos. Mingo ya los ha contado. Dos veces.')], pick: [say('Sin permiso, no. Ya he visto lo que pasa en este siglo con las uvas ajenas.')] } },
      { id: 'torre', name: 'Torre y muralla', rect: [540, 110, 920, 190], verbs: { look: [
        say('La muralla vieja, con su torre y su arco. Las torres de esta calle están adelantadas a la muralla: si el enemigo sube al adarve, ellas siguen aguantando solas.'),
        say('Como el abuelo del porche: lo rodeas de gente y sigue contando.')] } },
      { id: 'arco', name: 'Arco de la muralla', rect: [830, 300, 250, 435], walkTo: [955, 752], verbs: {
        look: [say('Por el arco se ve el otro recinto de la villa, cuesta arriba.')],
        use: [say('Desde lo alto de la torre alguien me silba y me señala hacia la Puerta del Río. Entendido: por aquí no.')] } },
      { id: 'cipreses', name: 'Cipreses', rect: [1190, 190, 220, 555], walkTo: [1300, 772], verbs: { look: [say('Dos cipreses muy serios. En este siglo hasta los árboles parecen de guardia.')] } },
      { id: 'arbol', name: 'Árbol', rect: [0, 0, 460, 165], verbs: { look: [say('Un árbol con hojas de otoño. Caen despacio, como si no tuvieran prisa por llegar a 2026.')] } }
    ]
  };

  // ---------- interior (2700×900, la cámara sigue al viajero)
  S.taberna = {
    id: 'taberna', name: 'La Taberna del Miedo', width: 2700, height: 900, camera: 'follow',
    depth: { yFar: 745, sFar: 0.88, yNear: 812, sNear: 0.97 },
    layers: [{ id: 'bg', z: 'back', x: 0, y: 0, w: 2700, h: 900, src: 'assets/scenes/taberna/bg.webp' }],
    ambient: [],
    walk: { outer: [[40, 745], [2660, 745], [2660, 815], [40, 815]], holes: [] },
    entries: { default: { x: 240, y: 785, facing: 'right' }, from_corredera: { x: 240, y: 785, facing: 'right' } },
    firstEnter: [say('Dentro hace calor, huele a leña y alguien está contando la batalla de Las Navas. Otra vez.')],
    hotspots: [
      { id: 'exit_corredera', name: 'Salir a la Corredera', rect: [20, 330, 200, 410], walkTo: [150, 785], exit: { to: 'corredera', entry: 'from_taberna' } },
      { id: 'barra', name: 'Barra', rect: [290, 540, 640, 200], walkTo: [600, 785], verbs: {
        look: [say('Una barra con dos toneles de vino, jarras y taburetes. Nadie atiende: el tabernero está fuera, en el porche, escuchando batallas.')],
        use: [say('¿Hola? ¿Tabernero? …Nada. En el siglo XXI pondría una campanita. Aquí pondría una campana de Santa María.')] } },
      { id: 'toneles_barra', name: 'Toneles de vino', rect: [340, 400, 270, 140], walkTo: [470, 785], verbs: { look: [say('Dos toneles con grifo. Uno dice «tinto» y el otro también, pero más bajito.')], use: [say('Servirme yo solo sería robar. Y robar en una taberna que se llama «del Miedo» me da… miedo.')] } },
      { id: 'botellas', name: 'Estante de botellas', rect: [620, 340, 230, 200], walkTo: [730, 785], verbs: { look: [say('Botellas de barro y de vidrio. El vidrio, en 1248, es un lujo: aquí lo deben usar para presumir.')] } },
      { id: 'chimenea', name: 'Chimenea', rect: [1290, 370, 320, 240], walkTo: [1450, 790], verbs: { look: [say('Una chimenea que calienta media taberna. La otra media la calientan las mentiras del soldado.')], use: [say('Me caliento las manos. En mi tiempo esto era un emoticono de fuego; aquí, una forma de vida.')] } },
      { id: 'mesa', name: 'Mesa junto al fuego', rect: [1140, 600, 360, 140], walkTo: [1320, 792], verbs: { look: [say('La mesa buena, la del fuego. Con un mantel con una equis: o es un adorno, o alguien marcó dónde no sentarse.')] } },
      { id: 'ventana', name: 'Ventana', rect: [900, 330, 110, 120], walkTo: [960, 785], verbs: { look: [say('Una ventanita con reja. Se ve un trozo de campo y un trozo de cielo: lo justo para acordarse de que hay vida fuera.')] } },
      { id: 'escudos', name: 'Escudos y estandartes', rect: [60, 120, 110, 160], walkTo: [200, 785], verbs: { look: [say('Escudos viejos y estandartes con una torre. Decoración de taberna de soldados: todo lo que no se perdió en una batalla se cuelga aquí.')] } },
      { id: 'mesa_fondo', name: 'Mesa del fondo', rect: [1830, 560, 290, 150], walkTo: [1970, 790], verbs: { look: [say('La mesa del fondo, con una jarra a medias. El que la dejó así volverá. Siempre vuelven.')], pick: [say('Una jarra a medias es una promesa. No me la llevo.')] } },
      { id: 'cajas', name: 'Cajas', rect: [2200, 510, 210, 230], walkTo: [2300, 790], verbs: { look: [say('Cajas de madera con una equis. Aquí las equis significan «no tocar». Lo sé por experiencia de hace un minuto.')], pick: [say('Pesan como si dentro hubiera más cajas.')] } },
      { id: 'escalera', name: 'Escalera', rect: [2160, 130, 500, 610], walkTo: [2560, 790], verbs: {
        look: [say('Arriba están las camas. Abajo, los que no pueden pagarlas.')],
        use: [say('Al primer peldaño cruje. Al segundo, desde arriba, una voz: «¡Ocupado!». Todo ocupado. Hasta el miedo duerme acompañado.')] } }
    ]
  };

  // ---------- el soldado y sus oyentes, junto al fuego
  Object.assign(N.soldado, { scene: 'taberna', start: [1470, 795], facing: 'left' });
  Object.assign(N.arriero, { scene: 'taberna', start: [1150, 790], facing: 'right' });
  Object.assign(N.peregrina, { scene: 'taberna', start: [1265, 806], facing: 'right' });
  if (E.rc14) E.rc14.scene = 'taberna';
  // la tertulia del porche (pintada) es de otro abuelo: Fortún, rival del soldado
  const sd = L.soldado.nodes;
  sd.hub.options.splice(sd.hub.options.length - 1, 0, opt('¿Y el abuelo que cuenta batallas en el porche?', 'fortun'));
  sd.fortun = { lines: [['soldado', '¿Fortún? Ese cuenta Las Navas con espada. Mentira: la espada la llevaba yo. Él llevaba el queso.'],
    ['arriero', 'Él dice lo mismo de ti.'], ['soldado', 'Por eso nos sentamos uno dentro y otro fuera. Si no, la taberna sería un campo de batalla. Y sin queso.']], next: 'hub' };
})(window.E1248);
