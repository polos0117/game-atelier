#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""일상컷 트리 버전2 표 검사 — data/casual-tree-v2.json (2026-10-30, docs/CASUAL_TREE_V2.md).

버전2 는 하는 일을 없애고 몸 쪽을 칸으로 나눈다:
    시대 → 장소 → 의상 → 몸 자세 · 받침 → 구도 → 오른손 · 왼손(인물 본인 기준) · 소품 동작 → 다리 → 시선
시대 · 장소 · 의상은 버전1 표(data/casual-tree.json)를 그대로 읽는다. 이 검사기는
  - 열쇠가 겹치지 않고, 가리키는 장소 · 묶음 · 시대 · 의상 계열 · 옷 · 프레이밍 · 자세 · 받침 · 소품 · 시선이 다 있다
  - 영어 칸에 한글이 없고 한국어 이름(ko)이 있다, 소품 동작 문장은 동작 하나(「 and 」 없음)
  - 소품마다 나오는 장소 · 쓰는 동작이 있고, 두 손 동작(both)은 손마다 하는 일(grip)이 있다
  - 의상 특징(pocket · strap · collar)과 어색한 조합(⚠)이 버전1 의상 · 장소를 가리킨다
  - 자세 추천이 고를 수 있는 길이다 — 두 손 칸이 다 차고, 손 자리가 그 컷에 보이고(아니면 가까운 컷의 「화면 밖」),
    다리는 다리가 보이는 컷에서만 · 자세 계열 안에서만, 받침 · 프레이밍은 자세가 받는 것, 가까운 컷에 뒤쪽 몸 방향 없음,
    그 자세 · 받침 · 손 · 다리가 다 되는 장소가 하나 이상(소품 동작이면 거기 그 꼴의 소품 동작도)
를 본다.

    python3 tools/casual-tree-v2.py check
    python3 tools/casual-tree-v2.py places <추천>     # 그 추천을 쓸 수 있는 장소
    python3 tools/casual-tree-v2.py places-all       # 추천마다 쓸 수 있는 장소(JSON — tests/casual-tree-v2.cjs 가 lib/casual-tree-v2.js 와 견준다)
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "casual-tree-v2.json")
BASE = os.path.join(ROOT, "data", "casual-tree.json")
HANGUL = re.compile(r"[가-힣]")
KINDS = {"hold": "one", "raise": "one", "both": "both"}
FEATURES = {"pocket", "strap", "collar"}
SIDES = ("right", "left")


def load(path=DATA, base=BASE):
    with open(path, encoding="utf-8") as f:
        doc = json.load(f)
    with open(base, encoding="utf-8") as f:
        v1 = json.load(f)
    return doc, v1


def by_key(rows):
    return {r["key"]: r for r in rows}


def expand(v1, refs):
    """장소 목록 — * 는 모든 장소, @묶음 은 그 묶음의 모든 장소, !장소 는 거기서 뺀다"""
    out, drop = [], set()
    for k in refs:
        if k == "*":
            out += [p["key"] for p in v1["places"]]
        elif k.startswith("@"):
            out += [p["key"] for p in v1["places"] if p["group"] == k[1:]]
        elif k.startswith("!"):
            drop.add(k[1:])
        else:
            out.append(k)
    return [k for k in dict.fromkeys(out) if k not in drop]


def place_ok(row, has):
    """needs 는 다, needs_any 는 하나 이상 — 장소의 받침(has)으로"""
    return set(row.get("needs", [])) <= has and (not row.get("needs_any") or bool(set(row["needs_any"]) & has))


def far_banned(v1):
    """버전1 frame_rules.no_orients 에 등 쪽이 있는 프레이밍 — 뒤쪽 몸 방향(far)을 받지 않는다"""
    return {f for f, r in v1["frame_rules"].items() if isinstance(r, dict) and "back" in r.get("no_orients", [])}


def use_fits(doc, use, pre):
    """소품 동작이 추천의 자세 · 프레이밍 · 시선에 맞나(장소 빼고)"""
    frames = doc["frames"]
    if use["kind"] != pre.get("prop_kind"):
        return False
    if pre["frame"] not in use["frames"] or pre["posture"] not in use["postures"]:
        return False
    if use["zone"] not in frames[pre["frame"]]["zones"]:
        return False
    if pre.get("gaze") and use.get("gaze") and use["gaze"] != pre["gaze"]:
        return False
    # 입 주변 같은 공간을 손 자세와 소품 동작이 같이 쓰지 않는다(입술에 검지 + 잔을 입에)
    hands = by_key(doc["hands"])
    if use.get("space") and any(hands.get(pre.get(s), {}).get("space") == use["space"] for s in SIDES):
        return False
    return True


