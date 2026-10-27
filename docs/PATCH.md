# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-26` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.





## 2026-10-27 · claude · 마리오 엔딩 자세 — 한 손으로 깃대, 다른 손은 흔들기
- data/game-design.json — 슈퍼 마리오 브라더스 엔딩 pose 를 "깃대를 두 손으로 잡고 미끄러져 내려오는 자세" 에서 "한 손으로 깃대를 잡고 몸을 바깥으로 젖혀 미끄러져 내려오며, 다른 손은 크게 흔드는 자세" 로. 줄 셋을 고친 뒤에도(dde297b) 깃대가 몸 한쪽에 서면 다른 손이 몸 앞을 가로질러 같은 깃대를 잡아야 해서, 왼팔 위팔이 가슴 뒤로 숨고 손이 가슴 밑에서 나온 것처럼 이어졌다. 한 손이면 팔이 엇갈릴 데가 없고 엔딩의 축하 느낌도 산다(사용자가 골랐다). python3 tools/game-design.py check 통과.

## 2026-10-27 · claude · 폼 초상 — 폼 자세와 부딪히던 줄 셋
- lib/prompt-game.js · lib/prompt-spec.js — 마리오 엔딩("깃대를 두 손으로 잡고 미끄러져 내려오는 자세")에서 팔이 하나 더 생기려 했다. ① 새 인물의 SILHOUETTE 에 실루엣 자세 축("springing upward, one fist raised")이 STANCE 와 같이 들어갔다 — 폼 자세·고른 자세·연출이 있으면 빠진다(설계표 폼마다 자세가 있어 폼 초상에서는 사실상 빠진다). ② 카드 출력 줄의 "no foreground occlusion" 이 몸 앞을 지나는 깃대와 부딪혔다 — "nothing in front of her but what she holds". ③ HOLD BACK 이 개방 장면의 "핵심 물건" 을 빼라 해 엔딩 개방의 깃발과 STANCE 의 깃대가 부딪혔다 — 개방의 사건만 빼고 "An object named in FORM or in her pose stays."
- tests/prompt-game.cjs — 폼 초상에 실루엣 자세가 없고, 쥔 것은 앞을 가려도 되며, 폼·자세가 쥔 물건은 남는지. prompt.html 판 올림.

## 2026-10-27 · claude · 팩맨 첫 그림 11장 등록 · 배경 속 사람은 괜찮다
- data/img.json — 팩맨 폼 셋(타이틀·중반·엔딩)·개방 셋·일상컷 다섯을 손으로 적었다. 등록한 날은 added 에. 그림은 game-atelier-img 의 img/ · img/thumb/, 기록 records/pacman/<자리>-import.json(원본 PNG 는 올리지 않고 sha256 만).
- 검토에서 본 것 — 엔딩 위쪽 네온 간판의 잘린 글자(읽히지 않음)·창 안 오락기 화면(작고 흐림), 일상컷 3 벽 포스터의 작은 무용수 그림, 일상컷 4 뒤의 흐릿한 파티 손님. 사용자가 다 올리기로 했고 기록의 review 에 적었다.
- IMAGE_RULES.md — "인물은 그녀 한 명" 을 "주인공은 그녀 한 명" 으로. 배경 속 사람은 나와도 괜찮고(사용자), 다시 만드는 것은 주인공을 다투는 사람·몸에 닿은 사람·같은 얼굴 하나 더. 개방 명장면은 그대로 한 명.

