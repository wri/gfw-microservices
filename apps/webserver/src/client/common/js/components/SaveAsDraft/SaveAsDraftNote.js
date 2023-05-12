import React from 'react';

export default function SaveAsDraftNote() {
  return (
    <p className="save-as-draft__note" style={{ margin: '1rem 0', fontWeight: 300, lineHeight: 1.35 }}>
      <strong>Note</strong>: Select "SAVE AS DRAFT" if you would like to add your locations to a list and submit your
      list for analysis later. Select "SUBMIT" to add your locations to a list and analyze the list. You will not be
      able to access the submitted list until analysis is complete.
    </p>
  );
}
