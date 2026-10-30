# 작업 지침

**뼈대 · 게임 설계표 · 사실 자료 도구 · 생성기 · 시범 그림 · 도감 · 그림 등록 자동화** 까지 왔다. 지금은 그림 모으기용으로만 운영한다 — 결투는 보류, 게임은 사용자가 좋아하는 것 위주로 더한다(`docs/GAME_CONCEPT.md` 8절).
뼈대는 book-atelier 에서 가져왔다 — 무엇을 어디서 가져왔는지는 `docs/PORT_NOTES.md`.

## 먼저 읽을 것

| 문서 | 무엇 |
|---|---|
| 이 문서 | 규칙과 자리 |
| `docs/GAME_CONCEPT.md` | 기획 — 원칙·데이터·설계표·폼과 개방·결투 상성·첫 묶음·화풍·만드는 순서 |
| `data/game-design.json` | 게임 설계표. 게임 한 편 = 한 칸 |
| `IMAGE_RULES.md` | 그림 만들기·파일 이름·기록·올리기 — 그림 작업 전에 |
| `data/style.json` | 화풍 판 — 폼·개방은 `text`, 일상컷은 `casual` |
| `docs/CASUAL_TREE_V2.md` | 일상컷 트리 버전2 설계 — 시대 → 장소 → 의상 → 구도 → 손(오른손·왼손) → 소품 → 다리, 자세 추천 (만드는 중) |
| `docs/PORT_NOTES.md` | 어디서 무엇을 가져왔고, 무엇을 아직 안 가져왔나 |
| `docs/PATCH.md` | 무엇을 고쳤나 — 고친 쪽이 직접 적는다 (아래 규칙 6) |

## 화면

| 화면 | 파일 | 무엇 |
|---|---|---|
| 첫 화면 | `index.html` · `lib/arcade.js` · `lib/arcade.css` · `lib/home.css` | book 의 서재처럼 — **오락실**: 배경 그림(공간마다 한 장 — 그림 저장소 `backgrounds/arcade-<테마>.webp`, 도트 공방의 그리기로 받은 가로 그림, 기록 `records/backgrounds/`)의 융단 바닥을 도트 인물(`data/sprites.json`)이 거닌다(누르면 그 게임의 도감, 도트가 없으면 띠째 없다). 그 아래 기기 줄 — 게임 한 편에 기기 하나(화면은 타이틀 그림 썸네일, 없으면 꺼진 화면), 누르면 도감. 그 아래 첫 묶음 카드(설계표 그대로)·패치 기록·공간 |
| 도감 | `dex.html` · `lib/dex-filter.js` · `lib/img.js` · `lib/gallery.css` | book 서가에서 — 최근 추가·새 표·장르·거르기·작업 현황·나란히 보기(폼 셋·개방 셋)·화풍 비교·일상컷·크게 보기·넘기기·즐겨찾기(공방 모음 `a:'game'`)·도트(도트 있는 게임은 목록 칸에 「도트」 표, 상세에 작은 무대 한 줄 — `data/sprites.json`). 게임 글은 능력·폼 배경·그리지 않을 것·Wikidata 사실 칸. 등록부 `data/img.json` 에 적힌 것만 |
| 프롬프트 | `prompt.html` · `lib/prompt-spec.js`(표) · `data/casual-tree.json` · `lib/casual-tree.js`(일상컷 트리) · `data/casual-tree-v2.json` · `lib/casual-tree-v2.js`(일상컷 트리 버전2 — 만드는 중, 아직 화면에 안 붙음) · `lib/prompt-game.js`(조립) · `lib/prompt-random.js` · `lib/prompt-ui.js` · `lib/figures.js` | 생성기 — 폼 초상·개방·일상컷. book 생성기에서 왔다. 게임 몫: 캐릭터 아님·그리지 않을 것 줄, 핵심 조작·시대 줄, 일상컷 게임 갈래 넷(게임 속 장소·오락실·게임 문화·개발실·스피드런·방송), 출시 당시 |