def prop_places(doc, v1, prop):
    allowed = set(expand(v1, prop["places"]))
    if prop.get("eras"):
        allowed &= {p["key"] for p in v1["places"] if set(p.get("eras", [])) & set(prop["eras"])}
    return allowed


def preset_places(doc, v1, pre):
    """그 추천의 자세 · 받침 · 손 · 다리 · 소품 동작이 다 되는 장소"""
    postures, supports, hands, legs = (by_key(doc[k]) for k in ("postures", "supports", "hands", "legs"))
    rows = [postures.get(pre["posture"]), supports.get(pre["support"])]
    rows += [hands.get(pre[s]) for s in SIDES if pre[s] not in ("prop",)]
    if pre.get("legs"):
        rows.append(legs.get(pre["legs"]))
    rows = [r for r in rows if r]
    uses = [u for u in doc["prop_uses"] if use_fits(doc, u, pre)] if pre.get("prop_kind") else []
    props = by_key(doc["props"])
    out = []
    for place, has in doc["places"].items():
        has = set(has)
        if not all(place_ok(r, has) for r in rows):
            continue
        if pre.get("prop_kind") and not any(place in prop_places(doc, v1, props[u["prop"]]) for u in uses if u["prop"] in props):
            continue
        out.append(place)
    return out


