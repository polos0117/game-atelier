# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "6. 고쳤으면 적는다" 에 있다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-10-26` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 읽히지 않는다. `node tests/patch.cjs` 가 모양을 본다.





## 2026-10-30 · claude · 일상컷 버전2 넓히기 시범 결과
- docs/CASUAL_TREE_V2.md — 7-3-1: 메탈 기어 솔리드 일상컷 6~12(제안 여섯 + 윙크), 칸마다 결과와 원인 · 다시 그린 7 · 11(그림 저장소 60362fb)

## 2026-10-30 · claude · 일상컷 버전2 — 넓히기 시범에서 어긋난 셋(뒤 3/4 얼굴 · 발목 교차 · 노트 문장)
- data/casual-tree-v2.json — 몸 「뒤 3/4」 에 turned_face(머리가 몸을 따르면 얼굴도 돌아가 볼선 · 옆선만). 다리 「발목 교차」 영어를 「한쪽 발목을 다른 발목 위에」 로 또렷이. 소품 노트 영어를 「a notebook」, 동작을 「writes in {prop} with a pen」(「writes in a notebook and a pen」 이 됐다). 시범 7(뒤 3/4 를 앞 3/4 로) · 11(발목 교차를 안 했다), 사용자 결정으로 고치고 두 장을 다시 그린다
- lib/prompt-game.js — 몸의 turned_face 를 COMPOSITION 몸 줄에 · prompt.html — prompt-game v=24
- tools/casual-tree-v2.py — turned_face 도 영어 칸 검사 · tests/prompt-game.cjs — 뒤 3/4 얼굴, 어깨 너머면 없음, 침대칸 노트 · 발목

## 2026-10-30 · claude · 랑그릿사 II · 카트라이더 다시 넣기, 버전2 표 겹친 자세
- data/game-design.json — 잠시 뺀 두 편을 games 에 되돌려 넣었다(35편). 폼 지시문 충돌 0
- data/wikidata/langrisser_2.json · data/wikidata/kartrider.json — 사실 칸(Q665393 · Q488178, Wikidata 장애가 풀려 받았다)
- docs/GAME_CONCEPT.md — 6-4 를 10편으로, 표에 두 줄 · docs/held/kartrider-langrisser_2.json — 지웠다(설계표로 돌아갔다)
- data/casual-tree-v2.json — 컵 감싸기 · 카메라 화면 보기 · 꽃다발 안기의 자세 목록에 sit_lean · lean_counter 가 두 번 있었다
- tools/casual-tree-v2.py — 목록 칸에 같은 값이 두 번 있으면 걸린다 · tests/casual-tree-v2.py — 그 사례

## 2026-10-30 · claude · 일상컷 버전2 넓히기 — 소품 · 작업대 · 자세 · 의상 · 장소 · 날씨 · 안경
- data/casual-tree-v2.json — 받침 worktable, 새 소품 아홉(휴대용 게임기 since 1989, 아케이드 조작반 fixed), 소품 동작 열여섯(needs_any), 자세 lean_counter · sit_lean, 다리 ankles_crossed, 손 glasses_adjust, 새 장소 여덟(extra_places), 날씨 일곱 · 날씨 ⚠, 추천 다섯(사용자 — 검토 제안 그대로)
- data/casual-tree.json — 의상 여덟(제빵사 · 꽃집 · 정비 · 터틀넥 조끼 · 플리스 · 스키 · 턱시도 캐미 · 90년대 트랙)
- tools/casual-tree-v2.py — extra_places · weather · since · needs_any · 안경(ACCESSORY) 검사, 추천 장소에 소품 동작 받침
- lib/casual-tree-v2.js — 칸 weather, allPlaces, 소품 since, 동작 받침, 안경 특징, weatherAwkward · tools/casual-plan.cjs — 새 장소 이름
- lib/prompt-game.js — Weather / season 줄, 안경을 옷 줄에 · lib/prompt-ui.js — 날씨 칸(AUTO · ⚠), 안경 켬끔, 새 장소 · lib/prompt-random.js — 날씨 · lib/words.js — 그 말
- prompt.html — prompt-ui v=16 · words v=13 · casual-tree-v2 v=6 · prompt-game v=23 · prompt-random v=8
- tests/casual-tree-v2.cjs · tests/casual-tree-v2.py · tests/prompt-game.cjs · tests/prompt-screen.cjs — 넓힌 칸 · docs/CASUAL_TREE_V2.md — 7-3

## 2026-10-30 · claude · 표정 「윙크」
- lib/prompt-spec.js — 표정 wink(윙크) — 한쪽 눈을 감고 다른 눈은 또렷이, 입꼬리 하나를 올린 작은 미소(사용자). prompt-spec v=41
- data/casual-tree-v2.json — 버전2 표정 표에도(눈썹 · 눈꺼풀 · 입만)

## 2026-10-30 · claude · 일상컷 버전2 — 표정 칸을 시선 밑으로, 뒤 3/4 에서도 표정
- lib/prompt-ui.js — 표정 칸을 버전2 칸 안 시선 바로 밑으로(맨 아래에 있어 안 보였다, 사용자). 꺼지는 것은 몸 「뒤」 + 고개 그대로일 때만
- data/casual-tree-v2.json — 몸 「뒤」 에 face_hidden. 뒤 3/4 는 옆얼굴이 보여 표정을 고른다(사용자). 카메라 응시는 그대로 — 뒤 · 뒤 3/4 는 고개를 돌려야
- lib/prompt-game.js · tools/casual-plan.cjs — 표정을 빼는 조건을 face_hidden 으로 · lib/words.js — 꺼진 까닭 말
- prompt.html — prompt-ui v=15 · words v=12 · prompt-game v=22
- tests/prompt-game.cjs · tests/prompt-screen.cjs — 뒤 3/4 는 표정, 뒤는 없음, 표정 칸 자리

## 2026-10-30 · claude · 일상컷 버전2 — 손 칸 AUTO · 자연스럽게 · 트리 밖 고르기(해방)
- lib/casual-tree-v2.js — 오른손 · 왼손은 꼭 있어야 하는 칸이 아니다(비우면 AUTO). 두 손 자세는 한쪽만 골라도 다른 쪽이 따라온다. 손 「자연스럽게」(zone any). 해방 칸은 고치지 않고, 그 때문에 꼭 있어야 하는 뒤 칸이 비면 장소 받침만 빼고 골라 따라 해방(unlockedAuto — 매번 새로 정한다). candidates 를 밖에 내놓는다(화면의 트리 밖 목록)
- data/casual-tree-v2.json — 손 natural · tools/casual-tree-v2.py — zone any
- lib/prompt-ui.js — 손 칸 맨 앞 「AUTO — 이 손은 지시문에 싣지 않는다」(다른 손이 두 손 자세면 그 값만), 「🔓 해방」 칸 — 켜면 칸마다 트리 밖 값과 까닭, 고른 칸은 「🔓 트리 밖에서 고른 칸」 으로 표시. lib/words.js — 그 말과 까닭 스물셋
- lib/prompt-game.js — 비운 손은 줄을 싣지 않는다, unlockedAuto 를 넘긴다
- prompt.html — casual-tree-v2 v=5 · prompt-game v=21 · prompt-ui v=14 · words v=11
- tests — AUTO · 자연스럽게 · 왼손 두 손 자세 · 해방(거실 헤엄 → 물 받침도 따라 해방, 되돌리면 풀림), 화면 시험
- docs/CASUAL_TREE_V2.md — 7-1-1

## 2026-10-30 · claude · 일상컷 트리 버전2 6단계 — 메탈 기어 솔리드 시범 다섯 장과 그 결과로 고친 것
- (그림 저장소) 메탈 기어 솔리드 타이틀(A · B 중 사용자가 B) + 일상컷 시범 다섯 — 시범 표대로 칸을 정해 버전2 로 그렸다, 사용자가 다 그대로
- data/casual-tree-v2.json — 시선 「소품을 들여다봄」(into_prop — 망원경 · 카메라. 「든 것을 바라본다」 에 망원경 옆을 봤다), 머리 「옆으로 돌림」 은 몸 옆모습과 같이 못 고른다(not_bodies — 카메라 쪽으로 몸까지 돌았다), 몸 옆모습 profile_face. 몸 옆모습 + 머리 옆으로 돌림이던 추천 일곱은 머리 「몸과 같이」, 두 손 소품 추천 둘의 시선은 비웠다(동작이 정한다)
- lib/casual-tree-v2.js · tools/casual-tree-v2.py — 그 규칙(같은 것)
- lib/prompt-game.js — 몸 옆모습 + 머리 그대로면 COMPOSITION 에 「얼굴도 옆모습, 카메라 쪽이 아니다」(카메라를 보면 「눈만 카메라로」)
- lib/prompt-spec.js — 가까운 컷의 피부 노출(많이) 풀이 「목선 노출」 → 「어깨 · 쇄골, CROP 이 정한 자리에서 컷이 내려가지 않는다」(클로즈업 · 가슴 위가 가슴 · 허리까지 넓어졌다). 버전1 일상컷에도 같다
- prompt.html — prompt-spec v=40 · prompt-game v=20 · casual-tree-v2 v=3
- tests — 고정 사례(옆모습 + 옆으로 돌림, 망원경 시선, 잔은 들여다보지 않는다, 옆모습 얼굴 말, 클로즈업 노출 말)
- docs/CASUAL_TREE_V2.md — 7-2 시범 결과 표

