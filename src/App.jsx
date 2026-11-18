import { useState } from "react";

import Navbar from "./components/Navbar.jsx";
import Loading from "./components/Loading.jsx";
import HomePage from "./pages/Home.jsx";
import FacadeConfigurator from "./pages/FacadeConfigurator.jsx";
import Inventory from "./pages/Inventory.jsx";

//Import and define Store
import { useComputeStore } from "./stores/computeStore.js";

import styles from "./App.module.css";

const CONFIGURATOR_TAB = 1;
const INVENTORY_TAB = 2;

export default function App() {
  const computeStore = useComputeStore();
  const [selectedTab, setSelectedTab] = useState(0);

  const [configuratorOpened, setConfiguratorOpened] = useState(false);

  function changeTab(index) {
    setSelectedTab(index);
    if (index == CONFIGURATOR_TAB) setConfiguratorOpened(true);
  }

  const configuratorActive = selectedTab === CONFIGURATOR_TAB;

  return (
    <>
      <Navbar
        selectedTab={selectedTab}
        onSelectedTabChange={changeTab}
      />
      <div className={styles.content}>
        {selectedTab === 0 && (
          <HomePage
            onStart={() => changeTab(CONFIGURATOR_TAB)}
            onBrowseInventory={() => changeTab(INVENTORY_TAB)}
          />
        )}

        {configuratorOpened && (
          <div hidden={!configuratorActive}>
            <FacadeConfigurator active={configuratorActive} />
          </div>
        )}

        {selectedTab === INVENTORY_TAB && <Inventory />}
      </div>
      {computeStore.computing && <Loading className={styles.loaderOverlay} />}
    </>
  );
}
