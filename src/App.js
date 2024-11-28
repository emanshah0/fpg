// src/App.js
import React from 'react';
import ReactFlow, { Controls, Background, ReactFlowProvider } from 'react-flow-renderer';
import InputNode from './components/InputNode';
import ProcessorNode from './components/ProcessorNode';
import useFlowManager from './hooks/useFlowManager';
import './App.css';

const nodeTypes = { inputNode: InputNode, processorNode: ProcessorNode };

function App() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgeClick,
    addNode,
    saveFlow,
    loadFlow,
    clearAll,
  } = useFlowManager();

  return (
    <div style={{ height: '100vh' }}>
      <div className="button-group">
        <button onClick={addNode} className="add-node-button">
          Add Node
        </button>
        <button onClick={saveFlow} className="save-flow-button">
          Save Flow
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