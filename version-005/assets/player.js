
(function () {
    function setupPlayer(videoId, overlayId, sourceUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var attached = false;
        var hls = null;

        if (!video) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function start() {
            attach();

            if (overlay) {
                overlay.hidden = true;
            }

            var playResult = video.play();

            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.hidden = true;
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.setupPlayer = setupPlayer;
})();
