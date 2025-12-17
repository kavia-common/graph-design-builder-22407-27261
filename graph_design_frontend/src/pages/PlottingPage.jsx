import React, { useMemo, useState, useCallback } from "react";
import "../styles/theme.css";
import "../components/legend/legend.css";
import Legend from "../components/legend/Legend";
import ChartSurface from "../components/chart/ChartSurface";
import { SERIES_DEFS, MOCK_DATA } from "../data/mockSeries";

/**
 * PUBLIC_INTERFACE
 * PlottingPage renders the main two-column layout with a synchronized legend and chart.
 * It uses local mock data but is structured to swap to API (REACT_APP_API_BASE) later.
 */
export default function PlottingPage() {
  const [visible, setVisible] = useState(new Set(SERIES_DEFS.map(s => s.id)));
  const [highlightedId, setHighlightedId] = useState(null);

  const onToggle = useCallback((id) => {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onReset = useCallback(() => {
    setVisible(new Set(SERIES_DEFS.map(s => s.id)));
    setHighlightedId(null);
  }, []);

  const onHover = useCallback((id) => setHighlightedId(id), []);
  const onHoverEnd = useCallback(() => setHighlightedId(null), []);

  const visibleSet = useMemo(() => visible, [visible]);

  return (
    <main className="plot-card" aria-label="Plot dashboard">
      <div className="plot-grid">
        <Legend
          items={SERIES_DEFS}
          visibleSet={visibleSet}
          onToggle={onToggle}
          onReset={onReset}
          onHover={onHover}
          onHoverEnd={onHoverEnd}
        />
        <section className="plot-area" id="mainPlot">
          {/* Chart surface with synchronized legend visibility */}
          <ChartSurface
            data={MOCK_DATA}
            seriesDefs={SERIES_DEFS}
            visibleSet={visibleSet}
            highlightedId={highlightedId}
          />
          {Array.from(visibleSet).length === 0 && (
            <div
              role="status"
              aria-live="polite"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-tertiary)",
                fontSize: 14
              }}
            >
              No series selected
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
