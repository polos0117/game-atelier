/* 도트 게임 — 첫 화면 바닥 띠 · 도감 상세의 도트 줄 · 목록의 「도트」 표 (data/sprites.json · lib/sprite-actor.js).
   도트 자료는 시험 자료(그림이 등록된 앞 두 게임)를 opt.files 로 주고, 그림은 tests/fixtures/make-sprites.py 가 임시 자리에 그린다.
   - 첫 화면: 도트가 있으면 첫 묶음 아래 띠에 서서 거닌다(좁으면 둘), 이름은 게임 제목, 누르면 그 게임의 도감(?game=)
   - 도트 자료가 비면 띠째 없다(첫 묶음은 그대로)
   - 도감: 도트 있는 게임의 상세에 작은 무대(누르면 반응), 없는 게임은 없다 · 목록 칸에 「도트」 표
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dot-screen.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const { start } = require('./browser-harness.cjs');
const ROOT = path.resolve(__dirname, '..');
const design = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/game-design.json'), 'utf8')).games;
const withArt = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/img.json'), 'utf8')).img).filter(k => design.some(g => g.key === k));
assert(withArt.length >= 3, '그림이 등록된 게임이 셋은 있어야 한다');
const [A, B, NONE] = withArt;
const title = k => design.find(g => g.key === k).title;
const actor = id => ({ card: id, id, form: 'base', cell: [96, 128], foot: [48, 126], scale: 1, flip: true, facing: 'right', states: {
  still: { file: id + '/' + id + '_base_still.png', frames: 1 },
  idle: { file: id + '/' + id + '_base_idle.png', frames: 4, order: [0, 1, 2, 3], ms: [300, 200, 140, 200] },
  walk: { file: id + '/' + id + '_base_walk.png', frames: 6, order: [0, 1, 2, 3, 4, 5], ms: [120, 120, 120, 120, 120, 120], speed: 60, dy: [0, 1, -1, 0, 1, -1] },
  react: { file: id + '/' + id + '_base_react.png', frames: 4, order: [0, 1, 2, 3], ms: [100, 120, 160, 120] } } });
const SPRITES = { base: 'https://polos0117.github.io/game-atelier-img/sprites/', actors: { [A]: actor(A), [B]: actor(B) } };
const art = fs.mkdtempSync(path.join(os.tmpdir(), 'game-dot-'));
fs.writeFileSync(path.join(art, 'sprites.json'), JSON.stringify(SPRITES));
execFileSync('python3', [path.join(__dirname, 'fixtures', 'make-sprites.py'), path.join(art, 'sprites.json'), art]);
const opt = (extra = {}) => ({ viewport: { width: 390, height: 844 }, mobile: true, imgRoot: art, files: { 'data/sprites.json': SPRITES }, ...extra });

(async () => {
  const h = await start();
  let n = 0;
  try {
    /* ── 첫 화면 ── */
    let s = await h.open('index.html', opt()), p = s.page;
    await p.waitForSelector('.home-dots:not([hidden]) .sprite-actor:not([hidden])', { timeout: 15000 });
    assert.equal(await p.locator('.home-dots .sprite-actor').count(), 2, '좁으면 둘');
    /* 띠는 스무 칸 아래라 화면 밖 — 재생기는 화면 밖이면 쉰다. 보이게 내려야 걷는다 */
    await p.locator('.home-dots').scrollIntoViewIfNeeded();
    await p.waitForFunction(() => [...document.querySelectorAll('.home-dots .sprite-actor')].every(a => a.sprite.running), null, { timeout: 5000 });
    const labels = await p.$$eval('.home-dots .sprite-actor', es => es.map(e => e.getAttribute('aria-label')));
    assert(labels.every(l => /도트 — 눌러서 도감 보기/.test(l)), '누르는 이름 — ' + labels.join(' | '));
    assert(labels.some(l => l.includes(title(A))) && labels.some(l => l.includes(title(B))), '이름은 게임 제목 — ' + labels.join(' | '));
    const g = await p.evaluate(() => { const f = document.querySelector('.home-dots').getBoundingClientRect(); return [...document.querySelectorAll('.home-dots .sprite-actor')].every(e => { const r = e.getBoundingClientRect(); return r.left >= f.left - 1 && r.right <= f.right + 1; }); });
    assert(g, '인물은 띠 안');
    await p.waitForFunction(() => [...document.querySelectorAll('.home-dots .sprite-actor')].some(a => a.sprite.debug().state === 'walk'), null, { timeout: 15000 });
    const who = await p.locator('.home-dots .sprite-actor').first().getAttribute('data-who');
    await Promise.all([p.waitForURL(/dex\.html\?game=/), p.locator('.home-dots .sprite-actor').first().click({ force: true })]);
    assert.equal(new URL(p.url()).searchParams.get('game'), who, '누르면 그 게임의 도감');
    assert.deepEqual(s.errors, []);
    await s.close();
    n += 3;

    /* 자료가 비면 띠째 없다 */
    s = await h.open('index.html', opt({ files: { 'data/sprites.json': { base: SPRITES.base, actors: {} } } })); p = s.page;
    await p.waitForSelector('.first-list .first-card');
    await new Promise(ok => setTimeout(ok, 600));
    assert.equal(await p.locator('.home-dots:not([hidden])').count(), 0, '빈 자료 → 띠 없음');
    assert.deepEqual(s.errors, []);
    await s.close();
    n++;

    /* ── 도감 — 상세의 무대, 누르면 반응 ── */
    s = await h.open('dex.html?game=' + encodeURIComponent(A), opt()); p = s.page;
    await p.waitForSelector('.dex-dot:not([hidden]) .sprite-actor', { timeout: 15000 });
    assert.equal(await p.locator('.dex-dot').getAttribute('data-card'), A);
    assert.match(await p.locator('.dex-dot .sprite-actor').getAttribute('aria-label'), new RegExp(title(A) + ' 도트 — 눌러서 반응'));
    await p.locator('.dex-dot .sprite-actor').click({ force: true });
    await p.waitForFunction(() => document.querySelector('.dex-dot .sprite-actor').sprite.debug().state === 'react', null, { timeout: 5000 });
    assert.deepEqual(s.errors, []);
    await s.close();
    n++;

    /* 도트 없는 게임은 무대가 없다 */
    s = await h.open('dex.html?game=' + encodeURIComponent(NONE), opt()); p = s.page;
    await p.waitForSelector('#detail-title');
    await new Promise(ok => setTimeout(ok, 600));
    assert.equal(await p.locator('.dex-dot:not([hidden])').count(), 0, '도트 없는 게임 → 무대 없음');
    assert.deepEqual(s.errors, []);
    await s.close();
    n++;

    /* 목록 — 도트 있는 게임의 칸에 「도트」 표 */
    s = await h.open('dex.html', opt({ viewport: { width: 1280, height: 900 }, mobile: false })); p = s.page;
    await p.waitForSelector(`.cell[data-card="${A}"]`, { timeout: 15000 });
    await p.waitForSelector(`.cell[data-card="${A}"] .dot-badge`, { timeout: 10000 });
    assert.equal(await p.locator(`.cell[data-card="${A}"] .dot-badge`).first().textContent(), '도트');
    assert.equal(await p.locator(`.cell[data-card="${NONE}"] .dot-badge`).count(), 0, '도트 없는 게임 칸에는 표 없음');
    assert.deepEqual(s.errors, []);
    await s.close();
    n++;
  } finally {
    await h.stop();
    fs.rmSync(art, { recursive: true, force: true });
  }
  console.log('PASS 도트 게임: ' + n + '가지 · 첫 화면 바닥 띠(좁으면 둘·게임 제목·띠 안·누르면 도감) · 빈 자료면 띠 없음 · 도감 상세 무대(누르면 반응)·없는 게임은 없음 · 목록 「도트」 표');
})().catch(e => { console.error(e); process.exit(1); });
