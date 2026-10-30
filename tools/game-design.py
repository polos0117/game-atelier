#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""게임 설계표(data/game-design.json) 검사. docs/GAME_CONCEPT.md 1·3·4·5절의 규칙을 기계로 본다.
book-atelier 의 tools/book-design.py 에서 왔다 — 폼 이름·저작권 칸·시리즈 자매·사실 칸이 다르다.

  python3 tools/game-design.py check   — 어기는 칸이 있으면 1 로 끝난다. 경고(!)는 알리기만 한다

보는 것:
  - 칸이 다 찼나(이름·인격·욕망·갈등·상징 셋·능력 원리·장소·권리사·그리지 않을 것)
  - 정한 말(vocab)만 썼나 — 장르·묶음·시대·실루엣 축 6·얼굴 5 묶음·역할·얼굴 계통·입자
  - 묶음(group)이 장르에 맞나 — 결투 상성은 묶음으로 돈다
  - 어느 두 게임도 실루엣 축 6 중 셋 이상, 얼굴 5 묶음 중 둘 이상 다르다
  - 같은 시리즈 자매(series)는 서로를 적고, 얼굴 윤곽(face_shape)이 같다
  - 폼·개방이 타이틀·중반·엔딩 셋씩, 폼마다 다른 자세·배경(setting), 개방은 한 명으로 표현된다고 확인했다(one_figure)
  - 고유 규칙: 능력 원리 하나(mechanic) + 폼별 쓰임 셋 + 상대의 대응. 결투는 장(章)·자리로 돈다 — 줄(lane) 말은 못 쓴다
  - 사실 칸(facts)은 도구만 채운다 — 받은 적(fetched) 없이 연도·개발사가 적혀 있으면 지어낸 것으로 본다.
    받은 연도가 시대(era)의 해와 어긋나면 경고한다
  - 시범(pilot)은 폼 하나·개방 하나, 시범끼리 장르가 겹치지 않는다"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "game-design.json")
STAGES = ["타이틀", "중반", "엔딩"]
SIL = ["body", "hair", "garment", "material", "pose", "palette"]
FACE = ["face_shape", "eyes", "brows", "nose", "lips"]
SIL_MIN, FACE_MIN = 3, 2
# 줄(lane) 말 — 결투는 책장 넘기기(장·자리·맞은편)다. "줄어든다·줄기" 는 걸리지 않게 조사까지 본다
LANE_WORDS = re.compile(r"(이|다른|같은|뒷|앞|한) ?줄|줄(을|에|로|마다| 전체| 안| 하나)")
TEXT = ["key", "title", "title_en", "persona", "desire", "conflict", "mechanic", "place", "rights"]
FACT_KEYS = {"qid", "fetched", "year", "developer", "publisher", "platforms", "genres", "series", "modes", "wiki"}


