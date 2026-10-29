# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-26` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.





## 2026-10-29 · claude · 일상컷 — 장면 랜덤이 시대를 고르지 않게, 분리형 선호는 예시의 옷에 진다
- lib/prompt-random.js · lib/prompt-ui.js — 젤다 일상2 가 예시(미래풍 스파에서 가운 차림)와 다르게 1986년풍 모험가 방의 탱크톱·반바지로 나왔다(사용자 「프롬프트 검토」). 장면 랜덤이 시대 칸에서 「출시 당시」를 골라 ERA 줄(그 해 무렵 현실, 현대 기기 없음)이 미래풍과 부딪혔다. 시대는 이제 장면 랜덤에 넣지 않고, 시대 칸은 랜덤·잠금 단추 없는 고르기로만 둔다. prompt-random v=2, prompt-ui v=6.
- lib/prompt-spec.js — 분리형 선호(separates_preference)가 「강하게」 로 뽑혀 상하의를 나누라 했고, 「옷 칸이 우선」 만 있어 예시의 가운을 이겼다. 이제 옷 칸이나 장면 예시에 적힌 옷이 이긴다. prompt-spec v=17.
- tests/prompt-screen.cjs · tests/prompt-game.cjs — 시대 칸에 랜덤·잠금 단추가 없고 장면 랜덤을 돌려도 시대 그대로, 분리형 줄이 예시의 옷을 말한다.

## 2026-10-29 · claude · 일상컷 옷 — 첨부 그림을 따라가지 않게, 게임은 장신구·주변 사물로
- lib/prompt-spec.js — 일상컷 옷이 첨부 그림(폼)을 따라 비슷비슷했다(사용자). 올린 일상컷을 게임마다 모아 보니 창세기전 3(다섯 장 모두 흰 프릴 블라우스+붉은 치마)·드래곤 퀘스트(파랑·흰색)·마리오(빨강)·스타크래프트(파랑·남색)가 특히 그랬다. 까닭은 셋 — OUTPUT 이 게임을 「옷의 무늬·색 메아리」로 허락했고, 원본 반영 축(source_influence)이 balanced·strong 에서 「원본 색·무늬를 옷에」 넣으라 했고(마인크래프트 일상 strong 두 장이 녹색 블록 무늬 옷), WARDROBE 가 첨부 그림의 색은 막지 않았다. 이제 OUTPUT 은 게임을 장신구·주변 사물로만, WARDROBE 는 첨부 그림의 색·무늬·장식을 옷에 옮기지 말라, 원본 반영 축은 subtle 장신구 하나 / balanced 장신구 하나와 주변 사물 하나 / strong 장신구·소품 몇 가지(옷은 늘 그 장면의 옷), 일상컷 SIGNATURE 는 하나~둘을 장신구나 장면 속 사물로(옷에 찍거나 짜 넣지 않게), 게임 속 일상(섹시)의 옷도 그 세계 풍으로 짓지 않는다. prompt-spec v=16.
- tests/prompt-game.cjs — 옷에 게임 색·무늬를 넣으라는 말이 없고, 원본 반영 세 값이 장신구·사물을 말한다.
- IMAGE_RULES.md 2절 — 일상컷 줄.

## 2026-10-29 · claude · 일상컷 필수 갈래 — 레트로 빼고 게임 속 일상(섹시) 넣기
- lib/prompt-spec.js · lib/prompt-game.js — 새 갈래 「게임 속 일상 — 섹시」 `game_life_sensual`: 그 게임 세계 안에서 사는 섹시한 일상(아침 창가·노천탕·개울·장터·여관 카운터·지붕 일광욕·거울 앞 끈 묶기·해먹·따뜻한 비·난롯가 — 예시 열). 게임 속 장소처럼 설계표 place 한 줄(GAME PLACE)을 싣는다(PLACE_CATS). 알아볼 거리는 나와도 되고 캐릭터·괴물·화면 그래픽은 안 된다. prompt-spec v=15, prompt-game v=8.
- IMAGE_RULES.md 2절 — 필수 갈래: pkm 의 넷에서 레트로 글래머를 빼고 게임 속 일상(섹시)을 넣었다(사용자). 한 게임 일상컷 묶음에 성인 역할극·수영복·란제리풍·게임 속 일상(섹시) 중 하나는 한 장 이상.
- tests/prompt-game.cjs · tests/prompt-screen.cjs · docs/GAME_CONCEPT.md 7절 — 게임 갈래 다섯, 새 갈래의 장소 줄.

