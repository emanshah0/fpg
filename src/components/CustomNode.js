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
    allocateRanges,
    deallocateRanges,
    sourceLabels,
  } = data;

  const [dataType, setDataType] = useState(data.dataType || 'single'); // 'single' or 'range'
  const [from, setFrom] = useState(data.from || '');
  const [to, setTo] = useState(data.to || '');

  // Handle data type change
  const handleDataTypeChange = (e) => {
    const selectedType = e.target.value;
    setDataType(selectedType);
    onChange(id, 'dataType', selectedType);

    if (selectedType === 'single') {
      // Deallocate previous range if any
      if (from && to) {
        const range = `${from}:${to}`;
        deallocateRanges([range]);
        setFrom('');
        setTo('');
        onChange(id, 'from', '');
        onChange(id, 'to', '');
      }
    }
  };

  // Handle FROM change with validation
  const handleFromChange = (e) => {
    const input = e.target.value.toUpperCase();
    if (/^[A-Z]{0,2}$/.test(input)) {
      setFrom(input);
    }
  };

  // Handle TO change with validation
  const handleToChange = (e) => {
    const input = e.target.value.toUpperCase();
    if (/^[A-Z]{0,2}$/.test(input)) {
      setTo(input);
    }
  };

  // Allocate range when FROM and TO are set
  useEffect(() => {
    if (dataType === 'range' && from && to) {
      const range = `${from}:${to}`;
      // Check if range is already used (should be handled by App.js)
      allocateRanges([range]);
      onChange(id, 'from', from);
      onChange(id, 'to', to);
      // Update value to display the range
      onChange(id, 'value', range);
    }

    // Cleanup function to deallocate range if component unmounts or range changes
    return () => {
      if (dataType === 'range' && from && to) {
        const range = `${from}:${to}`;
        deallocateRanges([range]);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, dataType]);

  // Update node's value when sourceLabels or process changes
  useEffect(() => {
    if (isConnected && sourceLabels.length > 0) {
      const processedValue = processData(sourceLabels, data.process);
      onChange(id, 'value', processedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLabels, data.process]);

  // Function to simulate processing based on selected process
  const processData = (sources, process) => {
    if (!process) return 'None';

    // Simulate processing based on the selected function
    switch (process) {
      case 'Add':
        // Example: Concatenate source labels for display
        return `Add(${sources.join(', ')})`;
      case 'Subtract':
        return `Subtract(${sources.join(', ')})`;
      case 'Multiply':
        return `Multiply(${sources.join(', ')})`;
      case 'Divide':
        return `Divide(${sources.join(', ')})`;
      default:
        return `Process(${sources.join(', ')})`;
    }
  };

  const handleLabelChange = (e) => {
    onChange(id, 'label', e.target.value);
  };

  const handleProcessChange = (e) => {
    onChange(id, 'process', e.target.value);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  return (
    <div className="custom-node">
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