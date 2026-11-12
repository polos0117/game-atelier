/* 지시문 묶음 = 생성기 화면 — tools/prompt-pack.cjs 가 쓴 기록의 저장 상태를 화면에 넣으면 화면이 같은 지시문 · 같은 파일 이름을 만든다.
   한 게임(hearthstone — 외형 · 장면 · 노출을 고친 자리와 손대지 않은 자리가 섞였다)의 폼 · 개방 여섯 자리와 일상 다섯 자리(계획기 --v2 계획).
   일상 자리는 화면의 버전2 칸(장소 · 자세 · 프레이밍 · 손 · 자세 추천)도 계획대로인지 본다 — 계획기 버전2 기록 = 화면은 여기 한 곳(2026-11-12, 두 게임이던 것과 casual-plan-screen 의 버전2 부분을 줄였다).
   node tests/prompt-pack-screen.cjs (BASE_URL 이 있으면 그 서버, 없으면 tests/browser-harness.cjs 가 띄운다) */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { start, FOLD } = require('./browser-harness.cjs');
const C = require('../tools/casual-plan.cjs'), K = require('../tools/prompt-pack.cjs');
const design = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/game-design.json'), 'utf8'));
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-pack-'));
  const h = await start();
  try {
    let n = 0;
    for (const [key, edit] of [['hearthstone', set => {
      set.card.params = { 'hair color': 'silver', 'eye color': '#3a7bd5' }; set.card.motifs = 'card-back filigree on the cuffs'; set.card.why = '검사 — 직접 입력';
      const [a, b] = Object.keys(set.slots); set.slots[a].scene = { expr: 'soft_smile', frame: 'waist_up' }; set.slots[b].scene = { custom: 'warm tavern lantern light' }; set.slots[b].why = '검사';
      set.slots.casual2.custom = 'Her right hand holds one card; her left hand rests on the table.'; set.slots.casual2.why = '검사'; set.slots.casual3.exposure = 'moderate'; set.slots.casual3.why = '필터 거절 뒤 노출 낮추기 검사'; set.slots[a].exposure = 'low'; set.slots[a].why = '필터 거절 뒤 노출 낮추기 검사';
    }]]) {
      const g = design.games.find(x => x.key === key), dir = path.join(tmp, key);
      fs.mkdirSync(dir);
      const res = C.plan2(g, [1, 2, 3, 4, 5], [], { seed: 21 });
      fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify({ game: key, seed: 21, tree: 2, required: res.required, slots: [1, 2, 3, 4, 5], cuts: res.cuts }));
      const set = K.initSettings(g, path.join(dir, 'plan.json'));
      if (edit) edit(set);
      fs.writeFileSync(path.join(dir, 'settings.json'), JSON.stringify(set));
      const log = console.log; console.log = () => {};
      try { assert.equal(K.build(dir), 0, key + ' build'); } finally { console.log = log; }
      const { list } = K.slots(g, res);
      assert.equal(list.length, 11, '열한 자리');
      for (const s of list) {
        const rec = JSON.parse(fs.readFileSync(path.join(dir, s.slot + '-ui.json'), 'utf8'));
        assert.equal(fs.readFileSync(path.join(dir, s.slot + '-prompt.txt'), 'utf8'), rec.prompt);
        /* 폼 · 개방은 칸 꼴(data/style.json sections, 2026-11-11), 일상은 옛 줄 꼴 그대로 */
        assert.equal(/^Input: [^\n]+\nOutput: [\s\S]+\n\n1\. STYLE\n[\s\S]+\n\n5\. CONSTRAINTS\n[\s\S]+\nAvoid: [^\n]+\.$/.test(rec.prompt), s.mode !== 'casual', key + ' ' + s.slot + ' 칸 꼴은 폼 · 개방만');
        if (edit && s.slot === 'casual3') assert(/skin_exposure: moderate/.test(rec.prompt) && !/skin_exposure: bold/.test(rec.prompt), '일상 노출 낮추기가 지시문에');
        const { page: p } = await h.open('index.html', { viewport: FOLD.inner, mobile: true });
        await p.evaluate(st => localStorage.setItem('game_prompt_v1', JSON.stringify(st)), rec.storage);
        await p.goto(p.url().replace(/index\.html.*$/, 'prompt.html?game=' + key + '&mode=' + s.mode));
        await p.waitForSelector('#prompt-output');
        await p.waitForFunction(() => document.querySelector('#prompt-output').value.length > 0);
        assert.equal(await p.$eval('#prompt-output', e => e.value), rec.prompt, key + ' ' + s.slot + ' 화면과 묶음 지시문이 다르다');
        assert.equal(await p.$eval('#file-name code', e => e.textContent.trim()), rec.file, key + ' ' + s.slot + ' 파일 이름');
        if (s.mode === 'casual') {
          const cut = res.cuts.find(c => 'casual' + c.n === s.slot);
          for (const [id, k] of [['place', 'place'], ['posture', 'posture'], ['frame', 'frame'], ['hand-right', 'right'], ['hand-left', 'left'], ['preset', 'preset']])
            assert.equal(await p.$eval('#' + id, e => e.value), cut[k] || '', key + ' ' + s.slot + ' ' + id + ' 칸');
        }
        await p.close(); n++;
      }
    }
    /* 틀린 칸은 아무것도 안 쓴다 */
    const g = design.games.find(x => x.key === 'langrisser_2'), bad = path.join(tmp, 'bad');
    fs.mkdirSync(bad);
    const set = K.initSettings(g, '');
    set.card.params = { 'hair color': 'not-a-value' }; set.slots.title.scene = { frame: 'nope' }; set.slots.middle.scene = { custom: 'x' }; set.slots.ending.extra = 1; set.slots.title.exposure = 'low'; set.slots.ending.exposure = 'bold';
    fs.writeFileSync(path.join(bad, 'settings.json'), JSON.stringify(set));
    const err = console.error; const said = []; console.error = m => said.push(m);
    try { assert.equal(K.build(bad), 1); } finally { console.error = err; }
    assert(!fs.existsSync(path.join(bad, 'title-prompt.txt')), '틀리면 쓰지 않는다');
    for (const re of [/card 에 직접 입력/, /scene\.frame 의 값 nope/, /slots\.middle 에 직접 입력/, /slots\.ending 에 없는 칸 extra/, /slots\.title\.exposure 를 낮췄는데 why/, /slots\.ending\.exposure 는 moderate · low/]) assert(said.some(m => re.test(m)), re + ' 를 알린다');
    console.log(`PASS 지시문 묶음 ↔ 생성기 화면: ${n} 자리(폼 · 개방 · 일상 버전2 칸 · 고친 설정)를 화면에 넣으면 같은 지시문 · 같은 파일 이름 · 틀린 설정은 안 쓴다`);
  } finally { await h.stop(); fs.rmSync(tmp, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exit(1); });
