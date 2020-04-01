const fs = require('fs');
require('dotenv').config();
const _ = require('lodash');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const albumCategorie = [`${process.env.CAT}`];
// const albumCategorie = [
//   'no',
//   'a',
//   'b',
//   'c',
//   'd',
//   'e',
//   'f',
//   'g',
//   'h',
//   'i',
//   'j',
//   'k',
//   'l',
//   'm',
//   'n',
//   'o',
//   'p',
//   'q',
//   'r',
//   's',
//   't',
//   'u',
//   'v',
//   'w',
//   'x',
//   'y',
//   'z'
// ];

let albumLinks = [];
const File = 'albumLinks.json';

const saveArtistToFile = async () => {
  const saveToFile = data => {
    const temp = _.uniq(data.sort());
    const sData = JSON.stringify({ data: temp });
    fs.writeFile(File, sData, err => {
      if (err) throw err;
      console.log('###: Artist data saved');
      process.exit()
    });
  };

  const getArtist = () => {
    return new Promise(async resolve => {
      const gottenResult = albumCategorie.map(
        cat =>
          new Promise((resolve, reject) => {
            console.log(`###: Getting cat ${cat}`);
            fetch(`https://songslover.cam/atoz/${cat}.html`)
              .then(res => res.text())
              .then(html => {
                const $ = cheerio.load(html);
                const artists = $('.entry div');

                artists.each((i, el) => {
                  const link = $(el)
                    .find('a')
                    .attr('href');

                  if (link && !link.includes('http')) {
                    albumLinks.push(link);
                  }
                  if (i === artists.length - 1) {
                    resolve(albumLinks);
                  }
                });
              })
              .catch(err => {
                reject(err);
              });
          })
      );

      Promise.all(gottenResult)
        .then(result => {
          resolve([].concat.apply([], result));
        })
        .catch(error => resolve([]));
    });
  };

  const artistList = await getArtist();
  // console.log(albumLinks);
  saveToFile(artistList);
};
saveArtistToFile();
