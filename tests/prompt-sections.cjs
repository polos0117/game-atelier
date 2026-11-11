/* 칸 꼴 폼 · 개방 지시문 — data/style.json 의 "sections" 가 켜지면 폼(새 인물 · 이어가기) · 개방을 core 칸 틀(AtelierSpec.CORE_FRAME, 화풍공방 core v4~ —
   삼국지 · 원소와 같은 틀)의 머리말 + 다섯 칸으로 짓는다(사용자 2026-11-11 「초안 없이 다 진행해줘」 — 3단계 칸 꼴 통일).
   글은 옛 꼴 그대로이고 달라지는 것은 아래 네 목록(HEADS · REFS · OVERLAP · 「No …」 → Avoid)뿐이다 — 옛 꼴 지시문을 문장으로 쪼개 하나도 잃지 않았는지 견준다.
   쉰 편 × 폼 셋 × (새 인물 · 이어가기 · 개방) + 고른 칸을 다 얹은 꼴 넷. 일상컷은 칸 꼴이 아니다(그대로).
   Run: node tests/prompt-sections.cjs */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/prompt-game.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const S = ctx.window.AtelierSpec, P = ctx.window.AtelierPrompt, T = S.GAME_LINES, CF = S.CORE_FRAME, SE = S.SECTIONS;
const design = JSON.parse(fs.readFileSync('data/game-design.json', 'utf8')), style = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));
const tree = JSON.parse(fs.readFileSync('data/casual-tree.json', 'utf8')), tree2 = JSON.parse(fs.readFileSync('data/casual-tree-v2.json', 'utf8'));
const gs = style.styles[style.default], cur = gs.versions.find(v => v.v === gs.current);
const G = design.games, STAGES = Object.keys(design.vocab.form_key);

/* 0. 틀 · 스위치 */
assert(CF && CF.s1 && CF.s2 && CF.s3 && CF.s4 && CF.s5 && CF.anatomy && CF.avoid, 'core 칸 틀(CORE_FRAME) — core v4 블록');
assert(SE && SE.costume === 'COSTUME', '칸 꼴 표(SECTIONS)');
assert.equal(style.sections, true, 'data/style.json 꼭대기 "sections": true — 켜는 곳');
assert(P.sectionsOn(style, cur), '기본 화풍 판은 칸 꼴');
assert(!P.sectionsOn({ ...style, sections: false }, cur) && !P.sectionsOn(style, { ...cur, sections: false }) && P.sectionsOn({}, { sections: true }), '꼭대기를 끄면 옛 꼴 · 판에 false 면 그 판만 옛 꼴');
const src = fs.readFileSync('lib/prompt-game.js', 'utf8');
for (const k of ['s1', 's2', 's4', 's5', 'anatomy']) assert(!src.includes(CF[k]), 'lib/prompt-game.js 에 칸 머리 · 해부 줄을 다시 적지 않는다: ' + CF[k]);
assert(!src.includes("'Avoid: ") && !JSON.stringify(SE).includes('Avoid') && !JSON.stringify(SE).includes(CF.anatomy), 'Avoid 줄 · 해부 줄은 CORE_FRAME 에서만');

