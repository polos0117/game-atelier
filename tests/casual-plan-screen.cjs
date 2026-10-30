/* 묶음 계획기의 기록 = 생성기 화면 — 계획기가 쓴 기록의 저장 상태를 화면에 넣으면 화면이 같은 지시문을 만든다.
   node tests/casual-plan-screen.cjs (BASE_URL 이 있으면 그 서버, 없으면 tests/browser-harness.cjs 가 띄운다) */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const { start, FOLD } = require('./browser-harness.cjs');
const C = require('../tools/casual-plan.cjs');
const design = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/game-design.json'), 'utf8'));
(async () => {
  const h = await start();
  try {
    let n = 0;
    for (const key of ['street_fighter_2', 'legend_of_zelda', 'world_of_warcraft']) {
      const g = design.games.find(x => x.key === key);
      for (const cut of C.plan(g, [1, 2, 3, 4, 5], [], { seed: 21 }).cuts.slice(0, 3)) {
        const rec = C.record(g, cut);
        const { page: p } = await h.open('index.html', { viewport: FOLD.inner, mobile: true });
        await p.evaluate(s => localStorage.setItem('game_prompt_v1', JSON.stringify(s)), rec.storage);
        await p.goto(p.url().replace(/index\.html.*$/, 'prompt.html?game=' + key + '&mode=casual'));
        await p.waitForSelector('#casual-tree');
        const shown = await p.$eval('#prompt-output', e => e.value);
        assert.equal(shown, rec.prompt, key + ' casual' + cut.n + ' 화면과 계획기 지시문이 다르다');
        assert.equal(await p.$eval('#place', e => e.value), cut.place, '장소 칸');
        assert.match(await p.$eval('#file-name code', e => e.textContent), new RegExp('casual' + cut.n + '\\.webp'));
        await p.close(); n++;
      }
    }
    /* 버전2(--v2) 기록 — 화면이 버전2 칸으로 열고 같은 지시문 */
    let n2 = 0;
    for (const key of ['hearthstone', 'dave_the_diver', 'street_fighter_2']) {
      const g = design.games.find(x => x.key === key);
      for (const cut of C.plan2(g, [1, 2, 3, 4, 5], [], { seed: 21 }).cuts.slice(0, 3)) {
        const rec = C.record(g, cut);
        const { page: p } = await h.open('index.html', { viewport: FOLD.inner, mobile: true });
        await p.evaluate(s => localStorage.setItem('game_prompt_v1', JSON.stringify(s)), rec.storage);
        await p.goto(p.url().replace(/index\.html.*$/, 'prompt.html?game=' + key + '&mode=casual'));
        await p.waitForSelector('#casual-tree-v2');
        assert.equal(await p.$eval('#prompt-output', e => e.value), rec.prompt, key + ' casual' + cut.n + ' 버전2 화면과 계획기 지시문이 다르다');
        for (const [id, k] of [['place', 'place'], ['posture', 'posture'], ['frame', 'frame'], ['hand-right', 'right'], ['hand-left', 'left'], ['preset', 'preset']])
          assert.equal(await p.$eval('#' + id, e => e.value), cut[k] || '', key + ' ' + id + ' 칸');
        await p.close(); n2++;
      }
    }
    console.log(`PASS 묶음 계획기 ↔ 생성기 화면: 기록 ${n}개(버전1) · ${n2}개(버전2)를 화면에 넣으면 같은 지시문·같은 칸·같은 파일 이름`);
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
