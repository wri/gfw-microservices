import React, { Component } from 'react';

import Button from '../../../../common/js/components/Button';
import IconButton from '../../../../common/js/components/IconButton';
import { locationsPage } from '../../../../common/js/config';
import '../../../../common/css/note.scss';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import IconLightbulbExclamation from '../../../../common/js/components/icon/IconLightbulbExclamation';

class SidebarTemplateDownload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTemplate: '',
      uploadTemplatePaneOpen: true,
    };
  }

  toggleUploadTemplates = () => {
    this.setState({ uploadTemplatePaneOpen: !this.state.uploadTemplatePaneOpen });
  };

  downloadTemplate = () => {
    const { selectedTemplate } = this.state;
    const templateOptions = locationsPage.landing.selectTemplateOptions;
    const selectedTemplateLabel = templateOptions.find(
      (i) => i.templateName === selectedTemplate
    ).label;
    gtag('event', 'Download button clicked', {
      event_category: 'Landing Page Click',
      event_label: selectedTemplateLabel,
    });
    window.open(selectedTemplate);
  };

  render() {
    const { selectedTemplate, uploadTemplatePaneOpen } = this.state;
    const strings = locationsPage.templateDownloadSidebar;
    const templateOptions = locationsPage.landing.selectTemplateOptions;

    return (
      <div className="sidebar-template-download note note--alert">
        {!uploadTemplatePaneOpen && (
          <div className="note__inner note__inner--closed">
            <IconLightbulbExclamation className="note__icon" />
            <div
              className="note__prompt"
              dangerouslySetInnerHTML={{ __html: strings.initialPrompt }}
              onClick={(e) => {
                if (e.target.id === 'toggleUpload') {
                  e.preventDefault();
                  this.toggleUploadTemplates();
                  return false;
                }
              }}
            />
          </div>
        )}
        {uploadTemplatePaneOpen && (
          <div className="note__inner">
            <div className="note__header">
              <IconLightbulbExclamation className="note__icon" />
              <span className="note__title">{strings.help}</span>
              <IconButton icon={<IconTimes />} onClick={this.toggleUploadTemplates} size="medium" />
            </div>
            <div className="note-content">
              <h3 className="note-content__title">{strings.header}</h3>
              <p className="note-content__prompt">{strings.downloadPrompt}</p>
              <label className="block-label" htmlFor="downloadTypeSelect">
                {strings.downloadTypePrompt}
              </label>
              <select
                className="note-content__select"
                id="downloadTypeSelect"
                name="downloadType"
                onChange={(e) => this.setState({ selectedTemplate: e.target.value })}
                value={selectedTemplate}
              >
                <option value="">Select...</option>
                {templateOptions.map((opt, idx) => {
                  return (
                    <option key={idx} value={opt.templateName}>
                      {opt.label}
                    </option>
                  );
                })}
              </select>
              <Button
                className="note-content__button"
                label={strings.downloadButton}
                disabled={!selectedTemplate}
                onClick={this.downloadTemplate}
                fullWidth={true}
              />
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: strings.howToGuideFooter(this.props.language) }}
            />
          </div>
        )}
      </div>
    );
  }
}

export default SidebarTemplateDownload;
