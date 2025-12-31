import React from "react";

export default function AppTransitionOverlay() {
  const [visible, setVisible] = React.useState(false);
  const [opacity, setOpacity] = React.useState(0);
  const [duration, setDuration] = React.useState(240);
  const hideTimerRef = React.useRef(null);

  React.useEffect(() => {
    const onTransition = (event) => {
      const phase = event?.detail?.phase;
      const nextDuration = Number(event?.detail?.duration ?? 240);

      if (!phase) return;

      setDuration(Number.isFinite(nextDuration) ? nextDuration : 240);

      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      if (phase === "out") {
        setVisible(true);
        // next tick so transition applies
        requestAnimationFrame(() => setOpacity(1));
        return;
      }

      if (phase === "in") {
        setOpacity(0);
        hideTimerRef.current = window.setTimeout(() => {
          setVisible(false);
          hideTimerRef.current = null;
        }, Number.isFinite(nextDuration) ? nextDuration : 240);
      }
    };

    window.addEventListener("rm_app_transition", onTransition);
    return () => {
      window.removeEventListener("rm_app_transition", onTransition);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 9999,
        opacity,
        transition: `opacity ${duration}ms var(--ease-out-smooth)`,
        background:
          "radial-gradient(900px 600px at 12% 10%, rgba(var(--brand-cyan-rgb), 0.22) 0%, rgba(255,255,255,0) 62%)," +
          "radial-gradient(900px 600px at 90% 12%, rgba(var(--primary-rgb), 0.20) 0%, rgba(255,255,255,0) 62%)," +
          "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,1) 60%)",
      }}
    />
  );
}
