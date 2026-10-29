#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""일상컷 트리 표 검사 — data/casual-tree.json (2026-10-29).

갈래·예시·자세가 서로 상관없이 뽑혀 부딪혔다(사용자 「중구난방」). 일상컷은 이제 한 줄로 내려간다:
    시대 → 장소 → 하는 일 → 의상 → 구도·소품 → 분위기
앞에서 고른 것이 뒤 선택지를 거른다. 이 검사기는 그 허용 관계가 끊긴 데가 없는지 본다.
  - 열쇠가 겹치지 않고, 가리키는 시대·묶음·장소·자세 계열·의상 계열이 다 있다
  - 어느 시대에서 어느 장소를 골라도 하는 일이 둘 이상, 어느 하는 일을 골라도 입을 옷 계열이 하나 이상 남는다
  - 영어 칸에 한글이 없다(지시문은 영어)
  - 어느 시대에서든 필수 갈래(란제리풍·수영복·역할극 또는 게임 속 일상 — 섹시)에 닿는 길이 있다
  - 추천 조합(지금 갈래의 장면 예시를 옮긴 것)과 예전 기록 변환표가 다 고를 수 있는 길이다

    python3 tools/casual-tree.py check
    python3 tools/casual-tree.py paths <시대> <장소>     # 그 자리에서 고를 수 있는 하는 일·옷 계열
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "casual-tree.json")
HANGUL = re.compile(r"[가-힣]")
MIN_ACTS = 2


def load(path=DATA):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def index(doc):
    return {
        "eras": {e["key"]: e for e in doc["eras"]},
        "groups": {g["key"]: g for g in doc["groups"]},
        "places": {p["key"]: p for p in doc["places"]},
        "outfits": {o["key"]: o for o in doc["outfits"]},
        "families": doc["families"],
    }


def act_places(doc, a):
    """하는 일의 places — @묶음 은 그 묶음의 모든 장소"""
    out = []
    for k in a.get("places", []):
        if k.startswith("@"):
            out += [p["key"] for p in doc["places"] if p["group"] == k[1:]]
        else:
            out.append(k)
    return out


def activities_at(doc, place):
    return [a for a in doc["activities"] if place in act_places(doc, a)]


def outfit_families(doc, era, place, act):
    """그 시대·장소·하는 일에서 입을 수 있는 옷 계열 — 셋의 교집합, 순서는 의상 표 순서"""
    I = index(doc)
    allow = set(I["eras"][era]["outfits"]) & set(I["places"][place]["outfits"])
    if act.get("outfits"):
        allow &= set(act["outfits"])
    return [o["key"] for o in doc["outfits"] if o["key"] in allow]


def places_in(doc, era):
    return [p for p in doc["places"] if era in p["eras"]]


def required_reach(doc, era, place, act, fam):
    R = doc["required"]
    if fam in R["outfits"]:
        return True
    g = R["in_game"]
    return era == g["era"] and place in g["places"] and fam in g["outfits"]


def path_errors(doc, p):
    """시대·장소·하는 일·옷 계열·옷 한 줄이 트리에서 고를 수 있는 길인지"""
    I = index(doc)
    if p.get("era") not in I["eras"] or p.get("place") not in I["places"]:
        return ["없는 시대·장소 %s·%s" % (p.get("era"), p.get("place"))]
    if p["era"] not in I["places"][p["place"]]["eras"]:
        return ["%s 에는 %s 시대가 없다" % (p["place"], p["era"])]
    act = next((a for a in activities_at(doc, p["place"]) if a["key"] == p.get("act")), None)
    if not act:
        return ["%s 에서 하는 일 %s 를 못 고른다" % (p["place"], p.get("act"))]
    if p.get("outfit") not in outfit_families(doc, p["era"], p["place"], act):
        return ["%s·%s·%s 에서 옷 계열 %s 를 못 고른다" % (p["era"], p["place"], p["act"], p.get("outfit"))]
    if p.get("item") and p["item"] not in {i["key"] for i in I["outfits"][p["outfit"]]["items"]}:
        return ["옷 %s 가 %s 계열에 없다" % (p["item"], p["outfit"])]
    return []


