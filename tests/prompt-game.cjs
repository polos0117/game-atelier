/* 게임 프롬프트 — 설계표 열 편 × 세 폼 × (새 인물·이어가기·개방) + 일상컷이 다 조립되고, 정한 말이 다 영어로 풀린다.
   book-atelier 의 tests/prompt-book.cjs 에서 왔다. 책 몫(보호 중인 책·한복·이야기 속 장소·각색)은 빼고 게임 몫을 더했다:
   캐릭터 아님·그리지 않을 것 줄, 핵심 조작·시대 줄, 일상컷 트리(시대·장소·하는 일·의상·구도), 출시 당시, 사실 칸은 받은 것만.
   Run: node tests/prompt-game.cjs */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-game.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const S = ctx.window.AtelierSpec, P = ctx.window.AtelierPrompt, CT = ctx.window.AtelierCasualTree, T = S.GAME_LINES;
const tree = JSON.parse(fs.readFileSync('data/casual-tree.json', 'utf8'));
const design = JSON.parse(fs.readFileSync('data/game-design.json', 'utf8'));
const style = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));
const gs = style.styles[style.default], cur = gs.versions.find(v => v.v === gs.current), text = cur.text;
const V = design.vocab, G = design.games, STAGES = Object.keys(V.form_key);
const q = s => String(s).replace(/"/g, "'");
/* 지시문 길이 상한 — 900 이던 것을 사용자 결정으로 1200 으로(2026-10-30). 가장 긴 표정 · 축 다섯 · 모티프를 다 얹은 클로즈업이 1018 낱말이었다 */
const LIMIT = 1200;

/* 1. 정한 말이 다 영어로 — 설계표에 새 말을 더하고 표를 안 고치면 여기서 걸린다 */
for (const axis of ['genre', 'era', 'role', 'body', 'hair', 'garment', 'material', 'pose', 'palette', 'face_shape', 'eyes', 'brows', 'nose', 'lips'])
  for (const w of V[axis]) assert(S.VOCAB_EN[axis] && S.VOCAB_EN[axis][w], axis + ' ' + w + ' 의 영어가 없다(lib/prompt-spec.js VOCAB_EN)');
for (const e of V.era) assert(S.VOCAB_EN.era_look[e] && S.ERA_PERIOD[e], e + ' 의 시대 감각·출시 당시가 없다');
for (const stage of STAGES) assert(S.STAGE_EN[stage], stage + ' 의 영어 이름이 없다');
assert.deepEqual(Object.keys(S.GARMENT_LAYER).sort(), V.garment.slice().sort(), '복식 구조 정한 말마다 과감 갈래가 있다');

/* 2. 열 편 × 세 폼 × 갈래 — 다 조립되고, 설계표 글이 제자리에 들어간다 */
let n = 0, longest = 0;
const avoidLine = g => g.avoid.map(a => '"' + q(a) + '"').join('; ');
for (const g of G) for (const stage of STAGES) {
  const create = P.buildPrompt({ outputMode: 'form', game: g, stage, styleText: text, styleCheck: cur.check, identityMode: 'create', params: [], exposure: 'bold' });
  assert(create.includes(q(g.persona)) && create.includes(q(g.forms[stage].look)) && create.includes(q(g.mechanic)), g.key + ' ' + stage + ' 새 인물에 설계표 글');
  assert(create.includes('CORE PLAY:') && create.includes('ERA LOOK: ' + S.VOCAB_EN.era_look[g.era]), g.key + ' 핵심 조작·시대 줄');
  assert(create.includes('FACE (') && create.includes('SILHOUETTE:') && create.startsWith('INPUT: text only'), g.key + ' 새 인물에 얼굴·실루엣');
  assert(create.includes(text), '화풍 판 전문이 그대로');
  const ref = P.buildPrompt({ outputMode: 'form', game: g, stage, baseStage: '타이틀', styleText: text, identityMode: 'reference', params: [['apparent age', '20s']] });
  assert(!ref.includes('FACE (') && !ref.includes('SILHOUETTE:') && !ref.includes('IDENTITY') && !ref.includes('CORE PLAY:'), '이어가기는 첨부 그림이 정한다');
  assert(ref.includes('the attached image is the approved character (title form)'), '이어가기는 첨부할 확정 그림을 말한다');
  const open = P.buildPrompt({ outputMode: 'open', game: g, stage, styleText: text });
  assert(open.includes(q(g.opens[stage].scene)) && /^INPUT: attach this game's \w+ form card image/.test(open), g.key + ' ' + stage + ' 개방에 명장면');
  assert(open.includes('never a character or creature from the game'), '개방에도 게임 속 캐릭터는 없다');
  /* 개방은 한 장 — 닫힘·개방을 나란히 그리지 않게. 「pair」·둘째 첨부는 없다(2026-10-28 2분할) */
  assert(open.includes('exactly ONE standalone image showing ONLY the OPEN state') && open.includes(T.openSingle) && open.includes('serves only as the visual reference'), g.key + ' 개방 한 장');
  assert(!/The pair|If a second image/.test(open), g.key + ' 개방에 두 장을 부르는 말');
  /* 원작 알아볼 거리 — 폼·개방에 SIGNATURE 다, 폼에는 그 폼의 원작풍 장비 GEAR(2026-10-28) */
  const sigLine = 'SIGNATURE (recognizable, as the game shows them): ' + g.signature.map(s => '"' + q(s) + '"').join(', ') + '.';
  for (const t of [create, ref, open]) assert(t.includes(sigLine), g.key + ' 알아볼 거리 줄');
  for (const t of [create, ref]) assert(t.includes('GEAR in the game\'s own style: "' + q(g.forms[stage].homage) + '"'), g.key + ' ' + stage + ' 원작풍 장비 줄');
  assert(!open.includes('GEAR in'), '개방은 폼 그림의 옷을 그대로 — 장비 줄 없음');
  for (const t of [create, ref, open]) {
    assert(t.includes('ONE FIGURE ONLY') && t.includes('HANDS'), '한 명·손 줄');
    assert(t.includes(T.trademark) && t.includes('NEVER DRAW for this game: ' + avoidLine(g)), g.key + ' 캐릭터 아님·그리지 않을 것 줄');
    assert(!/[가-힣]/.test(t.replace(/"[^"]*"/g, '').replace(/«[^»]*»/g, '').replace(/STYLE: [^\n]*/, '').replace(/\((타이틀|중반|엔딩)\)/g, '')),
      '설계표 글(따옴표 안)·게임 이름 말고는 영어: ' + g.key + ' ' + stage);
    longest = Math.max(longest, P.words(t)); n++;
  }
}
// 몸 개수 줄 BODY 와 일상컷 HAND TASK 로 40낱말쯤 늘었다(2026-10-27). 원작 알아볼 거리 SIGNATURE·GEAR 줄로 45낱말쯤 더(2026-10-28) · 머리·눈 색으로 4낱말 더, notes 줄을 줄여 맞췄다(2026-10-29)
assert(longest <= LIMIT, '가장 긴 프롬프트가 ' + LIMIT + ' 낱말을 넘는다: ' + longest);

/* 2-1. 폼마다 다른 장면 — 배경(설계표 setting)·빛·구도·카메라가 단계마다 다르고, 이어가기는 첨부 그림의 배경을 쓰지 않는다.
   셋 다 같은 유리 정육면체 벽·반사 바닥·낮은 카메라로 나왔다(2026-10-26 테트리스 시범) */
for (const gm of G) {
  const seen = new Set();
  for (const stage of STAGES) {
    const info = S.STAGE_EN[stage], f = gm.forms[stage];
    for (const id of ['create', 'reference']) {
      const t = P.buildPrompt({ outputMode: 'form', game: gm, stage, baseStage: '타이틀', identityMode: id, styleText: text });
      assert(t.includes('SETTING (this form): "' + q(f.setting) + '" — ' + info.scene + '.'), gm.key + ' ' + stage + ' ' + id + ' 배경 줄');
      assert(t.includes('— ' + info.camera + ', easy to read as a card.'), gm.key + ' ' + stage + ' 단계 카메라');
      assert(!t.includes('slightly low camera, held still'), '세 폼이 같은 카메라');
      if (id === 'reference') {
        assert(t.includes("do not reuse the attached image's background, floor, lighting or camera angle"), '이어가기는 첨부 그림 배경을 안 쓴다');
        assert(t.includes('GARMENT: keep her material family (' + S.VOCAB_EN.material[gm.silhouette.material] + ')') && t.includes('clearly different outfit silhouette'), '재료만 잇고 재단은 바뀐다');
        assert(!t.includes('keep her garment structure'), '복식 구조를 묶지 않는다');
      }
    }
    seen.add(f.setting);
  }
  assert.equal(seen.size, 3, gm.key + ' 세 폼의 배경이 겹친다');
}
assert.equal(new Set(STAGES.map(s => S.STAGE_EN[s].camera)).size, 3, '단계마다 카메라가 다르다');
assert.equal(new Set(STAGES.map(s => S.STAGE_EN[s].scene)).size, 3, '단계마다 빛·구도가 다르다');
assert(!P.buildPrompt({ outputMode: 'open', game: G[0], stage: '중반', styleText: text }).includes('SETTING (this form)'), '개방은 첨부 그림 + 명장면');

/* 3. 사실 칸 — 받지 않았으면 연도·개발사를 싣지 않는다. 받으면 GAME 줄에 */
const g0 = G.find(g => g.key === 'tetris');
const unfetched = { ...g0, facts: { ...g0.facts, fetched: null, year: null, developer: [] } };
assert(P.buildPrompt({ outputMode: 'form', game: unfetched, stage: '타이틀', styleText: text }).includes('GAME: «테트리스» (Tetris). Genre: puzzle. Graphics era: 8-bit console.'), '받지 않은 사실은 없다');
const fetched = { ...g0, facts: { ...g0.facts, fetched: '2026-10-26', year: 1984, developer: [{ qid: 'Q1', ko: null, en: 'Fixture Dev' }] } };
assert(P.buildPrompt({ outputMode: 'form', game: fetched, stage: '타이틀', styleText: text }).includes('GAME: «테트리스» (Tetris), 1984.') && !P.buildPrompt({ outputMode: 'form', game: fetched, stage: '타이틀', styleText: text }).includes('Fixture Dev'), '받은 연도만 — 개발사는 싣지 않는다');

/* 4. 직접 고른 얼굴·체형은 설계표 묶음을 이긴다 */
const g = G[0];
const mine = P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, params: [['face shape', 'oval'], ['body type', 'curvy']] });
assert(!mine.includes(S.VOCAB_EN.face_shape[g.face.face_shape]) && mine.includes('face shape: oval'), '직접 고른 윤곽이 이긴다');
assert(!mine.includes(S.VOCAB_EN.body[g.silhouette.body] + ' build') && mine.includes('body type: curvy'), '직접 고른 체형이 이긴다');
const off = P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, faceDesignOn: false, silhouetteOn: false });
assert(!off.includes('FACE (') && !off.includes('SILHOUETTE:'), '끄면 빠진다');

