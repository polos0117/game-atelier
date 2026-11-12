/* 도감 크게 보기의 즐겨찾기 하트(2026-11-12) — 폴드 덮개 344×882 터치.
   - 넘겨 보는 그 그림을 담는다. 칸은 상세 하트와 똑같다(a·key·file·title·sub·thumb·full·link ?game=&pic=)
   - 넘기면 그 그림의 상태, 돌아오면 다시 찬 하트, 닫으면 상세 하트도 같다
   - 하트 44px · 화면 안 · 옆으로 안 넘친다 · 알림이 아래 넘기기 단추를 안 덮는다
   - 저장이 막힌 브라우저에서는 담겼다고 하지 않는다
   CHROMIUM_PATH=<chrome> node tests/dex-favorites.cjs */
const assert = require('node:assert/strict');
const { start, FOLD } = require('./browser-harness.cjs');
const fs = require('node:fs'), vm = require('node:vm');
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync('lib/words.js', 'utf8'), ctx);
const W = ctx.window.W;
const STORE = 'atelier_favorites_v1';
(async () => {
  const h = await start();
  try {
    const a = await h.open('dex.html?game=tetris', { viewport: FOLD.cover, mobile: true }), p = a.page;
    await p.locator('#dex-fav').waitFor({ timeout: 30000 });
    const stored = () => p.evaluate(k => JSON.parse(localStorage.getItem(k) || '[]'), STORE);
    const zFile = () => p.evaluate(() => decodeURIComponent(document.querySelector('.zoom-body > img').getAttribute('src').split('?')[0].split('/').pop()));
    /* 상세 하트가 쓰는 칸 — 담았다 빼서 견줄 본을 얻는다 */
    await p.locator('#dex-fav').tap(); await p.waitForTimeout(100);
    const fromDetail = (await stored())[0];
    await p.locator('#dex-fav').tap(); await p.waitForTimeout(100);
    assert.equal((await stored()).length, 0, '상세 하트로 뺐다');

    await p.locator('.big .zoom').tap();
    await p.locator('.zoom-layer #zoom-fav').waitFor({ timeout: 10000 });
    const fav = p.locator('#zoom-fav'), z1 = await zFile();
    assert((await fav.textContent()).includes(W('dex.fav')) && await fav.getAttribute('aria-pressed') === 'false', '하트에 이름 · 처음엔 비었다');
    await fav.tap(); await p.waitForTimeout(150);
    const list = await stored();
    assert.equal(list.length, 1, '하나 담김');
    const { at: _a, ...got } = list[0], { at: _b, ...want } = fromDetail;
    assert.deepEqual(got, want, '크게 보기 칸 = 상세 칸');
    assert.equal(got.file, z1, '보고 있는 그림');
    assert.equal(new URL(got.link, 'http://x').searchParams.get('pic'), z1, 'link 의 pic');
    assert.equal(await fav.getAttribute('aria-pressed'), 'true', '하트가 찬다');
    assert.equal(await p.locator('.zoom-layer .fav-toast').textContent(), W('dex.fav.added'), '알림');
    const box = await p.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect(), f = r('#zoom-fav'), t = r('.zoom-layer .fav-toast');
      const hit = b => !(t.right <= b.left || t.left >= b.right || t.bottom <= b.top || t.top >= b.bottom);
      return { h: f.height, r: f.right, l: f.left, w: innerWidth, sw: document.documentElement.scrollWidth,
        cover: hit(r('.zoom-prev')) || hit(r('.zoom-next')) || hit(r('.zoom-close')) || hit(f) };
    });
    assert(box.h >= 44 && box.l >= 0 && box.r <= box.w + 1, '하트 44px · 화면 안 ' + JSON.stringify(box));
    assert(box.sw <= box.w + 1, '옆으로 넘친다 ' + JSON.stringify(box));
    assert(!box.cover, '알림이 단추를 덮는다 ' + JSON.stringify(box));
    await p.locator('.zoom-next').tap(); await p.waitForTimeout(300);
    assert.notEqual(await zFile(), z1, '넘겼다');
    assert.equal(await fav.getAttribute('aria-pressed'), 'false', '넘기면 그 그림의 상태(안 담김)');
    await p.locator('.zoom-prev').tap(); await p.waitForTimeout(300);
    assert.equal(await fav.getAttribute('aria-pressed'), 'true', '돌아오면 다시 찬 하트');
    await p.locator('.zoom-close').tap(); await p.locator('.zoom-layer').waitFor({ state: 'detached' });
    assert.equal(await p.locator('#dex-fav').getAttribute('aria-pressed'), 'true', '닫으면 상세 하트도 차 있다');
    assert.deepEqual(a.errors, []);
    await a.close();

    /* 저장이 막힌 브라우저 — 던지지 않고 못 담았다고 한다 */
    const b = await h.open('dex.html?game=tetris', { viewport: FOLD.cover, mobile: true,
      init: () => { const no = () => { throw new DOMException('blocked', 'SecurityError'); }; Storage.prototype.setItem = no; Storage.prototype.getItem = no; } });
    await b.page.locator('.big .zoom').waitFor({ timeout: 30000 });
    await b.page.locator('.big .zoom').tap();
    await b.page.locator('#zoom-fav').tap(); await b.page.waitForTimeout(150);
    assert.equal(await b.page.locator('#zoom-fav').getAttribute('aria-pressed'), 'false', '막혔으면 안 찬다');
    assert.equal(await b.page.locator('.zoom-layer .fav-toast').textContent(), W('dex.fav.blocked'), '막혔다는 알림');
    assert.deepEqual(b.errors, []);
    await b.close();
    console.log('PASS 도감 크게 보기 하트: 상세와 같은 칸 · 넘기면 그 그림 상태 · 닫으면 상세와 같음 · 44px · 안 넘침 · 알림 자리 · 저장 막힘 (344×882)');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
