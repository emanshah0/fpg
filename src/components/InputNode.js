// src/components/InputNode.js
import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import '../css/InputNode.css';

const InputNode = ({ id, data }) => {
  const {
    label,
    handleNodeChange,
    handleDelete,
    isConnected,
    isRange,
  } = data;

  const handleLabelChange = (e) => {
    if (!isConnected) {
      handleNodeChange(id, 'label', e.target.value);
    }
  };

  const handleRangeToggle = () => {
    if (!isConnected) {
      handleNodeChange(id, 'isRange', !isRange);
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

        <div className="input-group range-group">
          <label htmlFor={`range-${id}`}>Is Range:</label>
          <input
            id={`range-${id}`}
            type="checkbox"
            checked={isRange}
            onChange={handleRangeToggle}
            disabled={isConnected}
          />
        </div>

        <button className="delete-button nodrag" onClick={handleDeleteClick}>
          Delete
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
};

export default memo(InputNode);