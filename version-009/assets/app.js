(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('form.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (!value) {
                return;
            }
            event.preventDefault();
            window.location.href = 'movies.html?q=' + encodeURIComponent(value);
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }

        restart();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    var cardList = document.querySelector('[data-card-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (query && cardList) {
        var value = query.trim().toLowerCase();
        var shown = 0;
        document.querySelectorAll('.movie-card').forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.textContent
            ].join(' ').toLowerCase();
            var matched = haystack.indexOf(value) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                shown += 1;
            }
        });
        document.querySelectorAll('input[name="q"]').forEach(function (input) {
            input.value = query;
        });
        if (emptyState) {
            emptyState.classList.toggle('is-visible', shown === 0);
        }
    }
})();

function initMoviePlayer(url) {
    var video = document.getElementById('video-player');
    var mask = document.querySelector('[data-play-mask]');

    if (!video || !url) {
        return;
    }

    function bind() {
        if (video.__movieBound) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.__movieBound = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.__movieBound = true;
            video.__movieHls = hls;
            return;
        }
        video.src = url;
        video.__movieBound = true;
    }

    function play() {
        bind();
        if (mask) {
            mask.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    if (mask) {
        mask.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (mask) {
            mask.classList.add('is-hidden');
        }
    });
}