/* 5. 일상컷 — 트리 길(시대 → 장소 → 하는 일 → 의상 → 구도, 2026-10-29). 갈래 설명 문단·예시 문장은 없다 */
const cas = (x = {}) => P.buildCasual({ game: g, tree, styleText: text, styleCasual: cur.casual, ...x });
const sceneOf = t => t.split('SCENE (chosen):\n')[1].split('\n\n')[0];
const plain = cas();
assert(!/\nCategory: |\nExample scene: /.test(plain), '갈래 설명·예시 문장이 남았다');
assert(sceneOf(plain).startsWith('Place: ' + CT.place(tree, 'street_cafe').en + '\nActivity: ' + CT.act(tree, 'coffee_takeout').en + '\nOutfit: ' + CT.family(tree, 'everyday').en), '기본 길 — 카페·커피·평상복');
assert(plain.includes(T.trademark) && plain.includes('NEVER DRAW for this game:') && !plain.includes('WORLD:') && !plain.includes('SCREENS:') && !plain.includes('ERA:'), '지금 현실 기본');
assert(plain.includes('STYLE: ' + cur.casual) && !plain.includes('STYLE: ' + text), '일상컷 화풍 문장');
assert(cur.casual.includes('fabric and accessory') && text.includes('costume and accessory'), '화풍 판 — 폼은 costume, 일상은 fabric');
assert(plain.includes(T.casualWardrobe) && plain.includes(T.casualPose) && plain.includes(T.casualOutput), '옷·각도·출력 줄');
assert(plain.includes(T.figureCasual) && !plain.includes(T.figure), '일상컷은 배경 인물 허용 줄(붐비는 장소) — 폼·개방은 한 명만');
/* 옷 — 고른 옷 > 계열 풀이, 직접 쓴 옷이 이긴다 */
const lace = cas({ era: 'now', place: 'home_bedroom', act: 'dress_up', ofam: 'lingerie', item: 'lace_set' });
assert(sceneOf(lace).includes('Outfit: ' + CT.item(tree, 'lingerie', 'lace_set').en), '고른 옷');
assert(sceneOf(cas({ era: 'now', place: 'home_bedroom', act: 'dress_up', ofam: 'lingerie', item: 'lace_set', outfit: 'a red silk robe' })).includes('Outfit: a red silk robe') , '직접 쓴 옷이 이긴다');
/* 시대 — 게임 세계 안은 WORLD(설계표 place), 무대·환상은 SETTING, 출시 당시는 ERA */
const world = cas({ era: 'in_game', place: 'game_bath', act: 'soak', ofam: 'bath' });
assert(world.includes('WORLD: this scene happens inside the world of «' + g.title + '», as if she simply lives there — ' + q(g.place) + '.') && !world.includes('ERA:'), '게임 세계 안');
assert(sceneOf(cas({ era: 'in_game', place: 'game_place', act: 'stroll', ofam: 'everyday' })).startsWith('Place: the place named in WORLD'), '그 게임의 장소는 WORLD 를 가리킨다');
assert(cas({ era: 'fantasy', place: 'fx_studio', act: 'editorial_pose', ofam: 'editorial' }).includes(T.casualFantasy), '무대·환상');
const gu = { ...g, facts: { ...g.facts, year: null } };
const thenT = P.buildCasual({ game: gu, tree, styleText: text, era: 'release', place: 'arcade_hall', act: 'play_cabinet', ofam: 'everyday' });
assert(thenT.includes('ERA: set this scene in the real world around her release — ' + S.ERA_PERIOD[g.era] + '.'), '출시 당시 — 시대');
assert(P.buildCasual({ game: fetched, tree, styleText: text, era: 'release', place: 'arcade_hall', act: 'play_cabinet', ofam: 'everyday' }).includes('around 1984'), '출시 당시 — 받은 연도');
assert(thenT.indexOf('FRAME:') < thenT.indexOf('ERA:') && thenT.indexOf('ERA:') < thenT.indexOf('SCENE (chosen):\n') && thenT.indexOf('SCENE (chosen):\n') < thenT.indexOf('WARDROBE:'), 'FRAME → 시대 줄 → 고른 장면 → 옷 줄');
/* 고른 장면은 위쪽 — 「아래 설정을 따른다」 는 말이 남지 않는다 */
assert(!/below describe|settings below|line below|Framing below|chosen below/.test(plain), '일상컷에 「아래」 말이 남았다');
assert(plain.split('\n\n').findIndex(x => x.startsWith('SCENE (chosen):')) < plain.split('\n\n').findIndex(x => x.startsWith('WARDROBE:')), '장면이 옷 줄보다 앞');
assert(!P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, era: 'release' }).includes('ERA:'), '폼 초상에는 없다');
/* 출시 당시엔 그 해에 없던 곳이 빠진다 — 1984 년 테트리스에 PC방(1998)은 없다 */
assert(!CT.places(tree, 'release', fetched).some(p => p.key === 'arcade_pcbang') && CT.places(tree, 'now', fetched).some(p => p.key === 'arcade_pcbang'), '그 해부터 있는 곳');
/* 받은 연도가 없으면 시대의 대략 — 심시티(16비트, 연도 없음)에 방송 책상(2005)이 나왔다 */
assert(!CT.places(tree, 'release', { era: '16bit', facts: { year: null } }).some(p => p.key === 'studio_stream'), '연도 없으면 시대의 해로');
assert.equal(CT.repair(tree, { era: 'release', place: 'arcade_pcbang', act: 'pc_booth', ofam: 'everyday' }, fetched, S.CLOSE_FRAMES).place !== 'arcade_pcbang', true, '없는 곳은 고친다');
/* 화면 줄 — 오락실·작업실(·대회 무대·거실)만 */
for (const [pl, ac] of [['arcade_hall', 'play_cabinet'], ['studio_dev', 'pixel_desk'], ['studio_stream', 'stream_live'], ['stage_contest', 'trophy_lift']])
  assert(cas({ era: 'now', place: pl, act: ac, ofam: CT.outfitFamilies(tree, 'now', pl, ac)[0].key }).includes(T.casualScreens), pl + ' 화면 줄');
