// 어린이 성경학교 슬라이드 — 렌더링 + 내비게이션
(function () {
  var stage = document.getElementById('stage');
  var bar = document.getElementById('progress');
  var counter = document.getElementById('counter');
  var THEME_COLOR = {
    blue: '#4f86e8', amber: '#e8950f', pink: '#e0608f', purple: '#8a63d2',
    brown: '#bd6b2e', green: '#2da06f', red: '#db5a50', sky: '#2b9cd8'
  };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  // 챕터 시작 위치(목차용)
  var chapterStarts = [];
  DECK.forEach(function (s, i) {
    if (s.type === 'chapter') chapterStarts.push({ index: i, title: s.title, theme: s.theme, part: s.part, page: s.page, short: s.short });
  });

  function buildSlide(s) {
    var sec = el('section', 'slide');
    sec.dataset.theme = s.theme || 'blue';
    var inner = el('div', 'inner');
    sec.appendChild(inner);

    if (s.type === 'cover') {
      inner.appendChild(el('div', 'cover-emoji', s.emoji));
      inner.appendChild(el('h1', 'cover-title', s.title));
      inner.appendChild(el('p', 'cover-sub', s.sub));
      if (s.hint) inner.appendChild(el('div', 'cover-hint', s.hint));
    } else if (s.type === 'toc') {
      inner.appendChild(el('h1', 'cover-title', s.title));
      var grid = el('div', 'toc-grid');
      chapterStarts.forEach(function (c) {
        var item = el('button', 'toc-item', '<span class="n">' + c.part + '</span><span>' + c.title + '</span>');
        item.style.setProperty('--tc', THEME_COLOR[c.theme]);
        item.addEventListener('click', function () { goTo(c.index); });
        grid.appendChild(item);
      });
      inner.appendChild(grid);
    } else if (s.type === 'chapter') {
      inner.appendChild(el('span', 'part-badge', 'PART ' + s.part + ' / 7'));
      inner.appendChild(el('div', 'part-emoji', s.emoji));
      inner.appendChild(el('h1', 'part-title', s.title));
      inner.appendChild(el('p', 'part-sub', s.sub));
    } else if (s.type === 'card') {
      var card = el('div', 'card-slide');
      var head = el('div', 'cs-head');
      head.appendChild(el('span', 'cs-ico', s.ico));
      head.appendChild(el('h2', 'cs-title', (s.num ? s.num + '. ' : '') + s.title));
      head.appendChild(el('span', 'cs-meta', s.meta));
      card.appendChild(head);
      card.appendChild(el('p', 'cs-theme', s.tline));
      var ul = el('ul', 'cs-bullets');
      s.bullets.forEach(function (b) { ul.appendChild(el('li', null, b)); });
      card.appendChild(ul);
      if (s.verse) card.appendChild(el('div', 'cs-verse', '<strong>기억해요!</strong> ' + s.verse));
      inner.appendChild(card);
    } else if (s.type === 'flow') {
      inner.appendChild(el('h2', 'flow-title', s.title));
      // cols가 있으면 그 개수씩 끊어 대칭 줄로 배치 (예: 8개 → 4 + 4)
      var groups = [];
      if (s.cols) {
        for (var gi = 0; gi < s.steps.length; gi += s.cols) groups.push(s.steps.slice(gi, gi + s.cols));
      } else {
        groups = [s.steps];
      }
      groups.forEach(function (g, gIdx) {
        if (gIdx > 0) inner.appendChild(el('div', 'flow-down', '⬇'));
        var row = el('div', 'flow-row');
        g.forEach(function (st, i) {
          if (i > 0) row.appendChild(el('span', 'flow-arr', '➜'));
          var chip = el('div', 'flow-chip' + (st[2] ? ' gold' : ''),
            '<span class="ico">' + st[0] + '</span><span class="lb">' + st[1] + '</span>');
          row.appendChild(chip);
        });
        inner.appendChild(row);
      });
    } else if (s.type === 'points') {
      inner.appendChild(el('h2', 'flow-title', s.title));
      var pg = el('div', 'points-grid');
      s.items.forEach(function (p) {
        pg.appendChild(el('div', 'point-card',
          '<div class="ico">' + p[0] + '</div><h3>' + p[1] + '</h3><p>' + p[2] + '</p>'));
      });
      inner.appendChild(pg);
    } else if (s.type === 'verse') {
      var vs = el('div', 'verse-slide');
      vs.appendChild(el('span', 'label', '📖 암송해요'));
      vs.appendChild(el('blockquote', null, s.quote));
      vs.appendChild(el('cite', null, '— ' + s.cite));
      inner.appendChild(vs);
    }
    return sec;
  }

  var slides = DECK.map(function (s) {
    var node = buildSlide(s);
    stage.appendChild(node);
    return node;
  });

  var current = -1;
  var pageJump = document.getElementById('page-jump');

  // 현재 슬라이드가 속한 단원 찾기 (해당 단원 교재 링크용)
  function chapterAt(i) {
    var found = null;
    for (var c = 0; c < chapterStarts.length; c++) {
      if (chapterStarts[c].index <= i) found = chapterStarts[c];
    }
    return found;
  }

  function goTo(i, backwards) {
    if (i < 0) i = 0;
    if (i >= slides.length) i = slides.length - 1;
    if (i === current) return;
    if (current >= 0) slides[current].classList.remove('active', 'back');
    var dirBack = backwards !== undefined ? backwards : i < current;
    current = i;
    slides[i].classList.add('active');
    if (dirBack) slides[i].classList.add('back');
    bar.style.background = THEME_COLOR[DECK[i].theme] || '#4f86e8';
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    counter.textContent = (i + 1) + ' / ' + slides.length;
    if (location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));

    // 단원 교재 바로가기 버튼 갱신
    var ch = chapterAt(i);
    if (pageJump) {
      if (ch && ch.page) {
        pageJump.href = ch.page;
        pageJump.textContent = '📖 「' + ch.short + '」 교재로';
        pageJump.style.setProperty('--accent', THEME_COLOR[ch.theme]);
        pageJump.classList.add('show');
      } else {
        pageJump.classList.remove('show');
      }
    }
  }

  function next() { goTo(current + 1, false); }
  function prev() { goTo(current - 1, true); }

  document.getElementById('btn-next').addEventListener('click', next);
  document.getElementById('btn-prev').addEventListener('click', prev);

  // ----- 전체 장표 오버뷰 -----
  var overview = document.getElementById('overview');
  var ovStrip = document.getElementById('ov-strip');
  var ovBuilt = false;

  function buildOverview() {
    if (ovBuilt) return;
    ovBuilt = true;
    DECK.forEach(function (s, i) {
      var th = el('button', 'ov-thumb');
      th.type = 'button';
      var box = el('div', 'ov-scale');
      var clone = slides[i].cloneNode(true);
      clone.classList.add('active');
      clone.classList.remove('back');
      box.appendChild(clone);
      th.appendChild(box);
      th.appendChild(el('span', 'ov-num', i + 1));
      th.addEventListener('click', function () { closeOverview(); goTo(i); });
      ovStrip.appendChild(th);
    });
  }

  function openOverview() {
    buildOverview();
    overview.classList.add('open');
    overview.setAttribute('aria-hidden', 'false');
    var thumbs = ovStrip.children;
    for (var t = 0; t < thumbs.length; t++) thumbs[t].classList.toggle('now', t === current);
    if (thumbs[current]) thumbs[current].scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  function closeOverview() {
    overview.classList.remove('open');
    overview.setAttribute('aria-hidden', 'true');
  }

  document.getElementById('btn-overview').addEventListener('click', openOverview);
  document.getElementById('ov-close').addEventListener('click', closeOverview);
  overview.addEventListener('click', function (e) { if (e.target === overview) closeOverview(); });

  document.addEventListener('keydown', function (e) {
    if (overview.classList.contains('open')) {
      if (e.key === 'Escape') { e.preventDefault(); closeOverview(); }
      return; // 오버뷰가 열려 있으면 좌우 키는 썸네일 스크롤에 양보
    }
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(slides.length - 1); }
    else if (e.key === 'Escape') { e.preventDefault(); openOverview(); }
  });

  // 터치 스와이프 (오버뷰가 열려 있을 땐 스트립 스크롤에 양보)
  var touchX = null;
  document.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    if (overview.classList.contains('open')) { touchX = null; return; }
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) { dx < 0 ? next() : prev(); }
    touchX = null;
  }, { passive: true });

  // 해시로 시작 위치 복원 — #슬라이드번호 또는 #part단원번호
  var hash = (location.hash || '').slice(1);
  var startIndex = 0;
  var partMatch = hash.match(/^part(\d+)$/);
  if (partMatch) {
    chapterStarts.forEach(function (c) { if (c.part === parseInt(partMatch[1], 10)) startIndex = c.index; });
  } else {
    var n = parseInt(hash, 10);
    if (!isNaN(n)) startIndex = n - 1;
  }
  goTo(startIndex, false);
  if (hash === 'overview') openOverview();
})();
