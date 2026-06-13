(function () {
  'use strict';

  var HLS_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
  var hlsScriptPromise = null;

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsScriptPromise) {
      return hlsScriptPromise;
    }

    hlsScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = HLS_SCRIPT_URL;
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('HLS library loaded without exposing window.Hls'));
        }
      };
      script.onerror = function () {
        reject(new Error('Unable to load HLS library'));
      };
      document.head.appendChild(script);
    });

    return hlsScriptPromise;
  }

  function setStatus(container, message) {
    var status = container.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  function markStarted(container) {
    var overlay = container.querySelector('[data-play-button]');
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function attachNativeHls(video, source) {
    video.src = source;
    return video.play();
  }

  function attachHlsJs(container, video, source) {
    return loadHlsScript().then(function (Hls) {
      if (!Hls.isSupported()) {
        throw new Error('HLS is not supported in this browser');
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      container._hlsInstance = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus(container, '播放源已加载，正在开始播放。');
        video.play().catch(function () {
          setStatus(container, '浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      });

      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus(container, '网络加载异常，正在尝试恢复播放。');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus(container, '媒体解码异常，正在尝试恢复。');
          hls.recoverMediaError();
        } else {
          setStatus(container, '播放失败，请刷新页面或更换浏览器。');
          hls.destroy();
        }
      });
    });
  }

  function initializePlayer(container) {
    var video = container.querySelector('video');
    var button = container.querySelector('[data-play-button]');
    var source = container.getAttribute('data-src');

    if (!video || !button || !source) {
      return;
    }

    function startPlayback() {
      markStarted(container);
      setStatus(container, '正在加载 m3u8 播放源...');

      if (container._initialized) {
        video.play();
        return;
      }

      container._initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachNativeHls(video, source).then(function () {
          setStatus(container, '正在播放。');
        }).catch(function () {
          setStatus(container, '请再次点击播放器开始播放。');
        });
        return;
      }

      attachHlsJs(container, video, source).catch(function () {
        setStatus(container, '当前浏览器无法加载 HLS 播放器，请检查网络或更换浏览器。');
      });
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      markStarted(container);
      setStatus(container, '正在播放。');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        setStatus(container, '已暂停。');
      }
    });
    video.addEventListener('ended', function () {
      setStatus(container, '播放结束。');
    });
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(initializePlayer);
  });
})();
