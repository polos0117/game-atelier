/* 일상컷 트리 — data/casual-tree.json 을 읽어 단계마다 고를 수 있는 것을 거른다(2026-10-29).
   시대 → 장소 → 하는 일 → 의상 계열 → 옷 → 자세·방향 → 프레이밍·렌즈 → 표정·소품.
   갈래·예시·자세가 서로 상관없이 뽑혀 부딪혔다(사용자 「중구난방」). 앞에서 고른 것이 뒤 선택지를 거르고,
   앞을 바꾸면 맞지 않게 된 뒤 칸은 고친다(repair). 화면(prompt-ui)·조립(prompt-game)·랜덤(prompt-random)이 같이 쓴다.
   검사기 tools/casual-tree.py 와 같은 규칙이다 — 하나를 고치면 다른 쪽도. 브라우저와 node 둘 다에서 돈다. */
(function (root) {
  'use strict';
  var REQUIRED_FIELDS = ['era', 'place', 'act', 'ofam'];
  /* 장면 칸 차례 — 랜덤도 이 차례로 내려간다 */
  var ORDER = ['era', 'place', 'act', 'ofam', 'item', 'pose', 'orient'];

  function by(list, key) { for (var i = 0; i < (list || []).length; i++) if (list[i].key === key) return list[i]; return null; }
  function era(tree, k) { return by(tree.eras, k); }
  function place(tree, k) { return by(tree.places, k); }
  function act(tree, k) { return by(tree.activities, k); }
  function family(tree, k) { return by(tree.outfits, k); }
  function group(tree, k) { return by(tree.groups, k); }
  function item(tree, fam, k) { var f = family(tree, fam); return f ? by(f.items, k) : null; }

  /* 하는 일의 places — @묶음 은 그 묶음의 모든 장소 */
  function actPlaces(tree, a) {
    var out = [];
    (a.places || []).forEach(function (k) {
      if (k.charAt(0) === '@') tree.places.forEach(function (p) { if (p.group === k.slice(1)) out.push(p.key); });
      else out.push(k);
    });
    return out;
  }
  function year(game) { var y = game && game.facts && game.facts.year; return typeof y === 'number' ? y : null; }

  /* 단계마다 고를 수 있는 것 */
  function eras(tree) { return tree.eras.slice(); }
  function places(tree, eraKey, game) {
    var y = eraKey === 'release' ? year(game) : null;
    return tree.places.filter(function (p) { return p.eras.indexOf(eraKey) >= 0 && !(y && p.since && p.since > y) && acts(tree, eraKey, p.key).length; });
  }
  function outfitFamilies(tree, eraKey, placeKey, actKey) {
    var e = era(tree, eraKey), p = place(tree, placeKey), a = act(tree, actKey);
    if (!e || !p || !a) return [];
    return tree.outfits.filter(function (o) {
      return e.outfits.indexOf(o.key) >= 0 && p.outfits.indexOf(o.key) >= 0 && (!a.outfits || a.outfits.indexOf(o.key) >= 0);
    });
  }
  function acts(tree, eraKey, placeKey) {
    return tree.activities.filter(function (a) {
      if (actPlaces(tree, a).indexOf(placeKey) < 0) return false;
      var e = era(tree, eraKey), p = place(tree, placeKey);
      return e && p && tree.outfits.some(function (o) {
        return e.outfits.indexOf(o.key) >= 0 && p.outfits.indexOf(o.key) >= 0 && (!a.outfits || a.outfits.indexOf(o.key) >= 0);
      });
    });
  }
  function items(tree, famKey) { var f = family(tree, famKey); return f ? f.items.slice() : []; }
  function poseFamily(tree, actKey) { var a = act(tree, actKey); return a ? tree.families[a.family] : null; }
  function poses(tree, actKey) { var f = poseFamily(tree, actKey); return f ? f.poses.slice() : []; }
  /* 가까운 옆얼굴(profile_close)은 가까운 프레이밍에서만 */
  function orients(tree, actKey, frame, closeFrames) {
    var f = poseFamily(tree, actKey);
    if (!f) return [];
    var close = (closeFrames || []).indexOf(frame) >= 0;
    return f.orients.filter(function (o) { return o !== 'profile_close' || close; });
  }

  /* 칸 하나의 고를 거리(열쇠 목록) — 랜덤과 화면이 같이 쓴다 */
  function choices(tree, scene, key, game, closeFrames) {
    switch (key) {
      case 'era': return eras(tree).map(function (x) { return x.key; });
      case 'place': return places(tree, scene.era, game).map(function (x) { return x.key; });
      case 'act': return acts(tree, scene.era, scene.place).map(function (x) { return x.key; });
      case 'ofam': return outfitFamilies(tree, scene.era, scene.place, scene.act).map(function (x) { return x.key; });
      case 'item': return items(tree, scene.ofam).map(function (x) { return x.key; });
      case 'pose': return poses(tree, scene.act);
      case 'orient': return orients(tree, scene.act, scene.frame, closeFrames);
    }
    return [];
  }

  /* 앞 칸을 바꿨거나 저장값이 오래돼 맞지 않는 칸을 고친다. 꼭 있어야 하는 칸(시대·장소·하는 일·의상 계열)은
     남은 것 중 하나(pick — 기본은 첫째, 랜덤이면 무작위)로, 골라도 되는 칸(옷·자세·방향)은 비운다(자동) */
  function repair(tree, scene, game, closeFrames, pick) {
    var next = Object.assign({}, scene);
    pick = pick || function (list) { return list[0]; };
    if (!era(tree, next.era)) next.era = 'now';
    ORDER.forEach(function (k) {
      var list = choices(tree, next, k, game, closeFrames);
      if (REQUIRED_FIELDS.indexOf(k) >= 0) { if (list.indexOf(next[k]) < 0) next[k] = list.length ? pick(list) : ''; }
      else if (next[k] && list.indexOf(next[k]) < 0) next[k] = '';
    });
    return next;
  }

  function applyPath(scene, p) {
    var next = Object.assign({}, scene, { era: p.era, place: p.place, act: p.act, ofam: p.outfit, item: p.item || '' });
    return next;
  }
  function preset(tree, k) { return by(tree.presets, k); }
  function applyPreset(tree, scene, k) {
    var p = preset(tree, k);
    return p ? Object.assign(applyPath(scene, p), { preset: k }) : scene;
  }
  /* 예전 기록(갈래 cat · 예시 ex · 시대 '' | 'release') → 새 길. 옛 칸은 지운다. 장소도 갈래도 없으면 기본 길(일상 갈래의 기본) */
  function fromLegacy(tree, scene) {
    if (!scene || scene.place) return scene;
    var L = tree.legacy || {}, v = L[scene.cat + '/' + (scene.ex || '')] || L[scene.cat + '/'] || L['everyday/'];
    var next = Object.assign({}, scene);
    if (v && v.preset) next = applyPreset(tree, next, v.preset);
    else if (v) next = applyPath(next, v);
    if (scene.era === 'release' && place(tree, next.place) && place(tree, next.place).eras.indexOf('release') >= 0) next.era = 'release';
    ['cat', 'ex', 'catCustom', 'exCustom'].forEach(function (k) { delete next[k]; });
    return next;
  }

  /* 필수 갈래 — 옷 계열이 란제리풍·수영복·역할극이거나, 게임 세계 안의 방·목욕·지붕·여관에서 홈웨어·란제리·목욕 차림·수영복 */
  function isRequired(tree, scene) {
    var R = tree.required || {};
    if ((R.outfits || []).indexOf(scene.ofam) >= 0) return true;
    var g = R.in_game || {};
    return scene.era === g.era && (g.places || []).indexOf(scene.place) >= 0 && (g.outfits || []).indexOf(scene.ofam) >= 0;
  }
  function screens(tree, placeKey) {
    var p = place(tree, placeKey), g = p && group(tree, p.group);
    return !!(p && (p.screens || (g && g.screens)));
  }

  root.AtelierCasualTree = { ORDER: ORDER, era: era, place: place, act: act, family: family, group: group, item: item, preset: preset,
    actPlaces: actPlaces, eras: eras, places: places, acts: acts, outfitFamilies: outfitFamilies, items: items, poses: poses, orients: orients,
    poseFamily: poseFamily, choices: choices, repair: repair, applyPreset: applyPreset, fromLegacy: fromLegacy, isRequired: isRequired, screens: screens };
})(typeof window !== 'undefined' ? window : globalThis);
