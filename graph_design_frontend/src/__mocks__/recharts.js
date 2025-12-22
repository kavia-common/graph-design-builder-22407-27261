const React = require("react");

/**
 * Minimal deterministic mock of Recharts primitives for Jest + RTL.
 *
 * It renders lightweight DOM nodes so tests can:
 * - find axes / grids / tooltip nodes
 * - inspect Line/Scatter props via data-* attributes
 * - execute Scatter's `shape` callback to validate selection/highlight/null logic
 */

function passthrough(tag, displayName) {
  const C = React.forwardRef(({ children, ...props }, ref) => {
    // Avoid exploding on circular/complex props by stringifying selectively.
    const safeProps = {};
    Object.keys(props || {}).forEach((k) => {
      const v = props[k];
      if (typeof v === "function") return;
      if (k === "data" && Array.isArray(v)) safeProps[k] = `len:${v.length}`;
      else if (typeof v === "object" && v !== null) safeProps[k] = "[object]";
      else safeProps[k] = v;
    });
    return React.createElement(
      tag,
      { ref, "data-recharts": displayName, ...safeProps },
      children
    );
  });
  C.displayName = displayName;
  return C;
}

const ResponsiveContainer = ({ children }) =>
  React.createElement("div", { "data-recharts": "ResponsiveContainer" }, children);

const LineChart = passthrough("div", "LineChart");
const XAxis = passthrough("div", "XAxis");
const YAxis = passthrough("div", "YAxis");
const CartesianGrid = passthrough("div", "CartesianGrid");
const Tooltip = passthrough("div", "Tooltip");

// Render each Line as a DOM node with key props accessible.
const Line = ({ dataKey, strokeWidth, hide, stroke }) =>
  React.createElement("div", {
    "data-recharts": "Line",
    "data-key": dataKey,
    "data-stroke": stroke,
    "data-stroke-width": String(strokeWidth),
    "data-hide": String(!!hide),
  });

/**
 * Scatter mock:
 * - records visibility/highlight indirectly through ChartSurface's `shape`
 * - executes `shape` callback for each point, so tests can assert whether
 *   a circle/rect is returned, with correct opacity and sizing.
 */
const Scatter = ({ name, data = [], shape, fill }) => {
  const shapes = [];

  if (typeof shape === "function") {
    for (let i = 0; i < data.length; i += 1) {
      const pt = data[i];
      // Simulate how Recharts passes props into the shape callback.
      const el = shape({
        cx: 10 + i,
        cy: 20 + i,
        payload: { y: pt?.y },
      });
      if (el) shapes.push(el);
    }
  }

  return React.createElement(
    "div",
    {
      "data-recharts": "Scatter",
      "data-name": name,
      "data-fill": fill,
      "data-data-len": String(data.length),
      "data-rendered-shapes": String(shapes.length),
    },
    shapes
  );
};

const ScatterChart = passthrough("div", "ScatterChart");

module.exports = {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Scatter,
  ScatterChart,
};
