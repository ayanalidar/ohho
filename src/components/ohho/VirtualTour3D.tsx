"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Move3d, MapPin, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ----- Hotspot definitions (positions + camera target) -----
type Hotspot = {
  id: string;
  label: string;
  blurb: string;
  position: [number, number, number];
  camera: [number, number, number]; // camera position to teleport to
  target: [number, number, number]; // orbit target
  color: string;
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "counter",
    label: "Front Counter",
    blurb:
      "The customer-facing counter. POS, menu board, pickup window. Every cart ships with the same layout — operators learn it once, run any cart.",
    position: [0, 1.4, 2.6],
    camera: [0, 1.7, 4.2],
    target: [0, 1.4, 0],
    color: "#ff6a00",
  },
  {
    id: "grill",
    label: "Grill Station",
    blurb:
      "Commercial-grade flat-top + fryer. Engineered to fit 50–150 sq. ft. without choking throughput. The chicken cheese-burst patty is born here.",
    position: [-1.6, 1.4, 0.2],
    camera: [-2.6, 1.9, 2.0],
    target: [-1.2, 1.2, 0],
    color: "#ffc107",
  },
  {
    id: "sign",
    label: "Brand Sign",
    blurb:
      "OHHO BURGERS — Live Premium. Backlit, weather-proof, fabricated in-house by OHHO Food Ventures. The cart itself is a brand asset, not just a kitchen.",
    position: [0, 3.0, 0],
    camera: [0, 2.4, 5.5],
    target: [0, 2.6, 0],
    color: "#d92626",
  },
  {
    id: "storage",
    label: "Storage & Cold",
    blurb:
      "Under-counter refrigeration + dry storage. 8-hour autonomy between restocks. Sized for high-footfall locations — malls, stations, food courts, high-streets.",
    position: [1.6, 0.7, -1.4],
    camera: [3.4, 1.6, -1.6],
    target: [1.4, 0.8, -1.0],
    color: "#ff8c00",
  },
];

// ----- The food cart mesh (stylized low-poly built from primitives) -----
function FoodCart() {
  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#15100a" roughness={0.9} />
      </mesh>

      {/* Cart base body */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 1.4, 2.0]} />
        <meshStandardMaterial color="#1a1005" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Counter top */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[3.6, 0.1, 2.2]} />
        <meshStandardMaterial color="#ff6a00" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Front counter cut-out (pickup window) */}
      <mesh position={[0, 1.0, 1.01]}>
        <boxGeometry args={[1.8, 0.7, 0.02]} />
        <meshStandardMaterial
          color="#ffc107"
          emissive="#ff6a00"
          emissiveIntensity={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Pillars (4 corners) */}
      {[
        [-1.7, 1.0],
        [1.7, 1.0],
        [-1.7, -1.0],
        [1.7, -1.0],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 2.4, z]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 2.0, 12]} />
          <meshStandardMaterial color="#3a2a10" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Roof */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <boxGeometry args={[3.8, 0.15, 2.4]} />
        <meshStandardMaterial color="#ff6a00" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Roof under-trim */}
      <mesh position={[0, 3.28, 0]}>
        <boxGeometry args={[3.7, 0.08, 2.3]} />
        <meshStandardMaterial color="#ffc107" emissive="#ffc107" emissiveIntensity={0.4} />
      </mesh>

      {/* Brand sign — front face */}
      <mesh position={[0, 2.6, 1.21]}>
        <boxGeometry args={[2.4, 0.7, 0.06]} />
        <meshStandardMaterial
          color="#0e0a04"
          emissive="#ff6a00"
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* Side menu board (left side) */}
      <mesh position={[-1.71, 1.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1.6, 1.2, 0.04]} />
        <meshStandardMaterial color="#0e0a04" emissive="#ffc107" emissiveIntensity={0.35} />
      </mesh>

      {/* Grill — flat-top cylinder */}
      <mesh position={[-1.0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.18, 24]} />
        <meshStandardMaterial
          color="#ff8c00"
          emissive="#d92626"
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Fryer basket */}
      <mesh position={[-1.7, 1.55, 0]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.5]} />
        <meshStandardMaterial color="#2a1d0a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Steam effect — small spheres rising (animated via FogSteam component) */}
      <FogSteam position={[-1.0, 1.7, 0]} />

      {/* Storage — under-counter box on right */}
      <mesh position={[1.2, 0.55, -0.4]} castShadow>
        <boxGeometry args={[1.2, 1.1, 1.4]} />
        <meshStandardMaterial color="#2a1d0a" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Door handle */}
      <mesh position={[1.2, 0.55, -1.11]}>
        <boxGeometry args={[0.4, 0.04, 0.04]} />
        <meshStandardMaterial color="#ffc107" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Wheels (4) */}
      {[
        [-1.6, 0.05, 1.0],
        [1.6, 0.05, 1.0],
        [-1.6, 0.05, -1.0],
        [1.6, 0.05, -1.0],
      ].map(([x, y, z], i) => (
        <mesh key={`w${i}`} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
          <meshStandardMaterial color="#0e0a04" roughness={0.8} />
        </mesh>
      ))}

      {/* Burger model on the counter (decorative) */}
      <BurgerModel position={[0.5, 1.55, 0.6]} />
      {/* Shake cup */}
      <ShakeCup position={[1.4, 1.6, 0.8]} />
    </group>
  );
}

