import React, { Component } from 'react';
import { aboutPage } from '../../common/js/config';
import Page from '../../common/js/components/Page';
import './About.scss';
import Button from '../../common/js/components/Button';

export default class About extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sectionList: ['About GFW Pro', 'History', 'Tutorials'],
      sectionOpen: 'About GFW Pro',
    };
  }

  selectedItem(listItem) {
    this.setState({ sectionOpen: listItem });
  }

  render() {
    const { sectionList, sectionOpen } = this.state;

    return (
      <Page>
        <div id="About" className="About page">
          <main>
            <div className="hero__gradient" />
            <div className="page-header">
              <h1 className="About__title page__title">{aboutPage.heroTitle}</h1>
              <p dangerouslySetInnerHTML={{ __html: aboutPage.heroDescription }} />
            </div>
          </main>

          <div className="page-body">
            <aside className="page-body__sidebar">
              <ul>
                {sectionList.map((listItem) => (
                  <li key={listItem} className={sectionOpen === listItem ? 'selected' : null}>
                    <button type="button" onClick={() => this.selectedItem(listItem)}>
                      {listItem}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
            <div className="page-body__content">
              <section
                className="about-gfw-pro"
                style={{ display: sectionOpen === 'About GFW Pro' ? 'block' : 'none' }}
              >
                <h3>{aboutPage.aboutTitle}</h3>
                <div dangerouslySetInnerHTML={{ __html: aboutPage.aboutDescription }} />
              </section>
              <section
                className="history"
                style={{ display: sectionOpen === 'History' ? 'block' : 'none' }}
              >
                <h3>{aboutPage.historyTitle}</h3>
                <div dangerouslySetInnerHTML={{ __html: aboutPage.historyDescription }} />
              </section>
              <section
                className="tutorials"
                style={{ display: sectionOpen === 'Tutorials' ? 'block' : 'none' }}
              >
                <h3>{aboutPage.tutorialsTitle}</h3>
                <p>
                  Global Forest Watch PRO offers a wide range of content and capabilities to serve a
                  variety of users and purposes. Whether you arrive at GFW Pro with a clear purpose
                  or are simply exploring different features, we can help you learn to use the
                  platform.
                </p>
                <p>
                  Visit our
                  <a
                    href="https://www.globalforestwatch.org/help/gfw-pro/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Help Center
                  </a>
                  to see all tutorials.
                </p>
              </section>
            </div>
          </div>
        </div>
      </Page>
    );
  }
}
