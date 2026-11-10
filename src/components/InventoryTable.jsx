import styles from "../ui/Inventory.module.css";
 

export default function InventoryTable({ items, conditionGrades, sortKey, sortAscending, onSort }) {

    const sorting = { sortKey, sortAscending, onSort };
 
    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <SortableHeader label="ID" column="id" {...sorting} />
                        <SortableHeader label="Material" column="frameMaterial" {...sorting} />
                        <SortableHeader label="Glazing" column="glazing" {...sorting} />
                        <SortableHeader label="Width (mm)" column="width" numeric {...sorting} />
                        <SortableHeader label="Height (mm)" column="height" numeric {...sorting} />
                        <SortableHeader label="Qty" column="quantity" numeric {...sorting} />
                        <SortableHeader label="Condition" column="condition" {...sorting} />
                        <SortableHeader label="Source" column="source" {...sorting} />
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{capitalise(item.frameMaterial)}</td>
                            <td>{capitalise(item.glazing)}</td>
                            <td className={styles.numeric}>{item.width}</td>
                            <td className={styles.numeric}>{item.height}</td>
                            <td className={styles.numeric}>{item.quantity}</td>
                            <td>
                                <span
                                    className={`${styles.badge} ${styles["grade" + item.condition]}`}
                                    title={conditionGrades[item.condition]}
                                >
                                    {item.condition}
                                </span>
                            </td>
                            <td>{item.source}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
 
            {items.length === 0 && <p className={styles.empty}>No frames match these filters.</p>}
        </div>
    );
}

function capitalise(text) {
  if (text === "upvc") return "uPVC";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
 
//clickable header
function SortableHeader({ label, column, numeric, sortKey, sortAscending, onSort }) {
    let arrow = "";
    if (column === sortKey) {
        arrow = sortAscending ? "▲" : "▼";
    }
 
    return (
        <th className={numeric ? styles.numeric : undefined}>
            <button type="button" onClick={() => onSort(column)}>
                {label}
                <span className={styles.sortArrow}>{arrow}</span>
            </button>
        </th>
    );
}