import React, { Component } from 'react';
import { AutoSizer, CellMeasurer, CellMeasurerCache, MultiGrid } from 'react-virtualized';
import * as PropTypes from 'prop-types';
import { v1 as uuidv1 } from 'uuid';
import IconExclamationTriangle from '../../../../../common/js/components/icon/IconExclamationTriangle';
import createMultiGridHeaders from './createMultiGridHeaders';
import { MultiGridCellCheckbox } from './MultiGridCellCheckbox';
import { MultiGridCellRegular } from './MultiGridCellRegular';
import { MultiGridCellCheckboxAll } from './MultiGridCellCheckboxAll';
import {
  bottomLeftGridStyles,
  defaultCellHeight,
  defaultContainerHeight,
  defaultRowNumber,
  topLeftGridStyles,
  topRightGridStyles,
} from './MultiGridTable.config';
import './MultiGridTable.scss';

// Fixed width in pixels for the first column (instead of `defaultWidth` in cache)
const initialColumnWidth = 45;

class MultiGridTable extends Component {
  constructor(props) {
    super(props);
    const { addType, activeTemplate, commodityType, customAttributeHeaders, templateData, isListExcluded } = this.props;
    this._cache = new CellMeasurerCache({
      defaultHeight: defaultCellHeight,
      defaultWidth: 180,
      fixedHeight: true,
    });

    const trackCellUpdates = {};
    props.features.forEach((feature) => {
      Object.assign(trackCellUpdates, { [feature.location_id]: null });
    });

    const multiGridHeaders = createMultiGridHeaders(
      addType,
      activeTemplate,
      commodityType,
      customAttributeHeaders,
      templateData,
      isListExcluded
    );
    this.state = {
      multiGridHeaders,
      trackCellUpdates,
    };
  }

  _getTableContainerHeight = () => {
    return this.props.features.length + 1 <= defaultRowNumber
      ? (this.props.features.length + 1) * this._cache._defaultHeight
      : defaultContainerHeight;
  };

  _handleTrackCellUpdates = (location_id) => {
    const { trackCellUpdates } = this.state;
    trackCellUpdates[location_id] = uuidv1();
    this.setState(trackCellUpdates);
  };

  _setFixedColumn = (e) => {
    const newFixedColumnIndex = parseInt(e.target.value);
    const { multiGridHeaders } = this.state;
    const newfixedColumnName = multiGridHeaders[newFixedColumnIndex];
    const newMultiGridHeaders = [newfixedColumnName, ...multiGridHeaders.filter((item) => item !== newfixedColumnName)];
    this.setState({ multiGridHeaders: newMultiGridHeaders });
  };

  _getColumnWidth = (props) => {
    return props.index === 0 ? initialColumnWidth : this._cache.columnWidth(props);
  };

