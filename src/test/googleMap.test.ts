import GoogleMap from '../util/googleMap';

jest.setTimeout(30000000);


describe('GoogleMap', () => {
  it('is case that there is zoom parameter', async () => {
    try {
      const result = await GoogleMap.getLocationInfoList('starbucks', 30, 120, 15);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('address');
      expect(result[0]).toHaveProperty('latitude');
      expect(result[0]).toHaveProperty('longitude');
      expect(result[0]).toHaveProperty('nowStatus');
      expect(result[0]).toHaveProperty('live');
    } catch (error) {
      expect(true).toEqual(false);
    }
  });

  it('is case that there is no zoom parameter', async () => {
    try {
      const result = await GoogleMap.getLocationInfoList('starbucks', 30, 120);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('address');
      expect(result[0]).toHaveProperty('latitude');
      expect(result[0]).toHaveProperty('longitude');
      expect(result[0]).toHaveProperty('nowStatus');
      expect(result[0]).toHaveProperty('live');
    } catch (error) {
      expect(true).toEqual(false);
    }
  });

  it('is case that there is invalid parameter(latitude)', async () => {
    try {
      await GoogleMap.getLocationInfoList('starbucks', 180, 120);
      expect(true).toEqual(false);
    } catch (error) {
      expect(error.message).toEqual('invalid params');
    }
  });

  it('is case that there is invalid parameter(category)', async () => {
    try {
      await GoogleMap.getLocationInfoList('', 180, 120);
      expect(true).toEqual(false);
    } catch (error) {
      expect(error.message).toEqual('invalid params');
    }
  });

  it('is case that there is invalid parameter(zoom)', async () => {
    try {
      await GoogleMap.getLocationInfoList('starbucks', 180, 120, NaN);
      expect(true).toEqual(false);
    } catch (error) {
      expect(error.message).toEqual('invalid params');
    }
  });
});
