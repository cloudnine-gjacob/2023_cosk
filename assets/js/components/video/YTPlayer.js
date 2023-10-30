import { Signal } from "signals";
import "./video-player.scss";
import "./customControls.scss";
import { dummyTrack, track } from "../../utils/videoTracking";
import isMobile from "../../utils/isMobile";
import iOSVersion from "../../utils/iOSVersion";
import { addYoutubeAPI, youtubeAPIAdded, onYoutubeAPIReady } from "./addYoutubeAPI";
const videoStartIcon = require("./VideoStartIcon.svg");

/**
 * @class YTPlayer
 * @classdesc Youtube-player for dcs and iab compatible Ads
 *
 */

export default class YTPlayer {
  /**
   * @param {String} container - Container ID.
   * @param {String} videoID - Youtube ID
   *
   * @param {Object} options - Options
   * @param {int} options.width [300]                 - Width of container
   * @param {int} options.height [250]                - Player height
   * @param {Boolean} options.controls [false]        - turn native controls on/off
   * @param {Boolean} options.customControls [false]  - turn on/off customControls
   * @param {Boolean} options.autoplay [false]        - turn on/off autoplay
   * @param {Boolean} options.sound [false]           - mute player on start
   * @param {Boolean} options.soundOver [null]        - id to soundover button
   * @param {Number} options.preStop [.5]             - how many seconds before video end should the player stop
   * @param {String} options.overlay [null]           - overlay image
   * @param {String} options.videoStartIcon           - overlay videoStartIcon
   * @param {Boolean} options.immediateCreate [false] - should the player create imemdiatly on initialization
   *
   */

  constructor(container, videoID, options = {}) {
    this.options = {
      videoID: videoID,
      width: 300,
      height: 250,
      controls: false,
      customControls: false,
      autoplay: false,
      sound: false,
      soundOver: null,
      soundButton: true,
      preStop: 0.5,
      overlay: null,
      videoStartIcon: videoStartIcon,
      immediateCreate: isMobile,
      progressBar: true,
      ...options,
    };

    this.durationEvent = 0;

    this.container = document.querySelector(container);
    this.container.style["width"] = this.options.width + "px";
    this.container.style["height"] = this.options.height + "px";
    this.container.classList.add("video-player-container");

    this.addSpinner();
    this.addOverlay();

    if (isMobile) {
      this.container.classList.add("is-mobile");
      this.container.setAttribute("data-pointerevents", false);
    }

    if (this.options.customControls) this.options.controls = false;
    if (this.options.immediateCreate || this.options.autoplay) this.createPlayer();
    if (this.options.autoplay) this.play();

    document.addEventListener("EXIT", this.onExit.bind(this));
    document.addEventListener("CLOSE", this.onExit.bind(this));
  }

  signals = {
    PLAYER_READY: new Signal(),
    PLAYER_PLAYING: new Signal(),
    PLAYER_PROGRESS: new Signal(),
    YT0: new Signal(),
    YT25: new Signal(),
    YT50: new Signal(),
    YT75: new Signal(),
    YT100: new Signal(),
    PLAYER_PAUSED: new Signal(),
    PLAYER_ENDED: new Signal(),
    PLAYER_TOGGLE_SOUND: new Signal(),
    YT_API_READY: new Signal(),
    EXIT: new Signal(),
  };

  addSpinner() {
    this.spinnerType = 0;

    this.spinner = document.createElement("div");
    this.spinner.classList.add("video-player__spinner");

    let spinnerContainer = document.createElement("div");
    this.spinner.appendChild(spinnerContainer);

    for (let i = 0; i < 3; i++) {
      let circle = document.createElement("div");
      circle.classList.add("circle" + (i + 1));
      spinnerContainer.appendChild(circle);
    }

    this.container.appendChild(this.spinner);
  }

  addOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.classList.add("video-player__overlay");

    if (typeof this.options.overlay === "string") {
      this.overlay.style["background-image"] = `url('${this.options.overlay}')`;
      this.overlay.style["background-size"] = `cover`;
    }

    if (this.options.overlay) this.overlay.innerHTML = this.options.videoStartIcon;
    this.container.appendChild(this.overlay);

