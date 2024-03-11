import { useEffect } from 'react';

export const useDebounce = (
  effect: () => void,
  deps: Array<unknown>,
  delay: number,
) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay]);
};
