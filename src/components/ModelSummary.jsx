import styles from "../ui/ModelSummary.module.css";

// React can't render objects or booleans as text, so convert them first.
function toDisplayString(value) {
  if (value === null || value === undefined) return "";
  return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
}

export default function ModelSummary({ metadata }) {
  return (
    <div className={styles.summaryBox}>
      <h3></h3>
      <div className="shadow-border">
        <div className={styles.metadata}>
          {metadata.map((item, index) => (
            <p key={index}>{toDisplayString(item.value)}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
