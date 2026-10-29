/* 게임 프롬프트 조립 — 표(lib/prompt-spec.js)·게임 설계표 한 칸·화풍 판 하나를 받아 영어 프롬프트 한 덩이를 만든다.
   화면 없이 node 로도 부른다(tests/prompt-game.cjs). 말은 전부 표에서 꺼낸다 — 여기는 한글이 0자리다.

   book-atelier 의 lib/prompt-book.js 에서 왔다(그쪽은 pkm 의 prompt-anthro). 네 갈래:
   - 폼 초상 · 새 인물(create): 첨부 없이 한 장. 이 게임의 첫 그림이 인물 기준이다(설계표의 시범 폼이 보통 첫 그림).
   - 폼 초상 · 이어가기(reference): 확정한 첫 그림을 첨부하고 의상만 그 폼으로.
   - 개방(open): 그 폼 그림을 첨부하고 같은 그림에서 둘레의 세계만 명장면으로.
   - 일상(casual): 확정한 그림을 첨부하고 평상복 장면 — 일상컷 트리(lib/casual-tree.js)의 시대·장소·하는 일·의상·구도, 세 축은 pkm 과 같다.
   차례: 입력 → 게임 → 캐릭터 아님·그리지 않을 것 → 화풍(+ 참고 그림 줄) → (새 인물: 무엇·핵심 조작·시대·실루엣·얼굴) → 폼 → 출력 → 고른 것 → 외형 → 금지 → 화풍 점검.
   일상컷: 입력 → 인물 → 캐릭터 아님 → 화풍 → 알아볼 거리 → 나이 → 출력 → FRAME·CROP → 시대·장소 줄 → 고른 장면 → 옷·각도·뒤돌아보기 → 몸 → 점검.
   일상컷은 화풍 판의 casual 문장(pkm 일상컷 문장)이 있으면 그것을 쓴다. */
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
  function casualDetails(sc, tree) {
    var CT = root.AtelierCasualTree, out = [];
    var p = CT.place(tree, sc.place), a = CT.act(tree, sc.act), f = CT.family(tree, sc.ofam), it = CT.item(tree, sc.ofam, sc.item);
    if (p) out.push('Place: ' + (sc.era === 'in_game' && p.key === 'game_place' ? 'the place named in WORLD' : p.en));
    if (a) out.push('Activity: ' + a.en);
    if (clean(sc.outfit)) out.push('Outfit: ' + clean(sc.outfit));
    else if (it) out.push('Outfit: ' + it.en);
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
      if (v && v !== 'AUTO' && (S.ADVANCED_OPTIONS[k] || []).indexOf(v) >= 0) out.push(k + ': ' + v + ' — ' + S.SCENE_AXIS_GUIDES[k][v][1]);
    });
    return out;
  }

  function buildPrompt(st) {
    st = st || {};
    var mode = st.outputMode || 'form';
    if (['form', 'open', 'casual'].indexOf(mode) < 0) throw new Error('Unknown output mode: ' + mode);
    var b = st.game;
    if (!b || !clean(b.title)) throw new Error('Game is required');
    var motifs = clean(st.motifs), lines = [];

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
      lines.push(T.casualOutput);
      lines.push(fill(T.casualFrame, { frame: S.ASPECT_FRAME[clean(st.aspect)] || S.ASPECT_FRAME['2:3'] }));
      /* 가까운 컷 — 잘리는 선을 FRAME 바로 밑에. 맨 아래 SCENE 의 프레이밍 한 줄로는 전신 쪽으로 넓어졌다(2026-10-29) */
      var close = S.CLOSE_FRAMES.indexOf(clean(sc.frame)) >= 0;
      if (close) lines.push(fill(T.casualCrop, { edge: S.CROP_EDGE[clean(sc.frame)] }));
      /* 시대·장소 줄과 고른 장면은 FRAME 바로 뒤 — 맨 아래에 두니 고른 프레이밍이 첨부 그림의 전신 구도에 졌다(2026-10-29) */
      if (sc.era === 'release') lines.push(fill(T.casualEra, { period: releasePeriod(b) }));
      if (sc.era === 'in_game') lines.push(fill(T.casualWorld, { title: clean(b.title), place: quoted(b.place) || 'its own recognisable places' }));
      if (sc.era === 'fantasy') lines.push(T.casualFantasy);
      if (CT.screens(tree, sc.place)) lines.push(T.casualScreens);
      lines.push('SCENE (chosen):\n' + casualDetails(sc, tree).join('\n'));
      if (motifs) lines.push('MOTIFS to echo lightly: ' + motifs + '.');
      lines.push(T.casualWardrobe);
      lines.push(T.casualPose);
      if ((S.LOOK_BACK.orient || []).indexOf(clean(sc.orient)) >= 0 || (S.LOOK_BACK.pose || []).indexOf(clean(sc.pose)) >= 0) lines.push(T.casualLookBack);
      lines.push(T.figure, close ? T.anatomyClose : T.anatomy, T.body, T.hands, T.handsCasual);
      lines.push.apply(lines, styleCheck(st));
      return lines.join('\n\n');
    }

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
    buildPrompt: buildPrompt, buildCasual: buildCasual, casualDetails: casualDetails, words: words };
})(typeof window !== 'undefined' ? window : globalThis);
