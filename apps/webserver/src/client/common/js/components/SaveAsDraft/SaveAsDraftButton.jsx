import Button from '../Button';

export default function SaveAsDraftButton({ onClick, disabled }) {
  return (
    <Button
      className="locations-list__draft-button dialog__primary-action"
      variant="secondary"
      label="Save As Draft"
      onClick={onClick}
      disabled={disabled}
    />
  );
}
