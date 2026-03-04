import { useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const BLANK_LENGTH = 5.0;
const BLANK_HALF = BLANK_LENGTH / 2;

// Reusable objects to avoid per-frame allocations
const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersection = new THREE.Vector3();

export function CuttingInteraction() {
  const { raycaster, pointer, camera } = useThree();
  const cursorRef = useRef<THREE.Mesh>(null);
  const guideRef = useRef<THREE.Mesh>(null);
  const isDragging = useRef(false);
  const lastCutT = useRef<number | null>(null);
  const cursorVisible = useRef(false);
  const cursorT = useRef(0.5);

  const spinning = useStore((s) => s.lathe.spinning);
  const cutProfile = useStore((s) => s.cutProfile);
  const activeTool = useStore((s) => s.activeTool);
  const tools = useStore((s) => s.tools);
  const profile = useStore((s) => s.blank.profile);

  // Project mouse position onto the blank's cylindrical surface.
  // The blank is centered at origin along the X-axis.
  const projectOntoBlank = useCallback((): number | null => {
    raycaster.setFromCamera(pointer, camera);

    const hit = raycaster.ray.intersectPlane(_plane, _intersection);
    if (!hit) return null;

    const x = _intersection.x;
    if (x < -BLANK_HALF || x > BLANK_HALF) return null;

    return (x + BLANK_HALF) / BLANK_LENGTH;
  }, [raycaster, pointer, camera]);

  const performCut = useCallback(
    (t: number) => {
      if (!spinning) return;

      if (lastCutT.current !== null && Math.abs(t - lastCutT.current) < 0.001) {
        return;
      }

      const tool = tools.find((tl) => tl.type === activeTool);
      if (!tool) return;

      cutProfile(t, tool.cutDepth * 0.5);
      lastCutT.current = t;
    },
    [spinning, cutProfile, activeTool, tools]
  );

  // Update cursor position via refs only — no React state updates in the render loop
  useFrame(() => {
    const t = projectOntoBlank();

    if (t !== null) {
      cursorVisible.current = true;
      cursorT.current = t;

      // Find radius at this position
      const closestPoint = profile.reduce((prev, curr) =>
        Math.abs(curr.t - t) < Math.abs(prev.t - t) ? curr : prev
      );

      const worldX = t * BLANK_LENGTH - BLANK_HALF;

      if (cursorRef.current) {
        cursorRef.current.position.set(worldX, closestPoint.radius + 0.02, 0);
        cursorRef.current.visible = true;
      }
      if (guideRef.current) {
        guideRef.current.position.set(worldX, 0, 0);
        guideRef.current.visible = true;
      }

      if (isDragging.current) {
        performCut(t);
      }
    } else {
      if (cursorRef.current) cursorRef.current.visible = false;
      if (guideRef.current) guideRef.current.visible = false;
      cursorVisible.current = false;
    }
  });

  // Access OrbitControls (registered via makeDefault) to disable during cuts
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;

  const handlePointerDown = useCallback(
    (e: { nativeEvent?: PointerEvent; stopPropagation?: () => void }) => {
      if (e.nativeEvent && e.nativeEvent.button !== 0) return;

      // Stop event from reaching OrbitControls
      e.stopPropagation?.();

      isDragging.current = true;
      lastCutT.current = null;
      if (controls) controls.enabled = false;

      const t = projectOntoBlank();
      if (t !== null) {
        performCut(t);
      }
    },
    [projectOntoBlank, performCut, controls]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    lastCutT.current = null;
    if (controls) controls.enabled = true;
  }, [controls]);

  const tool = tools.find((tl) => tl.type === activeTool);
  const cursorWidth = tool ? tool.cutWidth : 0.06;

  return (
    <group>
      {/* Invisible interaction plane that captures pointer events */}
      <mesh
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <planeGeometry args={[BLANK_LENGTH + 1, 2]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Tool cursor indicator */}
      <mesh ref={cursorRef} visible={false}>
        <boxGeometry args={[cursorWidth, 0.04, 0.04]} />
        <meshStandardMaterial
          color={spinning ? '#ff4444' : '#888888'}
          emissive={spinning ? '#ff2222' : '#444444'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Cutting guide ring */}
      <mesh ref={guideRef} visible={false}>
        <ringGeometry args={[0.005, 0.008, 32]} />
        <meshBasicMaterial
          color={spinning ? '#ff6666' : '#666666'}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
