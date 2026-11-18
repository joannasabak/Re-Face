// import { useState } from "react";
// import Slider from "../components/Slider.jsx";
import styles from "../ui/Home.module.css";
import { ICONS } from "../assets/icons/icons.js";

const STEPS = [ 
    { icon: "grid", title: "Choose base geometry", 
        text: "Use the demo geometry, or upload your own Rhino file."},
    { icon: "sliders", title: "Pick and shape a facade", 
        text: "Adjust pre-made parametric assemblies using sliders for different configurations."},
    { icon: "recycle", title: "Match it to salvaged stock", 
        text: "See which panels can be built with existing frames, and achieved carbon savings as a result."},
];

export default function HomePage({ onStart, onBrowseInventory }) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <section className={styles.hero}>
          <h1>Welcome to Re-Face</h1>
          <p className={styles.lead}>
            Shape a facade from an inventory of reclaimed building elements.
          </p>
          <br />
          <div className={styles.actions}>
            <button type="button" className={styles.primaryButton} onClick={onStart}>
              Start designing
            </button>
            <button type="button" className={styles.secondaryButton} onClick={onBrowseInventory}>
              Browse inventory
            </button>
          </div>
        </section>

        <section className={styles.steps}>
          <h2>How it works</h2>
          <ol className={styles.stepList}>
            {STEPS.map((step) => (
              <li key={step.title} className={styles.step}>
                <StepIcon name={step.icon} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function StepIcon({ name }) {
  return (
    <svg className={styles.stepIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
