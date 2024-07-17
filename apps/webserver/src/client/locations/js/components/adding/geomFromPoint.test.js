import { geomFromLatLongRadiusArea } from './geomFromPoint';

describe('CoordinateInputRow', () => {
  it('should error on invalid latitude', () => {
    try {
      geomFromLatLongRadiusArea('a', 1, 2, 3);
    } catch (error) {
      expect(error.message).toEqual('Invalid latitude or longitude value');
    }
  });

  it('should error on invalid longitude', () => {
    try {
      geomFromLatLongRadiusArea(0, 'a', 2, 3);
    } catch (error) {
      expect(error.message).toEqual('Invalid latitude or longitude value');
    }
  });
});