def check(doc):
    errs = []
    V = doc.get("vocab") or {}
    games = doc.get("games") or []
    groups = V.get("group") or {}
    fk = V.get("form_key") or {}
    if sorted(fk) != sorted(STAGES) or len(set(fk.values())) != 3 or \
            not all(isinstance(v, str) and v.isascii() and v.isalpha() and v.islower() for v in fk.values()):
        errs.append("vocab.form_key 는 타이틀·중반·엔딩 셋을 겹치지 않는 영문 소문자 열쇠로")
    if sorted(g for gs in groups.values() for g in gs) != sorted(V.get("genre") or []):
        errs.append("vocab.group 은 장르마다 묶음 하나 — 빠지거나 두 번 든 장르가 있다")
    keys = [g.get("key") for g in games]
    if len(set(keys)) != len(keys):
        errs.append("key 가 겹친다")
    byk = {g.get("key"): g for g in games}
    for g in games:
        who = g.get("title") or g.get("key") or "?"
        bad = lambda m: errs.append("%s: %s" % (who, m))
        for k in TEXT:
            if not str(g.get(k) or "").strip():
                bad("%s 이(가) 비었다" % k)
        # 열쇠는 그림 파일 이름 맨 앞에 들어간다(<key>_<폼>_<화풍>_f.webp) — 영문 소문자·숫자·밑줄만
        if g.get("key") and not re.fullmatch(r"[a-z][a-z0-9_]*", g["key"]):
            bad("key 는 영문 소문자·숫자·밑줄만 — 그림 파일 이름에 그대로 들어간다")
        if len(g.get("symbols") or []) != 3:
            bad("상징은 셋")
        # 알아볼 거리 — 팬이 바로 알아볼 원작 소품·장소·색·문장. 일반화한 상징만으로는 어느 게임인지 티가 안 났다(2026-10-28)
        sig = [str(x).strip() for x in (g.get("signature") or [])]
        if not 3 <= len(sig) <= 4 or not all(sig):
            bad("알아볼 거리(signature)는 셋이나 넷")
        elif len(set(sig)) != len(sig):
            bad("알아볼 거리(signature)가 겹친다")
        # 손에 들 수 있는 알아볼 거리의 번호 — 일상컷 버전2 소품(sig_hold · sig_raise · sig_both)은 이것만. 장소 · 풍경은 배경에 남는다
        # (데이브 더 다이브 「블루 홀의 깊고 푸른 바다」 를 가슴 높이에 들었다, 검토 2026-10-30). 비어 있으면 알아볼 거리를 소품으로 들지 않는다
        hold = g.get("signature_hold")
        if not isinstance(hold, list) or not all(isinstance(i, int) and 0 <= i < len(sig) for i in hold) or len(set(hold)) != len(hold):
            bad("손에 들 알아볼 거리(signature_hold)는 signature 번호 목록 — 없으면 []")
        if not [a for a in (g.get("avoid") or []) if str(a).strip()]:
            bad("그리지 않을 것(avoid — 게임 속 캐릭터·로고·UI)을 적는다")
        v = g.get("voice")
        for k in STAGES:
            if not str((v if isinstance(v, dict) else {}).get(k) or "").strip():
                bad("voice 의 %s 이(가) 비었다" % k)
            elif len(v[k]) > 70:
                bad("voice 의 %s 이(가) 너무 길다(70자까지)" % k)
        if g.get("genre") not in V.get("genre", []):
            bad("장르 %r 는 정한 말이 아니다" % g.get("genre"))
        elif g.get("genre") not in groups.get(g.get("group"), []):
            bad("묶음 %r 에 장르 %r 가 없다 — 결투 상성이 어긋난다" % (g.get("group"), g.get("genre")))
        if g.get("era") not in V.get("era", []):
            bad("시대 %r 는 정한 말이 아니다(%s)" % (g.get("era"), "·".join(V.get("era", []))))
        if g.get("ethnicity") not in V.get("ethnicity", []):
            bad("얼굴 계통 ethnicity=%r 는 정한 말이 아니다" % g.get("ethnicity"))
        for k in SIL:
            if (g.get("silhouette") or {}).get(k) not in V.get(k, []):
                bad("실루엣 %s=%r 는 정한 말이 아니다" % (k, (g.get("silhouette") or {}).get(k)))
        # 머리색·눈 색 — 게임 대표색. 정한 말에 검정·갈색은 없다(안 고르면 흑발로 흘렀다)
        if (g.get("silhouette") or {}).get("hair_color") not in V.get("hair_color", []):
            bad("머리색 hair_color=%r 는 정한 말이 아니다" % (g.get("silhouette") or {}).get("hair_color"))
        if (g.get("face") or {}).get("eye_color") not in V.get("eye_color", []):
            bad("눈 색 eye_color=%r 는 정한 말이 아니다" % (g.get("face") or {}).get("eye_color"))
        for k in FACE:
            if (g.get("face") or {}).get(k) not in V.get(k, []):
                bad("얼굴 %s=%r 는 정한 말이 아니다" % (k, (g.get("face") or {}).get(k)))
        # 시리즈 자매 — 서로를 적고, 얼굴 윤곽이 같다
        for s in g.get("series") or []:
            o = byk.get(s)
            if o is None or s == g.get("key"):
                bad("시리즈 자매 %r 가 설계표에 없다" % s)
                continue
            if g.get("key") not in (o.get("series") or []):
                bad("시리즈 자매 %s 가 이쪽을 적지 않았다 — 자매는 서로 적는다" % s)
            if (o.get("face") or {}).get("face_shape") != (g.get("face") or {}).get("face_shape"):
                bad("시리즈 자매 %s 와 얼굴 윤곽(face_shape)이 다르다" % s)
        # 사실 칸 — 도구만 채운다
        f = g.get("facts")
        if not isinstance(f, dict) or set(f) != FACT_KEYS:
            bad("facts 칸 모양이 틀렸다 — %s" % ", ".join(sorted(FACT_KEYS)))
        elif not f.get("fetched"):
            filled = [k for k in FACT_KEYS - {"qid", "fetched", "wiki"} if f.get(k)] + \
                     [k for k in ("ko", "en") if (f.get("wiki") or {}).get(k)]
            if filled:
                bad("받은 적 없는(fetched 없음) 사실 칸이 차 있다: %s — tools/fetch-games.py 로만 채운다" % ", ".join(sorted(filled)))
        if isinstance(f, dict) and f.get("qid") is not None and not re.fullmatch(r"Q[1-9][0-9]*", str(f["qid"])):
            bad("facts.qid %r 는 Wikidata 열쇠 꼴(Q숫자)이 아니다" % f["qid"])
        # 폼·개방
        forms, opens = g.get("forms") or {}, g.get("opens") or {}
        if sorted(forms) != sorted(STAGES) or sorted(opens) != sorted(STAGES):
            bad("폼·개방은 타이틀·중반·엔딩 셋씩")
        for s in STAGES:
            fm = forms.get(s) or {}
            if not str(fm.get("look") or "").strip():
                bad("%s 폼의 모습이 비었다" % s)
            if fm.get("role") not in V.get("role", []):
                bad("%s 폼의 역할 %r 는 정한 말이 아니다" % (s, fm.get("role")))
            if not str(fm.get("pose") or "").strip():
                bad("%s 폼의 자세(pose)가 비었다" % s)
            # 원작풍 장비 — 그 게임의 직업·진영 장비 느낌. 원작 인물의 차림은 avoid 몫(2026-10-28)
            if not str(fm.get("homage") or "").strip():
                bad("%s 폼의 원작풍 장비(homage)가 비었다" % s)
            # 배경 — 폼마다 다른 곳·빛. 없으면 이어가기가 첫 그림의 배경을 그대로 썼다(2026-10-26 테트리스)
            if not str(fm.get("setting") or "").strip():
                bad("%s 폼의 배경(setting)이 비었다" % s)
            elif str(fm.get("setting")).strip() == str((opens.get(s) or {}).get("scene") or "").strip():
                bad("%s 폼의 배경이 개방 명장면과 같다 — 명장면은 개방 그림 몫이다" % s)
            o = opens.get(s) or {}
            if not str(o.get("scene") or "").strip():
                bad("%s 개방의 장면이 비었다" % s)
            if o.get("one_figure") is not True:
                bad("%s 개방을 한 명(그녀 + 사물·환경)으로 표현할 수 있는지 확인하지 않았다" % s)
            if o.get("particles") not in V.get("particles", []):
                bad("%s 개방의 입자 particles=%r 는 정한 말이 아니다" % (s, o.get("particles")))
        if len({str((forms.get(s) or {}).get("setting") or "").strip() for s in STAGES}) < 3:
            bad("세 폼의 배경이 겹친다 — 넘겨 볼 때 같은 장면처럼 보인다")
        if len({(forms.get(s) or {}).get("pose") for s in STAGES}) < 3:
            bad("세 폼의 자세가 겹친다 — 넘겨 볼 때 같은 그림처럼 보인다")
        if len({(forms.get(s) or {}).get("role") for s in STAGES}) < 2:
            bad("세 폼의 역할이 다 같다 — 위아래가 아니라 쓰임이 달라야 한다")
        # 고유 규칙
        r = g.get("rule") or {}
        if sorted(r.get("forms") or {}) != sorted(STAGES) or not all(str(x).strip() for x in (r.get("forms") or {}).values()):
            bad("고유 규칙의 폼별 쓰임이 셋 다 있어야 한다")
        if not str(r.get("counter") or "").strip():
            bad("상대의 대응 방법이 없다")
        for where, s in [("원리", g.get("mechanic")), ("대응", r.get("counter"))] + \
                [("%s 쓰임" % k, x) for k, x in (r.get("forms") or {}).items()]:
            if LANE_WORDS.search(str(s or "")):
                bad("고유 규칙 %s 에 줄(lane) 말이 있다 — 결투는 장(章)·자리·맞은편으로 쓴다: %s" % (where, s))
        p = g.get("pilot")
        if p is not None and (p.get("form") not in STAGES or p.get("open") not in STAGES):
            bad("시범은 폼 하나·개방 하나(타이틀·중반·엔딩 중)")
    # 어느 두 게임도 — 실루엣·얼굴
    for i in range(len(games)):
        for j in range(i + 1, len(games)):
            a, c = games[i], games[j]
            pair = "%s·%s" % (a.get("title"), c.get("title"))
            sd = sum((a.get("silhouette") or {}).get(k) != (c.get("silhouette") or {}).get(k) for k in SIL)
            fd = sum((a.get("face") or {}).get(k) != (c.get("face") or {}).get(k) for k in FACE)
            if sd < SIL_MIN:
                errs.append("%s: 실루엣 축 6 중 %d 개만 다르다(%d 이상)" % (pair, sd, SIL_MIN))
            if fd < FACE_MIN:
                errs.append("%s: 얼굴 5 묶음 중 %d 개만 다르다(%d 이상)" % (pair, fd, FACE_MIN))
            ca = ((a.get("silhouette") or {}).get("hair_color"), (a.get("face") or {}).get("eye_color"))
            if ca == ((c.get("silhouette") or {}).get("hair_color"), (c.get("face") or {}).get("eye_color")):
                errs.append("%s: 머리색·눈 색이 둘 다 같다" % pair)
    pilots = [g for g in games if g.get("pilot")]
    for i in range(len(pilots)):
        for j in range(i + 1, len(pilots)):
            a, c = pilots[i], pilots[j]
            if a.get("genre") == c.get("genre"):
                errs.append("시범 %s·%s: 장르가 같다" % (a["title"], c["title"]))
    return errs


