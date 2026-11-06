import { useState } from "react";
import GeometryView from "../components/GeometryView";
import Slider from "../components/Slider";
// import Toggle from "../components/Toggle";
import ModelSummary from "../components/ModelSummary";
import { useInputs } from "../scripts/rhinoInputs";
import styles from "../ui/Sidebar.module.css";

import def from "../assets/grasshopper/Stepping facade from curve.gh"

const path = def;

const stepSliderName = "Step size";
const stepSliderValue = 0.5;

export default function SteppingFacade() {
    const [metadata, setMetadata] = useState([]);

    const [inputs, updateValue] = useInputs({
        [stepSliderName]: stepSliderValue,
    });

    function receiveMetadata(newValue) {
        console.log(newValue);
        setMetadata(newValue);
    }

    return (
        <div>
            <GeometryView data={inputs} path={path} onUpdateMetadata={receiveMetadata} />
            <div className={styles.sidebar}>
                <Slider title={stepSliderName} min={0} max={10} step={0.1} val={stepSliderValue} onUpdate={updateValue} />
                <br/>
                {/* <Slider title={articulationSliderName} min={1} max={30} step={1} val={articulationSliderValue} onUpdate={updateValue} />
                <br/>

                <Toggle title={pleatDirToggleName} val={pleatDirToggleValue} onUpdate={updateValue} /> */}

                <ModelSummary metadata={metadata} />
            </div>
        </div>
    );

}