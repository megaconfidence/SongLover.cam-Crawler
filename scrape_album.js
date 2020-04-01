const fs = require('fs');
const _ = require('lodash');
require('dotenv').config();
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const request = require('request');

// let albumLinks = [
//   '/albums/ace-hood-trials-tribulations.html',
//   '/albums/action-bronson-white-bronco.html',
//   '/albums/aaron-carter-love.html',
//   '/albums/active-child-mercy.html',
//   '/albums/ace-hood-starvation-v.html',
//   '/albums/akon-konvict-kartel-vol-1.html'
// ];
let albumLinks = [];
fs.readFile('albumLinks.json', (err, sData) => {
  if (sData) {
    console.log('### Loading album data');
    const { data } = JSON.parse(sData);
    albumLinks = data;
    saveArtistToFile();
  }
});
let albumArr = [];
const File = `${process.env.OLDPWD}/json/cat/${process.env.CAT}.json`;

const saveArtistToFile = async () => {
  const saveToFile = data => {
    const temp = _.uniq(data.sort());
    const sData = JSON.stringify({ data: temp });
    fs.writeFile(File, sData, err => {
      if (err) throw err;
      console.log('### Album data saved');
      process.exit()
    });
  };

  const getArtist = () => {
    return new Promise(async resolve => {
      const gottenResult = albumLinks.map(
        (link, linkIndex) =>
          new Promise((resolve, reject) => {
            request(`https://songslover.cam${link}`, (err, res, html) => {
              if (err) {
                console.log(err);
              } else {
                const $ = cheerio.load(html);
                const album = $('article#the-post .entry');
                let obj;
                album.each((i, el) => {
                  let albumArt = $(el)
                    .find('img.size-medium')
                    .attr('src');
                  const linkTypeOne = $(el).find('ol strong a');
                  const linkTypeTwo = $(el).find('tbody .wpmd a');
                  const linkTypeThree = $(el).find('ol li a');
                  const albumSongs = [];
                  let albumName = String(
                    $(el)
                      .find("span:contains('Album :')")
                      .text()
                      .split(':')[1]
                  )
                    .toLowerCase()
                    .trim();
                  let albumArtist = String(
                    $(el)
                      .find("span:contains('Singer :')")
                      .text()
                      .split(':')[1]
                  )
                    .toLowerCase()
                    .trim();
                  const albumDate = String(
                    $(el)
                      .find("span:contains('Date :')")
                      .text()
                      .split(':')[1]
                  )
                    .toLowerCase()
                    .trim();
                  const albumGenre = String(
                    $(el)
                      .find("span:contains('Genre :')")
                      .text()
                      .split(':')[1]
                  )
                    .toLowerCase()
                    .trim();

                  if (!albumArt) {
                    albumArt = $(el)
                      .find('img.size-full')
                      .attr('src');
                  }
                  if (!albumArt) {
                    albumArt = $(el)
                      .find('img')
                      .attr('src');
                  }

                  if (
                    albumName === 'undefined' ||
                    albumArtist === 'undefined'
                  ) {
                    const title = $('h1.entry-title')
                      .text()
                      .toLowerCase()
                      .split(' – ');
                    albumArtist = title[0] || albumArtist;
                    albumName = title[1] || albumName;
                    if (albumName === 'undefined') {
                      albumName = albumArtist;
                    }
                  }

                  const saveAlbum = () => {
                    obj = {
                      albumArtist,
                      albumArt,
                      albumName,
                      albumGenre,
                      albumDate,
                      albumSongs
                    };
                    albumArr.push(obj);
                  };

                  const buildAlbumSongs = linkType => {
                    linkType.each((i, el) => {
                      let text = $(el)
                        .text()
                        .toLowerCase();
                      let url = $(el).attr('href');
                      if (
                        text &&
                        !text.includes('download & listen') &&
                        !text.includes('listen &') &&
                        !text.includes('all in one') &&
                        !text.includes('zip file') &&
                        !text.includes('dmca compliant') &&
                        !text.includes('youtube') &&
                        !text.includes('apple music') &&
                        !text.includes('amazon store') &&
                        !text.includes('itunes store') &&
                        !text.includes('help link') &&
                        !url.includes('.zip')
                      ) {
                        if (text.includes(`${albumArtist} – `)) {
                          text = text.replace(`${albumArtist} – `, '');
                        }
                        if (text.includes(`${albumName} – `)) {
                          text = text.replace(`${albumName} – `, '');
                        }
                        if (text.includes(' – ')) {
                          text = text.replace(' – ', '');
                        }
                        if (text.includes('download')) {
                          text = text.replace('download', '');
                        }

                        if (text) {
                          albumSongs.push({
                            name: text.trim(),
                            url
                          });
                        }
                      }
                    });
                    saveAlbum();
                  };

                  if (linkTypeOne.length) {
                    buildAlbumSongs(linkTypeOne);
                  } else if (linkTypeTwo.length) {
                    buildAlbumSongs(linkTypeTwo);
                  } else {
                    buildAlbumSongs(linkTypeThree);
                  }
                });
                if (linkIndex === albumLinks.length - 1) {
                  // console.log('resolving 1');
                  // console.log(albumArr)
                  // resolve(albumArr);
                  saveToFile(albumArr);
                }
              }
            });
          })
      );

      Promise.all(gottenResult)
        .then(result => {
          console.log('resolving 2');
          resolve(result);
        })
        .catch(error => {
          console.log(error);
          resolve([]);
        });
    });
  };

  const artistList = await getArtist();
  // console.log(artistList);
  console.log('done');
  saveToFile(artistList);
};
// saveArtistToFile();
// fetch(`https://songslover.cam${link}`)
//   .then(res => res.text())
//   .then(html => {
//     const $ = cheerio.load(html);
//     const album = $('article#the-post .entry');
//     let obj;
//     album.each((i, el) => {
//       const albumArt = $(el)
//         .find('img.size-medium')
//         .attr('src');
//       const albumData = $(el).find('div span');
//       const linkTypeTwo = $(el).find('tbody .wpmd a');
//       const albumSongs = [];
//       let albumName, albumArtist, albumDate;

//       albumData.each((i, el) => {
//         if (i === 0) {
//           albumName = $(el)
//             .text()
//             .split(': ')[1];
//         }
//         if (i === 1) {
//           albumArtist = $(el)
//             .text()
//             .split(': ')[1];
//         }
//         if (i === 2) {
//           albumDate = $(el)
//             .text()
//             .split(': ')[1];
//         }
//       });
//       linkTypeTwo.each((i, el) => {
//         albumSongs.push({
//           name: $(el).text(),
//           url: $(el).attr('href')
//         });
//       });
//       obj = {
//         albumName,
//         albumArtist,
//         albumDate,
//         albumArt,
//         albumSongs
//       };
//       albumArr.push(obj);
//       // console.log(obj);
//       if (i === albumLinks.length - 1) {
//         console.log('resolving 1')
//         resolve(albumArr);
//       }
//     });
//   })
//   .catch(err => {
//     console.log('333', err)
//     reject(err);
//   });
