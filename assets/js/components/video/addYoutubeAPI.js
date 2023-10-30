/**
 * ADD YOUTUBE API
 */

import {Signal} from 'signals';

let onYouTubeIframeAPIReady = false;

export let youtubeAPIAdded = false;

export const addYoutubeAPI = function () {
  if ( !youtubeAPIAdded ) {
    youtubeAPIAdded = true;
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";

    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
};

export const onYoutubeAPIReady = new Signal();

window.onYouTubeIframeAPIReady = () => {
  console.log('YTPlayer.onYouTubeIframeAPIReady');
  onYoutubeAPIReady.dispatch();
};


