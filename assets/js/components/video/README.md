# Youtube videos for cloudnine Banners

> This component lets you ad a youtube video in your ads

## Quick start

> HTML:
```html
<div id="yt-video"></div>
```

> JS:
```js
import YTPlayer from '../../../_shared/js/c9/video/youtube/YTPlayer';
...  
new YTPlayer('#yt-video', "5IXQ6f6eMxQ");
```

## API

### new YTPlayer(container, videoID [,options])

- container: string, html-ID of DOM-Element
- videoID: string, youtube video-ID (i.e "5IXQ6f6eMxQ")
- opitons: object, optional. See parameters below

### Options
> YTPlayer supports the following list of parameters on initialization:

<br>
<table style="width: 100%;">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Default Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>width</td>
        <td>number</td>
        <td>300</td>
        <td>width of the player-container</td>
    </tr>
    <tr>
        <td>height</td>
        <td>number</td>
        <td>250</td>
        <td>height of the player-container</td>
    </tr>
    <tr>
        <td>controls</td>
        <td>boolean</td>
        <td>false</td>
        <td>sets the default youtube controls to true or false</td>
    </tr>
    <tr>
        <td>customControls</td>
        <td>boolean</td>
        <td>false</td>
        <td>
            shows custom controls that can be customized in ./source/_shared/js/c9/video/youtube/customControls.scss<br>
            If et to true, youtube-controls will be set to false    
        </td>
    </tr>
    <tr>
        <td>sound</td>
        <td>boolean</td>
        <td>true</td>
        <td>mutes the sound on initialization if set to false.</td>
    </tr>
    <tr>
        <td>prestop</td>
        <td>number</td>
        <td>.1</td>
        <td>seconds to stop before video comes to the end</td>
    </tr>
    <tr>
        <td>overlay</td>
        <td>string</td>
        <td>null</td>
        <td>pass name of image for custom overlay</td>
    </tr>
  </tbody>
</table>