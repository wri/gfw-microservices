import React, { useState, useRef, useEffect } from 'react';
import './OpacitySlider.scss';

const OpacitySlider = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef(null);
  const iconRef = useRef(null);

  // Convert internal 0-1 value to 0-100 for display
  const displayValue = Math.round(value * 100);

  const handleChange = (e) => {
    // Convert 0-100 range back to 0-1 for the parent component
    onChange(Number(e.target.value) / 100);
  };

  const togglePopup = (e) => {
    e.stopPropagation();
    if (disabled) {
      return;
    }

    if (!isOpen && iconRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      setPosition({
        top: iconRect.top - 97,
        left: iconRect.left - 75,
      });
    }

    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(event.target) &&
      iconRef.current &&
      !iconRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="opacity-slider-wrapper">
      <div ref={iconRef} className="opacity-icon" onClick={togglePopup}>
        <svg
          width="11"
          height="10"
          viewBox="0 0 11 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_8567_5104)">
            <path
              d="M8.35714 0.896071V9.10357C7.92571 9.40464 7.44464 9.63929 6.92857 9.79286V0.207143C7.44464 0.360714 7.92571 0.595357 8.35714 0.896429V0.896071ZM9.78571 2.42321C10.2393 3.17571 10.5 4.0575 10.5 5C10.5 5.9425 10.2393 6.82429 9.78571 7.57679V2.42321ZM5.5 0V10C2.73857 10 0.5 7.76143 0.5 5C0.5 2.23857 2.73857 0 5.5 0Z"
              fill="#5C5959"
            />
          </g>
          <defs>
            <clipPath id="clip0_8567_5104">
              <rect width="10" height="10" fill="white" transform="translate(0.5)" />
            </clipPath>
          </defs>
        </svg>
      </div>

      {isOpen && (
        <div
          className="opacity-popup"
          ref={popupRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="slider-wrapper">
            <div>Opacity</div>
            <input
              type="range"
              min="0"
              max="100"
              value={displayValue}
              onChange={handleChange}
              className="opacity-range"
              disabled={disabled}
            />
            <div className="slider-labels">
              <span>0%</span>
              <span>{displayValue}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpacitySlider;
