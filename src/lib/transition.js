function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => {
    try {
      requestAnimationFrame(() => resolve());
    } catch (e) {
      // Non-browser/test env
      resolve();
    }
  });
}

export function triggerAppTransition(phase, duration = 240) {
  try {
    window.dispatchEvent(
      new CustomEvent("rm_app_transition", {
        detail: { phase, duration },
      })
    );
  } catch (e) {
    // no-op
  }
}

export async function runAppTransition(action, { outMs = 220, inMs = 280 } = {}) {
  triggerAppTransition("out", outMs);
  // Let the overlay become visible before we change auth/route.
  await nextFrame();
  await nextFrame();

  await action?.();

  triggerAppTransition("in", inMs);
  // Keep a small delay so fade-in completes when awaited.
  await wait(inMs);
}
