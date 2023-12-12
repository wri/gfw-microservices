import React from 'react';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddCompany from '../../js/components/featuresFlags/AddCompany';

jest.mock('../../js/components/featuresFlags/FeatureFlagStateContext', () => ({
  useFeatureFlagStateContext: jest.fn(() => ({
    accountList: [
      { organization_id: 1, organization_name: 'Org 1' },
      { organization_id: 2, organization_name: 'Org 2' },
    ],
    accountsWithFeatureFlagsByFlagId: [],
    addFeatureFlagForAccountId: jest.fn(),
  })),
}));

afterEach(cleanup);

test('renders AddCompany component', () => {
  render(<AddCompany />);
  expect(screen.getByText('+ ADD')).toBeInTheDocument();
});
