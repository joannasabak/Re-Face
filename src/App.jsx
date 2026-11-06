import { useState } from "react";

import Navbar from "./components/Navbar.jsx";
import Loading from "./components/Loading.jsx";
import HomePage from "./pages/Home.jsx";
import FacadeConfigurator from "./pages/FacadeConfigurator.jsx";
import Inventory from "./pages/Inventory.jsx";

//Import and define Store
import { useComputeStore } from "./stores/computeStore.js";

import styles from "./App.module.css";

export default function App() {
  const computeStore = useComputeStore();
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <Navbar
        selectedTab={selectedTab}
        onSelectedTabChange={setSelectedTab}
      />
      <div className={styles.content}>
        {selectedTab === 0 && <HomePage />}
        {selectedTab === 1 && <FacadeConfigurator />}
        {selectedTab === 2 && <Inventory />}
      </div>
      {computeStore.computing && <Loading className={styles.loaderOverlay} />}
    </>
  );
}
