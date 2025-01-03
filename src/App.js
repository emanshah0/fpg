// src/App.js
import React from 'react';
import ReactFlow, { Controls, Background, ReactFlowProvider } from 'react-flow-renderer';
import InputNode from './components/InputNode';
import CalculationNode from './components/CalculationNode';
import ConditionalNode from './components/ConditionalNode';
import SelectTypeNode from './components/SelectTypeNode';
import useFlowManager from './hooks/useFlowManager';
import './App.css';
import './css/edges.css';       

const nodeTypes = { 
  inputNode: InputNode, 
  calculationNode: CalculationNode, 
  conditionalNode: ConditionalNode,
  selectTypeNode: SelectTypeNode,
};

function App() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgeClick,
    addNode,
    loadFlow,
    clearAll,
    exportFlow,
  } = useFlowManager();

  // Define default edge options
  const defaultEdgeOptions = {
    style: {
      stroke: '#ffffff', // Edge color
    },
    animated: true, // Set to true if you want animated edges
    markerEnd: {
      type: 'arrowclosed', // Type of arrow at the end
      color: '#ffffff', // Color of the arrow
    },
    // Optional: Define arrow size and other properties
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#1e1e1e' }}>
      <div className="button-group">
        <button onClick={addNode} className="add-node-button">
          Add Node
        </button>
        <button onClick={exportFlow} className="load-flow-button">
          Export Flow
        </button>
        <label htmlFor="load-flow" className="load-flow-button">
          Load Flow
          <input id="load-flow" type="file" accept=".json" onChange={loadFlow} hidden />
        </label>
        <button onClick={clearAll} className="clear-all-button">
          Clear All Nodes
        </button>
      </div>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions} // Apply default edge styles
          fitView
          style={{ backgroundColor: '#1e1e1e' }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#555" gap={16} />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default App;