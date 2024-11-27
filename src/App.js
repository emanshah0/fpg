// src/App.js
import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  getConnectedEdges,
  Position,
} from 'react-flow-renderer';
import CustomNode from './components/CustomNode';
import './App.css';
import { PROCESS_LIST } from './components/Processes';

// Helper function to generate labels up to 2 letters (A-Z, AA-ZZ)
const generateLabels = () => {
  const labels = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const maxLength = 2;

  const recurse = (current) => {
    if (current.length >= maxLength) return;
    for (let i = 0; i < letters.length; i++) {
      const newLabel = current + letters[i];
      labels.push(newLabel);
      recurse(newLabel);
    }
  };

  recurse('');
  return labels;
};

const ALL_LABELS = generateLabels();

const nodeTypes = { customNode: CustomNode };

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [usedRanges, setUsedRanges] = useState([]); // Global state for used ranges

  // Handler to allocate ranges
  const allocateRanges = useCallback(
    (newRanges) => {
      setUsedRanges((prev) => [...prev, ...newRanges]);
    },
    [setUsedRanges]
  );

  // Handler to deallocate ranges
  const deallocateRanges = useCallback(
    (removedRanges) => {
      setUsedRanges((prev) => prev.filter((range) => !removedRanges.includes(range)));
    },
    [setUsedRanges]
  );

  const availableLabels = useMemo(
    () => ALL_LABELS.filter((label) => !usedRanges.includes(label)),
    [usedRanges]
  );

  const onConnect = useCallback(
    (connection) => {
      // Add the new edge
      const newEdge = { ...connection, id: `edge-${Date.now()}`, animated: false };
      setEdges((eds) => addEdge(newEdge, eds));

      // Find the source node's label
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const sourceLabel = sourceNode ? sourceNode.data.label : 'Unknown';

      // Update the target node's sourceLabels array
      setNodes((nds) =>
        nds.map((node) =>
          node.id === connection.target
            ? {
                ...node,
                data: {
                  ...node.data,
                  sourceLabels: [...node.data.sourceLabels, sourceLabel],
                },
              }
            : node
        )
      );
    },
    [nodes, setEdges, setNodes]
  );

  const onEdgeClick = useCallback(
    (event, edge) => {
      event.preventDefault();
      const confirmDelete = window.confirm('Do you want to delete this connection?');
      if (confirmDelete) {
        // Remove the edge from edges state
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));

        // Find the target node
        const targetNode = nodes.find((node) => node.id === edge.target);
        if (targetNode) {
          // Find the source node's label
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const sourceLabel = sourceNode ? sourceNode.data.label : 'Unknown';

          // Remove the source label from the target node's sourceLabels array
          const updatedSourceLabels = targetNode.data.sourceLabels.filter(
            (label) => label !== sourceLabel
          );

          setNodes((nds) =>
            nds.map((node) =>
              node.id === edge.target
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      sourceLabels: updatedSourceLabels,
                      process: updatedSourceLabels.length === 0 ? '' : node.data.process,
                    },
                  }
                : node
            )
          );

          // If no other incoming connections, reset process
          if (updatedSourceLabels.length === 0 && targetNode.data.process) {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === edge.target
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        process: '',
                      },
                    }
                  : node
              )
            );
          }
        }
      }
    },
    [edges, nodes, setEdges, setNodes]
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
        process: '', // Initialize with no process
        sourceLabels: [], // Initialize with no source labels
        dataType: 'single', // Default data type
        from: '', // Initialize FROM for range
        to: '', // Initialize TO for range
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, setNodes]);

  const handleNodeDataChange = useCallback(
    (id, field, value) => {
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
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId) => {
      const nodeToDelete = nodes.find((n) => n.id === nodeId);
      if (!nodeToDelete) return;

      // Deallocate ranges if the node had a range selection
      if (nodeToDelete.data.dataType === 'range' && nodeToDelete.data.from && nodeToDelete.data.to) {
        const range = `${nodeToDelete.data.from}:${nodeToDelete.data.to}`;
        deallocateRanges([range]);
      }

      const connectedEdges = getConnectedEdges([nodeToDelete], edges);
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => !connectedEdges.some((ce) => ce.id === edge.id))
      );
    },
    [nodes, edges, setNodes, setEdges, deallocateRanges]
  );

  // Determine which nodes have incoming edges
  const nodesWithIncoming = useMemo(() => {
    const incomingNodeIds = edges.map((edge) => edge.target);
    return new Set(incomingNodeIds);
  }, [edges]);

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // Save the flow to JSON
  const saveFlow = useCallback(() => {
    const flow = {
      nodes,
      edges,
    };
    const flowJSON = JSON.stringify(flow, null, 2);
    const blob = new Blob([flowJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flow.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Load the flow from JSON
  const loadFlow = useCallback(
    (event) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target.result);
          if (flow.nodes && flow.edges) {
            // Extract all ranges to update usedRanges
            const selectedRanges = flow.nodes
              .filter((node) => node.data.dataType === 'range' && node.data.from && node.data.to)
              .map((node) => `${node.data.from}:${node.data.to}`);
            setUsedRanges(selectedRanges);

            setNodes(flow.nodes);
            setEdges(flow.edges);
          } else {
            alert('Invalid flow format');
          }
        } catch (error) {
          alert('Error reading flow file');
        }
      };
      if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0]);
      }
    },
    [setNodes, setEdges]
  );

  // Clear all nodes and edges
  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setUsedRanges([]);
  }, [setNodes, setEdges, setUsedRanges]);

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
        </label>
        <input
          id="load-flow"
          type="file"
          accept=".json"
          onChange={loadFlow}
          style={{ display: 'none' }}
        />
        <button onClick={clearAll} className="clear-all-button">
          Clear All Nodes
        </button>
      </div>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onChange: handleNodeDataChange,
              onDelete: deleteNode,
              isConnected: nodesWithIncoming.has(node.id),
              processList: PROCESS_LIST,
              availableLabels: availableLabels,
              allocateRanges: allocateRanges,
              deallocateRanges: deallocateRanges,
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
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