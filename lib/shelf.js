/* 진열장(shelf.html)의 셈 — 화면 없이 node 로도 돈다(tests/shelf.cjs). window.AtelierShelf 하나만 붙인다.
   2026-11-02 사용자 「패키지가 진열되어 있는 장이 있고, 각 게임의 캐릭터 이미지가 그려진 시대별로 대응하는 팩이나 cd 등이 들어있는거야.
   온라인 게임은 pc 에 바탕화면이나 폴더에 있고. 그 게임을 선택하고 시작을 누르면 loading 화면이 뜨고, 각 폼별의 이미지를 순차적으로
   보여준 뒤에 엔딩 크레딧으로 일상씬등을 보여지는 구성」 · 「추천대로 진행해주고 3번은 빈 상자 형식으로」.
   - 매체는 설계표의 package(사람이 고른 처음 판의 몸 — 사실 칸의 플랫폼은 이식판까지 섞여 있다). 진열장은 시대별 칸,
     온라인(pc_online)은 PC 바탕화면 아이콘, 내려받는 게임(pc_download)은 바탕화면의 「게임」 폴더.
   - 그림이 없는 게임도 진열한다 — 겉그림 없는 빈 상자(비닐만). 켜지는 않는다.
   - 본편은 폼 셋과 그 개방 셋(타이틀 → 타이틀 개방 → 중반 → … 엔딩 개방), 없는 자리는 건너뛴다.
   - 엔딩 크레딧은 일상컷과 사실 칸(facts — Wikidata 에서 받은 것)만. 지어낸 크레딧은 없다 */
(function (root) {
  'use strict';
  var ERAS = ['arcade', '8bit', '16bit', 'early_3d', 'hd', 'modern'];
  var MEDIA = ['arcade_board', 'cartridge', 'floppy', 'cd_case', 'disc_case', 'pc_online', 'pc_download'];
  var PC = { pc_online: 'online', pc_download: 'download' };
  var FORMS = ['title', 'middle', 'ending'];
  var CREDIT_PLATFORMS = 8;   /* 이식판까지 다 적으면 크레딧이 끝나지 않는다 — 앞 여덟, 나머지는 「외 n종」 */

  function byStyle(entry) { return (entry && entry.byStyle) || {}; }
  /* 화풍 하나 고르기 — 기본 화풍에 폼 그림이 있으면 그것, 없으면 폼 그림이 가장 많은 화풍 */
  function styleOf(entry, preferStyle) {
    var bs = byStyle(entry), best = null, bestN = -1, k;
    if (preferStyle && bs[preferStyle] && count(bs[preferStyle]) > 0) return preferStyle;
    for (k in bs) { var n = count(bs[k]); if (n > bestN) { best = k; bestN = n; } }
    return best;
  }
  function count(bucket) {
    var m = (bucket && bucket.byForm) || {}, n = 0, k;
    for (k in m) if (m[k] && m[k].f) n++;
    return n;
  }
  function formFile(bucket, form) { var m = (bucket && bucket.byForm) || {}; return m[form] && m[form].f || null; }
  function isArr(x) { return Object.prototype.toString.call(x) === '[object Array]'; }

  /* 한 편 — 진열에 필요한 것만 */
  function item(game, entry, preferStyle) {
    var st = styleOf(entry, preferStyle), b = st ? byStyle(entry)[st] : null;
    var cover = formFile(b, 'title'), i;
    for (i = 0; !cover && i < FORMS.length; i++) cover = formFile(b, FORMS[i]);
    return { key: game.key, game: game, media: game.package, era: game.era, style: st, cover: cover, drawn: !!cover };
  }
  /* 진열 — 시대 칸(실물 매체) · PC(온라인 · 내려받기). 칸 안은 받은 발매 연도 차례(없으면 설계표 차례), 같은 해는 이름 차례 */
  function build(design, imgDoc, preferStyle) {
    var imgs = (imgDoc && imgDoc.img) || {}, shelves = [], pc = { online: [], download: [] }, rows = {}, i;
    for (i = 0; i < ERAS.length; i++) rows[ERAS[i]] = [];
    var games = (design && design.games) || [];
    for (i = 0; i < games.length; i++) {
      var g = games[i], it = item(g, imgs[g.key], preferStyle);
      it.order = i;
      if (PC[g.package]) pc[PC[g.package]].push(it);
      else if (rows[g.era]) rows[g.era].push(it);
    }
    var byYear = function (a, b) {
      var ya = a.game.facts && a.game.facts.year, yb = b.game.facts && b.game.facts.year;
      if (ya && yb && ya !== yb) return ya - yb;
      if (!ya !== !yb) return ya ? -1 : 1;
      return a.order - b.order;
    };
    for (i = 0; i < ERAS.length; i++) if (rows[ERAS[i]].length) shelves.push({ era: ERAS[i], items: rows[ERAS[i]].sort(byYear) });
    pc.online.sort(byYear); pc.download.sort(byYear);
    return { shelves: shelves, pc: pc };
  }
  /* 본편 — 폼 셋과 그 개방, 있는 것만 */
  function slides(entry, style) {
    var b = byStyle(entry)[style], out = [], i, f;
    for (i = 0; i < FORMS.length; i++) {
      f = formFile(b, FORMS[i]); if (f) out.push({ form: FORMS[i], open: false, file: f });
      f = formFile(b, FORMS[i] + '_open'); if (f) out.push({ form: FORMS[i], open: true, file: f });
    }
    return out;
  }
  /* 엔딩 크레딧의 그림 — 그 화풍의 일상컷 전부(번호 차례) */
  function casuals(entry, style) {
    var b = byStyle(entry)[style], c = b && b.casual && b.casual.f;
    return isArr(c) ? c.slice() : (c ? [c] : []);
  }
  /* 크레딧 줄 — 사실 칸만. 이름은 한국어 이름표 → 영어 → QID 차례 */
  function name(x) { return x && (x.ko || x.en || x.qid) || ''; }
  function names(list) { var out = [], i; for (i = 0; i < (list || []).length; i++) { var n = name(list[i]); if (n && out.indexOf(n) < 0) out.push(n); } return out; }
  function credits(game) {
    var f = (game && game.facts) || {}, out = [], pl = names(f.platforms);
    if (!f.fetched) return out;
    if (names(f.developer).length) out.push({ role: 'developer', names: names(f.developer) });
    if (names(f.publisher).length) out.push({ role: 'publisher', names: names(f.publisher) });
    if (f.year) out.push({ role: 'released', names: [String(f.year)] });
    if (pl.length) out.push({ role: 'platforms', names: pl.slice(0, CREDIT_PLATFORMS), more: Math.max(0, pl.length - CREDIT_PLATFORMS) });
    if (f.series) out.push({ role: 'series', names: [name(f.series)] });
    if (names(f.genres).length) out.push({ role: 'genres', names: names(f.genres) });
    return out;
  }
  /* 로딩 화면의 꼴 — PC 게임은 실행기, 나머지는 매체 */
  function loading(game) {
    if (!game) return 'cartridge';
    if (game.package === 'pc_online') return 'launcher';
    if (game.package === 'pc_download') return 'download';
    return game.package;
  }

  root.AtelierShelf = { ERAS: ERAS, MEDIA: MEDIA, FORMS: FORMS, CREDIT_PLATFORMS: CREDIT_PLATFORMS,
    styleOf: styleOf, item: item, build: build, slides: slides, casuals: casuals, credits: credits, loading: loading };
})(typeof window !== 'undefined' ? window : globalThis);
