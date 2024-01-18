import { AlertsService } from './alerts.service';

describe('AlertsService -  transformLocationId', () => {
  it('should return empty array when locationId is empty', () => {
    const service = new AlertsService(undefined);
    const result = service.transformLocationId();
    expect(result).toEqual([]);
  });

  it('should return empty array when receive undefined', () => {
    const service = new AlertsService(undefined);
    const result = service.transformLocationId(undefined);
    expect(result).toEqual([]);
  });

  it('should return empty array when receive string with characters', () => {
    const service = new AlertsService(undefined);
    const result = service.transformLocationId('abc,cde');
    expect(result).toEqual([]);
  });

  it('should return empty array when receive string with a comma', () => {
    const service = new AlertsService(undefined);
    const result = service.transformLocationId(',');
    expect(result).toEqual([]);
  });

  it('should return array of numbers when receive string with numbers', () => {
    const service = new AlertsService(undefined);
    const result = service.transformLocationId('1,2,3,4,5,6');
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should return array of numbers when receive string with numbers and extra comma', () => {
    const service = new AlertsService(undefined);
    const result = service.transformLocationId('1,2,3,4,5,6,');
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
