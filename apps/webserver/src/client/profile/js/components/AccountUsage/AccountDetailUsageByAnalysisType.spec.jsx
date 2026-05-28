import { render, screen, within } from '@testing-library/react';
import AccountDetailUsageByAnalysisType from './AccountDetailUsageByAnalysisType';

jest.mock(
  '../../../../proManagerList/js/components/accounts/AccountUsage/DateRangeSelector.jsx',
  () =>
    function DateRangeSelector() {
      return <div data-testid="date-range-selector" />;
    }
);

jest.mock(
  './AccountUsageDropMenu',
  () =>
    function AccountUsageDropMenu() {
      return <div data-testid="drop-menu" />;
    }
);

jest.mock(
  '../../../../common/js/components/InfoBubble',
  () =>
    function InfoBubble({ children }) {
      return <span data-testid="info-bubble">{children}</span>;
    }
);

const mockAnalysisData = [
  {
    analysis_type: 'AFI',
    locations_analyzed: '10',
    hectares_analyzed: '10',
    lists_analyzed: '10',
    total_tokens: '10',
  },
  {
    analysis_type: 'ALERTS',
    locations_analyzed: '10',
    hectares_analyzed: '10',
    lists_analyzed: '10',
    total_tokens: '10',
  },
  {
    analysis_type: 'ALERTS-BATCH',
    locations_analyzed: '500',
    hectares_analyzed: '1000',
    lists_analyzed: '100',
    total_tokens: '10',
  },
  {
    analysis_type: 'FCD',
    locations_analyzed: '10',
    hectares_analyzed: '10',
    lists_analyzed: '10',
    total_tokens: '10',
  },
  {
    analysis_type: 'GHG',
    locations_analyzed: '10',
    hectares_analyzed: '10',
    lists_analyzed: '10',
    total_tokens: '10',
  },
];

const defaultProps = {
  analysisUsageByType: mockAnalysisData,
  setStartDateAnalysis: jest.fn(),
  setEndDateAnalysis: jest.fn(),
  startDateAnalysis: '2026-01-01',
  endDateAnalysis: '2026-03-01',
};

