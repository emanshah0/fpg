// src/hooks/useNodeManager.js
import { useCallback, useState } from 'react';

const useNodeManager = (setNodes, setEdges) => {
  const [usedValues, setUsedValues] = useState(new Set());

  const validateValue = useCallback(
    (value) => !usedValues.has(value),
    [usedValues]
  );

  const allocateValue = useCallback(
    (value) => setUsedValues((prev) => new Set(prev).add(value)),
    []
  );

  const deallocateValue = useCallback(
    (value) =>
      setUsedValues((prev) => {
        const newSet = new Set(prev);
        newSet.delete(value);
        return newSet;
      }),
    []
  );

  const handleNodeDataChange = useCallback(
    (id, field, value) => {
      // Handle node data changes with validation
    },
    [setNodes, validateValue, allocateValue, deallocateValue]
  );

  const deleteNode = useCallback(
    (nodeId) => {
      // Handle node deletion
    },
    [setNodes, setEdges, deallocateValue]
  );

  return {
    handleNodeDataChange,
    deleteNode,
    validateValue,
    allocateValue,
    deallocateValue,
  };
};

export default useNodeManager;
