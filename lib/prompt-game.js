/* 게임 프롬프트 조립 — 표(lib/prompt-spec.js)·게임 설계표 한 칸·화풍 판 하나를 받아 영어 프롬프트 한 덩이를 만든다.
   화면 없이 node 로도 부른다(tests/prompt-game.cjs). 말은 전부 표에서 꺼낸다 — 여기는 한글이 0자리다.

   book-atelier 의 lib/prompt-book.js 에서 왔다(그쪽은 pkm 의 prompt-anthro). 네 갈래:
   - 폼 초상 · 새 인물(create): 첨부 없이 한 장. 이 게임의 첫 그림이 인물 기준이다(설계표의 시범 폼이 보통 첫 그림).
   - 폼 초상 · 이어가기(reference): 확정한 첫 그림을 첨부하고 의상만 그 폼으로.
   - 개방(open): 그 폼 그림을 첨부하고 같은 그림에서 둘레의 세계만 명장면으로.
   - 일상(casual): 확정한 그림을 첨부하고 평상복 장면 — 일상컷 트리(lib/casual-tree.js)의 시대·장소·하는 일·의상·구도, 세 축은 pkm 과 같다.
   차례: 입력 → 게임 → 캐릭터 아님·그리지 않을 것 → 화풍(+ 참고 그림 줄) → (새 인물: 무엇·핵심 조작·시대·실루엣·얼굴) → 폼 → 출력 → 고른 것 → 외형 → 금지 → 화풍 점검.
   일상컷: 입력 → 인물 → 캐릭터 아님 → 화풍 → 알아볼 거리 → 나이 → 출력 → FRAME·CROP → 시대·장소 줄 → 고른 장면 → 옷·각도·뒤돌아보기 → 몸 → 점검.
   일상컷은 화풍 판의 casual 문장(pkm 일상컷 문장)이 있으면 그것을 쓴다.
   일상컷 버전2(장면 treeV 2 + 표 tree2, lib/casual-tree-v2.js): 하는 일 줄 없이 SCENE 에 POSTURE · SUPPORT · COMPOSITION(렌즈 자동) · RIGHT HAND · LEFT HAND · PROP · LEGS · GAZE · EXPRESSION(시선 말을 뗀 표정),
   몸 줄 끝에 「본인 기준 좌우」, 손 줄은 「넓혀서 보이지 않기」. 버전1 기록은 버전1 그대로.
   칸 꼴(2026-11-11 3단계): 폼(새 인물 · 이어가기) · 개방은 st.sections 가 켜지고 core 칸 틀(AtelierSpec.CORE_FRAME)이 있으면
   머리말 + 다섯 칸(1 STYLE · 2 CHARACTER · 3 COSTUME — 단계 · 4 SCENE · 5 CONSTRAINTS)으로 짓는다 — buildSections. 글은 옛 꼴 그대로, 자리만 옮긴다.
   끄면 위 차례의 옛 꼴 그대로. 일상컷은 칸 꼴이 아니다. */
