import Header from './Header';

const noHeaderPages = ['verify', 'forgot', 'reset', 'admin', 'select']; // TODO: use this and figure out who else does not want it:

function PageWithoutThemeProvider(props) {
  const { active, children } = props;
  return (
    <div className="app">
      {!noHeaderPages.includes(active) && <Header {...props} />}

      <div className="app__body">{children}</div>
      <div id="footerGfw" className={`${active === 'login' ? '' : 'hidden'}`} />
    </div>
  );
}

export default PageWithoutThemeProvider;