## 2026-10-30 · claude · 일상컷 트리 버전2 5단계 — 묶음 계획기 --v2
- tools/casual-plan.cjs — `--v2`: 시대 · 장소 · 의상을 고르고 몸 쪽은 그 장소에서 그대로 쓸 수 있는 자세 추천 하나로(소품 동작은 다시 검사가 고른다). 규칙: 장소 · 장소 묶음 · 의상 계열 · 시대 · 필수 갈래는 버전1 그대로, 자세 추천 · 프레이밍은 서로 다르게(먼 · 가까운 컷 하나씩), 몸 방향 두 번까지, 머리 어깨 너머 한 장, 소품은 칸마다 다르게, 알아볼 거리 소품 한두 장(들 것이 있는 게임만), ⚠ 한 장. 통째로 뽑아 거르니 다섯 장에 수만 번이라 — 프레이밍을 먼저 나누고 한 장씩 쌓는다. `--check` 는 기록이 버전2 면 버전2 규칙(버전1 컷과 섞이면 둘 다 가진 칸끼리). 기록은 생성기 버전2 상태 꼴(treeV 2), plan.json 에 tree 2. 알아볼 거리 줄의 칸마다 다르게 · 프레이밍은 칸이 가짓수보다 많으면 두 번까지(버전1 과 같게)
- data/casual-tree-v2.json — 소품 동작 추천의 이름에서 물건을 뺐다(「잔을 입에 댄 클로즈업」 에 알아볼 거리가 들렸다 — 추천은 꼴만 정하고 소품은 장소가 채운다): 소품을 얼굴 가까이 든 클로즈업 · 카운터에서 소품 보기 · 두 손으로 소품 쓰기 · 옆모습으로 앉아 두 손으로 소품 쓰기 · 선베드에 누워 소품 들기. 열쇠는 그대로
- tools/casual-compose.py — 버전2 장면은 몸 방향(두 번까지) · 머리 어깨 너머(한 장) · 자세 추천(서로 다르게)으로 보고 렌즈는 안 본다(자동). 섞인 묶음은 프레이밍만 다 같이
- tests/casual-plan.cjs — 서른세 편 × 씨앗 셋 버전2 묶음: 규칙 · 트리 위 · 기록 · 지시문, 버전1 다섯 장 위에 버전2 세 장, 규칙 검사, 기록 읽기. tests/casual-plan-screen.cjs — 버전2 기록을 생성기에 넣으면 같은 지시문 · 같은 칸. tests/casual-compose.py — 버전2 · 섞인 묶음
- docs/CASUAL_TREE_V2.md · AGENTS.md — 계획기 규칙 · 명령

## 2026-10-30 · claude · 일상컷 트리 버전2 4단계 — 생성기 화면 + 검토 반영
- lib/prompt-ui.js — 일상 갈래: 새 장면 · 버전2 기록은 버전2 칸(시대 → 장소 → 의상 ⚠ → 자세 추천 → 몸 자세 · 받침 → 프레이밍 · 몸 방향 · 머리 · 카메라 높이 → 오른손 · 왼손 → 소품 동작 → 다리 → 시선, 렌즈는 자동 표시). 다리 칸은 다리가 보이는 컷만, 소품 동작 칸은 소품을 쓰는 손이 있을 때만. 맞지 않는 칸이 남으면 경고하고 복사를 막는다, 추가 연출 글의 손 · 소품 말은 경고만. 옷 직접 쓰기면 주머니 · 어깨끈 · 옷깃 표시 칸. 얼굴이 안 보이면 표정 칸이 꺼진다. 버전1 기록(하는 일 · 자세 · 방향)은 버전1 그대로 열고 「버전2로 다시 고르기」
- lib/prompt-random.js — 버전2 장면 랜덤(칸 하나는 set 으로 뒤 칸을 고치고, 다 뽑기는 자세 추천 하나 + 표정 · 알아볼 거리 · 축)
- lib/casual-tree-v2.js — 검토 반영: 받침의 손(hands), 손 자세의 공간(space — 입술에 검지 + 잔을 입에 X), 다리의 자세(postures), 등 돌림 + 머리 그대로면 카메라 응시 X, 옷 직접 쓰기면 표시한 특징만(sceneFeatures), 알아볼 거리는 들 수 있는 것만(signatureHold). set 뒤에 추천 표시를 다시 본다
- data/casual-tree-v2.json — 물 셋(shallow_water · water · deep_water — 족욕탕에서 헤엄 · 몸 담그기 X), 다리 postures, 엎드림 받침 hands, 입술에 검지 space, 두 손 턱 괴기는 엎드려서만, 버전2 표정 표(expressions — 눈썹 · 눈꺼풀 · 입 · 볼만)
- data/game-design.json · docs/held/kartrider-langrisser_2.json — 손에 들 수 있는 알아볼 거리 번호(signature_hold). 장소 · 풍경 · 건물 · 「농구공과 골대」 · 「벽에 꽂힌 횃불」 은 넣지 않았다. 들 것이 없는 게임 8편(스트리트 파이터 II · 심시티 · 창세기전 3 · 조조전 · 히어로즈 3 · 워크래프트 III · 스타듀 밸리 · 프리스타일)
- tools/game-design.py — signature_hold 검사
- lib/prompt-game.js · lib/prompt-spec.js — 버전2 돌아보기 줄(눈은 GAZE 가)은 등이 카메라 쪽 + 머리 어깨 너머일 때만, 표정은 버전2 표 · 얼굴이 안 보이면 싣지 않는다, 소품 알아볼 거리는 들 수 있는 것
- tools/casual-tree-v2.py · tests — 같은 규칙과 고정 사례(무릎 꿇기 + 책상다리, 족욕탕 + 평영, 엎드림 + 머리 뒤 손, 입술에 검지 + 잔, 등 돌림 + 카메라 응시, 멀어지며 걷기, 블루 홀, 당황 표정, 주머니 없는 드레스). tests/prompt-screen.cjs 일상 갈래를 버전2 로 다시 썼다(없어야 할 칸을 핸들로 견주면 실패 글을 만들며 메모리를 다 썼다 — 참 · 거짓으로 견준다)
- prompt.html — casual-tree-v2 v=2 · prompt-spec v=39 · prompt-game v=19 · prompt-random v=7 · prompt-ui v=13 · words v=10
- docs/CASUAL_TREE_V2.md — 7-1 검토 반영 표 · 4단계 · docs/GAME_CONCEPT.md — signature_hold · AGENTS.md

## 2026-10-30 · claude · 지시문 길이 상한 900 → 1200 낱말
- tests/prompt-game.cjs — 상한 하나(LIMIT 1200)로 폼 · 일상컷(버전1 720 이던 것도) · 버전2 를 본다. 가장 긴 표정 · 축 다섯 · 모티프를 다 얹은 버전2 일상컷도 33편 × 추천 43 전부 본다. 그 꼴의 클로즈업이 버전1 1006 · 버전2 1018 로 900 을 넘었다 — 사용자 결정으로 늘렸다
- docs/CASUAL_TREE_V2.md — 5절 상한 · 7절 검사 칸 · 8절에서 정할 것을 지웠다
- lib/prompt-game.js — 주석의 900 낱말

## 2026-10-30 · claude · 일상컷 트리 버전2 3단계 — 지시문 줄
- lib/prompt-game.js — 장면이 버전2(treeV 2)이고 표 tree2 가 오면 버전2 로 조립: SCENE 에 POSTURE · SUPPORT · COMPOSITION(프레이밍 · 몸 · 머리 · 카메라) · 렌즈 자동 · RIGHT HAND · LEFT HAND(또는 BOTH HANDS) · PROP(손과 소품은 이 줄에서만, 두 손이면 손마다) · LEGS(다리가 보이는 컷만) · GAZE · EXPRESSION(표정 문장의 시선 말을 뗀다). 하는 일 · HAND TASK 줄은 없다. 알아볼 거리를 소품으로 들면 SIGNATURE 줄 대신 PROP. LOOK-BACK 은 몸이 뒤쪽일 때만. 버전1 기록은 버전1 그대로
- lib/prompt-spec.js — 버전2 줄(OUTPUT · FRAME · CROP · BODY 「본인 기준 좌우」 · HANDS · 손 · 소품)
- lib/casual-tree-v2.js — 장면 표시 tree:2 → treeV:2(생성기가 넘기는 표 tree 와 겹쳤다), 버전1 기록을 옮길 때 추가 연출 · 축 · 알아볼 거리는 남기고 버전1 camera(자유 글) · preset 은 버린다
- data/casual-tree-v2.json — 프레이밍마다 짧은 COMPOSITION 말(en), 검사기가 본다
- prompt.html — prompt-spec v=38 · prompt-game v=18
- tests/prompt-game.cjs — 33편 × 추천 43 = 1419개: 버전1 줄 없음 · 손 줄 · 소품 · 다리 · 카메라 응시는 고른 때만 · 뒤돌아보기 · 가까운 컷 CROP · 따옴표 밖 영어 · 900 낱말(가장 긴 것 858), 표정 시선 말, 버전1 기록은 버전1 줄
- docs/CASUAL_TREE_V2.md — 5절을 실제 줄에 맞췄다, 900 낱말을 넘는 경우(가장 긴 표정 · 축을 다 얹은 클로즈업 — 버전1 도 넘는다)를 정할 것에

