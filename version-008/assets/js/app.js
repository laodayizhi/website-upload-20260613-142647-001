(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function setActive(nextIndex) {
      activeIndex = nextIndex;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === activeIndex);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          setActive((activeIndex + 1) % slides.length);
        }, 5200);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        setActive(index);
        schedule();
      });
    });

    setActive(0);
    schedule();
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';

        if (!query) {
          event.preventDefault();
        }
      });
    });
  }

  function setupFilterLists() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));

    lists.forEach(function (list) {
      var box = list.parentElement.querySelector('[data-filter-box]');

      if (!box) {
        return;
      }

      var input = box.querySelector('.js-filter-input');
      var yearSelect = box.querySelector('.js-filter-year');
      var typeSelect = box.querySelector('.js-filter-type');
      var count = box.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get('q');

      if (queryFromUrl && input) {
        input.value = queryFromUrl;
      }

      function applyFilters() {
        var keyword = normalize(input && input.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute('data-search'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
          var matchesYear = !year || cardYear === year;
          var matchesType = !type || cardType === type;
          var shouldShow = matchesKeyword && matchesYear && matchesType;

          card.classList.toggle('hidden-by-filter', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部影片 / 共 ' + cards.length + ' 部';
        }
      }

      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    });
  }

  function setupRankingSearch() {
    var input = document.querySelector('.js-ranking-search');
    var list = document.querySelector('[data-ranking-list]');

    if (!input || !list) {
      return;
    }

    var rows = Array.prototype.slice.call(list.querySelectorAll('.ranking-row'));

    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      rows.forEach(function (row) {
        var text = normalize(row.getAttribute('data-search') + ' ' + row.textContent);
        row.classList.toggle('hidden-by-filter', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearchForms();
    setupFilterLists();
    setupRankingSearch();
  });
})();
