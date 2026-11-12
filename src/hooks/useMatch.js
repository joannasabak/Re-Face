import { useRef, useState } from "react";
import { matchPanels } from "../scripts/api.js";

//panel matching against the inventory
//loading and error state, and the matching rules sent to the API
export function useInventoryMatch() {
  const [panels, setPanels] = useState([]); //tagged panels of current geometry
  const [results, setResults] = useState(null); //answer from /match or null
  const [error, setError] = useState(null); //message if matching failed
  const [matching, setMatching] = useState(false); //true while waiting for the API
  const [showMatches, setShowMatches] = useState(true); //colour the panels or not
  const [settings, setSettings] = useState({ allowRotation: true }); //sent to the API
  const latestRequest = useRef(0); //ignore answers that arrive too late

  function reset() {
    latestRequest.current++;
    setResults(null);
    setError(null);
    setMatching(false);
  }

  //called by GeometryView every time new geometry arrives
  function updatePanels(newPanels) {
    reset();
    setPanels(newPanels);
  }

  //called by the matching rule toggle as (newValue, settingName)
  function updateSetting(newValue, settingName) {
    reset();
    setSettings((current) => ({ ...current, [settingName]: newValue }));
  }

  //called by the "Compare with inventory" button
  async function compare() {
    const request = ++latestRequest.current;
    setMatching(true);
    setError(null);

    console.log(`Sending ${panels.length} panels to the API for matching (sizes in mm):`);
    console.table(panels);

    try {
      const answer = await matchPanels(panels, settings);
      //facade may have changed while we waited
      if (request === latestRequest.current) {
        setResults(answer);
        setShowMatches(true);
      }
    } catch (matchError) {
      if (request === latestRequest.current) {
        setError(matchError.message);
      }
    } finally {
      if (request === latestRequest.current) {
        setMatching(false);
      }
    }
  }

  //matches to colour in the 3D view
  const shownMatches = showMatches && results !== null ? results.matches : null;

  return {
    panels,
    results,
    error,
    matching,
    settings,
    showMatches,
    setShowMatches,
    shownMatches,
    updatePanels,
    updateSetting,
    compare,
  };
}