## 2026-10-30 · claude · 일상컷 트리 버전2 2단계 — 거르기 모듈
- lib/casual-tree-v2.js — 칸마다 고를 거리(choices)와 못 고르는 까닭(why), 다시 검사(repair), 칸 바꾸기(set — 두 손 자세는 다른 손도 같은 값, 두 손 소품 동작에서 한 손을 풀면 남은 손은 한 손 동작), 자세 추천(쓸 수 있는 추천만), 랜덤(잠금 · 씨앗), 버전1 기록 알아보기 · 옮기기. 장소 받침 · 보이는 부위 · 자세 계열 · 옷 특징 · 시대 소품 · 시선이 거른다. 프레이밍은 넓혀 맞추지 않고 손 · 다리 칸을 고친다. 아직 화면 · 조립은 버전1(3 · 4단계에서 붙인다)
- data/casual-tree-v2.json — 예전 기록 변환 표(legacy): 버전1 하는 일 · 자세 계열 · 자세 · 방향 → 몸 자세 · 받침 · 다리 · 손 · 몸 방향 · 머리 · 카메라 · 시선
- tools/casual-tree-v2.py — 변환 표 검사, places-all(추천마다 쓸 수 있는 장소 JSON)
- tests/casual-tree-v2.cjs — 모듈과 검사기가 추천 × 장소 4257 쌍에서 같은 답, 랜덤 2000 · 아무 칸 바꾸기 1500 뒤 걸리는 칸 없음, 넓히지 않기 · 두 손 · 받침 · 옷 특징 · 시선 · 해방 칸 · 버전1 기록
- docs/CASUAL_TREE_V2.md · AGENTS.md — 모듈 · 시험

## 2026-10-30 · claude · 일상컷 트리 버전2 1단계 — 표와 검사기
- data/casual-tree-v2.json — 새 표(버전1 표는 그대로). 장소 99곳의 받침(의자·턱·바닥·눕는 자리·벽·허리 높이 난간·탁자·물), 프레이밍마다 보이는 부위·다리·발, 렌즈 자동, 몸 방향·머리 방향·카메라 높이·시선 칸, 받침 8·몸 자세 14·손 자세 28·다리 18·소품 26·소품 동작 42(손 점유는 동작에 — 두 손이면 손마다 하는 일), 의상 특징(주머니·끈·옷깃), 어색한 조합 6, 자세 추천 43(칸만 채우고 지시문 문장은 없다)
- tools/casual-tree-v2.py — 검사기: 열쇠·가리키는 값, 영어 칸 한글, 소품 동작은 동작 하나, 추천마다 두 손 칸·보이는 손 자리(아니면 가까운 컷의 화면 밖)·다리가 보이는 컷·자세 계열·받침·가까운 컷의 뒤쪽 몸 방향, 다 되는 장소가 하나 이상. 처음 돌렸을 때 걸린 추천 둘(물에 담그고 머리 넘기기 — 가슴 위에 허리 높이 손, 무릎 꿇고 두 손 모으기 — 3/4 컷에 발 동작)은 허리 위 컷·무릎 모으기로 고쳤다
- tests/casual-tree-v2.py — 실제 표가 통과하고, 규칙마다 표를 바꾸면 걸린다
- docs/CASUAL_TREE_V2.md — 검토 반영(받침은 손을 차지하지 않고 손 칸이 정한다, 컷을 넓히지 않기 · 받침 줄은 안 보여도 남기기 · 자유문장은 경고만) 뒤 표와 칸 이름을 맞췄다(소품 동작 꼴 hold · raise · both, 보이는 부위, 소품의 장소는 소품 쪽에)
- AGENTS.md — 검사 명령에 버전2 표

## 2026-10-30 · claude · 일상컷 트리 버전2 설계 문서
- docs/CASUAL_TREE_V2.md — 하는 일을 없애고 시대 → 장소(시대가 거름) → 의상(자유·⚠) → 구도(렌즈 자동) → 오른손·왼손 → 소품·쓰는 동작 → 다리 → 표정. 추천은 몸 쪽(구도·손·다리)만. 사용자와 정한 것, game 에서 먼저
- AGENTS.md — 문서 표에 이 문서

## 2026-10-30 · claude · 두 손에 일이 하나씩이면 왼손·오른손을 적는다
- IMAGE_RULES.md — 2절 칸끼리 규칙: 가슴 위·클로즈업에서 두 손이 다 일하면 추가 연출 요청에 오른손·왼손을 갈라 적는다(하스스톤 일상5에서 손이 둘 다 오른손으로 나왔다, 사용자)

## 2026-10-29 · claude · 넷째 묶음 8편 — 하스스톤·프리스타일·파이널 판타지 VII·크로노 트리거·메이플스토리·바이오하자드 2·페르소나 5·메탈 기어 솔리드
- data/game-design.json — 스타듀 밸리 중반 자세 「한 손으로 쥔 곡괭이 자루를 어깨에 곧게 걸치고 …」(곡괭이 자루가 손 아래에서 꺾였다). 여덟 편의 해석 칸(인격·한마디·능력·폼·개방·실루엣·얼굴·알아볼 거리·그리지 않을 것). 사용자가 셋을 정하고 일곱은 없는 갈래로 골랐다. 사용자가 정한 파랜드 택틱스 3 은 Wikidata 에 항목이 없어 사용자 결정으로 랑그릿사 II 로 바꿨다(첫 작품은 시리즈 항목만 있다). 랑그릿사 II·카트라이더는 Wikidata 장애(1분에 한 번)로 사실 칸을 못 받아 사용자 결정으로 잠시 뺐다 — 설계는 docs/GAME_CONCEPT.md 6-4 에 두고 받으면 다시 넣는다. 장르 다섯(카드·스포츠·레이싱·호러·잠입)을 묶음에 더했다. 폼 지시문 충돌 0, 가장 긴 지시문 900 낱말 안
- lib/prompt-spec.js — 새 장르 다섯과 재질·자세·색 서른 낱말의 영어
- prompt.html — prompt-spec v=37
- docs/GAME_CONCEPT.md — 6-4 넷째 묶음 표, 5절 묶음 표에 새 장르
- docs/held/kartrider-langrisser_2.json — 잠시 뺀 두 편의 설계표 항목(QID 까지 적혀 있다)

## 2026-10-29 · claude · 헤엄치기 문장·컷 · 리니지 중반 자세
- data/casual-tree.json — 하는 일 swim 의 en 「swimming through the water mid-stroke」 → 「swimming breaststroke, her head and shoulders above the water」, not_frames 에 three_quarter 를 더했다. game 리니지 일상4 가 두 번 다 물속에 앉아 기댔다 — 무릎까지 담는 3/4 컷이 수평으로 누운 헤엄과 부딪혀 몸을 세웠다
- data/game-design.json — 리니지 중반 자세 「칼날을 눈높이로 들어 숨죽여 바라보는」 → 「칼날을 얼굴 앞에 세워 들고 눈길을 칼날에 둔」. 칼을 머리 위로 들고 카메라를 봤다

## 2026-10-29 · claude · 하는 일 「화장대 앞 치장」 문장을 동작 하나로 · 워크래프트 III 엔딩 자세
- data/casual-tree.json — makeup 의 en 「putting on earrings and makeup」 → 「fastening one earring」. 두 동작이라 두 손을 다 얼굴로 올리다 클로즈업(어깨 아래 안 보임)에서 팔이 가슴 사이로 튀어나왔다(워크래프트 III 일상4, 사용자)
- data/game-design.json — 워크래프트 III 엔딩 자세 「위를 올려다보는」 → 「고개를 돌려 꼭대기를 올려다보는」. 엔딩의 약간 높은 카메라와 겹쳐 시선이 카메라로 왔다

## 2026-10-29 · claude · 첫 그림 두 장은 사람이 고른다
- IMAGE_RULES.md — 2절: 타이틀 A·B 를 보여 주고 어느 쪽으로 갈지 물은 뒤 나머지를 그린다(사용자, 디아블로 II 에서 내가 A 를 골라 바로 이어 그렸다)

## 2026-10-29 · claude · 셋째 묶음 5편 — 디아블로 II·워크래프트 III·리니지·스타듀 밸리·영웅전설: 섬의 궤적
- data/game-design.json — 다섯 편의 해석 칸(인격·한마디·능력·폼·개방·실루엣·얼굴·알아볼 거리·그리지 않을 것)과 facts(tools/fetch-games.py — QID: 디아블로 II Q244033 · 워크래프트 III Q207948 · 리니지 Q489800(1998 원작, Q436660 은 게임이 아니다) · 스타듀 밸리 Q23013817 · 섬의 궤적 Q966698, find 후보 가운데 영어 위키백과 문서가 그 게임인 것). 사용자가 후보 열다섯에서 넷을 고르고 섬의 궤적을 더했다.
  재질·자세·색은 게임마다 새 정한 말(hellforged_leather·frostrune_plate·pledge_damask·gingham_denim·academy_wool / rune_socket·hammer_rally·enchant_gaze·watering_sprout·orbment_link / blood_crimson_bone·frost_blue_gold·aden_crimson_silver·harvest_green_gold·academy_crimson_gold). 워크래프트 III 은 월드 오브 워크래프트와 시리즈 자매(서로 series, 얼굴 윤곽 square_soft).
  폼 지시문 충돌 후보 0 — 복식 구조와 타이틀 차림(워크래프트 III 사슬 갑옷 조끼·리니지 겹옷), 자세가 개방 사건을 먼저 하는 것(스타듀 밸리 중반·섬의 궤적 타이틀), 차림·자세의 등불을 고쳤고, 알아볼 거리↔개방이 같은 소품을 말하는 것은 conflicts_ok. 가장 긴 지시문이 900 낱말을 넘어(섬의 궤적 타이틀 913) 알아볼 거리·그리지 않을 것을 줄였다.
