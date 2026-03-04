import "@testing-library/jest-dom/vitest";
import globalJsdom from "global-jsdom";

// Provide a browser-like DOM for component tests while running in node env.
const cleanupDom = globalJsdom(undefined, { url: "http://localhost" });

beforeEach(() => {
  // Keep each test isolated from stored browser data.
  localStorage.clear();
});

afterAll(() => {
  cleanupDom();
});
