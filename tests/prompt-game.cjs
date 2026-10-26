/* 게임 프롬프트 — 설계표 열 편 × 세 폼 × (새 인물·이어가기·개방) + 일상컷이 다 조립되고, 정한 말이 다 영어로 풀린다.
   book-atelier 의 tests/prompt-book.cjs 에서 왔다. 책 몫(보호 중인 책·한복·이야기 속 장소·각색)은 빼고 게임 몫을 더했다:
   캐릭터 아님·그리지 않을 것 줄, 핵심 조작·시대 줄, 게임 갈래 넷(게임 속 장소·화면 줄), 출시 당시, 사실 칸은 받은 것만.
   Run: node tests/prompt-game.cjs */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/prompt-game.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const S = ctx.window.AtelierSpec, P = ctx.window.AtelierPrompt, T = S.GAME_LINES;
const design = JSON.parse(fs.readFileSync('data/game-design.json', 'utf8'));
const style = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));
const gs = style.styles[style.default], cur = gs.versions.find(v => v.v === gs.current), text = cur.text;
const V = design.vocab, G = design.games, STAGES = Object.keys(V.form_key);
const q = s => String(s).replace(/"/g, "'");

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
  for (const t of [create, ref, open]) {
    assert(t.includes('ONE FIGURE ONLY') && t.includes('HANDS'), '한 명·손 줄');
    assert(t.includes(T.trademark) && t.includes('NEVER DRAW for this game: ' + avoidLine(g)), g.key + ' 캐릭터 아님·그리지 않을 것 줄');
    assert(!/[가-힣]/.test(t.replace(/"[^"]*"/g, '').replace(/«[^»]*»/g, '').replace(/STYLE: [^\n]*/, '').replace(/\((타이틀|중반|엔딩)\)/g, '')),
      '설계표 글(따옴표 안)·게임 이름 말고는 영어: ' + g.key + ' ' + stage);
    longest = Math.max(longest, P.words(t)); n++;
  }
}
assert(longest <= 800, '가장 긴 프롬프트가 800 낱말을 넘는다: ' + longest);

/* 3. 사실 칸 — 받지 않았으면 연도·개발사를 싣지 않는다. 받으면 GAME 줄에 */
const g0 = G.find(g => g.key === 'tetris');
const unfetched = { ...g0, facts: { ...g0.facts, fetched: null, year: null, developer: [] } };
assert(P.buildPrompt({ outputMode: 'form', game: unfetched, stage: '타이틀', styleText: text }).includes('GAME: «테트리스» (Tetris). Genre: puzzle. Graphics era: 8-bit console.'), '받지 않은 사실은 없다');
const fetched = { ...g0, facts: { ...g0.facts, fetched: '2026-10-26', year: 1984, developer: [{ qid: 'Q1', ko: null, en: 'Fixture Dev' }] } };
assert(P.buildPrompt({ outputMode: 'form', game: fetched, stage: '타이틀', styleText: text }).includes('GAME: «테트리스» (Tetris), 1984 by Fixture Dev.'), '받은 연도·개발사');

/* 4. 직접 고른 얼굴·체형은 설계표 묶음을 이긴다 */
const g = G[0];
const mine = P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, params: [['face shape', 'oval'], ['body type', 'curvy']] });
assert(!mine.includes(S.VOCAB_EN.face_shape[g.face.face_shape]) && mine.includes('face shape: oval'), '직접 고른 윤곽이 이긴다');
assert(!mine.includes(S.VOCAB_EN.body[g.silhouette.body] + ' build') && mine.includes('body type: curvy'), '직접 고른 체형이 이긴다');
const off = P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, faceDesignOn: false, silhouetteOn: false });
assert(!off.includes('FACE (') && !off.includes('SILHOUETTE:'), '끄면 빠진다');