- lib/prompt-spec.js — 새 정한 말의 영어(VOCAB_EN). prompt.html prompt-spec v=36.
- docs/GAME_CONCEPT.md — 6-3절 셋째 묶음 표.

## 2026-10-29 · claude · 일상컷 트리 모듈 — 공방마다의 규칙 칸(pkm 몫), 잠근 칸을 지키는 랜덤
- lib/casual-tree.js · tools/casual-tree.py — 트리 표마다의 규칙 칸 넷을 더했다(pkm 일상컷 트리, 2026-10-29): 안 쓰는 값 `banned`(방향·프레이밍 — 메뉴·랜덤·고치기에서 빠진다), 프레이밍 규칙 `not_required`(필수 갈래 컷엔 안 씀 — frameOk 에 장면을 주면 본다), 동료 자세 `companion`(동료가 있는 하는 일에서만), 세대의 해 `gen_years`(year(tree, 대상) — 카드의 gen). 이 표엔 그 칸이 없어 지금과 같다. 동료 묶음 companion() 을 더했다. 검사기는 새 칸을 본다.
- lib/prompt-random.js — 일상컷 랜덤은 잠근 칸이 살아남는 값만 뽑는다(시대를 뽑았는데 잠근 장소가 그 시대에 없으면 다른 시대 — 전에는 잠근 장소가 풀렸다). 세부 축을 뽑아도 추천 조합 표시를 안 지운다. prompt.html casual-tree v=9 · prompt-random v=6.
- lib/casual-tree.js — 허브 통합 생성기(polos0117.github.io/prompt.html)의 「해방」 몫 둘: `why(tree, scene, 칸, 값, 대상, 가까운 프레이밍)` 은 그 값이 트리 밖이면 까닭(code)을, 안이면 null(안 쓰는 값이면 자세 계열보다 먼저 `banned`). `unlocked(scene, 칸)` — 장면의 `unlocked` 에 든 칸은 트리 밖에서 일부러 고른 값이라 repair 가 고치지 않는다.
- tests/casual-tree.cjs — 칸을 넣은 복사본에서 새 규칙(안 쓰는 값·필수 갈래 컷의 클로즈업·동료 자세·세대의 해)이 걸리고, game 표에선 그대로인지.
- AGENTS.md — 모듈을 복사해 쓰는 공방이 book·myth·pkm 셋.

## 2026-10-29 · claude · 일상컷 트리 모듈을 공방끼리 같이 쓰게, 폼 LOOK-BACK 낱말은 표로
- lib/casual-tree.js — book-atelier 가 같은 파일을 복사해 쓴다(사용자 「이 구조로 다른 저장소도」). 게임에만 맞던 두 곳을 풀었다: 예전 기록의 시대는 'release' 만이 아니라 트리에 있는 시대면 그대로(책은 'book'), 필수 갈래의 「그 세계 안」 규칙은 required.world 또는 in_game(worldRule). 게임 쪽 동작은 그대로. casual-tree v=8.
- tools/casual-tree.py — 같은 required.world 또는 in_game.
- lib/prompt-spec.js · lib/prompt-game.js — 폼 LOOK-BACK 의 낱말(돌아보·뒤를 보·뒤돌아)을 조립 코드에서 표(FORM_LOOK_BACK)로. 06da7c5 가 조립 코드에 한글을 박아 tests/words.cjs 가 깨진 채로 올라갔다(그때 그 검사를 안 돌렸다). prompt-spec v=35, prompt-game v=17.
- AGENTS.md — 트리 모듈은 book 이 복사해 쓴다.

## 2026-10-29 · claude · 일상컷 검사 --free 칸도 「있어야 할 것」 엔 센다
- tools/casual-plan.cjs — 문명 5 일상1(란제리 전신, 로우앵글)이 안전 필터에 두 번 막혀 사용자가 방향을 정면으로 골랐다. 2번과 방향이 겹쳐 --free 1 로 검사했더니 그 칸을 필수 갈래·먼 컷 검사에서도 빼 「먼 컷이 없다」 가 났다. free 는 겹침에만 빼고, 필수 갈래·먼 컷·가까운 컷은 묶음 전부로 본다.
- tests/casual-plan.cjs — 필수·먼·가까운 컷을 다 free 로 둬도 통과(고치기 전 코드는 실패).
- IMAGE_RULES.md — --free 설명에 그 한 줄.

## 2026-10-29 · claude · 폼 자세가 돌아보기면 LOOK-BACK 줄
- lib/prompt-spec.js · lib/prompt-game.js — 히어로즈 3 중반(「몸을 돌려 돌아보는 자세」)이 몸통은 뒤로, 얼굴은 정면으로 목이 반 바퀴 넘게 꺾였다(사용자). 폼 출력 줄의 「얼굴은 카메라 쪽」 과 돌아보기가 겹쳤고, 일상컷의 LOOK-BACK 줄이 폼엔 없었다. 폼 자세에 돌아보·뒤를 보·뒤돌아가 있으면 짧은 LOOK-BACK 줄(고개는 어깨 너머 4분의 1까지, 옆얼굴·3/4)을 STANCE 뒤에 싣는다 — 팩맨 타이틀·GTA V 중반·히어로즈 3 중반. 타이틀 900 낱말 안. prompt-spec v=34, prompt-game v=16.
- tests/prompt-game.cjs — 돌아보기 자세에만 그 줄, 자세 → 돌아보기 → 출력 차례.

## 2026-10-29 · claude · 복식 구조 「셔츠·조끼」 의 노출 줄은 트인 갈래
- lib/prompt-spec.js — 대항해시대 4 타이틀 두 장이 「흰 셔츠에 짧은 항해 조끼」 위에 긴 코트를 걸쳤다. shirt_vest 를 겉옷 갈래로 둬 노출 줄이 「겉옷(코트·망토·로브·갑옷)은 두 어깨에」 를 실었다 — 조끼는 그 겉옷이 아니다. 트인 갈래(옷 제 구조로 노출)로. prompt-spec v=33.

## 2026-10-29 · claude · 충돌 후보 검사기 조사 떼기 버그, 문명 V·히어로즈 3 설계표
- tools/game-design.py — 조사 떼기가 「지도」 의 「도」 를 떼 「지」 로 만들어 문명 V 중반(「허리에 두루마리 지도」 ↔ 자세 「두루마리 지도를 펼쳐 들고」)을 못 잡았다. 낱말은 뗀 꼴과 그대로인 꼴을 둘 다 본다.
- data/game-design.json — 그리기 전에 고쳤다: 문명 V 중반 차림에서 허리의 두루마리 지도를 뺀다(자세가 펼쳐 든다). 히어로즈 3 타이틀 자세 「말 탄 듯 몸을 기울이고」 → 「말고삐를 한 손에 쥐고」(알아볼 거리에 영웅의 말 — 말이 옆에 있는데 말 없이 탄 척).
- tests/game-design.py — 「지도」 경우.

## 2026-10-29 · claude · 일상컷 알아볼 거리 「하나만」 은 장신구 얘기
- IMAGE_RULES.md — 위쳐 3 일상2(늑대 메달 + 배경의 늑대 문장 깃발)를 사용자가 그대로 두기로 했다: 하나만은 그녀가 지니는 장신구·소품이고 배경의 게임 장식은 괜찮다.

## 2026-10-29 · claude · 위쳐 3 엔딩 자세 — 검 개수
- data/game-design.json — 엔딩이 땅에 꽂은 검 + 등의 두 검으로 세 자루가 나왔다(알아볼 거리 「등에 맨 두 자루」 와 자세 「검을 땅에 꽂고」 가 같이 실렸다). 사용자 결정으로 다시 — 자세를 「등의 두 검 중 하나를 땅에 꽂고 … 남은 하나는 등에」.

## 2026-10-29 · claude · 위쳐 3 타이틀 장비 줄 「상의」 → 「코트」
- data/game-design.json — 그리기 전에 보니 타이틀 GEAR 「징 박은 가죽 상의」 가 차림·실루엣의 「가죽 코트」 와 부딪혔다. 은백색 포니테일·두 검이 시리를 닮을 수 있다고 알렸고, 사용자가 머리는 그대로 두기로.

## 2026-10-29 · claude · 계획대로 안 나오면 먼저 묻는다
- IMAGE_RULES.md — 사용자 요청: 그린 그림이 고른 값과 다르면 계획·지시문을 고쳐 바로 다시 그리지 말고, 원인만 찾아 보여 준 뒤 그대로 갈지 다시 만들지 묻는다(리그 오브 레전드에서 세 장을 고쳐 다시 그렸다).

## 2026-10-29 · claude · 일상컷 자세 「엄지 척」, 옷 「e스포츠 팀 저지」
- lib/prompt-spec.js · data/casual-tree.json — 사용자 요청(리그 오브 레전드 — 쉿과 함께 경기장 세리머니). 자세 thumbs_up(어깨 옆으로 올린 손, 엄지를 곧게 — 얼굴을 가리지 않는다; 자세 표는 가슴 앞·손 씀·얼굴이 보여야 함), 서기·앉기·걷기 계열. 운동복 계열에 esports_jersey(지퍼 깃 팀 저지·목에 건 헤드셋). 경기 뒤 인터뷰는 빈 손(손 말이 없다)·먼저 고를 옷 팀 저지, 무대 오르기 전 준비도 팀 저지를 먼저. prompt-spec v=32.
- tests/casual-tree.cjs — 엄지 척 자세(가슴 위엔 되고 클로즈업엔 없다, 등 쪽 방향 없음).

