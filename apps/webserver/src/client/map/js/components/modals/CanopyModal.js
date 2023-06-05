import ModalWrapper from './ModalWrapper';
import { toggleCanopyModal, updateCanopyDensity } from '../../actions/mapActions';
import store from '../../store';
import '../../../../common/css/_irsBase.scss';
import '../../../../common/css/_irsStyle.scss';
import React, { Component } from 'react';

export default class CanopyModal extends Component {
  componentDidMount() {
    if ($('#tree-cover-slider').ionRangeSlider) {
      $('#tree-cover-slider').ionRangeSlider({
        type: 'single',
        values: [0, 10, 15, 20, 25, 30, 50, 75, 100],
        grid: true,
        grid_snap: true,
        hide_min_max: true,
        to_fixed: true,
        from_min: 1,
        from_max: 7,
        from: 5,
        onFinish: this.sliderChanged,
        prettify: (value) => value + '%',
      });
    }
  }

  sliderChanged = (data) => {
    store.dispatch(updateCanopyDensity(data.from_value));
  };

  close = () => {
    document.getElementById('modal-content-id').scrollTop = 0;
    store.dispatch(toggleCanopyModal());
  };

  render() {
    return (
      <ModalWrapper onClose={this.close} theme="no-download">
        <div className="basemap-modal-content">
          <div className="canopy-modal-title">
            Adjust the minimum canopy density for tree cover and tree cover loss
          </div>
          <div className="trees">
            <div className="tree-icon" />
            <div className="forest-icon" />
          </div>
          <div className="slider-container">
            <input id="tree-cover-slider" />
          </div>
        </div>
      </ModalWrapper>
    );
  }
}
