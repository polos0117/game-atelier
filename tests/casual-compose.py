"""일상컷 구도 검사기. python3 tests/casual-compose.py
   - 방향·프레이밍이 겹치거나 렌즈가 세 번이면 걸린다
   - 먼 컷·가까운 컷이 없으면 걸린다
   - 기록(casualN-ui.json) 폴더를 읽는다"""
import importlib.util, json, os, pathlib, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('cc', ROOT / 'tools' / 'casual-compose.py')
C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)

GOOD = [('side', 'waist_up', 'documentary35'), ('high_angle', 'chest_up', 'portrait85'), ('low_angle', 'full_body', 'wide24'),
        ('over_shoulder', 'environmental', 'natural50'), ('looking_down', 'face_close', 'telephoto135')]
def sc(rows): return [('casual%d' % (i + 1), {'orient': o, 'frame': f, 'lens': l}) for i, (o, f, l) in enumerate(rows)]

assert C.check(sc(GOOD)) == [], C.check(sc(GOOD))
# 스파2 첫 묶음 — 다섯 장 모두 front_3q, 가까운 컷 없음
SF2 = [('front_3q', 'three_quarter', 'natural50'), ('front_3q', 'three_quarter', 'portrait85'), ('front_3q', 'full_body', 'documentary35'),
       ('front_3q', 'full_body', 'documentary35'), ('front_3q', 'three_quarter', 'natural50')]
e = ' | '.join(C.check(sc(SF2)))
assert '방향 front_3q 이(가) 5 번' in e and '프레이밍 three_quarter' in e and '가까운 컷' in e, e
far = [r for r in GOOD if r[1] not in C.FAR] + [('front', 'three_quarter', 'natural50')]
assert '먼 컷' in ' | '.join(C.check(sc(far)))
lens3 = [(o, f, 'documentary35') for o, f, _ in GOOD[:3]] + GOOD[3:]
assert '렌즈 documentary35 이(가) 3 번' in ' | '.join(C.check(sc(lens3)))
assert '비었다' in ' | '.join(C.check(sc([('', 'waist_up', 'wide24')] + GOOD[1:])))

# 기록 폴더 읽기 — 생성기 저장 상태의 scenes.casual
with tempfile.TemporaryDirectory() as d:
    for n, s in sc(GOOD):
        rec = {'game': 'g', 'storage': {'cards': {'g': {'scenes': {'casual': s}}}}}
        json.dump(rec, open(os.path.join(d, n + '-ui.json'), 'w'))
    open(os.path.join(d, 'title-ui.json'), 'w').write('{}')
    assert [n for n, _ in C.load([d])] == ['casual1', 'casual2', 'casual3', 'casual4', 'casual5']
    assert C.main([d]) == 0

# 버전2 장면 — 몸 방향 두 번까지 · 머리 어깨 너머 한 장 · 자세 추천은 서로 다르게, 렌즈 · 방향 칸은 없어도 된다
V2 = [dict(treeV=2, preset='p%d' % i, frame=f, body=b, head=h) for i, (f, b, h) in enumerate(
    [('environmental', 'back', 'with_body'), ('full_body', 'side', 'with_body'), ('three_quarter', 'front', 'tilt'), ('waist_up', 'front', 'with_body'), ('chest_up', 'rear_3q', 'over_shoulder')])]
v2 = lambda xs: [('casual%d' % (i + 1), x) for i, x in enumerate(xs)]
assert C.check(v2(V2)) == [], C.check(v2(V2))
assert '몸 방향 front 이(가) 4 번' in ' | '.join(C.check(v2([dict(x, body='front') if i < 3 else x for i, x in enumerate(V2)])))
assert '머리 어깨 너머가 2 장' in ' | '.join(C.check(v2([dict(x, head='over_shoulder') if i == 1 else x for i, x in enumerate(V2)])))
assert '자세 추천 p0 이(가) 2 번' in ' | '.join(C.check(v2([dict(x, preset='p0') if i == 1 else x for i, x in enumerate(V2)])))
# 버전1 다섯 장 위에 버전2 — 프레이밍은 다 같이 센다
mixed = sc(GOOD) + [('casual6', dict(V2[0], frame=GOOD[0][1]))]
assert '프레이밍 ' + GOOD[0][1] in ' | '.join(C.check(mixed))

print('PASS 일상컷 구도: 방향·프레이밍 겹침·렌즈 세 번·먼/가까운 컷·빈칸·기록 폴더 · 버전2(몸 방향·어깨 너머·자세 추천·섞인 묶음)')
