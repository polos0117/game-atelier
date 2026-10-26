/* 낱말 표 — 화면에 뜨는 말은 전부 여기 한 곳에서 온다.

   book-atelier 의 같은 파일에서 왔다(그쪽은 pkm-atelier 에서). 앞선 저장소(atelier)는 주제를 갈아 끼우자
   "모함 건업", "기동전사 드래프트" 가 떴다 — 화면 190 자리에 말이 박혀 있었다.
   그래서 화면은 W('kind.unit') 로 부르고, 말은 이 파일에만 적는다(tests/words.cjs 가 막는다).

   쓰는 법
     W('kind.unit')                 → '유닛'
     W('kind.unit', {n: 3})         → 자리표시자가 있으면 채워 넣는다
     W('없는.열쇠')                  → 열쇠를 그대로 돌려주고 콘솔에 적는다  */
(function (root) {
  'use strict';

  var WORDS = {
    /* 머리 */
    'app.title': '게임의 공방',
    'app.subtitle': '게임 한 편이 한 사람이 되고, 그 게임의 조작이 그녀의 능력이 된다.',

    'nav.index': '첫 화면',

    /* 첫 화면 */
    'home.title': '게임이 사람이 되어 싸운다.',
    'home.intro': '팩맨·테트리스·드래곤 퀘스트·스타크래프트·다크 소울. 게임 한 편이 한 사람이 된다 — 게임 속 주인공이 아니라 그 게임 자체다. 장르와 시대가 겉모습이 되고, 핵심 조작이 결투의 능력이 된다.',
    'home.tag': '비상업 팬작업 · 게임 속 캐릭터·로고는 그리지 않는다',
    'home.first': '첫 묶음',
    'home.first.note': '설계표(data/game-design.json)에 적힌 {n}편. 그림과 서가는 차례로 붙는다.',
    'home.first.loading': '설계표를 읽는 중',
    'home.first.fail': '설계표를 읽지 못했다 — data/game-design.json',
    'home.first.mechanic': '능력',
    'home.group.reflex': '반사',
    'home.group.growth': '성장',
    'home.group.mind': '두뇌',
    'home.group.explore': '탐험',
    'home.themes': '공방의 풍경',

    /* 패치 기록 */
    'home.patch': '패치 기록',
    'home.patch.open': '패치 기록 보기',
    'home.patch.close': '닫기',
    'home.patch.note': '두 세션이 무엇을 왜 고쳤나. 새 것이 위.',
    'home.patch.loading': '읽는 중',
    'home.patch.fail': '패치 기록을 읽지 못했다 — docs/PATCH.md',
    'home.patch.none': '아직 적힌 것이 없다',

    /* 설정 */
    'ui.settings': '설정 — 공간·배경·화면 밀도',
    'ui.theme': '공간',
    'ui.background': '배경',
    'ui.background.on': '공간 풍경',
    'ui.background.off': '단색 바탕',
    'ui.background.show': '공간 풍경 보기',
    'ui.background.hide': '단색 바탕으로 보기',
    'ui.density': '화면 밀도',
    'ui.density.compact': '촘촘하게',
    'ui.density.relaxed': '여유롭게',
    'ui.header.fold': '머리 접기 — 제목을 숨긴다',
    'ui.header.unfold': '머리 펼치기',
    'ui.header.fold.short': '머리 접기',

    /* 공간 — 열쇠는 book-atelier 와 같고(lib/workspace.css 의 색), 이름만 게임 공방의 것이다 */
    'theme.sunlit': '한낮의 오락실',
    'theme.moonlit': '심야 게임방',
    'theme.hanok': '골목 문방구',
    'theme.forest': '별장 거실',
    'theme.note.sunlit': '창으로 드는 햇살 아래 줄지어 선 오락기. 동전 소리와 함께 한 판이 시작되는 곳입니다.',
    'theme.note.moonlit': '모니터 불빛과 키보드 소리만 남은 밤의 게임방. 마지막 한 판을 천천히 즐깁니다.',
    'theme.note.hanok': '문방구 앞 작은 오락기와 뽑기 기계. 학교가 끝난 오후의 놀이터입니다.',
    'theme.note.forest': '창밖으로 숲이 보이는 거실, 소파와 휴대용 게임기. 느긋한 주말의 한 판입니다.',

    /* 그림 */
    'art.count': '{n}장',

    /* 새 판 알림 */
    'fresh.notice': '새 판이 나왔습니다. 하던 것을 마치고 눌러 주세요.',
    'fresh.reload': '갈아타기',
    'fresh.close': '닫기',
    'fresh.stamp': '판'
  };

  var missing = {};
  function W(key, vars) {
    var s = WORDS[key];
    if (s === undefined) {
      /* 조용히 빈칸으로 두면 화면에서만 티가 나고 원인을 못 찾는다 */
      if (!missing[key]) { missing[key] = 1; console.warn('낱말 표에 없는 열쇠: ' + key); }
      return key;
    }
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      return vars[k] === undefined ? m : String(vars[k]);
    });
  }

  /* 표를 통째로 갈아 끼울 때 쓴다 */
  function load(table) { for (var k in table) WORDS[k] = table[k]; }

  root.AtelierWords = { W: W, load: load, table: WORDS,
    missing: function () { return Object.keys(missing); } };
  root.W = W;   /* 화면에서 짧게 부르라고 */
})(window);
