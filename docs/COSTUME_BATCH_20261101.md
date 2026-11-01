# 등록된 게임의 주인공·마스코트 코스튬 추가 — 2026-11-01

작업 시작 시 `data/img.json`에 이미지가 등록된 34개 게임에 코스튬 일상컷을 한 장씩 추가했다. 게임별 최초 확정 그림(전부 타이틀)을 인물 기준으로 사용했다. 34개 모두 `costume.who/en`이 채워져 있어 임의 보완은 필요하지 않았다. 랑그릿사 II는 기존 설정의 엘윈을 사용했다.

- 이미지 34장과 썸네일 34장, 생성기 기록·원본 SHA-256·프롬프트 해시·검수 결과를 그림 저장소에 반영했다. 원본 PNG는 올리지 않았다.
- 코드 기준은 `d0728f6`, 작업 ID는 `game-costume-7ba9ed-20261101`이다. 공식 조립부로 만든 프롬프트를 수정하지 않고 사용했다. 상세 UI 상태와 최종 프롬프트는 각 그림의 `*-ui.json`에 있다.
- 원격 main은 연결된 GitHub 기능의 fast-forward 갱신(`force: false`, 현재 HEAD 확인)으로 반영했다. 셸 Git의 쓰기 인증 부재로 push 명령은 인증 단계에서 실패했고, 이후 연결된 기능을 사용했다. 강제 push·기존 파일 삭제는 없었다.
- 기존 일상컷은 보존했고 다음 번호에 추가했다. 메탈 기어 솔리드는 13번, 테트리스와 LoL은 8번, 일부 게임은 7번이다.
- 로컬은 `/workspace/shared-git/game-atelier.git`·`game-atelier-img.git`을 재사용한 별도 sparse worktree다. 기준 이미지·현재 일상 UI 상태·필요 규칙과 스크립트만 가져왔다.

## 등록·검증

