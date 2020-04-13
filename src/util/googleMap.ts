import axios from 'axios';
import Logger from '../common/logger';
import * as types from '../common/types';

const log = Logger.createLogger('util.googleMap');
const GOOGLE_URL = 'https://www.google.com';

const replaceAll = (str: string, searchStr: string, replaceStr: string) => {
  const result = str.split(searchStr).join(replaceStr);
  return result;
};


export default class GoogleMap {
  static async getLocationInfoList(
    category: string, latitude: string, longitude: string, zoom?: string,
  ) {
    try {
      const url = `${GOOGLE_URL}/maps/search/${category}/@${latitude},${longitude}${(zoom) ? `,${zoom}` : ''}z/data=!3m1!4b1`;
      const categorySearch = await axios(url);


      // Get Name, Address, Latitude, Longitude
      const parseResult = GoogleMap.parseBody(categorySearch.data);

      // Get Location Status
      const promises = [];
      for (const info of parseResult) {
        promises.push(GoogleMap.getLocationStatus(info.address));
      }

      const statusInfo = await Promise.all(promises);
      const result: types.locationInfo[] = [];
      for (const idx in statusInfo) {
        result.push({
          ...parseResult[idx],
          ...statusInfo[idx],
        });
      }

      return result;
    } catch (error) {
      log.error(`[-] failed to get location list - ${error}`);
      return {};
    }
  }

  static parseBody(bodyStr: string) {
    // const categoryToken = `\\\",null,[\\\"${category}\\\"`;
    const categoryToken = '\\",null,[\\"';
    const result = [];
    let htmlBody = bodyStr;

    while (htmlBody.indexOf(categoryToken) !== -1) {
      // to find name
      const firstIndex = htmlBody.indexOf(categoryToken);
      const secondIndex = htmlBody.lastIndexOf('"', firstIndex);

      // to find address
      const thirdIndex = htmlBody.indexOf('null,null,null,', firstIndex);
      const fourthIndex = htmlBody.indexOf('\\",', thirdIndex);
      // to find lat, long
      const fifthIndex = htmlBody.lastIndexOf('[', firstIndex);
      const sixthIndex = htmlBody.lastIndexOf(']', firstIndex);

      const coordinates = htmlBody.substring(fifthIndex + 1, sixthIndex).split(',').splice(2, 4);

      const name = htmlBody.substring(secondIndex + 1, firstIndex);
      const address = htmlBody.substring(thirdIndex + 22, fourthIndex);

      const link = `${GOOGLE_URL}/maps/search/${address}/@${coordinates[0]},${coordinates[1]},${15}z`;

      // get Phone Number
      let searchStr = address.replace(name, '');
      searchStr = searchStr.slice(0, searchStr.length - 1);
      const tempIdx = htmlBody.indexOf(searchStr);
      const phoneNumberIdx = htmlBody.indexOf('[\\"', tempIdx) + 3;
      const phoneNumberEndIdx = htmlBody.indexOf('\\', phoneNumberIdx);
      const phoneNumber = htmlBody.substring(phoneNumberIdx, phoneNumberEndIdx);
      if (/\d{2,3}-\d{3,4}-\d{4}/g.test(phoneNumber)) {
        htmlBody = replaceAll(htmlBody, phoneNumber, '');
      }
      result.push({
        name,
        address,
        latitude: coordinates[0],
        longitude: coordinates[1],
        link,
        phoneNumber: (/\d{2,3}-\d{3,4}-\d{4}/g.test(phoneNumber)) ? phoneNumber : undefined,
      });
      htmlBody = htmlBody.replace(categoryToken, '');
      // replace again to remove contact number (TODO: improve this hardcoded part)
      if (htmlBody.substring(htmlBody.indexOf(categoryToken) + 11, htmlBody.indexOf(categoryToken) + 15) === 'tel:') {
        htmlBody = htmlBody.replace(categoryToken, '');
      }
    }
    return result;
  }

  static async getLocationStatus(address: string) {
    let nowStatus;
    let live = false;
    const allStatus = [];
    try {
      const url = `${GOOGLE_URL}/search?tbm=map&tch=1&q=${encodeURIComponent(address)}&hl=en `;
      const placeSearchRes = await axios(url);
      const jsonBody = JSON.parse(placeSearchRes.data.replace('/*""*/', '')).d.replace(")]}'", '');

      const statusList = JSON.parse(jsonBody)[0][1][0][14][84];
      if (!statusList) {
        throw new Error('not exists');
      }
      for (const info of statusList[0]) {
        if (info && info[1]) {
          for (const time of info[1]) {
            allStatus.push({
              time: time[0],
              status: time[2],
            });
          }
        }
      }
      live = (statusList[6].indexOf('Now: ') === -1 && statusList[6] !== 'No popular times data');
      nowStatus = statusList[6].replace('Now: ', '');
    } catch (error) {
      nowStatus = 'No popular times data';
    }

    const statusInfo = {
      nowStatus,
      live,
      allStatus,
    };
    return statusInfo;
  }
}