머리·항해·⚙ 설정은 `lib/workspace-ui.js`, 공간(테마)은 `lib/workspace-theme.js`·`lib/workspace.css`·`lib/room.css`.
화면 차례는 `lib/workspace-ui.js` 의 `PAGES` 한 곳이다 — 화면을 붙이면 거기 더한다.

`lib/favorites.js` 는 공방 모음(polos0117.github.io)의 `favorites.js` 를 글자 하나 다르지 않게 복사한 공용 모듈이다(열쇠 `atelier_favorites_v1`).
여기서 따로 고치지 않는다. 서가가 붙을 때 쓴다.

도트 재생기 `lib/sprite-actor.js`·`lib/sprite-actor.css` 도 공방 모음의 `sprite-actor.js`·`.css` 를 글자 하나 다르지 않게 복사한 공용 모듈이다(약속 — `data/sprites.json` 꼴·API — 은 그쪽 README 「도트 재생기」절).
여기서 따로 고치지 않는다 — 고치면 원본과 여섯 저장소를 같이, `node tests/sprite-actor-copy.cjs` 가 원본과 견준다. 게임의 도트는 공방 모음의 도트 공방(`dot.html`, 공방 「게임」)에서 만들어
그림 저장소 `game-atelier-img` 의 `sprites/<id>/` 에 올리고, 「인물 칸 복사」가 주는 칸을 `data/sprites.json` 의 `actors` 에 넣는다(`card` 는 게임 열쇠 — 도감 `?game=`).

## 지켜야 할 것

### 1. 게임 속 캐릭터를 그리지 않는다

그리는 것은 게임이라는 작품 자체다 — 장르의 분위기, 시대의 그래픽 감각, 상징 소품, 대표 색.
원작은 알아보게 그린다(2026-10-28 사용자) — 팬이 바로 알아볼 소품·장소·색·진영 문장은 `signature`, 폼마다 그 게임의 직업·진영 장비 느낌은 `forms.<폼>.homage`.
원작 인물의 차림새(얼굴은 그녀 것)와 글자 없는 UI 모양(무늬·소품으로)도 그려도 된다(2026-10-28 사용자).
게임 속 캐릭터·몬스터의 얼굴과 몸, 로고, 타이틀 글자, 박스 아트, 그림 위에 겹친 HUD, 읽히는 글자·숫자, 실제 상표는 그리지 않는다. 게임마다 `avoid` 에 적는다.
개방 명장면은 그녀 한 명과 사물·환경(괴물은 형체 없는 그림자)으로 표현할 수 있어야 한다.

### 2. 한 게임은 하나의 능력 원리, 게임끼리 닮지 않는다

`mechanic` 은 그 게임의 핵심 조작 한 문장이고, 세 폼(타이틀·중반·엔딩)은 그 원리를 다르게 쓴다. 고유 규칙에는 반드시 상대의 대응이 있다.
결투는 book 의 책장 넘기기(장·자리·맞은편)라서 줄(lane) 말은 못 쓴다.
어느 두 게임도 실루엣 축 6 중 셋 이상, 얼굴 5 묶음 중 둘 이상 다르다. 같은 시리즈 자매는 얼굴 윤곽이 같다.
머리색(`silhouette.hair_color`)·눈 색(`face.eye_color`)은 게임의 대표색 — 새 게임도 둘 다 채우고, 검정·갈색은 정한 말에 없다(GAME_CONCEPT 6절).
설계표를 고치면 `python3 tools/game-design.py check` 를 돌린다. 그 게임을 그리기 전에는 `python3 tools/game-design.py conflicts <key>` 가 0 이어야 한다 — 고치거나, 보고 괜찮으면 그 게임 `conflicts_ok` 에 열쇠를 적는다.

### 3. 사실은 지어내지 않는다

