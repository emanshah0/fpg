// src/hooks/useFlowManager.js
import { useNodesState, useEdgesState, addEdge } from 'react-flow-renderer';
import { useCallback } from 'react';
import BaseNode from '../components/BaseNode';
import { v4 as uuidv4 } from 'uuid';

const useFlowManager = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Function to set the node type and initialize its data
  const setNodeType = (id, type) => {
    console.log(`Setting node ${id} type to ${type}`);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const baseNode = new BaseNode(node.id, type, node.position, {
            handleNodeChange,
            handleDelete,
          });
          baseNode.setType(type);
          return baseNode.toNodeObject();
        }
        return node;
      })
    );
  };

  // Function to add a new SelectTypeNode
  const addNode = () => {
    const id = `node_${uuidv4()}`;
    const newNode = new BaseNode(
      id,
      'selectTypeNode',
      { x: Math.random() * 250, y: Math.random() * 250 },
      {
        setNodeType,
        handleNodeChange,
        handleDelete,
      }
    ).toNodeObject();
    setNodes((nds) => nds.concat(newNode));
  };

  // Function to handle node changes
  const handleNodeChange = (id, field, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value,
            },
          };
        }
        return node;
      })
    );

    // Update connected nodes that inherit from this node
    const affectedEdges = edges.filter((edge) => edge.source === id);
    const affectedNodes = affectedEdges.map((edge) => edge.target);

    affectedNodes.forEach((targetId) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === targetId) {
            if (field === 'label') {
              return {
                ...node,
                data: {
                  ...node.data,
                  sourceLabel: value,
                },
              };
            }
            if (field === 'condition') {
              return {
                ...node,
                data: {
                  ...node.data,
                  sourceCondition: value,
                },
              };
            }
            // Add more conditions as needed
            return node;
          }
          return node;
        })
      );
    });
  };

  // Function to delete a node
  const handleDelete = (id) => {
    // Remove edges connected to the node
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));

    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  // Handle connections between nodes
  const onConnectHandler = useCallback(
    (params) => {
      const { source, target } = params;

      // Prevent connecting a node to itself
      if (source === target) {
        alert("Cannot connect a node to itself.");
        return;
      }

      // Check for existing connection to prevent duplicates
      const existingEdge = edges.find(
        (e) => e.source === source && e.target === target
      );
      if (existingEdge) {
        alert("Connection already exists.");
        return;
      }

      // Update source node's outputs
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === source) {
            const updatedOutputs = [...(node.data.outputs || []), target];
            return {
              ...node,
              data: {
                ...node.data,
                outputs: Array.from(new Set(updatedOutputs)), // Ensure uniqueness
              },
            };
          }
          return node;
        })
      );

      // Update target node's inputs
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === target) {
            const updatedInputs = [...(node.data.inputs || []), source];
            return {
              ...node,
              data: {
                ...node.data,
                inputs: Array.from(new Set(updatedInputs)), // Ensure uniqueness
                isConnected: updatedInputs.length > 0,
              },
            };
          }
          return node;
        })
      );

      // Add the edge
      setEdges((eds) => addEdge(params, eds));
    },
    [edges, setNodes, setEdges]
  );

  // Handle edge deletion
  const onEdgeClickHandler = (_, edge) => {
    const { source, target } = edge;

    // Remove the edge
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));

    // Update source node's outputs
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === source) {
          const updatedOutputs = node.data.outputs.filter((id) => id !== target);
          return {
            ...node,
            data: {
              ...node.data,
              outputs: updatedOutputs,
            },
          };
        }
        return node;
      })
    );

    // Update target node's inputs
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === target) {
          const updatedInputs = node.data.inputs.filter((id) => id !== source);
          return {
            ...node,
            data: {
              ...node.data,
              inputs: updatedInputs,
              isConnected: updatedInputs.length > 0,
            },
          };
        }
        return node;
      })
    );
  };

  const onNodesChangeHandler = useCallback(
    (changes) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const onEdgesChangeHandler = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  // Save the current flow to localStorage
  const saveFlow = () => {
    const flow = { nodes, edges };
    localStorage.setItem('flow', JSON.stringify(flow));
    alert('Flow saved to localStorage!');
  };

  // Load the flow from a JSON file
  const loadFlow = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        const flow = JSON.parse(fileReader.result);
        if (flow.nodes && flow.edges) {
          setNodes(flow.nodes);
          setEdges(flow.edges);
          alert('Flow loaded successfully!');
        } else {
          alert('Invalid flow file!');
        }
      } catch (error) {
        console.error('Error loading flow:', error);
        alert('Failed to load flow. Please ensure the file is valid JSON.');
      }
    };
    if (event.target.files[0]) {
      fileReader.readAsText(event.target.files[0]);
    }
  };

  // Clear all nodes and edges
  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all nodes and edges?')) {
      setNodes([]);
      setEdges([]);
    }
  };

  // Export flow as JSON
  const exportFlow = () => {
    const flow = { nodes, edges };
    const dataStr = JSON.stringify(flow, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flow.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    nodes,
    edges,
    onNodesChange: onNodesChangeHandler,
    onEdgesChange: onEdgesChangeHandler,
    onConnect: onConnectHandler,
    onEdgeClick: onEdgeClickHandler,
    addNode,
    saveFlow,
    loadFlow,
    clearAll,
    exportFlow,
    setNodeType,
    handleNodeChange,
    handleDelete,
  };
};

export default useFlowManager;