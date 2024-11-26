// App.js
import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  getConnectedEdges,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import CustomNode from './components/CustomNode';
import './App.css';


const initialNodes = [
  {
    id: '1',
    type: 'customNode',
    position: { x: 250, y: 5 },
    data: { label: 'Node 1', value: 'Value 1' },
  },
  {
    id: '2',
    type: 'customNode',
    position: { x: 100, y: 100 },
    data: { label: 'Node 2', value: 'Value 2' },
  },
];

const nodeTypes = { customNode: CustomNode };

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const storedNodes = localStorage.getItem('nodes');
    const storedEdges = localStorage.getItem('edges');
    if (storedNodes) setNodes(JSON.parse(storedNodes));
    if (storedEdges) setEdges(JSON.parse(storedEdges));
  }, [setNodes, setEdges]);
  
  useEffect(() => {
    localStorage.setItem('nodes', JSON.stringify(nodes));
  }, [nodes]);
  
  useEffect(() => {
    localStorage.setItem('edges', JSON.stringify(edges));
  }, [edges]);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, id: `edge-${Date.now()}` }, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode = {
      id: newNodeId,
      type: 'customNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `Node ${newNodeId}`,
        value: `Value ${newNodeId}`,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, setNodes]);

  const handleNodeDataChange = useCallback((id, field, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            }
          : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback(
    (nodeId) => {
      const nodeToDelete = nodes.find((n) => n.id === nodeId);
      if (!nodeToDelete) return;

      const connectedEdges = getConnectedEdges([nodeToDelete], edges);
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => !connectedEdges.some((ce) => ce.id === edge.id)));
    },
    [nodes, edges, setNodes, setEdges]
  );

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <div style={{ height: '100vh' }}>
      <button
        onClick={addNode}
        className="add-node-button"
      >
        Add Node
      </button>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onChange: handleNodeDataChange,
              onDelete: deleteNode,
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={memoizedNodeTypes}
          fitView
          style={{ backgroundColor: '#1e1e1e' }}
        >
          <Background color="#555" gap={16} />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default App;