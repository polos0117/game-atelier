#!/usr/bin/env node
/* 일상컷 묶음 계획 — 한 게임의 일상컷 여러 장(보통 다섯)을 서로 겹치지 않게 한 번에 짠다(2026-10-29).

   생성기 화면은 한 장씩 고르는 곳이고(사용자도 그렇게 쓴다), 다섯 장을 나눠 갖게 짜는 일은 그림을 그리는 쪽(claude)이 한다.
   생성기와 같은 lib/casual-tree.js · lib/prompt-game.js 로 칸마다 장면을 고르고, 생성기 「기록 내보내기」 와 같은 꼴의
   기록(casualN-ui.json)과 지시문(casualN-prompt.txt)을 쓴다. 지키는 규칙(IMAGE_RULES 2절):
     - 필수 갈래 한 장 이상 — 란제리풍·수영복·역할극 의상, 또는 게임 세계 안 방·목욕·지붕·여관의 홈웨어·란제리·목욕 차림·수영복.
       이미 있는 컷에 없으면 게임 차례대로 돌려 고른다(--required 로 바꾼다)
     - 방향·프레이밍은 서로 다르고 렌즈는 두 번까지, 먼 컷(전신·환경)·가까운 컷(가슴 위·클로즈업) 하나씩
     - 장소는 서로 다르고 장소 묶음은 두 번까지, 의상 계열은 겹치지 않게(평상복만 두 번까지), 옷은 구체적으로
     - 자세 계열·시대는 한 가지가 세 번을 넘지 않게, 뒤돌아보기 방향은 한 장까지, 알아볼 거리는 칸마다 다르게
     - 가까운 컷(허리 위·가슴 위·클로즈업)엔 광각(24·35mm)을 안 붙인다
   이미 그림이 있는 칸은 짜지 않고, 그 기록(--records)은 겹침 검사에만 쓴다.

     node tools/casual-plan.cjs <게임> [--slots 1,2,3] [--records <그림 저장소>/records/<게임>] [--required lingerie|swimwear|roleplay|in_game]
                                       [--seed N] [--out <폴더>]
   --slots 를 안 주면 등록부(data/img.json)에 없는 번호에서 다섯 칸. --out 을 주면 칸마다 기록·지시문과 plan.json 을 쓴다.
     node tools/casual-plan.cjs <게임> --check <기록 폴더> [--free 6]   # 올리기 전 — 그 묶음이 위 규칙을 다 지키나. --free 는 사용자가 직접 고른 칸(겹침에서 뺀다)

   --v2 — 일상컷 트리 버전2(docs/CASUAL_TREE_V2.md 6절, lib/casual-tree-v2.js)로 짠다. 하는 일 없이 시대 · 장소 · 의상을 고르고,
   몸 쪽(자세 · 받침 · 구도 · 손 · 소품 동작 · 다리 · 시선)은 그 장소에서 그대로 쓸 수 있는 자세 추천 하나로 채운다. 묶음 규칙:
     - 장소는 서로 다르게, 장소 묶음은 두 번까지 · 의상 계열은 겹치지 않게(평상복만 두 번) · 시대 세 번까지 · 필수 갈래 한 장 이상 — 버전1 그대로
     - 자세 추천은 서로 다르게 · 프레이밍은 서로 다르게(먼 컷 · 가까운 컷 하나씩은 꼭) · 몸 방향 한 가지는 두 번까지 · 머리 「어깨 너머」 는 한 장까지
     - 소품(소품 동작의 소품)은 칸마다 다르게 · 알아볼 거리 소품은 한두 장(들 것이 있는 게임) · ⚠ 어색한 조합은 한 장까지 · SIGNATURE 알아볼 거리는 칸마다 다르게
   --check 는 기록의 장면이 버전2(treeV 2)면 버전2 규칙으로 본다. 이미 있는 버전1 컷과 섞이면 둘 다 가진 칸(장소 · 의상 · 프레이밍 …)끼리만 견준다 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-game.js']) vm.runInContext(read(f), ctx);
const S = ctx.window.AtelierSpec, CT = ctx.window.AtelierCasualTree, C2 = ctx.window.AtelierCasualTreeV2, P = ctx.window.AtelierPrompt;
const tree2 = JSON.parse(read('data/casual-tree-v2.json'));
const tree = JSON.parse(read('data/casual-tree.json')), design = JSON.parse(read('data/game-design.json')), style = JSON.parse(read('data/style.json'));

const REQUIRED_TYPES = ['lingerie', 'swimwear', 'roleplay', 'in_game'];
const FAR = ['full_body', 'environmental'], NEAR = ['chest_up', 'face_close'];
const FRAMES = S.FRAME_OPTIONS.map(r => r[0]).filter(k => k && k !== 'detail');
const LENSES = S.LENS_OPTIONS.map(r => r[0]).filter(Boolean);
const EXPRS = S.EXPRESSION_OPTIONS.map(r => r[0]).filter(Boolean);
const ERA_WEIGHT = { now: 5, release: 2, in_game: 2, fantasy: 1 };
const FIXED_AXES = { overall_intensity: 'strong', skin_exposure: 'bold' };
/* 칸끼리 규칙(앉는 자리·손·보이는 부위·허리 아래 옷·광각·표정)은 트리 모듈이 정한다(lib/casual-tree.js — 생성기 화면과 같게).
   계획기는 거기서 한 번 더 고른다: 물건을 드는 자세는 하는 일의 물건과 겹치고(부케 들고 기다리기에 지도 보기),
   돌아보기·허리 숙이기는 몸을 비튼다(패들보드) — 사람이 화면에서 고르는 건 되지만 계획기는 안 고른다 */
