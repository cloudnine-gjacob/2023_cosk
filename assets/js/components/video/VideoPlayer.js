import './video-player.scss';
import './customControls.scss';
import {Signal} from 'signals';
import isMobile from '../../utils/isMobile';
import iOSVersion from '../../utils/iOSVersion';

const videoStartIcon = require('./VideoStartIcon.svg');

/**
 * @class VideoPlayer
 * @classdesc Video-player for dcs and iab compatible Ads
 *
 */

export default class VideoPlayer {

    /*
     * @param {String} container                  - Container ID.
     * @param {String} videoID                    - path to mp4
     *
     * @param {Object} options                    - options Object
     * @param {int} options.width                 - Player width
     * @param {int} options.height                - Player height
     * @param {Boolean} options.controls          - turn native controls on/off
     * @param {Boolean} options.customControls    - turn on/off customControls
     * @param {Boolean} options.autoplay          - turn on/off autoplay
     * @param {Boolean} options.sound             - mute player on start
     * @param {Boolean} options.soundOver         - id to soundover button
     * @param {Number} options.preStop            - how many seconds before video end should the player stop
     * @param {String} options.overlay            - overlay image
     * @param {String} options.videoStartIcon     - overlay videoStartIcon
     * @param {Boolean} options.immediateCreate   - should the player create imemdiatly on initialization
     */


    constructor(container, video, options = {}) {

        this.options = {
            video: typeof Enabler != 'undefined' ? Enabler.getUrl(video) : video,
            width: 300,
            height: 250,
            controls: false,
            customControls: false,
            autoplay: false,
            sound: false,
            soundButton: true,
            overlay: null,
            poster: null,
            videoStartIcon: videoStartIcon,
            progressBar: true,
            immediateCreate: isMobile,
            ...options
        };

        this.durationEvent = 0;

        this.container = document.querySelector(container);
        this.container.style['width'] = this.options.width + 'px';
        this.container.style['height'] = this.options.height + 'px';
        this.container.classList.add('video-player-container');

        if ( isMobile ){
         this.container.classList.add('is-mobile');
         this.container.setAttribute('data-pointerevents', false);
        }

        if (this.options.customControls) this.options.controls = false;

        this.addVideoEl();
        this.addSpinner();
        this.addOverlay();

        if (this.options.immediateCreate || this.options.autoplay) this.createPlayer();

        document.addEventListener('EXIT', this.onExit.bind(this))

    }


    signals = {
        PLAYER_READY: new Signal(),
        PLAYER_PLAYING: new Signal(),
        PLAYER_PROGRESS: new Signal(),
        PLAYER_PAUSED: new Signal(),
        PLAYER_ENDED: new Signal(),
        PLAYER_TOGGLE_SOUND: new Signal(),
    };


    addSpinner() {
        this.spinner = document.createElement('div');
        this.spinner.classList.add('video-player__spinner');

        let spinnerContainer = document.createElement('div');
        this.spinner.appendChild(spinnerContainer);

        for (let i = 0; i < 3; i++) {
            let circle = document.createElement('div');
            circle.classList.add('circle' + ( i + 1));
            spinnerContainer.appendChild(circle);
        }
    };


    addOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.classList.add('video-player__overlay');

        if (typeof this.options.overlay === 'string') {
            this.overlay.style['background-image'] = `url('${ this.options.overlay }')`;
            this.overlay.style['background-size'] = `cover`;
        }

        if (this.options.overlay) this.overlay.innerHTML = this.options.videoStartIcon;
        this.container.appendChild(this.overlay);

