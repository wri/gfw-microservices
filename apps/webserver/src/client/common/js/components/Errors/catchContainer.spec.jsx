import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';

import catchContainer from './catchContainer';
import sendSlackNotification from '../../utils/sendSlackNotification';

jest.mock('../../../../common/js/utils/sendSlackNotification');

const ErrorComponent = ({ error, children }) => {
  if (error) {
    return <div data-testid="error-component">Error occurred: {error.message}</div>;
  }
  return children;
};

const ErrorHandlerFn = (error) => {
  console.error(`GFWProError: ${error.message}`, error.stack);
  sendSlackNotification(error);
};

const ErrorBoundary = catchContainer(ErrorComponent, ErrorHandlerFn);

const ThrowError = () => {
  useEffect(() => {
    throw new Error('Something went wrong.');
  }, []);

  return <>ThrowError</>;
};

describe('ErrorBoundary', () => {
  test('catches errors and renders the error component', async () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId('error-component')).toBeDefined();
    expect(screen.queryByText('Error occurred: Something went wrong.')).toBeInTheDocument();
    expect(screen.queryByText('ThrowError')).not.toBeInTheDocument();
  });

  test('calls the error handler function when an error is caught', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(sendSlackNotification).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Something went wrong.' })
    );
  });

  test('renders children without errors', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
