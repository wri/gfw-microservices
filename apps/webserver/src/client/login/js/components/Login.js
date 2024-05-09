import React, { Component } from 'react';
import { Carousel } from 'react-responsive-carousel';
import Dialog from 'material-ui/Dialog';
import { loginPage } from '../../../common/js/config';
import { PrivacyPolicyBanner } from './PrivacyPolicyBanner';
import Button from '../../../common/js/components/Button';
import httpRequest from '../../../common/js/utils/httpRequest';
import Page from '../../../common/js/components/Page';
import gfwHeroVideo from '../../images/gfw_pro_hero_video.mp4';
import gfwInAction from '../../images/gfw_pro_in_action.mp4';
import gfwInActionEs from '../../images/gfw_pro_in_action_es_test.mp4';
import gwfInActionPoster from '../../images/gfw_pro_in_action_poster.jpg';
import iconArrowRight from '../../images/shape-arrow-right.svg';
import gwfHeroPoster from '../../images/gfw_pro_hero_poster.jpg';
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
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

export default class Login extends Component {
  constructor(props) {
    super(props);

    const storageEmail = window.sessionStorage.getItem('gfwproUserEmail');

    this.state = {
      loginError: false,
      dialogOpen: false,
      rememberMe: false,
      videoHidden: false,
      languageCode: 'en',
      username: storageEmail || '',
      password: '',
      activeRole: 'banker',
      dialogTitle: '',
      dialogMessage: '',
      moreOpen: false,
      myGfwOpen: false,
    };
  }

  componentDidMount() {
    // If url ends with `?login`, automatically open "My GFW Pro" login popover
    const loginParameter = this.getUrlParameter('login');
    if (loginParameter === 'true') {
      this.setState({ myGfwOpen: true });
    }
    const languageCode = localStorage.getItem('txlive:selectedlang');
    if (languageCode) {
      this.setState({ languageCode });
    }
  }