  _cellRenderer = (props) => {
    const { rowIndex, style: multiGridStyle, key, columnIndex, parent } = props;
    const {
      addType,
      activeTemplate,
      commodityType,
      templateData,
      customAttributeHeaders,
      features,
      featuresColumnCount,
      initialColumnIsValid,
      selectAll,
      _editTableCell,
      _filterFeatures,
      _handlingCheckboxChange,
      _handleSelectAllChange,
    } = props.parent.props;
    const { trackCellUpdates } = this.state;

    const { multiGridHeaders } = this.state;
    const rowIndexAdjustment = rowIndex - 1;
    const columnIndexAdjustment = columnIndex - 1;
    const columnName = multiGridHeaders[columnIndexAdjustment];
    const feature = features[rowIndexAdjustment];

    const headerCellStyle = {
      ...multiGridStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    };

    const iconCellStyle = {
      ...multiGridStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const bodyCellStyle = {
      ...multiGridStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const fixedRowHeaderStyle = {
      display: 'flex',
      position: 'absolute',
      left: '45px',
      width: '180px',
      height: '100%',
      backgroundColor: '#f7f7f7',
    };

    if (rowIndex === 0) {
      if (columnIndex === 0) {
        if (initialColumnIsValid) {
          return (
            <div className="row-icon gfw-table__thead" key={key} style={iconCellStyle}>
              <IconExclamationTriangle className="row-invalid__icon" />
            </div>
          );
        }
        return (
          <MultiGridCellCheckboxAll
            className="gfw-table__thead"
            style={headerCellStyle}
            key={key}
            checked={selectAll}
            onChange={_handleSelectAllChange}
          />
        );
      }
      if (columnIndex === 1) {
        const fixedColumnSelectOptions = multiGridHeaders.map((header, i) => (
          <option value={i} key={header}>
            {header}
          </option>
        ));
        return (
          <div style={fixedRowHeaderStyle} key={key}>
            <select className="gfw-table__fixed-row-select" value={multiGridHeaders[0]} onChange={this._setFixedColumn}>
              {fixedColumnSelectOptions}
            </select>
          </div>
        );
      }
      return (
        <div key={key} className="gfw-table__thead" style={headerCellStyle}>
          {columnName}
        </div>
      );
    }
    const rowHaveError = feature && feature.invalidFields ? feature.invalidFields.length > 0 : false;

    if (columnIndex === 0) {
      if (initialColumnIsValid) {
        return (
          <div key={key} className="MultiGridHeader__checkbox row-icon gfw-table__td" style={iconCellStyle}>
            <span>{feature.valid ? '' : <IconExclamationTriangle className="row-invalid__icon" />}</span>
          </div>
        );
      }
      return (
        <MultiGridCellCheckbox
          key={key}
          i={rowIndexAdjustment}
          locationID={feature.location_id}
          style={bodyCellStyle}
          rowHaveError={rowHaveError}
          checkboxChecked={feature.checked}
          _handlingCheckboxChange={_handlingCheckboxChange}
        />
      );
    }
    return (
      <CellMeasurer key={key} cache={this._cache} columnIndex={columnIndex} parent={parent} rowIndex={rowIndex}>
        <div
          key={key}
          style={bodyCellStyle}
          className={`gfw-table__td ${rowHaveError ? 'row-invalid' : 'row-valid'} ${
            rowHaveError && featuresColumnCount === columnIndex ? 'row-invalid--last' : 'row-valid--last'
          }`}
        >
          <MultiGridCellRegular
            i={rowIndexAdjustment}
            feature={feature}
            addType={addType}
            activeTemplate={activeTemplate}
            columnName={columnName}
            commodityType={commodityType}
            templateData={templateData}
            customAttributeHeaders={customAttributeHeaders}
            _editTableCell={_editTableCell}
            _filterFeatures={_filterFeatures}
            _handleTrackCellUpdates={this._handleTrackCellUpdates}
            trackCellUpdates={trackCellUpdates[feature.location_id]}
          />
        </div>
      </CellMeasurer>
    );
  };

  render() {
    const {
      activeTemplate,
      addType,
      commodityType,
      customAttributeHeaders,
      features,
      initialColumnIsValid,
      selectAll,
      templateData,
      isListExcluded,
      // methods
      _editTableCell,
      _filterFeatures,
      _handlingCheckboxChange,
      _handleSelectAllChange,
    } = this.props;

    const multiGridHeaders = createMultiGridHeaders(
      addType,
      activeTemplate,
      commodityType,
      customAttributeHeaders,
      templateData,
      isListExcluded
    );
    const tableContainerHeight = this._getTableContainerHeight();

    return (
      <div
        id="StepOneEdit__MultiGridTable"
        className="mode-edit"
        style={{
          height: tableContainerHeight,
        }}
      >
        <AutoSizer>
          {({ width }) => (
            <MultiGrid
              width={width}
              height={tableContainerHeight}
              fixedColumnCount={2}
              fixedRowCount={1}
              cellRenderer={this._cellRenderer}
              columnCount={multiGridHeaders.length + 1}
              columnWidth={this._getColumnWidth}
              rowCount={features.length + 1}
              rowHeight={defaultCellHeight}
              enableFixedRowScroll
              enableFixedColumnScroll
              initialColumnIsValid={!!initialColumnIsValid}
              hideTopRightGridScrollbar
              hideBottomLeftGridScrollbar
              styleTopLeftGrid={topLeftGridStyles}
              styleTopRightGrid={topRightGridStyles}
              styleBottomLeftGrid={bottomLeftGridStyles}
              // props - All MultiGridCells
              features={features}
              featuresColumnCount={multiGridHeaders.length}
              // props - MultiGridCellCheckbox
              multiGridHeaders={multiGridHeaders}
              selectAll={selectAll}
              trackCheckedFeatures={features.filter((item) => item.checked === true).length}
              _handlingCheckboxChange={_handlingCheckboxChange}
              _handleSelectAllChange={_handleSelectAllChange}
              // props - MultiGridCellsRegular
              addType={addType}
              activeTemplate={activeTemplate}
              commodityType={commodityType}
              customAttributeHeaders={customAttributeHeaders}
              templateData={templateData}
              _editTableCell={_editTableCell}
              _filterFeatures={_filterFeatures}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

MultiGridTable.propTypes = {
  features: PropTypes.any,
  cache: PropTypes.any,
};

export default MultiGridTable;
