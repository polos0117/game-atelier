/* 진열장(shelf.html) — 시대 칸의 패키지 · PC 바탕화면 · 「게임」 폴더 창 · 빈 상자 · 고르면 팝업(×·Esc·바깥 누르기) · 켜기(로딩 → 본편 → 엔딩 크레딧) · 끄기 · 뒤로 가기 · 도감 바로가기 · 폰에서 PC 크기.
   옆에 그림 저장소(../game-atelier-img)가 있으면 그림도 받는다. Motion 사본은 ESM_DIR 의 motion/dist/motion.js(없어도 화면은 돈다).
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/shelf-screen.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { start, FOLD } = require('./browser-harness.cjs');
const art = path.resolve(__dirname, '..', '..', 'game-atelier-img');
const design = JSON.parse(fs.readFileSync('data/game-design.json', 'utf8')), imgDoc = JSON.parse(fs.readFileSync('data/img.json', 'utf8'));
require('../lib/shelf.js');   /* 이 쪽 세상(globalThis)에 붙는다 — 배열을 그대로 견줄 수 있게 */
const S = globalThis.AtelierShelf, style = JSON.parse(fs.readFileSync('data/style.json', 'utf8')).default;
const lay = S.build(design, imgDoc, style), all = [...lay.shelves.flatMap(r => r.items), ...lay.pc.online, ...lay.pc.download];
const sealed = all.filter(x => !x.drawn).map(x => x.key).sort();
const ART = !!(process.env.BACKGROUND_DIR && fs.existsSync(path.join(process.env.BACKGROUND_DIR, 'shelf-cartridge.webp')));
/* 켜 볼 게임 — 진열장에 있고 폼 여섯 칸이 다 있으며 일상컷이 있는 첫 게임 */
const hero = lay.shelves.flatMap(r => r.items).find(x => x.drawn && S.slides(imgDoc.img[x.key], x.style).length === 6 && S.casuals(imgDoc.img[x.key], x.style).length);
const online = lay.pc.online.find(x => x.drawn), dl = lay.pc.download[0], box = lay.shelves.flatMap(r => r.items).find(x => !x.drawn);
(async () => {
  const h = await start();
  try {
    for (const [name, vp, mobile] of [['phone', { width: 390, height: 844 }, true], ['fold', FOLD.inner, true], ['pc', { width: 1366, height: 900 }, false]]) {
      const a = await h.open('shelf.html', { viewport: vp, mobile, reducedMotion: 'reduce', ...(fs.existsSync(art) ? { imgRoot: art } : {}) }), p = a.page;
      await p.waitForSelector('.pkg');
      /* 진열 — 실물은 시대 칸, 온라인은 바탕화면, 내려받기는 폴더 */
      assert.equal(await p.locator('.shelf').count(), lay.shelves.length, name + ' 시대 칸');
      assert.deepEqual(await p.$$eval('.shelf', es => es.map(e => e.dataset.era)), lay.shelves.map(r => r.era), name + ' 시대 차례');
      assert.equal(await p.locator('.cabinet .pkg').count(), lay.shelves.reduce((n, r) => n + r.items.length, 0), name + ' 진열장 패키지 수');
      assert.equal(await p.locator('.desktop .icon[data-game]').count(), lay.pc.online.length, name + ' 바탕화면 아이콘 = 온라인 게임');
      assert.equal(await p.locator('.window').count(), 0, name + ' 폴더는 닫혀 있다');
      /* PC 크기(2026-11-02 「모니터 크기랑 폴더크기, 게임 이미지를 더 크게 — 모바일에서 너무 작아」) — 모니터는 칸 너비 가득, 아이콘 그림 48px 이상 */
      const pcSize = await p.evaluate(() => ({ mon: document.querySelector('.monitor').getBoundingClientRect().width, icon: document.querySelector('.desktop .icon[data-game] .icon-pic').getBoundingClientRect().width,
        folder: document.querySelector('.icon.folder .icon-pic').getBoundingClientRect().width, vw: innerWidth }));
      assert(pcSize.icon >= 48 && pcSize.folder >= 48, name + ' 바탕화면 아이콘 크기 ' + JSON.stringify(pcSize));
      if (mobile) assert(pcSize.mon >= Math.min(pcSize.vw - 32, 720) - 1, name + ' 폰에선 모니터가 칸 너비 가득 ' + JSON.stringify(pcSize));
      await p.click('.icon.folder'); await p.waitForSelector('.window');
      assert.deepEqual(await p.$$eval('.window .icon', es => es.map(e => e.dataset.game)), lay.pc.download.map(x => x.key), name + ' 「게임」 폴더 = 내려받는 게임');
      assert(await p.$eval('.window', e => e.getAttribute('aria-modal') === 'true' && e.closest('main') === null), name + ' 폴더 창은 화면 위 팝업');
      assert(await p.$eval('.window .icon-pic', e => e.getBoundingClientRect().width >= 64), name + ' 폴더 창 아이콘은 크게');
      await p.click('.window-x'); await p.waitForSelector('.window', { state: 'detached' });
      /* 진열장 그림(BACKGROUND_DIR 에 shelf-*.webp 가 있을 때) — 껍데기 · 모니터 · 칸. 없으면 CSS 모양 그대로 */
      if (ART) {
        await p.waitForFunction(n => document.querySelectorAll('.pkg-body[data-shell="1"]').length === n, lay.shelves.reduce((n, r) => n + r.items.length, 0), { timeout: 10000 });
        await p.waitForSelector('.monitor.shelled .screen');
        assert(await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--shelf-plank').includes('shelf-plank.webp')), name + ' 칸 판자 그림');
        /* 겉그림은 껍데기의 흰 라벨 칸 안 */
        const fit = await p.$eval('.pkg[data-media="cartridge"] .pkg-body', b => { const a = b.getBoundingClientRect(), c = b.querySelector('.pkg-art').getBoundingClientRect();
          return c.left > a.left && c.right < a.right && c.top > a.top && c.bottom < a.bottom; });
        assert(fit, name + ' 카트리지 겉그림이 라벨 칸 안');
      } else assert.equal(await p.locator('.pkg-body[data-shell="1"]').count(), 0, name + ' 그림 없으면 CSS 모양');
      /* 매체마다 몸 */
      for (const it of lay.shelves.flatMap(r => r.items).slice(0, 12))
        assert.equal(await p.$eval('.pkg[data-game="' + it.key + '"]', e => e.dataset.media), it.media, name + ' ' + it.key + ' 매체');
      /* 빈 상자 — 그림 없는 게임도 진열, 켜지 않는다 */
      assert.deepEqual((await p.$$eval('.sealed[data-game]', es => es.map(e => e.dataset.game))).sort(), sealed, name + ' 빈 상자 = 그림 없는 게임');
      assert.equal(await p.locator('.sealed .pkg-art img, .sealed .icon-pic img').count(), 0, name + ' 빈 상자엔 겉그림이 없다');
      if (box) {
        await p.click('.pkg[data-game="' + box.key + '"]'); await p.waitForSelector('.info[data-game="' + box.key + '"]');
        assert(await p.$eval('#shelf-start', e => e.disabled), name + ' 빈 상자는 시작이 막혀 있다');
        assert.equal(await p.$eval('.info a[href^="prompt.html"]', e => e.getAttribute('href')), 'prompt.html?game=' + box.key, name + ' 빈 상자는 생성기로');
        await p.click('.info-x'); await p.waitForSelector('.info', { state: 'detached' });
        assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('g')), null, name + ' × 로 닫으면 고른 것이 풀린다');
      }
      /* 고르기 — 주소 ?g= · 사실 · 도감 바로가기 */
      await p.click('.pkg[data-game="' + hero.key + '"]'); await p.waitForSelector('.info[data-game="' + hero.key + '"]');
      /* 팝업 — 화면 위에 뜨고 뒤 진열장은 못 누른다, 초점은 시작, 겉그림은 크게 */
      assert(await p.$eval('.info', e => e.getAttribute('role') === 'dialog' && e.getAttribute('aria-modal') === 'true' && getComputedStyle(e.closest('.pop')).position === 'fixed'), name + ' 고르면 팝업');
      assert(await p.$eval('main.s-room', e => e.inert), name + ' 팝업 뒤는 못 누른다');
      assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), 'shelf-start', name + ' 팝업 초점은 시작');
      const cov = await p.$eval('.info-cover', e => ({ h: e.getBoundingClientRect().height, w: e.getBoundingClientRect().width, vh: innerHeight }));
      assert(cov.h >= Math.min(cov.vh * 0.4, 380), name + ' 팝업 겉그림 크게 ' + JSON.stringify(cov));
      assert.equal(await p.$eval('.pkg[data-game="' + hero.key + '"]', e => e.getAttribute('aria-pressed')), 'true');
      assert((await p.$eval('.info-facts', e => e.textContent)).includes(String(hero.game.facts.year)), name + ' 받은 발매 연도');
      assert.equal(await p.$eval('.info a[href^="dex.html"]', e => e.getAttribute('href')), 'dex.html?game=' + hero.key);
      /* 켜기 — 로딩 → 본편 여섯 장 → 크레딧. 끝까지 켜 보는 것은 pc 한 크기에서만(2026-11-12 — 세 크기 모두 같은 차례를 되풀이했다) */
      if (name === 'pc') {
        /* 움직임 줄이기면 로딩이 0.5초라 바쁜 머신에선 다시 찾기 전에 사라진다 — 기다린 그 요소에서 바로 읽는다 */
        await p.click('#shelf-start'); const load = await p.waitForSelector('.play .load');
        assert.equal(await load.evaluate(e => e.dataset.kind), S.loading(hero.game), name + ' 로딩 꼴은 매체대로');
        assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('play')), '1', name + ' 켜면 주소에 play');
        await p.waitForSelector('.show', { timeout: 8000 });
        const stages = [];
        for (let i = 0; i < 6; i++) {
          stages.push(await p.$eval('.show', e => e.dataset.form + (e.dataset.open === '1' ? '_open' : '')));
          if (i === 0) assert((await p.$eval('.show-line p', e => e.textContent)) === hero.game.voice['타이틀'], name + ' 타이틀의 한마디');
          await p.click('#shelf-next');
        }
        assert.deepEqual(stages, ['title', 'title_open', 'middle', 'middle_open', 'ending', 'ending_open'], name + ' 본편 차례');
        await p.waitForSelector('.credits');
        assert.equal(await p.locator('.credits-pic').count(), S.casuals(imgDoc.img[hero.key], hero.style).length, name + ' 크레딧 뒤는 일상컷');
        const roll = await p.$eval('.credits-roll', e => e.textContent);
        for (const r of S.credits(hero.game)) for (const n of r.names.slice(0, 2)) assert(roll.includes(n), name + ' 크레딧 ' + r.role + ': ' + n);
        await p.waitForSelector('.credits-acts.on', { timeout: 5000 });
        /* 끄기 — 뒤로 가기와 같다 */
        await p.click('#shelf-back'); await p.waitForSelector('.play', { state: 'detached' });
        assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('play')), null, name + ' 끄면 주소에서 play 가 빠진다');
      }
      /* 끄면 그 게임 팝업으로 돌아오고, Esc 로 닫는다 */
      await p.waitForSelector('.info[data-game="' + hero.key + '"]');
      await p.keyboard.press('Escape'); await p.waitForSelector('.info', { state: 'detached' });
      await p.waitForFunction(k => document.activeElement && document.activeElement.dataset.game === k, hero.key, { timeout: 2000 }).catch(() => assert.fail(name + ' 닫으면 초점은 고른 패키지로'));
      /* PC 아이콘에서 켜고 Esc 로 끄기 · 뒤로 가기로 끄기 */
      if (online) {
        await p.click('.desktop .icon[data-game="' + online.key + '"]'); await p.waitForSelector('.info[data-game="' + online.key + '"]');
        await p.click('#shelf-start'); await p.waitForSelector('.load[data-kind="launcher"]');
        await p.keyboard.press('Escape'); await p.waitForSelector('.play', { state: 'detached' });
        await p.click('#shelf-start'); await p.waitForSelector('.play');
        await p.goBack(); await p.waitForSelector('.play', { state: 'detached' });
        assert.equal(await p.evaluate(() => new URLSearchParams(location.search).get('g')), online.key, name + ' 뒤로 가기면 고른 채 진열장');
        /* 바깥(어두운 막)을 누르면 닫힌다 */
        await p.click('.pop', { position: { x: 4, y: 4 } }); await p.waitForSelector('.info', { state: 'detached' });
      }
      if (dl) { await p.click('.icon.folder'); await p.click('.window .icon[data-game="' + dl.key + '"]'); await p.waitForSelector('.info[data-game="' + dl.key + '"]');
        assert.equal(await p.locator('.window').count(), 0, name + ' 폴더에서 고르면 창은 닫히고 팝업'); }
      if (process.env.SHOT_DIR) await p.screenshot({ path: path.join(process.env.SHOT_DIR, 'shelf-' + name + '-popup.png') });
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name + ' 가로로 넘친다');
      assert.deepEqual(a.errors, [], name + ' 화면 오류');
      assert.deepEqual(await p.evaluate(() => window.AtelierWords.missing()), [], name + ' 낱말 표에 없는 열쇠');
      await a.close();
    }
    /* 주소로 바로 켜기 · 움직임(Motion) 있는 채로 로딩이 지나간다 */
    const b = await h.open('shelf.html?g=' + hero.key + '&play=1', { viewport: { width: 1280, height: 800 }, ...(fs.existsSync(art) ? { imgRoot: art } : {}) });
    await b.page.waitForSelector('.play .load'); await b.page.waitForSelector('.show', { timeout: 10000 });
    assert.deepEqual(b.errors, []); await b.close();
    /* 도감 상세 → 진열장 */
    const d = await h.open('dex.html?game=' + hero.key, { viewport: { width: 1280, height: 900 } });
    await d.page.waitForSelector('#dex-to-shelf');
    assert.equal(await d.page.$eval('#dex-to-shelf', e => e.getAttribute('href')), 'shelf.html?g=' + hero.key);
    await d.close();
    console.log('PASS 진열장 화면: 시대 칸 ' + lay.shelves.length + ' · 패키지 · 바탕화면 ' + lay.pc.online.length + ' · 「게임」 폴더 ' + lay.pc.download.length + ' · 빈 상자 ' + sealed.length +
      ' · 고르면 팝업(×·Esc·바깥) · 폴더 창 · 폰 PC 크기 · 고르기·주소 · 로딩 → 본편 여섯 → 크레딧(일상컷·사실 칸) · 끄기·Esc·뒤로 가기 · 도감 바로가기 · 세 크기' + (ART ? ' · 진열장 그림(껍데기 · 모니터 · 칸)' : ' · 그림 없이 CSS 모양'));
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
