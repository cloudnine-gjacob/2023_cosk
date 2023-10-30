'use strict';

export default class InfiniteZoom {
    constructor( options = {}) {
        this.options = {
            time: 10,
            autoPlay: true,
            autoStop: -1,

            clip0: '#zoom0',
            clip1: '#zoom1',
            transformOrigin: 'center',

            scale: 1,
            parentClip: '#zoom',
            spin: true,
            spinTransformOrigin: 'center',

            ...options

        };

        this.stopZoomBinder = this.stopZoom.bind(this);
        if(this.options.autoStop != -1) TweenMax.delayedCall(this.options.autoStop, this.stopZoomBinder)

        TweenMax.set(this.options.parentClip, {scale:this.options.scale, transformOrigin:this.options.transformOrigin});

        TweenMax.set(this.options.clip0, {scale:.8, transformOrigin:this.options.transformOrigin});
        TweenMax.set(this.options.clip1, {alpha:0, scale:.6, transformOrigin:this.options.transformOrigin});

        let time = this.options.time;

        this.zoomTL = new TimelineLite({onComplete:function(){this.zoomTL.play(0)}, onCompleteScope:this});
        this.zoomTL.to(this.options.clip0, time, {scale:1.6, ease:Linear.easeNone, transformOrigin:this.options.transform, rotationZ:.001, force3D:true});
        this.zoomTL.to(this.options.clip1, time / 4, {alpha:1, scale:.8, ease:Linear.easeNone, overwrite:false, transformOrigin:this.options.transform, rotationZ:.001, force3D:true, onComplete:this.animateSpace, onCompleteScope:this, onCompleteParams:[true]}, '-=' + time/4);
        this.zoomTL.pause();

        if(this.options.spin){
            this.spinTL = new TimelineLite({onComplete:function(){this.spinTL.play(0)}, onCompleteScope:this});
            this.spinTL.to(this.options.parentClip, time * 8, {rotation:'+=360', ease:Linear.easeNone, transformOrigin:this.options.spinTransformOrigin, rotationZ:.001, force3D:true});
            this.spinTL.pause();
        }

        if(this.options.autoPlay) this.startZoom();

    }


    startZoom(){
        this.zoomTL.play();
        if(this.options.spin) this.spinTL.play();
    }


    stopZoom(){
        TweenMax.killDelayedCallsTo(this.stopZoomBinder);
        this.zoomTL.pause();
        if(this.options.spin) this.spinTL.pause();
    }
}