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
chest = sc(GOOD); chest[1][1]['cat'] = 'lingerie'
assert '가슴 위 크롭' in ' | '.join(C.check(chest))
assert '비었다' in ' | '.join(C.check(sc([('', 'waist_up', 'wide24')] + GOOD[1:])))

# 기록 폴더 읽기 — 생성기 저장 상태의 scenes.casual
with tempfile.TemporaryDirectory() as d:
    for n, s in sc(GOOD):
        rec = {'game': 'g', 'storage': {'cards': {'g': {'scenes': {'casual': s}}}}}
        json.dump(rec, open(os.path.join(d, n + '-ui.json'), 'w'))
    open(os.path.join(d, 'title-ui.json'), 'w').write('{}')
    assert [n for n, _ in C.load([d])] == ['casual1', 'casual2', 'casual3', 'casual4', 'casual5']
    assert C.main([d]) == 0

print('PASS 일상컷 구도: 방향·프레이밍 겹침·렌즈 세 번·먼/가까운 컷·빈칸·란제리 가슴 위·기록 폴더')