describe('AccountDetailUsageByAnalysisType', () => {
  it('renders all analysis type rows with normalized names', () => {
    render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

    expect(screen.getByText('Post-2020 Risk Assessment')).toBeInTheDocument();
    expect(screen.getByText('Recent Disturbance Alerts')).toBeInTheDocument();
    expect(screen.getByText('Weekly Alerts')).toBeInTheDocument();
    expect(screen.getByText('Post-2000 Forest Change')).toBeInTheDocument();
    expect(screen.getByText('GHG Emissions')).toBeInTheDocument();
  });

  it('renders column headers for locations, hectares, and lists', () => {
    render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

    expect(screen.getByText('Locations analyzed')).toBeInTheDocument();
    expect(screen.getByText('Hectares analyzed (HA)')).toBeInTheDocument();
    expect(screen.getByText('Lists analyzed')).toBeInTheDocument();
  });

  describe('Tokens used column', () => {
    it('always renders the Tokens used column', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

      expect(screen.getByText('Tokens used')).toBeInTheDocument();
    });
  });

  describe('null token values', () => {
    it('displays N/A when total_tokens is null', () => {
      const dataWithNullTokens = [
        {
          analysis_type: 'AFI',
          locations_analyzed: '10',
          hectares_analyzed: '10',
          lists_analyzed: '10',
          total_tokens: null,
        },
      ];

      render(
        <AccountDetailUsageByAnalysisType
          {...defaultProps}
          analysisUsageByType={dataWithNullTokens}
        />
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('displays N/A when total_tokens is undefined', () => {
      const dataWithUndefinedTokens = [
        {
          analysis_type: 'AFI',
          locations_analyzed: '10',
          hectares_analyzed: '10',
          lists_analyzed: '10',
        },
      ];

      render(
        <AccountDetailUsageByAnalysisType
          {...defaultProps}
          analysisUsageByType={dataWithUndefinedTokens}
        />
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('displays formatted value when total_tokens has a value', () => {
      const dataWithTokens = [
        {
          analysis_type: 'AFI',
          locations_analyzed: '10',
          hectares_analyzed: '10',
          lists_analyzed: '10',
          total_tokens: '50',
        },
      ];

      render(
        <AccountDetailUsageByAnalysisType {...defaultProps} analysisUsageByType={dataWithTokens} />
      );

      expect(screen.queryByText('N/A')).not.toBeInTheDocument();
    });
  });

  describe('Weekly Alerts row', () => {
    it('renders "Weeks of analysis" subtext', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

      expect(screen.getByText('Weeks of analysis')).toBeInTheDocument();
    });

    it('renders info bubble with explanation text', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

      expect(
        screen.getByText(/Weeks of analysis is a sum of the number of lists/)
      ).toBeInTheDocument();
    });
  });

  describe('Total row', () => {
    it('renders a Total row when data is present', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('does not render Total row when data is empty', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} analysisUsageByType={[]} />);

      expect(screen.queryByText('Total')).not.toBeInTheDocument();
    });

    it('includes all rows in locations total (including Weekly Alerts)', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

      const totalRow = screen.getByText('Total').closest('tr');
      // 10+10+500+10+10 = 540
      expect(within(totalRow).getByText('540')).toBeInTheDocument();
    });

    it('includes all rows in hectares total (including Weekly Alerts)', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

      const totalRow = screen.getByText('Total').closest('tr');
      // 10+10+1000+10+10 = 1040 (locale may format as 1,040 or 1.040)
      expect(within(totalRow).getByText(/1[.,]040/)).toBeInTheDocument();
    });

    it('excludes Weekly Alerts from lists total', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

      const totalRow = screen.getByText('Total').closest('tr');
      // AFI(10) + ALERTS(10) + FCD(10) + GHG(10) = 40 (excludes ALERTS-BATCH 100)
      expect(within(totalRow).getByText('40')).toBeInTheDocument();
    });

    it('includes all rows in tokens total', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

      const totalRow = screen.getByText('Total').closest('tr');
      // 10+10+10+10+10 = 50
      expect(within(totalRow).getByText('50')).toBeInTheDocument();
    });

    it('renders info bubble explaining lists total excludes Weeks of analysis', () => {
      render(<AccountDetailUsageByAnalysisType {...defaultProps} />);

      expect(screen.getByText(/This sum excludes the/)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('prompts for both dates when neither is provided', () => {
      render(
        <AccountDetailUsageByAnalysisType
          {...defaultProps}
          analysisUsageByType={[]}
          startDateAnalysis=""
          endDateAnalysis=""
        />
      );

      expect(
        screen.getByText('Please select both a start date and an end date to display data.')
      ).toBeInTheDocument();
    });

    it('prompts for start date when only end date is provided', () => {
      render(
        <AccountDetailUsageByAnalysisType
          {...defaultProps}
          analysisUsageByType={[]}
          startDateAnalysis=""
          endDateAnalysis="2026-03-01"
        />
      );

      expect(screen.getByText('Please select a start date to display data.')).toBeInTheDocument();
    });

    it('prompts for end date when only start date is provided', () => {
      render(
        <AccountDetailUsageByAnalysisType
          {...defaultProps}
          analysisUsageByType={[]}
          startDateAnalysis="2026-01-01"
          endDateAnalysis=""
        />
      );

      expect(screen.getByText('Please select an end date to display data.')).toBeInTheDocument();
    });
  });

  it('renders children when provided', () => {
    render(
      <AccountDetailUsageByAnalysisType {...defaultProps}>
        <div data-testid="child-content">Child content</div>
      </AccountDetailUsageByAnalysisType>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});
