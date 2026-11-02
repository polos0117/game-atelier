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
  /* 진열장 그림(2026-11-02 「이미지 생성기로 좀 더 실감나게」) — 그림 저장소 backgrounds/shelf-*.webp, 기록 records/backgrounds/shelf-*.json.
     매체 껍데기는 투명 바탕의 앞모습 사진풍 그림이고, 겉그림은 그 흰 라벨 칸(label — 그림에서 잰 왼쪽 · 위 · 너비 · 높이, 백분율)에 얹는다.
     w 는 진열장에서의 너비(px), ar 은 껍데기 그림의 가로/세로. 오락실 미니 기기는 화면이 라벨, 위 간판(marquee)에도 겉그림 띠.
     모니터는 검은 화면 칸(screen)에 바탕화면을 얹는다. 그림을 못 받으면 화면은 CSS 모양 그대로 */
  var ART = 'https://polos0117.github.io/game-atelier-img/backgrounds/';
  var SHELLS = {
    arcade_board: {"file": "shelf-arcade.webp", "w": 62, "ar": 0.531, "label": [16.52, 20.95, 67.09, 27.18], "marquee": [9.46, 3.68, 80.83, 8.3]},
    cartridge: {"file": "shelf-cartridge.webp", "w": 92, "ar": 1.25, "label": [12.13, 20.45, 75.74, 60.16]},
    floppy: {"file": "shelf-floppy.webp", "w": 82, "ar": 0.9714, "label": [9.52, 37.31, 81.19, 58.35]},
    cd_case: {"file": "shelf-cd.webp", "w": 92, "ar": 1.117, "label": [10.48, 2.67, 85.48, 94.43]},
    disc_case: {"file": "shelf-disc.webp", "w": 68, "ar": 0.6643, "label": [2.35, 2.6, 93.39, 95.09]}
  };
  var MONITOR = {"file": "shelf-monitor.webp", "ar": 1.3294, "screen": [4.28, 5.9, 91.43, 66.25]};
  var BACKDROPS = { room: 'shelf-room.webp', back: 'shelf-back.webp', plank: 'shelf-plank.webp' };

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

  root.AtelierShelf = { ERAS: ERAS, MEDIA: MEDIA, FORMS: FORMS, CREDIT_PLATFORMS: CREDIT_PLATFORMS, ART: ART, SHELLS: SHELLS, MONITOR: MONITOR, BACKDROPS: BACKDROPS,
    styleOf: styleOf, item: item, build: build, slides: slides, casuals: casuals, credits: credits, loading: loading };
})(typeof window !== 'undefined' ? window : globalThis);
