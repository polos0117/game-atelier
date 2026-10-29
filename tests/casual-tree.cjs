/* 일상컷 트리 표 ↔ 생성기 표 — 자세 계열의 자세·방향 열쇠가 생성기에 있다. node tests/casual-tree.cjs */
const assert = require('node:assert'), fs = require('node:fs'), path = require('node:path');
global.window = global; require('../lib/prompt-spec.js');
const S = window.AtelierSpec, tree = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/casual-tree.json'), 'utf8'));
const poses = new Set(S.POSE_OPTIONS.map(r => r[0]).filter(Boolean)), orients = new Set(S.ORIENTATION_OPTIONS.map(r => r[0]).filter(Boolean));
for (const [k, f] of Object.entries(tree.families)) {
  for (const p of f.poses) assert(poses.has(p), k + ' 자세 ' + p);
  for (const o of f.orients) assert(orients.has(o), k + ' 방향 ' + o);
}
/* 어느 자세도 한 계열에는 든다 — 고를 수 없는 자세가 없게 */
const used = new Set(Object.values(tree.families).flatMap(f => f.poses));
for (const p of poses) assert(used.has(p), '어느 자세 계열에도 없는 자세 ' + p);
console.log(`PASS 일상컷 트리 ↔ 생성기: 자세 계열 ${Object.keys(tree.families).length} · 자세 ${used.size} · 방향 열쇠`);
