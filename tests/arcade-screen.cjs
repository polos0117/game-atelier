/* 첫 화면 오락실(lib/arcade.js·.css) — 배경 무대 · 기기 줄 · 첫 묶음 카드는 그대로.
   - 무대가 선다(높이 260 이상), 그 안에 도트 바닥 띠 자리(인물은 tests/dot-screen.cjs 가 본다)
   - 기기 줄: 설계표의 게임 수만큼, 차례도 설계표대로, 간판은 제목, 묶음 색, 누르면 그 게임의 도감(?game=)
   - 그림이 등록된 게임은 화면에 썸네일 <img>, 없는 게임은 「그림 준비 중」
   - 네 크기(344·390·844 가로·1280)에서 쪽이 옆으로 안 넘친다(기기 줄만 제 안에서 구른다), 화면 오류 없음
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/arcade-screen.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { start } = require('./browser-harness.cjs');
const ROOT = path.resolve(__dirname, '..');
const games = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/game-design.json'), 'utf8')).games;
const img = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/img.json'), 'utf8')).img;
const withArt = games.filter(g => img[g.key]).map(g => g.key), noArt = games.filter(g => !img[g.key]).map(g => g.key);

(async () => {
  const h = await start();
  let n = 0;
  try {
    let s = await h.open('index.html', { viewport: { width: 390, height: 844 }, mobile: true }), p = s.page;
    await p.waitForSelector('.arcade-row .cabinet', { timeout: 15000 });
    const scene = await p.locator('.arcade-scene').boundingBox();
    assert(scene && scene.height >= 260, '무대 높이 ' + JSON.stringify(scene));
    assert.equal(await p.locator('.arcade-scene .home-dots').count(), 1, '무대 안에 바닥 띠 자리');
    const cabs = await p.$$eval('.arcade-row .cabinet', es => es.map(e => ({ key: e.dataset.game, group: e.dataset.group, href: e.getAttribute('href'), title: e.querySelector('.cabinet-marquee').textContent, img: !!e.querySelector('.cabinet-screen img'), off: !!e.querySelector('.cabinet-off'), label: e.getAttribute('aria-label') })));
    assert.deepEqual(cabs.map(c => c.key), games.map(g => g.key), '게임마다 기기 하나, 설계표 차례');
    assert(cabs.every((c, i) => c.title === games[i].title && c.group === games[i].group && c.href === 'dex.html?game=' + encodeURIComponent(c.key) && c.label.includes(games[i].title)), '간판·묶음·길·이름');
    assert(withArt.every(k => cabs.find(c => c.key === k).img), '그림 있는 게임은 화면에 그림');
    assert(noArt.every(k => cabs.find(c => c.key === k).off), '그림 없는 게임은 꺼진 화면');
    assert.equal(await p.locator('.first-list .first-card').count(), games.length, '첫 묶음 카드는 그대로');
    await Promise.all([p.waitForURL(/dex\.html\?game=/), p.locator('.arcade-row .cabinet').first().click()]);
    assert.equal(new URL(p.url()).searchParams.get('game'), games[0].key, '기기를 누르면 그 게임의 도감');
    assert.deepEqual(s.errors, []);
    await s.close();
    n += 4;

    for (const [w, hh] of [[344, 882], [390, 844], [844, 390], [1280, 900]]) {
      s = await h.open('index.html', { viewport: { width: w, height: hh }, mobile: w < 1000 }); p = s.page;
      await p.waitForSelector('.arcade-row .cabinet', { timeout: 15000 });
      const r = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, row: document.querySelector('.arcade-row').scrollWidth > document.querySelector('.arcade-row').clientWidth, scene: document.querySelector('.arcade-scene').getBoundingClientRect().height }));
      assert(r.over <= 1, w + ' 옆으로 넘친다 ' + r.over);
      assert(r.scene >= 200 && r.scene <= 520, w + ' 무대 높이 ' + r.scene);
      if (w < 1000) assert(r.row, w + ' 기기 줄은 제 안에서 구른다');
      assert.deepEqual(s.errors, [], w + ' 화면 오류');
      await s.close();
      n++;
    }
  } finally { await h.stop(); }
  console.log('PASS 오락실: ' + n + '가지 · 무대·바닥 띠 자리 · 기기 줄(게임마다 하나·차례·간판·묶음·길·그림/꺼짐) · 첫 묶음 그대로 · 누르면 도감 · 네 크기 옆으로 안 넘침');
})().catch(e => { console.error(e); process.exit(1); });
