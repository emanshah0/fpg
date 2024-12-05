// src/components/ConditionalNode.js
import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import '../css/ConditionalNode.css';

const ConditionalNode = ({ id, data }) => {
  const { label, condition, handleNodeChange, handleDelete, isConnected } = data;

  const handleLabelChange = (e) => {
    if (!isConnected) {
      handleNodeChange(id, 'label', e.target.value);
    }
  };

  const handleConditionChange = (e) => {
    if (!isConnected) {
      handleNodeChange(id, 'condition', e.target.value);
    }
  };

  const handleDeleteClick = () => {
    handleDelete(id);
  };

  return (
    <div className={`conditional-node ${isConnected ? 'disabled' : ''}`}>
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
          <label htmlFor={`condition-${id}`}>Condition:</label>
          <input
            id={`condition-${id}`}
            name="condition"
            value={condition}
            onChange={handleConditionChange}
            className="nodrag"
            placeholder="e.g., A > B"
            disabled={isConnected}
          />
        </div>

        <button className="delete-button nodrag" onClick={handleDeleteClick}>
          Delete
        </button>
      </div>
      <Handle type="source" position={Position.Left} id="true" className="handle true-handle" />
      <Handle type="source" position={Position.Right} id="false" className="handle false-handle" />
    </div>
  );
};

export default ConditionalNode;