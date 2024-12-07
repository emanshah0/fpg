// src/components/CalculationNode.js
import React, { useState, useEffect } from "react";
import { Handle, Position } from "react-flow-renderer";
import "../css/CalculationNode.css"; // Updated import path

export const getRandomLight = () => {
  const hue = Math.floor(Math.random() * 20) + 70;
  const saturation = 0;
  const lightness = Math.floor(Math.random() * 30) + 180;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const CalculationNode = ({ id, data }) => {
  const { label, processType, handleNodeChange, handleDelete, isConnected } =
    data;
  const [blobColor, setBlobColor] = useState("#ffe100"); // Default green shade

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

  useEffect(() => {
    const newColor = getRandomLight();
    setBlobColor(newColor);
  }, []);

  // Available processes for abstraction
  const availableProcesses = [
    { value: "sum", label: "Sum" },
    { value: "subtract", label: "Subtract" },
    { value: "multiply", label: "Multiply" },
    { value: "divide", label: "Divide" },
    { value: "average", label: "Average" },
    { value: "concat", label: "Concatenate" },
    // Add more processes as needed
  ];

  return (
    <div className={`calculation-node ${isConnected ? "disabled" : ""}`}>
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="blob-container">
        <div className="blob" style={{ backgroundColor: blobColor }}></div>
      </div>

      <div className="calculation-node-content">
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
              disabled={isConnected}
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
