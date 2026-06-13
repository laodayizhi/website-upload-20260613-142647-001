import { H as Hls } from "./video-vendor-dru42stk.js";

function setMessage(text) {
    var message = document.querySelector("[data-player-message]");
    if (message) {
        message.textContent = text;
    }
}

function initHlsPlayer() {
    var video = document.querySelector("[data-hls-player]");
    var shell = document.querySelector("[data-player-shell]");
    var playButton = document.querySelector("[data-play-button]");
    if (!video) {
        return;
    }

    var source = video.getAttribute("data-src");
    if (!source) {
        setMessage("当前页面没有配置播放源。");
        return;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setMessage("播放源已就绪，点击播放按钮即可观看。");
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
                setMessage("网络波动，正在重新载入播放源。");
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
                setMessage("媒体解码波动，正在自动恢复。");
            } else {
                hls.destroy();
                setMessage("播放器初始化失败，可尝试备用播放源。");
            }
        });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setMessage("浏览器支持原生 HLS，点击播放按钮即可观看。");
    } else {
        video.src = source;
        setMessage("当前浏览器可能不支持 HLS，可尝试备用播放源。");
    }

    if (playButton) {
        playButton.addEventListener("click", function () {
            if (shell) {
                shell.classList.add("is-playing");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    setMessage("浏览器阻止了自动播放，请再次点击视频控制条播放。");
                });
            }
        });
    }

    video.addEventListener("play", function () {
        if (shell) {
            shell.classList.add("is-playing");
        }
    });

    video.addEventListener("pause", function () {
        if (shell && video.currentTime === 0) {
            shell.classList.remove("is-playing");
        }
    });
}

document.addEventListener("DOMContentLoaded", initHlsPlayer);
