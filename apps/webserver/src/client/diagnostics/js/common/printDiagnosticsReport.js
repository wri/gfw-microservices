const printDiagnosticsReport = (listView) => {
  window.print(); // TODO: Update print css -header is too tall, highcharts too wide
  if (listView === 'forest_change') {
    gtag('event', 'Report button clicked', {
      event_category: 'Forest Change Diagnostics Print',
      event_label: 'user printed forest change diagnostics report',
    });
  } else if (listView === 'commodity_risk') {
    gtag('event', 'Report button clicked', {
      event_category: 'Commodity Risk Diagnostics Print',
      event_label: 'user printed commodity risk diagnostics report',
    });
  } else {
    gtag('event', 'Report button clicked', {
      event_category: 'Diagnostics Print',
      event_label: 'user printed diagnostics report',
    });
  }
};

export default printDiagnosticsReport;
