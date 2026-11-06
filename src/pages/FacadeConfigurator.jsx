import { useState } from "react";

import GeometryView from "../components/GeometryView.jsx";
import FacadePicker from "../components/FacadePicker.jsx";
import FacadeSettings from "../components/FacadeSettings.jsx";
import ModelSummary from "../components/ModelSummary.jsx";
import { FACADE_TYPES, defaultValues } from "../facades/facadeTypes.js";

import styles from "../ui/Sidebar.module.css";

export default function FacadeConfigurator() {
  const [selectedId, setSelectedId] = useState(FACADE_TYPES[0].id);
  // settings for every facade type, so switching back keeps what you set
  const [valuesById, setValuesById] = useState(() =>
    Object.fromEntries(FACADE_TYPES.map((facade) => [facade.id, defaultValues(facade)]))
  );
  const [metadata, setMetadata] = useState([]);

  const facade = FACADE_TYPES.find((f) => f.id === selectedId);
  const inputs = valuesById[selectedId];

  function selectFacade(id) {
    if (id === selectedId) return;
    setSelectedId(id);
    setMetadata([]);
  }

  // called by the sliders/toggles as (newValue, inputName)
  function updateValue(newValue, inputName) {
    setValuesById((current) => {
      const values = current[selectedId];
      if (!Object.hasOwn(values, inputName) || values[inputName] === newValue) return current;
      return { ...current, [selectedId]: { ...values, [inputName]: newValue } };
    });
  }

  return (
    <div>
      <GeometryView data={inputs} path={facade.definition} onUpdateMetadata={setMetadata} />

      <div className={styles.sidebar}>
        <h2>Facade type</h2>
        <hr />
        <FacadePicker facades={FACADE_TYPES} selectedId={selectedId} onChange={selectFacade} />

        <h2 className={styles.sectionTitle}>Settings</h2>
        <hr />
        <FacadeSettings facade={facade} values={inputs} onUpdate={updateValue} />

        <ModelSummary metadata={metadata} />
      </div>
    </div>
  );
}
