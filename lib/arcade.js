/* 첫 화면 — 오락실(book 의 서재처럼). 위는 배경 그림(그림 저장소 backgrounds/arcade.webp)의 바닥을 도트 인물이 거니는 무대,
   아래는 기기 줄 — 게임 한 편에 기기 하나(화면은 타이틀 그림 썸네일, 없으면 꺼진 화면), 누르면 그 게임의 도감.
   도트 인물은 data/sprites.json · lib/sprite-actor.js(공방 모음의 공용 재생기) — 인물이 없거나 그림을 못 받으면 띠째 없다(무대는 그대로).
   모양은 lib/arcade.css. 말은 전부 lib/words.js */
import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';
const W = window.W, IMG = window.AtelierImg, SP = window.AtelierSprite;

/* 바닥 띠 — 좁으면 둘·넓으면 셋, 날마다 차례가 돈다. 이름은 게임 제목, 누르면 도감(?game=) */
function DotFloor({ titles }) {
  const host = useRef(null), [on, setOn] = useState(false);
  useEffect(() => {
    if (!SP || !host.current) return;
    let live = true, F = null;
    SP.load('data/sprites.json').then(d => {
      if (!live || !d || !d.actors || !Object.keys(d.actors).length) return;
      F = SP.floor(host.current, d, { floor: 14, grow: false, labelOf: k => W('home.dot.actor', { name: titles[k] || k }),
        onSelect: k => { location.href = 'dex.html?game=' + encodeURIComponent(k); } });
      F.ready().then(() => { if (live) setOn(F.list().some(x => !x.actor.failed)); });
    }, () => {});
    return () => { live = false; if (F) F.destroy(); };
  }, []);
  return h('div', { class: 'home-dots', ref: host, hidden: !on, role: 'group', 'aria-label': W('home.dot.floor') });
}

/* 기기 하나 — 화면은 타이틀 폼 그림(없으면 아무 폼), 썸네일을 먼저 걸고 못 받으면 원본으로 */
function Cabinet({ game, entry }) {
  const file = IMG && entry ? IMG.coverOf(entry, 'f', null, 'title') : null;
  return h('a', { class: 'cabinet', role: 'listitem', href: 'dex.html?game=' + encodeURIComponent(game.key), 'data-game': game.key, 'data-group': game.group,
    title: game.persona, 'aria-label': W('home.cabinet', { title: game.title }) },
    h('span', { class: 'cabinet-marquee' }, game.title),
    h('span', { class: 'cabinet-screen' }, file
      ? h('img', { src: IMG.thumbURL(file), alt: '', loading: 'lazy', onError: e => { if (e.target.dataset.full) return; e.target.dataset.full = '1'; e.target.src = IMG.imgURL(file); } })
      : h('span', { class: 'cabinet-off' }, W('home.cabinet.none'))),
    h('span', { class: 'cabinet-panel', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
}

/* 오락실 — games 는 설계표의 games. 그림 등록부는 여기서 한 번 받는다(못 받으면 화면이 다 꺼진 기기) */
export function Arcade({ games }) {
  const [img, setImg] = useState(null);
  useEffect(() => { let live = true; IMG && IMG.load().then(d => { if (live) setImg(d || {}); }, () => { if (live) setImg({}); }); return () => { live = false; }; }, []);
  const titles = Object.fromEntries(games.map(g => [g.key, g.title]));
  return h('section', { class: 'arcade', 'aria-label': W('home.arcade') },
    h('div', { class: 'arcade-scene', role: 'img', 'aria-label': W('home.arcade.scene') }, h(DotFloor, { titles })),
    h('div', { class: 'arcade-row', role: 'list', 'aria-label': W('home.arcade.row') },
      games.map(g => h(Cabinet, { key: g.key, game: g, entry: img ? img[g.key] : null }))));
}
