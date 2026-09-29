"use client";

import { Component, type ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { STOPS, type StopId } from "@/lib/tour";
import { TourOverlays } from "./TourOverlays";
import { StillTour } from "./StillTour";
import styles from "./VillaTour.module.css";

const VillaCanvas = dynamic(
  () => import("./VillaCanvas").then((m) => m.VillaCanvas),
  { ssr: false },
);

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function VillaTour() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [stopId, setStopId] = useState<StopId>("eksterior");
  const [traveling, setTraveling] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  const goTo = useCallback(
    (id: StopId) => {
      if (id === stopId || traveling) return;
      setTraveling(true);
      setStopId(id);
    },
    [stopId, traveling],
  );

  const onArrived = useCallback(() => {
    setTraveling(false);
  }, []);

  const onReady = useCallback(() => {
    setReady(true);
  }, []);

  const onFatal = useCallback(() => {
    setWebgl(false);
  }, []);

  if (webgl === null) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>Memuat tur…</div>
      </div>
    );
  }

  if (!webgl) {
    return <StillTour initialStop={stopId} />;
  }

  return (
    <div className={styles.root}>
      <div className={styles.canvasWrap} aria-hidden={!ready}>
        <WebGLErrorBoundary onError={onFatal}>
          <VillaCanvas
            stopId={stopId}
            traveling={traveling}
            onArrived={onArrived}
            onReady={onReady}
            onFatal={onFatal}
          />
        </WebGLErrorBoundary>
      </div>
      <div className={styles.veil} />
      <TourOverlays activeId={stopId} traveling={traveling} onGo={goTo} />
      {!ready && <div className={styles.loading}>Menyiapkan ruang…</div>}
      <span className={styles.srOnly}>
        Tur villa dengan {STOPS.length} pemberhentian berpandu.
      </span>
    </div>
  );
}
