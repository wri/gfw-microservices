import { Component } from 'react';
import '../../../css/inlineLoader.scss';

export default class InlineLoader extends Component {
  render() {
    return (
      <div>
        <div className="inline-loader">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
}
