#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""한 게임 일상컷 묶음의 구도 검사 — 올리기 전에 생성기 기록(casualN-ui.json)을 읽어 본다(2026-10-29).

스파2·젤다 일상 다섯 장이 모두 같은 방향(몸 3/4 정면)·비슷한 거리로 나왔다(사용자 「구도가 너무 비슷하다」).
목 꺾임을 피하려고 방향을 매번 front_3q 로 덮어쓴 탓이었다. 묶음 안에서
  - 방향(orient)은 서로 다르고
  - 프레이밍(frame)도 서로 다르며, 먼 컷(전신·환경) 하나와 가까운 컷(가슴 위·클로즈업) 하나가 꼭 있고
  - 렌즈(lens)는 같은 것이 두 번까지다.
뒤돌아보기 쪽 방향은 생성기의 LOOK-BACK 줄이 목을 지킨다.
버전2 장면(treeV 2)은 몸 방향 · 머리 방향 · 자세 추천으로 본다(아래 V2_KEYS).

    python3 tools/casual-compose.py <그림 저장소>/records/<게임>
    python3 tools/casual-compose.py a/casual1-ui.json a/casual2-ui.json …
"""
import json, os, re, sys
from collections import Counter

FAR = {"full_body", "environmental"}
NEAR = {"chest_up", "face_close"}
LENS_MAX = 2


def scene(rec):
    """기록 하나 → 그 일상컷의 장면 칸(생성기 저장 상태의 scenes.casual)"""
    card = rec["storage"]["cards"][rec["game"]]
    return card["scenes"]["casual"]


# 일상컷 트리 버전2 장면(treeV 2, docs/CASUAL_TREE_V2.md) — 방향은 몸 방향(body) · 머리 방향(head)으로 나뉘고 렌즈는 프레이밍을 따라 자동이다.
# 몸 방향 한 가지는 두 번까지, 머리 「어깨 너머」 는 한 장까지, 자세 추천은 서로 다르게(묶음 계획기 --v2 와 같은 규칙)
V1_KEYS = (("orient", "방향", 1), ("frame", "프레이밍", 1), ("lens", "렌즈", LENS_MAX))
V2_KEYS = (("body", "몸 방향", 2), ("frame", "프레이밍", 1), ("preset", "자세 추천", 1))


def check(scenes):
    """scenes: [(이름, 장면 칸)] → 틀린 것 목록. 버전1 · 버전2 장면이 섞이면 각자의 칸끼리, 프레이밍은 다 같이"""
    errs = []
    v1 = [(n, s) for n, s in scenes if s.get("treeV") != 2]
    v2 = [(n, s) for n, s in scenes if s.get("treeV") == 2]
    for group, keys in ((v1, V1_KEYS), (v2, V2_KEYS)):
        for key, what, _ in keys:
            empty = [n for n, s in group if not s.get(key) and key != "preset"]
            if empty:
                errs.append("%s 이(가) 비었다 — %s" % (what, ", ".join(empty)))
    for group, keys in ((v1, V1_KEYS), (v2, V2_KEYS)):
        for key, what, most in keys:
            if key == "frame":
                continue
            for v, c in Counter(s.get(key) for _, s in group if s.get(key)).items():
                if c > most:
                    errs.append("%s %s 이(가) %d 번 — %d 번까지" % (what, v, c, most))
    for v, c in Counter(s.get("frame") for _, s in scenes if s.get("frame")).items():
        if c > 1:
            errs.append("프레이밍 %s 이(가) %d 번 — 1 번까지" % (v, c))
    over = [n for n, s in v2 if s.get("head") == "over_shoulder"]
    if len(over) > 1:
        errs.append("머리 어깨 너머가 %d 장 — 한 장까지(%s)" % (len(over), ", ".join(over)))
    frames = {s.get("frame") for _, s in scenes}
    if len(scenes) >= 3:
        if not frames & FAR:
            errs.append("먼 컷(전신·환경)이 없다")
        if not frames & NEAR:
            errs.append("가까운 컷(가슴 위·클로즈업)이 없다")
    return errs


def load(args):
    paths = []
    for a in args:
        if os.path.isdir(a):
            paths += sorted(os.path.join(a, f) for f in os.listdir(a) if re.fullmatch(r"casual\d+-ui\.json", f))
        else:
            paths.append(a)
    return [(os.path.basename(p).split("-")[0], scene(json.load(open(p, encoding="utf-8")))) for p in paths]


def main(argv):
    if not argv:
        print(__doc__.strip()); return 2
    scenes = load(argv)
    if not scenes:
        print("일상컷 기록이 없다"); return 2
    for n, s in scenes:
        if s.get("treeV") == 2:
            print("  %s · 버전2 · %s · %s · %s · %s" % (n, s.get("preset") or "—", s.get("frame"), s.get("body"), s.get("head")))
        else:
            print("  %s · %s · %s · %s" % (n, s.get("orient"), s.get("frame"), s.get("lens")))
    errs = check(scenes)
    for e in errs:
        print("  X " + e)
    print(("일상컷 구도 통과 — %d 장" % len(scenes)) if not errs else ("일상컷 구도 %d 가지 걸림" % len(errs)))
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
