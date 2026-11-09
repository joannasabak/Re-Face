import styles from "../ui/Dropdown.module.css";

//inputs come from grasshopper
export default function Dropdown({ title, label, options, val, onUpdate }) {

    //inputs compared as text
    //values for options sent to gh as numbers, matching label:value pairs in facades.js
    function handleChange(event) {
        const chosen = options.find(option => String(option.value) === event.target.value);
        onUpdate?.(chosen.value, title);
    }

    return (
        <div className="definition-input">
            <label className="input-title">
                {label ?? title}
            </label>

            <select
                value={val}
                className={styles.dropdown}
                onChange={handleChange}
            >
                {options.map((option) => (
                    <option key={option.label} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}