연도·개발사·배급사·플랫폼·QID 는 `facts` 칸에만 있고, `tools/fetch-games.py` 만 채운다. 기억으로 적지 않는다.
QID 는 `find` 로 후보를 보고 사람이 고른다(같은 이름의 이식판이 많다). Wikidata 는 돌아가는 프록시를 거친 자동 질의를 막으니
크롤러 서비스로 돌려 받지 않는다 — 막혀 있으면 작업 환경에서 `query.wikidata.org` 를 열어 달라고 한다.
질의는 횟수로 센다 — 여러 편을 한 번에 `find`·`pull` 하고(편수를 나누면 질의만 늘어난다), 시험 삼아 던지는 질의를 하지 않는다.
`find` 는 영어 위키백과 문서 주소로 바로 집는다(가볍다). 문서 이름이 다르면 `key=문서 이름`, 그래도 없을 때만 `find --wide`(무겁다).

### 4. 화면에 말을 적지 않는다

사람이 읽는 말은 전부 `lib/words.js` 에서 온다(`W('home.title')`). 생성기의 선택지·영어 문구는 `lib/prompt-spec.js` 에 있다.
둘은 한글 검사에서 빠지는 대신 "표뿐인가" 를 따로 본다 —
`node tests/words.cjs`. `<title>` 은 `app.title` 과 같아야 한다. 설계표의 글(게임 이름·인격·능력)은 자료라서 화면이 그대로 읽는다.

### 5. 그림은 이 저장소에 두지 않는다

그림은 `game-atelier-img` 에 올린다. `img/` 는 `.gitignore` 에 있다. 원본 PNG 는 올리지 않는다.
그림 규칙은 `IMAGE_RULES.md`. 그림 저장소에 올리면 썸네일(`game-atelier-img` 워크플로)과 등록(`그림 등록` 워크플로 · `tools/register-images.py`)이 알아서 된다 — `data/img.json` 은 손으로 고치지 않는다(IMAGE_RULES 4절).
일상컷 묶음은 `node tools/casual-plan.cjs <게임>` 으로 짜고, 올리기 전에 `node tools/casual-plan.cjs <게임> --check <기록 폴더>` 로 묶음 규칙(필수 갈래·장소·의상·구도 겹침)을 본다(IMAGE_RULES 2절).

설계표에 새 정한 말(vocab)을 더하면 `lib/prompt-spec.js` 의 `VOCAB_EN` 에 영어도 더한다(`node tests/prompt-game.cjs` 가 본다).
일상컷은 트리로 고른다 — 시대 → 장소 → 하는 일 → 의상 → 구도(2026-10-29, `data/casual-tree.json` · `lib/casual-tree.js`, IMAGE_RULES 2절). `lib/casual-tree.js` 와 `tools/casual-tree.py` 는 book·myth·pkm-atelier 가 글자 하나 다르지 않게 복사해 쓴다 — 고치면 셋에도 복사하고 그쪽 검사를 돌린다(트리 표는 공방마다. 공방만의 규칙 — pkm 의 안 쓰는 값 `banned`·얼굴 클로즈업 `not_required`·동료 `companion`·세대의 해 `gen_years` — 도 표의 칸이고, 칸이 없는 표에선 지금과 같다). 예전 갈래·예시는 추천 조합과 변환표로 옮겼다. 표를 고치면 `python3 tools/casual-tree.py check`.

### 6. 고쳤으면 적는다

파일을 고쳤으면 `docs/PATCH.md` 맨 위에 한 칸 적는다. 커밋 메시지로 갈음하지 않는다 — 두 세션
(`claude` · `gpt`)이 같은 `main` 에 번갈아 민다.

```
## 2026-10-26 · claude · 무엇을 바꿨나
- data/foo.json — 왜 고쳤나
```

날짜는 `2026-10-26` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 맨 위로 간다. `node tests/patch.cjs` 가 모양을 본다.

### 7. 올리기

`main` 에 직접 올린다. 작업 브랜치·PR 은 만들지 않는다. 강제 push 와 남의 작업 지우기는 하지 않는다.

## 검사

