import React, { useState } from 'react';
import { aboutPage } from '../../common/js/config';
import Page from '../../common/js/components/Page';
import './About.scss';

const SECTION_LIST = ['About GFW Pro', 'Fees', 'History', 'Tutorials'];

export default function About() {
  const [sectionOpen, setSectionOpen] = useState('About GFW Pro');

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
              {SECTION_LIST.map((listItem) => (
                <li key={listItem} className={sectionOpen === listItem ? 'selected' : null}>
                  <button type="button" onClick={() => setSectionOpen(listItem)}>
                    {listItem}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <div className="page-body__content">
            {sectionOpen === 'About GFW Pro' && (
              <section className="about-gfw-pro">
                <h3>{aboutPage.aboutTitle}</h3>
                <div dangerouslySetInnerHTML={{ __html: aboutPage.aboutDescription }} />
              </section>
            )}
            {sectionOpen === 'Fees' && (
              <section className="fees">
                <h3>{aboutPage.feesTitle}</h3>
                {aboutPage.feesDescription.map((paragraph) => {
                  return <p dangerouslySetInnerHTML={{ __html: paragraph }} />;
                })}
              </section>
            )}
            {sectionOpen === 'History' && (
              <section className="history">
                <h3>{aboutPage.historyTitle}</h3>
                <div dangerouslySetInnerHTML={{ __html: aboutPage.historyDescription }} />
              </section>
            )}
            {sectionOpen === 'Tutorials' && (
              <section className="tutorials">
                <h3>{aboutPage.tutorialsTitle}</h3>
                <p>{aboutPage.tutorialsDescription}</p>
                <p>
                  Visit our{' '}
                  <a
                    href="https://www.globalforestwatch.org/help/gfw-pro/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Help Center
                  </a>{' '}
                  to see all tutorials.
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
