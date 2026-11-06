import { useState } from "react";

export default function Slider({ title, min, max, step, val, onUpdate }) {
    const [sliderValue, setSliderValue] = useState(Number(val));
    const percent = ((sliderValue - min) / (max - min)) * 100;

    return (
        <div>
            <form className="definition-input">
                <label className="input-title">
                    {title}: {sliderValue}
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