        this.overlay.addEventListener('click', this.onOverlayClick.bind(this), false);

    };


    addVideoEl() {
        if(!this.container.querySelector('video')){
            this.videoEl = document.createElement('video');
            this.videoEl.classList.add('video-player');
            this.container.appendChild(this.videoEl);
            this.videoEl.setAttribute('playsinline', 'playsinline');
            this.videoEl.setAttribute('muted', 'true');

        }else{
            this.videoEl = this.container.querySelector('video');

        }

        if(this.options.poster) this.videoEl.setAttribute('poster', this.options.poster);
    }


    create() {
        this.container.setAttribute('data-status', 'LOADING');
        this.createPlayer();
    };


    createPlayer() {

        if (this.playerCreated) return false;
        this.playerCreated = true;

        console.log('Video.createPlayer');

        const source = document.createElement('source');
        source.src = this.options.video;
        source.type = 'video/mp4';
        this.videoEl.appendChild(source);

        if (this.options.controls && !this.options.customControls) this.videoEl.setAttribute('controls', 'controls');
        if (this.options.autoplay || this.playWhenReady) this.videoEl.setAttribute('autoplay', 'autoplay');

        this.videoEl.addEventListener('timeupdate', this.handleVideoTime.bind(this));
        this.videoEl.addEventListener('pause', this.onPause.bind(this));
        this.videoEl.addEventListener('play', this.onPlay.bind(this));
        this.videoEl.addEventListener('ended', this.onEnd.bind(this));


        this.container.appendChild(this.spinner);
        this.container.appendChild(this.overlay);


        var i = setInterval(function () {
            if (this.videoEl.readyState > 0) {
                this.onPlayerReady();
                clearInterval(i);
            }
        }.bind(this), 200);
    };


    onPlayerReady() {
        console.log('Video.playerReady');

        this.playerReady = true;

        this.setupControls();
        (this.options.sound || isMobile) ? this.unmute() : this.mute();

        this.options.sound ? this.unmute() : this.mute();


        // doubleclick specific code
        if (typeof Enabler !== 'undefined') {
            Enabler.loadModule(studio.module.ModuleId.VIDEO, function () {
                studio.video.Reporter.attach(this.container.id, this.videoEl);
            }.bind(this));
        }


        this.signals.PLAYER_READY.dispatch();
    };


    setupControls() {
        console.log('Video.setupCustomControls');


        if (this.options.controls) this.container.setAttribute('data-controls', (this.options.controls) ? 'STANDARD' : 'NONE');

        if (this.options.soundOverButton) {
            document.getElementById(this.options.soundOverButton).addEventListener('mouseenter', function () {
                if (this.container.getAttribute('data-sound') == 'UNMUTE') this.ytp.unMute();
            }.bind(this), false);
            document.getElementById(this.options.soundOverButton).addEventListener('mouseleave', function () {
                this.ytp.mute();
            }.bind(this), false)
        }

        if (this.options.customControls) {
            this.container.setAttribute('data-controls', 'CUSTOM');

            this.customControls = document.createElement('div');
            this.customControls.classList.add('video-player__controls');
            this.container.appendChild(this.customControls);

            this.playPauseBtn = document.createElement('div');
            this.playPauseBtn.classList.add('video-player__controls__play-pause-btn');
            this.customControls.appendChild(this.playPauseBtn);
            this.playPauseBtn.addEventListener('click', this.onPlayPauseClick.bind(this), false);

            if (this.options.soundButton) {
                this.soundBtn = document.createElement('div');
                this.soundBtn.classList.add('video-player__controls__sound-btn');
                this.customControls.appendChild(this.soundBtn);
                this.soundBtn.addEventListener('click', this.onSoundBtnClick.bind(this), false);
            }

            if (this.options.progressBar) {
                this.progressBar = document.createElement('div');
                this.progressBar.classList.add('video-player__progress-bar');
                this.customControls.appendChild(this.progressBar);
            }
        }
    };


    play() {
        if (this.playerReady) {
            this.container.setAttribute('data-status', 'PLAYING');
            this.videoEl.play();

        } else {
            this.playWhenReady = true;
            this.create();
        }
    }


    pause() {
        if (this.playerReady) {
            this.container.setAttribute('data-status', 'PAUSED');
            this.videoEl.pause();

        } else {
            this.playWhenReady = false;
            this.create();
        }
    }


    stop() {
        this.videoEl.pause();
        setTimeout(() => this.container.setAttribute('data-status', 'ENDED'), 10);
        clearInterval(this.progressTimer);
        this.spinnerType = 0;
        this.durationEvent = 0;
        this.videoEl.currentTime = 0;
    }


    mute() {
        this.container.setAttribute('data-sound', 'MUTE');
        this.videoEl.muted = true;
    }


    unmute() {
        this.container.setAttribute('data-sound', 'UNMUTE');
        this.seekTo(0);
        this.videoEl.muted = false;
    }


    seekTo(time) {
        this.videoEl.currentTime = time;
    }


    cueNewVideo(_videoID) {
        console.log('Video.cueVideo');
        this.options.videoID = _videoID;
        this.videoEl.cueVideoById(this.options.video);

        if (typeof Enabler !== 'undefined') {
            studio.video.Reporter.detach(this.container.id);
            studio.video.Reporter.attach(this.container.id, this.videoEl);
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

        if (this.container.getAttribute('data-sound') == 'MUTE') {
            this.unmute();
        } else {
            this.mute();
        }
    };


    onPlayPauseClick(event) {
        event.stopPropagation();

        if (this.container.getAttribute('data-status') == 'PLAYING') {
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
        console.log('Video.PAUSED');

        this.container.setAttribute('data-status', 'PAUSED');

        this.signals.PLAYER_PAUSED.dispatch();

    }


    onPlay() {
        console.log('Video.PLAY');

        this.container.setAttribute('data-status', 'PLAYING');

        this.signals.PLAYER_PLAYING.dispatch();
    }


    onEnd() {
        this.container.setAttribute('data-status', 'ENDED');

        this.signals.PLAYER_ENDED.dispatch();
    }


    handleVideoTime() {
        this.container.classList.add('started');

        var currentPercent = this.videoEl.currentTime / this.videoEl.duration;

        if (this.progressBar) {
            this.progressBar.style['width'] = currentPercent * 100 + '%';
        }

        if (currentPercent > 0 && this.durationEvent == 0) {
            console.log('0%');
            this.durationEvent++;

        } else if (currentPercent >= .25 && this.durationEvent == 1) {
            console.log('25%');
            this.durationEvent++;

        } else if (currentPercent >= .5 && this.durationEvent == 2) {
            console.log('50%');
            this.durationEvent++;

        } else if (currentPercent >= .75 && this.durationEvent == 3) {
            console.log('75%');
            this.durationEvent++;
        }

        this.signals.PLAYER_PROGRESS.dispatch({currentTime: this.videoEl.currentTime, duration: this.videoEl.duration});
    };


    onExit() {
        if (this.playerReady) this.stop();
    };

    get el() {
        return this.container;
    }
}