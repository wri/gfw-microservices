export function CheckboxUncheckedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="1.5"
        fill="white"
        stroke="#C9C9C9"
        strokeWidth="1"
      />
    </svg>
  );
}

export function CheckboxCheckedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="1.5"
        fill="#9FC642"
        stroke="#516E10"
        strokeWidth="1"
      />
      {/* 12×12 check icon centered at (4,4) */}
      <path
        d="M8.19632 14.4277L4 10.2314L5.04908 9.18231L8.19632 12.3296L14.9509 5.57495L16 6.62403L8.19632 14.4277Z"
        fill="#1A210B"
      />
    </svg>
  );
}

export function CheckboxIndeterminateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="1.5"
        fill="#9FC642"
        stroke="#516E10"
        strokeWidth="1"
      />
      {/* 12×12 dash centered at (4,4) */}
      <path d="M4 10H16" stroke="#1A210B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
