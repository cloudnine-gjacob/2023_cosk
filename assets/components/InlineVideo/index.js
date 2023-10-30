"use strict";
import "./styles.styl";
import AbstractComponent from "../AbstractComponent";
import templateStr from "./template.html";

export class InlineVideo extends AbstractComponent {
  static tag = "inline-video";

  static events = {
    READY: "READY",
    PLAYING: "PLAYING",
    PROGRESS: "PROGRESS",
    Video0: "Video0",
    Video25: "Video25",
    Video50: "Video50",
    Video75: "Video75",
    Video100: "Video100",
    PAUSED: "PAUSED",
    ENDED: "ENDED",
    PLAYER_TOGGLE_SOUND: "PLAYER_TOGGLE_SOUND",
    EXIT: "EXIT",
  };

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    
    this.durationEvent = 0;
    this.restart = true;
    this.props.endFunction = !this.props.endFunction ? "stop" : this.props.endFunction;
    this.props.videoId = !this.props.videoId ? this.getVideoURL("https:/cloudnine.de/test/video.mp4") : this.getVideoURL(this.props.videoId);
    this.props.width = !this.props.width ? 256 : this.props.width;
    this.props.height = !this.props.height ? 144 : this.props.height;
    this.props.overlayImage = !this.props.overlayImage ? null : window.assets[this.props.overlayImage].src;
    this.props.posterImage = !this.props.posterImage ? this.createDummyPoster() : window.assets[this.props.posterImage].src;
    this.props.autoPlay = !this.props.autoPlay ? 0 : this.props.autoPlay;
    this.props.controls = !this.props.controls ? false : this.props.controls;
    this.props.customControls = !this.props.customControls ? false : this.props.customControls;
    this.props.soundButton = !this.props.soundButton ? true : this.props.soundButton;
    this.props.soundOver = !this.props.soundOver ? false : this.props.soundOver;
    this.props.progressBar = !this.props.progressBar ? true : this.props.progressBar;

    this.classList.add("inline-video");

    const parser = new DOMParser();
    const html = parser.parseFromString(templateStr, "text/html");
    const template = html.querySelector("template");
    this.templateContent = template.content;

    this.style["width"] = this.props.width + "px";
    this.style["height"] = this.props.height + "px";
    this.classList.add("video-player-container");

    this.setupControls();
    this.addSpinner();
    this.addOverlay();
    this.render();