def warnings(doc):
    """막지는 않고 알리는 것 — 아직 안 받은 사실 칸, 받은 연도와 시대가 어긋난 게임"""
    out = []
    span = (doc.get("vocab") or {}).get("era_years") or {}
    games = doc.get("games") or []
    left = [g.get("title") for g in games if not (g.get("facts") or {}).get("fetched")]
    if left:
        out.append("사실 칸을 아직 안 받았다 %d편 — python3 tools/fetch-games.py find <key> 로 QID 를 고르고 pull" % len(left))
    for g in games:
        f = g.get("facts") or {}
        y, e = f.get("year"), g.get("era")
        if isinstance(y, int) and e in span and not (span[e][0] <= y <= span[e][1]):
            out.append("%s: %d년인데 시대가 %s(%d–%d)다 — 시대를 다시 본다" % (g.get("title"), y, e, span[e][0], span[e][1]))
        if f.get("fetched"):
            empty = [k for k in ("year", "developer", "platforms") if not f.get(k)]
            if empty:
                out.append("%s: Wikidata 에 빈칸 %s — 위키백과를 보고 채운다" % (g.get("title"), ", ".join(empty)))
    # 같은 시리즈를 받았는데 자매로 안 묶인 짝 — 얼굴 윤곽을 맞출지 사람이 정한다
    by_series = {}
    for g in games:
        s = (g.get("facts") or {}).get("series") or {}
        if s.get("qid"):
            by_series.setdefault(s["qid"], []).append(g)
    for gs in by_series.values():
        for i in range(len(gs)):
            for j in range(i + 1, len(gs)):
                a, c = gs[i], gs[j]
                if c.get("key") not in (a.get("series") or []):
                    out.append("%s·%s: Wikidata 로는 같은 시리즈다 — series 에 서로 적고 얼굴 윤곽을 맞출지 본다"
                               % (a.get("title"), c.get("title")))
    return out


