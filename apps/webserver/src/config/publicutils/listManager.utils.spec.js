const { getWorstStatusId } = require('./listManager.utils');

describe('Test getWorstStatusId function', () => {
  test('When it is empty should return undefined', () => {
    const code = getWorstStatusId([]);
    expect(code).toBe(undefined);
  });

  test('When receiving 1 and 2 it should return 1 as the worst status', () => {
    const code = getWorstStatusId([
      {
        status: 1,
      },
      { status: 2 },
    ]);
    expect(code).toBe(1);
  });

  test('When receiving 1 and 4 it should return 4 as the worst status', () => {
    const code = getWorstStatusId([
      {
        status: 1,
      },
      { status: 4 },
    ]);
    expect(code).toBe(4);
  });

  test('when both analyzes have the same status, this value must be the same as the list status.', () => {
    const code = getWorstStatusId([
      {
        status: 2,
      },
      { status: 2 },
    ]);
    expect(code).toBe(2);
  });
});
