import styles from "../ui/Toggle.module.css";

// title = Grasshopper input name, label = text shown (defaults to title)
export default function Toggle({ title, label, val, onUpdate }) {

    function handleChange(event) {
        onUpdate?.(event.target.checked, title);
    }

    return (
        <div className={styles.toggleContainer}>
            <div>
                <div className={styles.definitionInput}>
                    <label className={styles.switch}>
                        <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={handleChange}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
            <div className={styles.title}>
                <span className="input-title">{label ?? title}</span>
            </div>
        </div>
    );
}