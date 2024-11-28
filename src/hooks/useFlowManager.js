// src/hooks/useFlowManager.js
import { useCallback, useMemo } from 'react';
import { useNodesState, useEdgesState, addEdge, getConnectedEdges } from 'react-flow-renderer';
import useValueManager from './useValueManager';
import { PROCESS_LIST } from '../components/Processes';
import { generateLabels } from '../utils/labelGenerator';

// const nodeTypes = { inputNode: 'inputNode', processorNode: 'processorNode' };
const ALL_LABELS = generateLabels();

const useFlowManager = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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

  const availableLabels = useMemo(
    () => ALL_LABELS.filter((label) => !usedRanges.includes(label)),
    [usedRanges]
  );

  const handleNodeDataChange = useCallback(
    (id, field, value) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const newData = { ...node.data };
            // const oldLabel = node.data.label;
            const oldValue = node.data.value;

            if (field === 'label') {
              newData.label = value;
              // Update connected nodes' sources
              edges.forEach((edge) => {
                if (edge.source === id) {
                  setNodes((prevNodes) =>
                    prevNodes.map((n) => {
                      if (n.id === edge.target) {
                        const updatedSources = (n.data.sources || []).map((source) =>
                          source.id === id ? { ...source, label: value } : source
                        );
                        console.log(`Processor Node ${n.id} updated sources:`, updatedSources);
                        return {
                          ...n,
                          data: { ...n.data, sources: updatedSources },
                        };
                      }
                      return n;
                    })
                  );
                }
              });
            }

            if (field === 'value') {
              if (node.data.dataType === 'single') {
                const newValue = value;

                if (usedSingleValues.includes(newValue)) {
                  alert(`The value "${newValue}" is already in use. Please choose a unique value.`);
                  return node;
                }

                if (oldValue && oldValue !== newValue) {
                  deallocateSingleValue(oldValue);
                }

                allocateSingleValue(newValue);

                newData.value = newValue;
                console.log(`Input Node ${id} new value:`, newValue);

                // Update connected processor nodes
                edges.forEach((edge) => {
                  if (edge.source === id) {
                    setNodes((prevNodes) =>
                      prevNodes.map((n) => {
                        if (n.id === edge.target) {
                          const updatedSources = (n.data.sources || []).map((source) =>
                            source.id === id ? { ...source, value: newValue } : source
                          );
                          console.log(`Processor Node ${n.id} updated sources:`, updatedSources);
                          return {
                            ...n,
                            data: { ...n.data, sources: updatedSources },
                          };
                        }
                        return n;
                      })
                    );
                  }
                });
              }

              if (node.data.dataType === 'range') {
                // Handle range value changes if necessary
                // Similar to single value changes
                console.log(`Input Node ${id} range updated to:`, value);
              }
            }

            if (field === 'from' || field === 'to') {
              const from = field === 'from' ? value : node.data.from;
              const to = field === 'to' ? value : node.data.to;

              if (from && to) {
                const newRange = `${from}:${to}`;

                if (usedRanges.includes(newRange)) {
                  alert(`The range "${newRange}" is already in use. Please choose a unique range.`);
                  return node;
                }

                if (node.data.from && node.data.to) {
                  const oldRange = `${node.data.from}:${node.data.to}`;
                  if (oldRange !== newRange) {
                    deallocateRange(oldRange);
                  }
                }

                allocateRange(newRange);

                newData.from = from;
                newData.to = to;
                newData.value = newRange;
                console.log(`Input Node ${id} range set to:`, newRange);

                // Update connected processor nodes
                edges.forEach((edge) => {
                  if (edge.source === id) {
                    setNodes((prevNodes) =>
                      prevNodes.map((n) => {
                        if (n.id === edge.target) {
                          const updatedSources = (n.data.sources || []).map((source) =>
                            source.id === id ? { ...source, value: newRange } : source
                          );
                          console.log(`Processor Node ${n.id} updated sources:`, updatedSources);
                          return {
                            ...n,
                            data: { ...n.data, sources: updatedSources },
                          };
                        }
                        return n;
                      })
                    );
                  }
                });
              } else {
                if (field === 'from') {
                  newData.from = from;
                } else {
                  newData.to = to;
                }
              }
            }

            if (field === 'dataType') {
              newData.dataType = value;

              if (value === 'single') {
                if (node.data.from && node.data.to) {
                  const oldRange = `${node.data.from}:${node.data.to}`;
                  deallocateRange(oldRange);
                  newData.from = '';
                  newData.to = '';
                  newData.value = node.data.value;
                }
              } else if (value === 'range') {
                if (node.data.dataType === 'single' && node.data.value) {
                  deallocateSingleValue(node.data.value);
                  newData.value = '';
                }
              }
            }

            if (node.type === 'processorNode' && field === 'process') {
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
      setNodes,
      edges,
      usedSingleValues,
      usedRanges,
      allocateSingleValue,
      deallocateSingleValue,
      allocateRange,
      deallocateRange,
    ]
  );

  const deleteNode = useCallback(
    (nodeId) => {
      const nodeToDelete = nodes.find((n) => n.id === nodeId);
      if (!nodeToDelete) return;

      if (nodeToDelete.data.dataType === 'single' && nodeToDelete.data.value) {
        deallocateSingleValue(nodeToDelete.data.value);
      }

      if (nodeToDelete.data.dataType === 'range' && nodeToDelete.data.value) {
        deallocateRange(nodeToDelete.data.value);
      }

      const connectedEdges = getConnectedEdges([nodeToDelete], edges);

      connectedEdges.forEach((edge) => {
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (targetNode) {
          const updatedSources = (targetNode.data.sources || []).filter(
            (source) => source.id !== nodeToDelete.id
          );

          console.log(`Processor Node ${targetNode.id} updated sources after deletion:`, updatedSources);

          const newType = updatedSources.length === 0 ? 'inputNode' : 'processorNode';

          setNodes((prevNodes) =>
            prevNodes.map((n) =>
              n.id === edge.target
                ? {
                    ...n,
                    type: newType,
                    data: {
                      ...n.data,
                      sources: updatedSources,
                      process: updatedSources.length === 0 ? '' : n.data.process,
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

  const onConnect = useCallback(
    (connection) => {
      const newEdge = {
        ...connection,
        id: `edge-${Date.now()}`,
        animated: false,
      };
      setEdges((eds) => addEdge(newEdge, eds));

      const sourceNode = nodes.find((node) => node.id === connection.source);
      const sourceLabel = sourceNode ? sourceNode.data.label : 'Unknown';
      const sourceValue = sourceNode ? sourceNode.data.value : 'Unknown';

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === connection.target) {
            const existingSources = node.data.sources || [];
            // Avoid duplicate sources
            const isAlreadyConnected = existingSources.some(src => src.id === sourceNode.id);
            if (isAlreadyConnected) {
              console.warn(`Source node ${sourceNode.id} is already connected to processor node ${node.id}`);
              return node;
            }
            const updatedSources = [
              ...existingSources,
              { id: sourceNode.id, label: sourceLabel, value: sourceValue },
            ];
            console.log(`Processor Node ${node.id} added source:`, { id: sourceNode.id, label: sourceLabel, value: sourceValue });
            return {
              ...node,
              type: 'processorNode',
              data: {
                ...node.data,
                sources: updatedSources,
              },
            };
          }
          return node;
        })
      );
    },
    [nodes, setEdges, setNodes]
  );

  const addNode = useCallback(() => {
    const newNodeId = `${+new Date()}`;
    const newNode = {
      id: newNodeId,
      type: 'inputNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `Node_${newNodeId}`,
        value: '',
        process: '',
        sources: [], // Ensure sources are initialized
        dataType: 'single',
        from: '',
        to: '',
        onChange: handleNodeDataChange,
        onDelete: deleteNode,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, handleNodeDataChange, deleteNode]);

  const onEdgeClick = useCallback(
    (event, edge) => {
      event.preventDefault();
      const confirmDelete = window.confirm('Do you want to delete this connection?');
      if (confirmDelete) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));

        const targetNode = nodes.find((node) => node.id === edge.target);
        if (targetNode) {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          // const sourceLabel = sourceNode ? sourceNode.data.label : 'Unknown';
          const sourceId = sourceNode ? sourceNode.id : null;

          if (sourceId) {
            const updatedSources = (targetNode.data.sources || []).filter(
              (source) => source.id !== sourceId
            );

            console.log(`Processor Node ${targetNode.id} updated sources after edge deletion:`, updatedSources);

            const newType = updatedSources.length === 0 ? 'inputNode' : 'processorNode';

            setNodes((nds) =>
              nds.map((node) =>
                node.id === edge.target
                  ? {
                      ...node,
                      type: newType,
                      data: {
                        ...node.data,
                        sources: updatedSources,
                        process: updatedSources.length === 0 ? '' : node.data.process,
                      },
                    }
                  : node
              )
            );
          }
        }
      }
    },
    [nodes, setEdges, setNodes]
  );

  const saveFlow = useCallback(() => {
    const flow = { nodes, edges };
    const blob = new Blob([JSON.stringify(flow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flow.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const loadFlow = useCallback(
    (event) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target.result);
          if (flow.nodes && flow.edges) {
            const loadedSingleValues = flow.nodes
              .filter((node) => node.data.dataType === 'single' && node.data.value)
              .map((node) => node.data.value);

            const loadedRanges = flow.nodes
              .filter((node) => node.data.dataType === 'range' && node.data.value)
              .map((node) => node.data.value);

            setUsedSingleValues(loadedSingleValues);
            setUsedRanges(loadedRanges);

            setNodes(
              flow.nodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  sources: node.data.sources || [], // Ensure sources are initialized
                  onChange: handleNodeDataChange,
                  onDelete: deleteNode,
                },
              }))
            );
            setEdges(flow.edges);
          } else {
            alert('Invalid flow format');
          }
        } catch {
          alert('Error reading flow file');
        }
      };
      if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0]);
      }
    },
    [setNodes, setEdges, setUsedSingleValues, setUsedRanges, handleNodeDataChange, deleteNode]
  );

  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setUsedSingleValues([]);
    setUsedRanges([]);
  }, [setNodes, setEdges, setUsedSingleValues, setUsedRanges]);

  // Determine which nodes have incoming edges
  const nodesWithIncoming = useMemo(() => {
    const incomingNodeIds = edges.map((edge) => edge.target);
    return new Set(incomingNodeIds);
  }, [edges]);

  // Update nodes with necessary data
  const updatedNodes = useMemo(
    () =>
      nodes.map((node) => {
        const commonData = {
          ...node.data,
          onChange: handleNodeDataChange,
          onDelete: deleteNode,
        };
        if (node.type === 'inputNode') {
          return {
            ...node,
            data: {
              ...commonData,
              isConnected: nodesWithIncoming.has(node.id),
              availableLabels: availableLabels,
            },
          };
        } else if (node.type === 'processorNode') {
          return {
            ...node,
            data: {
              ...commonData,
              processList: PROCESS_LIST,
              sources: node.data.sources || [], // Ensure sources is an array
            },
          };
        } else {
          return node;
        }
      }),
    [nodes, handleNodeDataChange, deleteNode, nodesWithIncoming, availableLabels]
  );

  return {
    nodes: updatedNodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgeClick,
    addNode,
    saveFlow,
    loadFlow,
    clearAll,
  };
};

export default useFlowManager;