- 34장 모두 1024×1536이며 WebP 품질 90·method 6으로 변환했다.
- 34장의 로컬/원격 Git blob, 변환 이미지 해시, 프롬프트 해시, 기준 이미지 경로와 코스튬 갈래를 확인했다.
- 34장 모두 자동 등록된 `data/img.json`과 원격 썸네일에 존재한다. 도감 데이터는 직접 편집하지 않았다.
- 게임별 `game-design.py conflicts` 34개 모두 종료 코드 0. 등록기 테스트와 패치 기록 검사 통과.
- [마지막 이미지 썸네일 워크플로](https://github.com/polos0117/game-atelier-img/actions/runs/41311623635)와 [이미지 사이트 배포](https://github.com/polos0117/game-atelier-img/actions/runs/41311685019) 성공을 확인했다.

## 검수 결과

10장은 통과, 24장은 구도·좌우 손·의상·배경 등의 불일치를 `qa.passed: false`로 남겼다. `docs/IMAGE_AUTOMATION.md` 0·4절의 사용자 승인에 따라 이런 결과는 임의 재생성하지 않고 지적을 기록해 올렸다. **검수 지적이 없는 완성본 34장이라는 뜻은 아니다.**

눈에 띄는 지적: 스트리트 파이터 II의 추가 팔, 팩맨과 WoW의 마스코트 얼굴 같은 장식, 조조전 깃발의 읽히는 한자. 아래 각 검수 링크에 구체적인 관찰과 원인이 있다.

일부 초기 게임은 예전 일상컷 UI 기록이 없어 기존 컷과 묶음 중복을 전부 대조할 수 없었다. 기존 기록에서 이미 넘긴 한도나 새 컷의 프레이밍·시대 반복 등은 각 `costume-plan-20261101.json`의 `legacy_record_gaps`에 남겼다. 이 작업은 기존 다섯 장을 재구성하지 않고 코스튬 한 장만 추가한 범위다.

## 안전 필터 재시도

랑그릿사 II는 `bold` 거절 후 `moderate`로 낮춰 성공했다. 페르소나 5는 같은 지시문 재시도와 `moderate`·`low`에서도 거절되어 장면을 한 번 재계획했다. 침실 바닥 앉기 대신 연회장 전신 장면에 불투명한 코트·조끼·타이츠를 명시했고 `low` 설정으로 성공했다. 그 밖의 이미지에는 임의 재생성이 없다. 거절 요청 ID·노출 단계·프롬프트 해시는 각 `casual6-attempts.json`에 남겼다.

## 이미지와 반영 커밋

| 게임 | 코스튬 | 추가 일상컷 | 검수 | 반영 커밋 |
|---|---|---|---|---|
| 팩맨 | 팩맨(마스코트) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/pacman_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/pacman/casual6-import.json) | [861d231](https://github.com/polos0117/game-atelier-img/commit/861d23122ec0d8bdfb713b4d261c38c3c9459158) |
| 테트리스 | 테트로미노 블록 | [8번](https://github.com/polos0117/game-atelier-img/blob/main/img/tetris_glossy_kr_game_f_casual8.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/tetris/casual8-import.json) | [24b9031](https://github.com/polos0117/game-atelier-img/commit/24b9031319ce1425fbd93be4277148081be9ade8) |
| 슈퍼 마리오 브라더스 | 마리오 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/super_mario_bros_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/super_mario_bros/casual6-import.json) | [f364cdf](https://github.com/polos0117/game-atelier-img/commit/f364cdfbf5c5f3ff7cc8b94d0adebcb1bd8226a0) |
| 젤다의 전설 | 링크 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/legend_of_zelda_glossy_kr_game_f_casual6.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/legend_of_zelda/casual6-import.json) | [ddf39b1](https://github.com/polos0117/game-atelier-img/commit/ddf39b1db63b441f9e295b1b51089aa02c716b65) |
| 드래곤 퀘스트 | 슬라임(마스코트) | [7번](https://github.com/polos0117/game-atelier-img/blob/main/img/dragon_quest_glossy_kr_game_f_casual7.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/dragon_quest/casual7-import.json) | [ef2f6e2](https://github.com/polos0117/game-atelier-img/commit/ef2f6e2034f8cc08bc33c0c9fab104ed23a7d6d1) |
| 스트리트 파이터 II | 류 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/street_fighter_2_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/street_fighter_2/casual6-import.json) | [add9a3c](https://github.com/polos0117/game-atelier-img/commit/add9a3c3bf87f1479cb3b71f1549661a256e3223) |
| 심시티 | 시장(플레이어) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/simcity_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/simcity/casual6-import.json) | [204a0cd](https://github.com/polos0117/game-atelier-img/commit/204a0cd2517274d6078567e5140fd4155fc27832) |
| 스타크래프트 | 테란 해병 | [7번](https://github.com/polos0117/game-atelier-img/blob/main/img/starcraft_glossy_kr_game_f_casual7.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/starcraft/casual7-import.json) | [4b71261](https://github.com/polos0117/game-atelier-img/commit/4b71261c0dd663e4f22a024587b7a1f7612c4a12) |
| 마인크래프트 | 스티브 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/minecraft_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/minecraft/casual6-import.json) | [21ec10d](https://github.com/polos0117/game-atelier-img/commit/21ec10d561477e36d1fdda68e9c82c85c0906689) |
| 다크 소울 | 선택받은 불사자(상급 기사) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/dark_souls_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/dark_souls/casual6-import.json) | [3e62d7d](https://github.com/polos0117/game-atelier-img/commit/3e62d7dd3195b076031904b357cf065d39468021) |
| 월드 오브 워크래프트 | 멀록(마스코트) | [7번](https://github.com/polos0117/game-atelier-img/blob/main/img/world_of_warcraft_glossy_kr_game_f_casual7.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/world_of_warcraft/casual7-import.json) | [623ec54](https://github.com/polos0117/game-atelier-img/commit/623ec54c0edbf7e5cce7644cfd1342190c973f2c) |
| 창세기전 3 | 창세기전 3의 주인공 기사 | [7번](https://github.com/polos0117/game-atelier-img/blob/main/img/war_of_genesis_3_glossy_kr_game_f_casual7.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/war_of_genesis_3/casual7-import.json) | [1272162](https://github.com/polos0117/game-atelier-img/commit/1272162eb1b10fb84f961b3d056dd08a0bc24d3d) |
| 삼국지 조조전 | 조조 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/sangokushi_sousouden_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/sangokushi_sousouden/casual6-import.json) | [0d77b07](https://github.com/polos0117/game-atelier-img/commit/0d77b07d89dc52f9612dbf96474cff2a59267355) |
| 그랜드 테프트 오토 V | 주인공 셋의 강도 차림 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/grand_theft_auto_v_glossy_kr_game_f_casual6.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/grand_theft_auto_v/casual6-import.json) | [4f0efda](https://github.com/polos0117/game-atelier-img/commit/4f0efdae297dfc5d23edf2973c1d1975662add36) |
| 리그 오브 레전드 | 포로(마스코트) | [8번](https://github.com/polos0117/game-atelier-img/blob/main/img/league_of_legends_glossy_kr_game_f_casual8.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/league_of_legends/casual8-import.json) | [c171489](https://github.com/polos0117/game-atelier-img/commit/c17148974cde79c78710d2bfee20becccb210f1f) |
| 위쳐 3: 와일드 헌트 | 게롤트(위처) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/witcher_3_glossy_kr_game_f_casual6.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/witcher_3/casual6-import.json) | [bfa04c7](https://github.com/polos0117/game-atelier-img/commit/bfa04c70999e1da6c1fd0714d8779ebbc9c7d639) |
| 문명 V | 개척자(정착민 유닛) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/civilization_v_glossy_kr_game_f_casual6.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/civilization_v/casual6-import.json) | [b8fb41f](https://github.com/polos0117/game-atelier-img/commit/b8fb41fddce856f5cdcbb136251ca93b295649d8) |
| 히어로즈 오브 마이트 앤 매직 3 | 성 진영 영웅 기사 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/heroes_of_might_and_magic_3_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/heroes_of_might_and_magic_3/casual6-import.json) | [48faf4e](https://github.com/polos0117/game-atelier-img/commit/48faf4e8211016a0ad56f0c33c6f6345a3aee7ba) |
| 데이브 더 다이브 | 데이브(잠수부) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/dave_the_diver_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/dave_the_diver/casual6-import.json) | [d26921d](https://github.com/polos0117/game-atelier-img/commit/d26921d9aed64f2525a47a44892408e692a482f0) |
| 대항해시대 4 | 주인공 선장 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/uncharted_waters_4_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/uncharted_waters_4/casual6-import.json) | [347540e](https://github.com/polos0117/game-atelier-img/commit/347540eefe7bb4c0e6ba429683ccb92b6cbd8c50) |
| 디아블로 II | 아마존 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/diablo_2_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/diablo_2/casual6-import.json) | [875a590](https://github.com/polos0117/game-atelier-img/commit/875a5903448dfe2f20a1d826429385f2d9c8b725) |
| 워크래프트 III | 제이나 프라우드무어 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/warcraft_3_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/warcraft_3/casual6-import.json) | [5f58ea2](https://github.com/polos0117/game-atelier-img/commit/5f58ea25ad5b9897fb6b3cb7015fc8738597d2e5) |
| 리니지 | 군주 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/lineage_glossy_kr_game_f_casual6.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/lineage/casual6-import.json) | [45cc9ff](https://github.com/polos0117/game-atelier-img/commit/45cc9ff91fed6f4aa9c3211bb0abb5a013c67fea) |
| 스타듀 밸리 | 농부(플레이어) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/stardew_valley_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/stardew_valley/casual6-import.json) | [5c6e041](https://github.com/polos0117/game-atelier-img/commit/5c6e041152ddbfeb0cb44b9d96d1e6795b77598a) |
| 영웅전설: 섬의 궤적 | 린 슈바르처(VII반) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/trails_of_cold_steel_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/trails_of_cold_steel/casual6-import.json) | [ff7b97e](https://github.com/polos0117/game-atelier-img/commit/ff7b97eed434d12e49daf7fc1b29fb40933cfcf7) |
| 하스스톤 | 여관 주인 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/hearthstone_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/hearthstone/casual6-import.json) | [66a014b](https://github.com/polos0117/game-atelier-img/commit/66a014bebfc0e1e4aba049708b6eddb03ba465b8) |
| 프리스타일 | 길거리 농구 선수 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/freestyle_glossy_kr_game_f_casual6.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/freestyle/casual6-import.json) | [412a74d](https://github.com/polos0117/game-atelier-img/commit/412a74d80ce6113e1854c092c4d15b3fe8165652) |
| 파이널 판타지 VII | 클라우드 스트라이프 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/final_fantasy_7_glossy_kr_game_f_casual6.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/final_fantasy_7/casual6-import.json) | [a8ee236](https://github.com/polos0117/game-atelier-img/commit/a8ee236c16d26646fa525376f7de71d4e67e6933) |
| 크로노 트리거 | 크로노 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/chrono_trigger_glossy_kr_game_f_casual6.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/chrono_trigger/casual6-import.json) | [54f344f](https://github.com/polos0117/game-atelier-img/commit/54f344f0e8285d3029c8854744adda7d9581c611) |
| 바이오하자드 2 | 클레어 레드필드 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/resident_evil_2_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/resident_evil_2/casual6-import.json) | [605fdd5](https://github.com/polos0117/game-atelier-img/commit/605fdd50127d289f66ef783d668e1a65f1c879b4) |
| 페르소나 5 | 조커(괴도단) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/persona_5_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/persona_5/casual6-import.json) | [60be2d8](https://github.com/polos0117/game-atelier-img/commit/60be2d86d182f7875eeacf590ccd177f0f43c87f) |
| 메탈 기어 솔리드 | 솔리드 스네이크 | [13번](https://github.com/polos0117/game-atelier-img/blob/main/img/metal_gear_solid_glossy_kr_game_f_casual13.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/metal_gear_solid/casual13-import.json) | [e23b67d](https://github.com/polos0117/game-atelier-img/commit/e23b67d0f379d42bb437f10a54ea606af9e33b68) |
| 랑그릿사 II | 엘윈 | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/langrisser_2_glossy_kr_game_f_casual6.webp) | [통과](https://github.com/polos0117/game-atelier-img/blob/main/records/langrisser_2/casual6-import.json) | [dc9602f](https://github.com/polos0117/game-atelier-img/commit/dc9602f531c863d618f850f60d0d1ed6ed044159) |
| 클레르 옵스퀴르: 33 원정대 | 원정대원(구스타브·마엘) | [6번](https://github.com/polos0117/game-atelier-img/blob/main/img/clair_obscur_expedition_33_glossy_kr_game_f_casual6.webp) | [지적 있음](https://github.com/polos0117/game-atelier-img/blob/main/records/clair_obscur_expedition_33/casual6-import.json) | [7e806ea](https://github.com/polos0117/game-atelier-img/commit/7e806ea0976e4f1502869715b78c52e90f6106ad) |

## 지적 원인


- **팩맨 6번** — 코스튬의 wedge-shaped cut-out motif가 캐릭터 얼굴 장식으로 구체화되었고, 인물 강조가 environmental long shot·왼쪽 시선을 덮었다. 자동 검수 규칙에 따라 재생성 없이 기록.
- **슈퍼 마리오 브라더스 6번** — 측면 몸 방향·소품 응시보다 웃는 표정과 코스튬 식별성이 강조됨
- **드래곤 퀘스트 7번** — 원본 방향을 일부 따라가 계획의 좌우 손·측면 방향이 뒤바뀜
- **스트리트 파이터 II 6번** — 뒤 3/4 어깨 너머+한 손 소품+다른 손 내림에서 어깨 배치가 겹쳐 팔이 추가됨; 자동 작업 규칙대로 재생성하지 않음
- **심시티 6번** — 턱 괴는 자세의 좌우가 반대로 생성됨
- **스타크래프트 7번** — wall_hair 추천의 좌우 손과 프레이밍을 모델이 반전·확장함
- **마인크래프트 6번** — 측면 앉기에서 코스튬 정면을 강조하며 몸과 손 배치가 변함
- **다크 소울 6번** — 원본 갑옷의 시각적 영향이 WARDROBE 변경 지시보다 강함
- **월드 오브 워크래프트 7번** — 멀록 fin-crested hood를 눈이 달린 동물 후드로 구체화함
- **창세기전 3 7번** — 기준 의상 영향과 앉은 자세 기본형이 코스튬·발목 교차 지시를 덮음
- **삼국지 조조전 6번** — 원본 배경의 진영과 깃발 글자를 복제함
- **리그 오브 레전드 8번** — 포즈는 지켰으나 카메라와 눈맞춤이 GAZE at_prop를 덮음
- **히어로즈 오브 마이트 앤 매직 3 6번** — 측면·좌우 손보다 뒤쪽 망토 문양이 강조됨
- **데이브 더 다이브 6번** — 원본 잠수장비 팔레트 영향으로 탱크 색이 바뀌고 꽃 작업 상체를 강조함
- **대항해시대 4 6번** — 턱 괴는 자세에서 좌우 반전
- **디아블로 II 6번** — 오른손 난간·왼손 머리 만지기 지시를 반전함
- **워크래프트 III 6번** — 앉은 코스튬 초상 기본형이 측면·소품 응시를 덮음
- **스타듀 밸리 6번** — 코스튬 뒤 장식과 리본을 강조하며 방향·손 좌우가 달라짐
- **영웅전설: 섬의 궤적 6번** — 원본 교복 실루엣을 강하게 이어받음
- **하스스톤 6번** — 낮은 손 위치보다 인사하는 초상 포즈가 강조됨
- **바이오하자드 2 6번** — 뒤 3/4에서 손 좌우가 반전됨
- **페르소나 5 6번** — 보통·적게 노출에서도 거절되어 한 번 장면 재계획. 전신 코스튬 생성에는 성공했으나 기준 이미지의 뒤돌아 마스크 드는 포즈를 따라감
- **메탈 기어 솔리드 13번** — 포개진 다리 원근과 높은 상체로 전신 다리·발 분리 확인이 제한됨
- **클레르 옵스퀴르: 33 원정대 6번** — 원본 의상·항구 배경이 코스튬·별 무대 변경 지시보다 강함
