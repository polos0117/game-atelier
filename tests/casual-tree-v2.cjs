/* 일상컷 트리 버전2 모듈(lib/casual-tree-v2.js). node tests/casual-tree-v2.cjs
   - 검사기(tools/casual-tree-v2.py)와 같은 길: 자세 추천마다 쓸 수 있는 장소가 같다
   - 다시 검사 뒤엔 어느 칸도 걸리지 않는다(랜덤 수천 번) — 두 손 칸 · 보이는 부위 · 다리 칸 · 받침 · 옷 특징 · 시선
   - 프레이밍을 넓혀 맞추지 않는다, 두 손 자세는 다른 손을 잠근다, 버전1 기록은 표로 옮긴다 */
const assert = require('node:assert'), fs = require('node:fs'), path = require('node:path');
global.window = global; require('../lib/casual-tree.js'); require('../lib/casual-tree-v2.js');
const C = window.AtelierCasualTreeV2, R = path.join(__dirname, '..');
const t = C.make(JSON.parse(fs.readFileSync(path.join(R, 'data/casual-tree-v2.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(R, 'data/casual-tree.json'), 'utf8')));
const py = JSON.parse(require('node:child_process').execFileSync('python3', [path.join(R, 'tools/casual-tree-v2.py'), 'places-all'], { encoding: 'utf8' }));
const seeded = s => () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;

/* 1. 검사기와 같은 길 — 추천 × 장소(그 장소의 시대 · 손 자세가 바라는 특징이 있는 옷 계열) */
const feat = pr => [pr.right, pr.left].map(k => C.hand(t, k)).filter(h => h && h.outfit).map(h => h.outfit);
let pairs = 0;
for (const pr of t.v2.presets) {
  for (const pl of t.v1.places) {
    const era = pl.eras.includes('now') ? 'now' : pl.eras[0], e = C.era(t, era);
    const fam = t.v1.outfits.find(o => e.outfits.includes(o.key) && feat(pr).every(x => C.features(t, o.key, '').includes(x)));
    if (!fam) continue;
    pairs++;
    assert.equal(C.presetOk(t, { era, place: pl.key, ofam: fam.key }, pr.key), py[pr.key].includes(pl.key), pr.key + ' @ ' + pl.key);
  }
  assert(py[pr.key].length, pr.key + ' 쓸 장소');
}
assert(pairs > 3000, pairs);

/* 2. 다시 검사 뒤엔 걸리는 칸이 없다 */
function valid(sc, where) {
  for (const k of C.ORDER) if (sc[k]) assert.equal(C.why(t, sc, k, sc[k]), null, where + ' ' + k + '=' + sc[k] + ' ' + JSON.stringify(C.why(t, sc, k, sc[k])));
  for (const k of C.REQUIRED) assert(sc[k], where + ' 빈 칸 ' + k);
  if (C.propSides(sc)) assert(sc.use, where + ' 소품 동작');
  else assert(!sc.use, where + ' 손 없는 소품 동작');
  const r = C.hand(t, sc.right), l = C.hand(t, sc.left);
  if ((r && r.both) || (l && l.both)) assert.equal(sc.right, sc.left, where + ' 두 손 자세');
  const u = C.use(t, sc.use);
  if (u) assert.equal(u.hands === 'both', C.propSides(sc) === 2, where + ' 소품 손 수');
  const f = C.frame(t, sc.frame);
  if (!f.legs) assert(!sc.legs, where + ' 안 보이는 다리');
  assert.equal(sc.tree, 2);
}
const rnd = seeded(7);
for (let i = 0; i < 2000; i++) {
  const sc = C.random(t, {}, null, rnd, [], { preset: i % 2 === 0 });
  valid(sc, '랜덤 ' + i);
  if (i % 2 === 0 && sc.preset) assert(C.presetOk(t, sc, sc.preset), '랜덤 추천 ' + sc.preset);
}
/* 칸을 아무 값으로 바꿔도(트리 밖 값 포함) 다시 검사 뒤엔 맞다 */
const r2 = seeded(11);
for (let i = 0; i < 1500; i++) {
  let sc = C.random(t, {}, null, r2);
  const k = C.ORDER[Math.floor(r2() * C.ORDER.length)], pool = k === 'place' ? t.v1.places.map(p => p.key) : [].concat(...['hands', 'legs', 'postures', 'supports', 'gaze', 'body', 'prop_uses'].map(n => t.v2[n].map(x => x.key)), Object.keys(t.v2.frames), ['prop', 'nope']);
  sc = C.set(t, sc, k, pool[Math.floor(r2() * pool.length)]);
  valid(sc, '바꾸기 ' + i + ' ' + k);
}

/* 3. 프레이밍을 넓히지 않는다 — 전신 추천에서 클로즈업으로 바꾸면 손 · 다리 칸이 고쳐지고 프레이밍은 그대로 */
const base = { era: 'now', place: 'home_living', ofam: 'everyday' };
let s = C.repair(t, C.applyPreset(t, base, 'side_chair_cross'));
assert(C.presetOk(t, base, 'side_chair_cross'));
s = C.set(t, s, 'frame', 'face_close');
assert.equal(s.frame, 'face_close'); assert.equal(s.legs, ''); assert.notEqual(s.left, 'lap'); assert.equal(s.preset, '');
valid(s, '클로즈업으로');
/* 「화면 밖」 은 가까운 컷만, 가까운 컷엔 뒤쪽 몸 방향 없음 */
assert.equal(C.why(t, s, 'right', 'out'), null);
assert.equal(C.why(t, Object.assign({}, s, { frame: 'full_body' }), 'right', 'out').code, 'close');
assert.equal(C.why(t, s, 'body', 'back').code, 'far');
assert.equal(C.why(t, Object.assign({}, s, { frame: 'full_body' }), 'body', 'back'), null);
assert.equal(C.why(t, s, 'right', 'hip').code, 'zone');

/* 4. 두 손 — 두 손 자세는 다른 손도, 풀면 다른 손을 다시 고른다, 같은 데를 두 손이 쓰지 않는다 */
s = C.repair(t, Object.assign({}, base, { posture: 'stand', support: 'none', frame: 'waist_up' }));
s = C.set(t, s, 'left', 'arms_crossed');
assert.equal(s.right, 'arms_crossed'); assert.equal(s.left, 'arms_crossed');
s = C.set(t, s, 'right', 'hip');
assert.equal(s.right, 'hip'); assert.notEqual(s.left, 'arms_crossed'); valid(s, '두 손 풀기');
assert.equal(C.why(t, s, 'left', 'hip').code, 'same');
assert.equal(C.why(t, Object.assign({}, s, { right: 'shush' }), 'left', 'shush').code, 'same');
assert.equal(C.why(t, Object.assign({}, s, { right: 'out' }), 'left', 'out'), null);
/* 두 손 소품 동작 — 오른손 · 왼손이 다 소품이면 두 손 동작만, 하나면 한 손 동작만 */
s = C.set(t, C.set(t, Object.assign({}, s, { frame: 'waist_up' }), 'right', 'prop'), 'left', 'prop');
assert.equal(C.use(t, s.use).hands, 'both'); valid(s, '두 손 소품');
s = C.set(t, s, 'left', 'hip');
assert.equal(s.right, 'prop'); assert.equal(s.left, 'hip'); assert.equal(C.use(t, s.use).hands, 'one'); valid(s, '한 손 소품');

/* 5. 장소 받침 · 옷 특징 · 시대 소품 */
assert.equal(C.why(t, { era: 'now', place: 'home_living', posture: 'stand' }, 'posture', 'soak').code, 'place');
const wall = t.v1.places.find(p => C.placeHas(t, p.key).includes('wall')).key, nowall = t.v1.places.find(p => !C.placeHas(t, p.key).includes('wall')).key;
assert.equal(C.why(t, { place: wall }, 'posture', 'lean_wall'), null);
assert.equal(C.why(t, { place: nowall }, 'posture', 'lean_wall').code, 'place');
const pk = { era: 'now', place: 'home_living', ofam: 'everyday', item: 'jeans_tee', posture: 'stand', frame: 'waist_up' };
assert.equal(C.why(t, pk, 'right', 'pocket'), null);
assert.equal(C.why(t, Object.assign({}, pk, { ofam: 'bath', item: '' }), 'right', 'pocket').code, 'outfit');
assert(C.features(t, 'everyday', 'linen_dress').indexOf('pocket') < 0, '빼기');
const phone = C.prop(t, 'phone'), at = C.expand(t, phone.places)[0];
assert(C.propAt(t, phone, at, 'now')); assert(!C.propAt(t, phone, at, 'fantasy'));
/* 시선 — 소품이 없으면 「소품」 시선이 없고, 시선을 정하는 소품 동작은 그 시선만 */
assert.equal(C.why(t, pk, 'gaze', 'at_prop').code, 'noprop');
const fix = t.v2.prop_uses.find(u => u.gaze);
assert.equal(C.why(t, Object.assign({}, pk, { use: fix.key }), 'gaze', fix.gaze), null);
assert.equal(C.why(t, Object.assign({}, pk, { use: fix.key }), 'gaze', fix.gaze === 'camera' ? 'down' : 'camera').code, 'use');
/* 어색한 조합은 거르지 않고 표시만 */
const aw = t.v2.awkward[0], awPlace = C.expand(t, aw.places)[0];
assert(C.awkward(t, aw.outfits[0], awPlace).length);
assert.equal(C.why(t, { era: 'now', place: awPlace }, 'ofam', aw.outfits[0]), null);
/* 렌즈는 프레이밍에 따라 */
assert.equal(C.lens(t, 'face_close'), 'portrait85'); assert.equal(C.lens(t, 'full_body'), 'documentary35');

/* 6. 해방(🔓) 칸은 고치지 않는다 */
s = C.repair(t, Object.assign({}, pk, { right: 'hip', left: 'down', frame: 'face_close', unlocked: ['right'] }));
assert.equal(s.right, 'hip'); valid(Object.assign({}, s, { right: 'out' }), '해방 뒤');

/* 7. 랜덤 — 잠근 칸은 둔다, 씨앗이 같으면 같은 장면 */
const lk = C.random(t, { era: 'now', place: 'home_bedroom', frame: 'chest_up' }, null, seeded(3), ['era', 'place', 'frame']);
assert.equal(lk.place, 'home_bedroom'); assert.equal(lk.frame, 'chest_up'); valid(lk, '잠금');
assert.deepEqual(C.random(t, {}, null, seeded(5)), C.random(t, {}, null, seeded(5)));

/* 8. 버전1 기록 — 표시하고, 다시 고르면 옮긴다 */
const old = { era: 'now', place: 'water_pool', act: 'swim', ofam: 'swimwear', frame: 'chest_up', pose: '', orient: 'front', lens: 'portrait85' };
assert(C.isV1(old)); assert(!C.isV1({ tree: 2, act: 'x' }));
let n = C.fromV1(t, old);
assert.equal(n.posture, 'swim'); assert.equal(n.tree, 2); assert.equal(n.frame, 'chest_up'); assert.equal(n.body, 'front'); assert(!('act' in n) && !('lens' in n));
valid(n, '버전1 헤엄');
n = C.fromV1(t, { era: 'now', place: wall, act: (t.v1.activities.find(a => a.family === 'stand') || {}).key, ofam: 'everyday', frame: 'full_body', pose: 'leaning_wall', orient: 'over_shoulder' });
assert.equal(n.posture, 'lean_wall'); assert.equal(n.head, 'over_shoulder'); assert.equal(n.body, 'rear_3q'); valid(n, '버전1 벽');
n = C.fromV1(t, { era: 'now', place: 'home_living', act: 'read_book', ofam: 'everyday', frame: 'waist_up', pose: 'arms_crossed' });
assert.equal(n.right, 'arms_crossed'); assert.equal(n.left, 'arms_crossed'); valid(n, '버전1 팔짱');
n = C.fromV1(t, { cat: 'everyday', ex: '' });
assert(n.place && n.tree === 2 && !('cat' in n)); valid(n, '아주 예전 갈래');
for (const row of Object.values(t.v2.legacy.orients)) for (const [k, v] of Object.entries(row)) assert.equal(C.why(t, { frame: 'full_body' }, k, v), null, k + ' ' + v);

console.log('casual-tree-v2 모듈 ok — 추천×장소', pairs, '· 랜덤 2000 · 바꾸기 1500');
