// src/components/CalculationNode.js
import React from "react";
import { Handle, Position } from "react-flow-renderer";
import "../css/CalculationNode.css"; // Updated import path

const CalculationNode = ({ id, data }) => {
  const {
    label,
    processType,
    inputs,
    handleNodeChange,
    handleDelete,
    isConnected,
  } = data;

  const handleLabelChange = (e) => {
    if (!isConnected) {
      handleNodeChange(id, "label", e.target.value);
    }
  };

  const handleProcessTypeChange = (e) => {
    e.stopPropagation(); // Prevents drag event
    if (!isConnected) {
      handleNodeChange(id, "processType", e.target.value);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevents drag event
    handleDelete(id);
  };

  // Determine available processes based on number of inputs
  const availableProcesses = [
    { value: "sum", label: "Sum" },
    { value: "subtract", label: "Subtract" },
    { value: "multiply", label: "Multiply" },
    { value: "divide", label: "Divide" },
    { value: "average", label: "Average" },
    { value: "concat", label: "Concatenate" },
    // Add more processes as needed
  ];

  // Disable process selection if not enough inputs
  const isProcessSelectable =
    (processType === "sum" && inputs.length >= 2) ||
    (processType === "subtract" && inputs.length >= 2) ||
    (processType === "multiply" && inputs.length >= 2) ||
    (processType === "divide" && inputs.length >= 2) ||
    (processType === "average" && inputs.length >= 1) ||
    (processType === "concat" && inputs.length >= 1) ||
    processType === "";

  return (
    <div className={`processor-node ${isConnected ? "disabled" : ""}`}>
      <Handle type="target" position={Position.Top} className="handle" />

      {/* Blob Container */}
      <div className="blob-container">
        <div className="blob"></div>
      </div>

      <div className="processor-node-content">
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
            <label htmlFor={`processType-${id}`}>Process Type:</label>
            <select
              id={`processType-${id}`}
              value={processType}
              onChange={handleProcessTypeChange}
              disabled={isConnected || !isProcessSelectable}
              onClick={(e) => e.stopPropagation()} // Prevents drag on click
              className="nodrag"
            >
              <option value="" disabled>
                Select Process
              </option>
              {availableProcesses.map((process) => (
                <option key={process.value} value={process.value}>
                  {process.label}
                </option>
              ))}
            </select>
          </div>

          <button className="delete-button nodrag" onClick={handleDeleteClick}>
            Delete
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
};

export default CalculationNode;