# ── 폼 지시문 충돌 후보(2026-10-29, GTA V) ──
# 그리기 전에 지시문을 보니 설계표 칸끼리 부딪혔다. 말 겹침으로 찾는 거라 사람이 보고 고치거나,
# 괜찮으면 그 게임의 conflicts_ok 에 열쇠(종류:말)를 적어 다음부터 안 뜨게 한다. 기본은 아직 그림이 없는 게임만 본다.
#   garment   — 타이틀 차림에 실루엣 복식 구조(garment)의 옷이 없다(「긴 코트에 바지」 ↔ 「데님 재킷과 짧은 반바지」)
#   sig_open  — 알아볼 거리가 개방 사건과 두 말 이상 겹친다(「경찰 헬기 탐조등」 ↔ 「헬기 탐조등이 휩쓸고」 — 중반·엔딩에 헬기).
#               한 말(물건 하나)만 겹치는 건 정상 — 물건은 폼에, 사건은 개방에(동굴 입구 ↔ 빛이 새는 동굴)
#   pose_open — 폼 자세가 그 폼 개방과 같은 물건·같은 동사다(「보물 상자 뚜껑을 열며」 ↔ 「보물 상자가 열리며」 — 개방 그림이 폼에서 벌써 일어난다).
#               물건만 같으면 정상 — 폼은 준비, 개방은 터짐(열쇠를 꽂는다 ↔ 자물쇠가 풀린다)
#   look_pose — 차림이 몸에 건 물건을 자세는 손에 든다(「목에 건 선글라스」 ↔ 「선글라스를 한 손에 들고」)
#   shoes     — 차림에 운동화가 있는데 그리지 않을 것에 상표 로고 금지가 없다(하이탑이 다 스우시를 달았다)
GARMENT_WORDS = {
    "one_piece_dress": ["원피스", "드레스"], "armor_layered": ["갑옷", "갑주", "판금", "철"], "robe_overlap": ["겹옷", "전포", "도포", "예복", "로브", "두루마기"],
    "tailored_suit": ["정장", "수트", "슈트", "재킷"], "coat_trousers": ["코트"], "layered_skirt": ["치마", "스커트"],
    "cloak_wrapped": ["망토", "두건", "클로크", "외투"], "flight_suit": ["비행복", "잠수복", "슈트", "수트"],
    "track_set": ["점퍼", "트랙", "저지"], "work_overalls": ["멜빵", "작업복"], "jacket_shorts": ["재킷"], "shirt_vest": ["조끼"],
}
PARTICLE = re.compile(r"(으로|에서|까지|처럼|마다|이며|이고|을|를|이|가|은|는|의|에|로|와|과|도|만)$")
STOP = {"그녀", "하나", "하나씩", "하늘", "순간", "둘레", "사이", "모든", "전체", "거대한", "작은", "위로", "아래", "앞으로", "속에서",
        "한꺼번에", "차례로", "그림자", "세상", "발밑", "그녀만", "빛나는", "빛으로", "빛이", "위에", "아래로", "끝으로", "이어지며", "푸른", "붉은", "누런"}
