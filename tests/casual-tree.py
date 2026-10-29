"""일상컷 트리 검사기. python3 tests/casual-tree.py
   - 실제 표(data/casual-tree.json)가 통과한다
   - 끊긴 길·없는 열쇠·한글 영어 칸·필수 갈래 없는 시대를 건다"""
import copy, importlib.util, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('ct', ROOT / 'tools' / 'casual-tree.py')
T = importlib.util.module_from_spec(spec); spec.loader.exec_module(T)
doc = T.load()
assert T.check(doc) == [], T.check(doc)

def fails(mutate, word):
    d = copy.deepcopy(doc); mutate(d)
    e = ' | '.join(T.check(d))
    assert word in e, (word, e)

place = lambda d, k: next(p for p in d['places'] if p['key'] == k)
act = lambda d, k: next(a for a in d['activities'] if a['key'] == k)
fails(lambda d: place(d, 'arcade_hall').update(group='casino'), '묶음 casino')
fails(lambda d: act(d, 'swim').update(family='fly'), '자세 계열 fly')
fails(lambda d: act(d, 'swim')['places'].append('moon_base'), '장소 moon_base')
fails(lambda d: place(d, 'night_taxi').update(en='택시 뒷좌석'), '한글')
fails(lambda d: d['activities'].append(dict(act(d, 'swim'), key='night_taxi')), '겹친다')
# 길이 끊기면 — 장소에 하는 일이 하나뿐, 하는 일에 옷이 없다
fails(lambda d: [a['places'].remove('night_taxi') for a in d['activities'] if 'night_taxi' in a['places'] and a['key'] != 'taxi_ride'], '하는 일이 1 개')
fails(lambda d: place(d, 'night_taxi').update(outfits=['editorial']), '입을 옷 계열이 없다')
# 필수 갈래 — 환상 무대에서 란제리·수영복·역할극을 다 빼면 닿는 길이 없다
fails(lambda d: next(e for e in d['eras'] if e['key'] == 'fantasy').update(outfits=['costume', 'editorial', 'evening', 'bridal', 'bath', 'retro']), '필수 갈래')
# 추천 조합·예전 기록 변환 — 트리 위의 길만
pre = lambda d, k: next(p for p in d['presets'] if p['key'] == k)
fails(lambda d: pre(d, 'travel_station').update(act='swim'), '하는 일 swim 를 못 고른다')
fails(lambda d: pre(d, 'travel_station').update(era='fantasy'), '시대가 없다')
fails(lambda d: pre(d, 'arc_cabinet').update(item='lace_set'), '옷 lace_set')
fails(lambda d: d['legacy'].update({'x/y': {'preset': 'nope'}}), '추천 조합 nope')
assert all(('preset' in v) or ('era' in v) for v in doc['legacy'].values())
# 하는 일의 @묶음 은 그 묶음 모든 장소
assert set(T.act_places(doc, act(doc, 'warmup'))) >= {p['key'] for p in doc['places'] if p['group'] == 'sports'}
# 옷 계열 = 시대 ∩ 장소 ∩ 하는 일
assert T.outfit_families(doc, 'release', 'water_pool', act(doc, 'swim')) == ['swimwear']
assert 'retro' not in T.outfit_families(doc, 'release', 'night_bar', act(doc, 'bar_drink'))
print('PASS 일상컷 트리: 실제 표 · 없는 열쇠·자세 계열·장소·한글·겹침 · 끊긴 길 · 필수 갈래 · 추천 조합·예전 기록 · @묶음 · 옷 계열 교집합')