## 2026-10-27 · claude · 생성 프롬프트 — 몸 개수 줄, 손 줄은 짧은 긍정형, 일상컷 손 규칙
- lib/prompt-spec.js · lib/prompt-game.js — pkm 과 같게. 폼·이어가기·개방·일상컷 모두에 BODY 줄(머리 하나·팔 둘·다리 둘, 제 관절에 붙고 사람처럼 굽음, 손·발은 가려져도 된다). 손가락 개수는 적지 않는다 — 쥐거나 가려져야 할 구도에서도 다섯을 다 보이려 한다. HANDS 줄은 "natural human hands." — "엄지 하나와 손가락 넷, 엄지는 안쪽, 합쳐지거나 … 더 생기지 않게" 는 금지를 늘어놓아 손에 주의를 끌었다(pkm 그림 저장소의 팔·다리·손 고침이 10-21 부터 늘었다). 손 기본 자세·자세 있는 손·개방의 손 줄에서도 금지어를 뺐다(빈손은 empty 로). 일상컷에 HAND TASK 줄(자세·장면대로, 쉬는 손은 편하게, 가려져도 된다 — 사용자 문장).
- tests/prompt-game.cjs · docs/GAME_CONCEPT.md — 손 줄에 손가락 개수·금지어가 없는지, 몸 줄·HAND TASK, 길이 한도 800 → 840. prompt.html 판 올림.

## 2026-10-26 · claude · 스타크래프트 첫 그림 12장 등록
- data/img.json — 스타크래프트 폼 셋(타이틀·중반·엔딩)·개방 셋·일상컷 여섯을 손으로 적었다. 등록한 날은 added 에. 그림은 game-atelier-img 의 img/ · img/thumb/, 기록 records/starcraft/<자리>-import.json(원본 PNG 는 올리지 않고 sha256 만).
- 검토에서 본 것 — 중반 폼 뒤의 일반적인 SF 전차·비행선(전차 실루엣이 원작 유닛을 조금 떠올리게 함), 엔딩 창밖의 작은 함선. 사용자가 다 올리기로 했고 기록의 review 에 적었다.

## 2026-10-26 · claude · 다크 소울 첫 그림 11장 등록
- data/img.json — 다크 소울 폼 셋(타이틀·중반·엔딩)·개방 셋·일상컷 다섯을 손으로 적었다. 등록한 날은 added 에. 그림은 game-atelier-img 의 img/ · img/thumb/, 기록 records/dark_souls/<자리>-import.json(원본 PNG 는 올리지 않고 sha256 만).
- 검토에서 본 것 — 중반 개방의 그림자 위쪽에 눈·얼굴 윤곽(설계표는 형체 없는 그림자), 일상컷 5의 패드가 특정 콘솔 패드와 닮음(상표 없음). 사용자가 다 올리기로 했고 기록의 review 에 적었다.

## 2026-10-26 · claude · 드래곤퀘스트 첫 그림 11장 등록
- data/img.json — 드래곤퀘스트 폼 셋(타이틀·중반·엔딩)·개방 셋·일상컷 다섯을 손으로 적었다. 등록한 날은 added 에. 그림은 game-atelier-img 의 img/ · img/thumb/, 기록 records/dragon_quest/<자리>-import.json(원본 PNG 는 올리지 않고 sha256 만).
- 검토에서 본 것 — 일상컷 4(레드카펫) 뒤에 사진기자·하객 여럿(한 명 규칙), 2(레트로 방)의 게임기·카트리지·포스터는 알아볼 상표·게임 없음. 사용자가 다 올리기로 했고 기록의 review 에 적었다.

## 2026-10-26 · claude · 도감 — book 서가를 게임 몫으로
- dex.html — book 의 서가를 옮겼다. 목록(최근 추가·새 표·장르 띠·거르기·작업 현황·작게 보기)과 상세(나란히 보기 — 위 폼 셋·아래 개방 셋, 화풍 비교, 일상컷·연출컷·특별컷, 크게 보기·원본 크기, 넘기기·밀기·방향키, 앞·다음 게임, 휴대폰 뒤로 가기·주소 ?game=, 즐겨찾기). 게임 글은 한 줄 인격·능력과 대응·세 폼(모습·자세·배경·쓰임·명장면)·설계(실루엣·얼굴)·사실 칸(Wikidata 의 발매·개발·배급·시리즈·플랫폼·위키백과 — 받은 것만)·권리사·그리지 않을 것. 책 몫(장정 틀·도트·닮은 그림·모자이크·진열·움직임)은 빼 두었다.
- lib/words.js · lib/workspace-ui.js — 도감 낱말(책 말은 게임 말로), 머리 항해에 도감(첫 화면·도감·프롬프트).
- index.html · lib/home.css · lib/prompt-ui.js — 첫 화면 게임 이름과 생성기의 「도감에서 보기」 가 도감의 그 게임으로.
- tests/dex-screen.cjs — 목록·장르·상세 여섯 칸·일상컷·게임 글·크게 보기·넘기기·뒤로 가기·첫 화면 바로가기, 세 크기.
- AGENTS.md · docs/PORT_NOTES.md — 도감 자리와 검사.

