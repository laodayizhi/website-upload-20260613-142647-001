(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function initPageFilters() {
        var panel = document.querySelector("[data-page-filter]");
        var list = document.querySelector("[data-card-list]");
        if (!panel || !list) {
            return;
        }
        var keywordInput = panel.querySelector("[data-filter-keyword]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var categorySelect = panel.querySelector("[data-filter-category]");
        var countText = panel.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function apply() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var category = categorySelect ? categorySelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardCategory = card.getAttribute("data-category") || "";
                var matched = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (category && cardCategory !== category) {
                    matched = false;
                }
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (countText) {
                countText.textContent = "当前显示 " + visible + " / " + cards.length + " 部";
            }
        }

        [keywordInput, yearSelect, categorySelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });
        apply();
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initPageFilters();
    });
})();
