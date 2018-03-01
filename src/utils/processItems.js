import path from 'path';
import fs from 'fs';
import fetch from "node-fetch";
import {URL} from "url";
import xlsx from "node-xlsx";
import isUrl from "is-url";

const imageNameRegex = /[A-z0-9\-]*.(jpg|png)$/ig;

const workSheetsFromFile = xlsx.parse(`${path.join(__dirname, '../')}resimlinkleri.xlsx`);

const pagesWithData = workSheetsFromFile.filter(page => page.data.length);

const rowItems = pagesWithData.reduce((prev, curr) => prev.concat(...curr.data), []).filter(text => isUrl(text));

const initialItemsLength = rowItems.length;

let processedItemsCount = 0;

const processItems = () => {

  const imageUrl = new URL(rowItems.pop());
  const imageName = imageUrl.pathname.match(imageNameRegex)[0];

  fetch(imageUrl)
    .then(res => {
      console.log('nereye yazdın lan', `${path.join(__dirname, '../images/')}${imageName}`);
      const dest = fs.createWriteStream(`${path.join(__dirname, '../images/')}${imageName}`);
      res.body.pipe(dest);

      console.log(`% ${ Math.abs(++processedItemsCount / initialItemsLength) * 100 }`);

      if (rowItems.length) {
        processItems();
      } else {
        console.log('process finished');
      }

    })
    .catch(err => {
      console.log(err);
      processItems();
    });

};

export default processItems;