VERB_END = re.compile(r"(리며|며|고|는|어|아|여|ㄴ다|는다|인다|친다|른다|다|며서)$")
WORN = re.compile(r"(?:목|허리|등|머리|어깨|손목|이마|귀|가슴|발목)에\s*(?:건|맨|찬|두른|쓴|낀|꽂은|단|매단|올린)?\s*((?:[가-힣]{2,}\s){0,2}[가-힣]{2,})")
HELD = r"(?:을|를)\s+(?:한 손에\s+|두 손으로\s+|손에\s+)?(?:들|쥐|잡|돌리|뽑|내밀|흔들|겨누|펼쳐|받쳐)"


def words(text):
    """낱말 — 조사를 뗀 꼴과 그대로인 꼴 둘 다(「지도」 의 「도」 를 조사로 떼면 「지」 가 된다 — 문명 V 두루마리 지도를 못 잡았다)"""
    out = set()
    for w0 in re.findall(r"[가-힣]{2,}", text or ""):
        for w in (w0, PARTICLE.sub("", w0)):
            if len(w) >= 2 and w not in STOP:
                out.add(w)
    return out


def verbs(text):
    """동사 줄기 — 「열며」 → 열, 「열리며」 → 열 (리며를 떼고), 「터지며」 → 터지"""
    out = set()
    for w in re.findall(r"[가-힣]+(?:며|고|는|어|아|여|다)\b", text or ""):
        st = VERB_END.sub("", w)
        if st:
            out.add(st)
    return out


def drawn_keys():
    """그림이 이미 있는 게임 — data/img.json"""
    try:
        with open(os.path.join(os.path.dirname(DATA), "img.json"), encoding="utf-8") as f:
            img = json.load(f)
    except (OSError, ValueError):
        return set()
    return {k for k, v in (img.get("img") or {}).items() if v}


