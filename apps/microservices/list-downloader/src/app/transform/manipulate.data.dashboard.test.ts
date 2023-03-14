import { ManipulateDataForDashboard } from './manipulate.data.dashboard'

describe('ManipulateDataForDashboard', () => {

  test('Should handle percent calc ', () => {
    const manipulateDataForDashboard = new ManipulateDataForDashboard([{
      parsed: 'percent',
      numerators: [
        {
          extentAttribute: 'tree_cover_extent_total',
          tclAttribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Extent',
        },
      ]
  }], undefined, undefined);
    manipulateDataForDashboard._transform({
      tree_cover_extent_total: 20,
      tree_cover_loss_total_yearly: 10
    }, '', (err, data) => {
    expect(data).toEqual([["Tree Cover Extent", "50.00", 10, 20]]);
    });
  });


  test('Should return undefined when list to filter de object is undefined', () => {
    const manipulateDataForDashboard = new ManipulateDataForDashboard([{
      parsed: 'percent',
      numerators: [
        {
          extentAttribute: 'tree_cover_extent_total',
          tclAttribute: 'tree_cover_loss_total_yearly',
          label: 'Tree Cover Extent',
        },
      ]
  }], undefined, undefined);
    manipulateDataForDashboard._transform({
      tree_cover_loss_total_yearly: 20,
      tree_cover_extent_total: {
        "2018": 6,
        "2019": 7,
        "2020": 8,
        "2021": 9,
        "2022": 10,
      }
    }, '', (err, data) => {
    expect(data).toEqual([["Tree Cover Extent", "0.00", 20 ,{ "2018": 6, "2019": 7, "2020": 8, "2021": 9, "2022": 10 }]]);
    });
  });
});


