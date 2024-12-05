// src/components/SelectTypeNode.js
import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import '../css/SelectTypeNode.css';

const SelectTypeNode = ({ id, data }) => {
  const { setNodeType } = data;

  const handleSelect = (type) => {
    setNodeType(id, type);
  };

  return (
    <div className="select-type-node">
      <div className="select-title">Select Node Type</div>
      <div className="type-buttons">
        <button onClick={() => handleSelect('inputNode')}>Input</button>
        <button onClick={() => handleSelect('calculationNode')}>Calculation</button>
        <button onClick={() => handleSelect('conditionalNode')}>Conditional</button>
      </div>
      {/* Optionally hide handle or position differently */}
      <Handle type="target" position={Position.Left} className="handle" />
    </div>
  );
};

export default SelectTypeNode;