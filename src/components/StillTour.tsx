"use client";

import { useCallback, useState } from "react";
import { STOPS, type StopId } from "@/lib/tour";
import { TourOverlays } from "./TourOverlays";
import styles from "./StillTour.module.css";

type Props = {
  initialStop?: StopId;
};

export function StillTour({ initialStop = "eksterior" }: Props) {
  const [stopId, setStopId] = useState<StopId>(initialStop);
  const stop = STOPS.find((s) => s.id === stopId)!;

  const onGo = useCallback((id: StopId) => {
    setStopId(id);
  }, []);

  return (
    <div className={styles.root}>
      <div
        className={styles.still}
        style={{ backgroundImage: `url(${stop.still})` }}
        role="img"
        aria-label={stop.title}
      />
      <div className={styles.veil} />
      <TourOverlays activeId={stopId} traveling={false} onGo={onGo} />
      <p className={styles.notice}>Mode foto — WebGL tidak tersedia</p>
    </div>
  );
}
