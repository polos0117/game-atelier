#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""설계표의 사실 칸(facts)을 Wikidata 에서 받는다. 키도 계정도 필요 없다(docs/GAME_CONCEPT.md 2절).

  python3 tools/fetch-games.py find [<key> ...]     — 영어 이름으로 후보 QID 를 보여 주기만 한다(빼면 전부, 질의 하나)
  python3 tools/fetch-games.py pull [<key> ...]     — facts.qid 가 적힌 게임을 받아 facts 를 채운다(빼면 전부)
  python3 tools/fetch-games.py pull --from <file>   — 저장해 둔 응답으로 채운다(검사·네트워크 없는 자리)

순서: find 로 후보를 보고(같은 이름의 이식판·리메이크가 많다) 사람이 고른 QID 를 data/game-design.json 의
facts.qid 에 적는다 → pull. 원본 응답은 data/wikidata/<key>.json 에 두고, 설계표에는 풀어 쓴 값만 넣는다.
표지 이미지는 받지 않는다(색은 사람이 정한다).

질의 예절 — Wikidata 는 돌아가는 프록시를 거친 자동 질의를 막는다. 이 도구는 직접 접속하고, 저장소 주소를 담은
User-Agent 를 달고, 여러 편을 질의 하나로 묶고, 질의 사이에 쉰다. 너무 잦다고(429) 하면 Retry-After 만큼
기다렸다 다시 묻는다(2026-10-26 에는 장애 중이라 1분에 한 번이었다). 크롤러 서비스로 돌려 받지 않는다.
막히면(403) 작업 환경에서 query.wikidata.org 를 열어 달라고 한다. TLS 검사는 끄지 않는다 — 작업 환경의 CA 묶음(SSL_CERT_FILE)이 있으면 그것을 쓴다."""
import datetime, json, os, re, ssl, sys, time, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "game-design.json")
RAW = os.path.join(ROOT, "data", "wikidata")
ENDPOINT = "https://query.wikidata.org/sparql"
AGENT = "game-atelier/0.1 (https://github.com/polos0117/game-atelier; non-commercial fan project) python-urllib"
VIDEO_GAME = "Q7889"
# 설계표 facts 의 칸 ← Wikidata 속성
PROPS = [("year", "P577"), ("genres", "P136"), ("platforms", "P400"), ("series", "P179"),
         ("developer", "P178"), ("publisher", "P123"), ("modes", "P404")]
WIKI = {"ko": "https://ko.wikipedia.org/", "en": "https://en.wikipedia.org/"}


def sparql_str(s):
    return '"' + str(s).replace("\\", "\\\\").replace('"', '\\"') + '"'


def find_query(titles_en):
    """영어 이름 여럿을 질의 하나로. 같은 이름의 이식판·리메이크가 다 나온다 — ?t 로 어느 이름의 후보인지 돌려준다"""
    if isinstance(titles_en, str):
        titles_en = [titles_en]
    vals = " ".join(sparql_str(t) + "@en" for t in titles_en)
    return """SELECT ?t ?item ?ko (MIN(?d) AS ?date) (GROUP_CONCAT(DISTINCT ?pl; separator=", ") AS ?platforms) WHERE {
  VALUES ?t { %s }
  ?item rdfs:label ?t ; wdt:P31 wd:%s .
  OPTIONAL { ?item rdfs:label ?ko FILTER(LANG(?ko) = "ko") }
  OPTIONAL { ?item wdt:P577 ?d }
  OPTIONAL { ?item wdt:P400 ?p . ?p rdfs:label ?pl FILTER(LANG(?pl) = "en") }
} GROUP BY ?t ?item ?ko ORDER BY ?t ?date""" % (vals, VIDEO_GAME)


def props_query(qids):
    pairs = " ".join('("%s" wdt:%s)' % (k, p) for k, p in PROPS)
    return """SELECT ?item ?prop ?v ?vko ?ven WHERE {
  VALUES ?item { %s }
  VALUES (?prop ?pred) { %s }
  ?item ?pred ?v .
  OPTIONAL { ?v rdfs:label ?vko FILTER(LANG(?vko) = "ko") }
  OPTIONAL { ?v rdfs:label ?ven FILTER(LANG(?ven) = "en") }
}""" % (" ".join("wd:" + q for q in qids), pairs)


def labels_query(qids):
    return """SELECT ?item ?ko ?en ?kowiki ?enwiki WHERE {
  VALUES ?item { %s }
  OPTIONAL { ?item rdfs:label ?ko FILTER(LANG(?ko) = "ko") }
  OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en) = "en") }
  OPTIONAL { ?kowiki schema:about ?item ; schema:isPartOf <%s> }
  OPTIONAL { ?enwiki schema:about ?item ; schema:isPartOf <%s> }
}""" % (" ".join("wd:" + q for q in qids), WIKI["ko"], WIKI["en"])


def ask(query):
    """질의 하나. 실패는 그대로 올린다 — 조용히 빈칸으로 두면 받은 것처럼 보인다"""
    url = ENDPOINT + "?" + urllib.parse.urlencode({"query": query, "format": "json"})
    req = urllib.request.Request(url, headers={"User-Agent": AGENT, "Accept": "application/sparql-results+json"})
    ca = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
    ctx = ssl.create_default_context(cafile=ca) if ca else ssl.create_default_context()
    for tries in range(5):
        try:
            with urllib.request.urlopen(req, timeout=120, context=ctx) as r:
                out = json.load(r)
            time.sleep(2)   # 질의 사이에 쉰다
            return out
        except urllib.error.HTTPError as e:
            if e.code != 429 or tries == 4:
                raise
            wait = int(e.headers.get("Retry-After") or 0) or 65
            print("  … 너무 잦다(429) — %d초 기다렸다 다시 묻는다" % wait, file=sys.stderr)
            time.sleep(wait + 2)


def qid_of(uri):
    return str(uri).rsplit("/", 1)[-1]


def rows(resp):
    for b in ((resp or {}).get("results") or {}).get("bindings") or []:
        yield {k: v.get("value") for k, v in b.items()}


def parse(props, labels):
    """두 응답 → {qid: facts 의 사실 부분}. 값이 이름을 가진 항목이면 {qid, ko, en} 으로, 날짜는 가장 이른 해로"""
    out = {}
    blank = lambda: {"year": None, "developer": [], "publisher": [], "platforms": [], "genres": [],
                     "series": None, "modes": [], "wiki": {"ko": None, "en": None}, "label": {"ko": None, "en": None}}
    for r in rows(labels):
        q = qid_of(r["item"])
        f = out.setdefault(q, blank())
        f["label"] = {"ko": r.get("ko"), "en": r.get("en")}
        f["wiki"] = {"ko": r.get("kowiki"), "en": r.get("enwiki")}
    for r in rows(props):
        q = qid_of(r["item"])
        f = out.setdefault(q, blank())
        k, v = r.get("prop"), r.get("v")
        if k == "year":
            m = re.match(r"\+?(\d{4})-", str(v))   # 기원전(-)·모르는 꼴은 버린다
            y = int(m.group(1)) if m else None
            if y and (f["year"] is None or y < f["year"]):
                f["year"] = y
            continue
        item = {"qid": qid_of(v), "ko": r.get("vko"), "en": r.get("ven")}
        if k == "series":
            f["series"] = f["series"] or item
        elif k in f and item["qid"] not in [x["qid"] for x in f[k]]:
            f[k].append(item)
    for f in out.values():
        for k in ("developer", "publisher", "platforms", "genres", "modes"):
            f[k].sort(key=lambda x: x["qid"])
    return out


def apply(doc, parsed, today, keys=None):
    """설계표에 채운다. 받은 게임 key 목록과 응답에 없던 게임 key 목록을 돌려준다"""
    done, missing = [], []
    for g in doc["games"]:
        f = g["facts"]
        q = f.get("qid")
        if not q or (keys and g["key"] not in keys):
            continue
        p = parsed.get(q)
        if p is None:
            missing.append(g["key"])
            continue
        for k in ("year", "developer", "publisher", "platforms", "genres", "series", "modes", "wiki"):
            f[k] = p[k]
        f["fetched"] = today
        done.append(g["key"])
    return done, missing


def save_raw(key, qid, today, props, labels):
    os.makedirs(RAW, exist_ok=True)
    pick = lambda resp: [b for b in ((resp or {}).get("results") or {}).get("bindings") or []
                         if qid_of(b.get("item", {}).get("value")) == qid]
    with open(os.path.join(RAW, key + ".json"), "w", encoding="utf-8") as f:
        json.dump({"qid": qid, "fetched": today, "source": ENDPOINT,
                   "props": pick(props), "labels": pick(labels)}, f, ensure_ascii=False, indent=1)
        f.write("\n")


def load():
    with open(DATA, encoding="utf-8") as f:
        return json.load(f)


def save(doc):
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write("\n")


def empties(g):
    f = g["facts"]
    return [k for k in ("year", "developer", "publisher", "platforms", "genres", "modes") if not f.get(k)] + \
           ["wiki." + k for k in ("ko", "en") if not (f.get("wiki") or {}).get(k)]


def main(argv):
    if not argv or argv[0] not in ("find", "pull"):
        raise SystemExit(__doc__.split("\n\n")[1])
    doc = load()
    byk = {g["key"]: g for g in doc["games"]}
    if argv[0] == "find":
        for k in argv[1:]:
            if k not in byk:
                raise SystemExit("없는 key: %s — key 는 %s" % (k, ", ".join(byk)))
        gs = [byk[k] for k in argv[1:]] or doc["games"]
        found = list(rows(ask(find_query([g["title_en"] for g in gs]))))
        for g in gs:
            mine = [r for r in found if r.get("t") == g["title_en"]]
            print("%s (%s) — 후보 %d%s" % (g["title"], g["title_en"], len(mine),
                                         "  · 지금 facts.qid=" + g["facts"]["qid"] if g["facts"].get("qid") else ""))
            for r in mine:
                print("  %-10s %s  %s  [%s]" % (qid_of(r["item"]), (r.get("date") or "?")[:10],
                                              r.get("ko") or "-", r.get("platforms") or ""))
        print("고른 QID 를 data/game-design.json 의 <key>.facts.qid 에 적고 pull 한다")
        return
    src = None
    if "--from" in argv:
        i = argv.index("--from")
        src = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    keys = argv[1:] or None
    for k in keys or []:
        if k not in byk:
            raise SystemExit("없는 key: " + k)
    todo = [g for g in doc["games"] if g["facts"].get("qid") and (not keys or g["key"] in keys)]
    if not todo:
        raise SystemExit("facts.qid 가 적힌 게임이 없다 — 먼저 find 로 고른다")
    qids = sorted({g["facts"]["qid"] for g in todo})
    if src:
        with open(src, encoding="utf-8") as f:
            saved = json.load(f)
        props, labels = saved["props"], saved["labels"]
    else:
        props, labels = ask(props_query(qids)), ask(labels_query(qids))
    today = datetime.date.today().isoformat()
    parsed = parse(props, labels)
    done, missing = apply(doc, parsed, today, keys)
    for g in todo:
        if g["key"] in done:
            save_raw(g["key"], g["facts"]["qid"], today, props, labels)
    save(doc)
    for k in done:
        e = empties(byk[k])
        print("  ✓ %s %s%s" % (k, byk[k]["facts"]["qid"], ("  빈칸: " + ", ".join(e)) if e else ""))
    for k in missing:
        print("  ✗ %s %s — 응답에 없다(QID 를 다시 본다)" % (k, byk[k]["facts"]["qid"]))
    print("받음 %d · 못 받음 %d — 이어서 python3 tools/game-design.py check" % (len(done), len(missing)))


if __name__ == "__main__":
    main(sys.argv[1:])
