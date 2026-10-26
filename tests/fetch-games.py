"""사실 자료 도구 검사 — 네트워크 없이. python3 tests/fetch-games.py
   - 질의문이 받을 속성을 다 묻고, 이름의 따옴표를 막는다
   - 응답 풀기: 가장 이른 해·이름 있는 항목·겹침 없음·시리즈 하나·위키백과 주소
   - 설계표 채우기: qid 가 적힌 게임만, 응답에 없으면 못 받음, 그 뒤 설계표 검사가 통과한다
   응답은 tests/fixtures/wikidata-sample.json — 가짜 값(Q900001 …)이다. 실제 게임의 사실이 아니다."""
import copy, importlib.util, json, os, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def mod(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'tools' / file)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
F, G = mod('fg', 'fetch-games.py'), mod('gd', 'game-design.py')
doc = json.loads((ROOT / 'data' / 'game-design.json').read_text(encoding='utf-8'))
sample = json.loads((ROOT / 'tests' / 'fixtures' / 'wikidata-sample.json').read_text(encoding='utf-8'))
# 진짜 설계표는 이미 받은 칸이 차 있다 — 검사는 사실 칸을 비운 사본으로 한다
BLANK = {'qid': None, 'fetched': None, 'year': None, 'developer': [], 'publisher': [], 'platforms': [], 'genres': [],
         'series': None, 'modes': [], 'wiki': {'ko': None, 'en': None}}
doc = copy.deepcopy(doc)
for g in doc['games']:
    g['facts'] = copy.deepcopy(BLANK)

# 질의문
q = F.props_query(['Q900001', 'Q900002'])
for _, p in F.PROPS:
    assert 'wdt:' + p in q, p
assert 'wd:Q900001 wd:Q900002' in q
assert 'ko.wikipedia.org' in F.labels_query(['Q1']) and 'en.wikipedia.org' in F.labels_query(['Q1'])
fq = F.find_query('Say "Hi" \\ now')
assert '"Say \\"Hi\\" \\\\ now"@en' in fq, fq
assert 'wd:Q7889' in fq
assert 'game-atelier' in F.AGENT and 'github.com/polos0117/game-atelier' in F.AGENT

# 응답 풀기
P = F.parse(sample['props'], sample['labels'])
a = P['Q900001']
assert a['year'] == 1981, a['year']                                   # 두 발매일 중 이른 해
assert [x['qid'] for x in a['platforms']] == ['Q900101', 'Q900102']    # 겹친 줄은 하나로, 차례는 qid
assert a['developer'] == [{'qid': 'Q900201', 'ko': '가짜 개발사', 'en': 'Fixture Developer'}]
assert a['series'] == {'qid': 'Q900301', 'ko': None, 'en': 'Fixture Series'}
assert a['wiki'] == {'ko': None, 'en': 'https://en.wikipedia.org/wiki/Fixture_Game'}
b = P['Q900002']
assert b['year'] is None and b['developer'] == [] and b['wiki']['ko'] == 'https://ko.wikipedia.org/wiki/가짜_게임'
assert F.parse({}, {}) == {}

# 설계표 채우기
d = copy.deepcopy(doc)
d['games'][0]['facts']['qid'] = 'Q900001'
d['games'][1]['facts']['qid'] = 'Q900002'
d['games'][2]['facts']['qid'] = 'Q900999'    # 응답에 없다
done, missing = F.apply(d, P, '2026-10-26')
assert done == [d['games'][0]['key'], d['games'][1]['key']] and missing == [d['games'][2]['key']], (done, missing)
assert d['games'][0]['facts']['fetched'] == '2026-10-26' and d['games'][0]['facts']['year'] == 1981
assert d['games'][2]['facts']['fetched'] is None and d['games'][3]['facts'] == doc['games'][3]['facts']
assert 'label' not in d['games'][0]['facts']   # 설계표 facts 모양은 그대로
assert G.check(d) == [], G.check(d)
assert any('빈칸' in w and d['games'][1]['title'] in w for w in G.warnings(d)), G.warnings(d)
assert F.empties(d['games'][1])[:3] == ['year', 'developer', 'publisher']
# key 를 고르면 그것만
d2 = copy.deepcopy(doc)
d2['games'][0]['facts']['qid'] = 'Q900001'; d2['games'][1]['facts']['qid'] = 'Q900002'
done, _ = F.apply(d2, P, '2026-10-26', keys=[d2['games'][1]['key']])
assert done == [d2['games'][1]['key']] and d2['games'][0]['facts']['fetched'] is None

# 명령 — 저장해 둔 응답으로 끝까지(임시 복사본에서. 진짜 설계표는 건드리지 않는다)
with tempfile.TemporaryDirectory() as tmp:
    t = Path(tmp)
    (t / 'tools').mkdir(); (t / 'data').mkdir()
    (t / 'tools' / 'fetch-games.py').write_bytes((ROOT / 'tools' / 'fetch-games.py').read_bytes())
    d3 = copy.deepcopy(doc); d3['games'][0]['facts']['qid'] = 'Q900001'
    (t / 'data' / 'game-design.json').write_text(json.dumps(d3, ensure_ascii=False), encoding='utf-8')
    r = subprocess.run([sys.executable, str(t / 'tools' / 'fetch-games.py'), 'pull', '--from',
                        str(ROOT / 'tests' / 'fixtures' / 'wikidata-sample.json')],
                       capture_output=True, text=True, env=dict(os.environ, PYTHONIOENCODING='utf-8'))
    assert r.returncode == 0, r.stderr
    out = json.loads((t / 'data' / 'game-design.json').read_text(encoding='utf-8'))
    assert out['games'][0]['facts']['year'] == 1981
    raw = json.loads((t / 'data' / 'wikidata' / (d3['games'][0]['key'] + '.json')).read_text(encoding='utf-8'))
    assert raw['qid'] == 'Q900001' and raw['props'] and all('Q900001' in b['item']['value'] for b in raw['props'])
    r = subprocess.run([sys.executable, str(t / 'tools' / 'fetch-games.py'), 'pull', 'no_such'],
                       capture_output=True, text=True)
    assert r.returncode != 0 and '없는 key' in r.stderr

print('PASS 사실 자료 도구: 질의문·따옴표·응답 풀기(이른 해·겹침·시리즈·위키백과)·채우기·고른 key·명령 끝까지')
