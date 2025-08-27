import './HectareKilometerSwitch.scss';

export const HectareKilometerSwitch = ({ setMeasurementUnit, measurementUnit }) => {
  const handleClick = () => {
    const newMeasurementUnit = measurementUnit === 'hectares' ? 'kilometers' : 'hectares';
    setMeasurementUnit(newMeasurementUnit);
  };

  return (
    <div
      className="hectare-kilometer-switch"
      data-testid="hectare-kilometer-switch"
      onClick={handleClick}
    >
      <div
        className={`hectare-kilometer-switch__option ${
          measurementUnit === 'hectares' ? 'hectare-kilometer-switch__option--selected' : ''
        }`}
        role="button"
      >
        <span className="hectare-kilometer-switch__label">HA</span>
      </div>
      <div
        className={`hectare-kilometer-switch__option ${
          measurementUnit === 'kilometers' ? 'hectare-kilometer-switch__option--selected' : ''
        }`}
        role="button"
      >
        <span className="hectare-kilometer-switch__label">KM</span>
      </div>
    </div>
  );
};