function BurgerModel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Top bun */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d4a04b" roughness={0.7} />
      </mesh>
      {/* Patty */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 16]} />
        <meshStandardMaterial color="#5a2a10" roughness={0.6} />
      </mesh>
      {/* Bottom bun */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.1, 16]} />
        <meshStandardMaterial color="#c98b3a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function ShakeCup({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Cup */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.4, 16]} />
        <meshStandardMaterial color="#f5e6cc" roughness={0.4} />
      </mesh>
      {/* Cream top */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#fff5d6" roughness={0.6} />
      </mesh>
    </group>
  );
}

function FogSteam({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.children.forEach((c, i) => {
      const phase = (t + i * 0.5) % 2;
      c.position.y = phase * 0.4;
      const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(0, 0.5 - phase * 0.25);
    });
  });
  return (
    <group ref={ref} position={position}>
      {[0, 0.5, 1].map((o, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial
            color="#f5e6cc"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ----- Hotspot marker -----
function HotspotMarker({
  hotspot,
  isActive,
  onTeleport,
}: {
  hotspot: Hotspot;
  isActive: boolean;
  onTeleport: (h: Hotspot) => void;
}) {
  return (
    <group position={hotspot.position}>
      {/* Outer pulsing ring */}
      <mesh>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color={hotspot.color} transparent opacity={0.18} />
      </mesh>
      {/* Inner dot */}
      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={hotspot.color} />
      </mesh>
      <Html center distanceFactor={6} zIndexRange={[100, 0]}>
        <button
          onClick={() => onTeleport(hotspot)}
          className={cn(
            "px-3 py-1.5 rounded-full whitespace-nowrap text-[11px] font-bold uppercase tracking-wider transition-all -translate-y-8 backdrop-blur-md border",
            isActive
              ? "bg-ohho-orange text-ohho-black border-ohho-gold shadow-lg shadow-ohho-orange/40 scale-110"
              : "bg-ohho-black/70 text-ohho-cream border-ohho-gold/40 hover:bg-ohho-orange/20 hover:border-ohho-gold"
          )}
          style={{ marginLeft: "-50%", marginTop: "-50%" }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle"
            style={{ background: hotspot.color }}
          />
          {hotspot.label}
        </button>
      </Html>
    </group>
  );
}

// ----- Camera rig that animates to hotspots -----
function CameraRig({
  target,
  controlsRef,
}: {
  target: { camera: [number, number, number]; target: [number, number, number] } | null;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const animating = useRef(false);

  useEffect(() => {
    if (!target) return;
    targetPos.current.set(...target.camera);
    targetLook.current.set(...target.target);
    animating.current = true;
  }, [target]);

  useFrame(() => {
    if (!animating.current) return;
    camera.position.lerp(targetPos.current, 0.08);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.08);
      controlsRef.current.update();
    }
    if (camera.position.distanceTo(targetPos.current) < 0.05) {
      animating.current = false;
    }
  });

  return null;
}

// ----- Scene contents -----
function Scene({
  activeHotspot,
  onTeleport,
}: {
  activeHotspot: Hotspot | null;
  onTeleport: (h: Hotspot) => void;
}) {
  const controlsRef = useRef<any>(null);
  const target =
    activeHotspot
      ? { camera: activeHotspot.camera, target: activeHotspot.target }
      : null;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 2, 3]} intensity={0.6} color="#ff6a00" />
      <pointLight position={[3, 2, -3]} intensity={0.4} color="#ffc107" />

      <FoodCart />

      {HOTSPOTS.map((h) => (
        <HotspotMarker
          key={h.id}
          hotspot={h}
          isActive={activeHotspot?.id === h.id}
          onTeleport={onTeleport}
        />
      ))}

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.6}
        scale={12}
        blur={2}
        far={6}
      />

      <Environment preset="sunset" />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={2.5}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        dampingFactor={0.08}
      />

      <CameraRig target={target} controlsRef={controlsRef} />
    </>
  );
}

