import axios from 'axios';
import { palmOilCsvAdjust } from './palm.oil.csv.adjust'; // Adjust the import according to your file structure

jest.mock('axios');

describe('palmOilCsvAdjust', () => {
  it('should adjust data if it is a palm mill column name is ID', async () => {
    const data = [{ ID: 1 }];
    const responseData = { data: [{ uml_id: '1', latitude: '10.0', longitude: '20.0' }] };

    jest.spyOn(axios, 'get').mockResolvedValue({ data: responseData });

    const result = await palmOilCsvAdjust(data);

    expect(result[0].ID).toBe(1);
    expect(result[0].latitude).toBe('10.0');
    expect(result[0].longitude).toBe('20.0');
  });

  it('should return data unchanged if not a palm mill', async () => {
    const data = [{ 'Other ID': 1 }];

    const result = await palmOilCsvAdjust(data);

    expect(result).toEqual(data);
  });
});
