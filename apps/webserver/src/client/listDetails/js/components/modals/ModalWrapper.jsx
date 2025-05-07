import React from 'react';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';

/**
 * Should be wrapped in a component with relative or absolute position
 */
export default function ModalWrapper(props) {
  const contentClass = `modal-content custom-scroll ${props.theme ? props.theme : ''}`;
  const widthControl = props.widthControl ? props.widthControl : '';
  const modalTitle = props.modalTitle ? props.modalTitle : '';
  return (
    <div className="modal-container dialog">
      <div className="modal-background" onClick={props.onClose} />
      <article className={`modal shadow dialog__body ${widthControl}`}>
        <div className="dialog__content">
          <div className="dialog__header">
            {modalTitle && <h1 className="dialog__title">{modalTitle}</h1>}
            <IconButton icon={<IconTimes />} onClick={props.onClose} size="large" />
          </div>

          <div className={contentClass}>{props.children}</div>
        </div>
      </article>
    </div>
  );
}