const PLAN_SKIP_POSES = ['holding_cup', 'reading_book', 'taking_photo', 'adjusting_bag', 'checking_map', 'waving', 'offering_food', 'watering',
  'preparing_food', 'carrying_something', 'turning_back', 'bending_over'];
/* 방향 중 몸 동작인 것(위로 뻗기·앞으로·뒤로 기울이기·웅크리기·앉아 비틀기·돌며 움직이기·기대 눕기)도 하는 일과 따로 붙으면 부딪힌다
   (리그 오브 레전드 계획 「경기 뒤 인터뷰」 에 「위로 손 뻗기」) — 계획기는 보는 쪽(앞·옆·뒤·높이·시선) 방향만 고른다 */
const PLAN_SKIP_ORIENTS = ['reaching_up', 'leaning_forward', 'leaning_back', 'crouching', 'seated_twist', 'turning_midmotion', 'reclining'];

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, list) => list[Math.floor(r() * list.length)];
function weighted(r, weights) { const keys = Object.keys(weights), sum = keys.reduce((s, k) => s + weights[k], 0); let x = r() * sum; for (const k of keys) { x -= weights[k]; if (x < 0) return k; } return keys[0]; }

/* 필수 갈래 종류 — 옷 계열이 곧 필수면 그 계열, 게임 세계 안 섹시 일상이면 in_game */
function requiredType(sc) {
  if ((tree.required.outfits || []).includes(sc.ofam)) return sc.ofam;
  return CT.isRequired(tree, sc) ? 'in_game' : '';
}
/* 그 필수 갈래로 갈 수 있는 길 전부 — 시대·장소·하는 일·옷 계열 */
const PATH_CACHE = new Map();
function requiredPaths(type, game) {
  const ck = type + '|' + game.key;
  if (PATH_CACHE.has(ck)) return PATH_CACHE.get(ck);
  const out = [];
  for (const e of tree.eras) for (const p of CT.places(tree, e.key, game)) for (const a of CT.acts(tree, e.key, p.key))
    for (const f of CT.outfitFamilies(tree, e.key, p.key, a.key)) {
      const sc = { era: e.key, place: p.key, act: a.key, ofam: f.key };
      if (requiredType(sc) === type) out.push(sc);
    }
  PATH_CACHE.set(ck, out);
  return out;
}

