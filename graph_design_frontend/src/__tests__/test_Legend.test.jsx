import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Legend from "../components/legend/Legend";

describe("Legend", () => {
  const items = [
    { id: "a", name: "Series A", colorVar: "--series-a", type: "line" },
    { id: "b", name: "Series B", colorVar: "--series-b", type: "point-square" },
  ];

  test("renders Symbols header, reset button, items, and note text", () => {
    render(
      <Legend
        items={items}
        visibleSet={new Set(["a", "b"])}
        onToggle={() => {}}
        onReset={() => {}}
      />
    );

    expect(
      screen.getByRole("complementary", { name: "Symbols legend" })
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Symbols" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();

    expect(
      screen.getByRole("switch", { name: "Toggle series: Series A" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Toggle series: Series B" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Legend of the vital signs symbols/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Dynamic height adjustment/i)
    ).toBeInTheDocument();
  });

  test("applies aria-checked and visual marker opacity/label data-active based on visibleSet", () => {
    render(
      <Legend
        items={items}
        visibleSet={new Set(["a"])}
        onToggle={() => {}}
        onReset={() => {}}
      />
    );

    const switchA = screen.getByRole("switch", { name: /Series A/i });
    const switchB = screen.getByRole("switch", { name: /Series B/i });

    expect(switchA).toHaveAttribute("aria-checked", "true");
    expect(switchB).toHaveAttribute("aria-checked", "false");

    expect(switchA).toHaveAttribute("aria-controls", "mainPlot");
    expect(switchB).toHaveAttribute("aria-controls", "mainPlot");

    const labelA = within(switchA).getByText("Series A");
    const labelB = within(switchB).getByText("Series B");
    expect(labelA).toHaveAttribute("data-active", "1");
    expect(labelB).toHaveAttribute("data-active", "0");

    const markerA = switchA.querySelector(".marker");
    const markerB = switchB.querySelector(".marker");
    expect(markerA).toBeTruthy();
    expect(markerB).toBeTruthy();

    // Style attribute is present; actual computed value isn't needed for the test.
    expect(markerA.getAttribute("style")).toContain("opacity: 1");
    expect(markerB.getAttribute("style")).toContain("opacity: 0.4");
  });

  test("marker shape class is square for point-square else circle", () => {
    render(
      <Legend
        items={items}
        visibleSet={new Set(["a", "b"])}
        onToggle={() => {}}
        onReset={() => {}}
      />
    );

    const switchA = screen.getByRole("switch", { name: /Series A/i });
    const switchB = screen.getByRole("switch", { name: /Series B/i });

    const markerA = switchA.querySelector(".marker");
    const markerB = switchB.querySelector(".marker");

    expect(markerA.className).toContain("circle");
    expect(markerB.className).toContain("square");
  });

  test("clicking an item calls onToggle with the series id; clicking reset calls onReset", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    const onReset = jest.fn();

    render(
      <Legend
        items={items}
        visibleSet={new Set(["a", "b"])}
        onToggle={onToggle}
        onReset={onReset}
      />
    );

    await user.click(screen.getByRole("switch", { name: /Series A/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("a");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  test("hover/focus triggers onHover and mouseleave/blur triggers onHoverEnd; optional chaining is safe when handlers missing", async () => {
    const user = userEvent.setup();
    const onHover = jest.fn();
    const onHoverEnd = jest.fn();

    const { rerender } = render(
      <Legend
        items={items}
        visibleSet={new Set(["a", "b"])}
        onToggle={() => {}}
        onReset={() => {}}
        onHover={onHover}
        onHoverEnd={onHoverEnd}
      />
    );

    const switchA = screen.getByRole("switch", { name: /Series A/i });

    await user.hover(switchA);
    expect(onHover).toHaveBeenCalledWith("a");

    await user.unhover(switchA);
    expect(onHoverEnd).toHaveBeenCalledTimes(1);

    // Focus/blur path uses the same callbacks.
    await user.tab();
    expect(switchA).toHaveFocus();
    expect(onHover).toHaveBeenCalledWith("a");

    // Move focus away to trigger blur
    await user.tab();
    expect(onHoverEnd).toHaveBeenCalledTimes(2);

    // Optional chaining safety: should not throw when handlers absent.
    rerender(
      <Legend
        items={items}
        visibleSet={new Set(["a", "b"])}
        onToggle={() => {}}
        onReset={() => {}}
        onHover={undefined}
        onHoverEnd={undefined}
      />
    );

    const switchB = screen.getByRole("switch", { name: /Series B/i });
    await user.hover(switchB);
    await user.unhover(switchB);
    await user.click(switchB);
  });
});
