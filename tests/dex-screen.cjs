/* 도감 — 목록(최근 추가·장르·거르기·진척)·상세(나란히 보기 여섯 칸·일상컷·크게 보기·넘기기·주소·뒤로 가기)·게임 글(능력·배경·사실 칸).
   등록부는 data/img.json 그대로. 옆에 그림 저장소(../game-atelier-img)가 있으면 그림도 받는다.
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dex-screen.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { start, FOLD } = require('./browser-harness.cjs');
const art = path.resolve(__dirname, '..', '..', 'game-atelier-img');
const img = JSON.parse(fs.readFileSync('data/img.json', 'utf8')), design = JSON.parse(fs.readFileSync('data/game-design.json', 'utf8'));
const withArt = Object.keys(img.img);
(async () => {
  const h = await start();
  try {
    for (const [name, vp, mobile] of [['fold', FOLD.inner, true], ['phone', { width: 390, height: 844 }, true], ['pc', { width: 1280, height: 900 }, false]]) {
      const a = await h.open('dex.html', { viewport: vp, mobile, ...(fs.existsSync(art) ? { imgRoot: art } : {}) }), p = a.page;
      await p.waitForSelector('.grid .cell');
      assert.equal(await p.locator('.grid .cell').count(), design.games.length, name + ' 게임마다 한 칸');
      assert.deepEqual(await p.$$eval('.grid .cell .face img', es => es.length), withArt.length, name + ' 그림 있는 게임만 그림');
      assert((await p.$eval('#dex-progress', e => e.textContent)).includes('/ 60'), name + ' 그림 자리 열 편 × 여섯');
      assert(await p.locator('.recent-cell').count() > 0, name + ' 최근 추가');
      /* 장르로 거르기 */
      await p.locator('.genre-strip button', { hasText: '퍼즐' }).click();
      assert.deepEqual(await p.$$eval('.grid .cell', es => es.map(e => e.dataset.card)), ['tetris'], name + ' 퍼즐만');
      await p.locator('.genre-strip button').first().click();
      /* 상세 */
      await p.click('.grid .cell[data-card=tetris]'); await p.waitForSelector('#detail-title');
      assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('game')), 'tetris', name + ' 주소');
      assert.equal(await p.$$eval('.fcell:not(:disabled)', es => es.length), 6, name + ' 폼 셋·개방 셋');
      assert.equal(await p.locator('.gal .cell[data-cut=casual]').count(), 7, name + ' 일상컷 일곱');
      const story = await p.$eval('.reading-notes', e => e.textContent);
      for (const want of ['자리 셋을 모두 채우면', '격자선만 그어진 고요한 우물', '일곱 블록', '1984']) assert(story.includes(want), name + ' 게임 글: ' + want);
      assert.equal(await p.$eval('#dex-to-prompt', e => e.getAttribute('href')), 'prompt.html?game=tetris');
      /* 크게 보기 — 넘기기·닫기 */
      await p.click('.big .zoom'); await p.waitForSelector('.zoom-layer');
      await p.keyboard.press('ArrowRight');
      assert.match(await p.$eval('.zoom-bar b', e => e.textContent), /중반/, name + ' 크게 보기 넘기기');
      await p.keyboard.press('Escape'); await p.waitForSelector('.zoom-layer', { state: 'detached' });
      /* 다음 게임 · 뒤로 가기 */
      await p.click('#dex-card-next');
      await p.waitForFunction(() => new URLSearchParams(location.search).get('game') !== 'tetris');
      await p.goBack(); await p.waitForSelector('.grid .cell');
      assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('game')), null, name + ' 뒤로 가기면 목록');
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name + ' 가로로 넘친다');
      assert.deepEqual(a.errors, []);
      assert.deepEqual(await p.evaluate(() => window.AtelierWords.missing()), [], name + ' 낱말 표에 없는 열쇠');
      await a.close();
    }
    /* 바로가기 — 첫 화면의 게임 이름이 도감의 그 게임으로 */
    const b = await h.open('index.html', { viewport: { width: 390, height: 844 }, mobile: true });
    await b.page.waitForSelector('.first-title');
    assert.equal(await b.page.$eval('.first-title', e => e.getAttribute('href')), 'dex.html?game=' + design.games[0].key);
    await b.close();
    console.log('PASS 도감: 열 편 · 그림 있는 게임만 · 진척 60 · 최근 추가 · 장르 · 상세 여섯 칸·일상컷 일곱·게임 글 · 크게 보기 · 다음 게임·뒤로 가기 · 첫 화면 바로가기 · 세 크기');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
