import React from "react";
import "./legend.css";

/**
 * PUBLIC_INTERFACE
 * Legend renders the left column of "Symbols" with interactive toggles that control series visibility.
 */
export default function Legend({
  items,
  visibleSet,
  onToggle,
  onReset,
  onHover,
  onHoverEnd
}) {
  return (
    <aside className="legend-panel" aria-label="Symbols legend">
      <div className="legend-header">
        <h2 className="legend-title">Symbols</h2>
        <button className="reset-link" onClick={onReset} type="button">Reset</button>
      </div>
      <ul className="legend-list">
        {items.map((it) => {
          const isOn = visibleSet.has(it.id);
          return (
            <li key={it.id} className="legend-row">
              <button
                type="button"
                className="legend-item"
                role="switch"
                aria-checked={isOn}
                aria-label={`Toggle series: ${it.name}`}
                aria-controls="mainPlot"
                onClick={() => onToggle(it.id)}
                onMouseEnter={() => onHover?.(it.id)}
                onMouseLeave={() => onHoverEnd?.()}
                onFocus={() => onHover?.(it.id)}
                onBlur={() => onHoverEnd?.()}
              >
                <span
                  className={`marker ${it.type === "point-square" ? "square" : "circle"}`}
                  style={{ background: `var(${it.colorVar})`, opacity: isOn ? 1 : 0.4 }}
                  aria-hidden="true"
                />
                <span className="legend-label" data-active={isOn ? "1" : "0"}>{it.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="legend-note">
        Legend of the vital signs symbols<br />
        Dynamic height adjustment based on displayed/expanded values
      </p>
    </aside>
  );
}
