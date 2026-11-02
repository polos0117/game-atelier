/* 진열장의 셈(lib/shelf.js) — 화면 없이. node tests/shelf.cjs
   - 쉰 편이 모두 한 자리에(시대 칸 · PC 바탕화면 · PC 「게임」 폴더), 매체는 설계표 package 그대로
   - 칸 안은 받은 발매 연도 차례, 그림 없는 게임은 빈 상자(drawn false)로 남는다
   - 본편은 폼 · 개방 차례로 있는 것만, 크레딧은 받은 사실 칸만(안 받았으면 없다 · 플랫폼은 여덟까지) */
const assert = require('node:assert/strict'), fs = require('node:fs');
require('../lib/shelf.js');   /* window 가 없으면 globalThis 에 붙는다 */
const S = globalThis.AtelierShelf;
const design = JSON.parse(fs.readFileSync('data/game-design.json', 'utf8')), imgDoc = JSON.parse(fs.readFileSync('data/img.json', 'utf8'));
const style = JSON.parse(fs.readFileSync('data/style.json', 'utf8')).default;
const lay = S.build(design, imgDoc, style);
const placed = [...lay.shelves.flatMap(r => r.items), ...lay.pc.online, ...lay.pc.download];

/* 한 자리씩 */
assert.equal(placed.length, design.games.length, '모든 게임이 한 번씩');
assert.equal(new Set(placed.map(x => x.key)).size, design.games.length, '겹침 없이');
for (const it of lay.pc.online) assert.equal(it.media, 'pc_online', it.key);
for (const it of lay.pc.download) assert.equal(it.media, 'pc_download', it.key);
assert.deepEqual([...lay.shelves.map(r => r.era)], [...S.ERAS].filter(e => lay.shelves.some(r => r.era === e)), '칸은 시대 차례');
for (const r of lay.shelves) {
  for (const it of r.items) { assert.equal(it.era, r.era, it.key + ' 제 시대 칸'); assert(!/^pc_/.test(it.media), it.key + ' 실물 매체만'); }
  const ys = r.items.map(x => x.game.facts.year).filter(Boolean);
  assert.deepEqual(ys, ys.slice().sort((a, b) => a - b), r.era + ' 칸은 발매 연도 차례');
}
for (const g of design.games) assert(S.MEDIA.includes(g.package), g.key + ' 매체가 정한 말');
assert.deepEqual(design.vocab.package, [...S.MEDIA], '설계표 vocab.package 와 셈의 매체가 같다');

/* 빈 상자 — 등록부에 그림이 없는 게임 */
const drawn = new Set(Object.keys(imgDoc.img).filter(k => S.slides(imgDoc.img[k], S.styleOf(imgDoc.img[k], style)).length));
for (const it of placed) assert.equal(it.drawn, drawn.has(it.key), it.key + (it.drawn ? ' 그림 있음' : ' 빈 상자'));
const sealed = placed.filter(x => !x.drawn);
assert(sealed.every(x => x.cover === null), '빈 상자는 겉그림이 없다');

/* 본편 — 폼 · 개방 차례, 없는 자리는 건너뛴다 */
const full = Object.keys(imgDoc.img).find(k => S.slides(imgDoc.img[k], style).length === 6);
assert(full, '폼 여섯 칸이 다 있는 게임이 하나는 있다');
assert.deepEqual([...S.slides(imgDoc.img[full], style).map(s => s.form + (s.open ? '_open' : ''))], ['title', 'title_open', 'middle', 'middle_open', 'ending', 'ending_open']);
const part = { byStyle: { x: { byForm: { title: { f: 'a.webp' }, ending_open: { f: 'b.webp' } }, casual: { f: ['c1.webp', 'c2.webp'] } } } };
assert.deepEqual([...S.slides(part, 'x').map(s => s.file)], ['a.webp', 'b.webp'], '없는 자리는 건너뛴다');
assert.deepEqual([...S.casuals(part, 'x')], ['c1.webp', 'c2.webp'], '크레딧 그림은 일상컷');
assert.equal(S.styleOf(part, 'none'), 'x', '기본 화풍에 그림이 없으면 있는 화풍');
assert.equal(S.item({ key: 'k', package: 'cd_case', era: 'hd' }, { byStyle: { x: { byForm: { middle: { f: 'm.webp' } } } } }, 'x').cover, 'm.webp', '타이틀이 없으면 다른 폼을 겉그림으로');

/* 크레딧 — 받은 사실 칸만 */
const g0 = design.games.find(g => g.facts.fetched && g.facts.developer.length);
const c0 = S.credits(g0);
assert.deepEqual([...c0.find(r => r.role === 'developer').names], g0.facts.developer.map(x => x.ko || x.en || x.qid).filter((v, i, a) => a.indexOf(v) === i));
assert.equal(c0.find(r => r.role === 'released').names[0], String(g0.facts.year));
assert.equal(S.credits({ facts: { fetched: null, developer: [{ qid: 'Q1', ko: '지어낸 곳' }] } }).length, 0, '안 받은 사실 칸은 크레딧에 없다');
const many = { facts: { fetched: '2026-11-02', platforms: Array.from({ length: 11 }, (_, i) => ({ qid: 'Q' + (i + 1), en: 'P' + i })) } };
const pl = S.credits(many).find(r => r.role === 'platforms');
assert(pl.names.length === S.CREDIT_PLATFORMS && pl.more === 11 - S.CREDIT_PLATFORMS, '플랫폼은 여덟까지 · 나머지는 외 n종');
for (const g of design.games) for (const r of S.credits(g)) assert(r.names.every(n => n && typeof n === 'string'), g.key + ' 크레딧 이름이 빈칸');

/* 로딩 꼴 */
assert.equal(S.loading({ package: 'pc_online' }), 'launcher');
assert.equal(S.loading({ package: 'pc_download' }), 'download');
assert.equal(S.loading({ package: 'cd_case' }), 'cd_case');

console.log('PASS 진열장 셈: ' + placed.length + '편 — 시대 칸 ' + lay.shelves.length + ' · 바탕화면 ' + lay.pc.online.length + ' · 게임 폴더 ' + lay.pc.download.length +
  ' · 빈 상자 ' + sealed.length + ' · 본편 폼·개방 차례 · 크레딧은 받은 사실 칸만');
