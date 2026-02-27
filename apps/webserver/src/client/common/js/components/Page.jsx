import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from './Header';

const theme = createTheme({
  typography: {
    fontFamily: 'Fira Sans, sans-serif',
  },
});

const noHeaderPages = ['verify', 'forgot', 'reset', 'admin', 'select'];

function Page(props) {
  const { active, children } = props;
  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        {!noHeaderPages.includes(active) && <Header {...props} />}
        <div className="app__body">{children}</div>
        <div id="footerGfw" className={`${active === 'login' ? '' : 'hidden'}`} />
      </div>
    </ThemeProvider>
  );
}

export default Page;
