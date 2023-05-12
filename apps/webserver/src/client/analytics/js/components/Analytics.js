import Page from '../../../common/js/components/Page';
import React, { Component } from 'react';
import store from '../../../common/js/store';
import { viewCreated } from '../../../common/js/actions/commonActions';
import '../../css/analytics.scss';

const pageOptions = {
  links: {
    logout: true,
  },
};

export default class Analytics extends Component {
  constructor(props) {
    super(props);
    this.state = store.getState();
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(this.storeDidUpdate);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  storeDidUpdate = () => {
    this.setState(store.getState());
  };

  setViewReady = () => {
    store.dispatch(viewCreated());
  };

  render() {
    return (
      <Page links={pageOptions.links} active="analytics">
        <div onClick={this.setViewReady} className="analytics-title">
          Hello from the Analytics Page
        </div>
        <div>{this.state.viewReady ? 'viewww IS READY!!' : 'no view ready...'}</div>
      </Page>
    );
  }
}
