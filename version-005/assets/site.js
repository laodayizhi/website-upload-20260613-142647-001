
(function () {
    var header = document.querySelector(".site-header");
    var menuButton = document.querySelector(".menu-button");

    if (header && menuButton) {
        menuButton.addEventListener("click", function () {
            var open = header.classList.toggle("nav-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var hero = document.querySelector(".hero-carousel");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === current);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    var filterInput = document.querySelector("[data-filter-input]");

    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));

        filterInput.addEventListener("input", function () {
            var keyword = filterInput.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();

                card.style.display = haystack.indexOf(keyword) >= 0 ? "" : "none";
            });
        });
    }

    var tabButtons = Array.prototype.slice.call(document.querySelectorAll("[data-tab-target]"));

    tabButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var target = button.getAttribute("data-tab-target");

            tabButtons.forEach(function (item) {
                item.classList.toggle("active", item === button);
            });

            Array.prototype.slice.call(document.querySelectorAll("[data-tab-panel]")).forEach(function (panel) {
                panel.classList.toggle("active", panel.getAttribute("data-tab-panel") === target);
            });
        });
    });

    var searchMount = document.getElementById("searchResults");

    if (searchMount && window.SITE_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim().toLowerCase();
        var title = document.getElementById("searchTitle");

        if (title && query) {
            title.textContent = "搜索：" + query;
        }

        function resultCard(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");

            return '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '" data-tags="' + escapeHtml(movie.tags.join(" ")) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '">' +
                '<span class="poster-wrap"><img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="score-badge">' + movie.score + '</span><span class="play-badge">▶</span></span>' +
                '<span class="card-body"><strong>' + escapeHtml(movie.title) + '</strong><small>' + escapeHtml(movie.year + " · " + movie.region + " · " + movie.type) + '</small><span class="summary-line">' + escapeHtml(movie.summary) + '</span><span class="card-tags">' + tags + '</span></span>' +
                '</a>';
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        if (!query) {
            searchMount.innerHTML = '<div class="empty-state"><h2>输入关键词开始搜索</h2><p>支持片名、地区、年份、类型和标签匹配。</p></div>';
            return;
        }

        var results = window.SITE_MOVIES.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.summary,
                movie.tags.join(" ")
            ].join(" ").toLowerCase();

            return haystack.indexOf(query) >= 0;
        });

        if (!results.length) {
            searchMount.innerHTML = '<div class="empty-state"><h2>未找到相关内容</h2><p>可以尝试更换片名、地区、类型或标签。</p></div>';
            return;
        }

        searchMount.innerHTML = '<div class="grid cols-4">' + results.map(resultCard).join("") + '</div>';
    }
})();
