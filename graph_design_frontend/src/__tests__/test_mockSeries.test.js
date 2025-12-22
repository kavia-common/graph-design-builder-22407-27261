import { SERIES_DEFS, MOCK_DATA } from "../data/mockSeries";

describe("mockSeries data", () => {
  test("SERIES_DEFS includes expected ids and includes both line and point types", () => {
    const ids = SERIES_DEFS.map((s) => s.id);
    expect(ids).toContain("ap-schedule");
    expect(ids).toContain("hr");
    expect(ids).toContain("lvp");

    const types = new Set(SERIES_DEFS.map((s) => s.type));
    expect(types.has("line")).toBe(true);
    expect(types.has("point-circle")).toBe(true);
    expect(types.has("point-square")).toBe(true);
  });

  test("MOCK_DATA spans 0..1100 by 50 and includes null point values for non-100 steps", () => {
    expect(MOCK_DATA).toHaveLength(23);
    expect(MOCK_DATA[0].x).toBe(0);
    expect(MOCK_DATA[MOCK_DATA.length - 1].x).toBe(1100);

    // Every step is 50
    for (let i = 1; i < MOCK_DATA.length; i += 1) {
      expect(MOCK_DATA[i].x - MOCK_DATA[i - 1].x).toBe(50);
    }

    // Points are only populated every 100; ensure at least one known null and one known number exist.
    const x50 = MOCK_DATA.find((d) => d.x === 50);
    const x100 = MOCK_DATA.find((d) => d.x === 100);

    expect(x50.hr).toBeNull();
    expect(typeof x100.hr).toBe("number");

    expect(x50.lvp).toBeNull();
    expect(typeof x100.lvp).toBe("number");
  });

  test("line series values are always numbers (jitter/baseLine path executed)", () => {
    // Pick a few sample line ids and ensure values exist and are numbers for multiple points.
    const lineIds = SERIES_DEFS.filter((s) => s.type === "line").map((s) => s.id);

    // Cover a few points across the range.
    const samples = [MOCK_DATA[0], MOCK_DATA[5], MOCK_DATA[10], MOCK_DATA[22]];
    for (const d of samples) {
      for (const id of lineIds) {
        expect(typeof d[id]).toBe("number");
      }
    }
  });
});
