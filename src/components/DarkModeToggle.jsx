import { useState } from "react";
import styles from "../ui/DarkModeToggle.module.css";

export default function DarkModeToggle({ title, val, onUpdate }) {
  const [toggleValue, setToggleValue] = useState(Boolean(val));

  function handleChange(event) {
    setToggleValue(event.target.checked);
    onUpdate?.(event.target.checked, title);
  }

  return (
    <form className={styles.definitionInput}>
      <label className="input-title" htmlFor={title}>
        {toggleValue ? "Dark Mode" : "Light Mode"}
      </label>

      <div>
        <label className={styles.switch} htmlFor={title}>
          <input
            type="checkbox"
            id={title}
            checked={toggleValue}
            onChange={handleChange}
          />
          <div className={styles.slider}></div>
        </label>
      </div>
    </form>
  );
}