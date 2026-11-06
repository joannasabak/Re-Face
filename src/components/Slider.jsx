import { useState } from "react";

// title = Grasshopper input name, label = text shown (defaults to title)
export default function Slider({ title, label, min, max, step, val, onUpdate }) {
    const [sliderValue, setSliderValue] = useState(Number(val));
    const percent = ((sliderValue - min) / (max - min)) * 100;

    return (
        <div>
            <form className="definition-input">
                <label className="input-title">
                    {label ?? title}: {sliderValue}
                </label>
                <input
                    type="range"
                    className="modern-range"
                    style={{ "--value": `${percent}%` }}
                    min={min}
                    max={max}
                    step={step}
                    value={sliderValue}
                    onChange={(event) => setSliderValue(Number(event.target.value))}
                    onMouseUp={() => onUpdate?.(sliderValue, title)}
                />
            </form>
        </div>
    );
}