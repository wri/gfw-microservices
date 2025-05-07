import columns from './columns';
import {
  ActiveLocationOne,
  ActiveLocationTwo,
  PendingLocation,
} from '../../../locations/tests/mockedData';
import { sortOrderOption } from '../../../locations/js/utils/locationsTableUtils';

const runSortTests = (sortMethod) => {
  describe('sortMethod', () => {
    it('should return area diference when both status are active', () => {
      const response = sortMethod(ActiveLocationOne, ActiveLocationTwo);
      expect(response).toBe(2);
    });

    it('should return same value when both status locations are not active', () => {
      const response = sortMethod(PendingLocation, PendingLocation);
      expect(response).toBe(sortOrderOption.sameValue);
    });

    it('should keep same order when just first status locations is active', () => {
      const response = sortMethod(ActiveLocationOne, PendingLocation);
      expect(response).toBe(sortOrderOption.keep);
    });

    it('should invert order when just second status locations is active', () => {
      const response = sortMethod(PendingLocation, ActiveLocationOne);
      expect(response).toBe(sortOrderOption.invert);
    });
  });
};
describe('columns', () => {
  describe('forest_change_analysis - tree_cover_extent_total', () => {
    runSortTests(columns.forest_change_analysis[0].sortMethod);
  });

  describe('forest_change_analysis - tree_cover_loss_total_yearly', () => {
    runSortTests(columns.forest_change_analysis[1].columns[0].sortMethod);
  });

  describe('forest_change_analysis - tree_cover_loss_protected_areas_yearly', () => {
    runSortTests(columns.forest_change_analysis[1].columns[1].sortMethod);
  });
});
