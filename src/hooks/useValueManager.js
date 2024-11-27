// src/hooks/useValueManager.js
import { useState, useCallback } from 'react';

const useValueManager = () => {
  const [usedSingleValues, setUsedSingleValues] = useState([]);
  const [usedRanges, setUsedRanges] = useState([]);

  const allocateSingleValue = useCallback((newValue) => {
    setUsedSingleValues((prev) => [...prev, newValue]);
  }, []);

  const deallocateSingleValue = useCallback((oldValue) => {
    setUsedSingleValues((prev) => prev.filter((val) => val !== oldValue));
  }, []);

  const allocateRange = useCallback((newRange) => {
    setUsedRanges((prev) => [...prev, newRange]);
  }, []);

  const deallocateRange = useCallback((oldRange) => {
    setUsedRanges((prev) => prev.filter((range) => range !== oldRange));
  }, []);

  return {
    usedSingleValues,
    usedRanges,
    allocateSingleValue,
    deallocateSingleValue,
    allocateRange,
    deallocateRange,
    setUsedSingleValues,
    setUsedRanges,
  };
};

export default useValueManager;