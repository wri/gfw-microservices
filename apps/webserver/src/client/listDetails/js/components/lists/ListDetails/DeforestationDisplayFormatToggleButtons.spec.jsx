import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import DeforestationDisplayFormatToggleButtons from './DeforestationDisplayFormatToggleButtons';
import { toggleDeforestationDisplayFormat } from '../../../../../locations/js/actions/locationActions';

const initialState = {
  deforestationDisplayFormat: 'summary',
  actions: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case toggleDeforestationDisplayFormat.type:
      return {
        ...state,
        deforestationDisplayFormat: action.payload,
        actions: [...state.actions, action],
      };
    default:
      return state;
  }
};
describe('DeforestationDisplayFormatToggleButtons', () => {
  let store;
  afterEach(cleanup);
  beforeEach(() => {
    store = createStore(reducer);
  });

  test('renders without crashing', () => {
    render(
      <Provider store={store}>
        <DeforestationDisplayFormatToggleButtons />
      </Provider>
    );
  });

  test('renders all buttons correctly', () => {
    const { getAllByText, getByText } = render(
      <Provider store={store}>
        <DeforestationDisplayFormatToggleButtons />
      </Provider>
    );

    const summaryButtons = getAllByText('SUMMARY');
    expect(summaryButtons.length).toBe(1);
    expect(getByText('HECTARES')).toBeInTheDocument();
    expect(getByText('% OF LOCATION')).toBeInTheDocument();
  });
});
