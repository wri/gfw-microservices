import { useRef, useCallback } from 'react';

const useHookWithRefCallback = (renderChart) => {
  const ref = useRef(null);
  const setRef = useCallback(
    (node) => {
      if (node) {
        renderChart(node);
      }
      ref.current = node;
    },
    [renderChart]
  );

  return [setRef];
};

export default useHookWithRefCallback;