/* 5. 일상컷 갈래 — 책 몫 넷은 없고 게임 몫 넷이 있다 */
const cats = S.CATS.map(r => r[0]);
for (const c of ['library_life', 'story_place', 'stage_adaptation', 'literary_salon']) assert(!cats.includes(c) && !S.EXAMPLE_MAP[c] && !S.CAT_KO[c], '책 갈래가 남았다: ' + c);
for (const c of ['game_place', 'arcade_culture', 'dev_studio', 'speedrun_stream']) {
  assert(cats.includes(c) && S.CAT_KO[c] && (S.EXAMPLE_MAP[c] || []).length >= 10, '게임 갈래: ' + c);
  for (const r of S.EXAMPLE_MAP[c]) if (r[0]) assert(S.EX_NOTE[r[0]], c + ' · ' + r[0] + ' 설명이 없다');
}
assert(!/STORY PLACE|ADAPTATION|BOOK:/.test(JSON.stringify(T)), '책 문장이 남았다');
assert(!/her book|book's|library hall|bookmark/i.test(JSON.stringify(S.EXAMPLE_DETAIL) + JSON.stringify(S.CATS) + JSON.stringify(S.EXAMPLE_MAP)), '공용 갈래에 책 말이 남았다');
for (const r of S.CATS) if (r[0] !== 'auto_random' && r[0] !== '__custom__') assert((S.EXAMPLE_MAP[r[0]] || []).length, r[0] + ' 예시가 없다');
const cas = (cat, ex, x = {}) => P.buildCasual({ game: g, styleText: text, styleCasual: cur.casual, cat, ex, ...x });
/* 게임 속 장소는 설계표 place, 오락실·개발실·방송은 화면 줄 — 다른 갈래에는 안 싣는다 */
const gp = cas('game_place', 'gp_walk');
assert(gp.includes('GAME PLACE: a real-feeling place shaped like the world of «' + g.title + '» — ' + g.place + '.') && !gp.includes('SCREENS:'), '게임 속 장소 줄');
for (const [c, ex] of [['arcade_culture', 'arc_cabinet'], ['dev_studio', 'dev_pixel_desk'], ['speedrun_stream', 'sr_record']]) {
  const t = cas(c, ex);
  assert(t.includes(T.casualScreens) && !t.includes('GAME PLACE:'), c + ' 화면 줄');
  assert(t.includes(S.EXAMPLE_MAP[c].find(r => r[0] === ex)[5]), c + ' 예시 문장');
}
const plain = cas('everyday_basic', '');
assert(!plain.includes('GAME PLACE:') && !plain.includes('SCREENS:'), '다른 갈래엔 없다');
assert(plain.includes(T.trademark) && plain.includes('NEVER DRAW for this game:'), '일상컷에도 캐릭터 아님 줄');
/* 일상컷 화풍은 판의 casual 문장(pkm 일상컷), 폼·개방은 text */
assert(plain.includes('STYLE: ' + cur.casual) && !plain.includes('STYLE: ' + text), '일상컷 화풍 문장');
assert(cur.casual.includes('fabric and accessory') && text.includes('costume and accessory'), '화풍 판 — 폼은 costume, 일상은 fabric');
assert(plain.includes(T.casualWardrobe) && plain.includes(T.casualPose), '옷·각도 줄');
for (const x of [{ orient: 'rear_3q' }, { orient: 'over_shoulder' }, { pose: 'turning_back' }]) assert(cas('game_place', 'gp_walk', x).includes(T.casualLookBack), '뒤돌아보기 ' + JSON.stringify(x));
assert(!cas('game_place', 'gp_walk', { orient: 'front_3q' }).includes('LOOK-BACK:'), '앞모습엔 뒤돌아보기 줄 없음');
/* 출시 당시 — 받은 연도가 있으면 그 해, 없으면 시대 */
const gu = { ...g, facts: { ...g.facts, year: null } };
const nowT = P.buildCasual({ game: gu, styleText: text, cat: 'arcade_culture', ex: 'arc_cabinet' }),
  thenT = P.buildCasual({ game: gu, styleText: text, cat: 'arcade_culture', ex: 'arc_cabinet', era: 'release' });
assert(!nowT.includes('ERA:') && thenT.includes('ERA: set this scene in the real world around her release — ' + S.ERA_PERIOD[g.era] + '.'), '출시 당시 — 시대');
assert(P.buildCasual({ game: fetched, styleText: text, cat: 'arcade_culture', ex: 'arc_cabinet', era: 'release' }).includes('around 1984'), '출시 당시 — 받은 연도');
assert(thenT.indexOf('ERA:') > thenT.indexOf('WARDROBE:') && thenT.indexOf('ERA:') < thenT.indexOf('SCENE (chosen)'), '시대 줄은 옷 줄 뒤, 장면 앞');
assert(!P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, era: 'release' }).includes('ERA:'), '폼 초상에는 없다');
for (const [cat, rows] of Object.entries(S.EXAMPLE_MAP)) for (const r of rows) if (r[0] && r[0] !== '__custom__') {
  assert(r[5] || S.EXAMPLE_DETAIL[r[0]], cat + ' · ' + r[0] + ' 장면 문장이 없다');
  assert(P.words(cas(cat, r[0])) <= 800, cat + ' · ' + r[0] + ' 일상컷이 800 낱말을 넘는다');
}
assert(!/Pok[eé]mon|포켓몬|Gundam|건담/.test(JSON.stringify(S)), '표에 포켓몬·건담 말이 남았다');

