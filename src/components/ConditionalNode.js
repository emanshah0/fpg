// src/components/ConditionalNode.js
import React, { useState, useEffect } from "react";
import { Handle, Position } from "react-flow-renderer";
import "../css/ConditionalNode.css";

export const predefinedConditions = [
  { value: "A > B", label: "A > B" },
  { value: "A < B", label: "A < B" },
  { value: "A === B", label: "A === B" },
  { value: "A !== B", label: "A !== B" },
  { value: "A >= B", label: "A >= B" },
  { value: "A <= B", label: "A <= B" },
  { value: "A === 'Yes'", label: "A === 'Yes'" },
  { value: "A === 'No'", label: "A === 'No'" },
  { value: "A.includes('test')", label: "A includes 'test'" },
  { value: "A.startsWith('Start')", label: "A starts with 'Start'" },
  // Add more conditions as needed
];

const ConditionalNode = ({ id, data }) => {
  const { label, condition, handleNodeChange, handleDelete, isConnected } =
    data;

  const handleLabelChange = (e) => {
    if (!isConnected) {
      handleNodeChange(id, "label", e.target.value);
    }
  };

  const handleConditionChange = (e) => {
    if (!isConnected) {
      handleNodeChange(id, "condition", e.target.value);
    }
  };

  const handleDeleteClick = () => {
    handleDelete(id);
  };

  return (
    <div className={`conditional-node ${isConnected ? "disabled" : ""}`}>
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="blob-container">
        <div className="blob" style={{ backgroundColor: "#fff" }}></div>
      </div>
      <div className="conditional-node-content">
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
            <select
              id={`condition-${id}`}
              name="condition"
              value={condition}
              onChange={handleConditionChange}
              className="nodrag"
              disabled={isConnected}
            >
              <option value="" disabled>
                Select Condition
              </option>
              {predefinedConditions.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>

          <button className="delete-button nodrag" onClick={handleDeleteClick}>
            Delete
          </button>
        </div>
        <Handle
          type="source"
          position={Position.Left}
          id="false"
          className="handle false-handle"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          className="handle true-handle"
        />
      </div>
    </div>
  );
};

export default ConditionalNode;