def conflicts(doc, only=None, include_drawn=False):
    """폼 지시문 충돌 후보 — (게임 key, 열쇠, 풀이). conflicts_ok 에 적힌 열쇠는 뺀다"""
    out = []
    stages = ["타이틀", "중반", "엔딩"]
    drawn = set() if (only or include_drawn) else drawn_keys()
    for g in doc.get("games") or []:
        if (only and g.get("key") != only) or g.get("key") in drawn:
            continue
        ok = set(g.get("conflicts_ok") or [])
        forms, opens = g.get("forms") or {}, g.get("opens") or {}
        found = []
        title = (forms.get("타이틀") or {}).get("look", "")
        gw = GARMENT_WORDS.get((g.get("silhouette") or {}).get("garment"), [])
        if gw and not any(w in title for w in gw):
            found.append(("garment:" + g["silhouette"]["garment"], "타이틀 차림 %r 에 복식 구조 %s(%s)의 옷이 없다" % (title, g["silhouette"]["garment"], "·".join(gw))))
        for sig in g.get("signature") or []:
            for st in stages:
                common = words(sig) & words((opens.get(st) or {}).get("scene", ""))
                if len(common) >= 2:
                    found.append(("sig_open:" + "·".join(sorted(common)), "알아볼 거리 %r 가 %s 개방 %r 와 「%s」 를 같이 말한다 — 폼에 그 사건이 미리 그려질 수 있다" % (sig, st, opens[st]["scene"], "·".join(sorted(common)))))
        for st in stages:
            pose, scene = (forms.get(st) or {}).get("pose", ""), (opens.get(st) or {}).get("scene", "")
            nouns = words(pose) & words(scene)
            vs = [(a, b) for a in verbs(pose) for b in verbs(scene) if a == b or (len(a) < len(b) and b.startswith(a)) or (len(b) < len(a) and a.startswith(b))]
            if nouns and vs:
                found.append(("pose_open:" + "·".join(sorted(nouns)), "%s 자세 %r 가 %s 개방 %r 와 같은 물건(%s)·같은 동사(%s)다 — 개방 사건이 폼에서 벌써 일어난다"
                              % (st, pose, st, scene, "·".join(sorted(nouns)), "·".join(sorted({a for a, _ in vs})))))
            look = (forms.get(st) or {}).get("look", "")
            for obj in WORN.findall(look):
                for head in {obj.split()[-1], PARTICLE.sub("", obj.split()[-1])}:
                    if len(head) < 2 or not re.search(re.escape(head) + HELD, pose):
                        continue
                    found.append(("look_pose:" + head, "%s 차림은 「%s」 를 몸에 거는데(%r) 자세는 손에 든다(%r)" % (st, head, look, pose)))
        looks = " ".join((forms.get(st) or {}).get("look", "") + " " + (forms.get(st) or {}).get("homage", "") for st in stages)
        if re.search(r"운동화|스니커|하이탑", looks) and not any("상표" in a for a in g.get("avoid") or []):
            found.append(("shoes", "차림에 운동화가 있는데 그리지 않을 것에 상표 로고 금지가 없다"))
        seen = set()
        for k, msg in found:
            if k not in ok and k not in seen:
                seen.add(k)
                out.append((g["key"], k, msg))
    return out


def main():
    if len(sys.argv) >= 2 and sys.argv[1] == "conflicts":
        with open(DATA, encoding="utf-8") as f:
            doc = json.load(f)
        args = [a for a in sys.argv[2:] if a != "--all"]
        rows = conflicts(doc, args[0] if args else None, "--all" in sys.argv)
        for key, k, msg in rows:
            print("  ? %s [%s] %s" % (key, k, msg))
        print("폼 지시문 충돌 후보 %d — 고치거나, 괜찮으면 그 게임 conflicts_ok 에 [열쇠]를 적는다" % len(rows))
        return
    if len(sys.argv) < 2 or sys.argv[1] != "check":
        raise SystemExit("python3 tools/game-design.py check | conflicts [key] [--all]")
    with open(DATA, encoding="utf-8") as f:
        doc = json.load(f)
    errs = check(doc)
    for w in warnings(doc):
        print("  ! " + w)
    n = len(conflicts(doc))
    if n:
        print("  ! 그림 없는 게임의 폼 지시문 충돌 후보 %d — python3 tools/game-design.py conflicts [key] 로 본다(그리기 전에 그 게임은 0)" % n)
    for e in errs:
        print("  ✗ " + e)
    if errs:
        print("게임 설계표 미통과 %d건" % len(errs))
        sys.exit(1)
    games = doc["games"]
    print("게임 설계표 통과 — %d편 · 시범 %d편 · 어느 두 게임도 실루엣 %d+·얼굴 %d+ 다름"
          % (len(games), sum(1 for g in games if g.get("pilot")), SIL_MIN, FACE_MIN))


if __name__ == "__main__":
    main()
