import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import styles from "../ui/ChartsPanel.module.css";

const COLORS = {
    exact: "#278062",
    adapted: "#8fc4a4",
    missing: "#d6cfcf",
};

export default function ChartsPanel({ results, panels, carbonFactor, onClose }) {
    const summary = results.summary;

    const pieData = [
        { status: "exact", label: "Exact fit", count: summary.exact },
        { status: "adapted", label: "Fits with infill", count: summary.adapted },
        { status: "missing", label: "No frame", count: summary.missing },
    ];

    const massById = {};
    for (const panel of panels) {
        massById[panel.id] = panel.mass;
    }

    let reusedMass = 0;
    for (const match of results.matches) {
        if (match.status !== "missing") {
            reusedMass += massById[match.panelId];
        }
    }

    const carbonSaved = reusedMass * carbonFactor.carbonPerKg;

    const framesUsed = [];
    let totalFrames = 0;
    for (const itemId of Object.keys(summary.framesUsed)) {
        const count = summary.framesUsed[itemId];
        framesUsed.push({ itemId: itemId, count: count });
        totalFrames += count;
    }
    framesUsed.sort((a, b) => b.count - a.count);

    return (
        <aside className={styles.panel}>
            <div className={styles.header}>
                <h2>Match results</h2>
                <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close charts">
                    x
                </button>
            </div>
            <hr />

            <div className={styles.carbon}>
                <p className={styles.carbonNumber}>{Math.round(carbonSaved)} kg CO₂e saved</p>
            </div>

            <h3>Reused panels:</h3>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="count"
                        nameKey="label"
                        outerRadius={80}
                        label={(slice) => Math.round(slice.percent * 100) + "%"}
                        isAnimationActive={false}
                    >
                        {pieData.map((slice) => (
                            <Cell key={slice.status} fill={COLORS[slice.status]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => value + " panels"} />
                </PieChart>
            </ResponsiveContainer>

            <ul className={styles.legend}>
                {pieData.map((slice) => (
                    <li key={slice.status}>
                        <span className={styles.dot} style={{ backgroundColor: COLORS[slice.status] }}></span>
                        {slice.label}
                    </li>
                ))}
            </ul>

            {framesUsed.length > 0 && (
                // <details> is a built-in HTML box that opens and closes when you click its <summary>
                <details className={styles.framesUsed}>
                    <summary>
                        Frames used ({totalFrames} frames, {framesUsed.length} inventory items)
                    </summary>
                    <ul>
                        {framesUsed.map((frame) => (
                            <li key={frame.itemId}>
                                <span>{frame.itemId}</span>
                                <strong>× {frame.count}</strong>
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </aside>
    );
}