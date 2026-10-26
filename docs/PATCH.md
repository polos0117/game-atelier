# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-26` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.





## 2026-10-26 · claude · 생성기 — book 생성기를 게임 몫으로, 일상컷 게임 갈래 넷
- prompt.html · lib/prompt-ui.js · lib/prompt-game.js · lib/prompt-random.js — book 생성기(폼 초상·개방·일상컷·외형 잠금·무작위·되돌리기·기록·저장)를 옮겼다. 주소는 ?game=, 저장 열쇠 game_prompt_v1. 설계 칸에 능력·그리지 않을 것이 보이고, 게임 한 줄은 Wikidata 에서 받은 연도·개발사만 싣는다(안 받았으면 비운다). book 의 「원작 시대」 자리는 「출시 당시」 — 그 게임이 나온 해 무렵의 현실로 옮긴다(받은 연도, 없으면 시대).
- lib/prompt-spec.js — BOOK_LINES 를 GAME_LINES 로 바꿨다. 책 몸(책장·제본)·보호 중인 책·각색 줄을 빼고, 모든 갈래에 「게임 속 캐릭터 아님」(NOT ITS CHARACTERS)·게임마다 그리지 않을 것(NEVER DRAW — 설계표 avoid)을, 새 인물에 핵심 조작(CORE PLAY)·시대 감각(ERA LOOK — 옷감·무늬로만, 도트 그림은 아님)을 싣는다. 단계는 타이틀·중반·엔딩, 정한 말은 게임 설계표의 것으로, 과감 노출의 한복 갈래는 뺐다. 가장 긴 프롬프트 786낱말(한도 800).
- lib/prompt-spec.js — 일상컷 갈래: book 의 책 세계관 갈래 넷(서고의 일상·이야기 속 장소·무대 각색·낭독회)은 빼고, 게임 갈래 넷을 예시 열씩(한국어 설명 포함) 넣었다 — 게임 속 장소(설계표 place 를 GAME PLACE 줄로)·오락실·게임 문화(오락기·인형 뽑기·리듬 게임·PC방·문방구 오락기·레트로 가게·출시일 줄 …)·개발실(도트 책상·기획 벽·플레이테스트·효과음·모션 캡처·출시 파티 …)·스피드런·방송(기록 갱신·방송 책상·대회 무대·자선 마라톤 …). 셋에는 화면·오락기·상자에 알아볼 게임이 뜨지 않게 SCREENS 줄을 싣는다. 공용 갈래에 남아 있던 "her book" 문장과 책 말로 옮겼던 연출 예시(책장·팝업북·책갈피)는 게임 말로 바꿨다.
- data/style.json — glossy_kr_game v1. 폼·개방은 myth 문장(끝만 costume and accessory), 일상컷은 pkm 일상컷 문장(fabric and accessory), 점검 줄. 기준 그림은 시범 그림 뒤에 정한다.
- lib/img.js · lib/dex-filter.js · lib/figures.js · lib/prompt.css · lib/gallery.css · lib/landscape.css · data/img.json — book 에서. 그림 저장소는 game-atelier-img, 등록부는 빈 채로 시작한다.
- lib/words.js · lib/workspace-ui.js · index.html — 생성기 낱말(책 말은 게임 말로), 머리 항해에 프롬프트.
- IMAGE_RULES.md · CLAUDE.md — 게임 그림 규칙: 캐릭터·로고·UI 를 그리지 않는다, 소품은 일반화, 원본 PNG 는 올리지 않고 sha256 만, 올리기 전에 묻는다, 등록은 서가가 오기 전까지 손으로.
- tests/prompt-game.cjs · tests/prompt-screen.cjs · tests/browser-harness.cjs · tests/words.cjs — 열 편 × 폼 셋 × 갈래 조립, 정한 말 영어, 게임 줄, 책 갈래 없음·게임 갈래와 줄, 출시 당시, 사실은 받은 것만, 화면(고르개 표시·게임 갈래·출시 당시·기록·저장).
- AGENTS.md · README.md · docs/GAME_CONCEPT.md · docs/PORT_NOTES.md — 생성기 자리와 검사, 만드는 순서 4단계까지.
- tools/fetch-games.py — 열 편 후보 찾기를 질의 하나로 묶고, 너무 잦다(429)면 Retry-After 만큼 기다렸다 다시 묻는다. Wikidata 가 장애 중이라 1분에 한 번으로 묶여 있었다.

## 2026-10-26 · claude · 게임의 공방 바탕 — 뼈대·첫 묶음 설계표·Wikidata 도구
- docs/GAME_CONCEPT.md — 계획서(Claude Docs 「게임 공방 계획서」)를 옮겼다. 게임 자체를 성인 여성 한 명으로 그리고 게임 속 캐릭터·로고·UI 는 그리지 않는다, 폼은 타이틀·중반·엔딩, 장르 네 묶음 상성(반사→성장→두뇌→탐험→반사), 화풍 glossy_kr_game, 만드는 순서.
- lib/workspace.css · lib/workspace-theme.js · lib/workspace-ui.js · lib/room.css · lib/fresh.js · lib/patch.js · lib/favorites.js — book-atelier 에서 가져왔다. 테마 열쇠는 game_room_v1·game_background_v1, 머리 접기는 game_header_fold, 문양은 오락기·모니터·휴대용 게임기, 풍경 그림은 아직 없어 none. 무엇을 바꿨는지는 docs/PORT_NOTES.md.
- lib/words.js · tests/words.cjs — 게임 공방 낱말(공간 이름: 한낮의 오락실·심야 게임방·골목 문방구·별장 거실). 검사가 옛 상표 말도 막는다.
- index.html · lib/home.css — 첫 화면. 설계표의 첫 묶음 10편을 한 편에 한 칸(이름·묶음·인격·능력)으로 보이고, 패치 기록·공간 고르개를 둔다.
- data/game-design.json — 첫 묶음 10편(팩맨·테트리스·슈퍼 마리오 브라더스·젤다의 전설·드래곤 퀘스트·스트리트 파이터 II·심시티·스타크래프트·마인크래프트·다크 소울)의 해석 칸: 인격·한마디·상징·능력과 폼별 쓰임·대응·세 폼·개방·실루엣·얼굴·장소·권리사·그리지 않을 것. 연도·개발사 같은 사실 칸은 비워 두었다 — 기억으로 적지 않고 도구로 받는다. 다크 소울은 「액션 RPG」 로 두어 열 편의 장르가 다 다르다.
- tools/game-design.py · tests/game-design.py — book-design.py 에서 왔다. 빈칸·정한 말·묶음과 장르·실루엣 3+·얼굴 2+·시리즈 자매(서로 적기·얼굴 윤곽)·줄(lane) 말·avoid 를 보고, 받은 적 없는 사실 칸이 차 있으면 막는다. 받은 연도가 시대와 어긋나면 경고한다.
- tools/fetch-games.py · tests/fetch-games.py · tests/fixtures/wikidata-sample.json — Wikidata SPARQL 도구. find 는 후보 QID 만 보이고, 사람이 고른 QID 로 pull 하면 data/wikidata/<key>.json 에 원본을 두고 facts 를 채운다. 저장소 주소를 담은 User-Agent, 질의 사이 쉬기, 돌아가는 프록시로 돌려 받지 않기. 검사는 가짜 응답으로 네트워크 없이 돈다. 이 작업 환경에서는 query.wikidata.org 가 막혀 아직 받지 못했다.
- README.md · AGENTS.md · CLAUDE.md · docs/PORT_NOTES.md · .gitignore — 처음 쓴다.
