import { useState, useEffect, useMemo, useCallback, JSX } from 'react';

// Third-party libraries
import { Carousel } from 'react-responsive-carousel';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

// Internal components
import PageWithoutThemeProvider from '../../../common/js/components/PageWithoutThemeProvider';
import GDPRFooter from '../../../common/js/components/GDPRFooter';

// Utils and data
import loginStrings from './loginStrings';

// Video assets
import gfwHeroVideo from '../../images/gfw_pro_hero_video.mp4';
import gfwInAction from '../../images/gfw_pro_in_action.mp4';
import gfwInActionEs from '../../images/gfw_pro_in_action_es_test.mp4';

// Image assets - actively used
import gwfInActionPoster from '../../images/gfw_pro_in_action_poster.jpg';
import iconArrowRight from '../../images/shape-arrow-right.svg';

// Image assets - required for webpack bundling (referenced in CSS/external files)
// These imports ensure webpack includes these assets in the build output
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import gfwHeroPoster from '../../images/gfw_pro_hero_poster.jpg';
import iconCompliance from '../../images/icon-lg-compliance.svg';
import iconMonitor from '../../images/icon-lg-monitor.svg';
import iconShare from '../../images/icon-lg-share.svg';
import photoAlexandra from '../../images/headshot_alexandra_experton.jpg';
import photoBanker from '../../images/banker.jpg';
import photoConsumerGoods from '../../images/consumer-goods.jpg';
import photoKarimah from '../../images/headshot_karimah_hudda.jpg';
import photoLuiz from '../../images/headshot_luiz_gabriel_todt_de_azevedo.jpg';
import photoMoray from '../../images/headshot_moray_mcleish.jpg';
import photoPlaceholder from '../../images/testimonial-placeholder.svg';
import photoProducer from '../../images/producer.jpg';
import photoTrader from '../../images/trader.jpg';
/* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */

// Configuration constants
const LOGIN_CONFIG = {
  SUPPORT_EMAIL: 'GFWPROsupport@wri.org',
  EMAIL_SUBJECT: 'GFW Pro Information Request',
  EMAIL_BODY_TEMPLATE:
    'Thank you for your interest in Global Forest Watch Pro. Please provide your request for additional information below, you will receive a reply within 2 business days.',
  EXTERNAL_URLS: {
    DEMO_VIDEO: 'https://youtu.be/aQwGiuJEfhc',
  },
};

