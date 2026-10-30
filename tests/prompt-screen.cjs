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
    /* 6. 일상컷 — 트리(시대·장소·하는 일·의상·구도), 출시 당시·게임 세계 안, 잠금 */
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
    await p.selectOption('#casual-n', '3');
    assert.match(await p.$eval('#file-name code', e => e.textContent), /tetris_glossy_kr_game_f_casual3\.webp/);
    /* 일상컷 트리 버전2(docs/CASUAL_TREE_V2.md) — 새 장면은 버전2: 하는 일·자세·방향·렌즈·자유 카메라 칸이 없고,
       시대 → 장소 → 의상 → 자세 추천 → 몸 자세·받침 → 구도 → 오른손·왼손 → 소품 동작 → 다리 → 시선 */
    assert(await p.$('#casual-tree-v2'), '버전2 칸');
    for (const id of ['category', 'example', 'act', 'pose', 'orientation', 'lens', 'camera']) assert.equal(!!(await p.$('#' + id)), false, id + ' 칸이 없다');
    const tree2 = JSON.parse(fs.readFileSync('data/casual-tree-v2.json', 'utf8'));
    const val = id => p.$eval('#' + id, e => e.value);
    const opts = id => p.$$eval('#' + id + ' option', os => os.map(o => o.value));
    const scene = async () => (await out(p)).split('\n\n').find(l => l.startsWith('SCENE')) || '';
    assert.deepEqual(await opts('era'), ['now', 'release', 'in_game', 'fantasy'], '시대 넷');
    await p.selectOption('#era', 'now');
    await p.selectOption('#place', 'arcade_hall');
    t = await out(p);
    assert(t.includes('SCREENS:') && t.includes('Place: an arcade hall') && t.includes('POSTURE: ') && t.includes('COMPOSITION: ') && !t.includes('Activity:') && !t.includes('HAND TASK'), '버전2 줄 · 오락실 화면 줄');
    assert(t.includes('fabric and accessory'), '일상컷 화풍');
    await p.selectOption('#era', 'release');
    assert.equal(await val('place'), 'arcade_hall', '출시 당시에도 있는 장소는 그대로');
    assert((await out(p)).includes('ERA: set this scene in the real world around her release'), '출시 당시');
    assert(!(await opts('place')).includes('arcade_pcbang') && !(await opts('place')).includes('fx_studio'), '그 해에 없던 곳·환상 무대는 빠진다');
    await p.selectOption('#era', 'in_game');
    assert((await opts('place')).every(k => k.startsWith('game_')), '게임 세계 안은 그 세계의 장소만');
    t = await out(p);
    assert(t.includes('WORLD: this scene happens inside the world of «테트리스»') && !t.includes('ERA:'), '게임 세계 안 줄');
    /* 앞 칸을 잠그면 랜덤은 그 안에서 — 시대를 잠그고 돌려도 그대로 */
    await p.click('#lock-era');
    for (let i = 0; i < 5; i++) await p.click('#random-scene');
    assert.equal(await val('era'), 'in_game', '잠근 시대는 그대로');
    assert((await val('place')).startsWith('game_'), '랜덤 장소도 그 시대 안에서');
    await fixed('트리 랜덤 뒤');
    await p.click('#lock-era');
    /* 자세 추천 — 칸이 한 번에 채워지고, 프레이밍을 클로즈업으로 바꾸면 다리 칸이 사라지고 무릎 위 손은 고쳐진다(컷은 그대로) */
    await p.selectOption('#era', 'now'); await p.selectOption('#place', 'home_living'); await p.selectOption('#ofam', 'everyday');
    assert((await opts('preset')).includes('side_chair_cross'), '거실에서 쓸 수 있는 추천');
    await p.selectOption('#preset', 'side_chair_cross');
    assert.deepEqual([await val('posture'), await val('frame'), await val('hand-right'), await val('hand-left'), await val('legs')], ['sit_chair', 'full_body', 'prop', 'lap', 'cross_legs'], '추천이 칸을 채운다');
    assert(await p.$('#use'), '소품을 쓰는 손이 있으면 소품 동작 칸');
    let sc = await scene();
    assert(sc.includes('PROP: with her own right hand she') && sc.includes('LEGS: legs crossed at the knee') && sc.includes('LEFT HAND: her own left hand rests on her knee'), '추천 지시문');
    await p.selectOption('#frame', 'face_close');
    assert.equal(await val('frame'), 'face_close', '컷은 넓히지 않는다');
    assert.equal(!!(await p.$('#legs')), false, '다리가 안 보이는 컷엔 다리 칸이 없다');
    assert.notEqual(await val('hand-left'), 'lap', '무릎 위 손은 고쳐진다');
    assert.equal(await val('preset'), '', '칸이 바뀌면 추천 표시는 지운다');
    assert(!(await opts('body')).includes('back') && !(await opts('body')).includes('rear_3q'), '가까운 컷엔 뒤쪽 몸 방향 없음');
    assert((await opts('hand-right')).includes('out'), '가까운 컷엔 화면 밖 손');
    sc = await scene();
    assert(!sc.includes('LEGS:') && sc.includes('COMPOSITION: a close-up'), '클로즈업 지시문');
    await p.selectOption('#frame', 'full_body');
    assert((await opts('body')).includes('back') && !(await opts('hand-right')).includes('out'), '전신엔 뒤쪽 몸 방향, 화면 밖 손 없음');
    /* 두 손 자세는 다른 손도 — 팔짱 */
    await p.selectOption('#posture', 'stand'); await p.selectOption('#frame', 'waist_up');
    await p.selectOption('#hand-right', 'arms_crossed');
    assert.equal(await val('hand-left'), 'arms_crossed', '두 손 자세는 다른 손도 같이(두 손 자세는 오른손 칸에서 고른다)');
    assert.deepEqual(await opts('hand-left'), ['arms_crossed'], '두 손 자세면 왼손 칸이 잠긴다');
    assert((await scene()).includes('BOTH HANDS: '), '두 손 자세 줄');
    await p.selectOption('#hand-right', 'hip');
    assert.notEqual(await val('hand-left'), 'arms_crossed', '두 손 자세를 풀면 다른 손은 다시 고른다');
    assert.equal(!!(await p.$('#use')), false, '소품을 쓰는 손이 없으면 소품 동작 칸도 없다');
    /* 장소의 받침이 자세를 거른다 — 벽 없는 곳엔 벽에 기대기 없음 */
    const nowall = Object.keys(tree2.places).find(k => !tree2.places[k].includes('wall') && k.startsWith('water_'));
    await p.selectOption('#place', nowall);
    assert(!(await opts('posture')).includes('lean_wall'), nowall + ' 벽 없음');
    /* 어색한 조합은 ⚠ 만 — 고를 수는 있다 */
    const spa = JSON.parse(fs.readFileSync('data/casual-tree.json', 'utf8')).places.find(x => x.group === 'spa' && x.eras.includes('now')).key;
    await p.selectOption('#place', spa);
    assert((await p.$eval('#ofam option[value="bridal"]', e => e.textContent)).includes('⚠'), '웨딩 × 스파 ⚠');
    await p.selectOption('#ofam', 'bridal');
    assert.equal(await val('ofam'), 'bridal', '⚠ 도 고를 수 있다');
    /* 옷 직접 쓰기 — 고른 옷의 주머니로 검사하지 않는다. 글의 옷에 주머니를 표시하면 주머니 손이 돌아온다 */
    await p.selectOption('#era', 'now'); await p.selectOption('#place', 'home_living'); await p.selectOption('#ofam', 'everyday');
    await p.selectOption('#item', 'jeans_tee'); await p.selectOption('#posture', 'stand'); await p.selectOption('#frame', 'waist_up');
    assert((await opts('hand-right')).includes('pocket'), '청바지 + 티면 주머니 손');
    await p.fill('#outfit', 'a strapless satin dress with no pockets');
    assert(await p.$('#ofeat') && !(await opts('hand-right')).includes('pocket'), '직접 쓴 옷이면 주머니 손이 빠진다');
    await p.check('#ofeat-pocket');
    assert((await opts('hand-right')).includes('pocket'), '주머니를 표시하면 돌아온다');
    await p.fill('#outfit', '');
    assert.equal(!!(await p.$('#ofeat')), false);
    /* 등만 돌리면 표정 칸이 꺼진다, 카메라 응시도 없다 */
    await p.selectOption('#frame', 'full_body'); await p.selectOption('#body', 'back');
    assert.equal(await p.$eval('#expression', e => e.disabled), true, '얼굴이 안 보이면 표정 칸이 꺼진다');
    assert(await p.$('#casual-tree-v2 #expression'), '표정 칸은 버전2 칸 안 — 시선 밑');
    await p.selectOption('#body', 'rear_3q');
    assert.equal(await p.$eval('#expression', e => e.disabled), false, '뒤 3/4 는 표정을 고른다');
    assert((await opts('expression')).length > 20, '표정 목록');
    await p.selectOption('#body', 'back');
    assert(!(await opts('gaze')).includes('camera'), '등 돌림 + 고개 그대로면 카메라 응시 없음');
    await p.selectOption('#head', 'over_shoulder');
    assert.equal(await p.$eval('#expression', e => e.disabled), false); assert((await opts('gaze')).includes('camera'));
    assert((await out(p)).includes('LOOK-BACK:'), '어깨 너머로 돌리면 돌아보기 줄');
    /* 손 칸 AUTO · 자연스럽게(사용자 2026-10-30) — 오른손만 고르고 왼손은 지시문에 싣지 않는다 */
    await p.selectOption('#era', 'now'); await p.selectOption('#place', 'home_living'); await p.selectOption('#ofam', 'everyday');
    await p.selectOption('#posture', 'stand'); await p.selectOption('#frame', 'waist_up'); await p.selectOption('#body', 'front'); await p.selectOption('#head', 'with_body');
    await p.selectOption('#hand-right', 'hip'); await p.selectOption('#hand-left', '');
    assert.equal(await val('hand-left'), '', '왼손 AUTO');
    sc = await scene();
    assert(sc.includes('RIGHT HAND: her own right hand rests on her hip') && !sc.includes('LEFT HAND:'), 'AUTO 손은 줄이 없다 ' + sc);
    assert((await opts('hand-left')).includes('natural'), '자연스럽게');
    await p.selectOption('#hand-left', 'natural');
    assert((await scene()).includes('LEFT HAND: her own left hand rests naturally for the posture'), '자연스럽게 줄');
    await p.selectOption('#hand-right', ''); await p.selectOption('#hand-left', 'arms_crossed');
    assert.equal(await val('hand-right'), 'arms_crossed', '오른손 AUTO 면 왼손에서 두 손 자세를 고르면 오른손도');
    await p.selectOption('#hand-right', 'hip');
    /* 해방 — 트리 밖 값을 까닭과 함께 보이고, 고르면 그 칸은 고치지 않는다 */
    assert(!(await opts('posture')).includes('swim'), '거실엔 헤엄이 없다');
    await p.check('#unlock-v2');
    const label = await p.$eval('#posture option[value="swim"]', e => e.textContent);
    assert(label.startsWith('🔓') && label.includes('받침'), '트리 밖 값과 까닭 ' + label);
    await p.selectOption('#posture', 'swim');
    assert.equal(await val('posture'), 'swim', '해방한 값은 다시 검사가 고치지 않는다');
    const un = await p.$eval('#unlocked-note', e => e.textContent);
    assert(un.includes('몸 자세') && un.includes('받침'), '해방 표시 — 헤엄의 물 받침도 따라 해방 ' + un);
    assert((await scene()).includes('POSTURE: swimming breaststroke'), '해방한 값이 지시문에');
    assert.equal(await p.$eval('#copy-prompt', e => e.disabled), false, '해방 칸은 복사를 막지 않는다');
    await p.uncheck('#unlock-v2');
    assert.equal(await val('posture'), 'swim', '해방을 꺼도 고른 값은 남는다');
    await p.selectOption('#posture', 'stand');
    assert.equal(!!(await p.$('#unlocked-note')), false, '트리 안 값으로 돌아오면 해방 표시가 없다');
    /* 확장 — 새 장소, 계절·날씨(⚠), 안경 */
    await p.selectOption('#era', 'now');
    assert((await opts('place')).includes('library_reading'), '새 장소');
    await p.selectOption('#place', 'lodge_terrace'); await p.selectOption('#weather', 'snow'); await p.selectOption('#ofam', 'swimwear');
    assert((await p.$eval('#weather-description', e => e.textContent).catch(() => '')).includes('⚠') || (await p.content()).includes('눈 오는 날 수영복'), '눈 + 수영복 ⚠');
    assert((await scene()).includes('Weather / season: a snowy day'), '날씨 줄');
    await p.selectOption('#weather', ''); await p.selectOption('#ofam', 'everyday');
    await p.selectOption('#posture', 'stand'); await p.selectOption('#frame', 'chest_up');
    assert(!(await opts('hand-right')).includes('glasses_adjust'), '안경을 안 쓰면 없음');
    await p.check('#glasses');
    assert((await opts('hand-right')).includes('glasses_adjust') && (await scene()).includes('she wears thin-framed glasses'), '안경');
    await p.uncheck('#glasses');
    /* 추가 연출 글에 손·소품 말 — 경고만, 복사는 된다 */
    await p.fill('#custom', 'holding a cup in both hands');
    assert(await p.$('#v2-hand-warn'), '손·소품 말 경고');
    assert.equal(await p.$eval('#copy-prompt', e => e.disabled), false, '경고는 복사를 막지 않는다');
    await p.fill('#custom', '');
    assert.equal(!!(await p.$('#v2-hand-warn')), false);
    assert.equal(!!(await p.$('#v2-invalid')), false, '맞지 않는 칸이 없다');
    await p.selectOption('#era', 'in_game');
    await p.selectOption('#place', 'game_bath');
    await p.selectOption('#ofam', 'homewear');
    assert.match(await p.$eval('#required-note', e => e.textContent), /★/, '게임 세계 안 목욕 — 필수 갈래');
    /* 7. 복사·기록 */
    await p.click('#copy-prompt');
    await p.waitForFunction(() => document.querySelector('.studio-status').textContent.length > 0);
    await p.click('#export-record');
    const rec = JSON.parse(await p.$eval('#record-output', e => e.value));
    assert.equal(rec.record, 'records/tetris/casual3-ui.json');
    assert.equal(rec.file, 'tetris_glossy_kr_game_f_casual3.webp');
    assert.equal(rec.game, 'tetris');
    assert.equal(rec.storage.cards.tetris.scenes.casual.era, 'in_game');
    assert.equal(rec.storage.cards.tetris.scenes.casual.place, 'game_bath');
    assert(!('cat' in rec.storage.cards.tetris.scenes.casual) && !('act' in rec.storage.cards.tetris.scenes.casual), '기록에 옛 갈래·하는 일 칸이 없다');
    assert.equal(rec.storage.cards.tetris.scenes.casual.treeV, 2, '기록에 버전2 표시');
    assert(rec.prompt.includes('POSTURE: '), '기록 지시문도 버전2');
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
    /* 9. 버전1 기록 — 하는 일·자세로 고른 장면은 버전1 그대로 열고, 「버전2로 다시 고르기」 로 옮긴다 */
    const d = await h.open('prompt.html?game=tetris&mode=casual', opt()), q1 = d.page;
    await q1.waitForSelector('#prompt-output');
    await q1.evaluate(() => localStorage.setItem('game_prompt_v1', JSON.stringify({ last: 'tetris', cards: { tetris: { mode: 'casual', scenes: { casual: {
      era: 'now', place: 'travel_rural_station', act: 'wait_train', ofam: 'everyday', item: '', pose: 'sitting', orient: 'front', frame: 'full_body', lens: 'natural50', expr: 'calm', custom: 'a paper ticket' } } } } })));
    await q1.reload(); await q1.waitForSelector('#v1-record');
    assert(await q1.$('#casual-tree') && !(await q1.$('#casual-tree-v2')), '버전1 기록은 버전1 칸');
    t = await out(q1);
    assert(t.includes('Activity: ') && !t.includes('POSTURE: '), '버전1 기록은 지시문도 버전1');
    await q1.click('#to-v2');
    await q1.waitForSelector('#casual-tree-v2');
    t = await out(q1);
    assert(t.includes('POSTURE: ') && !t.includes('Activity: ') && t.includes('Place: ') && t.includes('Note: a paper ticket'), '옮기면 버전2 — 장소·추가 연출은 그대로');
    assert.equal(await q1.$eval('#frame', e => e.value), 'full_body', '프레이밍도 그대로');
    assert.equal(!!(await q1.$('#v1-record')), false);
    assert.deepEqual(d.errors, []);
    await d.close();
    const c = await h.open('prompt.html?game=starcraft&mode=open', opt());
    await c.page.waitForSelector('#prompt-output');
    assert.equal(await c.page.$eval('#source', e => e.value), 'starcraft', '주소의 게임');
    assert.equal(await c.page.$eval('#mode-open', e => e.getAttribute('aria-pressed')), 'true', '주소의 모드');
    assert.deepEqual(c.errors, []);
    await c.close();
    console.log('PASS 생성기: 게임 표시 ✓◐· · 시범 폼 · 파일 이름 · 게임 줄(캐릭터 아님·능력·시대) · 외형·되돌리기·잠금 · 이어가기 · 개방 · 일상컷 트리 버전2(시대가 장소를 거름·잠근 앞 칸·자세 추천·컷 안 넓힘·두 손·받침·⚠·손 말 경고·필수 갈래)·버전1 기록·출시 당시·잠금 · 복사·기록 · 저장·직전 게임 외형');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
