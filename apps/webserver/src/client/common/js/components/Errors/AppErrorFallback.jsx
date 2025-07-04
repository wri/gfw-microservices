import { Link } from '@mui/material';
import catchContainer from './catchContainer';
import sendSlackNotification from '../../utils/sendSlackNotification';
import Button from '../GfwButton';
import './ErrorPage.scss';

const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

const DEFAULT_LANGUAGE = 'en';
const errorPage = {
  en: {
    title: 'Oops! Something went wrong.',
    message: (
      <>
        We're sorry, but the page you're looking for is currently unavailable. Please try again
        later. If the problem persists please contact{' '}
        <Link href="https://gfwpro.zendesk.com/hc/en-us/requests/new" target="_blank">
          GFW Pro support here
        </Link>{' '}
        for further information.
      </>
    ),
  },
};
function ErrorHandlerFn(error) {
  if (isProduction) {
    sendSlackNotification(error.stack);
  }
  console.error(`%c GFWProError: ${error.message}`, 'font-weight:bold;', error.stack);
}

function AppErrorFallback({ error, children }) {
  if (error) {
    const page = errorPage[DEFAULT_LANGUAGE];
    return (
      <div className="error-page">
        <main className="error-page__dialog">
          <header className="error-page__tile">{page.title}</header>
          <div className="error-page__message">{page.message}</div>
          <div className="error-page__button-wrapper">
            <Button
              classNames="btn-green"
              value="Home Page"
              onClick={() => (window.location.href = '/')}
            />
          </div>
          {!isProduction && error.stack && <pre className="error-page__details">{error.stack}</pre>}
        </main>
      </div>
    );
  }

  return <>{children}</>;
}

export default catchContainer(AppErrorFallback, ErrorHandlerFn);
