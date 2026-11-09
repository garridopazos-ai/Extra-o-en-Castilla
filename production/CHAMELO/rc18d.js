// CHAMELO RC18d · Rai-gato con el arte de César: gato gris con bufanda roja y estrella (clips sobre verde → tools/build_gato.py).
// Sustituye al gato negro dibujado por código: anda (ciclo por distancia), se sienta, se queda sentado con sus vistazos,
// guiña de verdad en la Requeteconquista y cierra los ojos, satisfecho, en el regreso. Se carga tras rc18c.js.
(function (E) {
  'use strict';
  const D = E.DATA, CH = D.characters, N = D.npcs, R17 = E.rc17;
  const SHEET = /*HOJA_GATO*/null;

  // ---- personaje: hoja de sprites en lugar del dibujo procedural (sin rig → lo pinta el motor de sprites)
  // 136 px de «alto de hoja» en el mundo = unos 105 px de orejas a patas al andar (un tercio del viajero: gato de dibujo, legible en el móvil).
  CH.gato = { name: 'Gato', height: 136, speed: 120, hit: [-260, -390, 520, 430], orient: 'lr',   // zona de toque generosa (la de RC17)
    sprite: { src: 'assets/characters/gato/hoja.webp', sheet: SHEET } };
  N.gato.name = 'Gato';
  // la hoja se carga para toda la partida: en el regreso el gato aparece (npcPlace) en una escena ya cargada sin él,
  // y el motor solo carga las hojas de los NPC presentes al entrar (con el dibujo procedural no hacía falta)
  const inst0 = E.rc07 && E.rc07.install;
  if (inst0) E.rc07.install = G => { inst0(G); E.assets.acquire({ id: 'char:gato', src: CH.gato.sprite.src, placeholder: 'person' }, 'global'); };

  // ---- textos: el gato ya no es negro, es el de la bufanda roja (los colores de Rai, para quien se fije)
  const RE = [
    ['¡Un gato negro sobre la ruta! ¡Mal agüero!', '¡Un gato cruzando la ruta! ¡Mal agüero!'],
    ['Un gato negro. Me mira como si me conociera.', 'Un gato gris con bufanda roja y una estrella. Me mira como si me conociera.'],
    ['Ese gato negro que ronda… llámalo.', 'Ese gato de la bufanda roja que ronda… llámalo.'],
    ['(Rai tiene la túnica llena de pelos negros. Muchos.)', '(Rai tiene la túnica llena de pelos grises. Muchos.)'],
    ['(En la orilla, un gato negro bosteza. Te mira. Y ya no está.)', '(En la orilla, un gato con bufanda roja cierra los ojos, satisfecho. Te mira. Y ya no está.)']];
  const seen = new Set();
  (function walk(o) {
    if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'string') { for (const [a, b] of RE) if (v === a) o[k] = b; }
      else walk(v);
    }
  })(D);

  // ---- guiño y bostezo con la hoja (antes: un trazo sobre el ojo del gato dibujado)
  const act0 = R17.act;
  R17.act = (name, G) => {
    const a = G.npc && G.npc('gato');
    if (a && name === 'guino') {          // espera a que termine de sentarse, guiña y se queda sentado
      let t = 0, phase = 0;
      return () => {
        t = a.moving && phase === 0 ? 0 : t + G.lastDt;
        if (phase === 0 && t > 1.15) { a.anim = 'wink'; phase = 1; t = 0; if (E.rc07) E.rc07.emote(a, ';)', 1.5); }
        else if (phase === 1 && t > 1.4) { a.anim = 'sit'; return true; }
        return false;
      };
    }
    if (a && name === 'bosteza') {
      let t = 0, started = false;
      return () => {
        t += G.lastDt;
        if (!started) { a.anim = 'yawn'; started = true; t = 0; }     // ya lleva 1,2 s sentándose (wait del guion)
        else if (t > 2.6) { a.anim = 'sit'; return true; }
        return false;
      };
    }
    return act0(name, G);
  };
})(window.E1248);
