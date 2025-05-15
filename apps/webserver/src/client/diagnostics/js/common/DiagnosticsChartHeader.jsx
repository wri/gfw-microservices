import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import InfoBubble from '../../../common/js/components/InfoBubble';
import './DiagnosticsChartHeader.scss';
import BetaTag from '../../../common/js/components/BetaTag';

function DiagnosticsChartHeader({
  title,
  subtitle,
  informationBubbleId,
  fireDownload,
  downloadId,
  preview,
}) {
  return (
    <div className="diagnostics-chart-header">
      <div className="diagnostics-chart-header__title" data-testid="chart-header-title">
        {title}
        {preview && <BetaTag>(Preview)</BetaTag>}
      </div>
      {subtitle && <span>{subtitle}</span>}
      {informationBubbleId && <InfoBubble infoBubbleId={informationBubbleId} />}
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
