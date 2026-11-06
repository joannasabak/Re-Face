// import { useState } from "react";
// import Slider from "../components/Slider.jsx";
import "../ui/Home.css";

export default function HomePage() {

    return (
        <div id="body">
          <div className="home-card">
            <h1 id="title" >
                Welcome to the Facade Configurator
            </h1>
            <p>This app is made of three major elements:</p>

            <ul>
                <li>
                    Parametric grasshopper-based configurator for cool facades.
                </li>
                <li>
                    Inventory of available salvaged building materials.
                </li>
                <li>
                    Sustainability scoring.
                </li>
            </ul>
          </div>
        </div>
    );
}
