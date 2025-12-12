import { useState, useEffect } from 'react';
import aboutStrings from './aboutStrings';
import PageWithoutThemeProvider from '../../common/js/components/PageWithoutThemeProvider';
import { useQuery } from '../../common/js/hooks';
import { useLocation, useHistory } from 'react-router-dom';
import './About.scss';

const SECTION_LIST = ['About GFW Pro', 'Fees', 'History', 'Tutorials'];

export default function About() {
  const query = useQuery();
  const location = useLocation();
  const history = useHistory();
  const [sectionOpen, setSectionOpen] = useState(query.get('section') || 'About GFW Pro');

  useEffect(() => {
    const sectionParam = new URLSearchParams(location.search).get('section');
    if (sectionParam && SECTION_LIST.includes(sectionParam)) {
      setSectionOpen(sectionParam);
    }
  }, [location.search]);

  const handleTabClick = (section) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('section', section);
    history.replace({ search: searchParams.toString() });
  };

  return (
    <PageWithoutThemeProvider>
      <div id="About" className="About page">
        <main>
          <div className="hero__gradient" />
          <div className="page-header">
            <h1 className="About__title page__title">{aboutStrings.heroTitle}</h1>
            <p dangerouslySetInnerHTML={{ __html: aboutStrings.heroDescription }} />
          </div>
        </main>

        <div className="page-body">
          <aside className="page-body__sidebar">
            <ul>
              {SECTION_LIST.map((section) => (
                <li key={section} className={sectionOpen === section ? 'selected' : null}>
                  <button type="button" onClick={() => handleTabClick(section)}>
                    {section}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <div className="page-body__content">
            {sectionOpen === 'About GFW Pro' && (
              <section className="about-gfw-pro">
                <h3>{aboutStrings.aboutTitle}</h3>
                <div dangerouslySetInnerHTML={{ __html: aboutStrings.aboutDescription }} />
              </section>
            )}
            {sectionOpen === 'Fees' && (
              <section className="fees">
                <h3>{aboutStrings.feesTitle}</h3>
                {aboutStrings.feesDescription.map((paragraph) => {
                  return <p dangerouslySetInnerHTML={{ __html: paragraph }} />;
                })}
              </section>
            )}
            {sectionOpen === 'History' && (
              <section className="history">
                <h3>{aboutStrings.historyTitle}</h3>
                <div dangerouslySetInnerHTML={{ __html: aboutStrings.historyDescription }} />
              </section>
            )}
            {sectionOpen === 'Tutorials' && (
              <section className="tutorials">
                <h3>{aboutStrings.tutorialsTitle}</h3>
                <p>{aboutStrings.tutorialsDescription}</p>
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
    </PageWithoutThemeProvider>
  );
}
