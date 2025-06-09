import { useEffect } from 'react';

import ModalWrapper from './ModalWrapper';
import '../../../../common/css/_irsBase.scss';
import '../../../../common/css/_irsStyle.scss';

export function CanopyModal({ id, sliderValue, onSliderChange, onClose }) {
  const values = [0, 10, 15, 20, 25, 30, 50, 75, 100];
  const fromIndex = values.indexOf(sliderValue);

  const sliderChanged = (data) => {
    onSliderChange(data.from_value);
  };

  useEffect(() => {
    if ($(`#tree-cover-slider-${id}`).ionRangeSlider) {
      $(`#tree-cover-slider-${id}`).ionRangeSlider({
        type: 'single',
        values,
        grid: true,
        grid_snap: true,
        hide_min_max: true,
        to_fixed: true,
        from_min: 1,
        from_max: 7,
        from: fromIndex,
        onFinish: sliderChanged,
        prettify: (value) => value + '%',
      });
    }
  }, []);

  return (
    <ModalWrapper onClose={onClose} theme="no-download">
      <div className="basemap-modal-content">
        <div className="canopy-modal-title">
          Adjust the minimum canopy density for tree cover and tree cover loss
        </div>
        <div className="trees">
          <div className="tree-icon" />
          <div className="forest-icon" />
        </div>
        <div className="slider-container">
          <input id={`tree-cover-slider-${id}`} />
        </div>
      </div>
    </ModalWrapper>
  );
}
