"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  CAMERA_TRAVEL_SECONDS,
  STOPS,
  STOP_INDEX,
  type StopId,
  type Vec3,
} from "@/lib/tour";

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

type GuidedCameraProps = {
  stopId: StopId;
  traveling: boolean;
  onArrived: () => void;
};

function GuidedCamera({ stopId, traveling, onArrived }: GuidedCameraProps) {
  const { camera } = useThree();
  const fromPos = useRef<Vec3>([...STOPS[0].position]);
  const fromLook = useRef<Vec3>([...STOPS[0].lookAt]);
  const toPos = useRef<Vec3>([...STOPS[0].position]);
  const toLook = useRef<Vec3>([...STOPS[0].lookAt]);
  const progress = useRef(1);
  const activeStop = useRef<StopId>(stopId);
  const lookTarget = useRef(new THREE.Vector3(...STOPS[0].lookAt));
  const arrivedRef = useRef(onArrived);
  arrivedRef.current = onArrived;

  useEffect(() => {
    if (stopId === activeStop.current && progress.current >= 1) return;

    const currentLook: Vec3 = [
      lookTarget.current.x,
      lookTarget.current.y,
      lookTarget.current.z,
    ];
    fromPos.current = [camera.position.x, camera.position.y, camera.position.z];
    fromLook.current = currentLook;

    const next = STOPS[STOP_INDEX[stopId]];
    toPos.current = next.position;
    toLook.current = next.lookAt;
    progress.current = 0;
    activeStop.current = stopId;
  }, [stopId, camera]);

  useFrame((_, delta) => {
    if (progress.current < 1) {
      progress.current = Math.min(
        1,
        progress.current + delta / CAMERA_TRAVEL_SECONDS,
      );
      const t = easeInOutCubic(progress.current);
      const p = lerpVec(fromPos.current, toPos.current, t);
      const l = lerpVec(fromLook.current, toLook.current, t);
      camera.position.set(p[0], p[1], p[2]);
      lookTarget.current.set(l[0], l[1], l[2]);
      camera.lookAt(lookTarget.current);

      if (progress.current >= 1) {
        arrivedRef.current();
      }
    } else if (!traveling) {
      const stop = STOPS[STOP_INDEX[activeStop.current]];
      camera.position.set(...stop.position);
      lookTarget.current.set(...stop.lookAt);
      camera.lookAt(lookTarget.current);
    }
  });

  return null;
}

function VillaModel() {
  const { scene } = useGLTF("/models/villa.glb");
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [cloned]);

  return <primitive object={cloned} />;
}

type SceneProps = {
  stopId: StopId;
  traveling: boolean;
  onArrived: () => void;
  onReady: () => void;
  onFatal: () => void;
};

function SceneContents({
  stopId,
  traveling,
  onArrived,
  onReady,
}: Omit<SceneProps, "onFatal">) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <>
      <color attach="background" args={["#b7b0a4"]} />
      <fog attach="fog" args={["#b7b0a4", 18, 40]} />
      <ambientLight intensity={0.7} color="#f5efe6" />
      <directionalLight
        position={[8, 12, -6]}
        intensity={1.35}
        color="#fff6ea"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 5, 7]} intensity={0.45} color="#d5e2de" />
      <hemisphereLight args={["#efe6d8", "#6f7a68", 0.55]} />
      <GuidedCamera
        stopId={stopId}
        traveling={traveling}
        onArrived={onArrived}
      />
      <VillaModel />
    </>
  );
}

export function VillaCanvas({
  stopId,
  traveling,
  onArrived,
  onReady,
  onFatal,
}: SceneProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (failed) onFatal();
  }, [failed, onFatal]);

  if (failed) return null;

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{
        fov: 42,
        near: 0.1,
        far: 80,
        position: STOPS[0].position,
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl, camera }) => {
        try {
          gl.setClearColor("#b7b0a4");
          camera.lookAt(...STOPS[0].lookAt);
        } catch {
          setFailed(true);
        }
      }}
      style={{ touchAction: "none" }}
    >
      <SceneContents
        stopId={stopId}
        traveling={traveling}
        onArrived={onArrived}
        onReady={onReady}
      />
    </Canvas>
  );
}

useGLTF.preload("/models/villa.glb");
