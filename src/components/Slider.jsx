import { useState } from "react";

//shows value from the parent in gh
//while dragging uses state to show a temp value and only sends the input to gh once set
//prevents running compute per every step
export default function Slider({ title, label, min, max, step, val, onUpdate }) {
    const [temp, setTemp] = useState(null);

    const sliderValue = temp ?? Number(val);
    const percent = ((sliderValue - min) / (max - min)) * 100;

    function ghSend() {
        if (temp !== null && temp !== Number(val)) {
            onUpdate?.(temp, title);
        }
        setTemp(null);
    }

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
                    onChange={(event) => setTemp(Number(event.target.value))}
                    onPointerUp={ghSend}
                    onKeyUp={ghSend}
                />
            </form>
        </div>
    );
}