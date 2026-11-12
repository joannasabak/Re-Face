import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import styles from "../ui/ChartsPanel.module.css";

const COLORS = {
    exact: "#278062",
    adapted: "#8fc4a4",
    missing: "#d9776e",
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

    return (
        <aside className={styles.panel}>
            <div className={styles.header}>
                <h2>Match results</h2>
                <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close charts">
                    x
                </button>
            </div>

            <div className={styles.carbon}>
                <p className={styles.carbonNumber}>{Math.round(carbonSaved)} kg CO₂e saved</p>
                <p>by reusing {Math.round(reusedMass)} kg of glass</p>
                <p className={styles.source}>Source: {carbonFactor.source}</p>
            </div>

            <h3>Facade by match</h3>
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
        </aside>
    );
}