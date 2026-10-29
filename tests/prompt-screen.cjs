/* 생성기 화면 — 게임 고르기(✓·◐ 표시)·세 갈래·시범 폼에서 시작·파일 이름·외형 잠금과 무작위·되돌리기·
   게임 갈래(게임 속 장소·오락실)·출시 당시·장면 랜덤과 잠금·복사·기록·저장·직전 게임 외형. book 의 같은 검사에서 왔다.
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/prompt-screen.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs');
const { start, FOLD } = require('./browser-harness.cjs');
const design = JSON.parse(fs.readFileSync('data/game-design.json', 'utf8'));
/* 가짜 등록부 — 테트리스는 여섯 자리 다, 다크 소울은 하나만. 파일은 없다(썸네일은 못 받아도 된다) */
const six = k => Object.fromEntries(['title', 'middle', 'ending'].flatMap(f => [[f, { f: `${k}_${f}_glossy_kr_game_f.webp` }], [f + '_open', { f: `${k}_${f}_open_glossy_kr_game_f.webp` }]]));
const imgjson = { img: { tetris: { byStyle: { glossy_kr_game: { byForm: six('tetris') } } },
  dark_souls: { byStyle: { glossy_kr_game: { byForm: { title: { f: 'dark_souls_title_glossy_kr_game_f.webp' } } } } } } };
