// import Page from 'common/js/components/Page';
import React, { Component } from 'react';
// import store from 'common/js/store';
// import {viewCreated} from 'common/js/actions/commonActions';
import '../../css/manager.scss';

// const pageOptions = {
//   links: {
//     logout: true
//   }
// };

export default class Manager extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = store.getState();
  //   console.log('initialState', this.state);
  // }
  //
  // componentDidMount() {
  //   this.unsubscribe = store.subscribe(this.storeDidUpdate);
  // }
  //
  // componentWillUnmount() {
  //   this.unsubscribe();
  // }
  //
  // storeDidUpdate:Function = () => {
  //   console.log('updated!!!', store.getState());
  //   this.setState(store.getState());
  // };
  //
  // setViewReady = () => {
  //   store.dispatch(viewCreated(false));
  // }

  render() {
    return (
      <div onClick={this.setViewReady} className="manager-title">
        Hello from the Manager Page
      </div>
    );
  }
}
