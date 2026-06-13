(function () {
    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[character];
        });
    }

    function makeCard(item) {
        return [
            "<article class=\"movie-card card-hover\">",
            "<a class=\"movie-cover\" href=\"" + escapeHtml(item.url) + "\">",
            "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
            "<span class=\"play-float\">▶</span>",
            "<span class=\"cover-year\">" + escapeHtml(item.year) + "</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
            "<p class=\"movie-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + " · " + escapeHtml(item.year) + "</p>",
            "<p class=\"movie-one-line\">" + escapeHtml(item.oneLine) + "</p>",
            "<div class=\"tag-row\"><span>" + escapeHtml(item.categoryName) + "</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function initSearch() {
        var data = window.MOVIE_SEARCH_INDEX || [];
        var input = document.querySelector("[data-search-input]");
        var form = document.querySelector("[data-search-form]");
        var yearSelect = document.querySelector("[data-search-year]");
        var categorySelect = document.querySelector("[data-search-category]");
        var count = document.querySelector("[data-search-count]");
        var results = document.querySelector("[data-search-results]");
        if (!input || !results) {
            return;
        }

        input.value = getQuery();

        function render() {
            var keyword = input.value.trim().toLowerCase();
            var year = yearSelect ? yearSelect.value : "";
            var category = categorySelect ? categorySelect.value : "";
            var matched = data.filter(function (item) {
                var ok = true;
                if (keyword && item.searchText.toLowerCase().indexOf(keyword) === -1) {
                    ok = false;
                }
                if (year && String(item.year) !== year) {
                    ok = false;
                }
                if (category && item.categorySlug !== category) {
                    ok = false;
                }
                return ok;
            }).slice(0, 120);

            results.innerHTML = matched.map(makeCard).join("");
            if (count) {
                count.textContent = "当前显示 " + matched.length + " 条，片库索引共 " + data.length + " 部";
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var url = new URL(window.location.href);
                url.searchParams.set("q", input.value.trim());
                window.history.replaceState(null, "", url.toString());
                render();
            });
        }
        [input, yearSelect, categorySelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", render);
            control.addEventListener("change", render);
        });
        render();
    }

    document.addEventListener("DOMContentLoaded", initSearch);
})();
