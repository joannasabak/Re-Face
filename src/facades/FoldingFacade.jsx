import { useState } from "react";
import GeometryView from "../components/GeometryView";
import Slider from "../components/Slider";
import Toggle from "../components/Toggle";
import ModelSummary from "../components/ModelSummary";
import { useInputs } from "../scripts/rhinoInputs";
import styles from "../ui/Sidebar.module.css";

import def from "../assets/grasshopper/Folding_facade.gh"

const path = def;

const densitySliderName = "Density";
const densitySliderValue = 0.5;

const articulationSliderName = "Articulation";
const articulationSliderValue = 0.3;

const pleatDirToggleName = "Pleat_direction";
const pleatDirToggleValue = false;

export default function FoldingFacade() {
    const [metadata, setMetadata] = useState([]);

    const [inputs, updateValue] = useInputs({
        [densitySliderName]: densitySliderValue,
        [articulationSliderName]: articulationSliderValue,
        [pleatDirToggleName]: pleatDirToggleValue,
    });

    function receiveMetadata(newValue) {
        console.log(newValue);
        setMetadata(newValue);
    }

    return (
        <div>
            <GeometryView data={inputs} path={path} onUpdateMetadata={receiveMetadata} />
            <div className={styles.sidebar}>
                <Slider title={densitySliderName} min={1} max={20} step={1} val={densitySliderValue} onUpdate={updateValue} />
                <br/>
                <Slider title={articulationSliderName} min={1} max={30} step={1} val={articulationSliderValue} onUpdate={updateValue} />
                <br/>

                <Toggle title={pleatDirToggleName} val={pleatDirToggleValue} onUpdate={updateValue} />

                <ModelSummary metadata={metadata} />
            </div>
        </div>
    );

}