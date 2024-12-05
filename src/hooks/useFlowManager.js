// src/hooks/useFlowManager.js
import { useNodesState, useEdgesState, addEdge } from 'react-flow-renderer';
import { useCallback } from 'react';
import BaseNode from '../components/BaseNode'; // Corrected import path
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
            ...node.data,
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
    const newNode = new BaseNode(id, 'selectTypeNode', { x: Math.random() * 250, y: Math.random() * 250 }, {
      setNodeType,
      handleNodeChange,
      handleDelete,
    }).toNodeObject();
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
            if (field === 'value') {
              return {
                ...node,
                data: {
                  ...node.data,
                  sourceValue: value,
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
  const onConnect = useCallback(
    (params) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === params.target) {
            return {
              ...node,
              data: {
                ...node.data,
                inputs: [...(node.data.inputs || []), params.source],
                isConnected: true,
              },
            };
          }
          return node;
        })
      );

      setEdges((eds) => addEdge(params, eds));
    },
    [setNodes, setEdges]
  );

  // Handle edge deletion
  const onEdgeClick = (_, edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    // Update node inputs when an edge is removed
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === edge.target) {
          const updatedInputs = node.data.inputs.filter((input) => input !== edge.source);
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
  };

  // Load the flow from a JSON file
  const loadFlow = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const flow = JSON.parse(fileReader.result);
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
    };
    if (event.target.files[0]) {
      fileReader.readAsText(event.target.files[0]);
    }
  };

  // Clear all nodes and edges
  const clearAll = () => {
    setNodes([]);
    setEdges([]);
  };

  return {
    nodes,
    edges,
    onNodesChange: onNodesChangeHandler,
    onEdgesChange: onEdgesChangeHandler,
    onConnect,
    onEdgeClick,
    addNode,
    saveFlow,
    loadFlow,
    clearAll,
    setNodeType,
    handleNodeChange,
    handleDelete,
  };
};

export default useFlowManager;