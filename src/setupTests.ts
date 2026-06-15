import "@testing-library/jest-dom";

// jsdom does not implement element scrolling APIs that horizontally-scrolling
// UI (bracket, group strip) calls in mount effects. Provide no-op shims.
if (typeof Element !== "undefined") {
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