## 2026-10-26 · claude · 테트리스 첫 그림 13장 등록
- data/img.json — 테트리스 폼 셋(타이틀·중반·엔딩)·개방 셋·일상컷 일곱을 손으로 적었다(서가·등록 워크플로가 오기 전). 등록한 날은 added 에. 그림은 game-atelier-img 의 img/ · img/thumb/, 자리마다 기록 records/tetris/<자리>-import.json(원본 PNG 는 올리지 않고 sha256 만).
- 검토에서 본 것 — 중반 폼·중반 개방의 떨어지는 블록이 테트리스 조각 모양 그대로, 일상컷 5(가면무도회)·6(디스코) 뒤에 흐릿한 사람들, 4(전화) 포스터의 가짜 글자, 7(광장) 계단의 작은 사람. 사용자가 다 올리기로 했고 기록의 review 에 적었다.

## 2026-10-26 · claude · 어두운 공간 하나 더 — 새벽 컴퓨터실
- lib/workspace.css · lib/workspace-theme.js · lib/room.css — 다섯째 공간 phosphor(새벽 컴퓨터실). 검은 화면에 형광 초록 글자·호박색 불빛 — 남보라 네온의 심야 게임방과 갈리는 어두운 공간이다. 바탕은 초록 모니터 빛 번짐·호박색 스탠드·주사선·옅은 화면 격자·가장자리 어둠. 글자·강조·묶음 색 대비 7.7:1 이상.
- lib/workspace-ui.js — 문양은 플로피 디스크. lib/words.js — 이름과 한 줄 설명. 판 올림.

## 2026-10-26 · claude · 공간 넷의 색·바탕을 게임 공방 분위기로
- lib/workspace.css · lib/workspace-theme.js — book 의 종이·참나무 색(초록 공간 둘 포함)을 게임 공방 넷으로 바꿨다. 한낮의 오락실은 연보라 흰 바탕에 분홍·청록, 심야 게임방은 남보라 어둠에 네온 분홍·청록, 골목 문방구는 누런 종이에 토마토 빨강·민트, 별장 거실은 호두나무 빛에 청록·녹슨 주황. 글자·강조·묶음 색은 놓이는 바탕과 대비 4.5:1 이상으로 맞췄다. 결투 상성의 네 묶음(반사·성장·두뇌·탐험)에 공간마다 색(--g-*)을 두었다.
- lib/room.css — 공간 풍경을 그림 없이 CSS 로 그린다: 오락실은 햇살 빛 번짐과 화면 격자, 게임방은 네온 두 빛과 주사선, 문방구는 차양 줄무늬, 별장은 나무 바닥결과 스탠드 불빛. 가운데 판을 반쯤 비치게 해 바탕이 카드 사이로 보인다(단색 바탕을 고르면 불투명). 공간 미리보기 칸이 비어 있던 것 — 여러 겹 무늬를 background 한 줄에 넣어 줄이 통째로 무효였다 — 을 고쳤다.
- lib/gallery.css · lib/home.css · index.html · prompt.html — 제목 글꼴을 명조에서 굵은 고딕으로(명조 글꼴은 받지 않는다). 첫 화면 게임 칸은 묶음 색 왼쪽 띠·묶음 표. 판 올림.

