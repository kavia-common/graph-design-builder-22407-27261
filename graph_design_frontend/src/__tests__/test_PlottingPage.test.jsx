import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlottingPage from "../pages/PlottingPage";

jest.mock("recharts");

describe("PlottingPage (Legend <-> ChartSurface integration)", () => {
  test("initially renders dashboard with legend switches all on and chart lines not hidden", () => {
    render(<PlottingPage />);

    expect(screen.getByRole("main", { name: "Plot dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Symbols legend" })).toBeInTheDocument();

    // Ensure at least one known legend item exists and is initially checked.
    const apSchedule = screen.getByRole("switch", {
      name: /Toggle series: Anterior AP Schedule/i,
    });
    expect(apSchedule).toHaveAttribute("aria-checked", "true");

    // In ChartSurface, line series are rendered as mocked <div data-recharts="Line"> nodes.
    const lineNodes = screen.getAllByText((_, el) => el?.dataset?.recharts === "Line");
    expect(lineNodes.length).toBeGreaterThan(0);

    const apLine = lineNodes.find((n) => n.getAttribute("data-key") === "ap-schedule");
    expect(apLine).toHaveAttribute("data-hide", "false");
  });

  test("toggling a legend switch updates chart visibility; when all off shows empty state", async () => {
    const user = userEvent.setup();
    render(<PlottingPage />);

    // Toggle off one series and ensure corresponding line is hidden.
    const apScheduleSwitch = screen.getByRole("switch", {
      name: /Toggle series: Anterior AP Schedule/i,
    });

    await user.click(apScheduleSwitch);
    expect(apScheduleSwitch).toHaveAttribute("aria-checked", "false");

    const lineNodesAfter = screen.getAllByText((_, el) => el?.dataset?.recharts === "Line");
    const apLineAfter = lineNodesAfter.find((n) => n.getAttribute("data-key") === "ap-schedule");
    expect(apLineAfter).toHaveAttribute("data-hide", "true");

    // Now toggle off all series switches quickly; should show empty-state message.
    const allSwitches = screen.getAllByRole("switch");
    for (const sw of allSwitches) {
      if (sw.getAttribute("aria-checked") === "true") {
        // eslint-disable-next-line no-await-in-loop
        await user.click(sw);
      }
    }

    expect(screen.getByRole("status")).toHaveTextContent("No series selected");
  });

  test("hover/focus on a legend item highlights the corresponding series; leaving/blur clears highlight", async () => {
    const user = userEvent.setup();
    render(<PlottingPage />);

    const apStrainSwitch = screen.getByRole("switch", {
      name: /Toggle series: Anterior AP Strain/i,
    });

    // Hover => highlightedId should equal ap-strain => line strokeWidth 3
    await user.hover(apStrainSwitch);

    const lineNodes = screen.getAllByText((_, el) => el?.dataset?.recharts === "Line");
    const apStrainLine = lineNodes.find((n) => n.getAttribute("data-key") === "ap-strain");
    expect(apStrainLine).toHaveAttribute("data-stroke-width", "3");

    // Unhover => highlightedId null => strokeWidth 2
    await user.unhover(apStrainSwitch);
    const lineNodes2 = screen.getAllByText((_, el) => el?.dataset?.recharts === "Line");
    const apStrainLine2 = lineNodes2.find((n) => n.getAttribute("data-key") === "ap-strain");
    expect(apStrainLine2).toHaveAttribute("data-stroke-width", "2");

    // Focus => highlight again
    await user.tab();
    expect(apStrainSwitch).toHaveFocus();
    const lineNodes3 = screen.getAllByText((_, el) => el?.dataset?.recharts === "Line");
    const apStrainLine3 = lineNodes3.find((n) => n.getAttribute("data-key") === "ap-strain");
    expect(apStrainLine3).toHaveAttribute("data-stroke-width", "3");

    // Blur by tabbing away => clear highlight
    await user.tab();
    const lineNodes4 = screen.getAllByText((_, el) => el?.dataset?.recharts === "Line");
    const apStrainLine4 = lineNodes4.find((n) => n.getAttribute("data-key") === "ap-strain");
    expect(apStrainLine4).toHaveAttribute("data-stroke-width", "2");
  });

  test("reset makes all series visible again and clears any highlight + empty state", async () => {
    const user = userEvent.setup();
    render(<PlottingPage />);

    const apScheduleSwitch = screen.getByRole("switch", {
      name: /Toggle series: Anterior AP Schedule/i,
    });
    const resetBtn = screen.getByRole("button", { name: "Reset" });

    // Turn everything off to show empty state.
    const allSwitches = screen.getAllByRole("switch");
    for (const sw of allSwitches) {
      // eslint-disable-next-line no-await-in-loop
      await user.click(sw);
    }
    expect(screen.getByRole("status")).toHaveTextContent("No series selected");

    // Also create a highlight state by hovering (even though all are off) before reset.
    await user.hover(apScheduleSwitch);

    // Reset => empty state removed and all switches on.
    await user.click(resetBtn);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    const switchesAfter = screen.getAllByRole("switch");
    switchesAfter.forEach((sw) => {
      expect(sw).toHaveAttribute("aria-checked", "true");
    });

    // Highlight cleared on reset => non-highlighted strokeWidth 2
    const lines = screen.getAllByText((_, el) => el?.dataset?.recharts === "Line");
    const apLine = lines.find((n) => n.getAttribute("data-key") === "ap-schedule");
    expect(apLine).toHaveAttribute("data-stroke-width", "2");
    expect(apLine).toHaveAttribute("data-hide", "false");
  });
});
