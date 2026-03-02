import Header from './Header';
import { ThemeProvider } from '../../../styles/ThemeProvider';

const noHeaderPages = ['verify', 'forgot', 'reset', 'admin', 'select'];

function Page(props) {
  const { active, children } = props;
  return (
    <ThemeProvider>
      <div className="app">
        {!noHeaderPages.includes(active) && <Header {...props} />}
        <div className="app__body">{children}</div>
        <div id="footerGfw" className={`${active === 'login' ? '' : 'hidden'}`} />
      </div>
    </ThemeProvider>
  );
}

export default Page;