def check(doc, v1):
    err = []
    places1 = by_key(v1["places"])
    groups1 = {g["key"] for g in v1["groups"]}
    eras1 = {e["key"] for e in v1["eras"]}
    fam1 = by_key(v1["outfits"])
    items1 = {i["key"] for o in v1["outfits"] for i in o["items"]}
    frames = {k: v for k, v in doc["frames"].items() if k != "note"}
    zones = {z for f in frames.values() for z in f["zones"]}

    def keys(name, rows):
        seen = set()
        for r in rows:
            if r["key"] in seen:
                err.append(f"{name} 열쇠 {r['key']} 가 겹친다")
            seen.add(r["key"])
            if not r.get("ko"):
                err.append(f"{name} {r['key']} 에 한국어 이름(ko)이 없다")
        return by_key(rows)

    def english(where, text):
        if isinstance(text, dict):
            for v in text.values():
                english(where, v)
        elif isinstance(text, str) and HANGUL.search(text):
            err.append(f"{where} 영어 칸에 한글: {text}")

    def ref(where, value, pool, what):
        if value not in pool:
            err.append(f"{where} 의 {what} {value} 가 없다")

    def place_refs(where, refs):
        for k in refs:
            if k == "*":
                continue
            if k.startswith("@"):
                ref(where, k[1:], groups1, "묶음")
            else:
                ref(where, k.lstrip("!"), places1, "장소")

    body, head, camera, gaze = (keys(n, doc[n]) for n in ("body", "head", "camera", "gaze"))
    supports, postures, hands, legs, props, uses = (keys(n, doc[n]) for n in ("supports", "postures", "hands", "legs", "props", "prop_uses"))
    presets = keys("presets", doc["presets"])
    for name in ("body", "head", "camera", "gaze", "supports", "postures", "hands", "legs", "props", "prop_uses"):
        for r in doc[name]:
            english(f"{name} {r['key']}", r.get("en", ""))
            for k in ("grip", "elbow"):
                english(f"{name} {r['key']}", r.get(k, ""))
    for k, h in doc["has"].items():
        english(f"has {k}", h.get("en", ""))

    # 받침 · 프레이밍 · 렌즈
    has_keys = set(doc["has"])
    for f, r in frames.items():
        for z in r["zones"]:
            if z not in zones:
                err.append(f"프레이밍 {f} 의 부위 {z}")
        if r["feet"] and not r["legs"]:
            err.append(f"프레이밍 {f} 는 발이 보이는데 다리가 안 보인다")
        if f not in doc["lens"]:
            err.append(f"프레이밍 {f} 의 렌즈가 없다")
        if not r.get("en"):
            err.append(f"프레이밍 {f} 의 COMPOSITION 말(en)이 없다")
        english(f"프레이밍 {f}", r.get("en", ""))
    for f, lens in doc["lens"].items():
        ref("렌즈", f, frames, "프레이밍")
        if lens == "wide24":
            err.append(f"프레이밍 {f} 에 광각 24mm — 버전2 는 쓰지 않는다")
    for f in far_banned(v1):
        ref("버전1 frame_rules", f, frames, "프레이밍")

    def needs(where, row):
        for k in row.get("needs", []) + row.get("needs_any", []):
            ref(where, k, has_keys, "받침")

    # 장소 받침 — 버전1 장소와 같은 열쇠
    for k, has in doc["places"].items():
        ref("장소 받침", k, places1, "장소")
        for h in has:
            ref(f"장소 {k}", h, has_keys, "받침")
    for k in places1:
        if k not in doc["places"]:
            err.append(f"장소 {k} 의 받침(has)이 없다")

    # 몸 자세 · 받침
    fams = set()
    for r in doc["supports"]:
        needs(f"받침 {r['key']}", r)
    for r in doc["postures"]:
        fams.add(r["family"])
        needs(f"자세 {r['key']}", r)
        for s in r["supports"]:
            ref(f"자세 {r['key']}", s, supports, "받침")
        for f in r["frames"]:
            ref(f"자세 {r['key']}", f, frames, "프레이밍")
        if not any(place_ok(r, set(h)) for h in doc["places"].values()):
            err.append(f"자세 {r['key']} 를 받는 장소가 없다")

    # 손 자세
    for r in doc["hands"]:
        w = f"손 {r['key']}"
        needs(w, r)
        if r["zone"] != "out":
            ref(w, r["zone"], zones, "부위")
        for p in r.get("postures", []):
            ref(w, p, postures, "자세")
        if r.get("outfit"):
            ref(w, r["outfit"], FEATURES, "의상 특징")
        if not r.get("both") and "{side}" not in r["en"]:
            err.append(f"{w} 의 영어 문장에 {{side}} 자리가 없다")

    # 다리 — postures 가 있으면 그 자세에서만(무릎 꿇기에 책상다리 X)
    for r in doc["legs"]:
        needs(f"다리 {r['key']}", r)
        for fam in r["families"]:
            ref(f"다리 {r['key']}", fam, fams, "자세 계열")
        for po in r.get("postures", []):
            ref(f"다리 {r['key']}", po, postures, "자세")
            if po in postures and postures[po]["family"] not in r["families"]:
                err.append(f"다리 {r['key']} 의 자세 {po} 가 다리 계열 밖")
    # 받침이 손을 가리면(배를 대고 — 두 팔뚝이 몸을 받친다) 그 손만
    for r in doc["supports"]:
        for k in r.get("hands", []):
            if k != "prop":
                ref(f"받침 {r['key']}", k, hands, "손")
    # 표정 — 눈썹 · 눈꺼풀 · 입 · 볼만. 시선 · 고개 말이 없다
    for k, text in doc.get("expressions", {}).items():
        english(f"표정 {k}", text)
        if re.search(r"\bgaze\b|\blooking\b|\blooks\b|\baway\b|\baside\b|camera|\bhead\b|\bchin\b|averted|darting|glanc|to the side|\bstare|directed", text):
            err.append(f"표정 {k} 에 시선 · 고개 말: {text}")
    if not doc.get("expressions"):
        err.append("버전2 표정 표(expressions)가 없다")

    # 소품 · 쓰는 동작
    for r in doc["props"]:
        w = f"소품 {r['key']}"
        place_refs(w, r["places"])
        for e in r.get("eras", []):
            ref(w, e, eras1, "시대")
        if not prop_places(doc, v1, r):
            err.append(f"{w} 이 나오는 장소가 없다")
        if not any(u["prop"] == r["key"] for u in doc["prop_uses"]):
            err.append(f"{w} 에 쓰는 동작이 없다")
    for r in doc["prop_uses"]:
        w = f"소품 동작 {r['key']}"
        ref(w, r["prop"], props, "소품")
        if KINDS.get(r["kind"]) is None:
            err.append(f"{w} 의 꼴 {r['kind']} — hold · raise · both 만")
        elif KINDS[r["kind"]] != r["hands"]:
            err.append(f"{w} 의 꼴 {r['kind']} 와 손 수 {r['hands']} 가 안 맞는다")
        if r["hands"] == "both" and set(r.get("grip", {})) != set(SIDES):
            err.append(f"{w} 는 두 손인데 손마다 하는 일(grip right · left)이 없다")
        ref(w, r["zone"], zones, "부위")
        for f in r["frames"]:
            ref(w, f, frames, "프레이밍")
        for p in r["postures"]:
            ref(w, p, postures, "자세")
        if r.get("gaze"):
            ref(w, r["gaze"], gaze, "시선")
        if "{prop}" not in r["en"]:
            err.append(f"{w} 의 영어 문장에 {{prop}} 자리가 없다")
        if re.search(r"\band\b", r["en"]):
            err.append(f"{w} 의 영어 문장이 동작 둘을 잇는다(and): {r['en']}")

    # 의상 특징
    of = doc["outfit_features"]
    for fam, feats in of["defaults"].items():
        ref("의상 특징 기본값", fam, fam1, "의상 계열")
        for x in feats:
            ref(f"의상 특징 {fam}", x, FEATURES, "특징")
    for fam in fam1:
        if fam not in of["defaults"]:
            err.append(f"의상 계열 {fam} 의 특징 기본값이 없다")
    for part in ("add", "remove"):
        for item, feats in of.get(part, {}).items():
            ref(f"의상 특징 {part}", item, items1, "옷")
            for x in feats:
                ref(f"의상 특징 {item}", x, FEATURES, "특징")
    for x in {h["outfit"] for h in doc["hands"] if h.get("outfit")}:
        if not any(x in v for v in of["defaults"].values()) and not any(x in v for v in of.get("add", {}).values()):
            err.append(f"의상 특징 {x} 를 가진 옷이 없다")

    # 어색한 조합
    for i, r in enumerate(doc["awkward"]):
        if not r.get("ko"):
            err.append(f"어색한 조합 {i} 에 한국어 이름(ko)이 없다")
        for fam in r["outfits"]:
            ref(f"어색한 조합 {r.get('ko', i)}", fam, fam1, "의상 계열")
        place_refs(f"어색한 조합 {r.get('ko', i)}", r["places"])

    # 자세 추천
    far = far_banned(v1)
    for p in doc["presets"]:
        w = f"추천 {p['key']}"
        n = len(err)
        ref(w, p["posture"], postures, "자세")
        ref(w, p["support"], supports, "받침")
        ref(w, p["frame"], frames, "프레이밍")
        ref(w, p["body"], body, "몸 방향")
        ref(w, p["head"], head, "머리 방향")
        ref(w, p["camera"], camera, "카메라 높이")
        if p.get("gaze"):
            ref(w, p["gaze"], gaze, "시선")
        if p.get("legs"):
            ref(w, p["legs"], legs, "다리")
        for s in SIDES:
            if not p.get(s):
                err.append(f"{w} 의 {s} 손 칸이 비었다")
            elif p[s] != "prop":
                ref(w, p[s], hands, f"{s} 손")
        if p.get("prop_kind") and p["prop_kind"] not in KINDS:
            err.append(f"{w} 의 소품 동작 꼴 {p['prop_kind']}")
        if len(err) > n:
            continue
        fr, po = frames[p["frame"]], postures[p["posture"]]
        if p["frame"] not in po["frames"]:
            err.append(f"{w} — 자세 {p['posture']} 는 프레이밍 {p['frame']} 를 받지 않는다")
        if p["support"] not in po["supports"]:
            err.append(f"{w} — 자세 {p['posture']} 에 받침 {p['support']} 가 붙지 않는다")
        if body[p["body"]].get("far") and p["frame"] in far:
            err.append(f"{w} — 가까운 컷 {p['frame']} 에 뒤쪽 몸 방향 {p['body']}")
        # 손 칸 둘
        sides = [p[s] for s in SIDES]
        n_prop = sides.count("prop")
        if n_prop and not p.get("prop_kind"):
            err.append(f"{w} — 손이 소품 동작을 하는데 꼴(prop_kind)이 없다")
        if p.get("prop_kind") and not n_prop:
            err.append(f"{w} — 소품 동작 꼴이 있는데 소품을 쓰는 손이 없다")
        if p.get("prop_kind") and n_prop and KINDS.get(p["prop_kind"]) != ("both" if n_prop == 2 else "one"):
            err.append(f"{w} — 소품 동작 {p['prop_kind']} 와 소품 쓰는 손 {n_prop} 개가 안 맞는다")
        if sides[0] == sides[1] and sides[0] not in ("out", "prop") and not hands[sides[0]].get("both"):
            err.append(f"{w} — 두 손이 같은 자세 {sides[0]} (같은 데를 두 손이 쓴다)")
        if sum(1 for s in sides if s.startswith("chin_")) > 1 and not (sides[0] == sides[1]):
            err.append(f"{w} — 두 손이 다 턱을 괸다")
        for s in SIDES:
            k = p[s]
            if k == "prop":
                continue
            h = hands[k]
            other = p["left" if s == "right" else "right"]
            if h.get("both") and other != k:
                err.append(f"{w} — 두 손 자세 {k} 인데 다른 손이 {other}")
            if h["zone"] == "out":
                if not fr["close"]:
                    err.append(f"{w} — {s} 손 「화면 밖」 은 가까운 컷만(지금 {p['frame']})")
            elif h["zone"] not in fr["zones"]:
                err.append(f"{w} — {s} 손 {k} 의 자리 {h['zone']} 가 {p['frame']} 에 안 보인다")
            if h.get("postures") and p["posture"] not in h["postures"]:
                err.append(f"{w} — {s} 손 {k} 는 자세 {p['posture']} 에서 못 한다")
        su = supports[p["support"]]
        for s in SIDES:
            if su.get("hands") and p[s] not in su["hands"]:
                err.append(f"{w} — 받침 {p['support']} 이 {s} 손 {p[s]} 를 못 하게 한다(두 팔뚝이 몸을 받친다)")
        # 등이 카메라 쪽인데 고개를 돌리지 않으면 카메라를 볼 수 없다
        if body[p["body"]].get("far") and not head[p["head"]].get("look_back") and p.get("gaze") == "camera":
            err.append(f"{w} — 등이 카메라 쪽({p['body']})인데 고개를 안 돌리고 카메라를 본다")
        # 다리
        if p.get("legs"):
            lg = legs[p["legs"]]
            if lg.get("postures") and p["posture"] not in lg["postures"]:
                err.append(f"{w} — 다리 {p['legs']} 는 자세 {p['posture']} 에서 못 한다")
            if not fr["legs"]:
                err.append(f"{w} — 다리 {p['legs']} 는 다리가 안 보이는 {p['frame']} 에서 못 고른다")
            if lg["feet"] and not fr["feet"]:
                err.append(f"{w} — 발 동작 {p['legs']} 는 전신 · 환경 컷만")
            if po["family"] not in lg["families"]:
                err.append(f"{w} — 다리 {p['legs']} 는 자세 계열 {po['family']} 밖")
        # 시선 — 소품을 보려면 소품이 있어야
        if p.get("gaze") == "at_prop" and not n_prop:
            err.append(f"{w} — 시선이 소품인데 소품을 쓰는 손이 없다")
        if p.get("prop_kind") and not any(use_fits(doc, u, p) for u in doc["prop_uses"]):
            err.append(f"{w} — 맞는 소품 동작({p['prop_kind']})이 없다")
            continue
        if not preset_places(doc, v1, p):
            err.append(f"{w} — 자세 · 받침 · 손 · 다리 · 소품이 다 되는 장소가 없다")
    for f in frames:
        if not any(p["frame"] == f for p in doc["presets"]):
            err.append(f"프레이밍 {f} 의 자세 추천이 없다")

    # 버전1 기록 → 버전2 칸
    L = doc.get("legacy", {})
    fields = {"posture": postures, "support": supports, "legs": legs, "right": hands, "left": hands,
              "body": body, "head": head, "camera": camera, "gaze": gaze}

    def fill(where, row):
        for k, v in row.items():
            if k not in fields:
                err.append(f"{where} 의 칸 {k} 는 버전2 에 없다")
            else:
                ref(where, v, fields[k], k)
    for k, v in L.get("families", {}).items():
        ref("예전 기록 자세 계열", k, v1["families"], "버전1 자세 계열")
        ref(f"예전 기록 자세 계열 {k}", v, postures, "자세")
    for k in v1["families"]:
        if k not in L.get("families", {}):
            err.append(f"버전1 자세 계열 {k} 를 옮길 몸 자세가 없다")
    acts1 = {a["key"] for a in v1["activities"]}
    poses1 = {p for f in v1["families"].values() for p in f["poses"]}
    orients1 = {o for f in v1["families"].values() for o in f["orients"]}
    for part, pool, what in (("acts", acts1, "하는 일"), ("poses", poses1, "자세"), ("orients", orients1, "방향")):
        for k, row in L.get(part, {}).items():
            ref(f"예전 기록 {what}", k, pool, f"버전1 {what}")
            fill(f"예전 기록 {what} {k}", row)
    return err


def main():
    doc, v1 = load()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    if cmd == "check":
        err = check(doc, v1)
        for e in err:
            print("✗", e)
        c = {k: len(doc[k]) for k in ("presets", "postures", "hands", "legs", "props", "prop_uses")}
        print("일상컷 트리 버전2 —", " · ".join(f"{k} {v}" for k, v in c.items()), "·", "통과" if not err else f"{len(err)} 건")
        sys.exit(1 if err else 0)
    if cmd == "places":
        pre = by_key(doc["presets"])[sys.argv[2]]
        print(" ".join(preset_places(doc, v1, pre)))
        return
    if cmd == "places-all":
        print(json.dumps({p["key"]: preset_places(doc, v1, p) for p in doc["presets"]}, ensure_ascii=False))
        return
    sys.exit(__doc__)


if __name__ == "__main__":
    main()
