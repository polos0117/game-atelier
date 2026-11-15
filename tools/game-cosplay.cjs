#!/usr/bin/env node
/* 게임 코스프레 목록(data/game-cosplay.json, 2026-11-15) — 원본은 이 저장소. 세 공방(pkm · 원소 · 삼국지)의 data/game-cosplay.json 은 같은 사본.
   node tools/game-cosplay.cjs check   목록 꼴(게임 열쇠가 설계표에 있다 · many 면 roster · 아니면 character · outfit · 재단 열하나)
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
  }
  for (const k of ['fixed', 'pick', 'again', 'none', 'assigned']) if (!(d.text || {})[k]) bad.push('글 ' + k);
  if (bad.length) { console.log(bad.join('\n')); process.exit(1); }
  console.log('PASS 게임 코스프레 목록: 게임 ' + d.games.length + '(등장인물 많음 ' + d.games.filter(g => g.many).length + ') · 재단 ' + d.cuts.length);
}
function sync() {
  const t = fs.readFileSync(SRC, 'utf8');
  for (const s of SIB) { const dir = path.join(ROOT, '..', s, 'data'); if (!fs.existsSync(dir)) { console.log('없음 ' + s); continue; } fs.writeFileSync(path.join(dir, 'game-cosplay.json'), t); console.log('→ ' + s + '/data/game-cosplay.json'); }
}
({ check, sync }[process.argv[2] || 'check'] || check)();