assert(!lace.includes('SCREENS:'), '침실엔 화면 줄 없음');
/* 가까운 프레이밍이면 CROP 줄 — 클로즈업에 발·옷 전체·가방이 함께 실려 부딪혔다(2026-10-29) */
const station = { era: 'now', place: 'travel_rural_station', act: 'wait_train', ofam: 'everyday' };
for (const frame of S.CLOSE_FRAMES) {
  const t = cas({ ...station, frame, pose: 'sitting' });
  assert(t.includes('CROP: ' + S.CROP_EDGE[frame] + '. This crop wins'), frame + ' CROP 줄에 잘리는 선');
  assert(t.indexOf('CROP:') > t.indexOf('FRAME:') && t.indexOf('CROP:') < t.indexOf('WARDROBE:'), frame + ' CROP 은 FRAME 바로 밑');
  assert(t.includes(T.anatomyClose) && !t.includes('7.5 heads'), frame + ' 가까운 컷에 등신 말 없음');
  /* 가까운 컷 — 옷 줄은 크롭 안만, 노출 풀이에 배·다리 말 없음, 렌즈는 거리를 정하지 않는다(조조전 일상 1·2·3) */
  const tb = cas({ ...station, frame, axes: { skin_exposure: 'bold' } });
  assert(tb.includes(T.casualWardrobeClose) && !tb.includes(T.casualWardrobe), frame + ' 가까운 컷 옷 줄');
  assert(!/skin_exposure: [^\n]*(midriff|leg)/.test(tb) && tb.includes('inside the crop'), frame + ' 가까운 컷 노출 풀이');
  assert(tb.includes('The lens sets perspective only'), frame + ' 렌즈는 거리를 정하지 않는다');
  assert(tb.includes('runs naturally on past it — never cut off'), frame + ' 가장자리를 넘는 팔다리'); // 조조전 일상2 — 뻗은 팔이 화면 안에서 끊겼다
}
assert(cas({ ...station, frame: 'full_body' }).includes(T.anatomy), '먼 컷은 등신 줄 그대로');
assert(cas({ ...station, frame: 'full_body', axes: { skin_exposure: 'bold' } }).includes(T.casualWardrobe) && /skin_exposure: bold — more scene-appropriate shoulder, back, midriff or leg/.test(cas({ ...station, frame: 'full_body', axes: { skin_exposure: 'bold' } })), '먼 컷은 옷·노출 줄 그대로');
for (const frame of ['full_body', 'environmental', 'three_quarter', '']) assert(!cas({ ...station, frame }).includes('CROP:'), frame + ' CROP 없음');
const walk = { era: 'now', place: 'street_alley', act: 'stroll', ofam: 'everyday' };
for (const x of [{ orient: 'rear_3q' }, { orient: 'over_shoulder' }, { pose: 'turning_back' }]) assert(cas({ ...walk, ...x }).includes(T.casualLookBack), '뒤돌아보기 ' + JSON.stringify(x));
assert(!cas({ ...walk, orient: 'front_3q' }).includes('LOOK-BACK:'), '앞모습엔 뒤돌아보기 줄 없음');
/* 자세·방향은 하는 일의 자세 계열 안에서만 — 앉아 기다리는데 걸어가는 뒷모습은 고쳐서 지운다 */
const fixed = CT.repair(tree, { ...station, pose: 'walking', orient: 'walking_away' }, g, S.CLOSE_FRAMES);
assert(fixed.pose === '' && fixed.orient === '', '앉기 계열에 걷기 자세·방향은 없다');
assert(CT.orients(tree, 'wait_train', 'face_close', S.CLOSE_FRAMES).includes('profile_close') && !CT.orients(tree, 'wait_train', 'full_body', S.CLOSE_FRAMES).includes('profile_close'), '가까운 옆얼굴은 가까운 컷에서만');
/* 알아볼 거리 — 자동은 하나~둘, 하나를 골랐으면 그것만, 없음이면 줄이 없다. 폼 장비 줄은 없다 */
assert(plain.includes('SIGNATURE (one or two at most, as an accessory or an object in the scene — never printed on or woven into the clothes): ' + g.signature.map(s => '"' + q(s) + '"').join(', ') + '.') && !plain.includes('GEAR in'), '일상컷 알아볼 거리는 장신구·주변 사물로');
assert(cas({ prop: '1' }).includes(T.casualSignatureOne.replace('{item}', '"' + q(g.signature[1]) + '"')), '알아볼 거리 하나');
assert(!cas({ prop: 'none' }).includes('SIGNATURE'), '알아볼 거리 없음');
/* 분리형 선호는 고른 옷에 진다 */
for (const v of ['prefer separates', 'strongly prefer separates']) assert(S.SCENE_AXIS_GUIDES.separates_preference[v][1].includes('chosen Outfit'), '분리형 ' + v);
/* 일상컷 옷은 장면의 옷 그대로 — 게임의 색·무늬는 장신구·주변 사물로만(2026-10-29 옷이 첨부 그림을 따라 비슷비슷했다) */
assert(!/color echo|motif on the clothing|source palette and motifs in clothing|integrated into everyday clothing/.test(JSON.stringify(T) + JSON.stringify(S.SCENE_AXIS_GUIDES)), '옷에 게임 색·무늬를 넣으라는 말이 남았다');
assert(plain.includes("Do not carry the attached image's palette, patterns or trim into the outfit") && plain.includes("never in the outfit's colours, patterns or cut"), '옷은 첨부 그림의 색·무늬를 따르지 않는다');
for (const v of ['subtle', 'balanced', 'strong']) {
  const t = cas({ axes: { source_influence: v } });
  assert(/accessor|props|object in the scene/.test(t.match(/source_influence: [^\n]*/)[0]) && !/in clothing\b|into everyday clothing/.test(t), '원본 반영 ' + v + ' 은 장신구·사물로');
}
assert(!/simplified costume motifs|never exact icons/.test(JSON.stringify(T)), '상징을 일반화하라는 말이 남았다');
/* 일상컷 화면비 — 기본 2:3 도 늘 FRAME 줄로 싣는다. 고르면 그 비율 하나만 */
assert(plain.includes('FRAME: a vertical 2:3 (1024×1536) image.') && !plain.includes('Aspect ratio'), '일상컷 FRAME 기본 2:3');
for (const [a, w] of [['3:2', 'a horizontal 3:2 (1536×1024)'], ['1:1', 'a square 1:1'], ['9:16', 'a tall vertical 9:16'], ['16:9', 'a wide horizontal 16:9']]) {
  const t = cas({ aspect: a });
  assert(t.includes('FRAME: ' + w) && !t.includes('2:3') && !t.includes('Aspect ratio'), '일상컷 FRAME ' + a);
}
/* 예전 기록(갈래·예시) — 변환표로 같은 길이 된다 */
assert.equal(cas({ cat: 'travel_exploration', ex: 'travel_station' }), cas({ era: 'now', place: 'travel_rural_station', act: 'wait_train', ofam: 'everyday' }), '예전 기록 → 추천 조합 길');
assert(sceneOf(cas({ cat: 'lingerie', ex: 'lace_set' })).includes(CT.item(tree, 'lingerie', 'lace_set').en), '예전 옷 예시 → 그 옷');
assert(cas({ cat: 'arcade_culture', ex: 'arc_cabinet', era: 'release' }).includes('ERA:'), '예전 출시 당시는 그대로');
/* 추천 조합 282 개가 다 조립되고, 따옴표 밖은 영어, 길이 한도 */
let longestCasual = 0;
for (const pr of tree.presets) {
  const t = cas(CT.applyPreset(tree, {}, pr.key));
  assert(t.includes('Place: ') && t.includes('Activity: ') && t.includes('Outfit: '), pr.key + ' 장면 줄');
  assert(!/[가-힣]/.test(t.replace(/"[^"]*"/g, '').replace(/«[^»]*»/g, '').replace(/STYLE: [^\n]*/, '')), pr.key + ' 따옴표 밖은 영어');
  longestCasual = Math.max(longestCasual, P.words(t));
}
assert(longestCasual <= LIMIT, '가장 긴 일상컷이 ' + LIMIT + ' 낱말을 넘는다: ' + longestCasual);
assert.throws(() => P.buildCasual({ game: g, styleText: text }), /Casual tree is required/);
assert(!/Pok[eé]mon|포켓몬|Gundam|건담/.test(JSON.stringify(S)), '표에 포켓몬·건담 말이 남았다');

/* 6. 화풍 블록은 앞, 점검 줄은 맨 끝, 참고 그림은 그리는 방식만 */
const full = { game: g, tree, stage: '타이틀', styleText: text, styleCasual: cur.casual, styleCheck: cur.check, styleRef: true, params: [] };
for (const [name, t] of [['새 인물', P.buildPrompt({ ...full, outputMode: 'form' })], ['이어가기', P.buildPrompt({ ...full, outputMode: 'form', identityMode: 'reference', baseStage: '타이틀' })],
  ['개방', P.buildPrompt({ ...full, outputMode: 'open' })], ['일상', P.buildCasual({ ...full, era: 'in_game', place: 'game_place', act: 'stroll', ofam: 'everyday' })]]) {
  const parts = t.split('\n\n');
  assert(parts.findIndex(x => x.startsWith('STYLE: ')) <= 4, name + ' — 화풍 블록이 앞쪽(입력·게임·캐릭터 아님 다음)');
  assert(parts[parts.length - 1].startsWith('FINAL CHECK: '), name + ' — 맨 끝에 화풍 점검');
  assert(t.includes('STYLE REFERENCE:') && /style reference image/.test(parts[0]), name + ' — 참고 그림은 그리는 방식만');
}
assert(!P.buildPrompt({ ...full, outputMode: 'form', styleRef: false, styleCheck: '' }).includes('FINAL CHECK'), '점검이 없는 판은 그 줄도 없다');
assert(T.eraLook.includes('never pixel art'), '시대 줄이 그림을 도트로 바꾸지 않게');

/* 7. 노출 — 고른 수준만, 의상 구조에 맞는 갈래 */
const exp = k => P.buildPrompt({ ...full, styleRef: false, outputMode: 'form', exposure: k });
assert(exp('bold').includes('deep open neckline') && exp('bold').includes('Nothing slipped off'), '과감 줄');
for (const gm of G) {
  const layer = S.GARMENT_LAYER[gm.silhouette.garment] || 'open';
  assert(P.buildPrompt({ outputMode: 'form', game: gm, stage: '타이틀', styleText: text, exposure: 'bold' }).includes(S.FORM_EXPOSURE.bold[layer]), gm.key + ' 과감 갈래 ' + layer);
}
assert(!S.FORM_EXPOSURE.bold.hanbok, '한복 갈래는 책 몫 — 없다');
assert(!exp('').includes('EXPOSURE') && exp('low').includes('EXPOSURE (low)'));
assert(!P.buildPrompt({ ...full, outputMode: 'open', exposure: 'bold' }).includes('EXPOSURE'), '개방은 첨부 그림의 차림 그대로');
assert(exp('bold').includes('7.5 heads'), '등신 줄');

/* 8. 나이·연출·자세 */
const parts0 = P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, params: [] }).split('\n\n');
assert(parts0[parts0.findIndex(x => x.startsWith('SUBJECT:')) + 1] === S.AGE_LINES['20s'], '자동이면 20대 줄이 SUBJECT 바로 뒤');
for (const t of [P.buildPrompt({ ...full, styleRef: false, outputMode: 'form', identityMode: 'reference', baseStage: '타이틀' }), P.buildPrompt({ ...full, outputMode: 'open' }), P.buildCasual({ ...full })])
  assert(t.includes(S.AGE_KEEP) && !t.includes(S.AGE_LINES['20s']), '첨부 그림이 정하는 갈래는 나이를 지킨다');
