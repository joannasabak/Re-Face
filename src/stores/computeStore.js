import { useSyncExternalStore } from "react";

let computing = false;
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Plain object that non-React code (compute.js) can read and write.
export const store = {
  get computing() {
    return computing;
  },
  set computing(value) {
    computing = value;
    listeners.forEach((listener) => listener());
  },
};

// Hook that re-renders a React component whenever the store changes.
export function useComputeStore() {
  return { computing: useSyncExternalStore(subscribe, () => computing) };
}