function compose(r, sc, game) {
  sc.frame = pick(r, FRAMES.filter(f => CT.frameOk(tree, sc.act, f)));
  /* 옷 — 이 프레이밍에서 알아볼 수 있는 옷(트리), 그중 하는 일이 먼저 고르라는 옷(prefer)이 있으면 그중에서(자전거 점검엔 사이클 복장) */
  const it = CT.items(tree, sc.ofam, sc.frame), prefer = it.filter(x => (CT.act(tree, sc.act).prefer || []).includes(x.key));
  sc.item = prefer.length ? pick(r, prefer).key : it.length ? pick(r, it).key : '';
  const os = CT.orients(tree, sc.act, sc.frame, S.CLOSE_FRAMES), view = os.filter(o => !PLAN_SKIP_ORIENTS.includes(o));
  sc.orient = pick(r, view.length ? view : os);
  sc.lens = pick(r, LENSES.filter(l => CT.lensOk(tree, sc.frame, l)));
  /* 자세는 가끔 — 하는 일이 동작을 이미 정한다 */
  const poses = CT.poses(tree, sc.act, sc.frame).filter(k => !PLAN_SKIP_POSES.includes(k));
  /* 앉기 계열은 앉는 자세를 늘 붙인다 — 비워 두면 「관중석 자리에서 박수」 를 서서 쳤다(리그 오브 레전드 일상1) */
  const seated = CT.act(tree, sc.act).family === 'sit' ? poses.filter(k => (tree.pose_meta[k] || {}).seat) : [];
  sc.pose = seated.length ? pick(r, seated) : poses.length && r() < 0.4 ? pick(r, poses) : '';
  sc.expr = CT.exprOk(tree, sc) ? pick(r, EXPRS) : '';
  sc.axes = { ...FIXED_AXES };
  for (const k of S.LOCAL_AXES) if (!sc.axes[k]) sc.axes[k] = pick(r, S.ADVANCED_OPTIONS[k].filter(v => v && v !== 'AUTO'));
  return sc;
}
function randomSlot(r, game, requiredType_) {
  let sc;
  if (requiredType_) sc = { ...pick(r, requiredPaths(requiredType_, game)) };
  else {
    const era = weighted(r, ERA_WEIGHT), places = CT.places(tree, era, game);
    const place = pick(r, places).key, act = pick(r, CT.acts(tree, era, place)).key;
    sc = { era, place, act, ofam: pick(r, CT.outfitFamilies(tree, era, place, act)).key };
  }
  return compose(r, sc, game);
}

/* 묶음 규칙 — 틀린 것 목록(빈 목록이면 통과). base 는 이미 있는 컷: 그것들이 벌써 넘긴 한도는 그만큼 올려 준다(새 칸이 더 보태지만 않게).
   칸이 고를 거리보다 많으면(프레이밍 여섯 가지에 일곱 장) 한 가지가 두 번까지 */
/* free — 사용자가 직접 고른 칸 번호. 트리 위의 길인지는 보지만 묶음 겹침(방향·프레이밍·장소 …)엔 안 센다
   (리그 오브 레전드 일상6 「정면 상체로 쉿」 — 허리 위가 5번과 겹친다). 필수 갈래·먼 컷·가까운 컷 같은 「있어야 할 것」엔 센다
   (문명 5 일상1 — 사용자가 방향을 정면으로 골라 2번과 겹치지만, 묶음의 하나뿐인 란제리·전신 컷이다) */
