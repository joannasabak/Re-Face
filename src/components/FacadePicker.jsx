// A dropdown menu showing the facade types to choose from, each with its thumbnail.
// A normal <select> can't show images, so this is built from a button and a list.
import { useEffect, useId, useRef, useState } from "react";
import styles from "../ui/FacadePicker.module.css";

export default function FacadePicker({ facades, selectedId, onChange }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef(null);
  const listId = useId();

  const selected = facades.find((facade) => facade.id === selectedId) ?? facades[0];

  // close when clicking anywhere outside the picker
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openList() {
    setHighlighted(Math.max(0, facades.indexOf(selected)));
    setOpen(true);
  }

  function choose(facade) {
    onChange(facade.id);
    setOpen(false);
  }

  // keyboard support: arrows to move, Enter/Space to pick, Escape to close
  function onKeyDown(event) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((i) => (i + 1) % facades.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => (i - 1 + facades.length) % facades.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(facades[highlighted]);
    } else if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={styles.picker} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Facade type: ${selected.name}`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <FacadeOption facade={selected} />
        <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6 L8 10 L12 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className={styles.list} id={listId} role="listbox" aria-label="Facade types">
          {facades.map((facade, index) => (
            <li
              key={facade.id}
              role="option"
              aria-selected={facade.id === selected.id}
              className={[
                styles.option,
                index === highlighted ? styles.highlighted : "",
                facade.id === selected.id ? styles.selected : "",
              ].join(" ")}
              onMouseEnter={() => setHighlighted(index)}
              onClick={() => choose(facade)}
            >
              <FacadeOption facade={facade} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FacadeOption({ facade }) {
  return (
    <span className={styles.optionContent}>
      <img className={styles.thumbnail} src={facade.thumbnail} alt="" />
      <span className={styles.text}>
        <span className={styles.name}>{facade.name}</span>
        {facade.description && <span className={styles.description}>{facade.description}</span>}
      </span>
    </span>
  );
}
