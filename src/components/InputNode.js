// src/components/InputNode.js
import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './CustomNode.css';

const InputNode = ({ id, data }) => {
  const {
    label,
    value,
    onChange,
    onDelete,
    isConnected,
    dataType,
    from,
    to,
    availableLabels,
  } = data;

  const handleDataTypeChange = (e) => {
    onChange(id, 'dataType', e.target.value);
  };

  const handleLabelChange = (e) => {
    onChange(id, 'label', e.target.value);
  };

  const handleValueChange = (e) => {
    let inputValue = e.target.value;
    if (!isConnected && dataType === 'single') {
      inputValue = inputValue.replace(/\s+/g, '_');
    }
    onChange(id, 'value', inputValue);
  };

  const handleFromChange = (e) => {
    const input = e.target.value.toUpperCase();
    if (/^[A-Z]{0,2}$/.test(input)) {
      onChange(id, 'from', input);
    }
  };

  const handleToChange = (e) => {
    const input = e.target.value.toUpperCase();
    if (/^[A-Z]{0,2}$/.test(input)) {
      onChange(id, 'to', input);
    }
  };

  const handleDelete = () => {
    onDelete(id);
  };

  return (
    <div className="input-node">
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="node-content">
        <div className="input-group">
          <label htmlFor={`label-${id}`}>Label:</label>
          <input
            id={`label-${id}`}
            name="label"
            value={label}
            onChange={handleLabelChange}
            className="nodrag"
            placeholder="Enter label"
          />
        </div>

        <div className="input-group">
          <label>Data Type:</label>
          <div className="radio-group nodrag">
            <label>
              <input
                type="radio"
                value="single"
                checked={dataType === 'single'}
                onChange={handleDataTypeChange}
              />
              Single Input
            </label>
            <label>
              <input
                type="radio"
                value="range"
                checked={dataType === 'range'}
                onChange={handleDataTypeChange}
              />
              Range/List
            </label>
          </div>
        </div>

        {dataType === 'single' && (
          <div className="input-group">
            <label htmlFor={`value-${id}`}>Value:</label>
            <input
              id={`value-${id}`}
              name="value"
              value={value}
              onChange={handleValueChange}
              className="nodrag"
              placeholder="Enter value"
            />
          </div>
        )}

        {dataType === 'range' && (
          <>
            <div className="input-group">
              <label htmlFor={`from-${id}`}>From:</label>
              <input
                id={`from-${id}`}
                name="from"
                value={from}
                onChange={handleFromChange}
                className="nodrag"
                placeholder="e.g., A"
                maxLength={2}
              />
            </div>
            <div className="input-group">
              <label htmlFor={`to-${id}`}>To:</label>
              <input
                id={`to-${id}`}
                name="to"
                value={to}
                onChange={handleToChange}
                className="nodrag"
                placeholder="e.g., ZZ"
                maxLength={2}
              />
            </div>
            <small>Use uppercase letters only. Maximum 2 letters.</small>
          </>
        )}

        <button className="delete-button nodrag" onClick={handleDelete}>
          Delete
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
};

export default memo(InputNode);