import { useState } from "react";

import GeometryView from "../components/GeometryView.jsx";
import Toggle from "../components/Toggle.jsx";
import Slider from "../components/Slider.jsx";
import Dropdown from "../components/Dropdown.jsx";
import ModelSummary from "../components/ModelSummary.jsx";
import { useInputs } from "../scripts/rhinoInputs.js";

// import def from "../assets/your_defintion.gh";
import styles from "../ui/Sidebar.module.css";

// const path = def; //path to the Grasshopper definition

const SliderName = "Slider";
const SliderValue = 1;

const ToggleName = "Toggle";
const ToggleValue = true;

const dropdownName = "Dropdown";
const dropdownOptions = [
    { label: "Option 1", value: 0 },
    { label: "Option 2", value: 1 },
    { label: "Option 3", value: 2 },
];

export default function FacadeConfigurator() {
    const [metadata, setMetadata] = useState([]);

    //declare the inputs to send to compute here
    const [inputs, updateValue] = useInputs({});

    function receiveMetadata(newValue) {
        console.log(newValue);
        setMetadata(newValue);
    }

    return (
        <div>
            <GeometryView data={inputs} onUpdateMetadata={receiveMetadata} />

            <div className={styles.sidebar}>
                <h2> Definition Name </h2>
                <hr />    

                <p>Pick the facade type below: </p>
                <br />

                
                <h2> Settings</h2>
                <hr />

                <br />

                <Slider title={SliderName} min={0} max={5} step={1} val={SliderValue} onUpdate={updateValue} />

                <br />

                <Toggle title={ToggleName} val={ToggleValue} onUpdate={updateValue} />

                <br />
                <Dropdown title={dropdownName} options={dropdownOptions} onUpdate={updateValue} />

                <br />

                <h2> Metadata </h2>
                <hr />

                <ModelSummary metadata={metadata} />
            </div>
        </div>
    );
}