const opt = extra => ({ viewport: FOLD.inner, mobile: true, files: { 'data/img.json': imgjson }, ...extra });
const out = p => p.$eval('#prompt-output', e => e.value);
(async () => {
  const h = await start();
  try {
    const a = await h.open('prompt.html?game=tetris', opt()), p = a.page;
    await p.waitForSelector('#prompt-output');
    await p.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    /* 1. 게임 고르개 — ✓ 여섯 자리 다 · ◐ 일부 · · 아직 */
    const marks = await p.$$eval('#source option', os => Object.fromEntries(os.map(o => [o.value, o.textContent.trim()[0]])));
    const want = Object.fromEntries(design.games.map(g => [g.key, '·']));
    Object.assign(want, { tetris: '✓', dark_souls: '◐' });
    assert.deepEqual(marks, want, JSON.stringify(marks));
    /* 2. 처음 연 게임은 시범 폼(테트리스 = 타이틀)에서, 새 인물 */
    assert.equal(await p.$eval('#form', e => e.value), 'title');
    let t = await out(p);
    assert(t.startsWith('INPUT: text only') && t.includes('FORM — TITLE (타이틀)') && t.includes('SILHOUETTE:') && t.includes('FACE ('));
    assert(t.includes('STYLE: Glossy Korean mobile-game character art') && t.includes('costume and accessory') && t.includes('FINAL CHECK:'), '화풍 판 v1');
    assert(t.includes('NOT ITS CHARACTERS:') && t.includes('NEVER DRAW for this game:') && t.includes('CORE PLAY:') && t.includes('ERA LOOK: 8-bit era'), '게임 줄');
    assert.equal(await p.$eval('#style-version', e => e.value), 'v1');
    assert.equal(await p.$eval('#exposure', e => e.value), 'bold', '노출 기본은 과감');
    assert.match(await p.$eval('#file-name code', e => e.textContent), /^tetris_title_glossy_kr_game_f\.webp$/);
    assert((await p.$eval('#game-design', e => e.textContent)).includes('자리 셋을 모두 채우면'), '설계 칸에 능력');
    assert((await p.$eval('#avoid-list', e => e.textContent)).includes('TETRIS 로고'), '설계 칸에 그리지 않을 것');
    assert((await p.$eval('#form-setting', e => e.textContent)).includes('격자선만 그어진 고요한 우물'), '설계 칸에 폼 배경');
    /* 3. 외형 — 고르면 IDENTITY 에, 얼굴 설계 끄기, 되돌리기·다시 하기, 잠금 */
    await p.selectOption('#param-apparent-age', '20s');
    await p.click('#face-design-on');
    assert(!(await out(p)).includes('FACE ('), '얼굴 설계를 끄면 FACE 줄이 빠진다');
    await p.click('#undo');
    assert((await out(p)).includes('FACE ('), '되돌리기');
    await p.click('#redo'); await p.click('#undo');
    await p.click('button.param-lock[aria-label$="외관상 나이"]');
    await p.click('#randomize');
    assert.equal(await p.$eval('#param-apparent-age', e => e.value), '20s', '잠근 나이는 그대로');
    /* 4. 이어가기 */
    await p.selectOption('#form', 'middle');
    await p.selectOption('#identity-mode', 'reference');
    assert.equal(await p.$eval('#base-form', e => e.value), 'title', '첨부할 확정 그림은 시범 폼');
    t = await out(p);
    assert(t.includes('approved character (title form)') && t.includes('FORM — MIDGAME') && !t.includes('SILHOUETTE:'), '이어가기');
    /* 5. 개방 */
    await p.click('#mode-open');
    const q = () => p.evaluate(() => Object.fromEntries(new URLSearchParams(location.search)));
    /* 주소는 화면이 그린 뒤(useEffect) 적는다 — 바로 읽으면 앞 모드가 보일 수 있다 */
    await p.waitForFunction(() => new URLSearchParams(location.search).get('mode') === 'open');
    assert.deepEqual(await q(), { game: 'tetris', mode: 'open' }, '고른 게임·모드가 주소에');
    t = await out(p);
    assert(t.includes('빈틈없이 맞은 층이 빛으로 터지며') && t.startsWith("INPUT: attach this game's midgame form card image"));
    assert.match(await p.$eval('#file-name code', e => e.textContent), /tetris_middle_open_glossy_kr_game_f\.webp/);
    /* 6. 일상컷 — 게임 갈래, 출시 당시, 잠금 */
    await p.click('#mode-casual');
    /* 일상컷 고정값 — pkm 과 같다(2026-10-28): 전체 강도 strong · 피부 노출 bold · 2:3, 처음부터 잠김. 장면 랜덤을 돌려도 그대로 */
    const fixed = async why => {
      assert.equal(await p.$eval('#axis-overall_intensity', e => e.value), 'strong', why + ' 전체 강도');
      assert.equal(await p.$eval('#axis-skin_exposure', e => e.value), 'bold', why + ' 피부 노출');
      assert.equal(await p.$eval('#aspect', e => e.value), '2:3', why + ' 화면 비율');
      for (const id of ['axis-overall_intensity', 'axis-skin_exposure', 'aspect'])
        assert.equal(await p.$eval('#lock-' + id, e => e.getAttribute('aria-pressed')), 'true', why + ' 잠김 ' + id);
      const c = await out(p);
      assert(c.includes('overall_intensity: strong') && c.includes('skin_exposure: bold') && c.includes('FRAME: a vertical 2:3 (1024×1536) image.'), why + ' 지시문');
    };
    await fixed('처음');
    for (let i = 0; i < 5; i++) await p.click('#random-scene');
    await fixed('장면 랜덤 뒤');
    await p.selectOption('#era', '');   // 장면 랜덤이 출시 당시를 골랐을 수 있다 — 아래 검사는 기본(현대)에서 시작한다
    await p.selectOption('#casual-n', '3');
    assert.match(await p.$eval('#file-name code', e => e.textContent), /tetris_glossy_kr_game_f_casual3\.webp/);
    const cats = await p.$$eval('#category option', os => os.map(o => o.value));
    for (const c of ['game_place', 'game_life_sensual', 'arcade_culture', 'dev_studio', 'speedrun_stream']) assert(cats.includes(c), '게임 갈래 ' + c);
    for (const c of ['library_life', 'story_place', 'stage_adaptation', 'literary_salon']) assert(!cats.includes(c), '책 갈래 ' + c);
    await p.selectOption('#category', 'game_place');
    await p.selectOption('#example', 'gp_walk');
    t = await out(p);
    assert(t.includes('GAME PLACE: a real-feeling place shaped like the world of «테트리스»') && t.includes('fabric and accessory'), '게임 속 장소·일상컷 화풍');
    await p.selectOption('#category', 'arcade_culture');
    await p.selectOption('#example', 'arc_cabinet');
    t = await out(p);
    assert(t.includes('SCREENS:') && t.includes('upright arcade cabinet') && !t.includes('GAME PLACE:'), '오락실·화면 줄');
    assert(!t.includes('ERA:'), '기본은 현대');
    await p.selectOption('#era', 'release');
    assert((await out(p)).includes('ERA: set this scene in the real world around her release'), '출시 당시');
    /* 시대는 장면 랜덤이 건드리지 않는다 — 랜덤·잠금 단추가 없고, 랜덤을 돌려도 고른 값 그대로(2026-10-29) */
    assert.equal(await p.$('#lock-era'), null, '시대 칸에는 잠금 단추가 없다');
    assert.equal(await p.$('#random-era'), null, '시대 칸에는 랜덤 단추가 없다');
    await p.click('#lock-example');
    await p.click('#random-scene');
    assert.equal(await p.$eval('#era', e => e.value), 'release', '장면 랜덤이 시대를 바꾸지 않는다');
    await p.selectOption('#era', '');
    for (let i = 0; i < 6; i++) await p.click('#random-scene');
    assert.equal(await p.$eval('#era', e => e.value), '', '장면 랜덤이 출시 당시를 고르지 않는다');
    await p.selectOption('#era', 'release');
    assert.equal(await p.$eval('#example', e => e.value), 'arc_cabinet', '잠근 예시는 그대로');
    assert.equal(await p.$eval('#category', e => e.value), 'arcade_culture', '예시를 잠그면 그 갈래도 그대로');
    /* 7. 복사·기록 */
    await p.click('#copy-prompt');
    await p.waitForFunction(() => document.querySelector('.studio-status').textContent.length > 0);
    await p.click('#export-record');
    const rec = JSON.parse(await p.$eval('#record-output', e => e.value));
    assert.equal(rec.record, 'records/tetris/casual3-ui.json');
    assert.equal(rec.file, 'tetris_glossy_kr_game_f_casual3.webp');
    assert.equal(rec.game, 'tetris');
    assert.equal(rec.storage.cards.tetris.scenes.casual.era, 'release');
    /* 8. 저장·직전 게임 외형 */
    await p.reload(); await p.waitForSelector('#prompt-output');
    assert.equal(await p.$eval('#mode-casual', e => e.getAttribute('aria-pressed')), 'true', '새로고침해도 일상컷');
    await p.selectOption('#source', 'dark_souls');
    await p.waitForFunction(() => document.querySelector('#mode-form'));
    await p.waitForFunction(() => new URLSearchParams(location.search).get('game') === 'dark_souls');
    assert.equal((await q()).game, 'dark_souls', '게임을 바꾸면 주소도');
    assert.equal(await p.$eval('#form', e => e.value), 'title', '다크 소울은 시범 폼(타이틀)에서');
    await p.click('#take-prev');
    assert.equal(await p.$eval('#param-apparent-age', e => e.value), '20s', '직전 게임 외형');
    assert.deepEqual(a.errors, []);
    assert.deepEqual(await p.evaluate(() => window.AtelierWords.missing()), [], '낱말 표에 없는 열쇠');
    await p.setViewportSize(FOLD.cover);
    assert(await p.evaluate(() => document.body.scrollWidth <= innerWidth + 1), '덮개 화면에서 가로로 넘친다');
    await a.close();
    const c = await h.open('prompt.html?game=starcraft&mode=open', opt());
    await c.page.waitForSelector('#prompt-output');
    assert.equal(await c.page.$eval('#source', e => e.value), 'starcraft', '주소의 게임');
    assert.equal(await c.page.$eval('#mode-open', e => e.getAttribute('aria-pressed')), 'true', '주소의 모드');
    assert.deepEqual(c.errors, []);
    await c.close();
    console.log('PASS 생성기: 게임 표시 ✓◐· · 시범 폼 · 파일 이름 · 게임 줄(캐릭터 아님·능력·시대) · 외형·되돌리기·잠금 · 이어가기 · 개방 · 일상컷 게임 갈래·책 갈래 없음·출시 당시·잠금 · 복사·기록 · 저장·직전 게임 외형');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