    this.overlay.addEventListener("click", this.onOverlayClick.bind(this), false);
  }

  create() {
    this.container.setAttribute("data-status", "LOADING");
    this.createPlayer();
  }

  createPlayer() {
    if (!youtubeAPIAdded) {
      console.log("YTPlayer.loadAPI");

      addYoutubeAPI();
      onYoutubeAPIReady.add(this.createPlayer.bind(this));
      return false;
    }

    if (typeof YT !== "undefined" && !this.created) {
      this.created = true;
      this.player = document.createElement("div");
      this.player.classList.add("video-player");
      this.container.appendChild(this.player);

      if (!this.options.controls && !isMobile) {
        this.player.style["height"] = "401%";
        this.player.style["top"] = "-150.5%";
      }

      this.ytp = new YT.Player(this.player, {
        width: this.options.width,
        height: this.options.height,
        videoId: this.options.videoID,
        playerVars: {
          autoplay: +this.options.autoplay,
          rel: 0,
          showinfo: 0,
          controls: +this.options.controls,
          fs: 0,
          html5: 1,
        },
        events: {
          onReady: this.onPlayerReady.bind(this),
          onStateChange: this.handleVideoStateChange.bind(this),
          onError: this.onPlayerError.bind(this),
        },
      });
    }

    if (this.spinner) this.container.appendChild(this.spinner);
    if (this.overlay) this.container.appendChild(this.overlay);
    if (this.customControls) this.container.appendChild(this.customControls);
  }

  onPlayerError(e) {
    console.log("YTPlayer.onError: " + this.el.id);
    console.log(e);
  }

  onPlayerReady() {
    console.log("YTPlayer.playerReady");

    this.playerReady = true;
    this.signals.PLAYER_READY.dispatch();

    this.setupControls();
    this.options.sound || isMobile ? this.unmute() : this.mute();

    if (this.playWhenReady && !isMobile) {
      this.play();
    } else if (this.playWhenReady && isMobile) {
      this.spinnerType = 1;
      this.container.setAttribute("data-status", "WAITING");
    }
  }

  setupControls() {
    console.log("YTPlayer.setupCustomControls");

    if (this.options.controls) this.container.setAttribute("data-controls", this.options.controls ? "STANDARD" : "NONE");

    if (this.options.soundOverButton) {
      document.getElementById(this.options.soundOverButton).addEventListener(
        "mouseenter",
        function () {
          if (this.container.getAttribute("data-sound") == "UNMUTE") this.ytp.unMute();
        }.bind(this),
        false
      );

      document.getElementById(this.options.soundOverButton).addEventListener(
        "mouseleave",
        function () {
          this.ytp.mute();
        }.bind(this),
        false
      );
    }

    if (this.options.customControls) {
      this.container.setAttribute("data-controls", "CUSTOM");

      this.customControls = document.createElement("div");
      this.customControls.classList.add("video-player__controls");
      this.container.appendChild(this.customControls);

      this.playPauseBtn = document.createElement("div");
      this.playPauseBtn.classList.add("video-player__controls__play-pause-btn");
      this.customControls.appendChild(this.playPauseBtn);
      this.playPauseBtn.addEventListener("click", this.onPlayPauseClick.bind(this), false);

      if (this.options.soundButton) {
        this.soundBtn = document.createElement("div");
        this.soundBtn.classList.add("video-player__controls__sound-btn");
        this.customControls.appendChild(this.soundBtn);
        this.soundBtn.addEventListener("click", this.onSoundBtnClick.bind(this), false);
      }

      if (this.options.progressBar) {
        this.progressBar = document.createElement("div");
        this.progressBar.classList.add("video-player__progress-bar");
        this.customControls.appendChild(this.progressBar);
      }
    }
  }

  play() {
    track("PLAY");

    if (this.playerReady) {
      this.ytp.playVideo();
    } else {
      this.playWhenReady = true;
      this.create();
    }
  }

  pause() {
    track("PAUSE");

    if (this.playerReady) {
      this.ytp.pauseVideo();
    } else {
      this.playWhenReady = false;
      this.create();
    }
  }

  stop() {
    this.container.setAttribute("data-status", "ENDED");
    clearInterval(this.progressTimer);
    this.spinnerType = 0;
    this.durationEvent = 0;
    if (this.ytp && typeof this.state !== "undefined") this.ytp.seekTo(this.ytp.getDuration(), true);
  }

  mute() {
    track("MUTE");

    this.container.setAttribute("data-sound", "MUTE");
    this.ytp.mute();
  }

  unmute() {
    track("UNMUTE");

    this.container.setAttribute("data-sound", "UNMUTE");
    this.ytp.unMute();
  }

  cueNewVideo(_videoID) {
    console.log("YTPlayer.cueVideo: " + _videoID);

    this.container.setAttribute("data-status", "LOADING");

    this.options.videoID = _videoID;
    if (this.created) this.ytp.cueVideoById(this.options.videoID);

    this.play();
  }

  handleVideoStateChange(stateChangeEvent) {
    this.state = stateChangeEvent.data;
    console.log(this.el.id);
    console.log(stateChangeEvent.data);

    switch (stateChangeEvent.data) {
      case YT.PlayerState.BUFFERING:
        console.log("YTPlayer.BUFFERING" + this.spinnerType);
        this.container.setAttribute("data-status", "BUFFERING" + this.spinnerType);

        stateChangeEvent.target.setPlaybackQuality("hd720");
        clearInterval(this.progressTimer);

        break;

      case YT.PlayerState.PLAYING:
        console.log("YTPlayer.PLAYING");
        this.container.setAttribute("data-status", "PLAYING");

        this.signals.PLAYER_PLAYING.dispatch();

        this.spinnerType = 1;

        this.progressTimer = setInterval(() => {
          this.handleVideoTime();
        }, 100);

        break;

      case YT.PlayerState.PAUSED:
        console.log("YTPlayer.PAUSED");
        this.container.setAttribute("data-status", "PAUSED");

        this.signals.PLAYER_PAUSED.dispatch();
        clearInterval(this.progressTimer);

        break;

      //Controled by video time
      case YT.PlayerState.ENDED:
        console.log("YTPlayer.ENDED");
        this.container.setAttribute("data-status", "ENDED");

        this.signals.PLAYER_ENDED.dispatch();
        clearInterval(this.progressTimer);

        break;
    }
  }

  handleVideoTime() {
    let currentTime = this.ytp.getCurrentTime();
    let duration = this.ytp.getDuration();
    let currentPercent = currentTime / duration;

    if (this.progressBar) {
      let progressBarPercent = currentTime / (duration - this.options.preStop);
      this.progressBar.style["width"] = progressBarPercent * 100 + "%";
    }

    if (currentPercent > 0 && this.durationEvent == 0) {
      this.signals.YT0.dispatch();
      track("YT0");
      this.durationEvent++;
    } else if (currentPercent >= 0.25 && this.durationEvent == 1) {
      this.signals.YT25.dispatch();
      track("YT25");
      this.durationEvent++;
    } else if (currentPercent >= 0.5 && this.durationEvent == 2) {
      this.signals.YT50.dispatch();
      track("YT50");
      this.durationEvent++;
    } else if (currentPercent >= 0.75 && this.durationEvent == 3) {
      this.signals.YT75.dispatch();
      track("YT75");
      this.durationEvent++;
    }

    if (currentTime > duration - this.options.preStop && duration > 1) {
      track("YT100");

      clearInterval(this.progressTimer);

      this.container.setAttribute("data-status", "ENDED");
      this.signals.YT100.dispatch();
      this.signals.PLAYER_ENDED.dispatch();

      this.stop();
    }

    this.signals.PLAYER_PROGRESS.dispatch({ currentTime: currentTime, duration: duration });
  }

  onOverlayClick(event) {
    event.stopPropagation();

    if (this.playerReady) {
      this.unmute();
    } else {
      this.options.sound = true;
    }

    this.play();
  }

  onPlayPauseClick(event) {
    event.stopPropagation();

    if (this.container.getAttribute("data-status") == "PLAYING") {
      this.pause();
    } else {
      this.play();
    }
  }

  onSoundBtnClick(event) {
    event.stopPropagation();

    if (this.container.getAttribute("data-sound") == "MUTE") {
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

  get el() {
    return this.container;
  }
}