const pf = P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, exposure: 'bold' }).split('\n\n');
const pi = pf.indexOf(T.presentation);
const po = pf[pi + 2].startsWith('LOOK-BACK') ? pi + 3 : pi + 2;
assert(pi > 0 && pf[pi - 1].startsWith('EXPOSURE') && pf[pi + 1].startsWith('STANCE') && pf[po].startsWith('OUTPUT:'), '노출 → 연출 → 자세 → (돌아보기) → 출력');
/* 폼 자세가 돌아보기면 LOOK-BACK 줄 — 히어로즈 3 중반이 몸은 뒤로·얼굴은 정면으로 목이 꺾였다 */
for (const game of design.games) for (const stage of ['타이틀', '중반', '엔딩']) {
  const t = P.buildPrompt({ outputMode: 'form', game, stage, styleText: text, identityMode: stage === '타이틀' ? 'create' : 'reference', baseStage: '타이틀', params: [] });
  assert.equal(t.includes(T.formLookBack), /돌아보|뒤를 보|뒤돌아/.test(game.forms[stage].pose), game.key + ' ' + stage + ' 돌아보기 줄');
}
for (const gm of G) for (const stage of STAGES) {
  const t = P.buildPrompt({ outputMode: 'form', game: gm, stage, styleText: text });
  assert(t.includes('STANCE (this form): "' + q(gm.forms[stage].pose) + '"') && t.includes(T.handsPose) && !t.includes(T.handsDefault), gm.key + ' ' + stage + ' 폼 자세');
  assert(t.includes('HOLD BACK:') && Object.values(gm.opens).every(o => t.includes(q(o.scene))), gm.key + ' 개방 명장면은 폼 배경에서 뺀다');
  // 마리오 엔딩 — 실루엣의 "한 주먹을 든다" 와 STANCE 의 "깃대를 두 손으로" 가 겹쳐 팔이 셋이 되려 했고, 깃발은 HOLD BACK 에 빠지고 깃대는 몸 앞을 가리면 안 됐다(2026-10-27)
  assert(!t.includes('attitude: ') && t.includes('An object named in FORM or in her pose stays.') && t.includes('nothing in front of her but what she holds'), gm.key + ' 폼 자세와 부딪히는 줄');
}
assert(!P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, pose: 'standing' }).includes('STANCE'), '자세를 고르면 기본 자세 줄이 빠진다');
assert(!S.ACTION_CONTROLS.some(c => c.key === 'equipment'), '무장 고르기가 없다');
assert(P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, params: [['hair color', '#1b2a6b']] }).includes('hair color: #1B2A6B (dark blue)'), '머리 RGB');
/* 머리·눈 색 — 고르지 않으면 흑발로 흘렀다. 설계표의 대표색이 실루엣·얼굴 줄에 실리고, 직접 고르면 빠진다(2026-10-29) */
for (const x of G) {
  const t = P.buildPrompt({ outputMode: 'form', game: x, stage: '타이틀', styleText: text });
  assert(/SILHOUETTE:[^\n]*/.exec(t)[0].includes(S.VOCAB_EN.hair_color[x.silhouette.hair_color]) && /FACE \([^\n]*/.exec(t)[0].includes(S.VOCAB_EN.eye_color[x.face.eye_color]), x.key + ' 설계표 머리·눈 색');
}
const picked = P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, params: [['hair color', 'black'], ['eye color', 'brown']] });
assert(!picked.includes(S.VOCAB_EN.hair_color[g.silhouette.hair_color]) && !picked.includes(S.VOCAB_EN.eye_color[g.face.eye_color]), '고른 머리·눈 색이 이긴다');
assert(!V.hair_color.some(k => /black|brown/.test(k)), '설계표 머리색에 검정·갈색은 없다');
const sc = G.find(x => x.key === 'starcraft');
assert(/FACE \([^\n]*broad Korean ancestry/.test(P.buildPrompt({ outputMode: 'form', game: sc, stage: '타이틀', styleText: text })), '설계표 계통');
assert(!P.buildPrompt({ outputMode: 'form', game: sc, stage: '타이틀', styleText: text, params: [['facial ethnicity', 'Nordic']] }).includes('Korean ancestry'), '고른 계통이 이긴다');
assert.throws(() => P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: '' }), /Style text/);
assert.throws(() => P.buildPrompt({ outputMode: 'form', stage: '타이틀', styleText: text }), /Game is required/);