## 2026-10-29 · claude · 손 말이 든 하는 일은 「빈 손」 아님, 묶음 검사에 사용자가 고른 칸
- data/casual-tree.json — 리그 오브 레전드 일상6(계단참 「한 손은 난간에」 + 쉿 + 어깨 너머)에 팔이 셋 나왔다(사용자). 계단참 멈추기·페리 난간 기대기를 「빈 손」(hands: free)으로 잘못 적어 손 쓰는 자세가 붙었다 — 뺐다.
- tools/casual-plan.cjs — `--check <폴더> --free 6` — 사용자가 직접 고른 칸은 트리 길만 보고 묶음 겹침(프레이밍·방향 …)에선 뺀다(정면 상체 쉿이 5번 허리 위와 겹친다).

## 2026-10-29 · claude · 일상컷 자세 「손가락 하나로 쉿」, 가슴 위엔 등 쪽 방향 없음
- lib/prompt-spec.js · data/casual-tree.json — 사용자 요청 자세 finger_to_lips(검지를 입술에 세워 쉿, 손은 얼굴을 가리지 않는다). 서기·앉기·걷기 계열, 자세 표는 얼굴 쪽·손 씀·얼굴이 보여야 함(faces). prompt-spec v=31.
- lib/casual-tree.js · lib/prompt-ui.js — 얼굴이 보여야 하는 자세엔 등 쪽 방향(뒤·등 돌림·뒤 3/4·걸어가는 뒷모습)이 없다 — 계획기 후보에 쉿 + 등 돌림이 나왔다. 가슴 위·클로즈업엔 등 쪽 방향이 없다(frame_rules no_orients) — 리그 오브 레전드 일상3 이 「등과 옆구리」 를 보이려 두 번 엉덩이까지 넓어졌다. casual-tree v=7, prompt-ui v=10.
- tests/casual-tree.cjs · tests/prompt-screen.cjs — 쉿 자세·방향, 가슴 위 등 쪽 방향, 추천 조합 화면 검사는 전신에서(가까운 컷이면 반바지 옷이 비워져 가끔 걸렸다).

## 2026-10-29 · claude · 일상컷 — 하는 일이 안 받는 프레이밍, 등이 알아볼 데인 옷, 앉기엔 앉는 자세
- data/casual-tree.json · lib/casual-tree.js — 리그 오브 레전드 일상4(폭포 수영·전신)가 헤엄 대신 물속을 걸었다 — 전신 컷의 「머리·손·발이 다 안에」 와 몸이 물에 잠기는 수영이 부딪혔다. 하는 일에 not_frames(수영·탕에 몸 담그기 → 전신·환경 컷 없음), frameOk, repair 가 맞지 않게 된 프레이밍을 비운다. 일상3(가슴 위·뒤 3/4)은 「카울백 가운」 의 등 드레이프를 보이려 엉덩이까지 넓어졌다 — 등이 알아볼 데인 옷(로우백·백리스·카울백·오픈백 여덟 벌)도 low. casual-tree v=6.
- lib/prompt-ui.js · lib/prompt-random.js — 프레이밍 선택지·랜덤도 하는 일로 거른다. prompt-ui v=9, prompt-random v=5.
- tools/casual-plan.cjs — 일상1 「관중석 자리에서 박수」 를 서서 쳤다(자세 자동). 앉기 계열은 앉는 자세(의자·가장자리·바닥 중 하는 일이 받는 것)를 늘 붙인다. 프레이밍도 하는 일로 거른다.
- tools/casual-tree.py · tests/casual-tree.cjs · tests/casual-plan.cjs · tests/prompt-screen.cjs — not_frames 검사, 수영·등 옷·앉는 자세·화면 프레이밍.

## 2026-10-29 · claude · 일상컷 계획기 동작 방향 빼기, 응원은 표정을 정한다
- tools/casual-plan.cjs — 리그 오브 레전드 계획에 「경기 뒤 인터뷰」·「위로 손 뻗기」 가 붙었다. 방향 중 몸 동작인 것(위로 뻗기·앞뒤로 기울이기·웅크리기·앉아 비틀기·돌며 움직이기·기대 눕기)은 하는 일과 따로 붙으면 부딪혀, 계획기는 보는 쪽 방향만 고른다(화면에선 고를 수 있다).
- data/casual-tree.json — 「관중석에서 박수」 에 표정 「이 악문 결의」 가 붙었다. 관중석 박수·펜스 앞 응원은 표정을 정하는 하는 일(mood).
- tests/casual-plan.cjs — 계획기는 동작 방향을 안 고른다.

## 2026-10-29 · claude · 복식 구조 「셔츠·조끼」 — 대항해시대 4 타이틀 충돌
- data/game-design.json · lib/prompt-spec.js · tools/game-design.py — 대항해시대 4 실루엣 「긴 코트에 바지」 와 타이틀 「흰 셔츠에 짧은 항해 조끼」 가 부딪혔다(conflicts garment). 사용자 결정으로 복식 구조를 차림에 맞췄다 — shirt_vest(「짧은 조끼 아래 헐렁한 셔츠」, 과감 줄은 겉옷 갈래). 설계표의 나머지는 그대로. prompt-spec v=30.

## 2026-10-29 · claude · 설계표 검사기 — 폼 지시문 충돌 후보, 그림 없는 네 편 고침
- tools/game-design.py — GTA V 를 그리기 전·뒤에 손으로 찾은 설계표 칸끼리 충돌을 `conflicts [key] [--all]` 이 찾는다: 타이틀 차림에 복식 구조의 옷이 없다(garment), 알아볼 거리가 개방 사건과 두 말 이상 겹친다(sig_open — 헬기 탐조등), 폼 자세가 그 폼 개방과 같은 물건·같은 동사다(pose_open), 차림이 몸에 건 물건을 자세는 손에 든다(look_pose — 목에 건 선글라스), 운동화가 있는데 상표 금지가 없다(shoes). 물건만 겹치는 건 정상이라 안 잡는다(물건은 폼, 사건은 개방). 기본은 그림 없는 게임만, 괜찮다고 본 것은 게임의 conflicts_ok. check 는 남은 수를 알린다.
- data/game-design.json — 그림 없는 다섯 편을 돌려 고쳤다: 위쳐 3 타이틀 「가죽 상의」 → 「가죽 코트」(긴 코트), 문명 V 복식 구조 정장 → 원피스·타이틀 「튜닉 원피스」(고대 시작에 정장), 히어로즈 3 타이틀에 「승마용 겹치마」(겹치마)·중반 자세 「보물 상자 뚜껑을 열며」 → 「닫힌 보물 상자 위에 손을 얹고」(개방 「상자가 열리며」 를 폼이 먼저 했다). 리그 오브 레전드 팔찌 들기·히어로즈 3 보물 상자·문장 깃발은 conflicts_ok. 대항해시대 4(타이틀 셔츠·조끼 ↔ 긴 코트)는 설계를 그대로 두기로 해 남겼다.
- tests/game-design.py · AGENTS.md — GTA V 의 원래 칸으로 되돌리면 넷 다 걸린다, 히어로즈 3 자세, conflicts_ok·그림 있는 게임 빼기. 그리기 전 conflicts 0.

## 2026-10-29 · claude · 일상컷 트리 문장 훑기 — 장소×하는 일 510 쌍
- data/casual-tree.json — 하는 일마다 붙는 장소 문장을 다 읽었다. 고친 것: 거닐기에서 카페·빨래방·사진 부스·PC방·케이블카 빼기, 앉아 쉬기에서 모션 캡처실·사막 빼기, 탕 가장자리에서 하맘(탕이 없다), 무대 오르기 전 준비에서 축제 거리, 플래시 쪽 돌아보기에서 성 계단, 신발 끈에서 골목(벤치 없음). 문장: 부케 「햇살 드는 창가」 → 「차례를 기다리며」(정원·예배당), 휴대용 게임기 「창가」 빼기(역 승강장), 낚시 「부두」 → 「물가」(바위 해안·호숫가), 다도 「조용한 방」 빼기(여관·호텔), 요리 「조리대」 빼기(캠프장), 풍경 보기 「창틀이나 난간」 → 「가까운 턱」. 체육관에 펜싱 줄(펜싱 자세가 복싱 체육관에 붙었다). 모션 캡처실엔 숨 고르기를 더하고, 추천 조합 셋(무대 전 연습·사막 리조트·펑크 뒷골목)을 맞는 길로. 길 931 → 912.
- lib/casual-tree.js · tools/casual-tree.py — 하는 일 places 에 `!장소`(묶음에서 빼기). 검사기 `audit` — 하는 일 문장의 고정물이 장소 문장에 없는 쌍을 보인다(지금 0). casual-tree v=5.
- tests/casual-tree.py · AGENTS.md · IMAGE_RULES.md — `!장소`·audit 검사, 하는 일 문장 쓰는 법(동작 하나, 장소 말 안 쓰기).

