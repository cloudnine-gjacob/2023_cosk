"use strict";
import "./styles.styl";
import AbstractComponent from "../AbstractComponent";
import templateStr from "./template.html";

export class YTVideo extends AbstractComponent {
  static tag = "yt-video";
  static youtubeAPIAdded = false;

  static events = {
    READY: "READY",
    PLAYING: "PLAYING",
    PROGRESS: "PROGRESS",
    YT0: "YT0",
    YT25: "YT25",
    YT50: "YT50",
    YT75: "YT75",
    YT100: "YT100",
    PAUSED: "PAUSED",
    ENDED: "ENDED",
    PLAYER_TOGGLE_SOUND: "PLAYER_TOGGLE_SOUND",
    YT_API_READY: "YT_API_READY",
    EXIT: "EXIT",
  };

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.durationEvent = 0;
    this.props.endFunction = !this.props.endFunction ? "stop" : this.props.endFunction;
    this.props.videoId = !this.props.videoId ? "5IXQ6f6eMxQ" : this.props.videoId;
    this.props.videoWidth = !this.props.width ? 256 : this.props.width;
    this.props.videoHeight = !this.props.height ? 144 : this.props.height;
    this.props.preStop = !this.props.preStop ? 1 : this.props.preStop;
    this.props.overlayImage = !this.props.overlayImage ? null : window.assets[this.props.overlayImage].src;
    this.props.autoPlay = !this.props.autoPlay ? 0 : this.props.autoPlay;
    this.props.controls = !this.props.controls ? false : this.props.controls;
    this.props.customControls = !this.props.customControls ? false : this.props.customControls;
    this.props.soundButton = !this.props.soundButton ? true : this.props.soundButton;
    this.props.soundOver = !this.props.soundOver ? false : this.props.soundOver;
    this.props.progressBar = !this.props.progressBar ? true : this.props.progressBar;

    this.classList.add("yt-video");

    const parser = new DOMParser();
    const html = parser.parseFromString(templateStr, "text/html");
    const template = html.querySelector("template");
    this.templateContent = template.content;

    this.style["width"] = this.props.videoWidth + "px";
    this.style["height"] = this.props.videoHeight + "px";
    this.classList.add("video-player-container");

    this.setupControls();
    this.addSpinner();
    this.addOverlay();
    this.loadAPI();