## 2026-10-29 · claude · 일상컷 고정값 — pkm 과 같게
- lib/prompt-ui.js · prompt.html — pkm 에서 일상컷에 필수로 정한 값(전체 강도 strong · 피부 노출 bold · 화면 비율 2:3)을 game 에도 적용했다(사용자). 일상 모드는 처음부터 이 값으로 고르고 셋 다 잠근다. 저장된 상태를 불러와도 비었으면 채우고 다시 잠근다(잠금은 장면 랜덤만 막는다). pkm 은 계획기가 채우지만 game 에는 계획기가 없어 생성기 기본값으로 넣었다. prompt-ui v=5.
- tests/prompt-screen.cjs — 처음과 장면 랜덤 다섯 번 뒤에도 세 값·잠김·지시문 줄이 그대로.
- IMAGE_RULES.md 2절 — 일상컷 고정값 표.

## 2026-10-28 · claude · 기기 줄 — 기기 폭 고정
- lib/arcade.css — 간판 글이 길면(「슈퍼 마리오 브라더스」) 기기가 넓어져 화면이 커지던 것을 폭 고정(width·min-width 0)과 화면 absolute 로 바로잡음

## 2026-10-28 · claude · 오락실 배경 — 공간(테마)마다 한 장
- lib/arcade.css — 배경이 공간을 따른다: 한낮의 오락실(arcade-sunlit)·심야 게임방(arcade-moonlit, 앞서 arcade.webp)·골목 문방구(arcade-hanok)·별장 거실(arcade-forest)·새벽 컴퓨터실(arcade-phosphor). 넷을 도트 공방의 그리기(images/generations 1536×1024)로 더 받아 그림 저장소 backgrounds/ 에, 기록 records/backgrounds/arcade-<테마>.json. 기기 줄·기기 몸통 색도 공간마다(--arcade-*). 사용자 「각 테마별로 배경도 바꿔줘」
- tests/arcade-screen.cjs — 공간 다섯의 배경 주소·기기 줄 색

## 2026-10-28 · claude · 첫 화면 — 오락실(book 의 서재처럼): 배경 그림의 바닥을 도트가 거닐고, 아래 기기 줄
- lib/arcade.js · lib/arcade.css — 오락실. 위는 배경 그림(그림 저장소 backgrounds/arcade.webp — 도트 공방과 같은 열쇠로 images/generations 1536×1024, 기록 records/backgrounds/arcade.json)의 융단 바닥을 도트 인물이 거니는 무대(좁으면 둘·넓으면 셋, 누르면 도감), 아래는 기기 줄 — 게임 한 편에 기기 하나(간판은 제목, 화면은 타이틀 썸네일, 없으면 「그림 준비 중」, 묶음 색), 누르면 도감. 사용자 「서재처럼 메인 화면 꾸며줘, 도트가 배경에서 돌아다니는 느낌」
- index.html — 머리말 → 오락실 → 첫 묶음 카드 차례. 바닥 띠는 오락실 안으로(DotFloor 가 lib/arcade.js 로). lib/img.js 를 싣는다, words ?v=6
- lib/words.js — home.arcade·home.arcade.scene·home.arcade.row·home.cabinet·home.cabinet.none, home.dot.floor·dex.dot.note 말 다듬음
- tests/arcade-screen.cjs — 무대·기기 줄·첫 묶음 그대로·누르면 도감·네 크기. tests/dot-screen.cjs — 기다림 5초 → 10초(한 번 흔들렸다)
- AGENTS.md — 화면 표·검사 목록

