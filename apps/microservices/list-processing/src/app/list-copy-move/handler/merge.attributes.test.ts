import { mergeSourceDestinyListAttributes } from './merge.attributes';
import { getListAttributes, saveListAttributes } from '@wri-monorepos/sql';

jest.mock('@wri-monorepos/sql', () => ({
  getListAttributes: jest.fn(),
  saveListAttributes: jest.fn(),
}));

describe('mergeSourceDestinyListAttributes', () => {
  const mockSourceAttributes = [
    { list_id: 1, attribute_name: 'attr1', attribute_type: 1 },
    { list_id: 1, attribute_name: 'attr2', attribute_type: 2 },
    { list_id: 1, attribute_name: 'attr3', attribute_type: 1 },
  ];

  const mockDestinyAttributes = [
    { list_id: 2, attribute_name: 'attr1', attribute_type: 1 },
    { list_id: 2, attribute_name: 'attr2', attribute_type: 2 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should merge attributes from source to destiny list', async () => {
    (getListAttributes as jest.Mock)
      .mockResolvedValueOnce(mockSourceAttributes)
      .mockResolvedValueOnce(mockDestinyAttributes);

    const result = await mergeSourceDestinyListAttributes('test_db', 1, 2);

    expect(getListAttributes).toHaveBeenCalledTimes(2);
    expect(getListAttributes).toHaveBeenCalledWith('test_db', 1);
    expect(getListAttributes).toHaveBeenCalledWith('test_db', 2);

    expect(saveListAttributes).toHaveBeenCalledWith('test_db', [
      { list_id: 2, attribute_name: 'attr3', attribute_type: 1 },
    ]);

    expect(result).toEqual([{ list_id: 2, attribute_name: 'attr3', attribute_type: 1 }]);
  });

  it('should not save any attributes if all source attributes exist in destiny', async () => {
    (getListAttributes as jest.Mock)
      .mockResolvedValueOnce(mockSourceAttributes.slice(0, 2))
      .mockResolvedValueOnce(mockDestinyAttributes);

    const result = await mergeSourceDestinyListAttributes('test_db', 1, 2);

    expect(saveListAttributes).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should throw error if getListAttributes fails', async () => {
    (getListAttributes as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    await expect(mergeSourceDestinyListAttributes('test_db', 1, 2)).rejects.toThrow(
      'Database error'
    );
  });
});