## 2026-10-29 · claude · 일상컷 칸끼리 규칙을 트리로 — 생성기 화면도 같게, 배경 인물 허용
- data/casual-tree.json — GTA V 계획에서 걸린 칸끼리 충돌 규칙이 묶음 계획기에만 있어 생성기에서 한 장씩 고르면 그대로 골라졌다. 표로 옮겼다: 자세 표(pose_meta — 보이는 부위·손·앉는 자리), 프레이밍 규칙(frame_rules — 보이는 부위·광각·허리 아래 옷), 하는 일의 seat(앉기 계열 50개 — 의자·가장자리·바닥)·hands(빈 손)·mood(표정을 정함), 옷의 low(허리 아래로 알아봄, 256 중 149). 눕기 계열은 자세를 비웠다(앉기 자세·탁자 기대기가 「누워」 와 부딪혔다).
- lib/casual-tree.js — poses(하는 일, 프레이밍)·items(계열, 프레이밍)가 위로 거르고 lensOk·exprOk 를 더했다. repair 가 맞지 않게 된 렌즈·표정도 비운다. casual-tree v=4.
- lib/prompt-ui.js · lib/prompt-random.js · lib/words.js — 화면: 자세·옷·렌즈 선택지를 거르고, 표정 칸은 하는 일·방향이 허락하지 않으면 끈다(풀이 붙임). 랜덤도 같다. prompt-ui v=8, prompt-random v=4, words v=8.
- tools/casual-plan.cjs — 자기 목록(몸 자세·허리 아래 옷 정규식·광각·표정)을 버리고 트리 함수를 쓴다. 물건 드는 자세·돌아보기·허리 숙이기만 계획기가 따로 안 고른다. --check 가 렌즈·표정도 본다.
- lib/prompt-spec.js · lib/prompt-game.js — 일상컷 「ONE FIGURE ONLY」 가 레드카펫·입장 줄과 부딪혔다. 사용자 결정으로 배경 인물 허용 — 일상컷만 「ONE MAIN FIGURE」(작고 흐린 배경 인물, 같이 포즈 X, 게임 캐릭터 X). prompt-spec v=29, prompt-game v=15.
- tools/casual-tree.py · tests/casual-tree.py · tests/casual-tree.cjs · tests/casual-plan.cjs · tests/prompt-screen.cjs · tests/prompt-game.cjs · IMAGE_RULES.md — 표 검사(자세 표·앉는 자리·클로즈업에서 고를 옷), 함수·화면·계획기 규칙, 배경 인물 줄.

## 2026-10-29 · claude · 일상컷 트리 — 몸풀기를 동작 하나로
- data/casual-tree.json — GTA V 일상5(트랙 몸풀기)에 다리가 셋 나왔다 — 두 다리로 런지하면서 뒤로 접은 발을 한 손으로 또 잡았다. 하는 일 「팔을 흔들고 다리를 스트레칭」 이 동작 여럿을 한 장에 담으라 했다. 「앞 무릎에 두 손을 얹은 런지 스트레칭」 하나로.

## 2026-10-29 · claude · 일상컷 계획기 — 가까운 컷의 옷, 3/4 컷의 렌즈
- tools/casual-plan.cjs — GTA V 일상1(클로즈업)이 허리 위로 넓게 나왔다. 옷이 「허리 양옆이 크게 파인 원피스」 라 알아볼 데가 크롭 밖이었고, 「크롭 안의 옷이 한눈에」 와 부딪혔다. 가슴 위·클로즈업엔 허리 아래로 알아보는 옷(허리·엉덩이·스커트·반바지·레깅스·가터·미니·컷아웃 …)을 고르지 않는다(남는 옷이 없을 때만 그대로). 일상5(3/4)는 35mm 「인물과 배경의 균형」 에 정강이까지 나왔다 — 3/4 컷에도 광각(24·35mm)을 안 붙인다.
- tests/casual-plan.cjs · IMAGE_RULES.md — 위 두 규칙.

## 2026-10-29 · claude · 일상컷 트리 — 장소와 하는 일 문장이 엇갈린 둘
- data/casual-tree.json — GTA V 계획을 보니 장소 「클럽 댄스 플로어」 에 하는 일 「밖에서 입장 줄 서기」, 장소 「효과음 녹음 부스」 에 「무대 뒤에서 기타 조율」. 클럽은 「댄스 플로어와 문 앞 입장 줄이 있는 클럽」, 기타 조율은 「곡 사이에 줄에 귀를 대고」(라이브 하우스·녹음실 둘 다 맞게).

## 2026-10-29 · claude · GTA V 폼 지시문 충돌 셋, 일상컷 계획기 자세·표정·하는 일
- data/game-design.json — GTA V 타이틀 네 장이 다 조던풍 하이탑(스우시 곡선·신발 혀 글자)을 신었다. 그리지 않을 것에 「상표 로고가 붙은 운동화·옷」, 타이틀 차림은 「목에 건 선글라스」(자세는 「선글라스를 한 손에 들고」 — 서로 부딪혔다) 대신 「굽 낮은 끈 샌들」. 시그니처 「경찰 헬기 탐조등」 이 중반 개방(헬기 탐조등이 휩쓸고)과 겹쳐 HOLD BACK 과 같이 실렸고 중반·엔딩에 헬기가 나왔다 — 「경찰차 경광등」 으로.
- lib/prompt-spec.js — 이어가기 손 줄 「붙인 그림과 같은 장갑·맨손」 이 폼 「장갑」(GTA V 중반)과 부딪혔다. 「FORM 이 장갑을 말하면 그쪽」. prompt-spec v=28.
- tools/casual-plan.cjs — GTA V 계획을 그리기 전에 보니 촛불 만찬(식탁)에 「방석 책상다리」·「낮은 턱에 걸터앉기」, 샴페인 잔 들기에 「두 손을 머리에」, 등 돌린 별 보기에 표정 「졸림」, 클로즈업에 「성큼 걷기」, 쇼핑몰·편의점에 「앉아 쉬기」 둘. 몸 자세는 손을 안 쓰고 장소를 안 타는 것만(책상다리·걸터앉기·팔짱·허리에 손·머리 만지기·기지개 뺌), 가까운 컷엔 자세 없음, 등을 보이면 표정 비움, 하는 일은 겹치지 않게.
- data/casual-tree.json — 촛불 만찬에 「슬립 위 실크 로브」(실내복)가 붙었다. 먼저 고를 옷(prefer)에 원숄더·홀터넥·벨벳·스트랩리스·하이슬릿.
- tests/casual-plan.cjs · IMAGE_RULES.md — 위 규칙들.

## 2026-10-29 · claude · 복식 구조 「재킷·반바지」 — GTA V 타이틀의 실루엣 충돌
- data/game-design.json · lib/prompt-spec.js — GTA V 타이틀 지시문을 그리기 전에 보니 실루엣 「긴 코트에 바지」 와 폼 「헐렁한 데님 재킷과 짧은 반바지」 가 같이 실렸다. 복식 구조에 jacket_shorts(「탱크톱 위에 걸친 헐렁한 재킷과 짧은 반바지」, 과감 줄은 겉옷 갈래)를 더하고 GTA V 를 그것으로. prompt-spec v=27.

## 2026-10-29 · claude · 일상컷 계획기 — 연도 없는 게임의 시대 해, 몸 자세만, 표정을 정하는 하는 일, 하는 일에 맞는 옷
- lib/casual-tree.js — 받은 연도가 없는 게임(심시티)에서 「그 해부터 있는 곳」 을 못 걸러 출시 당시에 방송 책상(2005)이 나왔다. 연도가 없으면 시대(era)의 대략 해(prompt-spec ERA_PERIOD 와 같은 해). casual-tree v=3.
- tools/casual-plan.cjs — 심시티 계획을 그리기 전에 보니 「누워서 웃기」 에 표정 「진지함」, 패들보드에 「돌아보기」 자세, 역 벤치에 「바닥에 앉기」, 자전거 점검에 양궁 차림이 붙었다. 자세는 어디서나 자연스러운 몸 자세만(NEUTRAL_POSES), 하는 일이 표정을 정하면(웃기·노래 …) 표정은 비우고, 옷은 하는 일이 먼저 고르라는 옷(prefer)에서.
- data/casual-tree.json · tools/casual-tree.py — 하는 일 스물 남짓에 먼저 고를 옷(prefer — 복싱·코트·조깅·자전거·양궁·펜싱·요가·서핑·수영·가봉·무대 춤 …), 검사기는 그 옷이 하는 일이 받는 옷 계열에 있는지 본다.
- tests/casual-plan.cjs · tests/casual-tree.py · tests/prompt-game.cjs — 몸 자세만·표정 비움·맞는 옷, prefer 검사, 연도 없으면 시대 해.

## 2026-10-29 · claude · 일상컷 — 가장자리를 넘는 팔다리, 서기·움직임에서 뒤로 젖히기 빼기
- lib/prompt-spec.js — 조조전 일상2(클로즈업)의 오른팔이 어깨 밑에서 끊겼다(사용자). 하는 일 「한 팔을 크게 뻗으며 인사」 와 클로즈업 크롭(어깨 아래 안 보임)이 같이 실렸고, 가장자리를 넘는 팔다리를 어떻게 하라는 말이 없었다. CROP 줄에 「가장자리를 넘는 팔다리는 밖으로 자연스럽게 이어진다 — 안에서 끊기거나 짧아지거나 흐려지지 않게」. prompt-spec v=26.
- data/casual-tree.json — 같은 컷에 「인사(앞으로 숙임)」 와 방향 「상체를 뒤로 젖혀 기대기(받침 필요)」 가 붙었다. 서기·움직임 계열 방향에서 뒤로 젖히기를 뺐다(앉기·눕기에는 남는다).
- tests/prompt-game.cjs · tests/casual-tree.cjs — 가까운 컷 CROP 의 팔다리 줄, 서기·움직임 계열에 뒤로 젖히기 없음.

