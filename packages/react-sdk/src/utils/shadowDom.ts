/**
 * Shadow DOM utilities for isolated rendering
 * Prevents style conflicts with host application
 */

const TOOLBAR_CONTAINER_ID = "flags-sdk-toolbar-container";
const TOOLBAR_STYLE_ID = "flags-sdk-toolbar-styles";

// Events to stop propagation to prevent host app interference
const PROPAGATED_EVENTS = [
  "click",
  "mousedown",
  "mouseup",
  "keydown",
  "keyup",
  "input",
  "change",
  "focus",
  "blur",
];

/**
 * Creates or retrieves a shadow DOM container for the toolbar
 * This isolates the toolbar styles from the host page
 */
export function attachShadowContainer(placement: string = "bottom-right"): ShadowRoot {
  let container = document.querySelector(`#${TOOLBAR_CONTAINER_ID}`) as HTMLElement;

  if (!container) {
    container = document.createElement("div");
    container.id = TOOLBAR_CONTAINER_ID;

    // Attach shadow root for style isolation
    container.attachShadow({ mode: "open" });

    // Reset all inherited styles and cover the viewport to provide a stable base for fixed elements
    container.style.cssText = "all: initial; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999999; pointer-events: none; display: block;";

    // Stop event propagation to prevent interference with host app
    for (const event of PROPAGATED_EVENTS) {
      container.addEventListener(event, (e) => e.stopPropagation(), {
        passive: true,
      });
    }

    document.body.appendChild(container);
  }

  // Update position variables on the container so they are available to the shadow DOM
  const pos = parsePosition(placement);
  container.style.setProperty("--toolbar-top", "auto");
  container.style.setProperty("--toolbar-left", "auto");
  container.style.setProperty("--toolbar-bottom", "auto");
  container.style.setProperty("--toolbar-right", "auto");

  for (const [key, value] of Object.entries(pos)) {
    container.style.setProperty(`--toolbar-${key}`, value as string);
  }

  return container.shadowRoot!;
}

/**
 * Injects styles into shadow root idempotently
 */
export function injectStyles(shadowRoot: ShadowRoot, css: string) {
  if (shadowRoot.querySelector(`#${TOOLBAR_STYLE_ID}`)) return;

  const style = document.createElement("style");
  style.id = TOOLBAR_STYLE_ID;
  style.textContent = css;
  shadowRoot.appendChild(style);
}

/**
 * Parse position offset values
 */
export function parseOffset(offsetInput?: number | string): string {
  if (offsetInput === undefined) return "1rem";
  if (typeof offsetInput === "number") return `${offsetInput}px`;
  return offsetInput;
}

/**
 * Parse toolbar position into CSS position styles
 */
export function parsePosition(placement: string, offset?: { x?: number | string; y?: number | string }) {
  const offsetY = parseOffset(offset?.y);
  const offsetX = parseOffset(offset?.x);

  switch (placement) {
    case "top-left":
      return { top: offsetY, left: offsetX };
    case "top-right":
      return { top: offsetY, right: offsetX };
    case "bottom-left":
      return { bottom: offsetY, left: offsetX };
    case "bottom-right":
      return { bottom: offsetY, right: offsetX };
    default:
      console.warn("[Flags SDK] Invalid placement:", placement, "- defaulting to bottom-right");
      return { bottom: "1rem", right: "1rem" };
  }
}
