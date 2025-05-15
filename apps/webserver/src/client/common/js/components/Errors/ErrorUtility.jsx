import catchContainer from './catchContainer';
import './ErrorPage.scss';

function ErrorUtility({ error, children }) {
  if (error) {
    return (
      <div className="error-page">
        <pre className="error-page__details">{error.stack}</pre>
      </div>
    );
  }

  return <>{children}</>;
}

export default catchContainer(ErrorUtility);
