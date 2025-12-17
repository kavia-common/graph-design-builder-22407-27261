export const SERIES_DEFS = [
  { id: "ap-schedule", name: "Anterior AP Schedule", colorVar: "--series-ap-schedule", type: "line" },
  { id: "ap-strain", name: "Anterior AP Strain", colorVar: "--series-ap-strain", type: "line" },
  { id: "ap-shearstrain", name: "Anterior AP Shearstrain", colorVar: "--series-ap-shearstrain", type: "line" },
  { id: "ap-tschedule", name: "Anterior AP tSchedule", colorVar: "--series-ap-tschedule", type: "line" },
  { id: "ap-tstrain", name: "Anterior AP tStrain", colorVar: "--series-ap-tstrain", type: "line" },

  { id: "post-ap-schedule", name: "Posterior AP Schedule", colorVar: "--series-post-ap-schedule", type: "line" },
  { id: "post-ap-shearstrain", name: "Posterior AP Shearstrain", colorVar: "--series-post-ap-shearstrain", type: "line" },
  { id: "post-ap-tschedule", name: "Posterior AP tSchedule", colorVar: "--series-post-ap-tschedule", type: "line" },
  { id: "post-ap-tshearstrain", name: "Posterior AP tShearstrain", colorVar: "--series-post-ap-tshearstrain", type: "line" },

  { id: "hr", name: "Heart Rate", colorVar: "--series-hr", type: "point-circle" },
  { id: "rr", name: "Respiratory Rate", colorVar: "--series-rr", type: "point-circle" },
  { id: "spo2", name: "SpO2", colorVar: "--series-spo2", type: "point-circle" },
  { id: "lvp", name: "LVP", colorVar: "--series-lvp", type: "point-square" },
  { id: "temp", name: "Temperature", colorVar: "--series-temp", type: "point-circle" }
];

// Create a small consistent dataset from x=0..1100 step 50; y varies by series
const xs = Array.from({ length: 23 }, (_, i) => i * 50); // 0..1100

function baseLine(x, amp = 20, offset = 80, freq = 0.01) {
  return Math.round(offset + amp * Math.sin(x * freq));
}
function jitter(y, j = 5) {
  return y + Math.round((Math.random() - 0.5) * j);
}

export const MOCK_DATA = xs.map((x) => {
  return {
    x,
    "ap-schedule": jitter(baseLine(x, 18, 90, 0.012)),
    "ap-strain": jitter(baseLine(x, 22, 100, 0.011)),
    "ap-shearstrain": jitter(baseLine(x, 16, 85, 0.013)),
    "ap-tschedule": jitter(baseLine(x, 14, 75, 0.015)),
    "ap-tstrain": jitter(baseLine(x, 12, 70, 0.017)),

    "post-ap-schedule": jitter(baseLine(x, 15, 95, 0.014)),
    "post-ap-shearstrain": jitter(baseLine(x, 12, 88, 0.012)),
    "post-ap-tschedule": jitter(baseLine(x, 10, 78, 0.016)),
    "post-ap-tshearstrain": jitter(baseLine(x, 9, 72, 0.018)),

    // points: sparser values every 100
    hr: x % 100 === 0 ? jitter(60 + (x / 100) % 5 * 5, 2) : null,
    rr: x % 100 === 0 ? jitter(16 + ((x / 100) % 4), 1) : null,
    spo2: x % 100 === 0 ? jitter(97, 1) : null,
    lvp: x % 100 === 0 ? jitter(120 + (x / 100) % 3 * 8, 3) : null,
    temp: x % 100 === 0 ? jitter(37, 1) : null,
  };
});