def check(doc):
    errs = []
    I = index(doc)
    seen = {}
    def uniq(kind, key):
        if key in seen:
            errs.append("열쇠 %s 가 %s 와 %s 에 겹친다" % (key, seen[key], kind))
        seen[key] = kind
    def en(where, text):
        if not text or HANGUL.search(text):
            errs.append("%s 의 영어 칸이 비었거나 한글이 있다: %r" % (where, text))
    for e in doc["eras"]:
        uniq("시대", e["key"]); en("시대 " + e["key"], e["en"])
        for o in e["outfits"]:
            if o not in I["outfits"]:
                errs.append("시대 %s 의 옷 계열 %s 가 없다" % (e["key"], o))
    for p in doc["places"]:
        uniq("장소", p["key"]); en("장소 " + p["key"], p["en"])
        if p["group"] not in I["groups"]:
            errs.append("장소 %s 의 묶음 %s 가 없다" % (p["key"], p["group"]))
        for e in p["eras"]:
            if e not in I["eras"]:
                errs.append("장소 %s 의 시대 %s 가 없다" % (p["key"], e))
        for o in p["outfits"]:
            if o not in I["outfits"]:
                errs.append("장소 %s 의 옷 계열 %s 가 없다" % (p["key"], o))
    for a in doc["activities"]:
        uniq("하는 일", a["key"]); en("하는 일 " + a["key"], a["en"])
        if a["family"] not in I["families"]:
            errs.append("하는 일 %s 의 자세 계열 %s 가 없다" % (a["key"], a["family"]))
        for k in a.get("places", []):
            if (k[1:] not in I["groups"]) if k.startswith("@") else (k not in I["places"]):
                errs.append("하는 일 %s 의 장소 %s 가 없다" % (a["key"], k))
        for o in a.get("outfits", []):
            if o not in I["outfits"]:
                errs.append("하는 일 %s 의 옷 계열 %s 가 없다" % (a["key"], o))
    for o in doc["outfits"]:
        uniq("옷 계열", o["key"])
        if not o["items"]:
            errs.append("옷 계열 %s 에 고를 옷이 없다" % o["key"])
        keys = set()
        for it in o["items"]:
            en("옷 %s/%s" % (o["key"], it["key"]), it["en"])
            if it["key"] in keys:
                errs.append("옷 %s/%s 가 겹친다" % (o["key"], it["key"]))
            keys.add(it["key"])
    for k, f in doc["families"].items():
        if not f.get("poses") or not f.get("orients"):
            errs.append("자세 계열 %s 에 자세·방향이 없다" % k)
    if errs:
        return errs
    # 끊긴 길 — 어느 자리에서 골라도 다음 단계가 남는다
    for e in doc["eras"]:
        reach = False
        ps = places_in(doc, e["key"])
        if not ps:
            errs.append("시대 %s 에 장소가 없다" % e["key"])
        for p in ps:
            acts = activities_at(doc, p["key"])
            live = [a for a in acts if outfit_families(doc, e["key"], p["key"], a)]
            if len(live) < MIN_ACTS:
                errs.append("%s · %s: 하는 일이 %d 개(%d 개 이상)" % (e["ko"], p["ko"], len(live), MIN_ACTS))
            for a in acts:
                fams = outfit_families(doc, e["key"], p["key"], a)
                if not fams and a.get("outfits"):
                    continue  # 그 시대엔 못 입는 옷만 받는 하는 일 — 화면에서 빠진다
                if not fams:
                    errs.append("%s · %s · %s: 입을 옷 계열이 없다" % (e["ko"], p["ko"], a["ko"]))
                reach = reach or any(required_reach(doc, e["key"], p["key"], a, f) for f in fams)
        if not reach:
            errs.append("시대 %s 에서 필수 갈래에 닿는 길이 없다" % e["ko"])
    # 추천 조합·예전 기록 변환 — 다 트리 위의 길이다
    groups = {g["key"] for g in doc.get("preset_groups", [])}
    pkeys = set()
    for pr in doc.get("presets", []):
        if pr["key"] in pkeys:
            errs.append("추천 조합 %s 가 겹친다" % pr["key"])
        pkeys.add(pr["key"])
        if pr["group"] not in groups:
            errs.append("추천 조합 %s 의 묶음 %s 가 없다" % (pr["key"], pr["group"]))
        errs += ["추천 조합 %s: %s" % (pr["key"], e) for e in path_errors(doc, pr)]
    for k, v in doc.get("legacy", {}).items():
        if "preset" in v:
            if v["preset"] not in pkeys:
                errs.append("예전 기록 %s 의 추천 조합 %s 가 없다" % (k, v["preset"]))
        else:
            errs += ["예전 기록 %s: %s" % (k, e) for e in path_errors(doc, v)]
    for a in doc["activities"]:
        if not any(outfit_families(doc, e["key"], p, a) for p in act_places(doc, a) for e in doc["eras"] if e["key"] in I["places"][p]["eras"]):
            errs.append("하는 일 %s 는 어느 길에서도 안 나온다" % a["ko"])
    return errs


def main(argv):
    doc = load()
    if argv[:1] == ["paths"] and len(argv) == 3:
        era, place = argv[1], argv[2]
        for a in activities_at(doc, place):
            print("  %-16s %-6s %s" % (a["key"], a["family"], ", ".join(outfit_families(doc, era, place, a)) or "—"))
        return 0
    if argv[:1] != ["check"]:
        print(__doc__.strip()); return 2
    errs = check(doc)
    for e in errs:
        print("  X " + e)
    if errs:
        print("일상컷 트리 %d 가지 걸림" % len(errs)); return 1
    n_paths = sum(len(outfit_families(doc, e["key"], p["key"], a)) > 0
                  for e in doc["eras"] for p in places_in(doc, e["key"]) for a in activities_at(doc, p["key"]))
    print("일상컷 트리 통과 — 시대 %d · 장소 %d · 하는 일 %d · 옷 계열 %d(옷 %d) · 시대·장소·하는 일 길 %d · 추천 조합 %d · 예전 기록 변환 %d"
          % (len(doc["eras"]), len(doc["places"]), len(doc["activities"]), len(doc["outfits"]),
             sum(len(o["items"]) for o in doc["outfits"]), n_paths, len(doc.get("presets", [])), len(doc.get("legacy", {}))))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
