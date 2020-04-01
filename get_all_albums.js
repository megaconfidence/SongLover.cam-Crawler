const fs = require('fs');
const _ = require('lodash');

const path = process.env.OLDPWD;
let albums = [];

fs.readdir(path+'/json/cat', function(err, lists) {
  lists.forEach((list, i) => {
      console.log('### Adding ', list)
    fs.readFile(`${path}/json/cat/${list}`, function(err, sData) {
      const { data } = JSON.parse(sData);
      albums.push(data);

        // console.log(i, list.length-1)
      if (i == lists.length - 1) {
        const ssData = JSON.stringify({data: albums})
        fs.writeFile(path + '/json/all/all_albums.json', ssData, err => {
          if (err) throw err;
          console.log('### Album data saved');
          process.exit();
        });
      }
    });
  });
});
