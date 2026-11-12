/* 일상컷 묶음 계획기. node tests/casual-plan.cjs
   - 대표 여섯 편(알아볼 거리 소품 있는 · 없는 편 섞어) × 씨앗 하나 — 다섯 칸이 묶음 규칙을 다 지키고, 기록·지시문이 생성기 조립과 같다
     (쉰 편 × 씨앗 셋은 8분 가까이 걸려 줄였다 — 사용자 2026-11-12 「쓸데없이 시간만 잡아먹는 검사들 좀 없애줘」)
   - 이미 있는 컷이 있으면 그 위에 더 짜도 규칙을 지킨다
   - 규칙 검사가 겹침·필수 갈래 없음·트리 밖 값을 건다 */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm');
const C = require('../tools/casual-plan.cjs');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/casual-tree.js', 'lib/prompt-game.js']) vm.runInContext(read(f), ctx);
const CT = ctx.window.AtelierCasualTree, P = ctx.window.AtelierPrompt, tree = JSON.parse(read('data/casual-tree.json')), design = JSON.parse(read('data/game-design.json'));
const style = JSON.parse(read('data/style.json')), gs = style.styles[style.default], cur = gs.versions.find(v => v.v === gs.current);

const REP = ['pacman', 'legend_of_zelda', 'street_fighter_2', 'dave_the_diver', 'hearthstone', 'stardew_valley'].map(k => design.games.find(g => g.key === k));
let n = 0;
for (const g of REP) for (const seed of [1]) {
  const res = C.plan(g, [1, 2, 3, 4, 5], [], { seed });
  assert.equal(res.cuts.length, 5);
  assert.deepEqual(C.check(res.cuts, g), [], g.key + ' ' + seed);
  assert(res.cuts.some(c => C.requiredType(c) === res.required), g.key + ' 필수 갈래 ' + res.required);
  assert(res.cuts.every(c => c.item), g.key + ' 옷은 구체적으로');
  assert.equal(res.cuts.filter(C.isCostume).length, 1, g.key + ' 주인공·마스코트 코스튬 한 장(2026-11-01)');
  assert(res.cuts.filter(C.isCostume).every(c => c.frame !== 'face_close'), g.key + ' ' + seed + ' 코스튬 컷엔 얼굴 클로즈업 안 씀(2026-11-02)');
  for (const c of res.cuts) { const lowOff = (tree.frame_rules[c.frame] || {}).low === false, pf = (tree.activities.find(a => a.key === c.act).prefer || []).filter(k => tree.outfits.find(o => o.key === c.ofam).items.some(i => i.key === k && !(lowOff && i.low))); if (pf.length) assert(pf.includes(c.item), g.key + ' ' + c.act + ' 에 맞는 옷'); }
  /* 칸끼리 규칙(트리 표) — 자세는 앉는 자리·손·보이는 부위가 맞고 물건 드는 자세·돌아보기는 안 고른다, 표정은 하는 일·방향이 허락할 때만,
     가까운 컷·3/4 엔 광각 없음, 가슴 위·클로즈업엔 허리 아래로 알아보는 옷 없음 */
  for (const c of res.cuts) {
    const a = tree.activities.find(x => x.key === c.act), fr = tree.frame_rules[c.frame] || {}, m = tree.pose_meta[c.pose] || {};
    if (c.pose) {
      assert(!m.seat || !a.seat || a.seat.includes(m.seat), g.key + ' 앉는 자리 ' + c.act + '·' + c.pose);
      assert(!m.hands || a.hands === 'free', g.key + ' 손 ' + c.act + '·' + c.pose);
      assert(!fr.zones || fr.zones.includes(m.zone || 'legs'), g.key + ' 보이는 부위 ' + c.frame + '·' + c.pose);
      assert(!['holding_cup', 'reading_book', 'taking_photo', 'adjusting_bag', 'checking_map', 'waving', 'offering_food', 'watering', 'preparing_food', 'carrying_something', 'turning_back', 'bending_over'].includes(c.pose), g.key + ' 계획기는 안 고르는 자세 ' + c.pose);
    }
    assert(!c.expr || (!a.mood && !tree.back_orients.includes(c.orient)), g.key + ' 표정 ' + c.act + '·' + c.orient);
    assert(!['reaching_up', 'leaning_forward', 'leaning_back', 'crouching', 'seated_twist', 'turning_midmotion', 'reclining'].includes(c.orient), g.key + ' 계획기는 동작 방향을 안 고른다 ' + c.orient);
    assert(fr.wide !== false || !tree.wide_lenses.includes(c.lens), g.key + ' 광각 ' + c.frame + '·' + c.lens);
    assert(!(a.not_frames || []).includes(c.frame), g.key + ' 하는 일이 안 받는 프레이밍 ' + c.act + '·' + c.frame);
    if (a.family === 'sit' && CT.poses(tree, c.act, c.frame).some(k => (tree.pose_meta[k] || {}).seat)) assert((tree.pose_meta[c.pose] || {}).seat, g.key + ' 앉기 계열엔 앉는 자세 ' + c.act + '·' + c.pose);
    assert(fr.low !== false || !tree.outfits.find(o => o.key === c.ofam).items.find(i => i.key === c.item).low, g.key + ' 허리 아래 옷 ' + c.frame + '·' + c.item);
  }
  for (const c of res.cuts) {
    const rec = C.record(g, c), sc = rec.storage.cards[g.key].scenes.casual;
    assert.equal(rec.file, `${g.key}_glossy_kr_game_f_casual${c.n}.webp`);
    assert.equal(rec.record, `records/${g.key}/casual${c.n}-ui.json`);
    assert(rec.prompt.includes("STYLE: keep the attached image's rendering exactly") && !rec.prompt.includes('FINAL CHECK'), '일상컷 화풍은 첨부 그림 그대로(2026-11-03)');
    assert(sc.axes.overall_intensity === 'strong' && sc.axes.skin_exposure === 'bold' && sc.aspect === '2:3', '일상컷 고정값');
    assert(rec.prompt.includes('SCENE (chosen):\n') && rec.prompt.includes('overall_intensity: strong'), '지시문');
  }
  n++;
}
/* 필수 갈래는 게임 차례대로 돌린다, --required 로 바꾼다 */
const req = design.games.slice(0, 4).map(g => C.plan(g, [1, 2, 3], [], { seed: 5 }).required);
assert.deepEqual(req, C.REQUIRED_TYPES, '필수 갈래 돌리기');
assert.equal(C.plan(design.games[0], [1, 2, 3], [], { seed: 5, required: 'in_game' }).required, 'in_game');
/* 이미 있는 컷 위에 더 짠다 — 일곱 장이어도 규칙 */
const g = design.games.find(x => x.key === 'street_fighter_2');
const first = C.plan(g, [1, 2, 3, 4, 5], [], { seed: 9 }).cuts.map(c => ({ ...c, old: true }));
const more = C.plan(g, [6, 7], first, { seed: 9 });
assert.deepEqual(C.check(more.cuts, g, first), [], '더 짠 두 장');
assert(!more.cuts.some(c => first.some(o => o.place === c.place)), '이미 있는 장소는 피한다');
/* 규칙 검사 */
const base = C.plan(g, [1, 2, 3, 4, 5], [], { seed: 4 }).cuts;
const errs = f => C.check(f(base.map(c => ({ ...c, axes: { ...c.axes } }))), g).join(' | ');
assert.match(errs(cs => { cs[1].frame = cs[0].frame; return cs; }), /프레이밍/);
assert.match(errs(cs => { cs[1].place = cs[0].place; cs[1].era = cs[0].era; cs[1].act = cs[0].act; cs[1].ofam = cs[0].ofam; cs[1].item = cs[0].item; return cs; }), /장소/);
assert.match(errs(cs => cs.filter(c => !C.requiredType(c))), /필수 갈래가 없다/);
assert.match(errs(cs => cs.filter(c => !C.isCostume(c))), /주인공·마스코트 코스튬 컷이 없다/);
/* 코스튬 컷엔 얼굴 클로즈업 안 씀(2026-11-02 사용자 「필수코스튬 컷은 얼굴 클로즈업 장면은 빼도록 · 게임쪽도」 — 표 costume_required.not_frames) */
assert.deepEqual(tree.costume_required.not_frames, ['face_close']);
assert.match(errs(cs => { const c = cs.find(C.isCostume); c.frame = 'face_close'; return cs; }), /코스튬 컷의 프레이밍 face_close/);
{ const v2 = C.plan2(g, [1, 2, 3, 4, 5], [], { seed: 5 }).cuts.map(c => ({ ...c }));
  v2.find(C.isCostume).frame = 'face_close';
  assert(C.check2(v2, g).some(e => /코스튬 컷의 프레이밍 face_close/.test(e)), '버전2 검사도 코스튬 얼굴 클로즈업을 막는다'); }
