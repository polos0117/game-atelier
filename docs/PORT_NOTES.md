# 어디서 무엇을 가져왔나 (2026-10-26)

게임의 공방은 book-atelier 를 바탕으로 한다 — 한 사람이 폼 셋 + 폼별 개방 셋을 갈아 입는 꼴이
게임(타이틀·중반·엔딩 + 명장면)과 같기 때문이다. 처음에는 뼈대만 가져왔고, 나머지는 `docs/GAME_CONCEPT.md` 8절 차례로 붙인다.

## 가져온 것

| 파일 | 무엇 | 바꾼 것 |
|---|---|---|
| `lib/workspace.css` | 테마 여덟·화면 밀도·껍데기(한 자리만 구른다) | 그대로 |
| `lib/workspace-theme.js` | 테마·배경 고르기 | 열쇠를 `game_room_v1`·`game_background_v1` 로. book 의 옛 열쇠 옮기기는 뺐다 |
| `lib/workspace-ui.js` | 머리·항해·⚙ 설정·머리 접기·테마 고르개 | 문양을 게임 모양(오락기·모니터·휴대용 게임기 …)으로, 접기 열쇠 `game_header_fold`, `PAGES=['index']` |
| `lib/room.css` | 공간 풍경 | 배경 그림 주소를 `none` 으로 — 게임 공방의 풍경 그림은 아직 없다 |
| `lib/words.js` · `tests/words.cjs` | 낱말 표 — 화면에 말을 박지 않는다 | 게임 낱말. 검사가 옛 상표도 막는다 |
| `lib/fresh.js` | 새 판 살피기(띠·조용한 다시 받기) | 그대로 |
| `lib/patch.js` · `tests/patch.cjs` · 첫 화면의 패치 기록 | `docs/PATCH.md` 를 그대로 읽는다 | 그대로 |
| `lib/favorites.js` | 즐겨찾기 공용 모듈 | 글자 하나 다르지 않게(공방 모음 원본) |
| `tools/game-design.py` · `tests/game-design.py` | 설계표 검사 | book-design.py 에서 — 폼 이름을 타이틀·중반·엔딩으로, 저작권(저자 사망) 대신 권리사·`avoid`, 시리즈 자매 얼굴, 사실 칸 지어내기 막기, 시대·연도 어긋남 경고 |

## 새로 만든 것

- `index.html` · `lib/home.css` — 첫 화면. 서재(책장)를 옮기지 않고, 설계표의 첫 묶음을 한 편에 한 칸으로 보인다.
- `tools/fetch-games.py` · `tests/fetch-games.py` — Wikidata SPARQL 로 사실 칸을 받는 도구.
- `data/game-design.json` — 첫 묶음 10편의 해석 칸.

## 아직 안 가져온 것

- 서가(`dex.html`·`lib/dex-filter.js`·`lib/img.js`)·그림 등록(`tools/register-images.py`·워크플로)·썸네일 — 시범 그림 뒤에.
- 생성기(`prompt.html`·`lib/prompt-*.js`·`lib/figures.js`·`data/style.json`)·`IMAGE_RULES.md` — 다음 차례. era 줄·금지 점검·게임 갈래를 더한다.
- 결투(`duel.html`·`lib/duel.js`)·탐험·모자이크·도트 진열실·움직임(`lib/scene-motion.js`) — 결투 단계에서.
  설계표 `opens[*].particles` 는 book 의 입자 정한 말을 그대로 써서, 움직임을 옮기면 바로 잇는다.
- 브라우저 검사 껍데기(`tests/browser-harness.cjs`) — 화면이 둘 이상 되면.
