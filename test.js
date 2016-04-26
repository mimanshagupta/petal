'use strict';
let youTubeParser = require('youtube-parser');
youTubeParser.getURL('https://www.youtube.com/watch?v=ku7vPDZFUDw', {quality: 'medium', container: 'mp4'})
.then(
  function (urlList) {
    // Access URLs.
    console.log(urlList[0]);
  }
);