/* 9. 일상컷 트리 버전2(docs/CASUAL_TREE_V2.md 5절) — 장면 treeV 2 + 표 tree2 면 버전2 줄 */
const C2 = ctx.window.AtelierCasualTreeV2, tree2 = JSON.parse(fs.readFileSync('data/casual-tree-v2.json', 'utf8')), t2 = C2.make(tree2, tree);
const cas2 = (game, sc, x = {}) => P.buildCasual({ game, tree, tree2, styleText: text, styleCasual: cur.casual, styleCheck: cur.check, ...sc, ...x });
const block = (txt, head) => txt.split('\n\n').find(l => l.startsWith(head)) || '';
/* 추천마다 쓸 수 있는 장소 · 시대 · 옷 계열 하나 */
const spots = tree2.presets.map(pr => {
  for (const pl of tree.places) {
    const era = pl.eras.includes('now') ? 'now' : pl.eras[0];
    for (const ofam of C2.era(t2, era).outfits) if (C2.presetOk(t2, { era, place: pl.key, ofam }, pr.key)) return C2.repair(t2, C2.applyPreset(t2, { era, place: pl.key, ofam }, pr.key));
  }
  assert.fail(pr.key + ' 쓸 장소가 없다');
});
let longestV2 = 0, v2n = 0;
for (const game of G) for (const sc0 of spots) {
  const sc = C2.repair(t2, sc0, game), txt = cas2(game, sc), scene = block(txt, 'SCENE (chosen):'), f = C2.frame(t2, sc.frame), u = C2.use(t2, sc.use), pr = u && C2.prop(t2, u.prop);
  const w = sc.preset + ' ' + game.key;
  assert(!/^(Activity|Pose|Orientation|Framing): /m.test(scene) && !txt.includes(T.handsCasual) && !txt.includes(T.casualOutput), w + ' 버전1 줄이 없다');
  assert(scene.includes('POSTURE: ') && scene.includes('COMPOSITION: ' + f.en) && txt.includes(T.bodyV2) && txt.includes(T.handsV2) && txt.includes(T.casualOutputV2), w + ' 버전2 줄');
  assert(scene.includes('Lens / perspective: ' + S.LENS_GUIDES[C2.lens(t2, sc.frame)][1]), w + ' 렌즈 자동');
  assert(sc.right === sc.left && C2.hand(t2, sc.right) && C2.hand(t2, sc.right).both ? scene.includes('BOTH HANDS: ') && !scene.includes('RIGHT HAND: ') : /RIGHT HAND: her own right\b/.test(scene) && /LEFT HAND: her own left\b/.test(scene), w + ' 손 줄');
  assert.equal(scene.includes('PROP: '), !!u, w + ' 소품 줄은 소품 동작이 있을 때만');
  if (u && u.hands === 'both') assert(scene.includes(u.grip.right) && scene.includes(u.grip.left), w + ' 두 손 소품은 손마다');
  if (pr && pr.signature) assert(!txt.includes('SIGNATURE (') && game.signature_hold.length && scene.includes('"' + q(game.signature[game.signature_hold[0]]) + '"'), w + ' 알아볼 거리를 들면 SIGNATURE 대신 PROP — 들 수 있는 것만');
  else assert(txt.includes('SIGNATURE ('), w + ' 알아볼 거리 줄');
  assert.equal(scene.includes('LEGS: '), !!(sc.legs && f.legs), w + ' 다리 줄은 다리가 보이는 컷만');
  assert.equal(/looks into the camera/.test(txt), sc.gaze === 'camera', w + ' 카메라 응시는 고른 때만');
  const bd = tree2.body.find(b => b.key === sc.body) || {}, hd = tree2.head.find(x => x.key === sc.head) || {};
  assert(!txt.includes(T.casualLookBack), w + ' 버전1 돌아보기 줄(눈은 카메라 쪽)은 없다');
  assert.equal(txt.includes(T.casualLookBackV2), !!(bd.far && hd.look_back), w + ' 돌아보기 줄은 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만');
  if (f.close) assert(txt.includes(T.casualCropV2.split('{edge}')[0]) && txt.includes(T.anatomyClose) && !txt.includes('7.5 heads'), w + ' 가까운 컷 CROP · 몸 줄');
  assert(!/[가-힣]/.test(txt.replace(/"[^"]*"/g, '').replace(/«[^»]*»/g, '').replace(/STYLE: [^\n]*/, '')), w + ' 따옴표 밖은 영어');
  longestV2 = Math.max(longestV2, P.words(txt)); v2n++;
}
assert(longestV2 <= LIMIT, '가장 긴 버전2 일상컷이 ' + LIMIT + ' 낱말을 넘는다: ' + longestV2);
/* 가장 무거운 꼴 — 가장 긴 표정 · 축 다섯 · 모티프를 다 얹어도 상한 안 */
const heavy = { expr: 'laughing_open', motifs: 'frost runes, a tavern lantern', axes: { overall_intensity: 'strong', skin_exposure: 'bold', action_level: 'mostly active', source_influence: 'balanced', separates_preference: 'prefer separates' } };
let heaviest = 0;
for (const game of G) for (const sc of spots) heaviest = Math.max(heaviest, P.words(cas2(game, sc, heavy)));
assert(heaviest <= LIMIT, '표정 · 축을 다 얹은 버전2 일상컷이 ' + LIMIT + ' 낱말을 넘는다: ' + heaviest);
/* 표정의 시선 말은 떼고 GAZE 줄 하나가 정한다 */
for (const [k, v] of Object.entries(S.EXPRESSION_DETAIL)) {
  const e = P.exprNoGaze(v);
  assert(!/to the side|away|past the camera|off camera|forward gaze|direct \w+ gaze|gaze direct|directed[^,]*upward|angled down|fixed on/.test(e) && e.length > 10, k + ' 표정에 시선 말: ' + e);
}
/* 고정 사례(검토 2026-10-30) */
const pick = k => spots.find(sc => sc.preset === k);
// 멀어지며 걷기 — 등만 돌린 컷에 돌아보기 · 카메라 응시 · 표정이 붙지 않는다
const away = cas2(g, { ...pick('walk_away'), expr: 'soft_smile' });
assert(!away.includes('LOOK-BACK') && !/looks into the camera|toward the camera/.test(block(away, 'SCENE')) && !block(away, 'SCENE').includes('EXPRESSION:'), '멀어지며 걷기');
assert(cas2(g, pick('rail_lookback')).includes(T.casualLookBackV2) && !cas2(g, pick('rail_lookback')).includes('swing toward the camera'), '난간에서 돌아보기 — 눈은 GAZE 가');
// 데이브 더 다이브 — 바다를 손에 들지 않는다
const dave = G.find(x => x.key === 'dave_the_diver');
for (const sc of spots) { const tx = cas2(dave, sc); assert(!/PROP: [^\n]*블루 홀/.test(tx), sc.preset + ' 바다를 든다'); }
// 표정 — 버전2 표는 생성기 표정을 다 덮고, 시선 · 고개 말이 없다
assert.deepEqual(Object.keys(tree2.expressions).sort(), Object.keys(S.EXPRESSION_DETAIL).sort(), '버전2 표정 표가 표정을 다 덮는다');
for (const [k, e] of Object.entries(tree2.expressions)) assert(!/\bgaze\b|looking|\baway\b|averted|darting|camera|\bhead\b|\bchin\b|to the side/.test(e), k + ' 버전2 표정에 시선 · 고개 말');
const fl = block(cas2(g, { ...pick('sip_close'), expr: 'flustered' }), 'SCENE');
assert(fl.includes('EXPRESSION: ' + tree2.expressions.flustered) && !/averted|darting/.test(fl), '당황 — 눈 돌리기 말이 없다');
// 옷 직접 쓰기 — 주머니 없는 드레스 글이면 주머니 손이 남지 않는다
const jeans = { treeV: 2, era: 'now', place: 'home_living', ofam: 'everyday', item: 'jeans_tee', posture: 'stand', support: 'none', frame: 'waist_up', right: 'pocket', left: 'hip' };
assert(/RIGHT HAND: [^\n]*pocket/.test(block(cas2(g, jeans), 'SCENE')), '청바지면 주머니 손');
const dr = block(cas2(g, { ...jeans, outfit: 'a strapless satin dress with no pockets' }), 'SCENE');
assert(!/RIGHT HAND: [^\n]*pocket/.test(dr) && dr.includes('Outfit: a strapless satin dress'), '자유 의상 + 주머니 손');
// 시범(MGS) — 옆모습 몸이면 얼굴도 옆모습, 망원경은 들여다보기, 가까운 컷 노출 말은 컷을 끌어내리지 않는다
const rooftop = { treeV: 2, era: 'now', place: 'night_rooftop', ofam: 'everyday', item: 'trench_coat', posture: 'stand', support: 'none', frame: 'waist_up', body: 'side', head: 'with_body', camera: 'eye', right: 'prop', left: 'prop', use: 'scope_look', gaze: '' };
const rs = block(cas2(g, rooftop), 'SCENE');
assert(rs.includes('body in side profile, her face in profile too, not turned toward the camera') && rs.includes('GAZE: ' + tree2.gaze.find(x => x.key === 'into_prop').en), '옥상 망원경 ' + rs);
assert(block(cas2(g, { ...rooftop, use: '', right: 'down', left: 'down', frame: 'full_body', gaze: 'camera' }), 'SCENE').includes('only her eyes turn toward the camera'), '옆모습 + 카메라 응시는 눈만');
assert(!block(cas2(g, { ...rooftop, head: 'tilt' }), 'SCENE').includes('face in profile too'), '머리를 돌리면 얼굴 말을 안 붙인다');
// 넓히기 시범(MGS 일상7 · 11) — 뒤 3/4 + 머리 그대로면 얼굴도 돌아간다, 발목 교차는 발을 말한다, 노트 문장
const green = { treeV: 2, era: 'now', place: 'greenhouse', ofam: 'roleplay', item: 'florist_apron', posture: 'stand', support: 'none', frame: 'environmental', body: 'rear_3q', head: 'with_body', camera: 'eye', right: 'prop', left: 'natural', use: 'can_water', gaze: 'at_prop' };
assert(block(cas2(g, green), 'SCENE').includes('away from the camera, her face turned away with her body too'), '뒤 3/4 얼굴');
assert(!block(cas2(g, { ...green, head: 'over_shoulder', gaze: 'camera' }), 'SCENE').includes('face turned away'), '어깨 너머면 얼굴 말 없음');
const berth = block(cas2(g, { treeV: 2, era: 'now', place: 'train_sleeper', ofam: 'homewear', item: 'fleece_joggers', posture: 'sit_edge', support: 'hip_edge', frame: 'full_body', body: 'front_3q', head: 'with_body', camera: 'eye', right: 'prop', left: 'prop', use: 'notebook_write', legs: 'ankles_crossed', gaze: 'at_prop' }), 'SCENE');
assert(berth.includes('writes in a notebook with a pen') && berth.includes('one ankle crossed over the other'), '침대칸 ' + berth);
const fc = cas2(g, { ...pick('shush_close'), axes: { skin_exposure: 'bold' } });
assert(fc.includes('the crop stays exactly where CROP sets it and never moves down') && !fc.includes('neckline and upper-back exposure'), '클로즈업 노출 말');
// 손 칸 AUTO — 그 손 줄이 없다, 둘 다 AUTO 면 손 줄이 하나도 없다(HANDS 해부학 줄은 남는다)
assert(!block(cas2(g, { ...jeans, left: '' }), 'SCENE').includes('LEFT HAND:') && block(cas2(g, { ...jeans, left: '' }), 'SCENE').includes('RIGHT HAND:'), '왼손 AUTO');
const noHands = cas2(g, { ...jeans, right: '', left: '' });
assert(!/RIGHT HAND:|LEFT HAND:|BOTH HANDS:/.test(noHands) && noHands.includes(T.handsV2), '두 손 AUTO');
// 표정 — 몸 「뒤」 + 고개 그대로만 싣지 않는다. 뒤 3/4 는 옆얼굴이 보여 싣는다(사용자 2026-10-30)
const backish = b => block(cas2(g, { ...jeans, frame: 'full_body', right: 'down', left: 'down', body: b, head: 'with_body', expr: 'soft_smile' }), 'SCENE');
assert(backish('rear_3q').includes('EXPRESSION: ') && !backish('back').includes('EXPRESSION: '), '뒤 3/4 는 표정, 뒤는 없음');
// 확장 — 계절 · 날씨 줄, 안경, 새 장소 · 동작
const lib2 = { treeV: 2, era: 'now', place: 'library_reading', ofam: 'everyday', item: 'turtleneck_quilted_vest', posture: 'sit_chair', support: 'none', frame: 'waist_up', body: 'front_3q', head: 'with_body', camera: 'eye', right: 'prop', left: 'prop', use: 'book_turn', weather: 'rain', ofeat: ['glasses'] };
const ls = block(cas2(g, lib2), 'SCENE');
assert(ls.includes('Place: a quiet library reading room') && ls.includes('Weather / season: a rainy day') && ls.includes('quilted vest with straight trousers; she wears thin-framed glasses') && ls.includes('turns a page of a book lying open on the table'), '도서관 비 오는 창가 ' + ls);
assert(!block(cas2(g, { ...lib2, weather: '' }), 'SCENE').includes('Weather'), '날씨 AUTO 는 줄이 없다');
const arc = block(cas2(g, { ...lib2, place: 'arcade_hall', posture: 'stand', use: 'panel_play', weather: '', ofeat: [] }), 'SCENE');
assert(arc.includes('plays at the control panel of the arcade cabinet in front of her') && arc.includes('works the joystick'), '오락기 조작대 ' + arc);
const hs = spots.find(sc => sc.preset === 'sip_close');
assert(block(cas2(g, { ...hs, expr: 'pensive' }), 'SCENE').includes('EXPRESSION: slightly furrowed brow'), '표정 줄');
/* 버전1 기록은 표가 와도 버전1 그대로, 옮기면 버전2 */
const v1sc = { era: 'now', place: 'travel_rural_station', act: 'wait_train', ofam: 'everyday', frame: 'full_body' };
assert(cas2(g, v1sc).includes('Activity: ') && !cas2(g, v1sc).includes('POSTURE: '), '버전1 기록은 버전1 줄');
const moved = C2.fromV1(t2, v1sc);
assert(cas2(g, moved).includes('POSTURE: ') && !cas2(g, moved).includes('Activity: '), '옮긴 기록은 버전2 줄');
assert.throws(() => P.buildCasual({ game: g, tree2, treeV: 2, styleText: text }), /Casual tree is required|Casual tree v2/);

console.log(`PASS 일상컷 버전2: ${G.length}편 × 추천 ${spots.length} = ${v2n}개 · 가장 긴 것 ${longestV2}낱말(다 얹으면 ${heaviest}) · 상한 ${LIMIT} · 버전1 줄 없음 · 손 줄 · 소품 · 다리 · 시선 · 뒤돌아보기 · 가까운 컷 · 표정 시선 말`);
console.log(`PASS 게임 프롬프트: ${G.length}편 × 폼 3 × (새 인물·이어가기·개방) ${n}개 · 가장 긴 것 ${longest}낱말 · 정한 말 영어 · 캐릭터 아님·그리지 않을 것 · 핵심 조작·시대 · 사실은 받은 것만 · `
  + `일상컷 트리(시대·장소·하는 일·옷·자세 계열·화면 줄·CROP·알아볼 거리·예전 기록) · 추천 조합 ${tree.presets.length}개 가장 긴 것 ${longestCasual}낱말 · 일상컷 화풍 문장 · 화풍 앞·점검 끝 · 노출·나이·자세`);
