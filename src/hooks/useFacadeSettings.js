import { useEffect, useState } from "react";
import { FACADE_TYPES, defaultValues } from "../facades/facadeTypes.js";

//settings are saved in the browser
const STORAGE_KEY = "re-face:configurator:v2";

//the selected facade type and the input values of every facade type,
//remembered in localStorage between visits
export function useFacadeSettings() {
  const [saved] = useState(loadSettings);
  const [selectedId, setSelectedId] = useState(saved.selectedId);
  const [valuesById, setValuesById] = useState(saved.valuesById);

  const facade = FACADE_TYPES.find((f) => f.id === selectedId);
  const inputs = valuesById[selectedId];

  //save whenever the selection or a setting changes
  useEffect(() => {
    saveSettings({ selectedId, valuesById });
  }, [selectedId, valuesById]);

  function selectFacade(id) {
    setSelectedId(id);
  }

  function resetSettings() {
    setValuesById((current) => ({ ...current, [selectedId]: defaultValues(facade) }));
  }

  //called by the sliders/toggles as (newValue, inputName)
  function updateValue(newValue, inputName) {
    setValuesById((current) => {
      const values = current[selectedId];
      if (!Object.hasOwn(values, inputName) || values[inputName] === newValue) return current;
      return { ...current, [selectedId]: { ...values, [inputName]: newValue } };
    });
  }

  return { facades: FACADE_TYPES, facade, selectedId, inputs, selectFacade, updateValue, resetSettings };
}

//reads saved settings, falling back to defaults for anything missing or no longer valid
function loadSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    // nothing saved yet, storage blocked, or unreadable data: use defaults
  }

  const valuesById = {};
  for (const facade of FACADE_TYPES) {
    const values = defaultValues(facade);
    const savedValues = saved.valuesById?.[facade.id] ?? {};
    for (const input of facade.inputs) {
      const value = savedValues[input.name];
      if (typeof value !== typeof input.value) continue; // wrong type or missing
      values[input.name] = input.type === "slider" ? clamp(value, input.min, input.max) : value;
    }
    valuesById[facade.id] = values;
  }

  const selectedExists = FACADE_TYPES.some((facade) => facade.id === saved.selectedId);
  return {
    selectedId: selectedExists ? saved.selectedId : FACADE_TYPES[0].id,
    valuesById,
  };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage full or blocked (e.g. some private windows): the app still works, it just won't remember
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
