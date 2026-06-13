(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalizeText(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
                document.body.classList.toggle("menu-open", mobilePanel.classList.contains("is-open"));
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                if (timer || slides.length < 2) {
                    return;
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    stop();
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    stop();
                    show(index + 1);
                    start();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    stop();
                    show(dotIndex);
                    start();
                });
            });

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        var urlParams = new URLSearchParams(window.location.search);
        var queryFromUrl = urlParams.get("q") || "";
        var searchInput = document.querySelector("[data-search-input]");
        var categorySelect = document.querySelector("[data-category-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var localFilter = document.querySelector("[data-page-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-state]");

        if (searchInput && queryFromUrl) {
            searchInput.value = queryFromUrl;
        }

        function applyFilters() {
            var query = normalizeText(searchInput ? searchInput.value : localFilter ? localFilter.value : "");
            var selectedCategory = categorySelect ? categorySelect.value : "";
            var selectedYear = yearSelect ? yearSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalizeText(card.getAttribute("data-search"));
                var cardCategory = card.getAttribute("data-category") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesCategory = !selectedCategory || cardCategory === selectedCategory;
                var matchesYear = !selectedYear || cardYear === selectedYear;
                var showCard = matchesQuery && matchesCategory && matchesYear;
                card.style.display = showCard ? "" : "none";
                if (showCard) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [searchInput, categorySelect, yearSelect, localFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (cards.length && (searchInput || categorySelect || yearSelect || localFilter)) {
            applyFilters();
        }
    });
})();

function initPlayer(playUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector(".player-overlay");
    var playButton = document.querySelector(".play-button");
    var attached = false;
    var hls = null;

    if (!video || !playUrl) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(playUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = playUrl;
    }

    function start() {
        attach();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    if (playButton) {
        playButton.addEventListener("click", function (event) {
            event.stopPropagation();
            start();
        });
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
