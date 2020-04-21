import axios from 'axios';
import Logger from '../common/logger';
import * as types from '../common/types';

const log = Logger.createLogger('util.googleMap');
const GOOGLE_URL = 'https://www.google.com';

export default class GoogleMap {
  static validParams(category: string, latitude: number, longitude: number, zoom: number) {
    if (!(category.length !== 0 && latitude >= -90 && latitude <= 90
      && longitude >= -180 && longitude <= 180 && zoom !== NaN)) {
      throw new Error('invalid params');
    }
  }

  static async getLocationInfoList(
    category: string, latitude: number, longitude: number, zoom: number = 15,
  ) {
    try {
      GoogleMap.validParams(category, latitude, longitude, zoom);
      const url = encodeURI(`${GOOGLE_URL}/maps/search/${category}/@${latitude},${longitude},${zoom}z?hl=en`);
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
      throw error;
    }
  }

  static parseBody(htmlBody: string) {
    const result = [];
    const placeInfoList = htmlBody.split('Starred places').splice(1);

    for (const placeInfo of placeInfoList) {
      const addressIdx = placeInfo.indexOf('\\n]\\n]\\n,[2,[[\\"') + '\\n]\\n]\\n,[2,[[\\"'.length;
      const address = placeInfo.substring(addressIdx, placeInfo.indexOf('\\', addressIdx));

      const phoneNumberIdx = placeInfo.indexOf(']\\n,null,[[\\"') + ']\\n,null,[[\\"'.length;
      const phoneNumber = placeInfo.substring(phoneNumberIdx, placeInfo.indexOf('\\', phoneNumberIdx));

      const nameIdx = placeInfo.indexOf('[[[7,[[\\"') + '[[[7,[[\\"'.length;
      const name = placeInfo.substring(nameIdx, placeInfo.indexOf('\\', nameIdx));

      const coordinateIdx = placeInfo.indexOf('\\n]\\n,null,[[3.0,') + '\\n]\\n,null,[[3.0,'.length;
      // locations[0]: longitude  , locations[1]: latitude
      const coordinate = placeInfo.substring(coordinateIdx, placeInfo.indexOf(']', coordinateIdx)).split(',');
      const link = `${GOOGLE_URL}/maps/search/${address}/@${coordinate[1]},${coordinate[0]},${15}z`;
      const directions = `${GOOGLE_URL}/maps/dir/?api=1&destination=${address}`;
      
      result.push({
        name,
        address,
        latitude: coordinate[1],
        longitude: coordinate[0],
        link,
        directions,
        phoneNumber: (/\d{2,3}-\d{3,4}-\d{4}/g.test(phoneNumber)) ? phoneNumber : undefined,
      });
    }

    return result;
  }

  static async getLocationStatus(address: string) {
    let nowStatus;
    let live = false;
    const allStatus = [];
    try {
      const url = `${GOOGLE_URL}/search?tbm=map&tch=1&q=${encodeURIComponent(address)}&hl=en`;
      const placeSearchRes = await axios(url);
      const jsonBody = JSON.parse(placeSearchRes.data.replace('/*""*/', '')).d.replace(")]}'", '');

      const statusList = JSON.parse(jsonBody)[0][1][0][14][84];
      if (!statusList) {
        throw new Error('not exists');
      }
      for (const info of statusList[0]) {
        const subStatus = [];
        if (info && info[1]) {
          for (const time of info[1]) {
            subStatus.push({
              time: time[0],
              status: time[2],
            });
          }
        }
        allStatus.push(subStatus);
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
