import React from "react";
import { render, screen } from "@testing-library/react";
import ChartSurface from "../components/chart/ChartSurface";

// Ensure our mock is used (CRA/Jest will pick up src/__mocks__/recharts.js automatically)
jest.mock("recharts");

describe("ChartSurface", () => {
  test("renders a chart container with axes/grid/tooltip and draws line series with hide + strokeWidth based on visible/highlight", () => {
    const seriesDefs = [
      { id: "l1", name: "Line 1", colorVar: "--c1", type: "line" },
      { id: "l2", name: "Line 2", colorVar: "--c2", type: "line" },
    ];

    const data = [
      { x: 0, l1: 1, l2: 2 },
      { x: 1, l1: 2, l2: 3 },
    ];

    render(
      <ChartSurface
        data={data}
        seriesDefs={seriesDefs}
        visibleSet={new Set(["l1"])}
        highlightedId="l1"
        width={500}
        height={300}
      />
    );

    // Basic structure from mock components
    expect(screen.getByText((_, el) => el?.dataset?.recharts === "LineChart")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.dataset?.recharts === "XAxis")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.dataset?.recharts === "YAxis")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.dataset?.recharts === "CartesianGrid")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.dataset?.recharts === "Tooltip")).toBeInTheDocument();

    const lines = screen.getAllByText((_, el) => el?.dataset?.recharts === "Line");
    expect(lines).toHaveLength(2);

    const line1 = lines.find((n) => n.getAttribute("data-key") === "l1");
    const line2 = lines.find((n) => n.getAttribute("data-key") === "l2");

    // l1 visible + highlighted => hide=false and strokeWidth=3
    expect(line1).toHaveAttribute("data-hide", "false");
    expect(line1).toHaveAttribute("data-stroke-width", "3");

    // l2 not visible => hide=true and not highlighted => strokeWidth=2
    expect(line2).toHaveAttribute("data-hide", "true");
    expect(line2).toHaveAttribute("data-stroke-width", "2");
  });

  test("renders point series as circle/square shapes, applies opacity based on visibleSet, and skips null/undefined points", () => {
    const seriesDefs = [
      { id: "pCircle", name: "Point Circle", colorVar: "--pc", type: "point-circle" },
      { id: "pSquare", name: "Point Square", colorVar: "--ps", type: "point-square" },
    ];

    // Contains a mix of present values and null/undefined values to exercise dIsNull branches.
    const data = [
      { x: 0, pCircle: 10, pSquare: 20 },
      { x: 1, pCircle: null, pSquare: null },
      { x: 2, pCircle: undefined, pSquare: undefined },
      { x: 3, pCircle: 30, pSquare: 40 },
    ];

    render(
      <ChartSurface
        data={data}
        seriesDefs={seriesDefs}
        visibleSet={new Set(["pSquare"])}
        highlightedId="pSquare"
      />
    );

    const scatters = screen.getAllByText((_, el) => el?.dataset?.recharts === "Scatter");
    expect(scatters).toHaveLength(2);

    const circleScatter = scatters.find((n) => n.getAttribute("data-name") === "pCircle");
    const squareScatter = scatters.find((n) => n.getAttribute("data-name") === "pSquare");

    // Our mock executes shape callback only for non-null/non-undefined points.
    // We have 2 non-null points (x=0, x=3) so rendered shapes should be 2.
    expect(circleScatter).toHaveAttribute("data-rendered-shapes", "2");
    expect(squareScatter).toHaveAttribute("data-rendered-shapes", "2");

    // Inspect actual rendered SVG-ish elements from the shape callback.
    // Circle series (not visible) => circles exist but opacity is 0.
    const renderedCircles = circleScatter.querySelectorAll("circle");
    expect(renderedCircles.length).toBe(2);
    renderedCircles.forEach((c) => {
      expect(c.getAttribute("opacity")).toBe("0");
    });

    // Square series visible and highlighted => rects exist, opacity 1 and size 8 (highlighted)
    const renderedRects = squareScatter.querySelectorAll("rect");
    expect(renderedRects.length).toBe(2);
    renderedRects.forEach((r) => {
      expect(r.getAttribute("opacity")).toBe("1");
      expect(r.getAttribute("width")).toBe("8");
      expect(r.getAttribute("height")).toBe("8");
      // rx fixed at 2
      expect(r.getAttribute("rx")).toBe("2");
    });
  });

  test("non-highlighted point series uses size 6 (circle radius 3)", () => {
    const seriesDefs = [{ id: "p", name: "P", colorVar: "--p", type: "point-circle" }];
    const data = [
      { x: 0, p: 10 },
      { x: 1, p: 20 },
    ];

    render(
      <ChartSurface
        data={data}
        seriesDefs={seriesDefs}
        visibleSet={new Set(["p"])}
        highlightedId={null}
      />
    );

    const scatter = screen.getByText((_, el) => el?.dataset?.recharts === "Scatter");
    const circles = scatter.querySelectorAll("circle");
    expect(circles.length).toBe(2);
    circles.forEach((c) => {
      expect(c.getAttribute("r")).toBe("3");
      expect(c.getAttribute("opacity")).toBe("1");
    });
  });
});