(function (root) {
  'use strict';
  var S = root.AtelierSpec, T = S.GAME_LINES, V = S.VOCAB_EN;

  function clean(value) { return typeof value === 'string' ? value.trim() : ''; }
  /* 설계표 글은 큰따옴표 안에 싣는다 — 글 속 큰따옴표(끝까지 "왜?" 라고)는 작은따옴표로 바꿔 따옴표가 엇갈리지 않게 */
  function quoted(value) { return clean(value).replace(/"/g, "'"); }
  function fill(text, vars) { return text.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; }); }
  function en(axis, key) { return (V[axis] || {})[key] || key || ''; }

  /* RGB 로 고른 색(#rrggbb) — myth-atelier 의 lib/prompt-myth.js 와 같다. 그림 모델은 코드만으론 흐리게 읽으니
     색 이름을 같이 붙인다. "#3A7BD5 (vivid medium blue)" */
  var HUES = [[15, 'red'], [35, 'orange'], [48, 'amber'], [62, 'yellow'], [80, 'yellow-green'], [150, 'green'], [186, 'teal'],
    [195, 'cyan'], [220, 'azure blue'], [250, 'blue'], [280, 'violet'], [310, 'purple'], [335, 'magenta'], [350, 'rose'], [361, 'red']];
  function isHex(v) { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v); }
  function hexName(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, h = 0, sat, i, hue;
    sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (d) h = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
    if (sat < 0.12 || d < 0.06) return l > 0.9 ? 'white' : l > 0.72 ? 'silver' : l > 0.4 ? 'gray' : l > 0.15 ? 'charcoal gray' : 'black';
    for (i = 0; i < HUES.length; i++) if (h < HUES[i][0]) { hue = HUES[i][1]; break; }
    if ((hue === 'orange' || hue === 'amber') && l < 0.42 && sat < 0.75) hue = l < 0.22 ? 'dark brown' : 'brown';
    else if ((hue === 'yellow' || hue === 'yellow-green') && l < 0.35) hue = 'olive';
    else if (hue === 'red' && l < 0.4) hue = 'crimson';
    else if ((hue === 'violet' || hue === 'purple') && l > 0.68) hue = 'lavender';
    else if ((hue === 'magenta' || hue === 'rose') && l > 0.6) hue = 'pink';
    if ((hue === 'amber' || hue === 'yellow') && l >= 0.42 && l < 0.7 && sat > 0.45) hue = 'golden ' + hue;
    var tone = l < 0.18 ? 'very dark' : l < 0.35 ? 'dark' : l < 0.62 ? 'medium' : l < 0.8 ? 'light' : 'pale';
    if (/brown|olive|crimson|lavender/.test(hue) && tone !== 'very dark') tone = '';
    var chroma = sat > 0.7 ? 'vivid' : sat < 0.35 ? 'muted' : '';
    return [chroma, tone, hue].filter(Boolean).join(' ');
  }
  function hexPhrase(hex) { return hex.toUpperCase() + ' (' + hexName(hex) + ')'; }

  /* 외형 선택지 — pkm 과 같다. 저장된 열쇠는 그대로, 풀이만 붙인다. 색 칸의 RGB 값은 코드 + 색 이름으로 */
  function paramValues(raw) {
    raw = raw.map(function (p) { return S.COLOR_KEYS[p[0]] && isHex(p[1]) ? [p[0], hexPhrase(p[1])] : p; });
    var out = raw.map(function (p) { return p.slice(); });
    var value = function (k) { var p = raw.find(function (p) { return p[0] === k; }); return p ? p[1] : ''; };
    var has = function (k) { return !!value(k); };
    out = out.map(function (p) {
      var guide = S.PARAM_GUIDES[p[0]] && S.PARAM_GUIDES[p[0]][p[1]];
      if (p[0] === 'hair length' && guide && S.HAIR_LENGTH_LIMITS[value('hairstyle')])
        return [p[0], S.HAIR_LENGTH_LIMITS[value('hairstyle')][1]];
      if (p[0] === 'eye shape' && ((p[1] === 'large' && has('eye size')) || (p[1] !== 'large' && has('eye tilt'))) && S.EYE_CONTOURS[p[1]])
        return [p[0], S.EYE_CONTOURS[p[1]]];
      return [p[0], guide ? p[1] + ' — ' + guide[1] : p[1]];
    });
    if (has('body type')) out.push(['body scope', 'Body type sets the build; body details adjust within it. These describe anatomy beneath the costume, not costume volume.']);
    if (has('hairstyle')) out.push(['hair scope', 'Keep the cut and its fixed length; other hair settings adjust within it. Hair choices do not set ethnicity.']);
    if (S.FACE_KEYS.some(has)) out.push(['facial precedence', 'Explicit facial geometry controls the actual outline, above style, ethnicity or demeanor; shading and expression must not reshape it.']);
    if (has('facial character')) out.push(['demeanor scope', 'Facial character affects demeanor only; preserve age and geometry. Explicit scene expression takes priority.']);
    if (has('facial ethnicity')) out.push(['ethnicity scope', 'Broad ancestry cue with individual variation; preserve explicit geometry, skin tone and hair. No stereotyped features.']);
    var right = value('eye color'), left = value('second eye color');
    out = out.filter(function (p) { return p[0] !== 'second eye color'; });
    if (left && left !== right) out.push(['heterochromia', 'Character-relative right eye is ' + (right || 'one chosen primary color, different from ' + left) +
      '; left eye is ' + left + '. Keep the sides; do not blend colors.']);
    else if (right) out.push(['eye color consistency', 'both eyes are ' + right]);
    return out;
  }
  function identityParams(raw) {
    return (raw || []).filter(function (p) {
      var d = S.PARAM_DEFS.find(function (d) { return d.key === p[0]; });
      return d && S.IDENTITY_GROUPS.indexOf(d.group) >= 0 && S.IDENTITY_EXCLUDED.indexOf(d.key) < 0 &&
        p[1] && p[1] !== '__custom__' && p[1] !== 'AUTO';
    });
  }
  function chosenKeys(st) {
    var out = {}; identityParams(st.params).forEach(function (p) { out[p[0]] = 1; }); return out;
  }

  /* 게임의 다섯 얼굴 묶음 → FACE 줄. 사람이 고른 얼굴 항목·끈 경우는 빠진다 */
  function faceItems(st) {
    var f = st.game && st.game.face;
    if (!f || st.faceDesignOn === false) return [];
    var chosen = chosenKeys(st);
    var out = Object.keys(S.FACE_PARAM).filter(function (k) { return f[k] && !chosen[S.FACE_PARAM[k]]; })
      .map(function (k) { return en(k, f[k]); });
    /* 설계표의 얼굴 계통 — 사람이 외형에서 계통을 고르면 그쪽이 이긴다 */
    var eth = clean(st.game.ethnicity);
    if (eth && !chosen['facial ethnicity']) out.push(fill(T.faceAncestry, { ethnicity: eth }));
    return out;
  }
  function faceLine(st) { var items = faceItems(st); return items.length ? fill(T.face, { items: items.join('; ') }) : ''; }
  /* 실루엣 축 6 → 한 줄. 체형·머리를 직접 골랐으면 그 축은 빠진다 */
  function silhouetteItems(st) {
    var s = st.game && st.game.silhouette;
    if (!s || st.silhouetteOn === false) return [];
    var chosen = chosenKeys(st), out = [];
    if (s.body && !chosen[S.SIL_PARAM.body]) out.push(en('body', s.body) + ' build');
    if (s.hair && !chosen[S.SIL_PARAM.hair]) out.push(en('hair', s.hair));
    if (s.hair_color && !chosen[S.SIL_PARAM.hair_color]) out.push(en('hair_color', s.hair_color));
    if (s.garment) out.push('garment structure: ' + en('garment', s.garment));
    if (s.material) out.push('main material: ' + en('material', s.material));
    /* 실루엣 자세 축은 그 폼·고른 자세가 없을 때만 — 마리오 엔딩에서 "한 주먹을 든다" 와 STANCE 의 "깃대를 두 손으로" 가 겹쳐
       팔이 셋이 되려 했다(2026-10-27). 설계표 폼마다 자세가 있으니 폼 초상에서는 사실상 빠진다 */
    var formPose = st.game && st.game.forms && st.game.forms[st.stage] && clean(st.game.forms[st.stage].pose);
    if (s.pose && !formPose && !clean(st.pose) && !(st.action && st.action.category)) out.push('attitude: ' + en('pose', s.pose));
    if (s.palette) out.push('palette: ' + en('palette', s.palette));
    return out;
  }

  /* 연출 — pkm 과 같다(무장 고르기는 표에서 빠졌다) */
  function actionDirection(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
    var lines = [], category = S.ACTION_CATEGORIES.find(function (r) { return r.key === raw.category; });
    if (category) {
      lines.push('Action category: ' + category.prompt);
      var example = category.examples.find(function (r) { return r.key === raw.example; });
      if (example) lines.push('Action example: ' + example.prompt);
    }
    S.ACTION_CONTROLS.forEach(function (control) {
      var option = control.options.find(function (r) { return r.key === raw[control.key]; });
      if (option) lines.push(control.promptLabel + ': ' + option.prompt);
    });
    return lines;
  }
  /* 폼 초상의 고른 장면 값만 한 줄씩(일상컷은 casualDetails). 화면 비율은 2:3 이 아닐 때만 */
  function sceneDetails(st, mode) {
    var details = [];
    if (clean(st.expr)) details.push('Expression: ' + (S.EXPRESSION_DETAIL[st.expr] || st.expr));
    ['pose', 'orient', 'scene', 'outfit', 'custom'].forEach(function (k) {
      var value = clean(st[k]);
      if (k === 'pose') {
        var actionPose = mode === 'form' && S.ACTION_POSES.find(function (r) { return r.key === value; });
        value = actionPose ? actionPose.prompt : ((S.POSE_GUIDES[value] || [])[1] || value);
      }
      if (k === 'orient') value = (S.ORIENTATION_GUIDES[value] || [])[1] || value;
      var label = { pose: 'Pose', orient: 'Orientation', scene: 'Scene', outfit: 'Outfit and props', custom: 'Note' }[k];
      if (value) details.push(label + ': ' + value);
    });
    if (clean(st.frame)) details.push('Framing: ' + ((S.FRAME_GUIDES[st.frame] || [])[1] || clean(st.frame)));
    if (clean(st.lens)) details.push('Lens / perspective: ' + ((S.LENS_GUIDES[st.lens] || [])[1] || clean(st.lens)));
    if (clean(st.camera)) details.push('Camera: ' + clean(st.camera));
    if (mode === 'casual') (S.LOCAL_AXES || []).forEach(function (k) {
      var v = st.axes && st.axes[k];
      if (v && v !== 'AUTO' && (S.ADVANCED_OPTIONS[k] || []).indexOf(v) >= 0) details.push(k + ': ' + v + ' — ' + S.SCENE_AXIS_GUIDES[k][v][1]);
    });
    var aspect = clean(st.aspect);
    if (mode !== 'casual' && aspect && aspect !== '2:3') details.push('Aspect ratio: ' + aspect);
    return details;
  }

  function stageInfo(stage) {
    var s = S.STAGE_EN[stage];
    if (!s) throw new Error('Unknown stage: ' + stage);
    return s;
  }
  /* 사실 칸(facts — Wikidata)에서 연도만. 받지 않았으면 싣지 않는다(지어내지 않는다).
     개발사는 그림에 쓸모가 없고, Wikidata 의 차례대로 싣자 테트리스는 파지트노프가 빠졌다 — 생성기 화면의 게임 한 줄에만 보인다 */
  function factsText(g) {
    var f = g.facts || {}, out = [];
    if (typeof f.year === 'number') out.push(String(f.year));
    return out.length ? ', ' + out.join(' ') : '';
  }
  function gameLine(g) {
    return fill(T.game, { title: clean(g.title), title_en: clean(g.title_en) || clean(g.title), facts: factsText(g),
      genre: en('genre', g.genre), era: en('era', g.era) });
  }
  /* 알아볼 거리 — 설계표 signature. 폼·개방은 다, 일상컷은 하나만 작게 */
  function signatureLine(g, casual) {
    var items = (g.signature || []).map(clean).filter(Boolean);
    return items.length ? [fill(casual ? T.casualSignature : T.signature, { items: items.map(function (x) { return '"' + quoted(x) + '"'; }).join(', ') })] : [];
  }
  /* 게임 속 캐릭터를 그리지 않는다 — 늘 싣는다. 설계표 avoid 는 게임마다 */
  function guardLines(g) {
    var items = (g.avoid || []).map(clean).filter(Boolean);
    return [T.trademark].concat(items.length ? [fill(T.avoid, { items: items.map(function (x) { return '"' + quoted(x) + '"'; }).join('; ') })] : []);
  }
  /* 출시 당시 — 받은 연도가 있으면 그 해 무렵, 없으면 시대의 대략 */
  function releasePeriod(g) {
    var y = (g.facts || {}).year;
    return typeof y === 'number' ? 'around ' + y : (S.ERA_PERIOD[g.era] || 'her release years');
  }
  function styleText(st, mode) {
    var t = mode === 'casual' && clean(st.styleCasual) ? clean(st.styleCasual) : clean(st.styleText);
    if (!t) throw new Error('Style text is required (data/style.json)');
    return t;
  }
  /* 화풍 블록은 게임 줄 바로 뒤에 둔다 — 설계 줄 뒤에 묻히면 그림 모델이 장르마다 제 기본 화풍으로 갔다(book 2026-10-15 시범).
     판에 참고 그림이 있으면 "그리는 방식만" 줄을, 판에 마무리 점검(check)이 있으면 맨 끝에 한 번 더 싣는다 */
  function styleLines(st, mode) {
    var out = ['STYLE: ' + styleText(st, mode)];
    if (st.styleRef) out.push(T.styleRef);
    return out;
  }
  function styleCheck(st) { return clean(st.styleCheck) ? ['FINAL CHECK: ' + clean(st.styleCheck)] : []; }
  /* 폼 초상의 노출 — 과감은 의상 구조(설계표 실루엣의 복식 구조)에 맞는 갈래를 고른다 */
  function exposureLine(st) {
    var e = S.FORM_EXPOSURE[st.exposure];
    if (!e || typeof e === 'string') return e || '';
    var g = st.game && st.game.silhouette && st.game.silhouette.garment;
    return e[S.GARMENT_LAYER[g]] || e.open;
  }
  /* 나이 줄 — 새 인물은 고른 나이(자동이면 20대), 첨부 그림이 정하는 갈래는 그 나이를 지키고 주름을 더하지 않는다 */
  function ageValue(st) {
    var p = (st.params || []).find(function (x) { return x[0] === 'apparent age'; });
    return (p && p[1] && p[1] !== '__custom__') ? p[1] : S.AGE_DEFAULT;
  }
  function ageLine(st) {
    var v = ageValue(st);
    return S.AGE_LINES[v] || ('AGE: ' + v + '.');
  }
  function inputLine(line, st) { return st.styleRef ? line + ' ' + T.styleRefInput : line; }

  /* 일상컷 알아볼 거리 — 자동이면 하나~둘을 고르게, 하나를 골랐으면 그것만, 없음이면 싣지 않는다 */
  function casualSignature(g, prop) {
    if (prop === 'none') return [];
    var one = /^\d+$/.test(String(prop || '')) && clean((g.signature || [])[Number(prop)]);
    return one ? [fill(T.casualSignatureOne, { item: '"' + quoted(one) + '"' })] : signatureLine(g, true);
  }
  /* 일상컷 트리 길 → 한 줄씩. 장소·하는 일·옷은 트리 영어, 자세·방향·프레이밍·렌즈는 표 풀이 */
  /* 주인공·마스코트 코스튬 — 의상 계열에 costume: true. 옷 문장의 {costume} 은 설계표의 costume.en(없으면 일반 말) */
  function isCostume(fam) { return !!(fam && fam.costume); }
  function costumeOutfit(text, g) { return String(text || '').replace('{costume}', clean(((g || {}).costume || {}).en) || "her game's hero or mascot outfit"); }
  function casualDetails(sc, tree, g) {
    var CT = root.AtelierCasualTree, out = [], close = S.CLOSE_FRAMES.indexOf(clean(sc.frame)) >= 0;
    var p = CT.place(tree, sc.place), a = CT.act(tree, sc.act), f = CT.family(tree, sc.ofam), it = CT.item(tree, sc.ofam, sc.item);
    if (p) out.push('Place: ' + (sc.era === 'in_game' && p.key === 'game_place' ? 'the place named in WORLD' : p.en));
    if (a) out.push('Activity: ' + a.en);
    if (clean(sc.outfit)) out.push('Outfit: ' + clean(sc.outfit));
    else if (it) out.push('Outfit: ' + costumeOutfit(it.en, g));
    else if (f) out.push('Outfit: ' + f.en);
    if (clean(sc.pose)) out.push('Pose: ' + ((S.POSE_GUIDES[sc.pose] || [])[1] || clean(sc.pose)));
    if (clean(sc.orient)) out.push('Orientation: ' + ((S.ORIENTATION_GUIDES[sc.orient] || [])[1] || clean(sc.orient)));
    if (clean(sc.frame)) out.push('Framing: ' + ((S.FRAME_GUIDES[sc.frame] || [])[1] || clean(sc.frame)));
    if (clean(sc.lens)) out.push('Lens / perspective: ' + ((S.LENS_GUIDES[sc.lens] || [])[1] || clean(sc.lens)));
    if (clean(sc.camera)) out.push('Camera: ' + clean(sc.camera));
    if (clean(sc.expr)) out.push('Expression: ' + (S.EXPRESSION_DETAIL[sc.expr] || sc.expr));
    if (clean(sc.scene)) out.push('Scene note: ' + clean(sc.scene));
    if (clean(sc.custom)) out.push('Note: ' + clean(sc.custom));
    (S.LOCAL_AXES || []).forEach(function (k) {
      var v = sc.axes && sc.axes[k];
      if (!v || v === 'AUTO' || (S.ADVANCED_OPTIONS[k] || []).indexOf(v) < 0) return;
      /* 코스튬 컷은 게임이 옷에 드러나는 컷 — 「게임은 작은 장신구로만」 축 줄을 싣지 않는다 */
      if (k === 'source_influence' && isCostume(f)) return;
      var closeGuide = close && S.CLOSE_AXIS_GUIDES[k] && S.CLOSE_AXIS_GUIDES[k][v];
      out.push(k + ': ' + v + ' — ' + (closeGuide || S.SCENE_AXIS_GUIDES[k][v][1]));
    });
    return out;
  }

  /* 버전2 표정 — 표정 문장 속 시선 말을 뗀다(시선은 GAZE 줄 하나가 정한다, docs/CASUAL_TREE_V2.md 4-5절) */
  var EXPR_GAZE = [[/,?\s*gaze slightly to the side/, ''], [/\bdirect (\w+) gaze\b/, '$1 eyes'], [/\bhard forward gaze\b/, 'hard eyes'],
    [/\bsoft distant gaze past the camera\b/, 'soft distant eyes'], [/\bgaze softened and directed slightly upward or away\b/, 'softened eyes'],
    [/\bgaze direct and unwarm\b/, 'eyes unwarm'], [/ fixed on one point/, ''], [/ looking away/, ''], [/,?\s*eyes off camera/, ''], [/\bgaze angled down and away,\s*/, '']];
  function exprNoGaze(text) { return EXPR_GAZE.reduce(function (t, r) { return t.replace(r[0], r[1]); }, String(text || '')); }
  /* 버전2 장면 → 줄. 손 · 소품 · 받침의 관계는 PROP 한 줄에서만, 오른손 · 왼손은 인물 본인 기준 */
  function casualDetailsV2(sc, t, g) {
    var C = root.AtelierCasualTreeV2, out = [], f = C.frame(t, sc.frame);
    var p = C.place(t, sc.place), fam = C.family(t, sc.ofam), it = C.item(t, sc.ofam, sc.item);
    var po = C.posture(t, sc.posture), su = C.support(t, sc.support), u = C.use(t, sc.use), pr = u && C.prop(t, u.prop);
    var by = function (list, k) { return list.find(function (r) { return r.key === k; }); };
    var body = by(t.v2.body, sc.body), head = by(t.v2.head, sc.head), cam = by(t.v2.camera, sc.camera);
    var bl = C.backLook(t, sc);   /* 뒷모습 돌아보기 — 돌아보는 어깨 · 손의 화면 쪽 · 얼굴 손의 팔(lib/casual-tree-v2.js) */
    var gaze = by(t.v2.gaze, sc.gaze || (u && u.gaze) || '');
    if (p) out.push('Place: ' + (sc.era === 'in_game' && p.key === 'game_place' ? 'the place named in WORLD' : p.en));
    /* 계절 · 날씨(고르면) — 실내면 창밖으로 드러난다(문장이 그렇게 말한다) */
    var wt = (t.v2.weather || []).find(function (r) { return r.key === sc.weather; });
    if (wt) out.push('Weather / season: ' + wt.en + '.');
    /* 안경 — 옷이 아니라 장면의 표시(ofeat glasses) */
    var specs = (sc.ofeat || []).indexOf('glasses') >= 0 ? '; she wears thin-framed glasses' : '';
    if (clean(sc.outfit)) out.push('Outfit: ' + clean(sc.outfit) + specs);
    else if (it) out.push('Outfit: ' + costumeOutfit(it.en, g) + specs);
    else if (fam) out.push('Outfit: ' + fam.en + specs);
    if (po) out.push('POSTURE: ' + po.en + '.');
    if (su && su.en) out.push('SUPPORT: ' + su.en + '.');
    /* 머리가 몸을 따르면 말을 싣지 않는다 — 빈 값으로 채우지 않기 */
    /* 몸이 옆모습이면 얼굴도 옆모습 — 「body in side profile」 만으로는 얼굴을 카메라로 돌리고 몸까지 돌았다(MGS 일상3 · 4). 카메라를 보면 눈만 */
    /* 뒤 3/4 도 같다 — 얼굴 말이 없으면 앞 3/4 로 돌렸다(MGS 일상7). 몸 표의 turned_face 를 붙인다 */
    var bodyText = body && body.en + (body.profile_face && head && head.key === 'with_body' ? (gaze && gaze.key === 'camera' ? ', her face in profile too — only her eyes turn toward the camera' : ', her face in profile too, not turned toward the camera') : '')
      + (body.turned_face && head && head.key === 'with_body' ? ', ' + body.turned_face : '');
    out.push('COMPOSITION: ' + [(f && f.en) || sc.frame, bodyText, head && head.key !== 'with_body' && (bl ? bl.head : head.en), cam && cam.en].filter(Boolean).join('; ') + '.');
    var lens = C.lens(t, sc.frame);
    if (lens) out.push('Lens / perspective: ' + ((S.LENS_GUIDES[lens] || [])[1] || lens));
    var r = C.hand(t, sc.right), both = r && r.both && sc.right === sc.left;
    if (both) out.push('BOTH HANDS: ' + r.en + '.');
    else ['right', 'left'].forEach(function (side) {
      var k = sc[side], h = C.hand(t, k), text;
      if (k === 'prop') text = fill(T.handBusyV2, { side: side });
      else if (h) text = h.en.replace('{side}', side) + (h.elbow ? ', her elbow ' + h.elbow : '');
      if (text) out.push(side.toUpperCase() + ' HAND: ' + text + (bl ? ' — ' + bl.where(side) : '') + '.');
    });
    if (bl && bl.arm && !both) out.push(bl.arm);
    if (u && pr) {
      var thing = pr.signature ? '"' + quoted(signatureItem(g, sc.prop)) + '"' : pr.en, action = u.en.replace('{prop}', thing);
      var side = sc.right === 'prop' ? 'right' : 'left';
      out.push('PROP: ' + (u.hands === 'both' ? fill(T.propBothV2, { action: action, right: u.grip.right, left: u.grip.left }) : fill(T.propOneV2, { side: side, action: action })) + '.');
    }
    var lg = C.leg(t, sc.legs);
    if (lg && f && f.legs) out.push('LEGS: ' + lg.en + '.');
    if (gaze) out.push('GAZE: ' + gaze.en + '.');
    /* 표정은 버전2 표(눈썹 · 눈꺼풀 · 입만), 없으면 버전1 문장에서 시선 말을 뗀 것. 몸이 「뒤」 이고 고개를 안 돌리면 얼굴이 안 보여 싣지 않는다(뒤 3/4 는 옆얼굴이 보여 싣는다) */
    var faceHidden = body && body.face_hidden && !(head && head.look_back);
    if (clean(sc.expr) && !faceHidden) out.push('EXPRESSION: ' + ((t.v2.expressions || {})[sc.expr] || exprNoGaze(S.EXPRESSION_DETAIL[sc.expr] || sc.expr)) + '.');
    if (clean(sc.scene)) out.push('Scene note: ' + clean(sc.scene));
    if (clean(sc.custom)) out.push('Note: ' + clean(sc.custom));
    (S.LOCAL_AXES || []).forEach(function (k) {
      var v = sc.axes && sc.axes[k];
      if (!v || v === 'AUTO' || (S.ADVANCED_OPTIONS[k] || []).indexOf(v) < 0) return;
      if (k === 'source_influence' && isCostume(fam)) return;
      var closeGuide = f && f.close && S.CLOSE_AXIS_GUIDES[k] && S.CLOSE_AXIS_GUIDES[k][v];
      out.push(k + ': ' + v + ' — ' + (closeGuide || S.SCENE_AXIS_GUIDES[k][v][1]));
    });
    return out;
  }
  /* 소품이 알아볼 거리면 — 손에 들 수 있는 것(설계표 signature_hold) 중 고른 하나, 아니면 그 첫째. 장소 · 풍경은 들지 않는다 */
  function signatureItem(g, prop) {
    var list = g.signature || [], hold = g.signature_hold || [], i = /^\d+$/.test(String(prop || '')) ? Number(prop) : -1;
    return clean(list[hold.indexOf(i) >= 0 ? i : hold[0]]) || "her game's signature object";
  }
  /* 버전2 장면 칸만 — 생성기 상태(st)에는 표(tree)·게임·화풍이 같이 들어 있다 */
  var SCENE_V2 = ['treeV', 'era', 'place', 'ofam', 'item', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'kind', 'legs', 'gaze',
    'weather', 'expr', 'preset', 'prop', 'outfit', 'ofeat', 'scene', 'custom', 'axes', 'unlocked', 'unlockedAuto'];
  function sceneV2(st) { var o = {}; SCENE_V2.forEach(function (k) { if (st[k] !== undefined) o[k] = st[k]; }); return o; }
  /* 일상컷 — 얼굴 · 화풍은 첨부 그림에 맡긴다(2026-11-03). 화풍 문장 · 얼굴 문장을 새로 주면 GPT 세션이 첨부 그림의 얼굴을 그 말대로 다시 그렸다
     (헬륨 메카 일상 — 사용자 「일상컷 저거 너무 이상해」 → 이 세 줄로 「이제 좀 낫네」). STYLE 은 「첨부 그림 그대로」, FACE 줄을 넣고, 표정은 얼굴 안에서 살짝만 */
  var REF_STYLE = "STYLE: keep the attached image's rendering exactly — the same finish, skin rendering, line weight, colour palette, saturation and lighting quality. Do not restyle her: no more realistic, no more painterly, no more 2D than the attached image. Only the outfit, pose, expression, framing and place change.";
  var REF_FACE = "FACE: exactly the face of the attached image — the same face shape, jawline, eye shape and size, nose, lips and their proportions, and the same skin rendering. Do not add skin texture, pores, harder nose or lip modelling, or any facial definition the attached image does not have.";
  var REF_EXPR = ' Show it mildly, only with her brows, eyelids and mouth corners; her face shape and features stay exactly as in the attached image.';
  function refLock(text) {
    var out = [], faced = false;
    String(text).split('\n\n').forEach(function (p) {
      if (/^STYLE: /.test(p)) { out.push(REF_STYLE); return; }
      if (/^FINAL CHECK: /.test(p)) return;
      if (/^AGE: the same adult woman as in the attached image/.test(p)) { out.push(REF_FACE); faced = true; return; }
      out.push(p.replace(/^EXPRESSION: .*$/m, function (l) { return l.replace(/\s+$/, '') + REF_EXPR; }));
    });
    if (!faced) { var i = out.findIndex(function (p) { return /^CHARACTER: /.test(p); }); out.splice(i >= 0 ? i + 1 : 1, 0, REF_FACE); }
    return out.join('\n\n');
  }
  function buildCasualV2(st, b) {
    var C = root.AtelierCasualTreeV2, t = C.make(st.tree2, st.tree), lines = [], motifs = clean(st.motifs);
    var sc = C.repair(t, sceneV2(st), b), f = C.frame(t, sc.frame), u = C.use(t, sc.use), pr = u && C.prop(t, u.prop);
    var body = t.v2.body.find(function (r) { return r.key === sc.body; }) || {}, head = t.v2.head.find(function (r) { return r.key === sc.head; }) || {};
    lines.push(inputLine(T.casualInput, st));
    lines.push(fill(T.casualCharacter, { title: clean(b.title), genre: en('genre', b.genre) }));
    lines.push.apply(lines, guardLines(b));
    lines.push.apply(lines, styleLines(st, 'casual'));
    /* 알아볼 거리를 소품으로 들면 SIGNATURE 줄 대신 PROP 줄 — 둘 다 실으면 손이 하나 더 나왔다 */
    if (!(pr && pr.signature)) lines.push.apply(lines, casualSignature(b, sc.prop));
    lines.push(S.AGE_KEEP);
    var cos = isCostume(C.family(t, sc.ofam));
    lines.push(cos ? T.casualOutputCostume : T.casualOutputV2);
    lines.push(fill(T.casualFrameV2, { frame: S.ASPECT_FRAME[clean(st.aspect)] || S.ASPECT_FRAME['2:3'] }));
    var close = S.CLOSE_FRAMES.indexOf(clean(sc.frame)) >= 0;
    if (close) lines.push(fill(T.casualCropV2, { edge: S.CROP_EDGE[clean(sc.frame)] }));
    if (sc.era === 'release') lines.push(fill(T.casualEra, { period: releasePeriod(b) }));
    if (sc.era === 'in_game') lines.push(fill(T.casualWorld, { title: clean(b.title), place: quoted(b.place) || 'its own recognisable places' }));
    if (sc.era === 'fantasy') lines.push(T.casualFantasy);
    if (root.AtelierCasualTree.screens(t.v1, sc.place)) lines.push(T.casualScreens);
    lines.push('SCENE (chosen):\n' + casualDetailsV2(sc, t, b).join('\n'));
    if (motifs) lines.push('MOTIFS to echo lightly: ' + motifs + '.');
    lines.push(cos ? T.casualWardrobeCostume : close ? T.casualWardrobeClose : T.casualWardrobe);
    lines.push(T.casualPose);
    /* 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만 — 등만 돌린 컷에 돌아보기를 붙이지 않는다. 눈은 GAZE 줄이 정한다 */
    if (body.far && head.look_back) lines.push(T.casualLookBackV2);
    lines.push(T.figureCasual, close ? T.anatomyClose : T.anatomy, T.bodyV2, T.handsV2);
    lines.push.apply(lines, styleCheck(st));
    return refLock(lines.join('\n\n'));
  }

  /* ── 칸 꼴(2026-11-11 3단계 — 사용자 「초안 없이 다 진행해줘」) ──
     폼(새 인물 · 이어가기) · 개방 지시문을 core 칸 틀(S.CORE_FRAME — 화풍공방 core v4~, 삼국지 · 원소와 같은 틀)의 머리말 + 다섯 칸에 나눠 싣는다.
     글은 옛 꼴(GAME_LINES)의 그 문장 그대로이고 바뀌는 것은 표 S.SECTIONS 에 적힌 것뿐이다:
     줄 머리(heads · lines, 나머지는 첫 글자만 대문자), 옛 줄 이름을 가리키던 말(refs), 해부 줄과 겹치는 조각(overlap), 「No …」 나열 문장은 5칸 Avoid 로(splitNo).
     칸 머리 · 해부 줄 · Avoid 줄은 S.CORE_FRAME 에서만 온다. 일상컷은 이 꼴이 아니다 */
  /* 켜는 곳 — data/style.json 꼭대기 "sections": true. 판(versions[])에 "sections": false 면 그 판만 옛 꼴. core 칸 틀이 없으면 옛 꼴 */
  function sectionsOn(style, row) {
    return !!(S.CORE_FRAME && S.SECTIONS) && !(row && row.sections === false) && !!((row && row.sections) || (style && style.sections));
  }
  function sentences(text) {
    var a = String(text).split(/\.\s+(?=[A-Z])/);
    return a.map(function (x, i) { return i < a.length - 1 ? x + '.' : x; });
  }
  /* 「No a, b or c.」 문장 · 「; no a, no b」 마디 → 금지 낱말 목록, 나머지 글은 그대로(원소 공방 splitNo 와 같다 — 조건 「unless …」 이 붙은 마디는 제자리).
     sentenceOnly 면 문장째 「No …」 만 — 한 지시의 일부인 「; no …」 마디(외형 풀이)는 건드리지 않는다 */
  function splitNo(text, sentenceOnly) {
    var keep = [], avoid = [], list = /,\s*(?:no\s+)?|\s+or\s+(?:no\s+)?/i;
    sentences(clean(text)).forEach(function (sen) {
      var dot = /\.$/.test(sen), body = dot ? sen.slice(0, -1) : sen, parts = sentenceOnly ? [body] : body.split(/;\s*/);
      if (!parts.some(function (p) { return /^no\s/i.test(p); })) { keep.push(sen); return; }
      var k = [], cap = false;
      parts.forEach(function (p) {
        if (!/^no\s/i.test(p)) { k.push(p); return; }
        p.replace(/^no\s+/i, '').split(list).map(clean).filter(Boolean).forEach(function (x) {
          if (/\bunless\b/.test(x)) { if (!k.length) cap = true; k.push('no ' + x); } else avoid.push(x);
        });
      });
      if (k.length) keep.push((cap ? k.join('; ').replace(/^./, function (c) { return c.toUpperCase(); }) : k.join('; ')) + (dot ? '.' : ''));
    });
    return { text: keep.join(' '), avoid: avoid };
  }
  /* 줄 머리 — 표(S.SECTIONS.heads)에 있으면 그 낱말, 없으면 대문자 머리를 첫 글자만 대문자로(HOLD BACK: → Hold back:) */
  function lowHead(text) {
    return String(text).replace(/^[A-Z][A-Z-]*(?: [A-Z][A-Z-]*)*(?=[ :.(])/, function (h) { return h.charAt(0) + h.slice(1).toLowerCase(); });
  }
  function rehead(text) {
    var H = S.SECTIONS.heads, k;
    text = String(text);
    for (k in H) if (text.indexOf(k) === 0) return H[k] + text.slice(k.length);
    return lowHead(text);
  }
  function buildSections(st, mode, b) {
    var CF = S.CORE_FRAME, SE = S.SECTIONS, R = SE.refs, LN = SE.lines, stage = st.stage, info = stageInfo(stage);
    var form = (b.forms || {})[stage] || {}, open = (b.opens || {})[stage] || {}, motifs = clean(st.motifs);
    var swap = function (text, pair) { return pair ? String(text).split(pair[0]).join(pair[1]) : String(text); };
    var overlap = function (text, key) { var o = SE.overlap[key]; return o && CF.anatomy.indexOf(o.core) >= 0 ? String(text).replace(o.drop, '') : String(text); };
    var head = [], p1 = [CF.s1], p2 = [CF.s2], p3 = [fill(CF.s3, { costume: SE.costume, genre: info.name.toUpperCase() })], p4 = [CF.s4], p5 = [CF.s5];
    var reference = mode === 'open' || st.identityMode === 'reference';
    var styleNo = splitNo(styleText(st, mode)), figure = splitNo(T.figure), avoid = styleNo.avoid.concat(figure.avoid);
    var guard = guardLines(b).map(rehead), sig = signatureLine(b).map(rehead), body = rehead(overlap(T.body, 'body'));
    var check = styleCheck(st).map(rehead);
    /* 1칸 — 화풍 문단 · 참고 그림 줄(그리는 방식만) · 마감 줄(폼) */
    p1.push(styleNo.text);
    if (st.styleRef) p1.push(rehead(swap(T.styleRef, reference ? R.styleRefKeep : R.styleRef)));

    if (mode === 'open') {
      if (!clean(open.scene)) throw new Error('Open scene is missing for ' + stage);
      var outHead = [], keepSame = [], moment = [];
      /* OUTPUT 줄 — 무엇을 내는가(머리말) · 첨부 그림의 그 사람(2칸 맨 위) · 무엇만 바꾸는가(4칸) */
      sentences(T.openOutput).forEach(function (s) {
        s = fill(s, { scene: quoted(open.scene) });
        if (/^Keep the same /.test(s)) keepSame.push(s);
        else if (/^Change only /.test(s) || /^She is the only person/.test(s)) moment.push(s);
        else outHead.push(s);
      });
      var single = sentences(T.openSingle);
      head.push(rehead(inputLine(fill(T.openInput, { stage: info.name.toLowerCase() }), st)), rehead(outHead.join(' ')), rehead(gameLine(b)), T.notes);
      p2.push.apply(p2, keepSame);
      p2.push(rehead(S.AGE_KEEP), body, rehead(T.handsKeep), CF.anatomy);
      p3.push.apply(p3, sig);
      p4.push.apply(p4, moment);
      if (clean(st.lookNote)) p4.push(lowHead('SCENE NOTE: ' + clean(st.lookNote)));
      if (clean(st.custom)) p4.push(lowHead('NOTE: ' + clean(st.custom)));
      p4.push(rehead(single[0]));
      p5.push(rehead(figure.text));
      if (single.length > 1) p5.push(single.slice(1).join(' '));
    } else {
      var create = !reference;
      var base = reference ? (S.STAGE_EN[st.baseStage] ? S.STAGE_EN[st.baseStage].name.toLowerCase() + ' form' : 'her first approved form') : '';
      var posed = clean(form.pose), stanceOn = !clean(st.pose) && !(st.action && st.action.category);
      var chosen = actionDirection(st.action).concat(sceneDetails(st, 'form'));
      var keepHer = [], reuse = [], refScene = '', background = '', persona = '', symbols = '';
      head.push(rehead(reference ? inputLine(fill(T.referenceInput, { base: base }), st) : (st.styleRef ? T.createInputRef : T.createInput)));
      /* OUTPUT 줄 — 무엇을 내는가(머리말) · 그 사람을 지킨다(2칸 맨 위) · 옷을 다시 쓰지 않는다(3칸) · 배경을 짓는다(4칸) · 카드 구도(4칸 Composition) */
      if (create) {
        var co = T.createOutput.split('{card}');
        head.push(rehead(clean(co[0])));
        background = swap(clean(co[1] || ''), R.createOutput);
      } else {
        var outRef = [];
        sentences(clean(fill(T.referenceOutput, { stage_en: info.name.toLowerCase(), card: '' }))).forEach(function (s) {
          if (/^Keep her /.test(s)) keepHer.push(swap(s, R.referenceKeep));
          else if (/^Do not reuse its /.test(s)) reuse.push(swap(s, R.referenceCostume));
          else if (/^Build the background/.test(s)) refScene = swap(s, stanceOn ? R.referenceScene : R.referenceSceneChosen);
          else outRef.push(s);
        });
        head.push(rehead(outRef.join(' ')));
      }
      head.push(rehead(gameLine(b)));
      /* SUBJECT 줄 — 누구인가(머리말) · 인격(2칸) · 상징은 의상 모티프(3칸) */
      if (create) {
        var subj = fill(T.subject, { persona: quoted(b.persona), desire: quoted(b.desire), conflict: quoted(b.conflict),
          symbols: (b.symbols || []).map(function (x) { return '"' + quoted(x) + '"'; }).join(', ') });
        var i1 = subj.indexOf(' Persona: '), i2 = subj.indexOf(' Its symbols become ');
        if (i1 > 0 && i2 > i1) { head.push(rehead(subj.slice(0, i1))); persona = subj.slice(i1 + 1, i2); symbols = subj.slice(i2 + 1); }
        else head.push(rehead(subj));
      }
      head.push(T.notes);

      /* SILHOUETTE 줄 — 몸 · 머리(2칸) / 복식 구조 · 재료(3칸 Silhouette) / 팔레트(3칸 Colours) / 태도(4칸) */
      var bodyHair = [], cut = [], colours = '', attitude = '', face = '';
      if (create) {
        silhouetteItems(st).forEach(function (x) {
          if (x.indexOf('palette: ') === 0) colours = x.slice(9);
          else if (x.indexOf('attitude: ') === 0) attitude = x.slice(10);
          else if (x.indexOf('garment structure: ') === 0 || x.indexOf('main material: ') === 0) cut.push(x);
          else bodyHair.push(x);
        });
        face = faceLine(st);
      }
      p1.push(rehead(swap(T.presentation, face ? R.presentation : R.presentationKeep)));

      /* 2칸 — (첨부 그림의 그 사람) · 나이 · 얼굴 · 몸과 머리 · 고른 외형 · 표정 · 인격 · 핵심 조작 · 비율 · 몸 · 해부 */
      p2.push.apply(p2, keepHer);
      p2.push(rehead(create ? ageLine(st) : S.AGE_KEEP));
      if (face) p2.push(rehead(face));
      if (bodyHair.length) p2.push(LN.bodyHair + bodyHair.join('; ') + '.');
      if (create) {
        /* 나이는 위의 Age 줄이 쥔다 — 목록에 또 싣지 않는다 */
        var values = paramValues(identityParams(st.params)).filter(function (p) { return p[0] !== 'apparent age'; });
        if (values.length) {
          p2.push(rehead(T.identity));
          values.forEach(function (p) { var r = splitNo(p[0] + ': ' + p[1], true); avoid.push.apply(avoid, r.avoid); p2.push(r.text); });
          if (values.some(function (p) { return p[0] === 'body measurements (B/W/H)'; })) p2.push(T.measurement);
        }
      }
      var fexpr = !clean(st.expr) && clean(form.expr) && S.EXPRESSION_DETAIL[form.expr];
      if (fexpr) p2.push(rehead(fill(reference ? T.formExpressionRef : T.formExpression, { stage_en: info.name.toUpperCase(), detail: fexpr })));
      if (persona) p2.push(persona);
      if (create && clean(b.mechanic)) p2.push(rehead(fill(T.mechanic, { mechanic: quoted(b.mechanic) })));
      var anatomy = splitNo(T.anatomy);
      avoid.push.apply(avoid, anatomy.avoid);
      p2.push(rehead(anatomy.text), body, CF.anatomy);

      /* 3칸 — 폼 모습 · 역할 · 단계 · 원작풍 장비 · (복식 · 색 · 상징 · 모티프 · 시대 감각 | 재료만 잇기) · 알아볼 거리 · 노출 */
      var formLine = sentences(T.form).map(function (s, i) {
        return fill(i ? s : s.replace(/^FORM — [^:]*: /, LN.costume), { stage: stage, stage_en: info.name.toUpperCase(), look: quoted(form.look), role: en('role', form.role), arc: info.arc });
      });
      p3.push.apply(p3, formLine.map(function (s, i) { return i ? s : rehead(s); }));
      if (clean(form.homage)) p3.push(rehead(fill(T.formHomage, { homage: quoted(form.homage) })));
      if (clean(st.lookNote)) p3.push(lowHead('FORM NOTE: ' + clean(st.lookNote)));
      if (cut.length) p3.push(LN.silhouette + cut.join('; ') + '.');
      if (colours) p3.push(LN.colours + colours + '.');
      var material = reference && st.silhouetteOn !== false && b.silhouette && b.silhouette.material;
      if (material) p3.push(rehead(swap(fill(T.garmentKeep, { material: en('material', material) }), R.garmentKeep)));
      p3.push.apply(p3, reuse);
      if (symbols) p3.push(symbols);
      if (motifs) p3.push(lowHead((reference ? 'MOTIFS to keep: ' : 'MOTIFS (user choice): ') + motifs + '.'));
      if (create && V.era_look[b.era]) p3.push(rehead(fill(T.eraLook, { look: V.era_look[b.era] })));
      p3.push.apply(p3, sig);
      var exposure = exposureLine(st);
      if (exposure) p3.push(rehead(swap(exposure, R.exposure)));

      /* 4칸 — 장소(폼 배경 + 단계의 빛 · 구도) · 자세(+ 단계 카메라) · 돌아보기 · 태도 · 손 · 카드 구도 · 고른 장면 값. 카메라 · 구도 글은 옛 꼴 그대로 */
      if (clean(form.setting)) p4.push(rehead(fill(T.setting, { setting: quoted(form.setting), scene: info.scene })));
      if (background) p4.push(background);
      if (stanceOn) p4.push(rehead(posed ? fill(T.stanceForm, { pose: quoted(form.pose), camera: info.camera }) : T.stance));
      if (posed && !clean(st.pose) && S.FORM_LOOK_BACK.some(function (w) { return form.pose.indexOf(w) >= 0; })) p4.push(rehead(T.formLookBack));
      if (attitude) p4.push(LN.attitude + attitude + '.');
      var hands = [clean(overlap(T.hands, 'hands'))];
      if (!chosen.length) hands.push(posed ? swap(T.handsPose, R.handsPose) : T.handsDefault);
      if (reference) hands.push(swap(T.handsWear, R.handsWear));
      hands = hands.join(' ');
      if (!/^[A-Z -]+:$/.test(hands)) p4.push(rehead(hands));
      if (refScene) p4.push(refScene);
      p4.push(LN.composition + T.card);
      if (chosen.length) { p4.push(T.sceneRule); p4.push.apply(p4, chosen); }

      /* 5칸 — 한 사람 · 캐릭터 아님 · 그리지 않을 것 · 개방 명장면은 빼 둔다 · 화풍 점검 · Avoid */
      p5.push(rehead(figure.text));
      var climaxes = Object.keys(b.opens || {}).map(function (k) { return clean((b.opens[k] || {}).scene); }).filter(Boolean);
      if (climaxes.length) guard.push(rehead(swap(fill(T.holdBack, { scenes: climaxes.map(function (x) { return '"' + quoted(x) + '"'; }).join('; ') }), R.holdBack)));
    }
    p5.push.apply(p5, guard);
    p5.push.apply(p5, check);
    /* 금지 낱말 — 화풍 글 · 한 사람 줄 · 비율 줄 · 외형 풀이의 「No …」 + 화풍 판의 avoid 목록. 겹치는 낱말은 한 번만 */
    avoid = avoid.concat(Array.isArray(st.styleAvoid) ? st.styleAvoid.map(clean).filter(Boolean) : []).filter(function (x, i, a) { return a.indexOf(x) === i; });
    if (avoid.length) p5.push(fill(CF.avoid, { list: avoid.join(', ') }));
    return [head].concat([p1, p2, p3, p4, p5]).map(function (p) { return p.filter(Boolean).join('\n'); }).join('\n\n');
  }

  function buildPrompt(st) {
    st = st || {};
    var mode = st.outputMode || 'form';
    if (['form', 'open', 'casual'].indexOf(mode) < 0) throw new Error('Unknown output mode: ' + mode);
    var b = st.game;
    if (!b || !clean(b.title)) throw new Error('Game is required');
    var motifs = clean(st.motifs), lines = [];

    /* 버전2 장면(treeV 2)이고 버전2 표가 오면 버전2 줄로. 버전1 기록은 버전1 그대로 조립한다(docs/CASUAL_TREE_V2.md 6절) */
    if (mode === 'casual' && st.tree2 && st.treeV === 2) {
      if (!root.AtelierCasualTreeV2 || !st.tree) throw new Error('Casual tree v2 needs lib/casual-tree-v2.js and data/casual-tree.json');
      return buildCasualV2(st, b);
    }
    if (mode === 'casual') {
      /* 일상컷은 트리 길(시대 → 장소 → 하는 일 → 의상 → 구도)로 짓는다(2026-10-29). 예전 갈래·예시는 변환표로 옮긴다 */
      var CT = root.AtelierCasualTree, tree = st.tree;
      if (!CT || !tree) throw new Error('Casual tree is required (data/casual-tree.json)');
      var sc = CT.repair(tree, CT.fromLegacy(tree, st), b, S.CLOSE_FRAMES);
      lines.push(inputLine(T.casualInput, st));
      lines.push(fill(T.casualCharacter, { title: clean(b.title), genre: en('genre', b.genre) }));
      lines.push.apply(lines, guardLines(b));
      lines.push.apply(lines, styleLines(st, 'casual'));
      lines.push.apply(lines, casualSignature(b, sc.prop));
      lines.push(S.AGE_KEEP);
      var cos1 = isCostume(CT.family(tree, sc.ofam));
      lines.push(cos1 ? T.casualOutputCostume : T.casualOutput);
      lines.push(fill(T.casualFrame, { frame: S.ASPECT_FRAME[clean(st.aspect)] || S.ASPECT_FRAME['2:3'] }));
      /* 가까운 컷 — 잘리는 선을 FRAME 바로 밑에. 맨 아래 SCENE 의 프레이밍 한 줄로는 전신 쪽으로 넓어졌다(2026-10-29) */
      var close = S.CLOSE_FRAMES.indexOf(clean(sc.frame)) >= 0;
      if (close) lines.push(fill(T.casualCrop, { edge: S.CROP_EDGE[clean(sc.frame)] }));
      /* 시대·장소 줄과 고른 장면은 FRAME 바로 뒤 — 맨 아래에 두니 고른 프레이밍이 첨부 그림의 전신 구도에 졌다(2026-10-29) */
      if (sc.era === 'release') lines.push(fill(T.casualEra, { period: releasePeriod(b) }));
      if (sc.era === 'in_game') lines.push(fill(T.casualWorld, { title: clean(b.title), place: quoted(b.place) || 'its own recognisable places' }));
      if (sc.era === 'fantasy') lines.push(T.casualFantasy);
      if (CT.screens(tree, sc.place)) lines.push(T.casualScreens);
      lines.push('SCENE (chosen):\n' + casualDetails(sc, tree, b).join('\n'));
      if (motifs) lines.push('MOTIFS to echo lightly: ' + motifs + '.');
      lines.push(cos1 ? T.casualWardrobeCostume : close ? T.casualWardrobeClose : T.casualWardrobe);
      lines.push(T.casualPose);
      if ((S.LOOK_BACK.orient || []).indexOf(clean(sc.orient)) >= 0 || (S.LOOK_BACK.pose || []).indexOf(clean(sc.pose)) >= 0) lines.push(T.casualLookBack);
      lines.push(T.figureCasual, close ? T.anatomyClose : T.anatomy, T.body, T.hands, T.handsCasual);
      lines.push.apply(lines, styleCheck(st));
      return refLock(lines.join('\n\n'));
    }

    /* 칸 꼴(2026-11-11 3단계) — 켜져 있고 core 칸 틀이 있으면 폼 · 개방은 머리말 + 다섯 칸으로. 아니면 아래 옛 꼴 그대로 */
    if (st.sections && S.CORE_FRAME && S.SECTIONS) return buildSections(st, mode, b);
    var stage = st.stage, info = stageInfo(stage);
    var form = (b.forms || {})[stage] || {}, open = (b.opens || {})[stage] || {};
    if (mode === 'open') {
      if (!clean(open.scene)) throw new Error('Open scene is missing for ' + stage);
      lines.push(inputLine(fill(T.openInput, { stage: info.name.toLowerCase() }), st));
      lines.push(gameLine(b));
      lines.push.apply(lines, guardLines(b));
      lines.push.apply(lines, styleLines(st));
      lines.push.apply(lines, signatureLine(b));
      lines.push(T.notes);
      lines.push(fill(T.openOutput, { scene: quoted(open.scene) }));
      lines.push(T.openSingle);
      lines.push(S.AGE_KEEP);
      if (clean(st.lookNote)) lines.push('SCENE NOTE: ' + clean(st.lookNote));
      if (clean(st.custom)) lines.push('NOTE: ' + clean(st.custom));
      lines.push(T.figure, T.body, T.handsKeep);
      lines.push.apply(lines, styleCheck(st));
      return lines.join('\n\n');
    }

    var reference = st.identityMode === 'reference';
    var base = reference ? (S.STAGE_EN[st.baseStage] ? S.STAGE_EN[st.baseStage].name.toLowerCase() + ' form' : 'her first approved form') : '';
    lines.push(reference ? inputLine(fill(T.referenceInput, { base: base }), st) : (st.styleRef ? T.createInputRef : T.createInput));
    lines.push(gameLine(b));
    lines.push.apply(lines, guardLines(b));
    lines.push.apply(lines, styleLines(st));
    lines.push.apply(lines, signatureLine(b));
    lines.push(T.notes);
    if (!reference) {
      lines.push(fill(T.subject, { persona: quoted(b.persona), desire: quoted(b.desire), conflict: quoted(b.conflict),
        symbols: (b.symbols || []).map(function (s) { return '"' + quoted(s) + '"'; }).join(', ') }));
      lines.push(ageLine(st));
      if (clean(b.mechanic)) lines.push(fill(T.mechanic, { mechanic: quoted(b.mechanic) }));
      if (V.era_look[b.era]) lines.push(fill(T.eraLook, { look: V.era_look[b.era] }));
      var sil = silhouetteItems(st);
      if (sil.length) lines.push(fill(T.silhouette, { items: sil.join('; ') }));
      var face = faceLine(st);
      if (face) lines.push(face);
    }
    if (reference) lines.push(S.AGE_KEEP);
    var material = reference && st.silhouetteOn !== false && b.silhouette && b.silhouette.material;
    if (material) lines.push(fill(T.garmentKeep, { material: en('material', material) }));
    if (motifs) lines.push((reference ? 'MOTIFS to keep: ' : 'MOTIFS (user choice): ') + motifs + '.');
    lines.push(fill(T.form, { stage: stage, stage_en: info.name.toUpperCase(), look: quoted(form.look), role: en('role', form.role), arc: info.arc }) +
      (clean(form.homage) ? '\n' + fill(T.formHomage, { homage: quoted(form.homage) }) : '') +
      (clean(st.lookNote) ? '\nFORM NOTE: ' + clean(st.lookNote) : ''));
    if (clean(form.setting)) lines.push(fill(T.setting, { setting: quoted(form.setting), scene: info.scene }));
    var climaxes = Object.keys(b.opens || {}).map(function (k) { return clean((b.opens[k] || {}).scene); }).filter(Boolean);
    if (climaxes.length) lines.push(fill(T.holdBack, { scenes: climaxes.map(function (s) { return '"' + quoted(s) + '"'; }).join('; ') }));
    var exposure = exposureLine(st);
    if (exposure) lines.push(exposure);
    lines.push(T.presentation);
    var posed = clean(form.pose);
    if (!clean(st.pose) && !(st.action && st.action.category)) lines.push(posed ? fill(T.stanceForm, { pose: quoted(form.pose), camera: info.camera }) : T.stance);
    if (posed && !clean(st.pose) && S.FORM_LOOK_BACK.some(function (w) { return form.pose.indexOf(w) >= 0; })) lines.push(T.formLookBack);
    /* 폼 표정 — 생성기에서 고르지 않았으면 설계표의 그 단계 표정(2026-11-01) */
    var fexpr = !clean(st.expr) && clean(form.expr) && S.EXPRESSION_DETAIL[form.expr];
    if (fexpr) lines.push(fill(reference ? T.formExpressionRef : T.formExpression, { stage_en: info.name.toUpperCase(), detail: fexpr }));
    lines.push(reference ? fill(T.referenceOutput, { stage_en: info.name.toLowerCase(), card: T.card }) : fill(T.createOutput, { card: T.card }));
    var chosen = actionDirection(st.action).concat(sceneDetails(st, 'form'));
    if (chosen.length) lines.push(T.sceneRule + '\n' + chosen.join('\n'));
    if (!reference) {
      /* 나이는 위의 AGE 줄이 쥔다 — 목록에 또 싣지 않는다 */
      var values = paramValues(identityParams(st.params)).filter(function (p) { return p[0] !== 'apparent age'; });
      if (values.length) lines.push(T.identity + '\n' + values.map(function (p) { return p[0] + ': ' + p[1]; }).join('\n') +
        (values.some(function (p) { return p[0] === 'body measurements (B/W/H)'; }) ? '\n' + T.measurement : ''));
    }
    var hands = [T.hands];
    if (!chosen.length) hands.push(posed ? T.handsPose : T.handsDefault);
    if (reference) hands.push(T.handsWear);
    lines.push(T.figure, T.anatomy, T.body, hands.join(' '));
    lines.push.apply(lines, styleCheck(st));
    return lines.join('\n\n');
  }

  function buildCasual(st) { return buildPrompt(Object.assign({}, st, { outputMode: 'casual' })); }
  function words(text) { return (String(text).match(/\S+/g) || []).length; }

  root.AtelierPrompt = { isHex: isHex, factsText: factsText, releasePeriod: releasePeriod, hexName: hexName, paramValues: paramValues, identityParams: identityParams, faceItems: faceItems, faceLine: faceLine,
    silhouetteItems: silhouetteItems, actionDirection: actionDirection, sceneDetails: sceneDetails,
    buildPrompt: buildPrompt, buildCasual: buildCasual, sectionsOn: sectionsOn, splitNo: splitNo, casualDetails: casualDetails, casualDetailsV2: casualDetailsV2, exprNoGaze: exprNoGaze, words: words };
})(typeof window !== 'undefined' ? window : globalThis);
