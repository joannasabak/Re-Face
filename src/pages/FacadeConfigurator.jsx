import { useState, useMemo } from "react";

import GeometryView from "../components/GeometryView.jsx";
import FacadePicker from "../components/FacadePicker.jsx";
import FacadeSettings from "../components/FacadeSettings.jsx";
import MatchSummary from "../components/MatchSummary.jsx";
import ChartsPanel from "../components/ChartsPanel.jsx";
import { useFacadeSettings } from "../hooks/useFacadeSettings.js";
import { useInventoryMatch } from "../hooks/useMatch.js";
import { useCarbonFactor } from "../hooks/useCarbonFactor.js";
import GeometrySource from "../components/GeometrySource.jsx";
import { UPLOAD } from "../facades/facadeTypes.js";

import styles from "../ui/Sidebar.module.css";
import chartsStyles from "../ui/ChartsPanel.module.css";

const DEMO_SOURCE = { mode: "demo" };

export default function FacadeConfigurator({ active = true }) {
  const settings = useFacadeSettings();
  const match = useInventoryMatch();
  const carbon = useCarbonFactor("glass");
  const [chartsOpen, setChartsOpen] = useState(false);
  const [started, setStarted] = useState(false);

  //source of geo - demo or upload, shared by all facade types
  const [source, setSource] = useState(DEMO_SOURCE);
  const usingUpload = source.mode === "upload";

  //what is sent to Rhino.Compute: the slider values, the demo/upload switch, and the uploaded geometry
  //null means "don't compute yet"
  const computeInputs = useMemo(() => {
    if (!usingUpload) return { ...settings.inputs, [UPLOAD.toggle]: false };
    if (!source.geometry) return null;
    return { ...settings.inputs, [UPLOAD.toggle]: true, [UPLOAD.name]: source.geometry };
  }, [settings.inputs, usingUpload, source]);

  function compareWithInventory() {
    carbon.retry();
    match.compare();
  }

  return (
    <div>
      {started ? (
        <GeometryView
          data={computeInputs}
          viewKey={usingUpload ? settings.selectedId + source.fileId : settings.selectedId}
          path={settings.facade.definition}
          onUpdatePanels={match.updatePanels}
          matches={match.shownMatches}
          active={active}
        />
      ) : (
        <div className={styles.startScreen}>
          <button type="button" className={styles.startButton} onClick={() => setStarted(true)}>
            Start configurator
          </button>
        </div>
      )}

      <div className={styles.sidebar}>
        <h2>Base geometry</h2>
        <hr />
        <GeometrySource accepts={UPLOAD.accepts} source={source} onChange={setSource} />

        <h2 className={styles.sectionTitle}>Facade type</h2>
        <hr />
        <FacadePicker facades={settings.facades} selectedId={settings.selectedId} onChange={settings.selectFacade} />

        <h2 className={styles.sectionTitle}>Settings</h2>
        <hr />
        <FacadeSettings facade={settings.facade} values={settings.inputs} onUpdate={settings.updateValue} />
        <button type="button" className={styles.resetButton} onClick={settings.resetSettings}>
          Reset settings
        </button>

        <MatchSummary
          panelCount={match.panels.length}
          results={match.results}
          error={match.error}
          matching={match.matching}
          onCompare={compareWithInventory}
          settings={match.settings}
          onSettingChange={match.updateSetting}
          showMatches={match.showMatches}
          onShowMatchesChange={match.setShowMatches}
        />
      </div>

      {match.results !== null && !chartsOpen && (
        <button type="button" className={chartsStyles.openButton} onClick={() => setChartsOpen(true)}>
          Results
        </button>
      )}
      {match.results !== null && chartsOpen && (
        <ChartsPanel
          results={match.results}
          panels={match.panels}
          carbonFactor={carbon.carbonFactor}
          onClose={() => setChartsOpen(false)}
        />
      )}
    </div>
  );
}