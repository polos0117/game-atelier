# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-26` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.




## 2026-10-26 · claude · 게임의 공방 바탕 — 뼈대·첫 묶음 설계표·Wikidata 도구
- docs/GAME_CONCEPT.md — 계획서(Claude Docs 「게임 공방 계획서」)를 옮겼다. 게임 자체를 성인 여성 한 명으로 그리고 게임 속 캐릭터·로고·UI 는 그리지 않는다, 폼은 타이틀·중반·엔딩, 장르 네 묶음 상성(반사→성장→두뇌→탐험→반사), 화풍 glossy_kr_game, 만드는 순서.
- lib/workspace.css · lib/workspace-theme.js · lib/workspace-ui.js · lib/room.css · lib/fresh.js · lib/patch.js · lib/favorites.js — book-atelier 에서 가져왔다. 테마 열쇠는 game_room_v1·game_background_v1, 머리 접기는 game_header_fold, 문양은 오락기·모니터·휴대용 게임기, 풍경 그림은 아직 없어 none. 무엇을 바꿨는지는 docs/PORT_NOTES.md.
- lib/words.js · tests/words.cjs — 게임 공방 낱말(공간 이름: 한낮의 오락실·심야 게임방·골목 문방구·별장 거실). 검사가 옛 상표 말도 막는다.
- index.html · lib/home.css — 첫 화면. 설계표의 첫 묶음 10편을 한 편에 한 칸(이름·묶음·인격·능력)으로 보이고, 패치 기록·공간 고르개를 둔다.
- data/game-design.json — 첫 묶음 10편(팩맨·테트리스·슈퍼 마리오 브라더스·젤다의 전설·드래곤 퀘스트·스트리트 파이터 II·심시티·스타크래프트·마인크래프트·다크 소울)의 해석 칸: 인격·한마디·상징·능력과 폼별 쓰임·대응·세 폼·개방·실루엣·얼굴·장소·권리사·그리지 않을 것. 연도·개발사 같은 사실 칸은 비워 두었다 — 기억으로 적지 않고 도구로 받는다. 다크 소울은 「액션 RPG」 로 두어 열 편의 장르가 다 다르다.
- tools/game-design.py · tests/game-design.py — book-design.py 에서 왔다. 빈칸·정한 말·묶음과 장르·실루엣 3+·얼굴 2+·시리즈 자매(서로 적기·얼굴 윤곽)·줄(lane) 말·avoid 를 보고, 받은 적 없는 사실 칸이 차 있으면 막는다. 받은 연도가 시대와 어긋나면 경고한다.
- tools/fetch-games.py · tests/fetch-games.py · tests/fixtures/wikidata-sample.json — Wikidata SPARQL 도구. find 는 후보 QID 만 보이고, 사람이 고른 QID 로 pull 하면 data/wikidata/<key>.json 에 원본을 두고 facts 를 채운다. 저장소 주소를 담은 User-Agent, 질의 사이 쉬기, 돌아가는 프록시로 돌려 받지 않기. 검사는 가짜 응답으로 네트워크 없이 돈다. 이 작업 환경에서는 query.wikidata.org 가 막혀 아직 받지 못했다.
- README.md · AGENTS.md · CLAUDE.md · docs/PORT_NOTES.md · .gitignore — 처음 쓴다.
