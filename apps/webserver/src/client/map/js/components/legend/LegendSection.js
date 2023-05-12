import React, {Component} from 'react';

export default class LegendSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPanel: true
    };
  }

  togglePanel = () => {
    this.setState({showPanel: !this.state.showPanel});
  }

  render () {
    const {visible, layers, createLayerLegend, sectionHeader, text} = this.props;
    const {showPanel} = this.state;
    return (
      <div className={`${sectionHeader}-legend legend-country-container ${visible ? '' : 'hidden'}`}>
        <div className={`legend-header legend-show-panel ${sectionHeader}-header`} onClick={this.togglePanel}>
          {text}<svg className={showPanel ? '' : 'close'}><use xlinkHref='#icon-triangle' /></svg>
        </div>
        <div className={showPanel ? '' : 'hidden'}>
          {layers.filter(l => l.legendConfig.type !== 'disabled').map(createLayerLegend)}
        </div>
      </div>
    );
  }
}
