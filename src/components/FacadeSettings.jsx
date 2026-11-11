//controls for one facade type from its list of inputs.
import Slider from "./Slider.jsx";
import Toggle from "./Toggle.jsx";
import Dropdown from "./Dropdown.jsx";

export default function FacadeSettings({ facade, values, onUpdate }) {
  if (facade.inputs.length === 0) {
    return <p>This facade has no settings.</p>;
  }

  return (
    <div>
      {facade.inputs.map((input) => {
        //the facade id in the key makes React create fresh controls when the facade changes
        const key = `${facade.id}-${input.name}`;
        const value = values[input.name] ?? input.value;
        const label = input.label ?? input.name;

        switch (input.type) {
          case "slider":
            return (
              <div className="setting" key={key}>
                <Slider title={input.name} label={label} min={input.min} max={input.max} step={input.step} val={value} onUpdate={onUpdate} />
              </div>
            );
          case "toggle":
            return (
              <div className="setting" key={key}>
                <Toggle title={input.name} label={label} val={value} onUpdate={onUpdate} />
              </div>
            );
          case "dropdown":
            return (
              <div className="setting" key={key}>
                <Dropdown title={input.name} label={label} options={input.options} val={value} onUpdate={onUpdate} />
              </div>
            );
          default:
            console.warn(`Unknown input type "${input.type}" for ${input.name}`);
            return null;
        }
      })}
    </div>
  );
}
