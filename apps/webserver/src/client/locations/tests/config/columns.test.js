import columns from '../../js/config/columns';
import { ActiveLocationOne, ActiveLocationTwo, PedingLocation } from '../mockedData';

const runSortTests = (sortMethod) => {
  describe('sortMethod', ()=>{
    it('should return area diference when both status are active', () => {
      const response = sortMethod(ActiveLocationOne, ActiveLocationTwo);
      expect(response).toBe(2);
    });

    it('should return 0 when both status locations are not active', () => {
      const response = sortMethod(PedingLocation, PedingLocation);
      expect(response).toBe(0);
    })

    it('should return 1 when just first status locations is active', () => {
      const response = sortMethod(ActiveLocationOne, PedingLocation);
      expect(response).toBe(1)
    });

    it('should return -1 when just second status locations is active', () => {
      const response = sortMethod(PedingLocation, ActiveLocationOne);
      expect(response).toBe(-1)
    })
  });
}
describe('columns', () => {
  describe('forest_change_locations', () => {
    runSortTests(columns.forest_change_locations[0].sortMethod);
  });

  describe('forest_change_analysis - tree_cover_extent_total', () => {
    runSortTests(columns.forest_change_analysis[0].sortMethod);

  });

  describe('forest_change_analysis - tree_cover_loss_total_yearly', () => {
    runSortTests(columns.forest_change_analysis[1].columns[0].sortMethod);
  });

  describe('forest_change_analysis - tree_cover_loss_protected_areas_yearly', () => {
    runSortTests(columns.forest_change_analysis[1].columns[1].sortMethod);
  });

  describe('forest_change_analysis - tree_cover_loss_primary_forest_yearly', () => {
    runSortTests(columns.forest_change_analysis[1].columns[2].sortMethod);
  });
  describe('forest_change_analysis - commodity_analysis', () => {
    runSortTests(columns.commodity_analysis[0].columns[0].sortMethod);
  });
  describe('forest_change_analysis - commodity_threat_deforestation_level', () => {
    runSortTests(columns.commodity_analysis[1].columns[0].sortMethod);
  });
  describe('forest_change_analysis - commodity_threat_peat_level', () => {
    runSortTests(columns.commodity_analysis[1].columns[1].sortMethod);
  });
  describe('forest_change_analysis - commodity_threat_protected_areas_level', () => {
    runSortTests(columns.commodity_analysis[1].columns[2].sortMethod);
  });
  describe('forest_change_analysis - commodity_threat_fires_level', () => {
    runSortTests(columns.commodity_analysis[1].columns[3].sortMethod);
  });
  describe('forest_change_analysis - commodity_threat_overall_level', () => {
    runSortTests(columns.commodity_analysis[1].columns[4].sortMethod);
  });
  describe('forest_change_analysis - commodity_value_forest_extent_level', () => {
    runSortTests(columns.commodity_analysis[2].columns[0].sortMethod);
  });
  describe('forest_change_analysis - commodity_value_peat_level', () => {
    runSortTests(columns.commodity_analysis[2].columns[1].sortMethod);
  });
  describe('forest_change_analysis - commodity_value_protected_areas_level', () => {
    runSortTests(columns.commodity_analysis[2].columns[2].sortMethod);
  });
  describe('forest_change_analysis - commodity_value_overall_level', () => {
    runSortTests(columns.commodity_analysis[2].columns[2].sortMethod);
  });
});
