// src/components/ConditionalNode.js
import React, { useState, useEffect } from "react";
import { Handle, Position } from "react-flow-renderer";
import "../css/ConditionalNode.css";

export const getRandomGreen = () => {
  const hue = Math.floor(Math.random() * 40) + 160;
  const saturation = Math.floor(Math.random() * 51) + 60;
  const lightness = Math.floor(Math.random() * 21) + 40;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const ConditionalNode = ({ id, data }) => {
  const { label, condition, handleNodeChange, handleDelete, isConnected } =
    data;
  const [blobColor, setBlobColor] = useState("#2ecc71"); // Default green shade

  useEffect(() => {
    const newColor = getRandomGreen();
    setBlobColor(newColor);
  }, []);

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
        <div className="blob" style={{ backgroundColor: blobColor }}></div>
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
