// src/App.js
import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  getConnectedEdges,
} from "react-flow-renderer";
import CustomNode from "./components/CustomNode";
import "./App.css";
import { PROCESS_LIST } from "./components/Processes"; // Ensure this path is correct

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

const nodeTypes = { customNode: CustomNode };

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State to track used single input values and ranges
  const [usedSingleValues, setUsedSingleValues] = useState([]);
  const [usedRanges, setUsedRanges] = useState([]);

  const proOptions = { hideAttribution: true };

  // Handler to allocate a single input value
  const allocateSingleValue = useCallback(
    (newValue) => {
      setUsedSingleValues((prev) => [...prev, newValue]);
    },
    [setUsedSingleValues]
  );

  // Handler to deallocate a single input value
  const deallocateSingleValue = useCallback(
    (oldValue) => {
      setUsedSingleValues((prev) => prev.filter((val) => val !== oldValue));
    },
    [setUsedSingleValues]
  );

  // Handler to allocate a range
  const allocateRange = useCallback(
    (newRange) => {
      setUsedRanges((prev) => [...prev, newRange]);
    },
    [setUsedRanges]
  );

  // Handler to deallocate a range
  const deallocateRange = useCallback(
    (oldRange) => {
      setUsedRanges((prev) => prev.filter((range) => range !== oldRange));
    },
    [setUsedRanges]
  );

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

      // Find the source node's value
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const sourceValue = sourceNode ? sourceNode.data.value : "Unknown";

      // Update the target node's sourceLabels array
      setNodes((nds) =>
        nds.map((node) =>
          node.id === connection.target
            ? {
                ...node,
                data: {
                  ...node.data,
                  sourceLabels: [...node.data.sourceLabels, sourceValue],
                },
              }
            : node
        )
      );
    },
    [nodes, setEdges, setNodes]
  );

  // Function to handle edge deletion
  const onEdgeClick = useCallback(
    (event, edge) => {
      event.preventDefault();
      const confirmDelete = window.confirm(
        "Do you want to delete this connection?"
      );
      if (confirmDelete) {
        // Remove the edge
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));

        // Find the target node
        const targetNode = nodes.find((node) => node.id === edge.target);
        if (targetNode) {
          // Find the source node's value
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const sourceValue = sourceNode ? sourceNode.data.value : "Unknown";

          // Remove the source value from the target node's sourceLabels array
          const updatedSourceLabels = targetNode.data.sourceLabels.filter(
            (label) => label !== sourceValue
          );

          setNodes((nds) =>
            nds.map((node) =>
              node.id === edge.target
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      sourceLabels: updatedSourceLabels,
                      process:
                        updatedSourceLabels.length === 0
                          ? ""
                          : node.data.process,
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
                        process: "",
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

  // Function to add a new node
  const addNode = useCallback(() => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode = {
      id: newNodeId,
      type: "customNode",
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

            // Handle uniqueness based on field and data type
            if (field === "value" && node.data.dataType === "single") {
              const newValue = value;

              // Deallocate the old value first
              if (node.data.value && node.data.value !== newValue) {
                deallocateSingleValue(node.data.value);
              }

              // Check if the newValue is already used
              if (usedSingleValues.includes(newValue)) {
                alert(
                  `The value "${newValue}" is already in use. Please choose a unique value.`
                );
                return node; // Prevent update
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

                // Deallocate the old range first
                if (node.data.from && node.data.to) {
                  const oldRange = `${node.data.from}:${node.data.to}`;
                  if (oldRange !== newRange) {
                    deallocateRange(oldRange);
                  }
                }

                // Check if the newRange is already used
                if (usedRanges.includes(newRange)) {
                  alert(
                    `The range "${newRange}" is already in use. Please choose a unique range.`
                  );
                  return node; // Prevent update
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

            if (field === "process") {
              newData.process = value;

              // Update the value based on the selected process and sourceLabels
              if (value && node.data.sourceLabels.length > 0) {
                const processedValue = `${value}(${node.data.sourceLabels.join(
                  ", "
                )})`;
                newData.value = processedValue;
              } else if (!value && node.data.sourceLabels.length > 0) {
                // If no process is selected, default to "Process(x)"
                const processedValue = `Process(${node.data.sourceLabels.join(
                  ", "
                )})`;
                newData.value = processedValue;
              }
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
      usedSingleValues,
      usedRanges,
      allocateSingleValue,
      deallocateSingleValue,
      allocateRange,
      deallocateRange,
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
              .filter(
                (node) => node.data.dataType === "single" && node.data.value
              )
              .map((node) => node.data.value);

            const loadedRanges = flow.nodes
              .filter(
                (node) => node.data.dataType === "range" && node.data.value
              )
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
    [setNodes, setEdges]
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
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onChange: handleNodeDataChange,
              onDelete: deleteNode,
              isConnected: nodesWithIncoming.has(node.id),
              processList: PROCESS_LIST, // Pass processList to CustomNode
              availableLabels: availableLabels, // For range selection
            },
          }))}
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