// ----- Outer component with overlay UI -----
export function VirtualTour3D() {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const onTeleport = (h: Hotspot) => {
    setActiveHotspot(h);
    setInfoOpen(true);
  };

  return (
    <section
      id="tour"
      className="relative py-24 sm:py-32 bg-ohho-black grain overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-orange/10 border border-ohho-orange/30 text-ohho-orange text-xs font-semibold tracking-wider uppercase">
              <Move3d className="h-3.5 w-3.5" />
              Drag-to-Look 3D Virtual Tour
            </div>
            <h2 className="mt-5 font-display text-4xl sm:text-6xl text-ohho-cream leading-[0.95]">
              Step inside an <span className="text-gradient-ohho">OHHO cart.</span>
            </h2>
            <p className="mt-4 text-ohho-cream/75 text-lg leading-relaxed">
              Drag with your mouse or finger to look around. Click any glowing
              hotspot to teleport to that part of the cart — counter, grill,
              brand sign, or storage. Every cart is fabricated by OHHO Food
              Ventures and ships with this exact layout.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {HOTSPOTS.map((h) => (
              <button
                key={h.id}
                onClick={() => onTeleport(h)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold transition-all",
                  activeHotspot?.id === h.id
                    ? "bg-ohho-orange text-ohho-black border-ohho-gold"
                    : "bg-ohho-black/40 text-ohho-cream-dim border-ohho-gold/20 hover:border-ohho-gold/60 hover:text-ohho-gold"
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: h.color }}
                />
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="mt-10 relative rounded-2xl overflow-hidden border border-ohho-gold/20 bg-gradient-to-b from-[#1a1005] to-[#0a0703] h-[60vh] sm:h-[70vh]">
          <Canvas
            shadows
            camera={{ position: [0, 2, 5], fov: 50 }}
            gl={{ antialias: true }}
            className="tour-cursor-grab active:tour-cursor-grabbing"
          >
            <Suspense fallback={null}>
              <Scene activeHotspot={activeHotspot} onTeleport={onTeleport} />
            </Suspense>
          </Canvas>

          {/* Top-left overlay: drag hint */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-ohho-black/70 backdrop-blur text-ohho-cream text-[11px] uppercase tracking-wider flex items-center gap-2 border border-ohho-gold/20 pointer-events-none">
            <Move3d className="h-3.5 w-3.5 text-ohho-gold" />
            Drag to look · Scroll to zoom
          </div>

          {/* Hotspot count */}
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-ohho-black/70 backdrop-blur text-ohho-cream-dim text-[11px] uppercase tracking-wider border border-ohho-gold/20 pointer-events-none">
            {HOTSPOTS.length} teleport hotspots
          </div>

          {/* Active hotspot info card */}
          <AnimatePresence>
            {infoOpen && activeHotspot && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-md p-5 rounded-xl bg-ohho-black/85 backdrop-blur-xl border"
                style={{ borderColor: `${activeHotspot.color}55` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin
                      className="h-4 w-4"
                      style={{ color: activeHotspot.color }}
                    />
                    <div
                      className="font-display text-xl"
                      style={{ color: activeHotspot.color }}
                    >
                      {activeHotspot.label}
                    </div>
                  </div>
                  <button
                    onClick={() => setInfoOpen(false)}
                    aria-label="Close info"
                    className="h-7 w-7 grid place-items-center rounded-md text-ohho-cream-dim hover:text-ohho-cream hover:bg-ohho-orange/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-ohho-cream/80 leading-relaxed">
                  {activeHotspot.blurb}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-ohho-cream-dim">
                  <Info className="h-3 w-3" />
                  Click another hotspot to teleport
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Below-canvas hint row */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HOTSPOTS.map((h) => (
            <button
              key={h.id}
              onClick={() => onTeleport(h)}
              className="text-left p-3 rounded-lg glass-card glass-card-hover"
            >
              <div
                className="font-display text-lg"
                style={{ color: h.color }}
              >
                {h.label}
              </div>
              <div className="text-[11px] text-ohho-cream-dim mt-0.5 line-clamp-2">
                {h.blurb}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
