#!/usr/bin/env node
/* 게임 코스프레 목록(data/game-cosplay.json, 2026-11-15) — 원본은 이 저장소. 세 공방(pkm · 원소 · 삼국지)의 data/game-cosplay.json 은 같은 사본.
   node tools/game-cosplay.cjs check   목록 꼴(게임 열쇠가 설계표에 있다 · many 면 roster · 아니면 character · outfit · 한글 이름(ko · character_ko))
   node tools/game-cosplay.cjs sync    옆 저장소 셋(../pkm-atelier · ../element-atelier · ../sam-atelier)에 그대로 쓴다(커밋은 그 저장소에서) */
'use strict';
const fs = require('node:fs'), path = require('node:path'), ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'data/game-cosplay.json'), SIB = ['pkm-atelier', 'element-atelier', 'sam-atelier'];
function check() {
  const d = JSON.parse(fs.readFileSync(SRC, 'utf8')), G = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/game-design.json'), 'utf8'));
  const keys = new Set((G.games || G.cards).map(g => g.key)), bad = [];
  if ((d.cuts || []).length !== 11) bad.push('재단은 열하나');
  for (const c of d.cuts || []) if (!c.key || !c.ko || !/^cut as /.test(c.en || '')) bad.push('재단 ' + c.key);
  for (const g of d.games || []) {
    if (!keys.has(g.key)) bad.push('설계표에 없는 게임 ' + g.key);
    if (!g.en || !g.ko) bad.push(g.key + ' 이름');
    if (g.many ? !(g.roster > 0) : !(g.character && g.outfit)) bad.push(g.key + (g.many ? ' roster' : ' character · outfit'));
    if (g.many && (!Array.isArray(g.characters) || g.characters.length !== g.roster || new Set(g.characters.map(c => c.name)).size !== g.characters.length || g.characters.some(c => !c.name || typeof c.female !== 'boolean'))) bad.push(g.key + ' characters(이름 · female · 겹침 없음 · roster = 수)');
    /* 한글 이름(2026-11-17 사용자 「캐릭터 한글 이름도 채워줘」) — 허브 일상컷 목록 · 세 공방 색인(cosplay.characterKo)이 읽는다. 주인공 하나는 character_ko */
    if (g.many) for (const c of g.characters || []) if (!String(c.ko || '').trim()) bad.push(g.key + ' ' + c.name + ' 한글 이름(ko)');
    if (!g.many && !String(g.character_ko || '').trim()) bad.push(g.key + ' character_ko');
  }
  const cutKeys = new Set((d.cuts || []).map(c => c.key));
  for (const k of ['fixed', 'pick', 'again', 'none', 'assigned']) if (!(d.text || {})[k]) bad.push('글 ' + k);
  /* 설계표의 게임은 목록(games)이나 뺌(excluded — 까닭)에 꼭 있다(2026-11-16 사용자 「게임 자료를 늘리면 … 게임코스튬 갈래도 더 추가되게」).
     새 게임을 설계표에 넣으면 여기서 멈춘다 — 주인공 하나(character · outfit) · 등장인물 많음(characters) · 뺌(까닭) 가운데 하나를 사용자와 정하고 sync */
  const inList = new Set((d.games || []).map(g => g.key)), ex = d.excluded || {};
  for (const k of keys) if (!inList.has(k) && !(k in ex)) bad.push('코스프레를 정하지 않은 새 게임 ' + k + ' — games(주인공 하나 · 등장인물 많음) 나 excluded(까닭) 에 넣는다');
  for (const [k, why] of Object.entries(ex)) {
    if (!keys.has(k)) bad.push('excluded 의 ' + k + ' 는 설계표에 없다');
    if (inList.has(k)) bad.push(k + ' 가 games 와 excluded 에 둘 다');
    if (!String(why || '').trim()) bad.push('excluded.' + k + ' 까닭이 비었다');
  }
  if (bad.length) { console.log(bad.join('\n')); process.exit(1); }
  console.log('PASS 게임 코스프레 목록: 게임 ' + d.games.length + '(등장인물 많음 ' + d.games.filter(g => g.many).length + ') · 뺌 ' + Object.keys(d.excluded || {}).length + ' · 설계표 ' + keys.size + ' 다 정함 · 재단 ' + d.cuts.length);
}
function sync() {
  const t = fs.readFileSync(SRC, 'utf8');
  for (const s of SIB) { const dir = path.join(ROOT, '..', s, 'data'); if (!fs.existsSync(dir)) { console.log('없음 ' + s); continue; } fs.writeFileSync(path.join(dir, 'game-cosplay.json'), t); console.log('→ ' + s + '/data/game-cosplay.json'); }
}
({ check, sync }[process.argv[2] || 'check'] || check)();
