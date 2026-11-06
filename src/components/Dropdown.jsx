import { useState } from "react";
import styles from "../ui/Dropdown.module.css";

// title = Grasshopper input name, label = text shown (defaults to title)
export default function Dropdown({ title, label, options, val, onUpdate }) {
    const [selectedOption, setSelectedOption] = useState(val ?? options[0]?.value ?? 0);

    function handleChange(event) {
        const value = Number(event.target.value);
        setSelectedOption(value);
        onUpdate?.(value, title);
    }

    return (
        <div className="definition-input">
            <label className="input-title">
                {label ?? title}
            </label>

            <select
                value={selectedOption}
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