## 2026-10-28 · claude · 도트 둘 — 팩맨·데이브 더 다이브 4K
- data/sprites.json — pacman(팩맨)·dave_the_diver(데이브 더 다이브) 인물 칸(card = 게임 열쇠). 사용자 「게임공방 도트케릭 2명」 — 아홉 편 타이틀 그림 중 내가 고른 둘. book 의 4K 길(2160×3840 원본 격자 그대로 · 칸 192×256 · dot 0.5)로 뽑아 game-atelier-img 의 sprites/<id>/ 에 올렸다(원본 gen1, 기록 records/sprites/<id>/*_4k.json). 팩맨 걷기는 첫 요청이 안전 필터에 막혀 생김새 줄을 다듬어 다시 받았다(대기·반응 원본은 그대로 씀 — 기록 note). 첫 화면 바닥 띠·도감 상세·목록 표에 저절로 선다

## 2026-10-28 · claude · 도트 공방과 연결 — 재생기·인물 자료·바닥 띠·도감 도트 줄
- lib/sprite-actor.js · lib/sprite-actor.css — 공방 모음의 공용 도트 재생기 복사(글자 하나 다르지 않게). 사용자 「게임 공방도 도트 공방이랑 연결」
- data/sprites.json — 인물 자료(비어 있다). 도트 공방(dot.html 「게임」)의 「인물 칸 복사」가 주는 칸을 actors 에 넣는다, 그림은 game-atelier-img 의 sprites/<id>/
- index.html — 첫 묶음 아래 도트 바닥 띠(.home-dots): 도트 게임이 거닌다, 이름은 게임 제목, 누르면 그 게임의 도감. 인물이 없으면 띠째 없다
- dex.html — 도트 있는 게임은 목록 칸에 「도트」 표, 상세의 인격 아래 작은 무대 한 줄(카드 열쇠 = 게임 열쇠)
- lib/words.js — home.dot.* · dex.dot.*
- tests/sprite-actor-copy.cjs · tests/dot-screen.cjs · tests/fixtures/make-sprites.py — 복사본 검사, 도트 화면 검사(시험 자료)
- AGENTS.md — 화면 표·공용 모듈·검사 목록에 도트

## 2026-10-28 · claude · 삼국지 조조전 — 조조의 전직(군웅→군주→패왕)으로 다시 짜기
- data/game-design.json — 내가 쓴 조조전은 조조를 책사로 그렸고 적벽(조조가 진 싸움)을 명장면으로 넣었다(사용자가 고침). 이제 조조 중심: 레벨이 오르면 군웅→군주→패왕으로 전직하고, 다른 장수들의 병과 전직은 배경(병과마다 다른 깃발). 타이틀은 황건의 난의 초라한 군웅(낡은 무명 전포·작은 관), 중반은 관도대전의 군주(검은 옻칠 비늘 갑옷 — 개방은 오소 군량고 기습), 엔딩은 천하통일의 패왕(금실 용무늬 예복·면류관). 알아볼 거리·상징·능력·규칙·말·place 도 그에 맞췄다. 4막 무렵의 가상 시나리오(죽을 장수를 살리기 등)는 넣지 않았다(사용자 — 논외). 자세의 정한 말 fan_command 를 sword_command 로 바꿨다(부채는 조조가 아니다).
- lib/prompt-spec.js — sword_command 의 영어. prompt-spec v=14.
- docs/GAME_CONCEPT.md 6-2절 — 조조전 줄.

## 2026-10-28 · claude · 개방 컷 2분할 — 한 장만 그리게
- lib/prompt-spec.js · lib/prompt-game.js — 개방 컷이 닫힘·개방을 좌우로 나란히 그린 2분할로 나왔다(사용자). 「The pair must read as the same picture before and after」 가 두 장을 그려 견주라는 말로 읽혔다. OUTPUT 은 이제 「개방 상태만 보여 주는 단 한 장, 첨부 그림은 참고일 뿐 결과에 넣지 않는다, 인물·구도는 그대로 두고 환경·빛·효과만 바꾼다」 이고, 그 뒤에 FRAME 줄(세로 2:3 한 장, 닫힘 그림·전후 비교·딥티크·분할·나란히·콜라주·여러 칸·겹친 모습 금지 — 한 장·한 명·한 장면)을 싣는다. INPUT 은 첨부 그림이 닫힘 상태의 참고라고만 말하고, 얼굴용 둘째 첨부(첫 그림)는 뺐다. prompt-spec v=13, prompt-game v=7.
- tests/prompt-game.cjs — 개방에 한 장 줄·FRAME 줄이 있고 「The pair」·둘째 첨부가 없다.
- IMAGE_RULES.md 2절 — 개방 첨부는 그 폼 그림 한 장만.

## 2026-10-28 · claude · 창세기전 3 — 시반 슈미터의 사막 전쟁으로 다시 짜기
- data/game-design.json — 내가 쓴 창세기전 3 는 2편 느낌의 범용 판타지 마법 기사였다(사용자). 사용자가 준 설정대로 다시 짰다: 과거를 숨긴 사막 용병 지휘관, 복수·동료·형제애, 전장 자리 잡기·부대 지휘·전직·초필살기. 알아볼 거리 넷(시반 슈미터의 흰 두건·쌍검 / 장갑 마룡 아지다하카 — 그림자로만 / 투르 제국 황토색 요새·자비단 궁성 / 크림슨 크루세이더·철가면단의 진홍 군장·강철 가면). 폼은 사막 군영의 용병(돌파) → 자비단 궁성 성벽의 정예 지휘관(지원) → 파괴된 술탄궁의 비극적 전사(공격), 개방은 포위망 돌파의 모래폭풍·쌍검 궤적 / 불타는 자비단의 붉은 늑대 꼴 검기 / 형제의 최후 대결의 X자 검광. 실루엣은 운동형·두른 망토·모래 가죽·쌍검 자세·모래·진홍·검정, 얼굴 계통은 Middle Eastern. 정한 말 arcane_enamel·spell_sword·crimson_silver_violet 을 desert_wrap_leather·twin_blade_guard·sand_crimson_black 로 바꿨다.
- lib/prompt-spec.js — 바꾼 정한 말의 영어. prompt-spec v=12.
- docs/GAME_CONCEPT.md 6-2절 — 창세기전 3 줄.

## 2026-10-28 · claude · 원작 차림새·UI 모양 풀기
- lib/prompt-spec.js — UI 를 막은 까닭은 그림이 스크린샷처럼 되고 글자·숫자가 깨져 나오기 때문이었다. 그래서 글자 없는 UI 모양(무늬·소품으로)과 원작 인물의 차림새는 풀었다(사용자 — 얼굴·몸은 여전히 그녀 것). NOT ITS CHARACTERS 줄은 인물·괴물의 얼굴과 몸, 로고, 박스 아트, 실제 상표, 그림 위에 겹친 HUD, 읽히는 글자·숫자만 막는다. GEAR 줄의 「인물 차림은 아님」, CORE PLAY 의 「interface」 를 뺐다(HUD 로). prompt-spec v=11.
- data/game-design.json — avoid 에서 차림 금지(마리오 모자·멜빵, 링크 튜닉, 류·춘리 도복·치파오, 스티브 옷, 다크 소울 기사 갑옷, 주인공들의 차림)와 UI 금지(점수판·명령창·미니맵·게이지 …)를 뺐다. 인물 금지는 「얼굴」·「얼굴과 몸」 으로. 겹친 HUD·글자는 공통 줄이 막아 게임마다 적지 않는다. 가장 긴 프롬프트 891낱말(WoW 중반 장비 줄을 줄였다).
- IMAGE_RULES.md 1절 · AGENTS.md 1절 · docs/GAME_CONCEPT.md 1·7절 — 같은 내용.

## 2026-10-28 · claude · WoW — 두 진영 대립(중반)·화산 심장부(엔딩)
- data/game-design.json — WoW 가 얼라이언스로만 치우쳤다(사용자). 알아볼 거리에 호드 붉은·검은 문장과 화산 심장부를 넣고(엘윈 숲 마을은 뺐다), 중반 폼은 좌우가 다른 견갑(파랑·금 사자 / 붉은·검은 가시)·두 문장을 반씩 수놓은 겉옷으로 두 진영을 한 몸에, 배경은 두 진영 깃발이 마주 선 알터랙 계곡 같은 골짜기, 개방은 두 진영의 깃발·횃불이 맞서 타오르는 순간(눈). 엔딩은 화산 심장부 레이드 — 용암 동굴 배경, 1단계 티어 세트풍 장비, 개방은 용암 호수의 거대한 불의 그림자가 무너지는 순간(불씨). avoid 에 원작 우두머리(라그나로스 등)의 모습, place 도 고쳤다. 이미 올린 WoW 중반·엔딩 그림은 예전 설계 그대로다.

## 2026-10-28 · claude · 원작은 알아보게 — 알아볼 거리·원작풍 장비
- data/game-design.json — 원작 요소를 다 지우니 어느 게임인지 티가 안 났다(사용자, WoW 12장 — 「의상도 원작풍까지」). 게임마다 `signature`(팬이 바로 알아볼 소품·장소·색·진영 문장 셋~넷 — 물음표 블록·트라이포스·귀환석·늑대 메달 …), 폼마다 `homage`(그 게임의 직업·진영 장비 느낌 — WoW 성기사 티어 세트풍 견갑, 스타크래프트 해병풍 장갑 …)를 적었다. avoid 는 인물·괴물·인물 고유 차림·로고·UI·실제 상표만 남기고, 이제 그려도 되는 원작 물건(물음표 블록·트라이포스·나선 검 화톳불·늑대 메달·테트리스 성당·WoW 진영 문장·해병 갑옷)은 뺐다.
- lib/prompt-spec.js · lib/prompt-game.js — NOT ITS CHARACTERS 줄은 인물·괴물·그 차림·로고·UI 만 막고 원작 소품·장소·색·직업과 진영 장비는 알아봐도 된다고 쓴다. SUBJECT 의 「simplified … never exact icons」 를 뺐다. 폼·개방에 SIGNATURE 줄(STYLE 뒤), 폼에 GEAR 줄(그 폼의 homage, 인물 차림은 아님), 일상컷은 SIGNATURE 하나만 작게. prompt-spec v=10, prompt-game v=6.
- tools/game-design.py · tests/game-design.py — signature 셋~넷·겹침 없음, 폼마다 homage.
- tests/prompt-game.cjs — SIGNATURE·GEAR 줄, 개방엔 GEAR 없음, 일상컷엔 하나, 일반화 말이 남지 않음. 길이 한도 840 → 900(가장 긴 것 884).
- IMAGE_RULES.md 1절 · AGENTS.md 1절 · docs/GAME_CONCEPT.md 1·3·7절 — 「상징은 일반화」 를 「원작은 알아보게」 로.
- tests/dex-screen.cjs · tests/prompt-screen.cjs — 화면에 그리지 않을 것이 보이는지 보는 본보기 글을 테트리스의 새 avoid(TETRIS 로고)로.

## 2026-10-28 · claude · 일상컷 화면비 — FRAME 줄을 늘 싣기
- lib/prompt-spec.js · lib/prompt-game.js — 일상컷 지시문에 화면비가 빠졌다. book 에서 온 규칙이 2:3 이 아닐 때만 "Aspect ratio" 를 실어, 기본 2:3 에서는 비율 말이 하나도 없었다(사용자). 일상컷은 이제 OUTPUT 바로 뒤에 FRAME 줄(2:3 이면 "a vertical 2:3 (1024×1536)")을 늘 싣고, SCENE 에는 겹쳐 싣지 않는다. 폼은 그대로(card 줄이 2:3 을 말한다).
- prompt.html — prompt-spec v=9, prompt-game v=5.
- tests/prompt-game.cjs — 기본 2:3 과 다른 비율 넷의 FRAME 줄, SCENE 에 겹치지 않음.

## 2026-10-28 · claude · 사실 자료 도구 — 문서 주소로 찾기, 질의 사이 65초
- tools/fetch-games.py — find 는 영어 위키백과 문서 주소(「이름」·「이름 (video game)」)로 항목을 바로 집는다. 이름 검색은 전체를 훑어 끝나지 않았고, 다시 묻느라 질의가 쌓여 1분에 한 번 제한에 걸렸다. 문서 이름이 다르면 key=문서 이름, 이름 검색은 find --wide 로만. 질의 사이 쉼을 2초에서 GAP=65초로(첫 질의는 바로). 편수를 나눠 받지 않는다 — 제한은 질의 횟수로 센다(사용자).
- tests/fetch-games.py — 문서 주소 만들기(빈칸·첫 글자·' %27·& %26·ō 같은 글자는 %XX), --wide 질의, 가짜 시계로 질의 사이 쉼, 잘못 준 find 인자는 질의 전에 멈춤.
- AGENTS.md 3절 · docs/GAME_CONCEPT.md 2절 — 찾는 순서와 질의 예절.

## 2026-10-28 · claude · 둘째 묶음 10편 — 사용자가 좋아하는 게임
- data/game-design.json — 월드 오브 워크래프트·창세기전 3·삼국지 조조전·GTA V·리그 오브 레전드·위쳐 3·문명 V·히어로즈 3·데이브 더 다이브·대항해시대 4 의 해석 칸(인격·능력·폼·개방·실루엣·얼굴). 장르 넷(MMORPG·전략 RPG·오픈월드·MOBA), 재질·자세·색 정한 말 열 개씩. QID 는 영어 위키백과 문서로 골랐고 사실 칸은 fetch-games.py pull --from 이 채웠다(data/wikidata/). 이날 Python 으로 보낸 질의는 1000초씩 네 번 기다려도 429 라, 같은 질의 두 개(props·labels)를 curl 로 한 번씩 받아 저장해 두고 채웠다. 빈칸(창세기전 3 modes, 데이브 더 다이브 publisher, 대항해시대 4 개발사·배급사·modes·영어 위키)은 나중에 채운다.
- lib/prompt-spec.js · prompt.html — 새 장르·정한 말의 영어. 현대(modern) 시대 화풍 문장을 데이브 더 다이브처럼 깨끗한 고해상도 쪽으로. 버전 v=8.
- tests/game-design.py · tests/dex-screen.cjs — 게임 수를 10 으로 박지 않고 설계표에서 센다.
- docs/GAME_CONCEPT.md 6-2절 · AGENTS.md · docs/PORT_NOTES.md — 둘째 묶음 표, 편수 말 고침.

## 2026-10-28 · claude · 운영 방침 — 그림 모으기용, 결투 보류
- docs/GAME_CONCEPT.md 8절 · AGENTS.md — 게임화(결투)는 보류하고 그림 모으기용으로만 운영한다. 늘리기는 사용자가 좋아하는 게임 위주로, 장르·시대·권리사 섞기는 따지지 않는다. 설계표 검사는 그대로(사용자).

## 2026-10-28 · claude · 정할 것 — 권리사·이름 확정, 나머지 미룸
- docs/GAME_CONCEPT.md 9절 — 첫 묶음 권리사는 그대로, 이름은 게임 공방(화면 이름 「게임의 공방」 그대로), Wikidata 빈칸은 나중에, 장르 상성은 보류, 안 쓴 머리 말 voluminous 는 다음 묶음에서(사용자).

## 2026-10-28 · claude · 그림 등록 자동화 — book 에서 옮기기
- tools/register-images.py · tools/roster.py — 그림 저장소의 img/ 파일 이름을 읽어 data/img.json 에 적는다(등록한 날 added, 틀린 이름이 하나라도 있으면 저장하지 않고 실패). 지금까지는 그림마다 손으로 적었다.
- tools/make-thumbs.py — book 의 썸네일 도구(--redo)에 pkm 의 열리지 않는 원본 건너뛰기(나머지는 만들고 2 로 끝남)를 더했다.
- .github/workflows/register-images.yml — 그림 저장소가 깨우면(repository_dispatch), 매시 23분, Run workflow 로 등록하고 되커밋한다. 검사(img-shards·register-images)가 깨지면 커밋하지 않는다.
- game-atelier-img/.github/workflows/thumbs.yml — img/*.webp 를 올리면 썸네일을 만들어 되커밋하고 코드 저장소를 깨운다(CODE_REPO_TOKEN 이 있을 때). 열리지 않는 그림이 있어도 나머지는 되커밋하고 실행을 빨갛게 남긴다.
- tests/register-images.py · tests/make-thumbs.py · tests/img-shards.cjs — book·pkm 의 같은 검사를 게임 말로.
- data/img.json — 등록기가 다시 썼다. 내용(img·added)은 손으로 적은 것과 같고 줄 모양과 count 만 바뀌었다.
- .gitignore — `img/` 를 `/img` 로(등록기가 잇는 자리, 검사가 본다).
- IMAGE_RULES.md 4절 · AGENTS.md · docs/PORT_NOTES.md · docs/GAME_CONCEPT.md — 등록은 올리면 자동, 손으로 고치지 않는다. 만드는 순서의 "여기까지" 를 서가 단계로.

## 2026-10-27 · claude · 헤어스타일 — 여성 머리 여섯 더하기
- lib/prompt-spec.js — 생성기 헤어스타일에 아프로 · 아프로 퍼프 · 박스 브레이드 · 콘로 · 피시테일 땋기 · 비치 웨이브를 더했다(라벨·설명·견본 그림 수치). pkm 과 같은 말이다 — 아프로·브레이드 계열이 표에 없었다(사용자). prompt.html 판 올림.

## 2026-10-27 · claude · 슈퍼 마리오 브라더스 첫 그림 11장 등록
- data/img.json — 슈퍼 마리오 브라더스 폼 셋(타이틀·중반·엔딩)·개방 셋·일상컷 다섯을 손으로 적었다. 엔딩은 새 자세(한 손으로 깃대, 다른 손은 흔들기)로 만든 것. 등록한 날은 added 에. 그림은 game-atelier-img 의 img/ · img/thumb/, 기록 records/super_mario_bros/<자리>-import.json(원본 PNG 는 올리지 않고 sha256 만).
- 검토에서 본 것 — 타이틀·타이틀 개방·중반 개방의 빨강 바탕 흰 점 버섯(얼굴 없음, 원작 슈퍼 버섯 모양에 가깝다), 타이틀 뒤 언덕의 작은 검은 점, 일상컷 4 현수막의 흐린 만화풍 얼굴. 사용자가 다 올리기로 했고 기록의 review 에 적었다.

## 2026-10-27 · claude · 가벼운 조깅 — 자세에서 빼고 액티브 갈래 예시로
- lib/prompt-spec.js — 자세 「가벼운 조깅」(small_jog)을 뺐다. 자세로 고르면 어느 갈래에서든 옷까지 조깅복으로 바뀌었다(사용자). 대신 일상 갈래 「액티브 / 무브먼트 패션」에 예시 「가벼운 아침 조깅」(light_jog — 공원 길을 러닝웨어 차림으로 가볍게 뛴다)을 더했다. 조깅복은 그 갈래에서만 나온다. 옛 기록의 small_jog 값은 그대로 둔다(읽기만 한다). prompt.html 판 올림.

## 2026-10-27 · claude · 가벼운 조깅 자세 — 옷차림은 그대로
- lib/prompt-spec.js — 자세 「가벼운 조깅」 영어 문장 "Jog lightly with compact arm movement and a believable running step." 이 의상까지 조깅복으로 바꿨다(사용자). "Move at a light, quick jog … ; her outfit stays exactly as described." 로 — 금지어 대신 옷은 고른 그대로라고 적는다. 한국어 설명도 맞췄다. 걷기·스트레칭·댄스 스텝 문장에는 운동복을 부르는 말이 없어 그대로. prompt.html 판 올림.

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
