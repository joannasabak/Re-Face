import { useState } from "react";
import inventory from "../data/inventory.json";
import styles from "../ui/Inventory.module.css";

const WIN_FILTERS = {
  search: "",
  frameMaterial: "",
  glazing: "",
  condition: "",
  minWidth: "",
  minHeight: "",
  availability: true,
};

export default function Inventory() {
  const [filters, setFilters] = useState(WIN_FILTERS);
  const [sortKey, setSortKey] = useState("id");
  const [sortAscending, setSortAcending] = useState(true);

  //change filter while keeping others already in
  function changeFilter(name, value) {
    setFilters({ ...filters, [name]: value });
  }

  // click on the kolumn heading for sorting and reverve
  function sortBy(key) {
    if (key === sortKey) {
      setSortAcending(!sortAscending);
    }
    else {
      setSortKey(key);
      setSortAcending(true);
    }
  }

  // keep only items matching the filters
  const visibleItems = inventory.items.filter((item) => passesFilters(item, filters));

  //items in order
  visibleItems.sort((a, b) => {
    const order = compareValues(a[sortKey], b[sortKey]);
    return sortAscending ? order : -order;
  });

  //count how many frames
  let frameCount = 0;
  for (const item of visibleItems) {
    frameCount += item.quantity;
  }

  //each column takes all of the above, combine in one object:
  const sorting = { sortKey, sortAscending, onSort: sortBy };



  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1>Inventory</h1>
            <p className={styles.subtitle}>Salvaged window frames available for reuse</p>
          </div>
          <p className={styles.summary}>
            Showing <strong>{visibleItems.length}</strong> of {inventory.items.length} types ·{" "}
            <strong>{frameCount}</strong> frames
          </p>
        </div>

        <div className={styles.filters}>
          <label className={styles.field}>
            <span>Search</span>
            <input
              type="search"
              placeholder="ID or source"
              value={filters.search}
              onChange={(event) => changeFilter("search", event.target.value)}
            />
          </label>

          <FilterSelect label="Material" field="frameMaterial" filters={filters} onChange={changeFilter} />
          <FilterSelect label="Glazing" field="glazing" filters={filters} onChange={changeFilter} />
          <FilterSelect label="Condition" field="condition" filters={filters} onChange={changeFilter} />

          <label className={styles.field}>
            <span>Min width (mm)</span>
            <input
              type="number"
              min="0"
              step="50"
              value={filters.minWidth}
              onChange={(event) => changeFilter("minWidth", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Min height (mm)</span>
            <input
              type="number"
              min="0"
              step="50"
              value={filters.minHeight}
              onChange={(event) => changeFilter("minHeight", event.target.value)}
            />
          </label>

          <div className={styles.filterActions}>
            <button type="button" className={styles.reset} onClick={() => setFilters(WIN_FILTERS)}>
              Reset filters
            </button>
          </div>
        </div>

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
              {visibleItems.map((item) => (
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
                      title={inventory.conditionGrades[item.condition]}
                    >
                      {item.condition}
                    </span>
                  </td>
                  <td>{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleItems.length === 0 && <p className={styles.empty}>No frames match these filters.</p>}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, field, filters, onChange }) {
  const options = uniqueValues(field);

  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={filters[field]} onChange={(event) => onChange(field, event.target.value)}>
        <option value="">All</option>
        {options.map((value) => (
          <option key={value} value={value}>
            {field === "condition" ? `${value}: ${inventory.conditionGrades[value]}` : capitalise(value)}
          </option>
        ))}
      </select>
    </label>
  );
}

// clickable heading
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


// fliter matching
function passesFilters(item, filters) {
  const search = filters.search.trim().toLowerCase();
  if (search !== "") {
    const text = (item.id + " " + item.source).toLowerCase();
    if (!text.includes(search)) return false;
  }

  if (filters.frameMaterial !== "" && item.frameMaterial !== filters.frameMaterial) return false;
  if (filters.glazing !== "" && item.glazing !== filters.glazing) return false;
  if (filters.condition !== "" && item.condition !== filters.condition) return false;

  if (filters.minWidth !== "" && item.width < Number(filters.minWidth)) return false;
  if (filters.minHeight !== "" && item.height < Number(filters.minHeight)) return false;

  if (filters.availableOnly && !item.available) return false;

  return true;
}

// Compares two values for sorting: numbers by size, text alphabetically.
// Returns a negative number if a comes first, positive if b comes first, 0 if equal.
function compareValues(a, b) {
  if (typeof a === "number") return a - b;
  return String(a).localeCompare(String(b));
}

// The different values a field has, in alphabetical order, e.g. ["aluminium", "steel", "timber", "upvc"]
function uniqueValues(field) {
  const values = new Set(inventory.items.map((item) => item[field]));
  return [...values].sort();
}

function capitalise(text) {
  if (text === "upvc") return "uPVC";
  return text.charAt(0).toUpperCase() + text.slice(1);
}