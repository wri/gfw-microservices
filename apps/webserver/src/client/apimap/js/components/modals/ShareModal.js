import ModalWrapper from './ModalWrapper';
import { toggleShareModal } from '../../actions/mapActions';
import store from '../../store';
import utils from '../../utils/AppUtils';
import { mapPage } from '../../../../common/js/config';
import React, { Component } from 'react';

const windowOptions = 'toolbar=0,status=0,height=650,width=450';

export default class ShareModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bitlyUrl: '',
      copyText: 'Copy',
    };
  }

  componentWillReceiveProps(nextProps) {
    const extentObj = nextProps.extent;
    this.setState({
      bitlyUrl: `https://${window.location.host}${window.location.pathname}?z=${
        extentObj.zoom
      }&x=${extentObj.center.lat.toFixed(2)}&y=${extentObj.center.lng.toFixed(2)}&b=${
        this.props.currentBasemap
      }&l=${this.props.visibleLayers.map((laya) => laya)}`,
    });
  }

  close = () => {
    this.setState({
      copyText: 'Copy',
    });
    store.dispatch(toggleShareModal());
  };

  copyShare() {
    const element = this.refs.shareInput;
    if (utils.copySelectionFrom(element)) {
      this.setState({ copyText: 'copied!' });
    } else {
      alert("The 'copy' option failed!");
    }
  }

  shareGoogle() {
    const url = mapPage.share.googleUrl(this.state.bitlyUrl);
    window.open(url, 'Google Plus', windowOptions);
  }

  shareFacebook() {
    const url = mapPage.share.facebookUrl(this.state.bitlyUrl);
    window.open(url, 'Facebook', windowOptions);
  }

  shareTwitter() {
    const url = mapPage.share.twitterUrl(this.state.bitlyUrl);
    window.open(url, 'Twitter', windowOptions);
  }

  handleFocus(e) {
    setTimeout(() => {
      if (e && e.target) {
        e.target.select();
      }
    }, 0);
  }

  render() {
    return (
      <ModalWrapper onClose={this.close} smallModal={true}>
        <div className="basemap-modal-content">
          <h3 className="modal-instructions-header">Share this view</h3>
          <div className="share-instructions">{mapPage.share.linkInstructions}</div>
          <div className="share-input">
            <input
              ref="shareInput"
              type="text"
              readOnly
              value={this.state.bitlyUrl}
              onClick={this.handleFocus}
            />
            <button className="gfw-btn white pointer" onClick={this.copyShare.bind(this)}>
              {this.state.copyText}
            </button>
          </div>
          <div className="share-items">
            <div
              title="Google Plus"
              className="share-card googleplus-modal pointer"
              onClick={this.shareGoogle.bind(this)}
            >
              <svg>
                <use xlinkHref="#icon-googleplus" />
              </svg>
            </div>
            <div
              title="Twitter"
              className="share-card twitter-modal pointer"
              onClick={this.shareTwitter.bind(this)}
            >
              <svg>
                <use xlinkHref="#icon-twitter" />
              </svg>
            </div>
            <div
              title="Facebook"
              className="share-card facebook-modal pointer"
              onClick={this.shareFacebook.bind(this)}
            >
              <svg>
                <use xlinkHref="#icon-facebook" />
              </svg>
            </div>
          </div>
        </div>
      </ModalWrapper>
    );
  }
}
