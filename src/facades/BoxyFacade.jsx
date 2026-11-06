import { useState } from "react";
import GeometryView from "../components/GeometryView";
import Slider from "../components/Slider";
import Toggle from "../components/Toggle";
import ModelSummary from "../components/ModelSummary";
import { useInputs } from "../scripts/rhinoInputs";
import styles from "../ui/Sidebar.module.css";

import def from "../assets/grasshopper/Stepping facade on volume.gh"

const path = def;

const widthSliderName = "width";
const widthSliderValue = 3;

const protrusionSliderName = "protrusion_max";
const protrusionSliderValue = 1.0;

const heightSliderName = "lvl_height";
const heightSliderValue = 4;

const flipToggleName = "Flip facade";
const flipToggleValue = true;

export default function BoxyFacade() {
    const [metadata, setMetadata] = useState([]);

    const [inputs, updateValue] = useInputs({
        [widthSliderName]: widthSliderValue,
        [protrusionSliderName]: protrusionSliderValue,
        [heightSliderName]: heightSliderValue,
        [flipToggleName]: flipToggleValue,
    });

    function receiveMetadata(newValue) {
        console.log(newValue);
        setMetadata(newValue);
    }

    return (
        <div>
            <GeometryView data={inputs} path={path} onUpdateMetadata={receiveMetadata} />
            <div className={styles.sidebar}>
                <Slider title={widthSliderName} min={0.5} max={5} step={0.1} val={widthSliderValue} onUpdate={updateValue} />
                <br />
                <Slider title={protrusionSliderName} min={0} max={2} step={0.1} val={protrusionSliderValue} onUpdate={updateValue} />
                <br />
                <Slider title={heightSliderName} min={1} max={7} step={0.5} val={heightSliderValue} onUpdate={updateValue} />
                <br />

                <Toggle title={flipToggleName} val={flipToggleValue} onUpdate={updateValue} />

                <ModelSummary metadata={metadata} />
            </div>
        </div>
    );

}