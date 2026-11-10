import { useState } from "react";
import styles from "../ui/Inventory.module.css";
import { useInventory } from "../hooks/useInventory.js";
import InventoryTable from "../components/InventoryTable.jsx";

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
  const { inventory, error } = useInventory();

  const [filters, setFilters] = useState(WIN_FILTERS);
  const [sortKey, setSortKey] = useState("id");
  const [sortAscending, setSortAcending] = useState(true);

  //change filter while keeping others already in
  function changeFilter(name, value) {
    setFilters({ ...filters, [name]: value });
  }

  //click on the column heading for sorting and reverve
  function sortBy(key) {
    if (key === sortKey) {
      setSortAcending(!sortAscending);
    }
    else {
      setSortKey(key);
      setSortAcending(true);
    }
  }

  if (error !== null || inventory === null) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1>Inventory</h1>
          {error !== null ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <p className={styles.subtitle}>Loading inventory…</p>
          )}
        </div>
      </div>
    );
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
  const filterProps = { inventory, filters, onChange: changeFilter };


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

          <FilterSelect label="Material" field="frameMaterial" {...filterProps} />
          <FilterSelect label="Glazing" field="glazing" {...filterProps} />
          <FilterSelect label="Condition" field="condition" {...filterProps} />

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

        <InventoryTable
          items={visibleItems}
          conditionGrades={inventory.conditionGrades}
          sortKey={sortKey}
          sortAscending={sortAscending}
          onSort={sortBy}
        />

        {visibleItems.length === 0 && <p className={styles.empty}>No frames match these filters.</p>}
      </div>
    </div>

  );
}

function FilterSelect({ label, field, inventory, filters, onChange }) {
  const options = uniqueValues(inventory.items, field);

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


//fliter matching
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

//compared values for sorting, numbers and strings
function compareValues(a, b) {
  if (typeof a === "number") return a - b;
  return String(a).localeCompare(String(b));
}

// alphabetical order of fields
function uniqueValues(items, field) {
  const values = new Set(items.map((item) => item[field]));
  return [...values].sort();
}

//capitalise the first letter
function capitalise(text) {
  if (text === "upvc") return "uPVC";
  return text.charAt(0).toUpperCase() + text.slice(1);
}