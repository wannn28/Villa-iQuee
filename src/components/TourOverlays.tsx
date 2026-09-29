"use client";

import { RAIL, STOPS, type StopId } from "@/lib/tour";
import styles from "./TourOverlays.module.css";

type Props = {
  activeId: StopId;
  traveling: boolean;
  onGo: (id: StopId) => void;
};

export function TourOverlays({ activeId, traveling, onGo }: Props) {
  const active = STOPS.find((s) => s.id === activeId)!;
  const hotspot = active.hotspot;
  const span = RAIL.right - RAIL.left;

  return (
    <div className={styles.overlay} aria-label="Kontrol tur villa">
      <header className={styles.brand}>
        <p className={styles.brandName}>Villa Senyap</p>
        <p className={styles.brandSub}>Tur diam · empat ruang</p>
      </header>

      <div className={styles.copy}>
        <p className={styles.stepLabel}>
          {String(STOPS.findIndex((s) => s.id === activeId) + 1).padStart(2, "0")}{" "}
          / {String(STOPS.length).padStart(2, "0")}
        </p>
        <h1 className={styles.title}>{active.title}</h1>
        <p className={styles.caption}>{active.caption}</p>
      </div>

      {hotspot && (
        <button
          type="button"
          className={styles.hotspot}
          style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          disabled={traveling}
          onClick={() => onGo(hotspot.target)}
          aria-label={`Lanjut ke ${hotspot.label}`}
        >
          <span className={styles.hotspotRing} />
          <span className={styles.hotspotLabel}>{hotspot.label}</span>
        </button>
      )}

      <nav
        className={styles.rail}
        style={{
          left: `${RAIL.left}%`,
          width: `${span}%`,
          top: `${RAIL.top}%`,
        }}
        aria-label="Langkah tur"
      >
        {STOPS.map((stop, index) => {
          const isActive = stop.id === activeId;
          return (
            <button
              key={stop.id}
              type="button"
              className={`${styles.step} ${isActive ? styles.stepActive : ""}`}
              style={{ width: `${100 / STOPS.length}%` }}
              disabled={traveling || isActive}
              onClick={() => onGo(stop.id)}
              aria-current={isActive ? "step" : undefined}
              aria-label={stop.label}
              title={stop.label}
            >
              <span className={styles.stepMark} />
              <span className={styles.stepText}>{stop.label}</span>
              <span className={styles.srOnly}>
                Langkah {index + 1}: {stop.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
