/* 일상컷 트리 표 ↔ 생성기 표 — 자세 계열의 자세·방향 열쇠가 생성기에 있다. node tests/casual-tree.cjs */
const assert = require('node:assert'), fs = require('node:fs'), path = require('node:path');
global.window = global; require('../lib/prompt-spec.js'); require('../lib/casual-tree.js');
const S = window.AtelierSpec, tree = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree.json'), 'utf8'));
const poses = new Set(S.POSE_OPTIONS.map(r => r[0]).filter(Boolean)), orients = new Set(S.ORIENTATION_OPTIONS.map(r => r[0]).filter(Boolean));
for (const [k, f] of Object.entries(tree.families)) {
  for (const p of f.poses) assert(poses.has(p), k + ' 자세 ' + p);
  for (const o of f.orients) assert(orients.has(o), k + ' 방향 ' + o);
}
/* 눕기 계열엔 등 쪽·뒤돌아보기 방향이 없다 — 해먹에 누워 등을 돌리고 다리를 늘어뜨리라 해서 몸이 반 바퀴 비틀렸다(조조전 일상4, 2026-10-29) */
for (const o of [...S.LOOK_BACK.orient, 'back_to_camera', 'walking_away']) assert(!tree.families.lie.orients.includes(o), '눕기 계열에 ' + o);
/* 서기·움직임 계열엔 「뒤로 젖혀 기대기(받침 필요)」 가 없다 — 「인사하며 숙이기」 에 붙어 부딪혔다(조조전 일상2) */
for (const f of ['stand', 'move']) assert(!tree.families[f].orients.includes('leaning_back'), f + ' 계열에 뒤로 젖히기');
/* 어느 자세도 한 계열에는 든다 — 고를 수 없는 자세가 없게 */
const used = new Set(Object.values(tree.families).flatMap(f => f.poses));
for (const p of poses) assert(used.has(p), '어느 자세 계열에도 없는 자세 ' + p);
/* 화면·조립이 쓰는 lib/casual-tree.js 와 검사기 tools/casual-tree.py 가 같은 길을 센다 */
const CT = window.AtelierCasualTree;
let paths = 0;
for (const e of tree.eras) for (const p of CT.places(tree, e.key, null)) for (const a of CT.acts(tree, e.key, p.key)) {
  paths++;
  assert(CT.outfitFamilies(tree, e.key, p.key, a.key).length, e.key + ' ' + p.key + ' ' + a.key + ' 옷 계열');
}
const py = require('node:child_process').execFileSync('python3', [path.join(__dirname, '../tools/casual-tree.py'), 'check'], { encoding: 'utf8' });
assert.equal(paths, Number(/길 (\d+)/.exec(py)[1]), '검사기와 길 수가 같다');
/* 추천 조합을 채우면 고칠 것이 없다 — 다 트리 위의 길 */
for (const pr of tree.presets) {
  const sc = CT.applyPreset(tree, {}, pr.key), r = CT.repair(tree, sc, null, S.CLOSE_FRAMES);
  for (const k of ['era', 'place', 'act', 'ofam', 'item']) assert.equal(r[k], sc[k], pr.key + ' ' + k);
}
console.log(`PASS 일상컷 트리 ↔ 생성기: 자세 계열 ${Object.keys(tree.families).length} · 자세 ${used.size} · 방향 열쇠 · 길 ${paths}(검사기와 같다) · 추천 조합 ${tree.presets.length}`);
