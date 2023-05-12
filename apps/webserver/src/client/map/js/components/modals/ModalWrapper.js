import React from 'react';
/**
 * Should be wrapped in a component with relative or absolute position
 */
export default function ModalWrapper(props) {
  const contentClass = `modal-content custom-scroll ${props.theme ? props.theme : ''}`;
  const closeClass = props.theme === 'no-download search-tool-wrapper' ? 'search-tool-close-icon' : '';
  return (
    <div className="modal-container" data-modal-type={props.modalType}>
      <div className="modal-background" onClick={props.onClose} />
      <article className="modal">
        <div title="close" className={`close-icon pointer ${closeClass}`} onClick={props.onClose}>
          <svg>
            <use xlinkHref="#shape-close" />
          </svg>
        </div>
        <div id="modal-content-id" className={contentClass}>
          {props.children}
        </div>
      </article>
    </div>
  );
}