    document.addEventListener("EXIT", this.onExit.bind(this));
    document.addEventListener("CLOSE", this.onExit.bind(this));
  }

  addSpinner() {
    this.spinnerType = 0;

    this.spinner = this.templateContent.querySelector(".video-player__spinner");
    let spinnerContainer = document.createElement("div");
    this.spinner.appendChild(spinnerContainer);

    for (let i = 0; i < 3; i++) {
      let circle = document.createElement("div");
      circle.classList.add("circle" + (i + 1));
      spinnerContainer.appendChild(circle);
    }
  }

  addOverlay() {
    this.overlay = this.templateContent.querySelector(".video-player__overlay");

    if (this.props.overlayImage) {
      this.overlay.style["background-image"] = `url('${this.props.overlayImage}')`;
      this.overlay.style["background-size"] = `cover`;
    }

    this.overlay.addEventListener("click", this.onOverlayClick.bind(this), false);
  }

  setupControls() {
    console.log("YTPlayer.setupCustomControls");

    if (this.props.controls) this.setAttribute("data-controls", this.props.controls ? "STANDARD" : "NONE");

    if (this.soundOverButton) {
      document.getElementById(this.soundOverButton).addEventListener(
        "mouseenter",
        function () {
          if (this.getAttribute("data-sound") == "UNMUTE") this.ytp.unMute();
        }.bind(this),
        false
      );

      document.getElementById(this.soundOverButton).addEventListener(
        "mouseleave",
        function () {
          this.ytp.mute();
        }.bind(this),
        false
      );
    }

    if (this.props.customControls) {
      this.setAttribute("data-controls", "CUSTOM");

      this.customControls = this.templateContent.querySelector(".video-player__controls");

      this.playPauseBtn = document.createElement("div");
      this.playPauseBtn.classList.add("video-player__controls__play-pause-btn");
      this.customControls.appendChild(this.playPauseBtn);
      this.playPauseBtn.addEventListener("click", this.onPlayPauseClick.bind(this), false);

      if (this.props.soundButton) {
        this.soundBtn = document.createElement("div");
        this.soundBtn.classList.add("video-player__controls__sound-btn");
        this.customControls.appendChild(this.soundBtn);
        this.soundBtn.addEventListener("click", this.onSoundBtnClick.bind(this), false);
      }

      if (this.props.progressBar) {
        this.progressBar = document.createElement("div");
        this.progressBar.classList.add("video-player__progress-bar");
        this.customControls.appendChild(this.progressBar);
      }
    }
  }

  loadAPI() {
    console.log("load api");

    if (!this.youtubeAPIAdded) {
      this.youtubeAPIAdded = true;
      let tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";

      let firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YTPlayer.onYouTubeIframeAPIReady");
        this.render();
      };
    } else {
      this.render();
    }
  }

  render() {
    this.player = this.templateContent.querySelector(".video-player");
    if (!this.props.controls) {
      this.player.style["height"] = "400%";
      this.player.style["top"] = "-150%";
    } else {
      this.player.style["height"] = "100%";
      this.player.style["top"] = "0";
      this.setAttribute("data-controls", this.props.controls ? "STANDARD" : "NONE");
    }

    this.ytp = new YT.Player(this.player, {
      width: this.props.videoWidth,
      height: this.props.videoHeight,
      videoId: this.props.videoId,
      playerVars: {
        autoplay: +this.props.autoPlay,
        rel: 0,
        showinfo: 0,
        controls: +this.props.controls,
        playsinline: 1,
        fs: 0,
        html5: 1,
      },
      events: {
        onReady: this.onPlayerReady.bind(this),
        onStateChange: this.handleVideoStateChange.bind(this),
        onError: this.onPlayerError.bind(this),
      },
    });

    this.appendChild(this.templateContent);
  }

  onPlayerReady(e) {
    if (this.props.autoPlay === 1) {
      this.mute();
      this.ytp.playVideo();
    } else if (this.playWhenReady) {
      this.play();
    }

    this.playerReady = true;
    this.dispatchEvent(new Event("READY"));
  }

  handleVideoStateChange(stateChangeEvent) {
    this.state = stateChangeEvent.data;

    switch (stateChangeEvent.data) {
      case YT.PlayerState.BUFFERING:
        console.log("YTPlayer.BUFFERING" + this.spinnerType);
        this.setAttribute("data-status", "BUFFERING" + this.spinnerType);

        stateChangeEvent.target.setPlaybackQuality("hd720");
        clearInterval(this.progressTimer);

        break;

      case YT.PlayerState.PLAYING:
        console.log("YTPlayer.PLAYING");
        // setTimeout(() =>{this.setAttribute('data-status', 'PLAYING')}, 100)
        this.setAttribute("data-status", "PLAYING");
        this.dispatchEvent(new Event("PLAYING"));

        this.spinnerType = 1;

        this.progressTimer = setInterval(() => {
          this.handleVideoTime();
        }, 100);

        break;

      case YT.PlayerState.PAUSED:
        console.log("YTPlayer.PAUSED");
        this.setAttribute("data-status", "PAUSED");
        this.dispatchEvent(new Event("PAUSED"));

        clearInterval(this.progressTimer);

        break;

      //Controled by video time
      case YT.PlayerState.ENDED:
        console.log("YTPlayer.ENDED");
        this.setAttribute("data-status", "ENDED");
        this.dispatchEvent(new Event("ENDED"));

        clearInterval(this.progressTimer);

        break;
    }
  }

  handleVideoTime() {
    let currentTime = this.ytp.getCurrentTime();
    let duration = this.ytp.getDuration();
    let currentPercent = currentTime / duration;

    if (this.progressBar) {
      let progressBarPercent = currentTime / (duration - this.props.preStop);
      this.progressBar.style["width"] = progressBarPercent * 100 + "%";
    }

    if (currentPercent > 0 && this.durationEvent == 0) {
      this.dispatchEvent(new Event("YT0"));
      this.track("YT0");
      this.durationEvent++;
    } else if (currentPercent >= 0.25 && this.durationEvent == 1) {
      this.dispatchEvent(new Event("YT25"));
      this.track("YT25");
      this.durationEvent++;
    } else if (currentPercent >= 0.5 && this.durationEvent == 2) {
      this.dispatchEvent(new Event("YT50"));
      this.track("YT50");
      this.durationEvent++;
    } else if (currentPercent >= 0.75 && this.durationEvent == 3) {
      this.dispatchEvent(new Event("YT75"));
      this.track("YT75");
      this.durationEvent++;
    }

    if (currentTime > duration - this.props.preStop && duration > 1) {
      this.track("YT100");
      clearInterval(this.progressTimer);

      if (this.props.endFunction === "stop") {
        this.setAttribute("data-status", "ENDED");
      }
      this.dispatchEvent(new Event("YT100"));
      this.dispatchEvent(new Event("PLAYER_ENDED"));
      console.log(this.props.endFunction);
      this[this.props.endFunction]();
    }

    this.dispatchEvent(new CustomEvent("PROGRESS", { detail: { currentTime: currentTime, duration: duration } }));
  }

  onOverlayClick(event) {
    event.stopPropagation();

    if (this.playerReady) {
      this.unmute();
    } else {
      this.sound = true;
    }

    this.play();
  }

  onPlayPauseClick(event) {
    event.stopPropagation();

    if (this.getAttribute("data-status") == "PLAYING") {
      this.pause();
    } else {
      this.play();
    }
  }

  onSoundBtnClick(event) {
    event.stopPropagation();

    if (this.getAttribute("data-sound") == "MUTE") {
      this.unmute();
    } else {
      this.mute();
    }
  }

  onExit() {
    if (this.playerReady) {
      this.stop();
    } else {
      this.playWhenReady = false;
    }
  }

  play() {
    this.track("PLAY");

    if (this.playerReady) {
      this.ytp.playVideo();
    } else {
      this.playWhenReady = true;
      this.create();
    }
  }

  pause() {
    this.track("PAUSE");

    if (this.playerReady) {
      this.ytp.pauseVideo();
    } else {
      this.playWhenReady = false;
      this.create();
    }
  }

  stop() {
    this.setAttribute("data-status", "ENDED");
    clearInterval(this.progressTimer);
    this.spinnerType = 0;
    this.durationEvent = 0;
    if (this.ytp && typeof this.state !== "undefined") this.ytp.seekTo(this.ytp.getDuration(), true);
  }

  mute() {
    this.track("MUTE");

    this.setAttribute("data-sound", "MUTE");
    this.ytp.mute();
  }

  unmute() {
    this.track("UNMUTE");

    this.setAttribute("data-sound", "UNMUTE");
    this.ytp.unMute();
  }

  cueNewVideo(_videoID) {
    console.log("YTPlayer.cueVideo: " + _videoID);

    this.setAttribute("data-status", "LOADING");

    this.props.videoId = _videoID;
    if (this.created) this.ytp.cueVideoById(this.props.videoId);

    this.play();
  }

  onPlayerError(e) {
    console.log("YTPlayer.onError: " + this.el.id);
    console.log(e);
  }

  dummyTrack() {
    try {
      Enabler.counter("YTVideo Mute");
      Enabler.counter("YTVideo Unmute");
      Enabler.counter("YTVideo Pause");
      Enabler.counter("YTVideo Click to Play");
      Enabler.counter("YTVideo Percent 0");
      Enabler.counter("YTVideo Percent 25");
      Enabler.counter("YTVideo Percent 50");
      Enabler.counter("YTVideo Percent 75");
      Enabler.counter("YTVideo Percent 100");
    } catch (e) {
      console.warn("DCS VideoTracking not available: " + e);
    }
  }

  track(eventKey) {
    try {
      Enabler.counter(eventMap[eventKey], true);
    } catch (e) {
      console.warn("DCS VideoTracking not available: " + e);
    }
  }
}
