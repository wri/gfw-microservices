import React from 'react';
import Page from '../../common/js/components/Page';
import './More.scss';

function More({ languageCode, userGuideLink }) {
  return (
    <Page active="select" languageCode={languageCode} userGuideLink={userGuideLink}>
      <div id="More" className="More page">
        <header>
          <div className="page-header">
            <h3>OTHER APPLICATIONS</h3>
            <ul className="More__list-icons">
              <li className="box gfw-global">
                <a href="http://www.globalforestwatch.org/" target="_blank" rel="noreferrer" />
              </li>
              <li className="box gfw-watcher">
                <a href="http://forestwatcher.globalforestwatch.org/" target="_blank" rel="noreferrer" />
              </li>
              <li className="box map-builder">
                <a href="https://mapbuilder.wri.org/" target="_blank" rel="noreferrer" />
              </li>
              <li className="box --last">
                <a href="https://www.wri.org/data" target="_blank" rel="noreferrer">
                  <span className="icon-dots" />
                  <span className="last-text">EXPLORE ALL APPS</span>
                </a>
              </li>
            </ul>
            <h1 className="More__title page__title">MORE IN GFW</h1>
          </div>
        </header>

        <div className="page-body">
          <div className="page-body__content">
            <ul className="More__list">
              <li>
                <a href={userGuideLink} target="_blank" rel="noreferrer">
                  <i className="icon help" />
                  Help Center
                </a>
              </li>
              <li>
                <a href="https://blog.globalforestwatch.org/" target="_blank" rel="noreferrer">
                  <i className="icon book" />
                  BLOG
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Page>
  );
}

export default More;