## 2026-10-26 · claude · 세 폼이 다른 장면이 되게 — 폼 배경·단계별 빛·구도·카메라
- lib/prompt-spec.js · lib/prompt-game.js — 테트리스 시범 세 폼이 같은 유리 정육면체 벽·반사 바닥·같은 정장·같은 낮은 카메라로 나왔다. 이어가기 프롬프트에 배경 줄이 없어 첨부 그림의 배경을 그대로 썼고, GARMENT 줄이 복식 구조(정장)를 묶었고, STANCE 가 세 폼 모두 "살짝 낮은 카메라, 가만히" 였다. 이제 폼마다 SETTING 줄(설계표 setting + 단계의 빛·구도)을 싣고, STANCE 의 카메라를 단계마다 바꾼다(타이틀 눈높이·가운데 / 중반 낮은 각도·움직이는 순간 / 엔딩 높고 먼 카메라·큰 마무리 자세). 이어가기는 첨부 그림의 배경·바닥·빛·카메라를 쓰지 말라고 적고, GARMENT 줄은 재료·팔레트만 잇고 재단은 바뀌게 했다. 게임 줄에서 개발사는 뺐다(그림에 쓸모가 없고, Wikidata 차례대로 싣자 테트리스는 파지트노프가 빠졌다 — 생성기 화면에는 그대로 보인다). 가장 긴 프롬프트 800낱말.
- data/game-design.json — 열 편 서른 폼에 배경(setting, 한국어 한 줄)을 더했다. 명장면(개방)과 겹치지 않게 골랐다. 테트리스 중반은 짧은 갑옷형 재킷과 몸에 붙는 바지, 엔딩은 흰빛·은빛 긴 드레스로 바꿔 세 폼의 실루엣이 갈리게 했다(타이틀 정장은 그대로 — 인물 기준이다).
- tools/game-design.py · tests — 폼 배경이 비거나, 셋이 겹치거나, 명장면과 같으면 막는다. 프롬프트 검사가 폼마다 배경 줄·단계 카메라·이어가기의 배경 버리기·재료만 잇기를 본다.
- lib/prompt-ui.js · lib/words.js · prompt.html · index.html — 생성기 설계 칸에 폼 배경. 판 올림.
- docs/GAME_CONCEPT.md — 세 폼은 다른 장면이어야 한다는 원칙.

## 2026-10-26 · claude · 첫 묶음 열 편의 사실 칸 — Wikidata
- data/game-design.json · data/wikidata/*.json — 열 편의 facts(QID·발매 연도·개발사·배급사·플랫폼·장르·시리즈·모드·위키백과 주소)를 tools/fetch-games.py 로 받았다. QID 는 find 후보 가운데 그 게임 원작의 항목(영어 위키백과 문서가 그 게임 자체인 것 — 시리즈·이식판 항목이 아닌 것)을 골랐다: 팩맨 Q173626 · 테트리스 Q71910 · 슈퍼 마리오 브라더스 Q11168 · 젤다의 전설 Q12395 · 드래곤 퀘스트 Q2313869 · 스트리트 파이터 II Q1133204 · 심시티 Q249854 · 스타크래프트 Q165929 · 마인크래프트 Q49740 · 다크 소울 Q1166232. 받은 연도가 설계표의 시대(era)와 어긋나는 게임은 없다. Wikidata 빈칸: 심시티 발매일·모드, 테트리스 배급사 — 지어내지 않고 비워 두었다(검사기가 경고).
- tools/fetch-games.py — find 가 이름(별칭 포함)·비디오 게임 하위 갈래까지 보고, 영어 위키백과 문서 이름(「이름」·「이름 (video game)」)으로도 찾는다. 원작이 레이블로는 안 걸렸다(젤다·스타크래프트·다크 소울 후보 0). 후보마다 위키백과 문서 이름을 같이 보여 준다.
- docs/GAME_CONCEPT.md — 만드는 순서 2·3단계 끝, 정할 것의 Wikidata 빈칸 칸.
- tests/game-design.py · tests/fetch-games.py — 사실 칸이 찬 뒤에도 돌도록 비운 사본으로 본다. 받은 QID 가 원본(data/wikidata)과 같은지 본다.
- tests/prompt-screen.cjs — 주소는 화면이 그린 뒤 적으므로 기다렸다 읽는다(한 번 앞 모드를 읽고 실패했다).

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
