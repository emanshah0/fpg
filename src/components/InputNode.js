// src/components/InputNode.js
import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import '../css/InputNode.css';

const InputNode = ({ id, data }) => {
  const {
    label,
    value,
    handleNodeChange,
    handleDelete,
    isConnected,
    dataType,
    from,
    to,
  } = data;

  const handleDataTypeChange = (e) => {
    handleNodeChange(id, 'dataType', e.target.value);
  };

  const handleLabelChange = (e) => {
    if (!isConnected) {
      handleNodeChange(id, 'label', e.target.value);
    }
  };

  const handleValueChange = (e) => {
    if (!isConnected && dataType === 'single') {
      let inputValue = e.target.value;
      inputValue = inputValue.replace(/\s+/g, '_');
      handleNodeChange(id, 'value', inputValue);
    }
  };

  const handleFromChange = (e) => {
    if (!isConnected) {
      const input = e.target.value.toUpperCase();
      if (/^[A-Z]{0,2}$/.test(input)) {
        handleNodeChange(id, 'from', input);
      }
    }
  };

  const handleToChange = (e) => {
    if (!isConnected) {
      const input = e.target.value.toUpperCase();
      if (/^[A-Z]{0,2}$/.test(input)) {
        handleNodeChange(id, 'to', input);
      }
    }
  };

  const handleDeleteClick = () => {
    handleDelete(id);
  };

  return (
    <div className={`input-node ${isConnected ? 'disabled' : ''}`}>
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
            disabled={isConnected}
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
                disabled={isConnected}
              />
              Single Input
            </label>
            <label>
              <input
                type="radio"
                value="range"
                checked={dataType === 'range'}
                onChange={handleDataTypeChange}
                disabled={isConnected}
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
              disabled={isConnected}
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
                disabled={isConnected}
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
                disabled={isConnected}
              />
            </div>
            <small>Use uppercase letters only. Maximum 2 letters.</small>
          </>
        )}

        <button className="delete-button nodrag" onClick={handleDeleteClick}>
          Delete
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
};

export default memo(InputNode);