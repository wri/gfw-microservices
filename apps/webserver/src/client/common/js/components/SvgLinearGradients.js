import React from 'react';

const SvgLinearGradients = (
  {
    start,
    middle,
    end,
    width,
    height
  }
) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`svg-gradient-${width}x${height}`} x1="0%" y1="50%" y2="50%">
          <stop offset="0%" stopColor={start}/>
          <stop offset="50%" stopColor={middle}/>
          <stop offset="100%" stopColor={end}/>
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#svg-gradient-${width}x${height})`} fillRule="evenodd"/>
    </svg>
  );
};

export default SvgLinearGradients;
