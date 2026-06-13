(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var heroIndex = 0;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === heroIndex);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === heroIndex);
    });
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showHeroSlide(index);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5600);
  }

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get("q") || "";
  var searchInputs = document.querySelectorAll('input[name="q"], .filter-input');

  searchInputs.forEach(function (input) {
    if (queryValue && input.name === "q") {
      input.value = queryValue;
    }
  });

  var searchableGrids = Array.prototype.slice.call(document.querySelectorAll("[data-search-grid]"));

  function filterCards(value) {
    var normalized = (value || "").trim().toLowerCase();
    var anyVisible = false;

    searchableGrids.forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var matched = !normalized || haystack.indexOf(normalized) !== -1;
        card.style.display = matched ? "" : "none";

        if (matched) {
          anyVisible = true;
        }
      });
    });

    var empty = document.querySelector(".empty-state");
    if (empty) {
      empty.classList.toggle("show", !anyVisible);
    }
  }

  if (document.body.classList.contains("search-page")) {
    filterCards(queryValue);
  }

  var liveFilter = document.querySelector(".filter-input");
  if (liveFilter) {
    liveFilter.addEventListener("input", function () {
      filterCards(liveFilter.value);
    });
  }

  var sortButtons = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));

  function sortGrid(mode) {
    searchableGrids.forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      cards.sort(function (a, b) {
        if (mode === "views") {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }

        if (mode === "likes") {
          return Number(b.dataset.likes || 0) - Number(a.dataset.likes || 0);
        }

        if (mode === "year") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }

        return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  sortButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var mode = button.getAttribute("data-sort");

      sortButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });

      sortGrid(mode);
    });
  });
})();