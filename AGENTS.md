# 작업 지침

**뼈대 · 게임 설계표(해석 칸) · 사실 자료 도구** 까지 왔다. 다음은 Wikidata 로 사실 칸 채우기, 그다음 생성기(`docs/GAME_CONCEPT.md` 8절).
뼈대는 book-atelier 에서 가져왔다 — 무엇을 어디서 가져왔는지는 `docs/PORT_NOTES.md`.

## 먼저 읽을 것

| 문서 | 무엇 |
|---|---|
| 이 문서 | 규칙과 자리 |
| `docs/GAME_CONCEPT.md` | 기획 — 원칙·데이터·설계표·폼과 개방·결투 상성·첫 묶음·화풍·만드는 순서 |
| `data/game-design.json` | 게임 설계표. 게임 한 편 = 한 칸 |
| `docs/PORT_NOTES.md` | 어디서 무엇을 가져왔고, 무엇을 아직 안 가져왔나 |
| `docs/PATCH.md` | 무엇을 고쳤나 — 고친 쪽이 직접 적는다 (아래 규칙 6) |

## 화면

| 화면 | 파일 | 무엇 |
|---|---|---|
| 첫 화면 | `index.html` · `lib/home.css` | 첫 묶음(설계표를 그대로 읽어 한 편에 한 칸)·패치 기록·공간 |

머리·항해·⚙ 설정은 `lib/workspace-ui.js`, 공간(테마)은 `lib/workspace-theme.js`·`lib/workspace.css`·`lib/room.css`.
화면 차례는 `lib/workspace-ui.js` 의 `PAGES` 한 곳이다 — 화면을 붙이면 거기 더한다.

`lib/favorites.js` 는 공방 모음(polos0117.github.io)의 `favorites.js` 를 글자 하나 다르지 않게 복사한 공용 모듈이다(열쇠 `atelier_favorites_v1`).
여기서 따로 고치지 않는다. 서가가 붙을 때 쓴다.

## 지켜야 할 것

### 1. 게임 속 캐릭터를 그리지 않는다

그리는 것은 게임이라는 작품 자체다 — 장르의 분위기, 시대의 그래픽 감각, 일반화한 상징 소품, 대표 색.
게임 속 캐릭터·몬스터의 얼굴과 디자인, 로고, 타이틀 글자, 박스 아트, UI 는 그리지 않는다. 게임마다 `avoid` 에 적는다.
개방 명장면은 그녀 한 명과 사물·환경(괴물은 형체 없는 그림자)으로 표현할 수 있어야 한다.

### 2. 한 게임은 하나의 능력 원리, 게임끼리 닮지 않는다

`mechanic` 은 그 게임의 핵심 조작 한 문장이고, 세 폼(타이틀·중반·엔딩)은 그 원리를 다르게 쓴다. 고유 규칙에는 반드시 상대의 대응이 있다.
결투는 book 의 책장 넘기기(장·자리·맞은편)라서 줄(lane) 말은 못 쓴다.
어느 두 게임도 실루엣 축 6 중 셋 이상, 얼굴 5 묶음 중 둘 이상 다르다. 같은 시리즈 자매는 얼굴 윤곽이 같다.
설계표를 고치면 `python3 tools/game-design.py check` 를 돌린다.

### 3. 사실은 지어내지 않는다

연도·개발사·배급사·플랫폼·QID 는 `facts` 칸에만 있고, `tools/fetch-games.py` 만 채운다. 기억으로 적지 않는다.
QID 는 `find` 로 후보를 보고 사람이 고른다(같은 이름의 이식판이 많다). Wikidata 는 돌아가는 프록시를 거친 자동 질의를 막으니
크롤러 서비스로 돌려 받지 않는다 — 막혀 있으면 작업 환경에서 `query.wikidata.org` 를 열어 달라고 한다.

### 4. 화면에 말을 적지 않는다

사람이 읽는 말은 전부 `lib/words.js` 에서 온다(`W('home.title')`). 그 파일은 한글 검사에서 빠지는 대신 "표뿐인가" 를 따로 본다 —
`node tests/words.cjs`. `<title>` 은 `app.title` 과 같아야 한다. 설계표의 글(게임 이름·인격·능력)은 자료라서 화면이 그대로 읽는다.

### 5. 그림은 이 저장소에 두지 않는다

그림은 `game-atelier-img` 에 올린다. `img/` 는 `.gitignore` 에 있다. 원본 PNG 는 올리지 않는다.
그림 규칙(`IMAGE_RULES.md`)과 등록 워크플로는 생성기와 함께 book 에서 옮긴다.

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
python3 tools/game-design.py check   # 게임 설계표 — 빈칸·정한 말·실루엣·얼굴 닮음·자매·한 명 개방·대응·사실 칸
python3 tests/game-design.py         # 설계표 검사기가 규칙마다 제대로 거는지
python3 tests/fetch-games.py         # 사실 자료 도구 — 질의문·응답 풀기·설계표 채우기(네트워크 없이, 가짜 응답으로)
node tests/words.cjs                 # 낱말 표
node tests/patch.cjs                 # 패치 기록 모양
```