/* 다섯 장이 다 있고 코스튬만 없으면 — 코스튬 한 장(버전2) */
{ const five = C.plan2(g, [1, 2, 3, 4, 5], [], { seed: 21 }).cuts.filter(c => !C.isCostume(c)).map(c => ({ ...c, old: true }));
  const one = C.plan2(g, [6], five, { seed: 21 });
  assert(one.cuts.length === 1 && C.isCostume(one.cuts[0]) && !C.check2(one.cuts, g, five).length, '코스튬 한 장만 더 짠다'); }
/* 사용자가 고른 칸(free)은 겹침엔 안 세도 「있어야 할 것」엔 센다 — 문명 5 일상1(하나뿐인 란제리·전신 컷, 방향만 2번과 겹침) */
const keep = base.filter(c => C.requiredType(c) || ['full_body', 'environmental', 'chest_up', 'face_close'].includes(c.frame)).map(c => c.n);
assert.deepEqual(C.check(base, g, [], keep), [], '고른 칸도 필수 갈래·먼 컷·가까운 컷으로 센다');
/* 장소가 달라도 하는 일은 겹치지 않는다 — GTA V 계획에 쇼핑몰·편의점 「앉아 쉬기」 둘 */
const rest = ['street_mall', 'street_grocery'].map(place => CT.repair(tree, { era: 'now', place, act: 'rest_seat', ofam: 'everyday' }, g, P.spec ? P.spec.CLOSE_FRAMES : []));
assert(rest.every(c => c.act === 'rest_seat'), '두 장소 다 앉아 쉬기');
assert.match(errs(cs => { Object.assign(cs[0], rest[0], { item: '' }); Object.assign(cs[1], rest[1], { item: '' }); return cs; }), /하는 일 rest_seat/);
assert.match(errs(cs => { cs[2].pose = 'walking'; cs[2].act = 'wait_train'; cs[2].place = 'travel_rural_station'; cs[2].era = 'now'; return cs; }), /트리에서 못 고른다|장소/);
/* 기록 폴더 읽기 — 예전 갈래·예시 기록도 변환표로 */
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plan-'));
fs.writeFileSync(path.join(dir, 'casual1-ui.json'), JSON.stringify({ game: g.key, storage: { cards: { [g.key]: { scenes: { casual: { cat: 'travel_exploration', ex: 'travel_station', frame: 'face_close', orient: 'looking_down', lens: 'telephoto135' } } } } } }));
const old = C.oldCuts(dir, g);
assert(old.length === 1 && old[0].place === 'travel_rural_station' && old[0].n === 1, '예전 기록 → 트리 길');
/* 버전2(--v2, docs/CASUAL_TREE_V2.md 6절) — 대표 여섯 편 × 씨앗 하나: 묶음 규칙 · 트리 위 · 기록 · 지시문 */
for (const f of ['lib/casual-tree-v2.js']) vm.runInContext(read(f), ctx);
const C2 = ctx.window.AtelierCasualTreeV2, tree2 = JSON.parse(read('data/casual-tree-v2.json')), T2 = C2.make(tree2, tree);
let n2 = 0, t0 = Date.now();
for (const g2 of REP) for (const seed of [1]) {
  const res = C.plan2(g2, [1, 2, 3, 4, 5], [], { seed });
  const w = g2.key + ' ' + seed;
  assert.deepEqual(C.check2(res.cuts, g2), [], w);
  assert(res.cuts.every(c => c.treeV === 2 && c.preset && !c.act && !c.pose && !c.orient && !c.lens), w + ' 버전2 칸만');
  assert(res.cuts.some(c => C.requiredType(c) === res.required), w + ' 필수 갈래');
  assert.equal(res.cuts.filter(C.isCostume).length, 1, w + ' 주인공·마스코트 코스튬 한 장');
  assert(res.cuts.filter(C.isCostume).every(c => c.frame && c.frame !== 'face_close'), w + ' 코스튬 컷엔 얼굴 클로즈업 안 씀');
  for (const c of res.cuts.filter(C.isCostume)) { assert(['now', 'fantasy'].includes(c.era) && !C2.awkward(T2, c.ofam, c.place).length, w + ' 코스튬은 지금 · 무대·환상, 어색하지 않은 곳');
    const t = C.record(g2, c).prompt; assert(t.includes(g2.costume.en) && t.includes('In this cut her game shows in the outfit itself') && !t.includes('source_influence:') && !t.includes('her game belongs in accessories and props, never in the clothes'), w + ' 코스튬 지시문'); }
  assert.equal(new Set(res.cuts.map(c => c.preset)).size, 5, w + ' 자세 추천은 서로 다르게');
  assert.equal(new Set(res.cuts.map(c => c.frame)).size, 5, w + ' 프레이밍은 서로 다르게');
  assert.equal(new Set(res.cuts.map(c => c.era)).size, 4, w + ' 시대 넷이 다(사용자 2026-10-30 — 한 가지는 두 번까지)');
  const sig = res.cuts.filter(c => (C2.use(T2, c.use) || {}).prop === 'signature');
  assert(g2.signature_hold.length ? sig.length >= 1 && sig.length <= 2 : !sig.length, w + ' 알아볼 거리 소품 한두 장(들 것이 있는 게임만)');
  for (const c of sig) assert(g2.signature_hold.includes(Number(c.prop)) || c.prop === '', w + ' 든 알아볼 거리는 들 수 있는 것');
  assert(res.cuts.filter(c => C2.awkward(T2, c.ofam, c.place).length).length <= 1, w + ' ⚠ 한 장까지');
  assert(res.cuts.filter(c => C.DRINKS.includes((C2.use(T2, c.use) || {}).prop)).length <= 1, w + ' 마실 것 한 장까지');
  assert(res.cuts.filter(c => c.head === 'over_shoulder').length <= 1, w + ' 어깨 너머 한 장까지');
  for (const c of res.cuts) {
    const plain = x => JSON.parse(JSON.stringify(x));   // vm 안의 모듈이 만든 객체는 원형이 달라 그대로 견주면 틀린다
    assert.deepEqual(plain(C2.repair(T2, c, g2)), plain({ ...c, treeV: 2 }), w + ' 칸 ' + c.n + ' 다시 검사가 고칠 것이 없다');
    const rec = C.record(g2, c), sc = rec.storage.cards[g2.key].scenes.casual;
    assert(sc.treeV === 2 && sc.axes.overall_intensity === 'strong' && sc.axes.skin_exposure === 'bold' && sc.aspect === '2:3', w + ' 기록 · 고정값');
    assert(rec.prompt.includes('POSTURE: ') && rec.prompt.includes('COMPOSITION: ') && !rec.prompt.includes('Activity:') && !rec.prompt.includes('FINAL CHECK') && rec.prompt.includes("STYLE: keep the attached image's rendering exactly"), w + ' 버전2 지시문');
  }
  n2++;
}
const took = Date.now() - t0;
/* 버전1 컷 위에 버전2 로 더 짠다 — 장소 · 의상 · 프레이밍은 섞어서 견준다 */
const v1first = C.plan(g, [1, 2, 3, 4, 5], [], { seed: 9 }).cuts.map(c => ({ ...c, old: true }));
const more2 = C.plan2(g, [6, 7, 8], v1first, { seed: 9 });
assert.deepEqual(C.check2(more2.cuts, g, v1first), [], '버전1 다섯 장 위에 버전2 세 장');
assert(!more2.cuts.some(c => v1first.some(o => o.place === c.place)), '이미 있는 장소는 피한다');
/* 다른 게임이 쓴 소품 — 많이 쓴 소품(잔)은 덜 나온다 */
{
  /* 다른 게임이 잔을 많이 썼으면 마실 것(넷을 한 무리로)이 덜 나온다 */
  const cnt = heavy => { let n = 0, all = 0; for (const g2 of design.games.slice(0, 6)) for (const seed of [1, 2]) for (const c of C.plan2(g2, [1, 2, 3, 4, 5], [], { seed, usage: heavy }).cuts) { const u = C2.use(T2, c.use); if (u && u.prop !== 'signature') { all++; if (C.DRINKS.includes(u.prop)) n++; } } return [n, all]; };
  const [free, a1] = cnt({}), [hit, a2] = cnt({ cup: 30 });
  assert(hit < free / 2 && a2 > 0, '많이 쓴 잔이면 마실 것이 덜 나온다: ' + free + '/' + a1 + ' → ' + hit + '/' + a2);
}
/* 게임 사이 안 쓴 트리 먼저(2026-11-01, element 와 같게) — 장소 · 자세 추천 · 표정을 많이 쓴 것으로 채운 횟수를 주면 안 쓴 값이 훨씬 자주 나온다 */
{
  const S = ctx.window.AtelierSpec, places = Object.keys(tree2.places).filter(k => k !== 'note'), presets = tree2.presets.map(x => x.key), exprs = S.EXPRESSION_OPTIONS.map(r => r[0]).filter(Boolean);
  const third = list => new Set(list.filter((k, i) => i % 3 === 0)), fP = third(places), fR = third(presets), fE = third(exprs);
  const heavy = (all, keep) => Object.fromEntries(all.filter(k => !keep.has(k)).map(k => [k, 12]));
  const usage = { prop: {}, place: heavy(places, fP), item: {}, preset: heavy(presets, fR), posture: {}, expr: heavy(exprs, fE) };
  /* 횟수 없이 · 있게 한 번씩만 짜고 세 칸(장소 · 자세 추천 · 표정)을 같은 컷에서 센다 */
  const cutsOf = u => design.games.slice(0, 5).flatMap(g2 => [3].flatMap(seed => C.plan2(g2, [1, 2, 3, 4, 5], [], { seed, usage: u }).cuts));
  const freeCuts = cutsOf({}), leanCuts = cutsOf(usage);
  const share = (cuts, f, set) => { let hit = 0, all = 0; for (const c of cuts) { if (!c[f]) continue; all++; if (set.has(c[f])) hit++; } return hit / all; };
  for (const [f, set, name] of [['place', fP, '장소'], ['preset', fR, '자세 추천'], ['expr', fE, '표정']]) {
    const base = share(freeCuts, f, set), lean = share(leanCuts, f, set);
    assert(lean > 0.6 && lean > base * 1.5, name + ' — 안 쓴 값 비율 ' + lean.toFixed(2) + ' (횟수 없이 ' + base.toFixed(2) + ')');
  }
  assert.deepEqual(C.plan2(g, [1, 2, 3], [], { seed: 7, usage }).cuts, C.plan2(g, [1, 2, 3], [], { seed: 7, usage }).cuts, '같은 입력 · 씨앗이면 같은 답');
  const img = path.join(__dirname, '../../game-atelier-img/records');
  if (fs.existsSync(img)) { const u = C.sceneUsage(img, g.key); assert(Object.keys(u.place).length > 10 && Object.keys(u.expr).length > 5, '그림 저장소 기록에서 센다'); }
}
/* 버전2 규칙 검사가 건다 */
const b2 = C.plan2(g, [1, 2, 3, 4, 5], [], { seed: 4 }).cuts, e2 = f => C.check2(f(b2.map(c => ({ ...c }))), g).join(' | ');
assert.match(e2(cs => { Object.assign(cs[1], { preset: cs[0].preset }); return cs; }), /자세 추천|트리에서 못 고른다/);
assert.match(e2(cs => { cs.forEach(c => { c.body = 'front'; }); return cs; }), /몸 방향 front/);
assert.match(e2(cs => cs.filter(c => !C.requiredType(c))), /필수 갈래가 없다/);
const dave = design.games.find(x => x.key === 'dave_the_diver');
const d5 = C.plan2(dave, [1, 2, 3, 4, 5], [], { seed: 2 }).cuts;
assert.match(C.check2(d5.filter(c => (C2.use(T2, c.use) || {}).prop !== 'signature'), dave).join(' | '), /알아볼 거리를 든 컷이 없다/);
/* 버전2 기록 폴더 읽기 · --check */
const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'plan2-'));
for (const c of b2) fs.writeFileSync(path.join(dir2, `casual${c.n}-ui.json`), JSON.stringify(C.record(g, c)));
const back = C.oldCuts(dir2, g);
assert(back.length === 5 && back.every(c => c.treeV === 2 && c.old), '버전2 기록 → 버전2 컷');
assert.deepEqual(C.check2(back.map(c => ({ ...c, old: false })), g), [], '읽은 기록도 규칙 그대로');
console.log(`PASS 일상컷 묶음 계획 버전2: 대표 ${n2}묶음(${(took / 1000).toFixed(1)}초) 규칙 · 트리 위 · 기록 · 지시문 · 버전1 위에 더 짜기 · 규칙 검사 · 기록 읽기`);
console.log(`PASS 일상컷 묶음 계획: 대표 ${n}묶음 규칙·기록·고정값 · 필수 갈래 돌리기 · 있는 컷 위에 더 짜기 · 규칙 검사 · 고른 칸 · 예전 기록`);