  getUrlParameter = (name) => {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  forgotPassword = () => {
    window.location.href = '/forgot';
  };

  handleKeyPress = (evt) => {
    if (evt.key === 'Enter') {
      this.signIn();
    }
  };

  updateUsername = (evt) => {
    this.setState({
      username: evt.target.value,
    });
  };

  updatePassword = (evt) => {
    this.setState({
      password: evt.target.value,
    });
  };

  rememberMe = () => {
    const { rememberMe } = this.state;
    this.setState({
      rememberMe: !rememberMe,
    });
  };

  changeRole = (role) => {
    this.setState({
      activeRole: role,
    });
  };

  requestDemo = () => {
    window.open(loginPage.moreInfo.help.link, '_blank');
  };

  requestMoreInfo = () => {
    const formattedBody =
      'Thank you for your interest in Global Forest Watch Pro. Please provide your request for additional information below, you will receive a reply within 2 business days.';
    const mailToLink = `mailto:GFWPROsupport@wri.org?subject=GFW Pro Information Request&body=${encodeURIComponent(
      formattedBody
    )}`;
    window.location.href = mailToLink;
  };

  signIn = () => {
    const { username, password, rememberMe } = this.state;

    if (rememberMe) {
      window.sessionStorage.setItem('gfwproUserEmail', username);
    }
    const body = {
      username,
      password,
    };
    httpRequest
      .fetchJSON('/auth/signinpost', body)
      .then((response) => {
        switch (response) {
          case 'RequireNewPassword':
            window.location.href = '/change';
            break;
          case 'ConfirmPassword':
            window.location.href = '/forgot';
            break;
          case 'Authenticated':
            window.location.href = '/verify';
            break;
          case 'ForceReset':
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Too many incorrect log in attempts',
              dialogMessage:
                'Your password has expired. Please click “Forgot Password?” to reset your password and log in.',
              password: '',
            });
            break;
          case 'ResetRequired':
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Reset Password',
              dialogMessage:
                'Your password has expired. Please click “Forgot Password?” to reset your password and log in.',
              password: '',
            });
            break;
          case 'PasswordExpired':
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Reset Password',
              dialogMessage:
                'Your password has expired. Please click “Forgot Password?” to reset your password and log in.',
              password: '',
            });
            break;
          case 'ResendPassword':
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Password has expired',
              dialogMessage: 'Please check your email for a new temporary password.',
              password: '',
            });
            break;
          default:
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Incorrect username or password entered',
              dialogMessage: 'Click “Forgot Password?” to reset password.',
              password: '',
            });
        }
      })
      .catch((err) => {
        console.log('Reject', err);
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Unable to login',
          dialogMessage: 'Failed to authenticate user.',
        });
      });
  };

  signUpForPro = () => {
    window.location.href = '/account';
  };

  createActions = (actions) => {
    const actionItems = actions.map((actionItem) => {
      return (
        <div key={actionItem.description} className="login__why__section__action">
          <button
            onClick={() => (actionItem.requestDemo ? this.requestDemo() : null)}
            className={`button login__why__section__action__title ${
              actionItem.requestDemo ? 'pointer' : ''
            }`}
          >
            {actionItem.description} »
          </button>
          {actionItem.action ? (
            <a
              target="_blank"
              className="login__why__section__action__go"
              href="https://youtu.be/aQwGiuJEfhc"
              rel="noreferrer"
            >
              {actionItem.action} »
            </a>
          ) : null}
        </div>
      );
    });
    return actionItems;
  };

  createFeats = (features) => {
    const feats = features.map((actionItem) => {
      return (
        <div key={actionItem.text} className="application-features__item">
          <div className="application-features__image">
            <img src={actionItem.image} />
          </div>
          <div className="application-features__text">{actionItem.text}</div>
        </div>
      );
    });
    return feats;
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  onLanguageChange = (language) => {
    this.setState({ languageCode: language.selectedLanguage.code });
  };

  render() {
    const {
      dialogOpen,
      dialogTitle,
      dialogMessage,
      videoHidden,
      activeRole,
      rememberMe,
      loginError,
      username,
      password,
      moreOpen,
      myGfwOpen,
    } = this.state;
    const feats = this.createFeats(loginPage.appFeatures.features);
    const actions = this.createActions(loginPage.actions);
    const { subsections } = loginPage.monitorSection;
    const { languageCode } = this.state;
    const activeSection = subsections.filter((section) => section.id === activeRole)[0];
    const isEnglishLanguage = languageCode === 'en';

    return (
      <Page active="login">
        <Dialog
          paperClassName="dialog-paper"
          title={dialogTitle}
          actions={[
            <Button
              variant="primary"
              label="OK"
              className="login-ok-button"
              onClick={this.handleDialogClose}
            />,
          ]}
          modal={false}
          open={dialogOpen}
          onRequestClose={this.handleDialogClose}
          children={
            <div
              className="dialog-content-email"
              dangerouslySetInnerHTML={{ __html: dialogMessage }}
            />
          }
        />
        <div className={`hero videoHidden-${videoHidden}`}>
          <div className="hero__content container">
            <div className="hero__title">
              <h1
                className="hero__title__text"
                style={{ fontSize: '3rem' }}
                dangerouslySetInnerHTML={{ __html: loginPage.appTitleText }}
              />
            </div>
            <div className="hero__buttons">
              <div className="button-group">
                <button onClick={this.signUpForPro} className="button button--primary">
                  {loginPage.appRequestAccount}
                </button>
                <button onClick={() => this.requestDemo()} className="button button--secondary">
                  {loginPage.appLearnMore}
                </button>
              </div>
              <button
                onClick={() => this.setState({ videoHidden: !videoHidden })}
                className="button button--secondary button--stop"
              >
                {videoHidden ? 'Start Video' : 'Stop Video'}
              </button>
            </div>
          </div>
          <div className="hero__gradient" />
          <div className="hero__background">
            <video className="hero__video" loop autoPlay muted ref="vidRef">
              <source src={gfwHeroVideo} />
            </video>
          </div>
        </div>

        <div className="main-body__content container">
          <section className="login__why__section">
            <div className="login__why__section__left">
              <div className="split">
                <div className="split__left">
                  <h2 className="login__why__title">{loginPage.whyGfwPro.title}</h2>
                  <p className="login__why__header">{loginPage.appFeatures.title}</p>
                </div>
              </div>
              <div className="application-features__container split">
                <div className="split__right">
                  {feats}
                  <div className="button-group button-group--second-schedule">
                    <button onClick={() => this.requestDemo()} className="button">
                      {loginPage.appLearnMore}
                    </button>
                  </div>
                </div>
                <div className="split__left">
                  {isEnglishLanguage && (
                    <video
                      className="login__why__section__video"
                      poster={gwfInActionPoster}
                      controls
                    >
                      <source src={gfwInAction} />
                    </video>
                  )}
                  {!isEnglishLanguage && (
                    <video
                      className="login__why__section__video"
                      poster={gwfInActionPoster}
                      controls
                    >
                      <source src={gfwInActionEs} />
                    </video>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'none' }} className="login__why__section__right">
              {actions}
            </div>
          </section>
          <section className="login__user__section">
            <h2 className="main-description">{loginPage.monitorSectionTitle}</h2>
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
                        onClick={() => this.changeRole(item.id)}
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
          <h2 className="main-description">{loginPage.quoteTitle}</h2>
          <Carousel showStatus={false} showThumbs={false} centerMode infiniteLoop swipeable={false}>
            {loginPage.quotes.map((item) => (
              <div className="quote" key={item.image}>
                <div className="quote__container">
                  <div className="quote__image-container">
                    <img
                      className="quote__image"
                      src={item.image}
                      alt={`item image ${item.image}`}
                    />
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
              <p>{loginPage.moreInfo.help.paragraphText}</p>
              <button
                type="button"
                onClick={() => this.requestMoreInfo()}
                className="button button--secondary"
              >
                {loginPage.moreInfo.help.buttonText}
              </button>
            </div>
            <div className="split__right">
              <p>{loginPage.moreInfo.subscribe.paragraphText}</p>
              <a
                href={loginPage.moreInfo.subscribe.link}
                target="_blank"
                className="button button--secondary"
              >
                <LinkedInIcon /> {loginPage.moreInfo.subscribe.buttonText}
              </a>
            </div>
          </div>
        </section>
        <PrivacyPolicyBanner />
      </Page>
    );
  }
}
