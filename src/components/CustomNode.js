// src/components/CustomNode.js
import React, { memo, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './CustomNode.css';

const CustomNode = ({ id, data }) => {
  const { label, value, onChange, onDelete, isConnected, processList, sourceLabels } = data;

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

  // Update the value when sourceLabels or process changes
  useEffect(() => {
    if (isConnected && sourceLabels.length > 0) {
      const processedValue = processData(sourceLabels, data.process);
      onChange(id, 'value', processedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLabels, data.process]);

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