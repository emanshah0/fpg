// src/components/BaseNode.js
import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './CustomNode.css';

const BaseNode = ({ id, data, children }) => {
  const { onDelete } = data;

  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        {children}
        <button onClick={() => onDelete(id)}>Delete</button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default BaseNode;