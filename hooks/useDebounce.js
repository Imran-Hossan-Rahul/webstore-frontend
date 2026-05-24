import { useState, useEffect } from 'react';

/**
 * ⚡ USE DEBOUNCE HOOK
 * 
 * Delays updating a value until a specified time has passed.
 * Perfect for search inputs to prevent excessive filtering/API calls.
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
