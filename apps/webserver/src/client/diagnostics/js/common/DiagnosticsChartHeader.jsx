import React from 'react';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import IconButtonWrapper from '../../../locations/js/components/IconButtonWrapper';
import './DiagnosticsChartHeader.scss';

function DiagnosticsChartHeader({
  title,
  subtitle,
  informationBubbleId,
  fireDownload,
  downloadId,
}) {
  return (
    <div className="diagnostics-chart-header">
      <div className="diagnostics-chart-header__title" data-testid="chart-header-title">
        {title}
      </div>
      {subtitle && <span>{subtitle}</span>}
      {informationBubbleId && <IconButtonWrapper id={informationBubbleId} />}
      {downloadId && (
        <DownloadForOfflineIcon
          className="diagnostics-chart-header__download_icon"
          fontSize="16"
          onClick={() => fireDownload(downloadId)}
        />
      )}
    </div>
  );
}

export default DiagnosticsChartHeader;
