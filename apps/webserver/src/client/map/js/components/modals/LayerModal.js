import ModalWrapper from './ModalWrapper';
import { showLayerInfo, getLayerInfo } from '../../actions/mapActions';
import store from '../../store';
import React, { Component } from 'react';

export default class Modal extends Component {
  renderMetadata(info) {
    if (info.copyrightText && !info.license) {
      info.license = info.copyrightText;
    } else if (info.licenseInfo && !info.license) {
      info.license = info.licenseInfo;
    }
    return (
      <div className="layer-modal-content">
        <div className="source-header">
          <h2 className="source-title">{!info.title ? info.name : info.title}</h2>
          <h3 className="source-subtitle">{info.subtitle}</h3>
        </div>
        <div className="source-body">
          <div className="source-table">
            {!info.function ? null : this.tableMap('FUNCTION', info.function)}
            {!info.description ? null : this.tableMap('DESCRIPTION', info.description)}
            {!info.resolution ? null : this.tableMap('RESOLUTION / SCALE', info.resolution)}
            {!info.geographic_coverage
              ? null
              : this.tableMap('GEOGRAPHIC COVERAGE', info.geographic_coverage)}
            {!info.source ? null : this.tableMap('SOURCE', info.source)}
            {!info.frequency_of_updates
              ? null
              : this.tableMap('FREQUENCY OF UPDATES', info.frequency_of_updates)}
            {!info.date_of_content ? null : this.tableMap('DATE OF CONTENT', info.date_of_content)}
            {!info.cautions ? null : this.tableMap('CAUTIONS', info.cautions)}
            {!info.license ? null : this.tableMap('LICENSE', info.license)}
          </div>
          {!info.overview ? null : (
            <div className="source-summary">
              <h3>OVERVIEW</h3>
              <div dangerouslySetInnerHTML={{ __html: info.overview }} />
            </div>
          )}
          {!info.citation ? null : (
            <div className="source-credits">
              <h4>CITATION:</h4>
              <div dangerouslySetInnerHTML={{ __html: info.citation }} />
            </div>
          )}
          {!info.learn_more ? null : (
            <div className="source-learn-more flex">
              <a
                href={info.learn_more}
                className="source-learn-more-link fa-button white"
                target="_blank"
              >
                LEARN MORE
              </a>
            </div>
          )}
        </div>
        {!info.download_data ? null : (
          <div className="source-footer">
            <a href={info.download_data} className="source-download fa-button gold" target="_blank">
              DOWNLOAD DATA
            </a>
          </div>
        )}
      </div>
    );
  }

  tableMap(label, content) {
    return (
      <dl className="source-row">
        <dt>{label}</dt>
        <dd dangerouslySetInnerHTML={{ __html: content }}></dd>
      </dl>
    );
  }

  close = () => {
    document.getElementById('modal-content-id').scrollTop = 0;
    store.dispatch(showLayerInfo({}));
    store.dispatch(getLayerInfo(''));
  };

  render() {
    const { info } = this.props;
    const theme = info && info.download_data ? '' : 'no-download';
    const content = !info ? (
      <div className="no-info-available">NO_INFO</div>
    ) : (
      this.renderMetadata(info)
    );

    return (
      <ModalWrapper onClose={this.close} theme={theme}>
        {content}
      </ModalWrapper>
    );
  }
}
