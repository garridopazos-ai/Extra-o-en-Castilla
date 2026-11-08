// CHAMELO RC09 · «Comer de verdad» y «Encontrar dónde dormir» (tramo 2 del plan).
// Plaza del Pan: Doña Sancha cambia pan por higos o por un número de juglar. Alfar: Yuçaf ofrece su pajar,
// noche con ronquidos de Mingo y un sueño con el móvil, y solo entonces el horno responde.
(function (E) {
  'use strict';
  const D = E.DATA, N = D.npcs, S = D.scenes, L = D.dialogues, I = D.items;
  const RC9 = E.rc09 = { night: 0, nightT: 0 };
  const say = (text, who) => who ? { say: text, who } : { say: text };
  const opt = (text, next, cond) => ({ text, next, if: cond });

  // ---------- acciones propias del guion: {rc09:'fadeout'|'fadein'|'night'|'day'|'snore'}
  RC9.act = (name, G) => {
    const U = G.ui;
    if (name === 'fadeout') { U.fadeTarget = 1; return () => U.fade >= 1; }
    if (name === 'fadein') { U.fadeTarget = 0; return () => U.fade <= 0; }
    if (name === 'night') { RC9.night = RC9.nightT = 0.62; return; }
    if (name === 'snore') { snore(); return; }
  };
  function snore() {
    try {
      const a = E.audio, ctx = a.ctx; if (!ctx || !a.master) return;
      for (let i = 0; i < 3; i++) {
        const t0 = ctx.currentTime + i * 1.15, o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(92, t0); o.frequency.exponentialRampToValueAtTime(52, t0 + 0.7);
        f.type = 'lowpass'; f.frequency.value = 260;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.16, t0 + 0.25); g.gain.linearRampToValueAtTime(0.0001, t0 + 0.8);
        o.connect(f); f.connect(g); g.connect(a.master); o.start(t0); o.stop(t0 + 0.9);
      }
    } catch (e) { /* sin audio, sin ronquidos */ }
  }

  // ---------- 1) HAMBRE: Doña Sancha y el «portazgo del pan»
  const COMER = RC9.COMER = [
    { set: ['hogaza_ganada', 'comido'] }, { sfx: 'success' },
    { note: '(Doña Sancha parte la hogaza en dos y le tiende la mitad más grande a Mingo, que ya tiene las dos manos abiertas.)' },
    say('¡Está caliente! ¡Y crujiente! ¿Quién me ha cambiado la vida?', 'mingo'),
    say('Come despacio. El pan no se va a ir. Salvo que lo vea Nuño.'),
    { note: 'Pan de verdad. Corteza de oro, miga que se estira. Después de siete uvas, esto es un banquete.' },
    say('Esto, en mi siglo, lo venderían en una tienda con luz de neón y una fila de ocho personas.'),
    say('¡Pues que se queden con la fila, que el pan es para comérselo!', 'mingo'),
    { rel: ['mingo', 1] },
    say('Ya está. Y ahora sí: hambre resuelta, que es la mitad de cualquier plan.'),
    say('Un consejo, forastero: si Nuño pregunta, lo hemos olido y nada más.', 'sancha')
  ];
  L.sancha.nodes.comprar = { lines: [
    ['sancha', 'Una hogaza vale un dinero. Más la tasa por «pan expuesto», dos. Más «pan con comprador a la vista», tres.'],
    ['sancha', 'Y la de «hambre manifiesta», cuatro. Cuatro dineros, hijo. Y se nota que traes hambre.'],
    ['player', 'No tengo ni un dinero. Tengo... cosas raras.'],
    ['sancha', 'Raras no pagan. Pero Nuño tasa dineros, no trueques. Si me traes algo que se pueda comer o que haga reír, ya veremos.']
  ], actions: [{ set: 'pan_caro' }], next: 'hub' };
  L.sancha.nodes.numero = { lines: [
    ['player', 'Soy juglar. Dame cinco minutos delante de tu puesto y te cambio una hogaza por un número.'],
    ['sancha', '¿Un número? ¿Con malabares? Aquí cuesta cuatro dineros hasta mirar a alguien con cariño.'],
    ['player', 'Sin malabares. Con una tablilla que enseña lo que tienes delante.']
  ], actions: [
    { note: '(Sacas el móvil, abres la cámara delantera y se la pones a Doña Sancha a un palmo.)' },
    say('¿Esa soy yo? ¿Tan pequeña? Pero... ¡mi toca! ¡Y el delantal, tan blanco! ¡Qué buena moza!', 'sancha'),
    say('¡Pregonero! ¡Ven a ver a la panadera dentro de una tablilla!', 'sancha'),
    say('¡Silencio, que lo enseña! ¡Ya está dentro! ¡No lo cobréis hasta que me enteré de qué es!', 'pregonero'),
    { note: '(Cuatro vecinos asoman. Mingo pasa el sombrero. Nadie ha visto nunca un espejo que mire.)' },
    say('Por ver cómo me ven los demás, sin pagar tasa... esto se paga, hijo. Hogaza entera. Y otra para el chiquillo: los niños flacos dan mala fama al pan.', 'sancha'),
    ...COMER
  ], next: 'hub' };
  L.sancha.nodes.hub.options.unshift(
    opt('Quisiera una hogaza.', 'comprar', { all: ['!comido', '!pan_caro'] }),
    opt('Hago un número a cambio de pan.', 'numero', { all: ['!comido', 'pan_caro'] }),
    opt('Dime otra vez el precio.', 'comprar', { all: ['!comido', 'pan_caro'] })
  );
  // el trueque con higos (los que coge Mingo en la higuera del soto)
  N.sancha.verbs['give:higos'] = [
    { if: 'comido', then: [say('Ya comimos, hijo. Guarda los higos para otro cantar.', 'sancha')], else: [
      { take: 'higos' },
      say('¡Higos morados del soto! Los de agosto, octubre y noviembre, que esa higuera no tiene calendario.', 'sancha'),
      say('Nuño tasa el pan por dinero, no por higos. Todavía. Trato hecho, y de prisa, antes de que alguien lo escriba.', 'sancha'),
      ...COMER] }
  ];
  N.sancha.verbs['give:telefono'] = [{ say: 'Eso lo dejas aquí y Nuño lo tasa. Mejor cuéntame qué hace; y enséñamelo.', who: 'sancha' }];
  // Mingo rumbo a la plaza: aviso de hambre la primera vez que se pisa
  S.plaza.firstEnter = (S.plaza.firstEnter || []).concat([
    { if: '!comido', then: [
      say('Huele a pan. Y eso que aún no estamos cerca.', 'mingo'),
      { note: 'OBJETIVO: comer de verdad. En el puesto de Doña Sancha hay pan, pero a precio de Nuño. Hay trueque: higos del soto o un buen número de juglar.' }] }]);

  // ---------- 2) LECHO: el pajar del alfar de Yuçaf
  I.higos.look = [{ say: 'Higos morados del soto. Quizá Doña Sancha los acepte mejor que a mí.' }];
  const hay = (g, w, h) => {
    const m = g.createRadialGradient(w / 2, h * 0.75, 4, w / 2, h * 0.75, w * 0.5); m.addColorStop(0, 'rgba(201,161,75,.95)'); m.addColorStop(0.7, 'rgba(184,138,56,.7)'); m.addColorStop(1, 'rgba(184,138,56,0)');
    g.fillStyle = m; g.beginPath(); g.ellipse(w / 2, h * 0.72, w * 0.46, h * 0.3, 0, 0, 7); g.fill();
    for (let i = 0; i < 260; i++) {
      const x = w * 0.06 + Math.random() * w * 0.88, y = h * 0.3 + Math.random() * h * 0.55, l = 18 + Math.random() * 26, a = -0.7 + Math.random() * 1.4 - Math.PI / 2 * 0;
      g.strokeStyle = ['#d8b45a', '#b88a38', '#e2c372'][i % 3]; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * 0.4); g.stroke();
    }
    g.fillStyle = 'rgba(30,18,6,.22)'; g.beginPath(); g.ellipse(w / 2, h - 6, w * 0.46, 8, 0, 0, 7); g.fill();
  };
  E.assets.registerPlaceholder('rc09_pajar', (w, h) => { const c = E.createCanvas(w, h); hay(c.getContext('2d'), w, h); return c; });
  const alfar = S.alfar;
  alfar.layers.push({ id: 'pajar', z: 'back', x: 1170, y: 720, w: 260, h: 78, placeholder: 'rc09_pajar' });
  const NO_DORMIR = [
    { if: { all: ['!final_listo'] }, then: [say('Todavía no. Tengo un juicio por delante y un recaudador al que humillar. La paja puede esperar.')], else: [
      { if: '!comido', then: [say('Mi estómago me está dando clases de música. No se duerme con hambre: antes, comer de verdad. Doña Sancha, en la plaza.')], else: [
        say('Ocho dineros por una cama con tres arrieros y una mula, dice Yuçaf. Con esto me conformo.'),
        { rc09: 'fadeout' }, { rc09: 'night' }, { sfx: 'door' }, { wait: 0.5 },
        { note: 'Paja que huele a verano. Encima, el techo del alfar. Dentro, el eco de todo un día.' },
        { rc09: 'snore' }, { wait: 0.6 },
        { note: 'Mingo ronca como un horno mal tirado. Dos ronquidos, y un silbido al final.' }, { wait: 1.4 },
        { note: 'SUEÑO: el móvil, debajo de la paja, enciende la pantalla: «1 % · Buscando red...». Una voz que se parece a la de Nuño cobra un dinero por mirar.' },
        { wait: 1.6 },
        { rc09: 'fadein' },
        { set: ['durmio', 'noche'] },
        say('¡Eh! ¡Despierta! ¡El horno! ¡Tiene luz dentro, y es azul!', 'mingo'),
        say('Hace un rato era color brasa. Ahora parece una pantalla encendida.'),
        say('Pues anda, antes de que el alfarero se levante y lo tase.', 'mingo'),
        { note: 'Es de noche. Acércate al horno y usa el móvil.' }
      ] }] }
  ];
  alfar.hotspots.splice(alfar.hotspots.findIndex(h => h.id === 'exit_plaza'), 0,
    { id: 'pajar', name: 'Pajar de Yuçaf', rect: [1170, 716, 260, 88], walkTo: [1215, 810],
      mingo: 'Paja limpia, calentita y gratis. Hasta Nuño tendría que inventarse una excusa.',
      verbs: { look: [{ say: 'Un montón de paja limpia, recogida junto a los sacos. Ni arrieros ni mulas. Gratis.' }],
        use: NO_DORMIR, 'use:mingo': [say('¡Yo primero! ¡El que se duerme el primero, se queda con el mejor hoyo!', 'mingo')] } },
    { id: 'sacos', name: 'Sacos de harina', rect: [1000, 545, 165, 130], walkTo: [1100, 800],
      verbs: { look: [{ say: 'Sacos de harina y de paja prensada. Suave, no. Pero cualquier cosa vale después de un día así.' }] } });
  // el horno solo responde de noche, después de dormir
  const horno = alfar.hotspots.find(h => h.id === 'horno');
  const sinNoche = [{ if: 'final_listo', then: [{ if: 'durmio', then: [{ event: 'final_horno' }], else: [
    say('El fuego aún es naranja y corriente. Dice Yuçaf que cambia al caer la noche. Y yo estoy tan cansado que ni mi móvil me responde. Antes, dormir.')] }],
    else: [{ say: 'Sin cobertura ni al lado de un horno. Qué manía.' }] }];
  horno.verbs.use = sinNoche; horno.verbs['use:telefono'] = sinNoche;
  // Yuçaf ofrece el pajar al llegar tras la Vista
  alfar.onEnter = (alfar.onEnter || []).concat([
    { if: 'final_listo', then: [{ once: 'lecho_ofrecido', do: [
      say('Hoy no pienses en el mesón. Ocho dineros la cama, con tres arrieros y una mula, y tasa por roncar.', 'yucaf_alfar'),
      say('Con la paga de la Pieza del Rey, estaría de sobra...'),
      say('Eso es lo que Nuño cree. Mi pajar es gratis y huele a verano. Tócalo cuando tengas sueño. ¿Has comido algo?', 'yucaf_alfar'),
      { note: 'OBJETIVO: comer de verdad (Doña Sancha, en la plaza) y dormir en el pajar del alfar.' }] }] }]);
  alfar.layers.find(l => l.id === 'pajar').visibleWhen = null;

  // ---------- pistas para los dos objetivos nuevos (delante de las del final)
  D.hints.unshift(
    { if: { all: ['final_listo', 'comido', 'durmio', { scene: 'alfar' }] }, obj: 'Usar el móvil en el horno', text: 'Es de noche y el horno arde azul. Acércate y usa el móvil sobre él.' },
    { if: { all: ['final_listo', 'comido', '!durmio', { scene: 'alfar' }] }, obj: 'Dormir en el pajar', text: 'Toca el pajar del alfar (a la derecha, junto a los sacos): Yuçaf te lo ofrece gratis.' },
    { if: { all: ['final_listo', 'comido', '!durmio'] }, obj: 'Encontrar dónde dormir', text: 'El mesón cobra ocho dineros por una cama. El pajar de Yuçaf, ninguno: vuelve al alfar (arco de la derecha de la plaza).' },
    { if: { all: ['final_listo', '!comido', 'pan_caro'] }, obj: 'Comer de verdad', text: 'Doña Sancha quiere dinero, que no tienes. Dale los higos de Mingo (usa el zurrón sobre ella) o haz un número: elige «Hago un número a cambio de pan».' },
    { if: { all: ['final_listo', '!comido'] }, obj: 'Comer de verdad', text: 'Antes de dormir, hay que comer. Habla con Doña Sancha en la plaza del pan: tiene hogazas a precio de Nuño.' }
  );

  // ---------- noche: atenuado azul con luz de horno (se pinta por encima de todo lo demás)
  const baseInstall = E.rc07 && E.rc07.install;
  if (baseInstall) E.rc07.install = G => {
    baseInstall(G);
    const draw0 = E.scene.draw;
    E.scene.draw = (ctx, Sc, G2) => {
      draw0(ctx, Sc, G2);
      const f = G.state.flags, id = Sc.def.id;
      RC9.nightT = f.noche ? 0.62 : (id === 'alfar' && f.final_listo ? 0.2 : 0);
      const dt = G.paused ? 0 : Math.min(0.05, G.lastFrameDt || 0.016);
      RC9.night += Math.sign(RC9.nightT - RC9.night) * Math.min(Math.abs(RC9.nightT - RC9.night), dt * 0.9);
      const n = RC9.night; if (n < 0.01) return;
      const C = E.CONFIG;
      ctx.save();
      ctx.fillStyle = 'rgba(8,14,46,' + n + ')'; ctx.fillRect(0, 0, C.W, C.H);
      if (id === 'alfar') {
        const t = performance.now() / 1000, glow = ctx.createRadialGradient(320, 600, 20, 320, 600, 560);
        const blue = f.noche && f.durmio;
        glow.addColorStop(0, blue ? 'rgba(70,150,255,' + (0.5 + 0.08 * Math.sin(t * 2.2)) + ')' : 'rgba(255,140,50,' + (0.5 + 0.06 * Math.sin(t * 7)) + ')');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = Math.min(1, n * 1.6); ctx.fillStyle = glow; ctx.fillRect(0, 0, C.W, C.H);
      }
      ctx.restore();
    };
  };
})(window.E1248);
