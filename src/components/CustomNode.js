// CustomNode.js
import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './CustomNode.css'; // Optional: For styling


const CustomNode = ({ id, data }) => {
  const { label, value, onChange, onDelete } = data;

  const handleLabelChange = (e) => {
    onChange(id, 'label', e.target.value);
  };

  const handleValueChange = (e) => {
    onChange(id, 'value', e.target.value);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  return (
    <div className="custom-node">
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
        <button className="delete-button" onClick={handleDelete}>
          Delete
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
};

export default memo(CustomNode);