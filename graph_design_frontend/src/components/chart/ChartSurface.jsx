import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart
} from "recharts";

/**
 * PUBLIC_INTERFACE
 * ChartSurface renders a grid + axes with multiple series based on visibility and highlight state.
 * It abstracts the underlying charting library to allow swapping later if needed.
 */
export default function ChartSurface({
  data,
  seriesDefs,
  visibleSet,
  highlightedId,
  width = "100%",
  height = 340,
}) {
  // Map CSS var color
  const getColor = (cssVar) => getComputedStyle(document.documentElement).getPropertyValue(cssVar) || "#8884d8";

  const lines = useMemo(() => seriesDefs.filter(s => s.type === "line"), [seriesDefs]);
  const points = useMemo(() => seriesDefs.filter(s => s.type !== "line"), [seriesDefs]);

  const gridStroke = "#E5E7EB"; // var(--surface-border)
  const tickColor = "#6B7280";

  const commonLineProps = (id, colorVar) => {
    const isVisible = visibleSet.has(id);
    const isHighlighted = highlightedId === id;
    return {
      key: id,
      dataKey: id,
      type: "monotone",
      stroke: getColor(colorVar).trim() || "#8884d8",
      strokeWidth: isHighlighted ? 3 : 2,
      dot: false,
      isAnimationActive: false,
      hide: !isVisible
    };
  };

  // For points we render on top using a synchronized ScatterChart overlay approach.
  // Using the same data and axes ensures alignment.
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={gridStroke} strokeOpacity={0.7} vertical={{}} horizontal={{}} />
          <XAxis
            dataKey="x"
            tick={{ fill: tickColor, fontSize: 12 }}
            axisLine={{ stroke: gridStroke }}
            tickLine={{ stroke: gridStroke }}
            interval={0}
            tickCount={data?.length}
          />
          <YAxis
            tick={{ fill: tickColor, fontSize: 12 }}
            axisLine={{ stroke: gridStroke }}
            tickLine={{ stroke: gridStroke }}
            domain={[0, 200]}
            ticks={Array.from({ length: 11 }, (_, i) => i * 20)}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: gridStroke, boxShadow: "0 2px 8px rgba(16,24,40,0.08)" }}
            labelStyle={{ color: "#111827" }}
          />
          {lines.map(({ id, colorVar }) => (
            <Line {...commonLineProps(id, colorVar)} />
          ))}
          {/* Overlay points using Scatter; if value is null, Recharts skips it */}
          {points.map(({ id, colorVar, type }) => {
            const color = getColor(colorVar).trim();
            const isVisible = visibleSet.has(id);
            const isHighlighted = highlightedId === id;
            const size = isHighlighted ? 8 : 6; // highlight larger
            return (
              <Scatter
                key={id}
                name={id}
                data={data.map(d => ({ x: d.x, y: d[id] }))}
                fill={color || "#111827"}
                shape={(props) => {
                  const { cx, cy } = props;
                  if (dIsNull(props)) return null;
                  if (type === "point-square") {
                    return (
                      <rect
                        x={cx - size / 2}
                        y={cy - size / 2}
                        width={size}
                        height={size}
                        fill={color}
                        opacity={isVisible ? 1 : 0}
                        rx={2}
                      />
                    );
                  }
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={size / 2}
                      fill={color}
                      opacity={isVisible ? 1 : 0}
                    />
                  );
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function dIsNull(props) {
  // Recharts Scatter passes 'payload' with 'y' value; if null, skip rendering.
  const y = props?.payload?.y;
  return y === null || typeof y === "undefined";
}
