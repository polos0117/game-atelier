# 어디서 무엇을 가져왔나 (2026-10-26)

게임의 공방은 book-atelier 를 바탕으로 한다 — 한 사람이 폼 셋 + 폼별 개방 셋을 갈아 입는 꼴이
게임(타이틀·중반·엔딩 + 명장면)과 같기 때문이다. 처음에는 뼈대만 가져왔고, 나머지는 `docs/GAME_CONCEPT.md` 8절 차례로 붙인다.

## 가져온 것

| 파일 | 무엇 | 바꾼 것 |
|---|---|---|
| `lib/workspace.css` | 테마·화면 밀도·껍데기(한 자리만 구른다) | 공간 넷의 색을 게임 공방 것으로(2026-10-26), 묶음 색 `--g-*` |
| `lib/workspace-theme.js` | 테마·배경 고르기 | 열쇠를 `game_room_v1`·`game_background_v1` 로. book 의 옛 열쇠 옮기기는 뺐다 |
| `lib/workspace-ui.js` | 머리·항해·⚙ 설정·머리 접기·테마 고르개 | 문양을 게임 모양(오락기·모니터·휴대용 게임기 …)으로, 접기 열쇠 `game_header_fold`, `PAGES=['index','prompt']` |
| `lib/room.css` | 공간 풍경 | 그림 대신 CSS 무늬(빛 번짐·격자·주사선·차양·나무결). 그림이 생기면 맨 아래 겹에 더한다 |
| `lib/words.js` · `tests/words.cjs` | 낱말 표 — 화면에 말을 박지 않는다 | 게임 낱말. 검사가 옛 상표도 막는다 |
| `lib/fresh.js` | 새 판 살피기(띠·조용한 다시 받기) | 그대로 |
| `lib/patch.js` · `tests/patch.cjs` · 첫 화면의 패치 기록 | `docs/PATCH.md` 를 그대로 읽는다 | 그대로 |
| `lib/favorites.js` | 즐겨찾기 공용 모듈 | 글자 하나 다르지 않게(공방 모음 원본) |
| `tools/game-design.py` · `tests/game-design.py` | 설계표 검사 | book-design.py 에서 — 폼 이름을 타이틀·중반·엔딩으로, 저작권(저자 사망) 대신 권리사·`avoid`, 시리즈 자매 얼굴, 사실 칸 지어내기 막기, 시대·연도 어긋남 경고 |

## 생성기 — book (2026-10-26)

| 파일 | 바꾼 것 |
|---|---|
| `prompt.html` · `lib/prompt-ui.js` | 책 → 게임(`?game=`·`game_prompt_v1`), 설계 칸에 능력·그리지 않을 것, 「원작 시대」 → 「출시 당시」(받은 연도, 없으면 시대), 서가 길 → 첫 화면 길, 게임 한 줄은 Wikidata 에서 받은 연도·개발사만 |
| `lib/prompt-spec.js` | `BOOK_LINES` → `GAME_LINES`: 책 몸(책장·제본)·보호 중인 책·각색 줄을 빼고 캐릭터 아님(trademark)·그리지 않을 것(avoid)·핵심 조작(mechanic)·시대 감각(eraLook)·게임 속 장소·화면(screens)·출시 당시 줄을 더했다. 단계는 타이틀·중반·엔딩, 정한 말은 게임 설계표의 것, 과감 노출의 한복 갈래는 뺐다. 일상컷 갈래에서 책 넷(서고의 일상·이야기 속 장소·무대 각색·낭독회)을 빼고 게임 넷(각 예시 열)을 넣었다. 공용 갈래의 "her book" 문장과 책 말로 옮겼던 연출 예시(책장·팝업북 …)는 게임 말로 |
| `lib/prompt-game.js` | `lib/prompt-book.js` 에서. 일상컷은 판의 `casual` 문장, 새 인물에 CORE PLAY·ERA LOOK, 모든 갈래에 캐릭터 아님 줄 |
| `lib/prompt-random.js` · `lib/figures.js` · `lib/dex-filter.js` · `lib/img.js` · `lib/prompt.css` · `lib/gallery.css` · `lib/landscape.css` | 거의 그대로. `img.js` 의 그림 저장소는 `game-atelier-img`, 진열 열쇠 `game_hall_v1` |
| `data/style.json` | 새로. `glossy_kr_game` v1 — 폼·개방 `text`(myth 문장, 끝만 costume and accessory)·일상컷 `casual`(pkm 일상컷 문장)·점검 |
| `IMAGE_RULES.md` | 게임 몫으로 다시 썼다 — 캐릭터 아님·소품 일반화·원본 PNG 안 올림·올리기 전 묻기, 등록은 아직 손으로 |
| `tests/prompt-game.cjs` · `tests/prompt-screen.cjs` · `tests/browser-harness.cjs` | 책 몫 검사를 빼고 게임 몫을 더했다 |

## 새로 만든 것

- `index.html` · `lib/home.css` — 첫 화면. 서재(책장)를 옮기지 않고, 설계표의 첫 묶음을 한 편에 한 칸으로 보인다.
- `tools/fetch-games.py` · `tests/fetch-games.py` — Wikidata SPARQL 로 사실 칸을 받는 도구.
- `data/game-design.json` — 첫 묶음 10편의 해석 칸.

## 아직 안 가져온 것

- 서가(`dex.html` — `lib/dex-filter.js`·`lib/img.js` 는 생성기와 함께 왔다)·그림 등록(`tools/register-images.py`·워크플로)·썸네일 — 시범 그림 뒤에.
- 결투(`duel.html`·`lib/duel.js`)·탐험·모자이크·도트 진열실·움직임(`lib/scene-motion.js`) — 결투 단계에서.
  설계표 `opens[*].particles` 는 book 의 입자 정한 말을 그대로 써서, 움직임을 옮기면 바로 잇는다.