export default function Login(): JSX.Element {
  const [videoHidden, setVideoHidden] = useState<boolean>(false);
  const [languageCode, setLanguageCode] = useState<string>('en');
  const [activeRole, setActiveRole] = useState<string>('banker');

  useEffect(() => {
    const storedLanguageCode = localStorage.getItem('txlive:selectedlang');
    if (storedLanguageCode) {
      setLanguageCode(storedLanguageCode);
    }
  }, []);

  const changeRole = useCallback((role: string) => {
    setActiveRole(role);
  }, []);

  const requestDemo = useCallback(() => {
    window.open(loginStrings.moreInfo.help.link, '_blank');
  }, []);

  const requestMoreInfo = useCallback(() => {
    const mailToLink = `mailto:${LOGIN_CONFIG.SUPPORT_EMAIL}?subject=${
      LOGIN_CONFIG.EMAIL_SUBJECT
    }&body=${encodeURIComponent(LOGIN_CONFIG.EMAIL_BODY_TEMPLATE)}`;
    window.location.href = mailToLink;
  }, []);

  const signUpForPro = useCallback(() => {
    window.location.href = '/account';
  }, []);

  // Memoized computed values
  const feats = useMemo(
    () =>
      loginStrings.appFeatures.features.map((actionItem) => (
        <div key={actionItem.text} className="application-features__item">
          <div className="application-features__image">
            <img src={actionItem.image} alt="" />
          </div>
          <div className="application-features__text">{actionItem.text}</div>
        </div>
      )),
    []
  );

  const { subsections } = loginStrings.monitorSection;
  const activeSection = useMemo(
    () => subsections.find((section) => section.id === activeRole),
    [activeRole, subsections]
  );
  const isEnglishLanguage = languageCode === 'en';

  // Select appropriate video source based on language
  const videoSource = isEnglishLanguage ? gfwInAction : gfwInActionEs;

  return (
    <PageWithoutThemeProvider active="login">
      <div className={`hero videoHidden-${videoHidden}`}>
        <div className="hero__content container">
          <div className="hero__title">
            <h1
              className="hero__title__text"
              style={{ fontSize: '3rem' }}
              dangerouslySetInnerHTML={{ __html: loginStrings.appTitleText }}
            />
          </div>
          <div className="hero__buttons">
            <div className="button-group">
              <button onClick={signUpForPro} className="button button--primary">
                {loginStrings.appRequestAccount}
              </button>
              <button onClick={requestDemo} className="button button--secondary">
                {loginStrings.appLearnMore}
              </button>
            </div>
            <button
              onClick={() => setVideoHidden(!videoHidden)}
              className="button button--secondary button--stop"
            >
              {videoHidden ? 'Start Video' : 'Stop Video'}
            </button>
          </div>
        </div>
        <div className="hero__gradient" />
        <div className="hero__background">
          <video className="hero__video" loop autoPlay muted>
            <source src={gfwHeroVideo} />
          </video>
        </div>
      </div>

      <div className="main-body__content container">
        <section className="login__why__section">
          <div className="login__why__section__left">
            <div className="split">
              <div className="split__left">
                <h2 className="login__why__title">{loginStrings.whyGfwPro.title}</h2>
                <p className="login__why__header">{loginStrings.appFeatures.title}</p>
              </div>
            </div>
            <div className="application-features__container split">
              <div className="split__right">
                {feats}
                <div className="button-group button-group--second-schedule">
                  <button onClick={requestDemo} className="button">
                    {loginStrings.appLearnMore}
                  </button>
                </div>
              </div>
              <div className="split__left">
                <video className="login__why__section__video" poster={gwfInActionPoster} controls>
                  <source src={videoSource} />
                </video>
              </div>
            </div>
          </div>
        </section>
        <section className="login__user__section">
          <h2 className="main-description">{loginStrings.monitorSectionTitle}</h2>
        </section>
      </div>

      <section className="tool-highlight__section">
        <div className="container">
          <div className="split">
            <div className="tools-highlight__container split__left">
              <div className="role-highlight__container">
                {subsections.map((item) => (
                  <div key={item.title}>
                    <div
                      className={`role-highlight__item ${
                        activeRole === item.id ? 'active-role' : ''
                      }`}
                      onClick={() => changeRole(item.id)}
                    >
                      <div className="role-icon">
                        <span className="role-icon-image">
                          <svg className="svg-icon role-icon-svg">
                            <use xlinkHref="#icon-profile" />
                          </svg>
                        </span>
                      </div>
                      <h4 className="role-highlight__title">{item.title}</h4>
                      <img
                        className="role-highlight__arrow"
                        src={iconArrowRight}
                        alt="Arrow icon"
                      />
                    </div>
                    <div className="accordion">
                      {activeRole === item.id && (
                        <div
                          className="accordion__image"
                          style={{ backgroundImage: `url(${activeSection.image})` }}
                        />
                      )}
                      {activeRole === item.id &&
                        activeSection.descriptions.map((itemHighLight) => (
                          <div className="tool-highlight__item" key={itemHighLight.description}>
                            <div className="tool-highlight__item-content">
                              <h3 className="tool-highlight__title">{itemHighLight.title}</h3>
                              <p className="tool-highlight__description">
                                {itemHighLight.description}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="tool-highlight__container">
                {activeRole &&
                  activeSection.descriptions.map((item) => (
                    <div className="tool-highlight__item" key={item.title}>
                      <div className="tool-highlight__item-content">
                        <h3 className="tool-highlight__title">{item.title}</h3>
                        <p className="tool-highlight__description">{item.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div
              className="role-highlight__image-container split__right"
              style={{ backgroundImage: `url(${activeRole && activeSection.image})` }}
            />
          </div>
        </div>
      </section>

      <section id="LoginCarousel" className="quote__section">
        <h2 className="main-description">{loginStrings.quoteTitle}</h2>
        <Carousel showStatus={false} showThumbs={false} centerMode infiniteLoop swipeable={false}>
          {loginStrings.quotes.map((item) => (
            <div className="quote" key={item.image}>
              <div className="quote__container">
                <div className="quote__image-container">
                  <img className="quote__image" src={item.image} alt={`item image ${item.image}`} />
                </div>
                <div>
                  <span className="quote__name">{item.name}</span> •{' '}
                  <span className="quote__organization">{item.organization}</span>
                </div>
                <div className="quote__title">{item.title}</div>
                <div className="quote__text">{item.text}</div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>
      <section className="more-info__section">
        <div className="split">
          <div className="split__left">
            <p>{loginStrings.moreInfo.help.paragraphText}</p>
            <button type="button" onClick={requestMoreInfo} className="button button--secondary">
              {loginStrings.moreInfo.help.buttonText}
            </button>
          </div>
          <div className="split__right">
            <p>{loginStrings.moreInfo.subscribe.paragraphText}</p>
            <a
              href={loginStrings.moreInfo.subscribe.link}
              target="_blank"
              className="button button--secondary"
            >
              <LinkedInIcon /> {loginStrings.moreInfo.subscribe.buttonText}
            </a>
          </div>
        </div>
      </section>
      <GDPRFooter variant="login" />
    </PageWithoutThemeProvider>
  );
}
