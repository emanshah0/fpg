// src/components/ProcessorNode.js
import React, { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import "./CustomNode.css";

const ProcessorNode = ({ id, data }) => {
  const { label, onChange, onDelete, processList, process } = data;
  const { sources = [] } = data; // Default to empty array if sources is undefined
  const sourceLabels = sources.map(
    (source) => source.label || "Unnamed Source"
  );
  // const sourceValues = sources.map((source) => source.value || "Unnamed Value");

  const handleProcessChange = (e) => {
    onChange(id, "process", e.target.value);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const displayValue = process
    ? `${process}(${sourceLabels.join(", ")})`
    : `Process(${sourceLabels.join(", ")})`;

  return (
    <div className="processor-node">
      <div className="blob"></div>
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="node-content">
        <div className="input-group">
          <label>Label:</label>
          <span>{label}</span>
        </div>

        <div className="input-group">
          <label>Value:</label>
          <span>{displayValue}</span>
        </div>

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
            {processList.map((proc) => (
              <option key={proc.id} value={proc.label}>
                {proc.label}
              </option>
            ))}
          </select>
        </div>

        <button className="delete-button nodrag" onClick={handleDelete}>
          Delete
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
};

export default memo(ProcessorNode);
