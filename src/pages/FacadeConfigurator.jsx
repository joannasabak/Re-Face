import { useState } from "react";

import GeometryView from "../components/GeometryView.jsx";
import FacadePicker from "../components/FacadePicker.jsx";
import FacadeSettings from "../components/FacadeSettings.jsx";
import MatchSummary from "../components/MatchSummary.jsx";
import ChartsPanel from "../components/ChartsPanel.jsx";
import { useFacadeSettings } from "../hooks/useFacadeSettings.js";
import { useInventoryMatch } from "../hooks/useMatch.js";
import { useCarbonFactor } from "../hooks/useCarbonFactor.js";

import styles from "../ui/Sidebar.module.css";
import chartsStyles from "../ui/ChartsPanel.module.css";

export default function FacadeConfigurator({ active = true }) {
  const settings = useFacadeSettings();
  const match = useInventoryMatch();
  const carbon = useCarbonFactor("glass");
  const [chartsOpen, setChartsOpen] = useState(false);
  const [started, setStarted] = useState(false);

  function compareWithInventory() {
    carbon.retry(); 
    match.compare();
  }

  return (
    <div>
      {started ? (
        <GeometryView
          data={settings.inputs}
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
        <h2>Facade type</h2>
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