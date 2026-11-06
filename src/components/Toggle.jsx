import { useState } from "react";
import styles from "../ui/Toggle.module.css";

export default function Toggle({ title, val, onUpdate}) {
    const [toggleValue, setToggleValue] = useState(Boolean(val));

    function handleChange(event) {
        setToggleValue(event.target.checked);
        onUpdate?.(event.target.checked, title);
    }

    return (
        <div className={styles.toggleContainer}>
            <div>
                <div className={styles.definitionInput}>
                    <label className={styles.switch}>
                        <input
                        type="checkbox"
                        checked={toggleValue}
                        onChange={handleChange}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
            <div className={styles.title}>
                <span className="input-title">{title}</span>
            </div>
        </div>
    );
}