```bash
python3 tools/game-design.py check   # 게임 설계표 — 빈칸·정한 말·실루엣·얼굴 닮음·머리·눈 색·자매·한 명 개방·대응·사실 칸
python3 tools/game-design.py conflicts [key] [--all]   # 폼 지시문 충돌 후보(복식 구조↔타이틀 차림, 알아볼 거리↔개방 사건, 자세↔개방, 차림↔자세, 운동화↔상표). 그리기 전에 그 게임은 0
python3 tests/game-design.py         # 설계표 검사기가 규칙마다 제대로 거는지
python3 tests/casual-compose.py      # 일상컷 구도 검사기 — 방향·프레이밍 겹침·렌즈 세 번·먼/가까운 컷
node tools/casual-plan.cjs <게임> --out <폴더>   # 일상컷 묶음 짜기(그릴 때) · --check <기록 폴더> 로 올리기 전 검사
node tests/casual-plan.cjs           # 묶음 계획기 — 스무 편 × 씨앗 셋이 규칙을 지키고 기록이 생성기 꼴
node tests/casual-plan-screen.cjs    # 계획기 기록을 생성기 화면에 넣으면 같은 지시문(브라우저)
python3 tools/casual-tree.py check    # 일상컷 트리 표 — 시대→장소→하는 일→의상 길이 끊긴 데·없는 열쇠·필수 갈래
python3 tools/casual-tree.py audit    # 하는 일 문장의 고정물(창·부두·식탁 …)이 붙는 장소 문장에 없는 쌍 — 하는 일·장소를 넣었으면 0 인지 본다
python3 tests/casual-tree.py         # 트리 검사기가 규칙마다 거는지
node tests/casual-tree.cjs           # 트리 자세 계열의 자세·방향 열쇠가 생성기 표에 있다
python3 tools/casual-tree-v2.py check # 일상컷 트리 버전2 표(docs/CASUAL_TREE_V2.md) — 없는 열쇠·두 손 칸·보이는 손 자리·다리 칸·다 되는 장소 없는 자세 추천
python3 tests/casual-tree-v2.py      # 버전2 검사기가 규칙마다 거는지
node tests/casual-tree-v2.cjs        # 버전2 거르기 모듈(lib/casual-tree-v2.js) — 검사기와 같은 길, 랜덤 · 칸 바꾸기 뒤 걸리는 칸 없음, 두 손 · 넓히지 않기 · 버전1 기록
python3 tests/fetch-games.py         # 사실 자료 도구 — 질의문·응답 풀기·설계표 채우기(네트워크 없이, 가짜 응답으로)
node tests/prompt-game.cjs           # 프롬프트 — 게임마다 폼 셋 × 갈래, 정한 말 영어, 게임 줄, 일상컷 트리(시대·장소·하는 일·옷·구도·추천 조합·예전 기록), 출시 당시, 길이, 일상컷 버전2 줄(자세·구도·오른손·왼손·소품·다리·시선)
node tests/words.cjs                 # 낱말 표
node tests/patch.cjs                 # 패치 기록 모양
python3 tests/register-images.py     # 그림 등록 — 이름 꼴·자리·등록한 날·틀린 이름은 저장 안 함
python3 tests/make-thumbs.py         # 썸네일 도구 — 열리지 않는 원본은 건너뛰고 2 로 끝남 · --redo
node tests/img-shards.cjs            # 그림 주소·등록기·워크플로·.gitignore 가 같은 저장소 차례
node tests/sprite-actor-copy.cjs     # 도트 재생기 — lib/sprite-actor.js·.css 가 공방 모음 원본과 같다

# 브라우저 — ESM_DIR 에 preact 가 든 node_modules, CHROMIUM_PATH 에 브라우저
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/prompt-screen.cjs   # 생성기
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dex-screen.cjs      # 도감 — 옆에 ../game-atelier-img 가 있으면 그림까지
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dot-screen.cjs      # 도트 — 첫 화면 오락실 바닥 띠·도감 상세 무대·목록 「도트」 표(시험 자료)
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/arcade-screen.cjs   # 오락실 — 무대·기기 줄(게임마다 하나·간판·그림/꺼짐·누르면 도감)·첫 묶음 그대로·네 크기. BACKGROUND_DIR 에 backgrounds/ 를 주면 배경 그림까지
```
