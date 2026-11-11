import { useEffect, useRef, useState } from "react";

import GeometryView from "../components/GeometryView.jsx";
import FacadePicker from "../components/FacadePicker.jsx";
import FacadeSettings from "../components/FacadeSettings.jsx";
import ModelSummary from "../components/ModelSummary.jsx";
import MatchSummary from "../components/MatchSummary.jsx";
import { matchPanels } from "../scripts/api.js";
import { FACADE_TYPES, defaultValues } from "../facades/facadeTypes.js";

import styles from "../ui/Sidebar.module.css";

//settings are saved in the browser
const STORAGE_KEY = "re-face:configurator:v2";

export default function FacadeConfigurator({ active = true }) {
  const [saved] = useState(loadSettings);
  const [selectedId, setSelectedId] = useState(saved.selectedId);
  //settings for every facade type
  const [valuesById, setValuesById] = useState(saved.valuesById);
  const [metadata, setMetadata] = useState([]);

  //panel matching
  const [facadePanels, setFacadePanels] = useState([]); // the tagged panels of the current geometry
  const [matchResults, setMatchResults] = useState(null); // the answer from /match, or null
  const [matchError, setMatchError] = useState(null); // a message if matching failed
  const [matching, setMatching] = useState(false); // true while waiting for the API
  const [showMatches, setShowMatches] = useState(true); // colour the panels or not
  const [matchSettings, setMatchSettings] = useState({ allowRotation: true }); // sent to the API
  const latestMatchRequest = useRef(0); // used to ignore answers that arrive too late

  const facade = FACADE_TYPES.find((f) => f.id === selectedId);
  const inputs = valuesById[selectedId];

  // save whenever the selection or a setting changes
  useEffect(() => {
    saveSettings({ selectedId, valuesById });
  }, [selectedId, valuesById]);

  function selectFacade(id) {
    if (id === selectedId) return;
    setSelectedId(id);
    setMetadata([]);
  }

  // called by GeometryView every time new geometry arrives, with the panels it found
  function updatePanels(panels) {
    // results (or an answer still on its way) belong to the old geometry, so forget them
    latestMatchRequest.current++;
    setFacadePanels(panels);
    setMatchResults(null);
    setMatchError(null);
    setMatching(false);
  }

  // called by the "Compare with inventory" button
  async function compareWithInventory() {
    latestMatchRequest.current++;
    const request = latestMatchRequest.current;

    setMatching(true);
    setMatchError(null);

    console.log(`Sending ${facadePanels.length} panels to the API for matching (sizes in mm):`);
    console.table(facadePanels);

    try {
      const results = await matchPanels(facadePanels, matchSettings);
      // the facade may have changed while we waited: only keep the answer if it's still current
      if (request === latestMatchRequest.current) {
        setMatchResults(results);
        setShowMatches(true);
      }
    } catch (error) {
      if (request === latestMatchRequest.current) {
        setMatchError(error.message);
      }
    } finally {
      // runs after try or catch, whichever happened
      if (request === latestMatchRequest.current) {
        setMatching(false);
      }
    }
  }

  // called by the matching rule toggle as (newValue, settingName)
  function updateMatchSetting(newValue, settingName) {
    setMatchSettings({ ...matchSettings, [settingName]: newValue });
    // the results were worked out with the old rules, so forget them
    latestMatchRequest.current++;
    setMatchResults(null);
    setMatching(false);
  }

  // the matches to colour in the 3D view, or null for no colours
  let shownMatches = null;
  if (showMatches && matchResults !== null) {
    shownMatches = matchResults.matches;
  }

  // put the current facade's settings back to their starting values
  function resetSettings() {
    setValuesById({ ...valuesById, [selectedId]: defaultValues(facade) });
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
      <GeometryView
        data={inputs}
        path={facade.definition}
        onUpdateMetadata={setMetadata}
        onUpdatePanels={updatePanels}
        matches={shownMatches}
        active={active}
      />

      <div className={styles.sidebar}>
        <h2>Facade type</h2>
        <hr />
        <FacadePicker facades={FACADE_TYPES} selectedId={selectedId} onChange={selectFacade} />

        <h2 className={styles.sectionTitle}>Settings</h2>
        <hr />
        <FacadeSettings facade={facade} values={inputs} onUpdate={updateValue} />
        <button type="button" className={styles.resetButton} onClick={resetSettings}>
          Reset settings
        </button>

        <MatchSummary
          panelCount={facadePanels.length}
          results={matchResults}
          error={matchError}
          matching={matching}
          onCompare={compareWithInventory}
          settings={matchSettings}
          onSettingChange={updateMatchSetting}
          showMatches={showMatches}
          onShowMatchesChange={setShowMatches}
        />

        {/* <ModelSummary metadata={metadata} /> */}
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