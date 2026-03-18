/**
 * Yields to the main thread, allowing the browser to process pending events.
 * Uses scheduler.yield() when available (Chrome 115+), falls back to setTimeout(0).
 * Use in heavy event handlers to improve INP (Interaction to Next Paint).
 */
export async function yieldToMain(): Promise<void> {
  if (
    "scheduler" in globalThis &&
    typeof (
      globalThis as unknown as { scheduler: { yield?: () => Promise<void> } }
    ).scheduler?.yield === "function"
  ) {
    await (
      globalThis as unknown as { scheduler: { yield: () => Promise<void> } }
    ).scheduler.yield();
  } else {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}
