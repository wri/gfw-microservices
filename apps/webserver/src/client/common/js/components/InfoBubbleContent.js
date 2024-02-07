// import {locationsPage} from 'common/js/config';
import React, { Component } from 'react';
import { marked } from 'marked';
import '../../../locations/css/diagnosticsBubble.scss';

const stylesheet = {
  closeIconContainer: {
    display: 'flex',
    paddingRight: '10px',
    height: '35px',
    float: 'right',
  },
  closeIcon: {
    cursor: 'pointer',
    fill: '#404041',
    height: '26px',
    width: '26px',
  },
};

export default class InfoBubbleContent extends Component {
  render() {
    const { bubbleData, closeBubble } = this.props;

    const closeIconContainerStyle = stylesheet.closeIconContainer;
    const closeIconContainer = stylesheet.closeIcon;

    return (
      <div className="locations-diagnostics-bubble-view-container">
        <div
          title="close"
          style={closeIconContainerStyle}
          className="app__modal-close-icon-container"
        >
          <svg
            viewBox="0 0 25 25"
            style={closeIconContainer}
            onClick={closeBubble}
            className="app_modal-close-icon"
          >
            <title>Close</title>
            <path d="M 5 19 L 19 5 L 21 7 L 7 21 L 5 19 ZM 7 5 L 21 19 L 19 21 L 5 7 L 7 5 Z" />
          </svg>
        </div>
        <div className="locations-diagnostics-bubble-view">
          <h3 className="bubble-title">{bubbleData.Title}</h3>
          {bubbleData['Why this Analysis?'] ? <h4>Why this Analysis?</h4> : null}
          {bubbleData['Why this Analysis?'] ? (
            <p dangerouslySetInnerHTML={{ __html: marked(bubbleData['Why this Analysis?']) }}></p>
          ) : null}

          {bubbleData['What this Section Explains'] ? <h4>What this Section Explains</h4> : null}
          {bubbleData['What this Section Explains'] ? (
            <p
              dangerouslySetInnerHTML={{ __html: marked(bubbleData['What this Section Explains']) }}
            ></p>
          ) : null}

          {bubbleData["How it's Calculated"] ? <h4>How it's Calculated</h4> : null}
          {bubbleData["How it's Calculated"] ? (
            <p dangerouslySetInnerHTML={{ __html: marked(bubbleData["How it's Calculated"]) }}></p>
          ) : null}

          {bubbleData.Notes ? <h4>Notes</h4> : null}
          {bubbleData.Notes ? (
            <p dangerouslySetInnerHTML={{ __html: marked(bubbleData.Notes) }}></p>
          ) : null}
        </div>
      </div>
    );
  }
}
