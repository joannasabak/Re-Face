import { useCallback, useState } from "react";

//holds the inputs sent to Rhino.Compute updateValue(newValue, parameterName)
//only changes parameters that were declared in the initial object.
export function useInputs(initialInputs) {
  const [inputs, setInputs] = useState(initialInputs);

  const updateValue = useCallback((newValue, parameterName) => {
    setInputs((current) => {
      if (!Object.hasOwn(current, parameterName)) return current;
      if (current[parameterName] === newValue) return current;
      return { ...current, [parameterName]: newValue };
    });
  }, []);

  return [inputs, updateValue];
}
