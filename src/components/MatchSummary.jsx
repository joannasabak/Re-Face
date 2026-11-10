import Toggle from "./Toggle.jsx";
import styles from "../ui/MatchSummary.module.css";

// Compares the facade panels with the inventory
export default function MatchSummary({
    panelCount,
    results,
    error,
    matching,
    onCompare,
    settings,
    onSettingChange,
    showMatches,
    onShowMatchesChange,
}) {
    return (
        <div className={styles.matchBox}>
            <h3>Inventory match</h3>
            <MatchDetails panelCount={panelCount} results={results} error={error} matching={matching} />
       
            <Toggle title="allowRotation" label="Allow rotating frames" val={settings.allowRotation} onUpdate={onSettingChange} />

            <button
                type="button"
                className={styles.compareButton}
                onClick={onCompare}
                disabled={panelCount === 0 || matching}
            >
                {matching ? "Comparing…" : "Compare with inventory"}
            </button>

            {results !== null && (
                <Toggle
                    title="showMatches"
                    label="Colour panels by match"
                    val={showMatches}
                    onUpdate={(value) => onShowMatchesChange(value)}
                />
            )}
        </div>
    );
}


function MatchDetails({ panelCount, results, error, matching }) {
    if (panelCount === 0) {
        return <p className={styles.message}>No tagged panels in this facade.</p>;
    }

    if (error !== null) {
        return <p className={styles.error}>{error}</p>;
    }

    if (matching) {
        return <p className={styles.message}>Comparing {panelCount} panels with the inventory…</p>;
    }

    if (results === null) {
        return (
            <p className={styles.message}>
                {panelCount} panels in this facade. Compare them with the inventory to see which frames fit.
            </p>
        );
    }

    const summary = results.summary;

    // "WIN-001 × 2, WIN-004 × 1"
    const framesUsed = [];
    for (const itemId of Object.keys(summary.framesUsed)) {
        framesUsed.push(itemId + " × " + summary.framesUsed[itemId]);
    }

    return (
        <div>
            <ul className={styles.counts}>
                <StatusRow status="exact" label="Exact fit" count={summary.exact} />
                <StatusRow status="adapted" label="Fits with infill" count={summary.adapted} />
                <StatusRow status="missing" label="No frame" count={summary.missing} />
            </ul>

            <p className={styles.message}>
                {framesUsed.length > 0 ? "Frames used: " + framesUsed.join(", ") : "No frames used."}
            </p>
        </div>
    );
}

// One line: a coloured dot, a label and a number
function StatusRow({ status, label, count }) {
    return (
        <li>
            <span className={`${styles.dot} ${styles[status]}`}></span>
            <span className={styles.label}>{label}</span>
            <strong>{count}</strong>
        </li>
    );
}