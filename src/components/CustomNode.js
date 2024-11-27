// src/components/CustomNode.js
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './CustomNode.css';

const CustomNode = ({
  id,
  data,
}) => {
  const {
    label,
    value,
    onChange,
    onDelete,
    isConnected,
    processList,
    availableLabels,
  } = data;

  const [dataType, setDataType] = useState(data.dataType || 'single'); // 'single' or 'range'
  const [from, setFrom] = useState(data.from || '');
  const [to, setTo] = useState(data.to || '');
  const [error, setError] = useState('');

  // Handle data type change
  const handleDataTypeChange = (e) => {
    const selectedType = e.target.value;
    setDataType(selectedType);
    onChange(id, 'dataType', selectedType);

    if (selectedType === 'single') {
      // Clear range fields
      setFrom('');
      setTo('');
      onChange(id, 'from', '');
      onChange(id, 'to', '');
      // Retain the single value
    } else if (selectedType === 'range') {
      // Clear single input value
      onChange(id, 'value', '');
    }
  };

  // Handle FROM change with validation
  const handleFromChange = (e) => {
    const input = e.target.value.toUpperCase();
    if (/^[A-Z]{0,2}$/.test(input)) {
      setFrom(input);
      onChange(id, 'from', input);
    }
  };

  // Handle TO change with validation
  const handleToChange = (e) => {
    const input = e.target.value.toUpperCase();
    if (/^[A-Z]{0,2}$/.test(input)) {
      setTo(input);
      onChange(id, 'to', input);
    }
  };

  // Handle Label change
  const handleLabelChange = (e) => {
    onChange(id, 'label', e.target.value);
  };

  // Handle Value change with space replacement for single input
  const handleValueChange = (e) => {
    let inputValue = e.target.value;
    if (!isConnected && dataType === 'single') {
      // Replace spaces with underscores
      inputValue = inputValue.replace(/\s+/g, '_');
    }
    onChange(id, 'value', inputValue);
  };

  // Handle Process change
  const handleProcessChange = (e) => {
    onChange(id, 'process', e.target.value);
  };

  // Handle Delete button
  const handleDelete = () => {
    onDelete(id);
  };

  // Effect to validate range uniqueness and logical correctness
  useEffect(() => {
    if (dataType === 'range' && from && to) {
      const range = `${from}:${to}`;
      // Simple validation: FROM should not be greater than TO alphabetically
      if (from > to) {
        setError('"From" value cannot be greater than "To" value.');
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  }, [from, to, dataType]);

  // Effect to update value based on process and sourceLabels
  useEffect(() => {
    if (isConnected && data.sourceLabels.length > 0) {
      if (data.process) {
        const processedValue = `${data.process}(${data.sourceLabels.join(', ')})`;
        onChange(id, 'value', processedValue);
      } else {
        // If process is not selected, default to "Process(x)"
        const processedValue = `Process(${data.sourceLabels.join(', ')})`;
        onChange(id, 'value', processedValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.sourceLabels, data.process, isConnected]);

  return (
    <div className={`custom-node ${error ? 'error' : ''}`}>
      {/* Target Handle */}
      <Handle type="target" position={Position.Top} className="handle" />

      <div className="node-content">
        {/* Label Input */}
        <div className="input-group">
          <label htmlFor={`label-${id}`}>Label:</label>
          <input
            id={`label-${id}`}
            name="label"
            value={label}
            onChange={handleLabelChange}
            className="nodrag"
            placeholder="Enter label"
            disabled={isConnected} // Disable if connected
          />
        </div>

        {/* Data Type Selection (Visible Only on Non-Processing Nodes) */}
        {!isConnected && (
          <div className="input-group">
            <label>Data Type:</label>
            <div className="radio-group">
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
        )}

        {/* Value Input */}
        <div className="input-group">
          <label htmlFor={`value-${id}`}>Value:</label>
          <input
            id={`value-${id}`}
            name="value"
            value={value}
            onChange={handleValueChange}
            className="nodrag"
            placeholder="Enter value"
            disabled={isConnected} // Disable if connected
          />
        </div>

        {/* Data Type Specific Inputs */}
        {!isConnected && dataType === 'range' && (
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
            {error && <div className="error-message">{error}</div>}
          </>
        )}

        {/* Process Indicator (Visible When Connected) */}
        {isConnected && (
          <div className="process-indicator">
            <strong>Process:</strong> {data.process || 'None'}
          </div>
        )}

        {/* Process Selection Dropdown (Visible When Connected) */}
        {isConnected && (
          <div className="input-group">
            <label htmlFor={`process-${id}`}>Process:</label>
            <select
              id={`process-${id}`}
              name="process"
              value={data.process || ''}
              onChange={handleProcessChange}
              className="nodrag"
            >
              <option value="" disabled>
                Select Process
              </option>
              {processList.map((process) => (
                <option key={process.id} value={process.label}>
                  {process.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Delete Button */}
        <button className="delete-button" onClick={handleDelete}>
          Delete
        </button>
      </div>

      {/* Source Handle */}
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
};

export default memo(CustomNode);