import React from 'react';

const IntegratedAlertsMapLegends = () => {
    return (
        <>
            <li style={{paddingTop: '6px'}}>
                <div>
                    <span
                        className="layer-legend-symbol"
                        style={{
                            background: 'rgb(237, 164, 195)',
                        }}
                    />
                    <span className="layer-legend-label">Detected by a single alert system</span>
                </div>
            </li>
            <li>
                <div>
                    <span
                        className="layer-legend-symbol"
                        style={{
                            background: 'rgb(220, 102, 153)',
                        }}
                    />
                    <span className="layer-legend-label">High confidence: detected more than once by a single alert system</span>
                </div>
            </li>
            <li>
                <div>
                    <span
                        className="layer-legend-symbol"
                        style={{
                            background: 'rgb(201, 42, 109)',
                        }}
                    />
                    <span className="layer-legend-label">Highest confidence: detected by multiple alert systems</span>
                </div>
            </li>
        </>
    );
};

export default IntegratedAlertsMapLegends;
