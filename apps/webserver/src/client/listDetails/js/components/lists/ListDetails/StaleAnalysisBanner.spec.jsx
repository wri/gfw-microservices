import { render, screen } from '@testing-library/react';
import StaleAnalysisBanner, { isAnalysisStale, getStaleAnalysisIds } from './StaleAnalysisBanner';

describe('isAnalysisStale', () => {
  it('returns false when analysis is null/undefined', () => {
    expect(isAnalysisStale(null)).toBe(false);
    expect(isAnalysisStale(undefined)).toBe(false);
  });

  it('returns false when analysisIdLastModifed is missing', () => {
    expect(isAnalysisStale({ updateTime: '2025-01-01T00:00:00Z' })).toBe(false);
  });

  it('returns false when updateTime is missing', () => {
    expect(isAnalysisStale({ analysisIdLastModifed: '2025-01-01T00:00:00Z' })).toBe(false);
  });

  it('returns true when analysisIdLastModifed is after updateTime', () => {
    expect(
      isAnalysisStale({
        analysisIdLastModifed: '2025-03-01T00:00:00Z',
        updateTime: '2025-01-01T00:00:00Z',
      })
    ).toBe(true);
  });

  it('returns false when analysisIdLastModifed is before updateTime', () => {
    expect(
      isAnalysisStale({
        analysisIdLastModifed: '2025-01-01T00:00:00Z',
        updateTime: '2025-03-01T00:00:00Z',
      })
    ).toBe(false);
  });

  it('returns false when analysisIdLastModifed equals updateTime', () => {
    expect(
      isAnalysisStale({
        analysisIdLastModifed: '2025-01-01T00:00:00Z',
        updateTime: '2025-01-01T00:00:00Z',
      })
    ).toBe(false);
  });
});

describe('getStaleAnalysisIds', () => {
  it('returns empty array for null/undefined input', () => {
    expect(getStaleAnalysisIds(null)).toEqual([]);
    expect(getStaleAnalysisIds(undefined)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(getStaleAnalysisIds([])).toEqual([]);
  });

  it('returns analysis IDs that are stale', () => {
    const statuses = [
      {
        analysisId: 'FCD',
        analysisIdLastModifed: '2025-03-01T00:00:00Z',
        updateTime: '2025-01-01T00:00:00Z',
      },
      {
        analysisId: 'AFI',
        analysisIdLastModifed: '2025-01-01T00:00:00Z',
        updateTime: '2025-03-01T00:00:00Z',
      },
    ];
    expect(getStaleAnalysisIds(statuses)).toEqual(['FCD']);
  });

  it('excludes ALERTS from stale analysis IDs', () => {
    const statuses = [
      {
        analysisId: 'ALERTS',
        analysisIdLastModifed: '2025-04-01T00:00:00Z',
        updateTime: '2025-02-01T00:00:00Z',
      },
      {
        analysisId: 'FCD',
        analysisIdLastModifed: '2025-03-01T00:00:00Z',
        updateTime: '2025-01-01T00:00:00Z',
      },
    ];
    expect(getStaleAnalysisIds(statuses)).toEqual(['FCD']);
  });

  it('returns empty array when no analyses are stale', () => {
    const statuses = [
      {
        analysisId: 'FCD',
        analysisIdLastModifed: '2025-01-01T00:00:00Z',
        updateTime: '2025-03-01T00:00:00Z',
      },
    ];
    expect(getStaleAnalysisIds(statuses)).toEqual([]);
  });
});

describe('StaleAnalysisBanner', () => {
  it('renders the banner with correct content', () => {
    render(<StaleAnalysisBanner onResubmit={jest.fn()} />);
    expect(screen.getByText('New data available')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Updated analysis data is available. Re-submit your list for analysis to see the latest results.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Re-submit')).toBeInTheDocument();
  });

  it('calls onResubmit when button is clicked', () => {
    const onResubmit = jest.fn();
    render(<StaleAnalysisBanner onResubmit={onResubmit} />);
    screen.getByText('Re-submit').click();
    expect(onResubmit).toHaveBeenCalledTimes(1);
  });
});