## 2026-10-29 · claude · 일상컷 트리 — 눕기 계열에서 뒤돌아보기 방향 빼기
- data/casual-tree.json — 조조전 일상4(해먹 낮잠)가 상체는 등, 골반·다리는 앞으로 반 바퀴 비틀렸다(사용자). 눕기 계열이 「어깨 너머 돌아보기」 를 허락해 LOOK-BACK(등이 카메라 쪽)과 「한쪽 다리를 늘어뜨리고」 가 같이 실렸다. 눕기 계열 방향에서 뺐다.
- tests/casual-tree.cjs — 눕기 계열엔 등 쪽·뒤돌아보기·걸어가는 뒷모습 방향이 없다.

## 2026-10-29 · claude · 일상컷 가까운 컷 — 옷·노출·렌즈 줄도 크롭 안만
- lib/prompt-spec.js · lib/prompt-game.js — 조조전 일상 1(가슴 위)·2(클로즈업)·3(허리 위)이 고른 것보다 넓게 나왔다. 지시문을 보니 WARDROBE 의 「옷이 한눈에, 알아볼 부분이 다」 가 크롭 밖 치마·드레스 자락을, 피부 노출 bold 풀이의 「배·다리」 가 크롭 밖을, 렌즈 풀이(24mm 「넉넉한 거리」·35mm 「배경과 균형」)가 거리를 불렀다. 가까운 컷이면 옷 줄은 「크롭 안의 옷이 한눈에」(casualWardrobeClose), 노출 풀이는 「크롭 안의 어깨·목선·등」(CLOSE_AXIS_GUIDES), CROP 줄에 「렌즈는 원근만, 담는 범위는 아니다」, FRAME 줄은 「장면 전체」 대신 「이 틀에 맞춰」. prompt-spec v=25, prompt-game v=14.
- tools/casual-plan.cjs — 가까운 컷에 광각(24·35mm)을 안 붙인다.
- tests/prompt-game.cjs · tests/casual-plan.cjs — 가까운 컷의 옷·노출·렌즈 줄, 먼 컷은 그대로, 계획기의 가까운 컷 렌즈.

## 2026-10-29 · claude · 일상컷 트리 5단계 — 묶음 계획기(그릴 때 쓰는 도구)
- tools/casual-plan.cjs(새) — 한 게임 일상컷 여러 장을 한 번에 짠다. 생성기 화면은 한 장씩 고르는 곳이라 그대로 두고(사용자 「따로 정해서 쓰진 않을 것」), 다섯 장을 나눠 갖게 짜는 일은 그리는 쪽 도구로 했다. 생성기와 같은 lib/casual-tree.js · lib/prompt-game.js 로 칸마다 장면을 고르고 생성기 「기록 내보내기」 와 같은 꼴의 기록·지시문을 쓴다. 묶음 규칙: 필수 갈래 한 장 이상(게임 차례대로 돌림), 방향·프레이밍 안 겹침·렌즈 두 번까지·먼 컷과 가까운 컷, 장소 안 겹침·장소 묶음 두 번까지, 의상 계열 안 겹침(평상복 두 번까지)·옷은 구체적으로, 자세 계열 두 번·시대 세 번까지, 뒤돌아보기 한 장, 알아볼 거리 칸마다 다르게, 자세는 물건 없는 몸 자세만 가끔. 이미 그림이 있는 칸은 겹침 검사에만 쓰고 그 컷이 넘긴 한도는 올려 준다. --check 로 올린 묶음을 같은 규칙으로 본다(지금 스파2 다섯 장은 평상복 세 장·지금 현실 네 장이 걸린다 — 그림은 그대로).
- lib/casual-tree.js — 장소·하는 일·옷 계열 목록을 표마다 한 번만 센다(계획기 한 번 시도가 25ms 에서 거의 0 으로, 화면도). casual-tree v=2.
- tests/casual-plan.cjs · tests/casual-plan-screen.cjs — 스무 편 × 씨앗 셋이 규칙을 지키고, 필수 갈래가 돌고, 있는 컷 위에 더 짜고, 규칙 검사가 걸고, 계획기 기록을 생성기 화면에 넣으면 같은 지시문·같은 칸·같은 파일 이름.
- IMAGE_RULES.md 2절 · AGENTS.md — 일상컷 묶음 짜기: 계획을 사용자에게 먼저 보이고 그린다, 올리기 전 --check.

## 2026-10-29 · claude · 일상컷 트리 4단계 — 옛 갈래·예시 표 지우기, 고른 장면을 위로
- lib/prompt-spec.js — 트리로 옮긴 뒤 아무도 부르지 않던 일상컷 갈래·예시 표(CATS · EXAMPLE_MAP · EX_NOTE · CAT_KO · EXAMPLE_DETAIL)와 갈래 목록(SCREEN_CATS · PLACE_CATS), 옛 GAME PLACE 줄을 지웠다(9617 → 5170 줄). 그 내용은 data/casual-tree.json 의 추천 조합·옷·변환표에 있다. prompt-spec v=24.
- lib/prompt-game.js · lib/prompt-spec.js — 일상컷 차례를 바꿨다: FRAME·CROP 바로 뒤에 시대·장소 줄(ERA·WORLD·SETTING·SCREENS)과 고른 장면(SCENE), 그 뒤에 옷·각도·뒤돌아보기 줄. 장면이 맨 아래에 있을 때 고른 프레이밍이 첨부 그림의 전신 구도에 졌다(스파2 일상 1·2·5). 「아래 설정을 따른다」 말은 「SCENE 을 따른다」 로. prompt-game v=13.
- tests/prompt-game.cjs — FRAME → 시대 줄 → 고른 장면 → 옷 줄 차례, 「아래」 말 없음, 일상컷 길이 한도 760 → 720(가장 긴 추천 조합 676 낱말).

## 2026-10-29 · claude · 일상컷 트리 3단계 — 생성기 화면·랜덤·지시문을 트리로
- lib/casual-tree.js(새) — 트리 표를 거르는 공용 모듈: 시대별 장소(출시 당시면 그 해 뒤에 생긴 곳은 빠짐) → 장소의 하는 일 → 옷 계열(시대 ∩ 장소 ∩ 하는 일) → 옷 → 자세 계열 안의 자세·방향(가까운 옆얼굴은 가까운 컷에서만). 앞 칸을 바꾸면 맞지 않게 된 뒤 칸을 고친다(repair), 추천 조합 채우기, 예전 기록(갈래·예시) 변환, 필수 갈래·화면 줄 판정. tools/casual-tree.py 와 같은 규칙(tests/casual-tree.cjs 가 길 수를 맞춰 본다).
- lib/prompt-ui.js · lib/words.js · prompt.html — 일상컷 칸이 갈래·예시·시대에서 추천 조합 → 시대 → 장소(묶음별) → 하는 일 → 의상 계열(★ 필수 갈래) → 옷 → 알아볼 거리, 그 아래 자세·방향(하는 일의 계열만)·프레이밍·렌즈, 맨 끝에 표정·세부 축. 필수 갈래에 드는지 한 줄로 알려 준다. 옷 칸은 「옷 직접 쓰기」. 트리 표를 불러온다. 저장된 예전 상태는 변환표로 옮겨 연다. prompt-ui v=7, words v=7.
- lib/prompt-random.js — 일상컷 랜덤이 트리 차례(시대 → 장소 → 하는 일 → 의상 → 옷 → 프레이밍·렌즈 → 자세·방향 → 표정·알아볼 거리 · 축)로, 한 칸을 뽑으면 뒤에서 맞지 않게 된 칸을 남은 것 중에서 다시 뽑는다. 앞 칸을 잠그면 뒤만. 시대도 이제 랜덤·잠금(트리가 시대에 맞는 것만 남긴다). prompt-random v=3.
- lib/prompt-game.js · lib/prompt-spec.js — 일상컷 SCENE 이 Place · Activity · Outfit(고른 옷 > 계열 풀이, 직접 쓴 옷이 이긴다) · 자세 · 방향 · 프레이밍 · 렌즈 · 표정 · 축. 갈래 설명 문단(Category)·예시 문장(Example scene)은 없다. 시대 줄 — 출시 당시 ERA, 게임 세계 안 WORLD(설계표 place), 무대·환상 SETTING. 화면 줄은 오락실·작업실·대회 무대·거실에서. 알아볼 거리는 자동(하나~둘)·하나만·없음. OUTPUT 의 「평상복」 을 「아래에서 고른 옷」 으로(란제리·무대 의상 등과 부딪혔다), 분리형 선호는 고른 옷에 진다. 같은 클로즈업 장면이 880 → 668 낱말. prompt-spec v=23, prompt-game v=12.
- data/casual-tree.json — 옷 계열마다 영어 풀이(옷을 자동으로 둘 때), 화면 줄을 싣는 묶음·장소.
- tests/prompt-game.cjs · tests/prompt-screen.cjs · tests/casual-tree.cjs — 일상컷 시험을 트리로 다시: 기본 길, 고른 옷·직접 쓴 옷, 세 시대 줄, 그 해부터 있는 곳, 화면 줄, CROP, 자세 계열, 알아볼 거리 셋, 예전 기록 변환, 추천 조합 282개 조립·영어·길이(760 낱말 한도), 화면의 추천 조합·시대 거르기·잠근 시대·자세 계열·필수 갈래 표시·기록.
- IMAGE_RULES.md 2절 · AGENTS.md · docs/GAME_CONCEPT.md 7절 — 일상컷 트리 표, 필수 갈래를 트리 말로.