    document.addEventListener("EXIT", this.onExit.bind(this));
    document.addEventListener("CLOSE", this.onExit.bind(this));
  }

  getVideoURL(_videoID) {
    return typeof Enabler != "undefined" ? Enabler.getUrl(_videoID) : _videoID;
  }

  createDummyPoster() {
    const canvas = document.createElement("canvas");

    canvas.width = this.props.width;
    canvas.height = this.props.height;

    const dummy = canvas.toDataURL();
    return dummy;
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
    console.log("VideoPlayer.setupCustomControls");

    if (this.props.controls) {
      // this.setAttribute('data-pointerevents', false);
      this.setAttribute("data-controls", this.props.controls ? "STANDARD" : "NONE");
    }

    if (this.props.soundOverButton) {
      document.getElementById(this.soundOverButton).addEventListener(
        "mouseenter",
        function () {
          if (this.getAttribute("data-sound") == "UNMUTE") this.Videop.unMute();
        }.bind(this),
        false
      );

      document.getElementById(this.soundOverButton).addEventListener(
        "mouseleave",
        function () {
          this.Videop.mute();
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

  render() {
    if (this.playerCreated) return false;
    this.setAttribute("data-status", "LOADING");

    this.playerCreated = true;

    this.videoEl = this.templateContent.querySelector("video");
    this.videoEl.style.width = this.props.width + "px";
    this.videoEl.style.height = this.props.height + "px";
    if (this.props.controls && !this.customControls) this.videoEl.setAttribute("controls", "controls");
    if (this.props.autoPlay || this.playWhenReady) this.videoEl.setAttribute("autoplay", "autoplay");
    if (this.props.posterImage) this.videoEl.poster = this.props.posterImage;
    this.videoEl.src = this.props.videoId;
    this.videoEl.load();

    this.appendChild(this.templateContent);

    this.videoEl.addEventListener("timeupdate", this.handleVideoTime.bind(this));
    this.videoEl.addEventListener("pause", this.onPause.bind(this));
    this.videoEl.addEventListener("play", this.onPlay.bind(this));
    this.videoEl.addEventListener("ended", this.onEnd.bind(this));
    this.videoEl.addEventListener("canplaythrough", this.onPlayerReady.bind(this));
  }

  onPlayerReady(e) {
    this.playerReady = true;

    if (this.props.autoPlay === 1) {
      this.mute();
      this.play();
    } else if (this.playWhenReady) {
      this.play();
    }

    // doubleclick specific code
    if (typeof Enabler !== "undefined") {
      Enabler.loadModule(
        studio.module.ModuleId.VIDEO,
        function () {
          studio.video.Reporter.attach(this.id, this.videoEl);
        }.bind(this)
      );
    }

    // this.videoEl.style.opacity = 1;
    this.dispatchEvent(new Event("READY"));
  }

  play() {
    if (this.playerReady) {
      this.setAttribute("data-status", "PLAYING");
      this.videoEl.play();
    } else {
      this.playWhenReady = true;
      this.create();
    }
  }

  pause() {
    if (this.playerReady) {
      this.setAttribute("data-status", "PAUSED");
      this.videoEl.pause();
    } else {
      this.playWhenReady = false;
      this.create();
    }
  }

  stop() {
    this.videoEl.pause();
    setTimeout(() => this.setAttribute("data-status", "ENDED"), 10);
    clearInterval(this.progressTimer);
    this.spinnerType = 0;
    this.durationEvent = 0;
    this.videoEl.currentTime = 0;
  }

  mute() {
    this.setAttribute("data-sound", "MUTE");
    this.videoEl.muted = true;
  }

  unmute() {
    this.setAttribute("data-sound", "UNMUTE");
    if (this.props.autoPlay === 1 && this.restart) {
      this.restart = false;
      this.seekTo(0);
    }
    this.videoEl.muted = false;
  }

  seekTo(time) {
    this.videoEl.currentTime = time;
  }

  cueNewVideo(_videoId) {
    console.log("Video.cueVideo");
    this.videoId = _videoId;
    this.videoEl.cueVideoById(this.videoId);

    if (typeof Enabler !== "undefined") {
      studio.video.Reporter.detach(this.id);
      studio.video.Reporter.attach(this.id, this.videoEl);
    }

    this.playVideo();
  }

  /*
   * EVENTHANDLER INERACTIVE ELEMENTS
   * @param {Event} event usually mouseevent
   * return void
   *
   */

  onSoundBtnClick = function (event) {
    event.stopPropagation();

    if (this.getAttribute("data-sound") == "MUTE") {
      this.unmute();
    } else {
      this.mute();
    }
  };

  onPlayPauseClick(event) {
    event.stopPropagation();

    if (this.getAttribute("data-status") == "PLAYING") {
      this.pause();
    } else {
      this.play();
    }
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

  onPause() {
    console.log("Video.PAUSED");

    this.setAttribute("data-status", "PAUSED");

    this.dispatchEvent(new Event("PAUSED"));
  }

  onPlay() {
    console.log("Video.PLAY");

    this.setAttribute("data-status", "PLAYING");
    this.dispatchEvent(new Event("PLAYING"));
  }

  onEnd() {
    this.setAttribute("data-status", "ENDED");
    this.dispatchEvent(new Event("ENDED"));
  }

  handleVideoTime() {
    this.classList.add("started");

    var currentPercent = this.videoEl.currentTime / this.videoEl.duration;

    if (this.progressBar) {
      this.progressBar.style["width"] = currentPercent * 100 + "%";
    }

    if (currentPercent > 0 && this.durationEvent == 0) {
      console.log("0%");
      this.durationEvent++;
    } else if (currentPercent >= 0.25 && this.durationEvent == 1) {
      console.log("25%");
      this.durationEvent++;
    } else if (currentPercent >= 0.5 && this.durationEvent == 2) {
      console.log("50%");
      this.durationEvent++;
    } else if (currentPercent >= 0.75 && this.durationEvent == 3) {
      console.log("75%");
      this.durationEvent++;
    }

    this.dispatchEvent(new CustomEvent("PROGRESS", { detail: { currentTime: this.videoEl.currentTime, duration: this.videoEl.duration } }));
  }

  onExit() {
    if (this.playerReady) this.stop();
  }
}
