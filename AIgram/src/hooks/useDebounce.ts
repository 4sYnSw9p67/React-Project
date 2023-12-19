import { useEffect, useState } from "react";

/**
 * Debounces a value by delaying updates for a given amount of time.
 *
 * @template T - The type of the value being debounced.
 * @param {T} value - The value to be debounced.
 * @param {number} delay - The delay in milliseconds before updating the debounced value.
 * @return {T} - The debounced value.
 * 
 * https://codesandbox.io/s/react-query-debounce-ted8o?file=/src/useDebounce.js
 */
export default function useDebounce<T>(value: T, delay: number): T {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Update debounced value after delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancel the timeout if value changes (also on delay change or unmount)
        // This is how we prevent debounced value from updating if value is changed ...
        // .. within the delay period. Timeout gets cleared and restarted.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-call effect if value or delay changes

    return debouncedValue;
}
