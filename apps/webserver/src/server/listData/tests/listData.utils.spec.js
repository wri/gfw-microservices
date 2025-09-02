const { getListDataFiltered } = require('../utils/listData.utils');

const buildListData = () => ({
  list_analysis: [{ id: 'la1' }],
  location_analyses: [
    [
      { Country: 'Brazil', State: 'Bahia', 'Sub State': 'Barreiras', 'Analysis Area': 600, a: 3 },
      { Country: 'Brazil', State: 'Pará', 'Sub State': 'Altamira', 'Analysis Area': 200, a: 1 },
      { Country: 'Peru', State: 'Cusco', 'Sub State': 'Cusco', 'Analysis Area': 800, a: 2 },
    ],
    [{ analysis: 'x1' }, { analysis: 'x2' }, { analysis: 'x3' }],
  ],
});

describe('getListDataFiltered', () => {
  it('filters by analysisArea threshold', () => {
    const data = buildListData();
    const res = getListDataFiltered(data, { analysisArea: 500 });
    expect(res.location_analyses[0]).toHaveLength(2);
    expect(res.location_analyses[1]).toHaveLength(2);
  });

  it('sorts by attribute ascending by default', () => {
    const data = buildListData();
    const res = getListDataFiltered(data, { sortByAttribute: 'a' });
    const attrs = res.location_analyses[0].map((r) => r.a);
    expect(attrs).toEqual([1, 2, 3]);
  });

  it('sorts by attribute descending', () => {
    const data = buildListData();
    const res = getListDataFiltered(data, { sortByAttribute: 'a', order: 'desc' });
    const attrs = res.location_analyses[0].map((r) => r.a);
    expect(attrs).toEqual([3, 2, 1]);
  });

  it('filters by country/state/subState', () => {
    const data = buildListData();
    const res = getListDataFiltered(data, {
      country: 'Brazil',
      state: 'Bahia',
      subState: 'Barreiras',
    });
    expect(res.location_analyses[0]).toHaveLength(1);
    expect(res.location_analyses[0][0].State).toBe('Bahia');
    expect(res.location_analyses[1]).toHaveLength(1);
    expect(res.location_analyses[1][0]).toEqual({ analysis: 'x1' });
  });

  it('applies pagination when page and pageSize provided', () => {
    const data = buildListData();
    const res = getListDataFiltered(data, { page: 1, pageSize: 2 });
    expect(res.filter_attributes.totalPages).toBe(2);
    expect(res.location_analyses[0]).toHaveLength(1);
    expect(res.location_analyses[1]).toHaveLength(1);
  });
});
