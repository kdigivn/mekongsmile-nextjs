/* eslint-disable @arthurgeron/react-usememo/require-usememo */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback } from "react";

type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

type UseDebounceReturn<T extends (...args: any[]) => any> = [
  DebouncedFunction<T>,
  () => void,
  () => ReturnType<T> | undefined,
];

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): UseDebounceReturn<T> => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastResultRef = useRef<ReturnType<T> | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const result = callback(...args);
        lastResultRef.current = result;
      }, delay);
    },
    [callback, delay]
  ) as DebouncedFunction<T>;

  // Cleanup function
  const cancel = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const getLastResult = useCallback((): ReturnType<T> | undefined => {
    return lastResultRef.current;
  }, []);

  return [debouncedCallback, cancel, getLastResult];
};
