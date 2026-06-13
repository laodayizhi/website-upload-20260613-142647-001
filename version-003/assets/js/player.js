(function () {
  function setHidden(element, hidden) {
    if (!element) {
      return;
    }

    element.classList.toggle("hidden", hidden);
  }

  function startPlayback(mediaUrl) {
    var video = document.getElementById("movie-video");
    var cover = document.querySelector(".player-cover");
    var button = document.querySelector(".player-button");

    if (!video || !mediaUrl) {
      return;
    }

    function play() {
      if (video.getAttribute("data-ready") !== "true") {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(mediaUrl);
          hls.attachMedia(video);
          video.hlsController = hls;
        } else {
          video.src = mediaUrl;
        }

        video.setAttribute("data-ready", "true");
      }

      setHidden(cover, true);
      video.controls = true;

      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (cover) {
      cover.addEventListener("click", function () {
        play();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  window.MoviePlayer = {
    start: startPlayback
  };
})();