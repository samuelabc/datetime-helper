export interface DatetimeHelperElementOptions {
  baseUrl: string;
  stateQuery: string;
}

function normalizeBaseUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl, typeof window !== "undefined" ? window.location.href : "https://example.com");
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "/";
    }
    return parsed.toString();
  } catch {
    return "/";
  }
}

export function resolveElementOptions(element: HTMLElement): DatetimeHelperElementOptions {
  const rawBaseUrl = element.getAttribute("base-url") ?? "/";
  const stateQuery = element.getAttribute("state") ?? "";
  return { baseUrl: normalizeBaseUrl(rawBaseUrl), stateQuery };
}

export class DatetimeHelperElement extends HTMLElement {
  private iframe: HTMLIFrameElement | null = null;

  static get observedAttributes(): string[] {
    return ["base-url", "state"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.render();
  }

  attributeChangedCallback(): void {
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) return;
    const { baseUrl, stateQuery } = resolveElementOptions(this);
    if (!this.iframe) {
      this.iframe = document.createElement("iframe");
      this.iframe.setAttribute("part", "frame");
      this.iframe.style.width = "100%";
      this.iframe.style.minHeight = "720px";
      this.iframe.style.border = "0";
      this.shadowRoot.appendChild(this.iframe);
    }
    const query = stateQuery.trim().length > 0 ? (stateQuery.startsWith("?") ? stateQuery : `?${stateQuery}`) : "";
    this.iframe.src = `${baseUrl}${query}`;
    this.iframe.title = "datetime-helper";
  }
}

if (typeof window !== "undefined" && !window.customElements.get("datetime-helper")) {
  window.customElements.define("datetime-helper", DatetimeHelperElement);
}
