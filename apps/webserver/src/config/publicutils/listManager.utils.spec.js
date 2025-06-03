const { getWorstStatusId, setWorstStatusId } = require('./listManager.utils');

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

describe('Test setWorstStatusId function', () => {
  test('When list has no listAnalysesStatus, it should keep its original status', () => {
    const lists = [
      {
        list_status_id: 2,
        listAnalysesStatus: [],
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(2);
  });

  test('When list has listAnalysesStatus with worse status, it should update to worst status', () => {
    const lists = [
      {
        list_status_id: 2,
        listAnalysesStatus: [{ status: 1 }, { status: 2 }],
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(1);
  });

  test('When list has listAnalysesStatus with better status, it should keep original status', () => {
    const lists = [
      {
        list_status_id: 1,
        listAnalysesStatus: [{ status: 2 }, { status: 3 }],
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(1);
  });

  test('When list has listAnalysesStatus with same status, it should keep that status', () => {
    const lists = [
      {
        list_status_id: 2,
        listAnalysesStatus: [{ status: 2 }, { status: 2 }],
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(2);
  });

  test('When multiple lists are provided, each should be updated independently', () => {
    const lists = [
      {
        list_status_id: 2,
        listAnalysesStatus: [{ status: 1 }, { status: 2 }],
      },
      {
        list_status_id: 3,
        listAnalysesStatus: [{ status: 4 }, { status: 3 }],
      },
    ];
    setWorstStatusId(lists);
    expect(lists[0].list_status_id).toBe(1);
    expect(lists[1].list_status_id).toBe(3);
  });
});
