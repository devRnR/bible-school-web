// 어린이 성경학교 교보재 — 공통 스크립트

// 1) 스크롤 등장 애니메이션
// 콘텐츠는 기본으로 보이는 상태. 첫 화면에 이미 보이는 요소는 즉시 visible 처리한 뒤,
// html에 js-reveal 클래스를 붙여 화면 밖 요소만 숨기고 스크롤 시 등장시킨다.
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (!items.length) return;

  var vh = window.innerHeight || document.documentElement.clientHeight;
  items.forEach(function (el) {
    if (el.getBoundingClientRect().top < vh) el.classList.add('visible');
  });

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  document.documentElement.classList.add('js-reveal');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(function (el) {
    if (!el.classList.contains('visible')) io.observe(el);
  });

  // 안전망: 어떤 이유로든 6초 안에 안 나타난 요소는 강제로 보여 준다
  setTimeout(function () {
    items.forEach(function (el) { el.classList.add('visible'); });
  }, 6000);
})();

// 2) 골든벨 퀴즈 — 정답 보기/숨기기
document.addEventListener('click', function (e) {
  var btn = e.target.closest('.quiz-toggle');
  if (!btn) return;
  var answer = btn.parentElement.querySelector('.quiz-a');
  if (!answer) return;
  var shown = answer.classList.toggle('show');
  btn.textContent = shown ? '정답 숨기기 🙈' : '정답 보기 🔔';
});
