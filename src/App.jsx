import { useState } from "react";

import Navbar from "./components/Navbar.jsx";
import Loading from "./components/Loading.jsx";
import HomePage from "./pages/Home.jsx";
import FoldingFacade from "./facades/FoldingFacade.jsx";

//Import and define Store
import { useComputeStore } from "./stores/computeStore.js";

import styles from "./App.module.css";
import FacadeConfigurator from "./pages/Facades.jsx";

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
        {selectedTab === 1 && <FoldingFacade />}
        {selectedTab === 2 && <FacadeConfigurator />}
      </div>
      {computeStore.computing && <Loading className={styles.loaderOverlay} />}
    </>
  );
}