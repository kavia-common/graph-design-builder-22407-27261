/* eslint-disable no-undef */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

/**
 * Test environment polyfills/mocks.
 *
 * Recharts' ResponsiveContainer relies on ResizeObserver, which jsdom doesn't implement.
 * ChartSurface reads CSS variables via getComputedStyle.
 */

// Polyfill ResizeObserver for jsdom
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Ensure getComputedStyle exists and always returns a stable non-empty value for CSS variables.
if (typeof global.getComputedStyle === "undefined") {
  global.getComputedStyle = () => ({
    getPropertyValue: () => "#8884d8",
  });
} else {
  const original = global.getComputedStyle;
  global.getComputedStyle = (elt) => {
    const res = original(elt);
    if (!res || typeof res.getPropertyValue !== "function") {
      return { getPropertyValue: () => "#8884d8" };
    }
    // Wrap to ensure empty string returns a stable fallback color used by ChartSurface.
    return {
      ...res,
      getPropertyValue: (prop) => res.getPropertyValue(prop) || "#8884d8",
    };
  };
}
