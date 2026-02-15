import { describe, expect, it } from "vitest";
import { DatetimeHelperElement, resolveElementOptions } from "./datetime-helper-element";

describe("datetime-helper web component", () => {
  it("reads base-url and state attributes", () => {
    const element = document.createElement("div");
    element.setAttribute("base-url", "https://example.com/app");
    element.setAttribute("state", "s=now");
    const options = resolveElementOptions(element);
    expect(options).toEqual({ baseUrl: "https://example.com/app", stateQuery: "s=now" });
  });

  it("rejects non-http base-url values", () => {
    const element = document.createElement("div");
    element.setAttribute("base-url", "javascript:alert(1)");
    const options = resolveElementOptions(element);
    expect(options.baseUrl).toBe("/");
  });

  it("renders iframe and updates src on attribute changes", () => {
    const element = new DatetimeHelperElement();
    element.setAttribute("base-url", "https://example.com/app");
    element.setAttribute("state", "s=now");
    document.body.appendChild(element);
    element.connectedCallback();

    const frame = element.shadowRoot?.querySelector("iframe");
    expect(frame).toBeTruthy();
    expect(frame?.getAttribute("src")).toBe("https://example.com/app?s=now");

    element.setAttribute("state", "s=2026-03-15");
    element.attributeChangedCallback();
    expect(frame?.getAttribute("src")).toBe("https://example.com/app?s=2026-03-15");
  });
});