function check(cuts, game, base = [], free = []) {
  const every = [...base, ...cuts], all = every.filter(c => !free.includes(c.n)), errs = [];
  const count = (f, xs) => xs.reduce((m, c) => { const k = f(c); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
  const over = (name, f, most, kinds) => {
    const m = count(f, all), b = count(f, base), cap = kinds ? Math.max(most, Math.ceil(all.length / kinds)) : most;
    Object.entries(m).forEach(([k, n]) => { if (n > Math.max(cap, b[k] || 0)) errs.push(`${name} ${k} 가 ${n} 번(${cap} 번까지)`); });
  };
  if (!every.some(c => requiredType(c))) errs.push('필수 갈래가 없다');
  over('방향', c => c.orient, 1);
  over('프레이밍', c => c.frame, 1, FRAMES.length);
  over('렌즈', c => c.lens, 2, LENSES.length);
  over('장소', c => c.place, 1);
  over('하는 일', c => c.act, 1);
  over('장소 묶음', c => CT.place(tree, c.place)?.group, 2);
  over('의상 계열', c => c.ofam !== 'everyday' && c.ofam, 1);
  over('평상복', c => c.ofam === 'everyday' && c.ofam, 2);
  over('자세 계열', c => CT.act(tree, c.act)?.family, 2, Object.keys(tree.families).length);
  over('시대', c => c.era, 3);
  over('뒤돌아보기', c => (S.LOOK_BACK.orient.includes(c.orient) || S.LOOK_BACK.pose.includes(c.pose)) && 'look_back', 1);
  if ((game.signature || []).length) over('알아볼 거리', c => c.prop, 1, game.signature.length);
  if (every.length >= 3) {
    if (!every.some(c => FAR.includes(c.frame))) errs.push('먼 컷(전신·환경)이 없다');
    if (!every.some(c => NEAR.includes(c.frame))) errs.push('가까운 컷(가슴 위·클로즈업)이 없다');
  }
  for (const c of cuts) {
    const fixed = CT.repair(tree, c, game, S.CLOSE_FRAMES);
    for (const k of ['era', 'place', 'act', 'ofam', 'item', 'pose', 'orient', 'lens', 'expr']) if ((fixed[k] || '') !== (c[k] || '')) errs.push(`칸 ${c.n || '?'}: ${k}=${c[k]} 는 트리에서 못 고른다`);
  }
  return errs;
}

function plan(game, slots, old, { seed = Date.now(), required = '' } = {}) {
  const r = rng(seed), oldReq = old.some(c => requiredType(c));
  const gi = design.games.findIndex(g => g.key === game.key);
  const want = oldReq ? '' : (required || REQUIRED_TYPES[gi % REQUIRED_TYPES.length]);
  const props = (game.signature || []).map((_, i) => String(i));
  for (let attempt = 1; attempt <= 20000; attempt++) {
    const cuts = slots.map((n, i) => ({ n, ...randomSlot(r, game, i === 0 ? want : '') }));
    const free = props.filter(p => !old.some(c => c.prop === p));
    cuts.forEach((c, i) => { c.prop = free.length ? free[(i + Math.floor(r() * free.length)) % free.length] : ''; });
    const errs = check(cuts, game, old);
    if (!errs.length) return { cuts, attempt, required: want || requiredType(old.find(c => requiredType(c))) };
  }
  throw new Error('규칙을 다 지키는 묶음을 못 찾았다 — 이미 있는 컷이 칸을 너무 많이 차지했는지 본다');
}

/* ── 버전2 ── */
const T2 = C2.make(tree2, tree);
const isV2 = c => !!c && c.treeV === 2;
const by = (list, k) => list.find(r => r.key === k);
/* 필수 갈래로 가는 길(버전2) — 하는 일 없이 시대 · 장소 · 의상 계열 */
const PATH2 = new Map();
function requiredPaths2(type, game) {
  const ck = type + '|' + game.key;
  if (PATH2.has(ck)) return PATH2.get(ck);
  const out = [];
  for (const e of tree.eras) for (const place of C2.choices(T2, { era: e.key }, 'place', game))
    for (const ofam of C2.choices(T2, { era: e.key, place }, 'ofam', game)) {
      const sc = { era: e.key, place, ofam };
      if (requiredType(sc) === type) out.push(sc);
    }
  PATH2.set(ck, out);
  return out;
}
/* 쓸 수 있는 자세 추천은 시대 · 장소 · 의상 계열 · 알아볼 거리(소품으로 들 수 있나)로만 갈린다 — 칸마다 43개를 다시 검사하면 느려서 기억한다 */
const PRESET_MEMO = new Map();
function presetsAt(sc, game) {
  const k = [game.key, sc.era, sc.place, sc.ofam, sc.prop].join('|');
  if (!PRESET_MEMO.has(k)) PRESET_MEMO.set(k, C2.presets(T2, sc, game));
  return PRESET_MEMO.get(k);
}
/* 한 칸 — 시대 · 장소 · 의상 · 옷, 그 장소에서 쓸 수 있는 자세 추천 하나(frame 을 주면 그 프레이밍의 추천만), 소품 동작은 다시 검사가 고른다(랜덤).
   wantSig 면 소품 동작을 알아볼 거리로(들 수 있는 것 — 없으면 null). 표정은 얼굴이 보일 때만 */
function randomSlot2(r, game, reqType, sigProp, { frame = '', wantSig = false } = {}) {
  let sc;
  if (reqType) sc = { ...pick(r, requiredPaths2(reqType, game)) };
  else {
    const era = weighted(r, ERA_WEIGHT), place = pick(r, C2.choices(T2, { era }, 'place', game));
    sc = { era, place, ofam: pick(r, C2.choices(T2, { era, place }, 'ofam', game)) };
  }
  sc.treeV = 2; sc.prop = sigProp || '';
  const presets = presetsAt(sc, game).filter(p => (!frame || p.frame === frame) && (!wantSig || p.prop_kind));
  if (!presets.length) return null;
  const rp = list => pick(r, list);
  sc = C2.repair(T2, C2.applyPreset(T2, sc, pick(r, presets).key), game, rp);
  if (wantSig) {
    const sig = C2.choices(T2, sc, 'use', game).filter(k => C2.use(T2, k).prop === 'signature');
    if (!sig.length) return null;
    sc = { ...sc, use: pick(r, sig) };
  }
  const items = C2.choices(T2, sc, 'item', game);
  sc.item = items.length ? pick(r, items) : '';
  sc = C2.repair(T2, sc, game, rp);
  if (wantSig && !sigProp2(sc)) return null;
  const body = by(tree2.body, sc.body), head = by(tree2.head, sc.head);
  sc.expr = body.face_hidden && !head.look_back ? '' : pick(r, EXPRS);
  sc.axes = { ...FIXED_AXES };
  for (const k of S.LOCAL_AXES) if (!sc.axes[k]) sc.axes[k] = pick(r, S.ADVANCED_OPTIONS[k].filter(v => v && v !== 'AUTO'));
  return sc;
}
const sigProp2 = c => { const u = C2.use(T2, c.use); return u && u.prop === 'signature'; };
/* 버전2 묶음 규칙. 버전1 컷(이미 있는 것)과 섞이면 둘 다 가진 칸끼리만 견준다 */
function check2(cuts, game, base = [], free = []) {
  const every = [...base, ...cuts], all = every.filter(c => !free.includes(c.n)), v2 = all.filter(isV2), errs = [];
  const count = (f, xs) => xs.reduce((m, c) => { const k = f(c); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
  const over = (name, f, most, xs = all) => {
    const m = count(f, xs), b = count(f, base);
    Object.entries(m).forEach(([k, n]) => { if (n > Math.max(most, b[k] || 0)) errs.push(`${name} ${k} 가 ${n} 번(${most} 번까지)`); });
  };
  if (!every.some(c => requiredType(c))) errs.push('필수 갈래가 없다');
  over('장소', c => c.place, 1);
  over('장소 묶음', c => (C2.place(T2, c.place) || {}).group, 2);
  over('의상 계열', c => c.ofam !== 'everyday' && c.ofam, 1);
  over('평상복', c => c.ofam === 'everyday' && c.ofam, 2);
  over('시대', c => c.era, 3);
  /* 칸이 프레이밍 가짓수보다 많으면(이미 있는 다섯 장 위에 세 장) 한 가지가 두 번까지 — 버전1 과 같다 */
  over('프레이밍', c => c.frame, Math.max(1, Math.ceil(all.length / FRAMES.length)));
  over('자세 추천', c => c.preset, 1, v2);
  over('몸 방향', c => c.body, 2, v2);
  over('머리 어깨 너머', c => by(tree2.head, c.head)?.look_back && 'over_shoulder', 1, v2);
  over('소품', c => { const u = C2.use(T2, c.use); return u && u.prop; }, 1, v2);
  over('알아볼 거리 소품', c => sigProp2(c) && 'signature', 2, v2);
  over('어색한 조합', c => C2.awkward(T2, c.ofam, c.place).length && 'awkward', 1, v2);
  /* 칸이 알아볼 거리보다 많으면 한 가지가 두 번까지(버전1 과 같다) */
  if ((game.signature || []).length) over('알아볼 거리', c => c.prop && c.prop !== 'none' && c.prop, Math.max(1, Math.ceil(all.length / game.signature.length)));
  if ((game.signature_hold || []).length && cuts.length >= 3 && !every.some(c => isV2(c) && sigProp2(c))) errs.push('알아볼 거리를 든 컷이 없다(한두 장)');
  if (every.length >= 3) {
    if (!every.some(c => FAR.includes(c.frame))) errs.push('먼 컷(전신·환경)이 없다');
    if (!every.some(c => NEAR.includes(c.frame))) errs.push('가까운 컷(가슴 위·클로즈업)이 없다');
  }
  for (const c of cuts.filter(isV2)) {
    const fixed = C2.repair(T2, c, game);
    for (const k of C2.ORDER) if ((fixed[k] || '') !== (c[k] || '')) errs.push(`칸 ${c.n || '?'}: ${k}=${c[k]} 는 트리에서 못 고른다`);
  }
  return errs;
}
/* 버전2 묶음 — 통째로 뽑아 거르면 규칙이 많아 거의 안 맞는다(다섯 장에 수만 번). 한 장씩 쌓는다:
   프레이밍을 먼저 나눠 주고(먼 컷 · 가까운 컷 하나씩), 알아볼 거리를 들 칸 하나를 정하고, 칸마다 앞 칸들과 겹치지 않는 것을 고른다 */
const MUST = /^(필수 갈래가 없다|먼 컷|가까운 컷|알아볼 거리를 든 컷이 없다)/;
function plan2(game, slots, old, { seed = Date.now(), required = '' } = {}) {
  const r = rng(seed), oldReq = old.some(c => requiredType(c));
  const gi = design.games.findIndex(g => g.key === game.key);
  const want = oldReq ? '' : (required || REQUIRED_TYPES[gi % REQUIRED_TYPES.length]);
  const used = new Set(old.map(c => c.prop)), freeProps = (game.signature || []).map((_, i) => String(i)).filter(p => !used.has(p));
  const holds = (game.signature_hold || []).map(String).filter(p => !used.has(p));
  const needSig = holds.length > 0 && !old.some(c => isV2(c) && sigProp2(c)) && slots.length >= 3;
  const oldFrames = new Set(old.map(c => c.frame));
  for (let attempt = 1; attempt <= 400; attempt++) {
    /* 프레이밍 — 이미 있는 컷이 쓴 것은 피하고, 먼 컷 · 가까운 컷이 없으면 하나씩 */
    let frames = FRAMES.filter(f => !oldFrames.has(f)).sort(() => r() - 0.5);
    if (frames.length < slots.length) frames = frames.concat(FRAMES.slice().sort(() => r() - 0.5)).slice(0, slots.length);
    frames = frames.slice(0, slots.length);
    const hasFar = [...old, ...frames.map(frame => ({ frame }))].some(c => FAR.includes(c.frame)), hasNear = [...old, ...frames.map(frame => ({ frame }))].some(c => NEAR.includes(c.frame));
    if (slots.length + old.length >= 3 && (!hasFar || !hasNear)) continue;
    const sigAt = needSig ? Math.floor(r() * slots.length) : -1, sigProp = needSig ? pick(r, holds) : '';
    const rest = freeProps.filter(p => p !== sigProp), off = Math.floor(r() * Math.max(1, rest.length));
    const cuts = [];
    for (let i = 0; i < slots.length; i++) {
      const prop = i === sigAt ? sigProp : rest.length ? rest[(i + off) % rest.length] : '';
      let got = null;
      for (let k = 0; k < 60 && !got; k++) {
        const sc = randomSlot2(r, game, i === 0 ? want : '', prop, { frame: frames[i], wantSig: i === sigAt });
        if (!sc) continue;
        const cand = { n: slots[i], ...sc };
        if (!check2([...cuts, cand], game, old).filter(e => !MUST.test(e)).length) got = cand;
      }
      if (!got) break;
      cuts.push(got);
    }
    if (cuts.length === slots.length && !check2(cuts, game, old).length) return { cuts, attempt, required: want || requiredType(old.find(c => requiredType(c))) };
  }
  throw new Error('규칙을 다 지키는 버전2 묶음을 못 찾았다 — 이미 있는 컷이 칸을 너무 많이 차지했는지 본다');
}

/* 생성기 화면의 저장 상태 — prompt-ui 의 defaults() 와 같은 모양. 기록(storage)과 지시문이 화면에서 내보낸 것과 같게 */
function blankScene() { return { expr: '', pose: '', orient: '', scene: '', outfit: '', frame: '', lens: '', camera: '', custom: '', aspect: '2:3', axes: {}, action: {}, randomLocks: {} }; }
function cardState(game, cut) {
  const st = style.styles[style.default], ver = st.versions.find(v => v.v === st.current);
  const forms = design.vocab.form_key, pilot = forms[(game.pilot || {}).form] || Object.values(forms)[0];
  const { n, ...scene } = cut;
  const locks = { 'axes.overall_intensity': true, 'axes.skin_exposure': true, aspect: true };
  /* 버전2 — prompt-ui 의 blankV2() 꼴(버전1 칸 없이), 추천 표시는 남긴다 */
  const casual = isV2(cut) ? { treeV: 2, expr: '', scene: '', outfit: '', custom: '', aspect: '2:3', axes: {}, action: {}, ...scene, randomLocks: locks }
    : { ...blankScene(), ...scene, preset: '', randomLocks: locks };
  return { card: { style: style.default, version: st.current, identityMode: 'create', form: pilot, baseForm: pilot, casualN: n, exposure: S.FORM_EXPOSURE_DEFAULT,
    attachStyleRef: false, motifs: '', lookNote: '', faceDesignOn: true, silhouetteOn: true, params: {}, locks: {}, mode: 'casual',
    scenes: { form: blankScene(), open: blankScene(), casual }, versionPinned: false }, ver };
}
function record(game, cut) {
  const { card, ver } = cardState(game, cut);
  const stage = Object.keys(design.vocab.form_key).find(k => design.vocab.form_key[k] === card.form);
  const text = P.buildCasual({ ...card, ...card.scenes.casual, game, tree, tree2, stage, baseStage: stage, styleText: ver.text, styleCasual: ver.casual || '',
    styleCheck: ver.check || '', styleRef: false, outputMode: 'casual', identityMode: 'reference', params: [] });
  const file = `${game.key}_${card.style}_f_casual${cut.n}.webp`;
  return { version: 1, game: game.key, title: game.title, mode: 'casual', form: card.form, stage, style: card.style, styleVersion: card.version,
    file, record: `records/${game.key}/casual${cut.n}-ui.json`, at: new Date().toISOString(), storage: { last: game.key, cards: { [game.key]: card } }, prompt: text };
}
/* 이미 있는 컷 — 기록의 장면(예전 갈래·예시 기록은 변환표로) */
function oldCuts(dir, game) {
  if (!dir || !fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /^casual\d+-ui\.json$/.test(f)).map(f => {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), sc = rec.storage.cards[rec.game].scenes.casual;
    const n = Number(/\d+/.exec(f)[0]);
    if (isV2(sc)) { const { randomLocks, action, ...rest } = C2.repair(T2, sc, game); return { n, ...rest, old: true }; }
    return { n, ...CT.repair(tree, CT.fromLegacy(tree, sc), game, S.CLOSE_FRAMES), old: true };
  });
}
function registered(game) {
  const s = read('data/img.json'), re = new RegExp(game.key + '_' + style.default + '_f_casual(\\d+)\\.webp', 'g');
  return [...new Set([...s.matchAll(re)].map(m => Number(m[1])))];
}
function line(c) {
  if (isV2(c)) {
    const p = C2.place(T2, c.place), f = CT.family(tree, c.ofam), it = CT.item(tree, c.ofam, c.item), u = C2.use(T2, c.use), pr = by(tree2.presets, c.preset);
    const ko = (list, k) => (by(list, k) || {}).ko || k || '—', hand = k => k === 'prop' ? '소품' : ko(tree2.hands, k);
    return `${c.old ? '  (있음)' : '  '} ${c.n} ${requiredType(c) ? '★' : ' '}${C2.awkward(T2, c.ofam, c.place).length ? '⚠' : ' '} ${CT.era(tree, c.era).ko} · ${p.ko} · ${f.ko}${it ? '(' + it.ko + ')' : ''} │ ${pr ? pr.ko : '—'} │ ` +
      `${ko(tree2.postures, c.posture)} · ${c.frame} · ${ko(tree2.body, c.body)} · ${ko(tree2.head, c.head)} · 오른손 ${hand(c.right)} · 왼손 ${hand(c.left)}${u ? ' · ' + ko(tree2.props, u.prop) + ' ' + u.ko : ''}${c.legs ? ' · ' + ko(tree2.legs, c.legs) : ''}${c.gaze ? ' · 시선 ' + ko(tree2.gaze, c.gaze) : ''}`;
  }
  const p = CT.place(tree, c.place), a = CT.act(tree, c.act), f = CT.family(tree, c.ofam), it = CT.item(tree, c.ofam, c.item);
  return `${c.old ? '  (있음)' : '  '} ${c.n} ${requiredType(c) ? '★' : ' '} ${CT.era(tree, c.era).ko} · ${p.ko} · ${a.ko} · ${f.ko}${it ? '(' + it.ko + ')' : ''} │ ${c.frame} · ${c.orient} · ${c.lens}${c.pose ? ' · ' + c.pose : ''}`;
}

function main(argv) {
  const key = argv[0], opt = {};
  for (let i = 1; i < argv.length; i++) { const k = argv[i].replace(/^--/, ''); if (k === 'v2') opt.v2 = true; else opt[k] = argv[++i]; }
  const game = design.games.find(g => g.key === key);
  if (!game) { console.error('게임이 없다: ' + key + '\n' + fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 27).join('\n')); return 2; }
  /* --check <기록 폴더> — 이미 있는 묶음이 규칙을 지키는지만 본다(올리기 전) */
  if (opt.check) {
    const cuts = oldCuts(opt.check, game);
    for (const c of cuts.sort((a, b) => a.n - b.n)) console.log(line(c));
    const free = opt.free ? String(opt.free).split(',').map(Number) : [];
    const errs = (cuts.some(isV2) ? check2 : check)(cuts.map(c => ({ ...c, old: false })), game, [], free);
    if (free.length) console.log('  (사용자가 고른 칸 ' + free.join(',') + ' — 겹침 검사에서 뺐다)');
    for (const e of errs) console.log('  X ' + e);
    console.log(errs.length ? `일상컷 묶음 ${errs.length} 가지 걸림` : `일상컷 묶음 통과 — ${cuts.length} 장`);
    return errs.length ? 1 : 0;
  }
  const taken = registered(game);
  const slots = opt.slots ? opt.slots.split(',').map(Number) : [...Array(30).keys()].map(i => i + 1).filter(n => !taken.includes(n)).slice(0, 5);
  const old = oldCuts(opt.records, game).filter(c => !slots.includes(c.n));
  const seed = Number(opt.seed || Date.now() % 1e9);
  const res = (opt.v2 ? plan2 : plan)(game, slots, old, { seed, required: opt.required || '' });
  console.log(`${game.title} 일상컷 묶음${opt.v2 ? '(버전2)' : ''} — 칸 ${slots.join(',')} · 필수 갈래 ${res.required} · 시도 ${res.attempt} · seed ${seed}`);
  for (const c of [...old, ...res.cuts].sort((a, b) => a.n - b.n)) console.log(line(c));
  if (opt.out) {
    fs.mkdirSync(opt.out, { recursive: true });
    for (const c of res.cuts) {
      const rec = record(game, c);
      fs.writeFileSync(path.join(opt.out, `casual${c.n}-ui.json`), JSON.stringify(rec, null, 1) + '\n');
      fs.writeFileSync(path.join(opt.out, `casual${c.n}-prompt.txt`), rec.prompt);
    }
    fs.writeFileSync(path.join(opt.out, 'plan.json'), JSON.stringify({ game: game.key, seed, tree: opt.v2 ? 2 : 1, required: res.required, slots, cuts: res.cuts }, null, 1) + '\n');
    console.log('→ ' + opt.out);
  }
  return 0;
}

module.exports = { plan, check, plan2, check2, randomSlot2, record, requiredType, oldCuts, REQUIRED_TYPES };
if (require.main === module) process.exit(main(process.argv.slice(2)));
