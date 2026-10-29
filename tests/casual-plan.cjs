/* 일상컷 묶음 계획기. node tests/casual-plan.cjs
   - 스무 편 × 씨앗 셋 — 다섯 칸이 묶음 규칙을 다 지키고, 기록·지시문이 생성기 조립과 같다
   - 이미 있는 컷이 있으면 그 위에 더 짜도 규칙을 지킨다
   - 규칙 검사가 겹침·필수 갈래 없음·트리 밖 값을 건다 */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm');
const C = require('../tools/casual-plan.cjs');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/casual-tree.js', 'lib/prompt-game.js']) vm.runInContext(read(f), ctx);
const P = ctx.window.AtelierPrompt, tree = JSON.parse(read('data/casual-tree.json')), design = JSON.parse(read('data/game-design.json'));
const style = JSON.parse(read('data/style.json')), gs = style.styles[style.default], cur = gs.versions.find(v => v.v === gs.current);

let n = 0;
for (const g of design.games) for (const seed of [1, 2, 3]) {
  const res = C.plan(g, [1, 2, 3, 4, 5], [], { seed });
  assert.equal(res.cuts.length, 5);
  assert.deepEqual(C.check(res.cuts, g), [], g.key + ' ' + seed);
  assert(res.cuts.some(c => C.requiredType(c) === res.required), g.key + ' 필수 갈래 ' + res.required);
  assert(res.cuts.every(c => c.item), g.key + ' 옷은 구체적으로');
  for (const c of res.cuts) {
    const rec = C.record(g, c), sc = rec.storage.cards[g.key].scenes.casual;
    assert.equal(rec.file, `${g.key}_glossy_kr_game_f_casual${c.n}.webp`);
    assert.equal(rec.record, `records/${g.key}/casual${c.n}-ui.json`);
    assert(rec.prompt.includes('STYLE: ' + cur.casual) && rec.prompt.endsWith('FINAL CHECK: ' + cur.check), '화풍 판의 일상 문장·점검');
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
assert.match(errs(cs => { cs[2].pose = 'walking'; cs[2].act = 'wait_train'; cs[2].place = 'travel_rural_station'; cs[2].era = 'now'; return cs; }), /트리에서 못 고른다|장소/);
/* 기록 폴더 읽기 — 예전 갈래·예시 기록도 변환표로 */
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plan-'));
fs.writeFileSync(path.join(dir, 'casual1-ui.json'), JSON.stringify({ game: g.key, storage: { cards: { [g.key]: { scenes: { casual: { cat: 'travel_exploration', ex: 'travel_station', frame: 'face_close', orient: 'looking_down', lens: 'telephoto135' } } } } } }));
const old = C.oldCuts(dir, g);
assert(old.length === 1 && old[0].place === 'travel_rural_station' && old[0].n === 1, '예전 기록 → 트리 길');
console.log(`PASS 일상컷 묶음 계획: 스무 편 × 씨앗 셋 ${n}묶음 규칙·기록·고정값 · 필수 갈래 돌리기 · 있는 컷 위에 더 짜기 · 규칙 검사 · 예전 기록`);