/* 1. 달라지는 글 — 이 네 목록이 전부다(보고서의 「바뀐 글」 과 같다) */
/* R4 줄 머리 — [옛 머리, 새 머리]. 여기 없는 대문자 머리는 첫 글자만 대문자로(HOLD BACK: → Hold back:, NOT ITS CHARACTERS: → Not its characters: …) */
const HEADS = [
  [/^STYLE: /, ''],                                                        // 1칸 머리가 STYLE 이다
  [/^FACE \(her own structure, not the style's default face\): /, "Face — her own structure, not the style's default face: "],   // 삼국지의 「Face — …:」 꼴
  [/^FORM — [A-Z]+ \([가-힣]+\): /, 'Costume: '],                           // 단계 이름은 3칸 머리 「3. COSTUME — TITLE」 로
  [/^SETTING \(this form\): /, 'Place: '],
  [/^STANCE(?: \(this form\))?: /, 'Pose: '],
  [/^ANATOMY: /, 'Proportions: '],                                         // Anatomy: 머리는 core 해부 줄이 쓴다
  [/^FRAME: /, 'Composition: ']                                            // 개방의 화면 줄
];
/* SILHOUETTE 줄은 세 칸으로 나뉜다 — 몸 · 머리 → 2칸 Body and hair, 복식 구조 · 재료 → 3칸 Silhouette, palette: → 3칸 Colours:, attitude: → 4칸 Attitude: */
const SIL = [[/^palette: /, 'Colours: '], [/^attitude: /, 'Attitude: ']];
/* R6 옛 줄 이름을 가리키던 말 — [옛 말, 칸 꼴 말(자리에 따라 여럿), 어디]. */
const REFS = [
  ['her face follows FACE or her own approved image', ['her face follows the face described below or her own approved image', 'her face follows her own approved image'], '참고 그림 줄(1칸) — 새 인물은 2칸 얼굴이 아래, 이어가기 · 개방은 얼굴 줄이 없다'],
  ['within her FACE structure', ['within her face structure below', 'within her own face structure'], '마감 줄(1칸) — 얼굴 줄이 있으면 아래, 없으면(이어가기 · 얼굴 설계 끔) 제 얼굴'],
  ['Build the background from SETTING;', ['Build the background from the place above;'], '새 인물 OUTPUT 의 배경 문장(4칸 Place 바로 밑)'],
  ['change only her costume and bearing, as FORM says.', ['change only her costume and bearing, as the costume below says.'], '이어가기 OUTPUT 의 「그 사람」 문장(2칸 맨 위)'],
  ['build the costume FORM describes.', ['build the costume described above.'], '이어가기 OUTPUT 의 옷 문장(3칸)'],
  ['from SETTING and STANCE', ['from the place and pose above', 'from the place above and the pose below'], '이어가기 OUTPUT 의 배경 문장(4칸) — 자세를 고르면 자세 줄은 고른 값 묶음(아래)'],
  ['let the cut change as FORM says', ['let the cut change as the costume above says'], 'GARMENT 줄(3칸, Costume 밑)'],
  ['the FORM costume', ['the costume above'], 'EXPOSURE 줄(3칸 끝)'],
  ['what STANCE says', ['what the pose above says'], '손 줄(4칸, Pose 밑)'],
  ['unless FORM names gloves', ['unless the costume above names gloves'], '손 줄(4칸)'],
  ['An object named in FORM or in her pose stays.', ['An object named in the costume above or in her pose stays.'], 'HOLD BACK 줄(5칸)']
];
/* R7 core 해부 줄과 글자 뜻이 겹쳐 뺀 조각 — [옛 마디, 칸 꼴 마디, 해부 줄의 그 조각] */
const OVERLAP = [
  ['Body: a normal human body — one head, two arms and two legs, each joined at its natural joint; elbows', 'Body: a normal human body — elbows', 'one head, two arms and two legs, each joined at its natural joint'],
  ['Hands: natural human hands.', '', 'natural hands']
];
/* R5 — 「No a, b or c.」 문장은 5칸 Avoid 로. 「Added effects: No added VFX: omit …」 은 금지 나열이 아니라 고른 값의 풀이라 제자리(lib/prompt-spec.js ACTION_CONTROLS) */
const NO_KEEP = /^Added effects: No added VFX: /;
/* 없어진 줄 이름(옛 대문자 머리) — 따옴표 밖 어디에도 남지 않는다 */
const OLD = /\b(?:INPUT|GAME|STYLE REFERENCE|SIGNATURE|SUBJECT|AGE|CORE PLAY|ERA LOOK|SILHOUETTE|FACE|FORM|GEAR|SETTING|HOLD BACK|EXPOSURE|PRESENTATION|STANCE|EXPRESSION|OUTPUT|IDENTITY|ANATOMY|BODY|HANDS|FINAL CHECK|GARMENT|MOTIFS|FRAME|LOOK-BACK|NOT ITS CHARACTERS|NEVER DRAW|ONE FIGURE ONLY|SCENE NOTE|NOTE|STYLE:|SCENE \()/;

const lowHead = s => s.replace(/^[A-Z][A-Z-]*(?: [A-Z][A-Z-]*)*(?=[ :.(])/, h => h[0] + h.slice(1).toLowerCase());
const rehead = s => { for (const [re, to] of HEADS) if (re.test(s)) return s.replace(re, to); return lowHead(s); };
const sentences = s => s.split(/(?<=\.)\s+(?=[A-Z])/);
const unquote = t => t.replace(/"[^"]*"/g, '""').replace(/«[^»]*»/g, '«»');
const avoidOf = t => { const l = t.split('\n').find(x => x.startsWith('Avoid: ')); return l ? l.slice(7).replace(/\.$/, '').split(', ') : []; };

/* 잃은 지시가 없다 — 옛 꼴을 줄 → 문장으로 쪼개, 위 목록대로만 고쳐서 칸 꼴에 그대로 있는지 */
function lost(oldText, neu, id) {
  const av = avoidOf(neu);
  for (const line of oldText.split('\n').filter(Boolean)) {
    if (/^SILHOUETTE: /.test(line)) {
      for (let item of line.replace(/^SILHOUETTE: /, '').replace(/\.$/, '').split('; ')) {
        for (const [re, to] of SIL) item = item.replace(re, to);
        assert(neu.includes(item), id + ' — 실루엣 마디가 없다: ' + item);
      }
      continue;
    }
    sentences(line).forEach((sen, i) => {
      let f = i ? sen : rehead(sen);
      if (/^No /.test(f)) {   // R5
        for (const x of f.replace(/^No\s+/, '').replace(/\.$/, '').split(/,\s*(?:no\s+)?|\s+or\s+(?:no\s+)?/)) assert(av.includes(x), id + ' — Avoid 에 없다: ' + x);
        return;
      }
      const o = OVERLAP.find(x => f.startsWith(x[0]));
      if (o) { assert(CF.anatomy.includes(o[2]) && neu.includes(CF.anatomy), id + ' — 겹친 조각은 해부 줄에'); if (!o[1]) return; f = o[1] + f.slice(o[0].length); }
      const r = REFS.filter(x => f.includes(x[0]));
      if (r.length) {
        assert.equal(r.length, 1, id + ' — 한 문장에 가리키는 말 하나: ' + f);
        assert(r[0][1].some(to => neu.includes(f.replace(r[0][0], to))), id + ' — 가리키는 말을 고친 문장이 없다: ' + f);
        return;
      }
      assert(neu.includes(f), id + ' — 잃은 문장: ' + f);
    });
  }
}

/* 칸 꼴 한 장의 모양 */
function shape(t, id, stage) {
  const B = t.split('\n\n'), lines = t.split('\n'), info = S.STAGE_EN[stage];
  assert.equal(B.length, 6, id + ' 머리말 + 다섯 칸');
  assert.deepEqual(B.slice(1).map(b => b.split('\n')[0]), [CF.s1, CF.s2, CF.s3.replace('{costume}', SE.costume).replace('{genre}', info.name.toUpperCase()), CF.s4, CF.s5], id + ' 칸 머리 = CORE_FRAME, 차례');
  for (const b of B) assert(b.split('\n').length >= 2 && b.split('\n').every(l => l.trim() === l && l), id + ' 빈 칸 · 빈 줄 없음');
  assert(/^Input: /.test(B[0]) && /^Output: /m.test(B[0]) && /^Game: «/m.test(B[0]) && B[0].endsWith(T.notes), id + ' 머리말 — 입력 · 출력 · 게임 · 따옴표 읽는 법');
  assert(B[2].endsWith('\n' + CF.anatomy), id + ' 2칸은 해부 줄로 끝난다');
  assert.equal(lines.filter(l => l === CF.anatomy).length, 1, id + ' 해부 줄 한 번');
  assert(lines.filter(l => /^Light: /.test(l)).length <= 1, id + ' 빛 줄 하나 이하');
  assert(lines.filter(l => /^Avoid: /.test(l)).length === 1 && /^Avoid: [^\n]+\.$/.test(lines[lines.length - 1]), id + ' Avoid 는 5칸 맨 끝 한 줄');
  assert.equal(new Set(avoidOf(t)).size, avoidOf(t).length, id + ' Avoid 낱말은 한 번씩');
  assert(!lines.some(l => !/^Avoid: /.test(l) && !NO_KEEP.test(l) && /(?:^|[.;:] )No [a-z]/.test(l) && !/unless/.test(l)), id + ' 「No …」 나열 문장은 Avoid 로');
  const bare = unquote(t);
  assert(!OLD.test(bare), id + ' 없어진 줄 이름이 남았다: ' + (bare.match(OLD) || [])[0]);
  assert(bare.split('\n').filter(l => /\b(?:STYLE|SCENE|CHARACTER|COSTUME|CONSTRAINTS)\b/.test(l)).length === 5, id + ' 대문자 칸 이름은 칸 머리 다섯뿐');
  assert(!/\.\./.test(bare) && !/: \./.test(bare) && !/[{}]/.test(bare) && !/undefined|null|NaN/.test(bare) && !/  /.test(bare), id + ' 찌꺼기(.. · 빈 머리 · {…} · undefined · 겹친 빈칸) 없음');
  assert(!/[가-힣]/.test(bare), id + ' 따옴표 밖은 영어');
  const body = lines.filter(Boolean), dup = body.filter((l, i) => body.indexOf(l) !== i);
  assert.equal(dup.length, 0, id + ' 같은 줄이 두 번: ' + dup[0]);
  return B;
}

/* 2. 쉰 편 × 폼 셋 × (새 인물 · 이어가기 · 개방) — 옛 꼴(스위치 끔)과 견준다 */
let n = 0, minW = 1e9, maxW = 0;
const seen = (t, old) => { const w = P.words(t); minW = Math.min(minW, w); maxW = Math.max(maxW, w); assert(w - P.words(old) >= 0 && w - P.words(old) <= 15, '칸 머리 · 해부 줄 · Avoid 머리 말고 늘거나 준 글이 있다(낱말 수): ' + w + ' ↔ ' + P.words(old)); n++; };
const KIND = { create: { outputMode: 'form', identityMode: 'create' }, reference: { outputMode: 'form', identityMode: 'reference', baseStage: STAGES[0] }, open: { outputMode: 'open' } };
const baseOf = (g, stage) => ({ game: g, stage, styleText: cur.text, styleCasual: cur.casual || '', styleCheck: cur.check || '', params: [], exposure: 'bold', faceDesignOn: true, silhouetteOn: true });
const pair = st => { const old = P.buildPrompt({ ...st, sections: false }), neu = P.buildPrompt({ ...st, sections: true }); assert.equal(P.buildPrompt(st), old, '스위치 없이 부르면 옛 꼴'); return [old, neu]; };
for (const g of G) for (const stage of STAGES) {
  const info = S.STAGE_EN[stage], f = g.forms[stage];
  for (const kind of Object.keys(KIND)) {
    const id = g.key + ' ' + stage + ' ' + kind, [old, t] = pair({ ...baseOf(g, stage), ...KIND[kind] }), B = shape(t, id, stage);
    assert(/^INPUT: /.test(old) && old.includes('\n\nSTYLE: ') && !old.includes(CF.s1), id + ' 스위치를 끄면 옛 꼴');
    lost(old, t, id);
    assert(B[1].split('\n')[1] === cur.text, id + ' 1칸 — 화풍 판 문장 그대로');
    assert(/^One figure only\.$/m.test(B[5]) && B[5].includes('\n' + lowHead(T.trademark)) && /^Never draw for this game: "/m.test(B[5]) && /^Final check: /m.test(B[5]), id + ' 5칸 — 한 사람 · 캐릭터 아님 · 그리지 않을 것 · 점검(규칙 줄은 글 그대로)');
    assert(/^Signature \(recognizable, as the game shows them\): "/m.test(B[3]), id + ' 3칸 — 알아볼 거리');
    if (kind === 'open') {
      assert(B[2].split('\n')[1].startsWith('Keep the same character, face, hair, body, costume, pose'), id + ' 2칸 맨 위 — 첨부 그림의 그 사람');
      assert(/^Age: keep her age as in the attached image/m.test(B[2]) && /^Hands: keep both hands as in the attached image\.$/m.test(B[2]), id + ' 2칸 — 나이 · 손은 첨부 그림대로');
      assert(B[4].includes('Change only the environment, lighting and effects into this moment: "' + String(g.opens[stage].scene).replace(/"/g, "'") + '".') && /^Composition: a single full-frame vertical 2:3 illustration/m.test(B[4]), id + ' 4칸 — 명장면 · 화면');
      assert(B[5].includes('NEVER include the original CLOSED image') && !/^Hold back: /m.test(B[5]) && !/^Exposure|^Costume: /m.test(t), id + ' 5칸 — 한 장 규칙 · 개방은 옷 · 노출 줄 없음');
      assert(/^Output: exactly ONE standalone image showing ONLY the OPEN state/m.test(B[0]), id + ' 머리말 — 개방 한 장');
    } else {
      assert(/^Presentation: /m.test(B[1]), id + ' 1칸 — 마감 줄');
      assert(/^Proportions: natural adult proportions, about 7\.5 heads tall/m.test(B[2]) && /^Body: a normal human body — elbows, knees and wrists/m.test(B[2]) && /^Expression \([A-Z]+\): /m.test(B[2]), id + ' 2칸 — 비율 · 몸 · 표정');
      assert(B[3].split('\n')[1] === 'Costume: "' + String(f.look).replace(/"/g, "'") + '".' && /^Battle role: /m.test(B[3]) && /^Stage of play: /m.test(B[3]) && /^Gear in the game's own style: "/m.test(B[3]), id + ' 3칸 — 폼 모습 · 역할 · 단계 · 장비');
      assert(/^Exposure \(bold\): /m.test(B[3]) && B[3].endsWith('keep the costume above, material and palette.'), id + ' 3칸 끝 — 노출(「the costume above」)');
      /* 카메라 · 구도 글은 장면 연출 — 글자 그대로(사용자 결정) */
      assert(B[4].includes('Place: "' + String(f.setting).replace(/"/g, "'") + '" — ' + info.scene + '.') && B[4].includes('Pose: "' + String(f.pose).replace(/"/g, "'") + '" — ' + info.camera + ', easy to read as a card.'), id + ' 4칸 — 장소 · 자세(단계의 빛 · 구도 · 카메라 글 그대로)');
      assert(B[4].endsWith('Composition: ' + T.card) && /^Hands: Her hands do only what the pose above says/m.test(B[4]), id + ' 4칸 — 손 · 카드 구도');
      assert(/^Hold back: /m.test(B[5]) && B[5].includes('An object named in the costume above or in her pose stays.'), id + ' 5칸 — 개방 명장면은 빼 둔다');
      assert.deepEqual(avoidOf(t), ['second character', 'text', 'lettering', 'logo', 'watermark', 'speech bubble', 'frame border', 'game interface', 'score', 'body-part enlargement', 'extra limbs'], id + ' Avoid 목록');
      if (kind === 'create') {
        assert(/^Input: text only/.test(B[0]) && /^Subject: one adult woman who personifies the video game itself\.$/m.test(B[0]), id + ' 머리말 — 새 인물');
        assert(B[2].split('\n')[1] === lowHead(S.AGE_LINES['20s']) && /^Face — her own structure, not the style's default face: /m.test(B[2]) && /^Body and hair: /m.test(B[2]) && /^Persona: "/m.test(B[2]) && /^Core play: "/m.test(B[2]), id + ' 2칸 — 나이 · 얼굴 · 몸과 머리 · 인격 · 핵심 조작');
        assert(/^Silhouette: garment structure: /m.test(B[3]) && /^Colours: /m.test(B[3]) && /^Its symbols become costume motifs/m.test(B[3]) && /^Era look: /m.test(B[3]), id + ' 3칸 — 복식 · 색 · 상징 · 시대 감각');
        assert(B[4].includes('\nBuild the background from the place above; it evokes') && B[1].includes('within her face structure below'), id + ' 자리 말 — 배경 · 얼굴');
      } else {
        assert(/^Input: the attached image is the approved character \(title form\); keep her\.$/m.test(B[0]) && B[0].includes('\nOutput: the ' + info.name.toLowerCase() + ' form of the woman in the attached image, as a new card image.\n'), id + ' 머리말 — 이어가기');
        assert(B[2].split('\n')[1] === 'Keep her face, eye and hair colors, haircut, skin tone, body proportions and palette; change only her costume and bearing, as the costume below says.' && B[2].split('\n')[2] === lowHead(S.AGE_KEEP), id + ' 2칸 맨 위 — 첨부 그림의 그 사람');
        assert(!/^Face — |^Body and hair: |^Persona: |^Silhouette: |^Colours: /m.test(t), id + ' 이어가기는 첨부 그림이 정한다');
        assert(/^Garment: keep her material family \([^)]+\) and palette, but let the cut change as the costume above says/m.test(B[3]) && B[3].includes('\nDo not reuse its outer garment or lining artwork — build the costume described above.'), id + ' 3칸 — 재료만 잇기 · 옷을 다시 쓰지 않기');
        assert(B[4].includes("\nBuild the background, light and camera from the place and pose above — do not reuse the attached image's background, floor, lighting or camera angle.") && B[4].includes('unless the costume above names gloves.') && B[1].includes('within her own face structure'), id + ' 자리 말 — 배경 · 장갑 · 얼굴');
      }
    }
    seen(t, old);
  }
}
const base = n;

/* 3. 고른 칸을 다 얹은 꼴 — 외형 · 모티프 · 메모 · 노출 · 참고 그림 · 고른 장면 값 · 연출 · 기본 자세 */
const cat = S.ACTION_CATEGORIES[0];
const action = { category: cat.key, example: cat.examples[0].key, ...Object.fromEntries(S.ACTION_CONTROLS.map(c => [c.key, c.options[0].key])) };
assert(action.effects === 'none', '효과 없음(No added VFX)을 얹어 본다');
const heavyParams = [['apparent age', '30s'], ['face shape', 'oval'], ['body type', 'curvy'], ['hair color', '#1b2a6b'], ['eye color', 'blue'], ['second eye color', 'green'], ['facial ethnicity', 'Nordic'], ['facial character', 'gentle'], ['hairstyle', 'bob'], ['body measurements (B/W/H)', '90/60/90']];
const chosenScene = { expr: 'soft_smile', pose: S.POSE_OPTIONS.map(r => r[0]).filter(Boolean)[0], orient: S.ORIENTATION_OPTIONS.map(r => r[0]).filter(Boolean)[0], frame: 'waist_up', lens: S.LENS_OPTIONS.map(r => r[0]).filter(Boolean)[0], camera: 'low angle', scene: 'rain on the glass', outfit: 'a short cape', custom: 'warm lantern light', aspect: '3:2' };
for (const g of G) for (const stage of STAGES) {
  const b0 = baseOf(g, stage), who = g.key + ' ' + stage;
  /* 새 인물 + 외형 · 모티프 · 메모 · 노출 보통 · 참고 그림 */
  {
    const [old, t] = pair({ ...b0, ...KIND.create, params: heavyParams, motifs: 'frost runes', lookNote: 'a longer hem', exposure: 'moderate', styleRef: true });
    const B = shape(t, who + ' 새 인물(다 얹음)', stage); lost(old, t, who + ' 새 인물(다 얹음)');
    assert(/^Input: attach only the style reference image/.test(B[0]) && B[1].includes('\nStyle reference: ') && B[1].includes('her face follows the face described below or her own approved image.'), who + ' 참고 그림 줄은 1칸');
    assert(B[2].split('\n')[1] === lowHead(S.AGE_LINES['30s']) && B[2].includes('\nIdentity (chosen details override the automatic look)\nface shape: oval') && B[2].includes('\nhair color: #1B2A6B (dark blue)\n') && B[2].includes('\n' + T.measurement + '\n') && !/apparent age/.test(t), who + ' 2칸 — 고른 외형(나이는 Age 줄)');
    assert(B[2].includes('ethnicity scope: Broad ancestry cue with individual variation; preserve explicit geometry, skin tone and hair.\n') && avoidOf(t).includes('stereotyped features'), who + ' 외형 풀이의 「No …」 문장도 Avoid 로');
    assert(B[3].includes('\nForm note: a longer hem\n') && B[3].includes('\nMotifs (user choice): frost runes.\n') && /^Exposure \(moderate\): the costume above opens at the collarbone/m.test(B[3]), who + ' 3칸 — 메모 · 모티프 · 노출 보통');
    seen(t, old);
  }
  /* 이어가기 + 고른 장면 값 · 연출 · 노출 낮음 · 참고 그림 · 실루엣 끔 */
  {
    const [old, t] = pair({ ...b0, ...KIND.reference, ...chosenScene, action, motifs: 'frost runes', lookNote: 'a longer hem', exposure: 'low', styleRef: true, silhouetteOn: false });
    const B = shape(t, who + ' 이어가기(다 얹음)', stage); lost(old, t, who + ' 이어가기(다 얹음)');
    assert(B[0].split('\n')[0].endsWith('keep her. ' + T.styleRefInput) && B[1].includes('her face follows her own approved image.'), who + ' 참고 그림 — 입력은 머리말, 줄은 1칸');
    assert(!/^Pose: "/m.test(B[4]) && !/^Garment: /m.test(B[3]) && !/^Expression \(/m.test(t) && !/^Hands: Her hands do only/m.test(B[4]), who + ' 고르면 기본 자세 · 폼 표정 · 손 줄이 빠진다');
    const at = B[4].indexOf('\n' + T.sceneRule + '\nAction category: ');
    assert(at > B[4].indexOf('\nComposition: ') && B[4].includes('\nAdded effects: No added VFX: ') && B[4].includes('\nExpression: ') && B[4].includes('\nPose: ') && B[4].includes('\nOutfit and props: a short cape\n') && B[4].endsWith('\nAspect ratio: 3:2'), who + ' 4칸 끝 — 「Chosen settings below」 와 고른 값 묶음(글 · 차례 그대로)');
    assert(B[4].includes('\nBuild the background, light and camera from the place above and the pose below — '), who + ' 자세를 고르면 「the pose below」');
    assert(B[4].includes('\nHands: Her hands keep the same gloves or bare hands as in the attached image, unless the costume above names gloves.\n'), who + ' 손 줄 — 장갑만');
    assert(B[3].includes('\nMotifs to keep: frost runes.\n') && /^Exposure \(low\): a mostly covered version of the costume above; face, neck and hands show\.$/m.test(B[3]), who + ' 3칸 — 모티프 · 노출 낮음');
    seen(t, old);
  }
  /* 개방 + 메모 · 참고 그림 */
  {
    const [old, t] = pair({ ...b0, ...KIND.open, lookNote: 'heavier fog', custom: 'embers in the air', styleRef: true });
    const B = shape(t, who + ' 개방(다 얹음)', stage); lost(old, t, who + ' 개방(다 얹음)');
    assert(B[4].includes('\nScene note: heavier fog\nNote: embers in the air\nComposition: ') && B[1].includes('\nStyle reference: ') && B[0].split('\n')[0].endsWith(T.styleRefInput), who + ' 개방 메모는 4칸');
    seen(t, old);
  }
  /* 새 인물 + 얼굴 · 실루엣 끔 · 노출 자동 · 폼 자세 없음(기본 자세 · 빈손 · 태도) · 점검 없는 판 */
  {
    const bare = { ...g, forms: { ...g.forms, [stage]: { ...g.forms[stage], pose: '', expr: '', setting: '', homage: '' } } };
    const [old, t] = pair({ ...baseOf(bare, stage), ...KIND.create, exposure: '', styleCheck: '', faceDesignOn: false });
    const B = shape(t, who + ' 새 인물(기본 자세)', stage); lost(old, t, who + ' 새 인물(기본 자세)');
    assert(B[4].includes('\nPose: a poised heroic card stance seen from a slightly low camera, held still and easy to read;') && B[4].includes('\nAttitude: ') && B[4].includes('\nHands: Keep both hands empty and relaxed'), who + ' 기본 자세(카메라 글 그대로) · 태도 · 빈손');
    assert(!/^Face — |^Exposure|^Final check: |^Place: |^Gear in|^Expression/m.test(t) && B[1].includes('within her own face structure'), who + ' 끈 칸은 줄이 없다');
    const off = pair({ ...baseOf(g, stage), ...KIND.create, silhouetteOn: false })[1];
    assert(!/^Body and hair: |^Silhouette: |^Colours: /m.test(off), who + ' 실루엣을 끄면 세 줄이 다 빠진다');
    seen(t, old);
  }
}

/* 4. 금지 나열 — 화풍 글의 「No …」 와 화풍 판의 avoid 목록도 Avoid 한 줄로, 겹치는 낱말은 한 번만 */
{
  const g = G[0], st = { ...baseOf(g, STAGES[0]), ...KIND.create, styleText: 'Flat cel art with clean lines. No photo grain, no lens flare or text. Keep it bright.', styleAvoid: ['logo', 'film grain'], sections: true };
  const t = P.buildPrompt(st), B = shape(t, '금지 나열', STAGES[0]);
  assert.equal(B[1].split('\n')[1], 'Flat cel art with clean lines. Keep it bright.', '화풍 글의 「No …」 는 빠지고 나머지는 그대로');
  assert.deepEqual(avoidOf(t), ['photo grain', 'lens flare', 'text', 'second character', 'lettering', 'logo', 'watermark', 'speech bubble', 'frame border', 'game interface', 'score', 'body-part enlargement', 'extra limbs', 'film grain'], 'Avoid — 화풍 글 · 규칙 줄 · 화풍 판 목록, 겹침 없이');
  assert.deepEqual(JSON.parse(JSON.stringify(P.splitNo('A. No x, no y unless z says so. B; no q.'))), { text: 'A. No y unless z says so. B.', avoid: ['x', 'q'] }, '조건 unless 마디는 제자리');
  assert.deepEqual(JSON.parse(JSON.stringify(P.splitNo('tan skin; no implied ethnicity. No stereotyped features.', true))), { text: 'tan skin; no implied ethnicity.', avoid: ['stereotyped features'] }, '문장째만 — 한 지시의 일부인 마디는 그대로');
}

/* 5. 끄는 길 — core 칸 틀이 없으면 켜도 옛 꼴. 일상컷은 켜도 그대로 */
{
  const g = G[0], st = { ...baseOf(g, STAGES[0]), ...KIND.create }, old = P.buildPrompt(st), frame = S.CORE_FRAME;
  delete S.CORE_FRAME;
  try { assert.equal(P.buildPrompt({ ...st, sections: true }), old, 'CORE_FRAME 이 없으면 옛 꼴'); assert(!P.sectionsOn(style, cur)); } finally { S.CORE_FRAME = frame; }
  const cas = { game: g, tree, tree2, treeV: 2, styleText: cur.text, styleCasual: cur.casual, styleCheck: cur.check, era: 'now', place: 'home_living', ofam: 'everyday', posture: 'stand', support: 'none', frame: 'waist_up', right: 'hip', left: 'natural' };
  assert.equal(P.buildCasual({ ...cas, sections: true }), P.buildCasual(cas), '일상컷(버전2)은 칸 꼴이 아니다');
  assert.equal(P.buildCasual({ game: g, tree, styleText: cur.text, sections: true }), P.buildCasual({ game: g, tree, styleText: cur.text }), '일상컷(버전1)도 그대로');
  assert(P.buildCasual({ ...cas, sections: true }).startsWith('INPUT: '), '일상컷은 옛 줄 꼴');
}

/* 6. 지시문 묶음 도구(tools/prompt-pack.cjs)도 같은 스위치를 본다 — 폼 · 개방은 칸 꼴, 화면과 같은 글 */
{
  const K = require('../tools/prompt-pack.cjs'), g = G[0], set = K.initSettings(g, ''), { pilot, list } = K.slots(g, null);
  for (const s of list) {
    const st = K.stateOf(g, set, s, pilot), t = K.promptOf(g, st, s);
    shape(t, '묶음 ' + s.slot, Object.keys(design.vocab.form_key).find(k => design.vocab.form_key[k] === s.form));
  }
  assert.equal(list.length, 6, '폼 셋 · 개방 셋');
}

console.log(`PASS 칸 꼴 폼 · 개방: ${G.length}편 × 폼 ${STAGES.length} × (새 인물 · 이어가기 · 개방) ${base}장 + 다 얹은 꼴 ${n - base}장 = ${n}장 · 칸 머리 = core 칸 틀 · 2칸 끝 해부 줄 · Avoid 맨 끝 · `
  + `옛 줄 이름 없음 · 옛 꼴 문장 잃은 것 없음(머리 ${HEADS.length} · 자리 말 ${REFS.length} · 겹침 ${OVERLAP.length} · No → Avoid) · ${minW}~${maxW}낱말 · 끄면 옛 꼴 · 일상컷 그대로 · 묶음 도구`);
