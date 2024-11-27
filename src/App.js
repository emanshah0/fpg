// src/App.js
import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  getConnectedEdges,
} from "react-flow-renderer";
import InputNode from "./components/InputNode";
import ProcessorNode from "./components/ProcessorNode";
import "./App.css";
import { PROCESS_LIST } from "./components/Processes"; // Ensure this path is correct
import useValueManager from "./hooks/useValueManager"; // Import the custom hook

// Helper function to generate labels up to 2 letters (A-Z, AA-ZZ)
const generateLabels = () => {
  const labels = [];
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const maxLength = 2;

  const recurse = (current) => {
    if (current.length >= maxLength) return;
    for (let i = 0; i < letters.length; i++) {
      const newLabel = current + letters[i];
      labels.push(newLabel);
      recurse(newLabel);
    }
  };

  recurse("");
  return labels;
};

const ALL_LABELS = generateLabels();

const nodeTypes = { inputNode: InputNode, processorNode: ProcessorNode };

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Use the custom hook for value management
  const {
    usedSingleValues,
    usedRanges,
    allocateSingleValue,
    deallocateSingleValue,
    allocateRange,
    deallocateRange,
    setUsedSingleValues,
    setUsedRanges,
  } = useValueManager();

  const proOptions = { hideAttribution: true };

  const availableLabels = useMemo(
    () => ALL_LABELS.filter((label) => !usedRanges.includes(label)),
    [usedRanges]
  );

  // Function to handle connections
  const onConnect = useCallback(
    (connection) => {
      const newEdge = {
        ...connection,
        id: `edge-${Date.now()}`,
        animated: false,
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Find the source node's label
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const sourceLabel = sourceNode ? sourceNode.data.label : "Unknown";

      // Update the target node's sourceLabels array and change node type if necessary
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === connection.target) {
            // If node is not already a processor node, change its type
            let newType = node.type;
            if (node.type !== "processorNode") {
              newType = "processorNode";
            }
            return {
              ...node,
              type: newType,
              data: {
                ...node.data,
                sourceLabels: [...node.data.sourceLabels, sourceLabel],
              },
            };
          }
          return node;
        })
      );
    },
    [nodes, setEdges, setNodes]
  );

  // Function to handle edge deletion
  const onEdgeClick = useCallback(
    (event, edge) => {
      event.preventDefault();
      const confirmDelete = window.confirm("Do you want to delete this connection?");
      if (confirmDelete) {
        // Remove the edge
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));

        // Find the target node
        const targetNode = nodes.find((node) => node.id === edge.target);
        if (targetNode) {
          // Find the source node's label
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const sourceLabel = sourceNode ? sourceNode.data.label : "Unknown";

          // Remove the source label from the target node's sourceLabels array
          const updatedSourceLabels = targetNode.data.sourceLabels.filter(
            (label) => label !== sourceLabel
          );

          // If no more source labels, change node type back to 'inputNode'
          const newType = updatedSourceLabels.length === 0 ? "inputNode" : "processorNode";

          setNodes((nds) =>
            nds.map((node) =>
              node.id === edge.target
                ? {
                    ...node,
                    type: newType,
                    data: {
                      ...node.data,
                      sourceLabels: updatedSourceLabels,
                      process: updatedSourceLabels.length === 0 ? "" : node.data.process,
                    },
                  }
                : node
            )
          );
        }
      }
    },
    [nodes, setEdges, setNodes]
  );

  // Function to add a new node
  const addNode = useCallback(() => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode = {
      id: newNodeId,
      type: "inputNode",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `Node ${newNodeId}`,
        value: `Value_${newNodeId}`, // Initialize with no spaces
        process: "", // Initialize with no process
        sourceLabels: [], // Initialize with no source labels
        dataType: "single", // Default data type
        from: "", // Initialize FROM for range
        to: "", // Initialize TO for range
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, setNodes]);

  // Function to handle node data changes with uniqueness validation
  const handleNodeDataChange = useCallback(
    (id, field, value) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            // Clone the node data
            const newData = { ...node.data };
            const oldLabel = node.data.label;
            const oldValue = node.data.value;

            // Handle uniqueness based on field and data type
            if (field === "label") {
              // Update label and propagate to connected processor nodes
              newData.label = value;

              // Find all outgoing edges from this node
              const outgoingEdges = edges.filter((edge) => edge.source === id);

              // Update all connected processor nodes
              outgoingEdges.forEach((edge) => {
                const targetNode = nds.find((n) => n.id === edge.target);
                if (targetNode && targetNode.type === "processorNode") {
                  // Update the target node's sourceLabels
                  setNodes((prevNodes) =>
                    prevNodes.map((n) => {
                      if (n.id === edge.target) {
                        const updatedSourceLabels = n.data.sourceLabels.map((label) =>
                          label === oldLabel ? value : label
                        );
                        return {
                          ...n,
                          data: {
                            ...n.data,
                            sourceLabels: updatedSourceLabels,
                          },
                        };
                      }
                      return n;
                    })
                  );
                }
              });
            }

            if (field === "value" && node.data.dataType === "single") {
              const newValue = value;

              // Check if the newValue is already used
              if (usedSingleValues.includes(newValue)) {
                alert(
                  `The value "${newValue}" is already in use. Please choose a unique value.`
                );
                return node; // Prevent update
              }

              // Deallocate the old value first
              if (oldValue && oldValue !== newValue) {
                deallocateSingleValue(oldValue);
              }

              // Allocate the new value
              allocateSingleValue(newValue);

              newData.value = newValue;
            }

            if (field === "from" || field === "to") {
              const from = field === "from" ? value : node.data.from;
              const to = field === "to" ? value : node.data.to;

              // Only proceed if both from and to are set
              if (from && to) {
                const newRange = `${from}:${to}`;

                // Check if the newRange is already used
                if (usedRanges.includes(newRange)) {
                  alert(
                    `The range "${newRange}" is already in use. Please choose a unique range.`
                  );
                  return node; // Prevent update
                }

                // Deallocate the old range first
                if (node.data.from && node.data.to) {
                  const oldRange = `${node.data.from}:${node.data.to}`;
                  if (oldRange !== newRange) {
                    deallocateRange(oldRange);
                  }
                }

                // Allocate the new range
                allocateRange(newRange);

                newData.from = from;
                newData.to = to;
                newData.value = newRange;
              } else {
                // If one of from or to is empty, just update
                if (field === "from") {
                  newData.from = from;
                } else {
                  newData.to = to;
                }
              }
            }

            if (field === "dataType") {
              newData.dataType = value;

              if (value === "single") {
                // If switching to single, deallocate any existing range
                if (node.data.from && node.data.to) {
                  const oldRange = `${node.data.from}:${node.data.to}`;
                  deallocateRange(oldRange);
                  newData.from = "";
                  newData.to = "";
                  newData.value = node.data.value; // Retain the single value
                }
              } else if (value === "range") {
                // If switching to range, deallocate any existing single value
                if (node.data.dataType === "single" && node.data.value) {
                  deallocateSingleValue(node.data.value);
                  newData.value = ""; // Reset value for new range
                }
              }
            }

            if (node.type === "processorNode" && field === "process") {
              newData.process = value;
            }

            return {
              ...node,
              data: newData,
            };
          }
          return node;
        })
      );
    },
    [
      edges,
      allocateRange,
      allocateSingleValue,
      deallocateRange,
      deallocateSingleValue,
      usedRanges,
      usedSingleValues,
      setNodes,
    ]
  );

  // Function to handle node deletion
  const deleteNode = useCallback(
    (nodeId) => {
      const nodeToDelete = nodes.find((n) => n.id === nodeId);
      if (!nodeToDelete) return;

      // Deallocate single value or range based on dataType
      if (nodeToDelete.data.dataType === "single" && nodeToDelete.data.value) {
        deallocateSingleValue(nodeToDelete.data.value);
      }

      if (nodeToDelete.data.dataType === "range" && nodeToDelete.data.value) {
        deallocateRange(nodeToDelete.data.value);
      }

      const connectedEdges = getConnectedEdges([nodeToDelete], edges);

      // Update target nodes' sourceLabels by removing the deleted node's label
      connectedEdges.forEach((edge) => {
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (targetNode) {
          const updatedSourceLabels = targetNode.data.sourceLabels.filter(
            (label) => label !== nodeToDelete.data.label
          );

          // If no more source labels, change node type back to 'inputNode'
          const newType = updatedSourceLabels.length === 0 ? "inputNode" : targetNode.type;

          setNodes((prevNodes) =>
            prevNodes.map((n) =>
              n.id === edge.target
                ? {
                    ...n,
                    type: newType,
                    data: {
                      ...n.data,
                      sourceLabels: updatedSourceLabels,
                      process:
                        updatedSourceLabels.length === 0 ? "" : n.data.process,
                    },
                  }
                : n
            )
          );
        }
      });

      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => !connectedEdges.some((ce) => ce.id === edge.id))
      );
    },
    [nodes, edges, setNodes, setEdges, deallocateSingleValue, deallocateRange]
  );

  // Determine which nodes have incoming edges
  const nodesWithIncoming = useMemo(() => {
    const incomingNodeIds = edges.map((edge) => edge.target);
    return new Set(incomingNodeIds);
  }, [edges]);

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // Function to save the flow to JSON
  const saveFlow = useCallback(() => {
    const flow = {
      nodes,
      edges,
    };
    const flowJSON = JSON.stringify(flow, null, 2);
    const blob = new Blob([flowJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flow.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Function to load the flow from JSON
  const loadFlow = useCallback(
    (event) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target.result);
          if (flow.nodes && flow.edges) {
            // Extract all used single values and ranges from loaded nodes
            const loadedSingleValues = flow.nodes
              .filter((node) => node.data.dataType === "single" && node.data.value)
              .map((node) => node.data.value);

            const loadedRanges = flow.nodes
              .filter((node) => node.data.dataType === "range" && node.data.value)
              .map((node) => node.data.value);

            setUsedSingleValues(loadedSingleValues);
            setUsedRanges(loadedRanges);

            setNodes(flow.nodes);
            setEdges(flow.edges);
          } else {
            alert("Invalid flow format");
          }
        } catch (error) {
          alert("Error reading flow file");
        }
      };
      if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0]);
      }
    },
    [setNodes, setEdges, setUsedSingleValues, setUsedRanges]
  );

  // Function to clear all nodes and edges
  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setUsedSingleValues([]);
    setUsedRanges([]);
  }, [setNodes, setEdges, setUsedSingleValues, setUsedRanges]);

  return (
    <div style={{ height: "100vh" }}>
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
          style={{ display: "none" }}
        />
        <button onClick={clearAll} className="clear-all-button">
          Clear All Nodes
        </button>
      </div>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map((node) => {
            const commonData = {
              ...node.data,
              onChange: handleNodeDataChange,
              onDelete: deleteNode,
            };
            if (node.type === "inputNode") {
              return {
                ...node,
                data: {
                  ...commonData,
                  isConnected: nodesWithIncoming.has(node.id),
                  availableLabels: availableLabels,
                },
              };
            } else if (node.type === "processorNode") {
              return {
                ...node,
                data: {
                  ...commonData,
                  processList: PROCESS_LIST,
                  sourceLabels: node.data.sourceLabels,
                },
              };
            } else {
              return node;
            }
          })}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={memoizedNodeTypes}
          fitView
          style={{ backgroundColor: "#1e1e1e" }}
          proOptions={proOptions}
        >
          <Background color="#555" gap={16} />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default App;