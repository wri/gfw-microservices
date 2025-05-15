import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DeforestationDisplayFormatToggleButtons from './DeforestationDisplayFormatToggleButtons';
import { toggleDeforestationDisplayFormat } from '../../../../../locations/js/actions/locationActions';

const mockStore = configureStore([]);

describe('DeforestationDisplayFormatToggleButtons', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      deforestationDisplayFormat: 'summary', // Set initial state
    });
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <Provider store={store}>
        <DeforestationDisplayFormatToggleButtons />
      </Provider>
    );
  });

  test('button styles change based on selected format', () => {
    const { getByText } = render(
      <Provider store={store}>
        <DeforestationDisplayFormatToggleButtons />
      </Provider>
    );

    const summaryButton = getByText('Summary');
    expect(summaryButton).toHaveStyle('background-color: #e0e0e0'); // Assuming 'summary' is selected

    // Change the store state for testing
    store = mockStore({
      deforestationDisplayFormat: 'hectares',
    });

    const { rerender } = render(
      <Provider store={store}>
        <DeforestationDisplayFormatToggleButtons />
      </Provider>
    );

    expect(summaryButton).toHaveStyle('background-color: #f3f3ed'); // Background color should change
  });

  test('dispatches toggleDeforestationDisplayFormat action on button click', () => {
    const { getByText } = render(
      <Provider store={store}>
        <DeforestationDisplayFormatToggleButtons />
      </Provider>
    );

    const summaryButton = getByText('Summary');
    fireEvent.click(summaryButton);
    const actions = store.getActions();
    expect(actions).toEqual([{ type: toggleDeforestationDisplayFormat.type, payload: 'summary' }]);
  });
});
