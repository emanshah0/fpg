// src/components/ProcessorNode.js
import React, { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import "./CustomNode.css";

const ProcessorNode = ({ id, data }) => {
  const { label, onChange, onDelete, processList, sourceLabels, process } = data;

  // Handle Process change
  const handleProcessChange = (e) => {
    onChange(id, "process", e.target.value);
  };

  // Handle Delete button
  const handleDelete = () => {
    onDelete(id);
  };

  // Generate the value to display
  const displayValue = process
    ? `${process}(${sourceLabels.join(", ")})`
    : `Process(${sourceLabels.join(", ")})`;

  return (
    <div className="custom-node">
      {/* Target Handle */}
      <Handle type="target" position={Position.Top} className="handle" />

      <div className="node-content">
        {/* Label Display */}
        <div className="input-group">
          <label>Label:</label>
          <span>{label}</span>
        </div>

        {/* Value Display */}
        <div className="input-group">
          <label>Value:</label>
          <span>{displayValue}</span>
        </div>

        {/* Process Selection Dropdown */}
        <div className="input-group">
          <label htmlFor={`process-${id}`}>Process:</label>
          <select
            id={`process-${id}`}
            name="process"
            value={process || ""}
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

export default memo(ProcessorNode);