/* 6. 화풍 블록은 앞, 점검 줄은 맨 끝, 참고 그림은 그리는 방식만 */
const full = { game: g, stage: '타이틀', styleText: text, styleCasual: cur.casual, styleCheck: cur.check, styleRef: true, params: [] };
for (const [name, t] of [['새 인물', P.buildPrompt({ ...full, outputMode: 'form' })], ['이어가기', P.buildPrompt({ ...full, outputMode: 'form', identityMode: 'reference', baseStage: '타이틀' })],
  ['개방', P.buildPrompt({ ...full, outputMode: 'open' })], ['일상', P.buildCasual({ ...full, cat: 'game_place', ex: 'gp_walk' })]]) {
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
for (const t of [P.buildPrompt({ ...full, styleRef: false, outputMode: 'form', identityMode: 'reference', baseStage: '타이틀' }), P.buildPrompt({ ...full, outputMode: 'open' }), P.buildCasual({ ...full, cat: 'game_place', ex: 'gp_walk' })])
  assert(t.includes(S.AGE_KEEP) && !t.includes(S.AGE_LINES['20s']), '첨부 그림이 정하는 갈래는 나이를 지킨다');
const pf = P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, exposure: 'bold' }).split('\n\n');
const pi = pf.indexOf(T.presentation);
assert(pi > 0 && pf[pi - 1].startsWith('EXPOSURE') && pf[pi + 1].startsWith('STANCE') && pf[pi + 2].startsWith('OUTPUT:'), '노출 → 연출 → 자세 → 출력');
for (const gm of G) for (const stage of STAGES) {
  const t = P.buildPrompt({ outputMode: 'form', game: gm, stage, styleText: text });
  assert(t.includes('STANCE (this form): "' + q(gm.forms[stage].pose) + '"') && t.includes(T.handsPose) && !t.includes(T.handsDefault), gm.key + ' ' + stage + ' 폼 자세');
  assert(t.includes('HOLD BACK:') && Object.values(gm.opens).every(o => t.includes(q(o.scene))), gm.key + ' 개방 명장면은 폼 배경에서 뺀다');
}
assert(!P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, pose: 'standing' }).includes('STANCE'), '자세를 고르면 기본 자세 줄이 빠진다');
assert(!S.ACTION_CONTROLS.some(c => c.key === 'equipment'), '무장 고르기가 없다');
assert(P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: text, params: [['hair color', '#1b2a6b']] }).includes('hair color: #1B2A6B (dark blue)'), '머리 RGB');
const sc = G.find(x => x.key === 'starcraft');
assert(/FACE \([^\n]*broad Korean ancestry/.test(P.buildPrompt({ outputMode: 'form', game: sc, stage: '타이틀', styleText: text })), '설계표 계통');
assert(!P.buildPrompt({ outputMode: 'form', game: sc, stage: '타이틀', styleText: text, params: [['facial ethnicity', 'Nordic']] }).includes('Korean ancestry'), '고른 계통이 이긴다');
assert.throws(() => P.buildPrompt({ outputMode: 'form', game: g, stage: '타이틀', styleText: '' }), /Style text/);
assert.throws(() => P.buildPrompt({ outputMode: 'form', stage: '타이틀', styleText: text }), /Game is required/);

console.log(`PASS 게임 프롬프트: ${G.length}편 × 폼 3 × (새 인물·이어가기·개방) ${n}개 · 가장 긴 것 ${longest}낱말 · 정한 말 영어 · 캐릭터 아님·그리지 않을 것 · 핵심 조작·시대 · 사실은 받은 것만 · `
  + `게임 갈래 넷(장소·화면 줄)·책 갈래 없음 · 출시 당시 · 일상컷 화풍 문장 · 화풍 앞·점검 끝 · 노출·나이·자세`);
