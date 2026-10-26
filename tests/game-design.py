"""게임 설계표 검사. python3 tests/game-design.py
   - 실제 자료(data/game-design.json)가 통과한다
   - 규칙을 하나씩 어긴 자료가 그 이유로 걸린다"""
import copy, importlib.util, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('gd', ROOT / 'tools' / 'game-design.py')
G = importlib.util.module_from_spec(spec); spec.loader.exec_module(G)
doc = json.loads((ROOT / 'data' / 'game-design.json').read_text(encoding='utf-8'))
assert G.check(doc) == [], G.check(doc)
assert len(doc['games']) == 10, len(doc['games'])


def fails(mutate, why):
    d = copy.deepcopy(doc); mutate(d)
    errs = G.check(d)
    assert any(why in e for e in errs), (why, errs)


def ok(mutate):
    d = copy.deepcopy(doc); mutate(d)
    assert G.check(d) == [], G.check(d)
    return d

# 닮은 두 게임 — 화풍의 기본 얼굴·흔한 차림으로 수렴하지 않게
def twin(d):
    a, c = d['games'][0], d['games'][1]
    c['silhouette'] = dict(a['silhouette'], pose=c['silhouette']['pose'])
    c['face'] = dict(a['face'], lips=c['face']['lips'])
fails(twin, '실루엣 축 6 중')
fails(twin, '얼굴 5 묶음 중')
fails(lambda d: d['games'][0]['silhouette'].update(hair='mohawk'), '정한 말이 아니다')
fails(lambda d: d['games'][0].update(era='ps5'), '시대')
# 묶음이 장르와 어긋나면 상성이 틀어진다
fails(lambda d: d['games'][0].update(group='reflex'), '묶음')
fails(lambda d: d['vocab']['group']['mind'].append('미로'), 'vocab.group')
# 게임 속 캐릭터·로고를 그리지 않는다 — 막을 것을 적어 둔다
fails(lambda d: d['games'][0].update(avoid=[]), 'avoid')
fails(lambda d: d['games'][0].update(rights=''), 'rights')
# 사실 칸은 도구만 — 받은 적 없이 연도·개발사가 차 있으면 지어낸 것
fails(lambda d: d['games'][0]['facts'].update(year=1980), '받은 적 없는')
fails(lambda d: d['games'][0]['facts'].update(developer=[{'qid': 'Q1', 'ko': None, 'en': 'x'}]), '받은 적 없는')
fails(lambda d: d['games'][0]['facts']['wiki'].update(en='https://en.wikipedia.org/wiki/X'), '받은 적 없는')
fails(lambda d: d['games'][0]['facts'].pop('modes'), 'facts 칸 모양')
fails(lambda d: d['games'][0]['facts'].update(qid='pacman'), 'Q숫자')
ok(lambda d: d['games'][0]['facts'].update(qid='Q123'))   # QID 만 고른 것은 괜찮다(pull 전)
d = ok(lambda d: d['games'][0]['facts'].update(fetched='2026-10-26', year=1980))
# 받은 연도가 시대와 어긋나면 경고만
d = copy.deepcopy(doc); d['games'][0]['facts'].update(fetched='2026-10-26', year=2015)
assert G.check(d) == [] and any('시대를 다시 본다' in w for w in G.warnings(d)), G.warnings(d)
assert any('아직 안 받았다 10편' in w for w in G.warnings(doc)), G.warnings(doc)
# 시리즈 자매 — 서로 적고 얼굴 윤곽이 같다
def sisters(d, same_face=True, both=True):
    a, c = d['games'][0], d['games'][1]
    a['series'] = [c['key']]
    if both: c['series'] = [a['key']]
    if same_face: c['face']['face_shape'] = a['face']['face_shape']
d = copy.deepcopy(doc); sisters(d)
assert not [e for e in G.check(d) if '시리즈' in e], G.check(d)
fails(lambda d: sisters(d, same_face=False), '얼굴 윤곽')
fails(lambda d: sisters(d, both=False), '서로 적는다')
fails(lambda d: d['games'][0].update(series=['no_such_game']), '설계표에 없다')
# Wikidata 로는 같은 시리즈인데 안 묶었으면 경고
d = copy.deepcopy(doc)
for g in d['games'][:2]:
    g['facts'].update(fetched='2026-10-26', series={'qid': 'Q9', 'ko': None, 'en': 's'})
assert any('같은 시리즈' in w for w in G.warnings(d)), G.warnings(d)
# 폼·개방·규칙
fails(lambda d: d['games'][0]['opens']['엔딩'].update(one_figure=False), '한 명')
fails(lambda d: d['games'][0]['opens']['중반'].update(particles='confetti'), '입자')
fails(lambda d: d['games'][0]['rule'].update(counter=''), '대응')
fails(lambda d: d['games'][0]['rule']['forms'].pop('중반'), '폼별 쓰임')
fails(lambda d: d['games'][0].update(mechanic=''), 'mechanic')
# 결투에 줄(lane)이 없다 — 테트리스도 「자리 셋 채워 지우기」. "줄어든다" 는 괜찮다
fails(lambda d: d['games'][1]['rule']['forms'].update(타이틀='한 줄을 채우면 지운다'), '줄(lane)')
ok(lambda d: d['games'][1]['rule']['forms'].update(중반='받는 피해가 줄어든다'))
fails(lambda d: d['games'][0]['forms'].pop('엔딩'), '셋씩')
fails(lambda d: [f.update(role='공격') for f in d['games'][0]['forms'].values()], '역할이 다 같다')
fails(lambda d: [f.update(pose='같은 자세') for f in d['games'][0]['forms'].values()], '자세가 겹친다')
fails(lambda d: d['games'][0].update(symbols=['점']), '상징은 셋')
fails(lambda d: d['games'][0]['voice'].update(타이틀=''), 'voice')
fails(lambda d: d['games'][0].update(place=''), 'place')
fails(lambda d: d['vocab']['form_key'].update(중반='title'), 'form_key')
fails(lambda d: d['games'][0].update(key='Pac Man'), 'key 는')
fails(lambda d: d['games'][1].update(key=d['games'][0]['key']), 'key 가 겹친다')
pil = [g for g in doc['games'] if g.get('pilot')]
fails(lambda d: [g for g in d['games'] if g.get('pilot')][1].update(genre=pil[0]['genre'],
      group=pil[0]['group']), '장르가 같다')
fails(lambda d: d['games'][1]['pilot'].update(form='발단'), '시범은')

# 첫 화면이 읽는 칸 — 이름·묶음·인격·능력
for g in doc['games']:
    for k in ('key', 'title', 'group', 'persona', 'mechanic'):
        assert str(g.get(k) or '').strip(), (g.get('key'), k)
words = (ROOT / 'lib' / 'words.js').read_text(encoding='utf-8')
for grp in doc['vocab']['group']:
    assert "'home.group.%s'" % grp in words, '낱말 표에 묶음 이름이 없다: ' + grp

print('PASS 게임 설계표: %d편 · 닮음·정한 말·묶음·avoid·사실 칸·자매·한 명 개방·대응·줄 말·시범' % len(doc['games']))