## 2026-10-29 · claude · 일상컷 트리 2단계 — 지금 예시를 추천 조합으로
- data/casual-tree.json — 지금 갈래의 예시 440개를 트리 길로 옮겼다. 장면을 말하는 예시는 추천 조합(presets) 282개(같은 길은 합침, 묶음은 지금 갈래 이름 25개), 옷만 말하는 예시(란제리·수영복·전통·역할극 옷 등)는 그 옷 + 갈래 기본 길. 옮기며 장소 7(마트·편의점·쇼핑몰·라이브 하우스·야외 공연장·패션쇼장·양궁장·레트로 퓨처 집) · 하는 일 43 · 옷 17 을 더했고, 무대 의상 계열은 현실 시대에도 연다(댄스·코스프레). 예전 기록의 갈래/예시 → 새 길 변환표(legacy) 467칸 — 그림 저장소에 있는 일상컷 기록 17개가 다 변환된다. 「일상 기본」·「일상」 두 갈래는 하나로.
- tools/casual-tree.py · tests/casual-tree.py — 추천 조합과 변환표의 길이 다 고를 수 있는 길인지(시대가 그 장소에 있는지·그 장소의 하는 일인지·옷 계열이 남는지·옷이 그 계열에 있는지) 본다.

## 2026-10-29 · claude · 일상컷 트리 1단계 — 시대 → 장소 → 하는 일 → 의상 → 구도 표
- data/casual-tree.json — 갈래·예시·자세가 서로 상관없이 뽑혀 부딪혔다(사용자 「중구난방」, 트리 구조로). 시대 4(지금·출시 당시·게임 세계 안·무대/환상) · 장소 92(묶음 13, 시대·그 해부터·입을 옷 계열) · 하는 일 123(자세 계열 6, 장소 또는 @묶음, 옷을 더 좁히기) · 옷 계열 14(옷 239 — 지금 갈래의 옷 예시에서 장면 말을 걷어 냈다). 필수 갈래는 옷 계열(란제리풍·수영복·역할극) 또는 게임 세계 안 방·목욕·지붕·여관의 홈웨어·란제리·목욕 차림·수영복. 생성기는 아직 이 표를 안 쓴다(다음 단계).
- tools/casual-tree.py · tests/casual-tree.py · tests/casual-tree.cjs — 표 검사기: 열쇠·가리키는 것·영어 칸, 어느 시대·장소에서도 하는 일 둘 이상·옷 계열 하나 이상, 시대마다 필수 갈래에 닿는 길. 자세 계열의 자세·방향 열쇠가 생성기 표에 있고 모든 자세가 한 계열에 든다.
- tools/casual-compose.py · tests/casual-compose.py · IMAGE_RULES.md — 란제리·수영복의 가슴 위 크롭 금지는 뺐다(사용자).
- AGENTS.md — 검사 줄.

## 2026-10-29 · claude · 일상컷 구도 — 묶음 안에서 방향·프레이밍·렌즈를 돌리고, 가까운 컷은 CROP 줄
- tools/casual-compose.py · tests/casual-compose.py — 스파2·젤다 일상 다섯 장이 모두 같은 방향(몸 3/4 정면)·비슷한 거리로 나왔다(사용자). 목 꺾임을 피하려고 방향을 매번 front_3q 로 덮어쓴 탓이다. 새 검사기가 한 게임 일상컷 기록(casualN-ui.json)을 읽어 방향·프레이밍이 겹치지 않는지, 렌즈가 두 번까지인지, 먼 컷(전신·환경)과 가까운 컷(가슴 위·클로즈업)이 다 있는지 본다.
- lib/prompt-spec.js · lib/prompt-game.js — 스파2 일상을 다시 그리기 전에 지시문을 읽어 보니 클로즈업에 「발을 받치고 손이 보이게 앉기」(자세)·「옷이 한눈에 읽히게」(WARDROBE)·「가방 들고 간식 쥐고 노선표 보기」(예시)가 함께 실려 부딪혔다. 허리 위·가슴 위·클로즈업·디테일이면 CROP 줄 — 프레이밍이 이기고, 자세·옷·소품은 화면에 드는 부분에만, 옷은 보이는 목선·끈·천·색으로. prompt-spec v=20, prompt-game v=10.
- tests/prompt-game.cjs — 가까운 프레이밍에만 CROP 줄.
- lib/prompt-spec.js · lib/prompt-game.js · tests/prompt-game.cjs — 그렇게 그린 스파2 일상 1·2·5 가 고른 허리 위·가슴 위·클로즈업이 아니라 무릎 위까지 넓게 나왔다(3·4 는 고른 대로). 다시 뽑기 전에 지시문을 보니 CROP 줄이 「이 크롭이 이긴다」 만 말하고 정작 프레이밍은 맨 아래 SCENE 한 줄에만 있었고, ANATOMY 의 「7.5 등신·키는 다리에서」 가 전신을 불렀다. CROP 줄은 이제 어디서 잘리는지(허리·가슴 아래·쇄골)를 말하고 FRAME 바로 밑에 오며, 가까운 컷의 ANATOMY 에는 등신·다리 말이 없다(`anatomyClose`). prompt-spec v=21, prompt-game v=11.
- lib/prompt-spec.js · tools/casual-compose.py · tests/casual-compose.py · IMAGE_RULES.md — 다시 그린 스파2 일상5(클로즈업)가 허리 위로 나왔다. 자세 「손이 보이게」·예시 「간식 쥐고 노선표 보기」 가 손을 화면 안으로 끌었다 — 클로즈업 잘리는 선에 「손과 든 것은 얼굴까지 올리지 않으면 화면 아래로」. 일상2(란제리·가슴 위)는 안전 필터에 막혔다 — 란제리·수영복 갈래에 가슴 위 크롭을 고르면 검사기가 건다. prompt-spec v=22.
- IMAGE_RULES.md 2절 · AGENTS.md — 일상컷 구도 돌리기 규칙, 고른 대로 안 나온 그림은 곧바로 다시 뽑지 말고 지시문의 충돌부터 고친다(사용자).

## 2026-10-29 · claude · 머리색·눈 색 — 게임의 대표색으로
- data/game-design.json · lib/prompt-spec.js · lib/prompt-game.js — 머리·눈 색을 고르지 않으면 거의 다 흑발·흑갈색으로 흘렀다(사용자). 설계표에 머리색(`silhouette.hair_color`)·눈 색(`face.eye_color`)을 더해 스무 편 모두 대표색을 정했다(예: 팩맨 레몬 노랑·남색, 스트리트 파이터 II 불꽃 주황·강철 파랑, 젤다 금발·숲 초록). 새 인물(첫 그림)의 SILHOUETTE·FACE 줄에 실리고, 이어가기·개방·일상컷은 첨부 그림의 색을 그대로 지킨다. 생성기에서 머리·눈 색을 직접 고르면 그쪽이 이긴다(FACE_PARAM·SIL_PARAM), 외형 무작위도 설계가 켜져 있으면 건드리지 않는다. 길이 한도 900 에 맞게 notes 줄을 줄였다. prompt-spec v=19, prompt-game v=9.
- tools/game-design.py — 머리색·눈 색이 정한 말인지(검정·갈색 계열은 정한 말에 없다), 두 게임이 둘 다 같지 않은지 본다. 앞으로 더할 게임도 둘 다 채워야 통과한다.
- lib/words.js · dex.html · prompt.html — 설계 칸에 머리색·눈 색 이름. words v=6.
- tests/prompt-game.cjs · tests/game-design.py — 스무 편의 대표색이 실루엣·얼굴 줄에 실리고, 고른 색이 이기고, 검정·갈색이 없다.
- docs/GAME_CONCEPT.md 6절 · AGENTS.md · IMAGE_RULES.md — 새 게임은 대표색 머리·눈 색을 채운다.

## 2026-10-29 · claude · 일상컷 — 장면 랜덤이 시대를 고르지 않게, 분리형 선호는 예시의 옷에 진다
- lib/prompt-random.js · lib/prompt-ui.js — 젤다 일상2 가 예시(미래풍 스파에서 가운 차림)와 다르게 1986년풍 모험가 방의 탱크톱·반바지로 나왔다(사용자 「프롬프트 검토」). 장면 랜덤이 시대 칸에서 「출시 당시」를 골라 ERA 줄(그 해 무렵 현실, 현대 기기 없음)이 미래풍과 부딪혔다. 시대는 이제 장면 랜덤에 넣지 않고, 시대 칸은 랜덤·잠금 단추 없는 고르기로만 둔다. prompt-random v=2, prompt-ui v=6.
- lib/prompt-spec.js — 분리형 선호(separates_preference)가 「강하게」 로 뽑혀 상하의를 나누라 했고, 「옷 칸이 우선」 만 있어 예시의 가운을 이겼다. 이제 옷 칸이나 장면 예시에 적힌 옷이 이긴다. prompt-spec v=17.
- tests/prompt-screen.cjs · tests/prompt-game.cjs — 시대 칸에 랜덤·잠금 단추가 없고 장면 랜덤을 돌려도 시대 그대로, 분리형 줄이 예시의 옷을 말한다.
- lib/prompt-spec.js · tests/prompt-game.cjs — 고친 뒤 다시 그려도 젤다 일상2 가 스파가 아니었다. 갈래 「와일드카드」 설명이 「새 장면을 하나 지어내라」 라 고른 예시를 이겼다. 이제 「예시를 골랐으면 그 장면·장소·옷을 그대로」. prompt-spec v=18.

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
