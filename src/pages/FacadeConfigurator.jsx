import { useEffect, useState } from "react";

import GeometryView from "../components/GeometryView.jsx";
import FacadePicker from "../components/FacadePicker.jsx";
import FacadeSettings from "../components/FacadeSettings.jsx";
import ModelSummary from "../components/ModelSummary.jsx";
import { FACADE_TYPES, defaultValues } from "../facades/facadeTypes.js";

import styles from "../ui/Sidebar.module.css";

//settings are cached in browser local storage
//change the version number if the saved format ever changes
const STORAGE_KEY = "re-face:configurator:v1";

export default function FacadeConfigurator({ active = true }) {
  const [saved] = useState(loadSettings);
  const [selectedId, setSelectedId] = useState(saved.selectedId);
  //settings for every facade type
  const [valuesById, setValuesById] = useState(saved.valuesById);
  const [metadata, setMetadata] = useState([]);

  const facade = FACADE_TYPES.find((f) => f.id === selectedId);
  const inputs = valuesById[selectedId];

  //save whenever the selection or a setting changes
  useEffect(() => {
    saveSettings({ selectedId, valuesById });
  }, [selectedId, valuesById]);

  function selectFacade(id) {
    if (id === selectedId) return;
    setSelectedId(id);
    setMetadata([]);
  }

  function resetSettings() {
    setValuesById({ ...valuesById, [selectedId]: defaultValues(facade) });
  }

  // called by the sliders/toggles
  function updateValue(newValue, inputName) {
    setValuesById((current) => {
      const values = current[selectedId];
      if (!Object.hasOwn(values, inputName) || values[inputName] === newValue) return current;
      return { ...current, [selectedId]: { ...values, [inputName]: newValue } };
    });
  }

  return (
    <div>
      <GeometryView data={inputs} path={facade.definition} onUpdateMetadata={setMetadata} active={active} />

      <div className={styles.sidebar}>
        <h2>Facade type</h2>
        <hr />
        <FacadePicker facades={FACADE_TYPES} selectedId={selectedId} onChange={selectFacade} />

        <h2 className={styles.sectionTitle}>Settings</h2>
        <hr />
        <FacadeSettings facade={facade} values={inputs} onUpdate={updateValue} />
        <br />
        <button type="button" className={styles.resetButton} onClick={resetSettings}>
          Reset settings
        </button>

        <ModelSummary metadata={metadata} />
      </div>
    </div>
  );
}

// Reads saved settings, falling back to defaults for anything missing or no longer valid
// (for example after you rename an input or change a slider's range in facadeTypes.js).
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