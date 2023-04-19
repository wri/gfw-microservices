import { palmRiskAnalysisParser } from './palm.risk.analysis.parser';

describe('Palm Risk Analysis Parser', () => {
  test('Receive empty data and return empty array', () => {
    const csvData = [];
    const dataRow = [];
    palmRiskAnalysisParser({
      operation: {
        fields: [
          {
            attribute: 'commodity_value_overall_level',
            type: 'yearly',
            parsed: 'category',
          },
        ],
      },
      data: {},
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(0);
  });

  test('Receive[commodity_value_protected_areas_level, yearly, category] and get ["Medium"]', () => {
    const csvData = [];
    const dataRow = [];
    palmRiskAnalysisParser({
      operation: {
        fields: [
          {
            attribute: 'commodity_value_overall_level',
            type: 'yearly',
            parsed: 'category',
          },
        ],
      },
      data: {
        commodity_value_overall_level:
          '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 0, "2018": 0, "2019": 0, "2020": 1}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['Medium']);
  });

  test('Receive[commodity_value_protected_areas_level, yearly, last] and get [55118.3046]', () => {
    const csvData = [];
    const dataRow = [];
    palmRiskAnalysisParser({
      operation: {
        fields: [
          {
            attribute: 'commodity_value_protected_areas',
            type: 'yearly',
            parsed: 'last',
          },
        ],
      },
      data: {
        commodity_value_protected_areas:
          '{"2002":55118.3046,"2003":55118.3046,"2004":55118.3046,"2005":55118.3046,"2006":55118.3046,"2007":55118.3046,"2008":55118.3046,"2009":55118.3046,"2010":55118.3046,"2011":55118.3046,"2012":55118.3046,"2013":55118.3046,"2014":55118.3046,"2015":55118.3046,"2016":55118.3046,"2017":55118.3046,"2018":55118.3046,"2019":55118.3046,"2020":55118.3046,"2021":55118.3046}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual([55118.3046]);
  });

  test('Receive[commodity_value_protected_areas_level, yearly, aggregate] and get [1047247.7874000005,]', () => {
    const csvData = [];
    const dataRow = [];
    palmRiskAnalysisParser({
      operation: {
        fields: [
          {
            attribute: 'commodity_value_protected_areas',
            type: 'yearly',
            parsed: 'aggregate',
          },
        ],
      },
      data: {
        commodity_value_protected_areas:
          '{"2002":55118.3046,"2003":55118.3046,"2004":55118.3046,"2005":55118.3046,"2006":55118.3046,"2007":55118.3046,"2008":55118.3046,"2009":55118.3046,"2010":55118.3046,"2011":55118.3046,"2012":55118.3046,"2013":55118.3046,"2014":55118.3046,"2015":55118.3046,"2016":55118.3046,"2017":55118.3046,"2018":55118.3046,"2019":55118.3046,"2020":55118.3046,"2021":55118.3046}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual([1047247.7874000005]);
  });

  test('Receive[commodity_value_protected_areas_level, lastYear] and get ["High"]', () => {
    const csvData = [];
    const dataRow = [];
    palmRiskAnalysisParser({
      operation: {
        fields: [
          {
            attribute: 'commodity_value_protected_areas_level',
            type: 'lastYear',
          },
        ],
      },
      data: {
        commodity_value_protected_areas_level:
          '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['High']);
  });

  test('Receive[commodity_value_protected_areas_level, lastYear] and get ["Low"]', () => {
    const csvData = [];
    const dataRow = [];
    palmRiskAnalysisParser({
      operation: {
        fields: [
          {
            attribute: 'commodity_value_protected_areas_level',
            type: 'lastYear',
          },
        ],
      },
      data: {
        commodity_value_protected_areas_level:
          '{ "2019": 1, "2020": 0,  "2021": 2}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['Low']);
  });
});
