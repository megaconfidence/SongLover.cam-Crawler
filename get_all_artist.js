const fs = require('fs');
const _ = require('lodash');

const path = process.env.OLDPWD;
const artistObj = {};

fs.readFile(`${path}/json/all/all_albums.json`, function(err, sData) {
  const { data } = JSON.parse(sData);
  data.forEach(d1 => {
    d1.forEach((d2, i) => {
      if (!artistObj[d2.albumArtist]) {
        artistObj[d2.albumArtist] = [];
      }
      artistObj[d2.albumArtist].push(d2);
    });
  });
  // console.log(artistObj);
  fs.writeFile(
    `${path}/json/all/artist_albums.json`,
    JSON.stringify({ data: artistObj }),
    function(err) {
      console.log('### Albums sorted by artist and saved');
    }
  );
});
