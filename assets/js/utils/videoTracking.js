/**
 * DCS videoTracking
 * @param {String} tracking property to track
 *
 */

const eventMap = {
  MUTE: 'YTVideo Mute',
  UNMUTE: 'YTVideo Unmute',
  PAUSE: 'YTVideo Pause',
  PLAY: 'YTVideo Click to Play',
  YT0: 'YTVideo Percent 0',
  YT25: 'YTVideo Percent 25',
  YT50: 'YTVideo Percent 50',
  YT75: 'YTVideo Percent 75',
  YT100: 'YTVideo Percent 100'
};

export function dummyTrack() {
  try{
    Enabler.counter('YTVideo Mute');
    Enabler.counter('YTVideo Unmute');
    Enabler.counter('YTVideo Pause');
    Enabler.counter('YTVideo Click to Play');
    Enabler.counter('YTVideo Percent 0');
    Enabler.counter('YTVideo Percent 25');
    Enabler.counter('YTVideo Percent 50');
    Enabler.counter('YTVideo Percent 75');
    Enabler.counter('YTVideo Percent 100');
  }catch( e ){
    console.warn("DCS VideoTracking not available: " + e);
  }
}

export function track( eventKey ) {
  try{
    Enabler.counter( eventMap[eventKey], true);
  }catch( e ){
    console.warn("DCS VideoTracking not available: " + e);
  }
};