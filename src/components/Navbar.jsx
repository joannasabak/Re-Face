import Logo from "./Logo.jsx";
import styles from "../ui/Navbar.module.css";
import DarkModeToggle from "./DarkModeToggle.jsx";

const TABS = ["Home", "Facade Configurator", "Inventory"];

function changeMode(value) {
  document.documentElement.setAttribute("data-theme", value ? "dark" : "light");
}

export default function Navbar({ selectedTab, onSelectedTabChange }) {
  return (
    <div className={styles.navbar}>
      <div className={styles.titleContainer}>
        <div className={styles.brand}>
          <Logo className={styles.logoImage} />
          <h2>Re-Face</h2>
          <div className={styles.navigationTabs}>
            {TABS.map((label, index) => (
              <button
                type="button"
                key={label}
                className={
                  selectedTab === index
                    ? styles.selectedTab
                    : styles.navigationTab
                }
                onClick={() => onSelectedTabChange(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <DarkModeToggle onUpdate={changeMode} title="darkMode" />
      </div>
    </div>
  );
}
