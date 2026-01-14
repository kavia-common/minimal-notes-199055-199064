import { useEffect, useRef, useState } from "react";

/**
 * Safely parse a JSON string, returning a fallback on errors.
 * @param {string|null} raw
 * @param {any} fallback
 * @returns {any}
 */
function safeJsonParse(raw, fallback) {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Returns true if two values are deeply equal via JSON stringify.
 * This is sufficient for our notes array usage and avoids extra dependencies.
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
function jsonEqual(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

// PUBLIC_INTERFACE
export function useLocalStorage(key, initialValue) {
  /** A React hook that persists a JSON-serializable value to localStorage. */
  const [value, setValue] = useState(() => {
    const raw = window.localStorage.getItem(key);
    return safeJsonParse(raw, initialValue);
  });

  const lastSavedRef = useRef(value);

  useEffect(() => {
    // Avoid writing if no meaningful changes.
    if (jsonEqual(lastSavedRef.current, value)) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      lastSavedRef.current = value;
    } catch {
      // If storage is full or blocked, we still keep state in memory.
    }
  }, [key, value]);

  return [value, setValue];
}
