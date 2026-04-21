import { useEffect, useRef, useState } from "react";
import "./css/ActionMenu.css";

export default function ActionMenu({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, []);

  return (
    <div className="action-wrap" ref={wrapRef}>
      <button
        className="dots-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Actions"
        aria-expanded={open}
      >
        ⋮
      </button>

      {open && (
        <div className="action-dropdown open">
          {actions.map((a, i) => (
            <button
              key={i}
              className={a.className || ""}
              onClick={() => {
                console.log("Clicked:", a.label);
                setOpen(false);
                a.onClick();
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}