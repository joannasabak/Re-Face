import { useState } from "react";
import styles from "../ui/Dropdown.module.css";

export default function Dropdown({ title, options, onUpdate }) {
    const [selectedOption, setSelectedOption] = useState(0);

    function handleChange(event) {
        const value = Number(event.target.value);
        setSelectedOption(value);
        onUpdate?.(value, title);
    }

    return (
        <form className="definition-input">
            <label className="input-title">
                {title} index: {selectedOption}
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
        </form>
    );
}