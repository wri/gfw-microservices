import React, { useEffect } from 'react';
import _range from 'lodash/range';

function DateRangeSilder({ id, setDateRange, startYear, endYear }) {
  const yearsRange = _range(startYear, endYear + 1);

  const updateIonRangeSliderLabels = (data) => {
    const { from_value, to_value } = data;
    yearsRange.forEach((year) => {
      if (year > to_value || year < from_value) {
        $(`.${id}-date-range-slider-container .irs-grid-text:contains("${year}")`).addClass(
          'irs-inactive-year'
        );
      } else {
        $(`.${id}-date-range-slider-container .irs-grid-text:contains("${year}")`).removeClass(
          'irs-inactive-year'
        );
      }
    });
  };

  const onChangeRange = (data) => {
    updateIonRangeSliderLabels(data);
    setDateRange({
      startYear: data.from_value,
      endYear: data.to_value,
    });

    gtag('event', 'timeslider update', {
      event_category: 'Diagnostics Click',
      event_label: 'user updated the south america timeslider',
    });
  };

  useEffect(() => {
    $(`.${id}-date-range-slider`).ionRangeSlider({
      type: 'double',
      values: yearsRange,
      hide_min_max: true,
      from_min: 0,
      from_max: endYear - startYear,
      grid: true,
      grid_snap: true,
      from: 0,
      to: endYear - startYear,
      onFinish: onChangeRange,
      prettify: (value) => value,
    });
  }, []);

  return (
    <div
      style={{ marginBottom: '40px', marginTop: '0px' }}
      className={`${id}-date-range-slider-container`}
    >
      <input className={`${id}-date-range-slider`} />
    </div>
  );
}

export default DateRangeSilder;
