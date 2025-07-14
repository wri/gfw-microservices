import { render, screen } from '@testing-library/react';

import AddCompany from './AddCompany';

jest.mock('./FeatureFlagStateContext', () => ({
  useFeatureFlagStateContext: jest.fn(() => ({
    accountList: [
      { organization_id: 1, organization_name: 'Org 1' },
      { organization_id: 2, organization_name: 'Org 2' },
    ],
    accountsWithFeatureFlagsByFlagId: [],
    addFeatureFlagForAccountId: jest.fn(),
  })),
}));

describe('AddCompany', () => {
  it('should render correctly', () => {
    render(<AddCompany />);
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });
});
