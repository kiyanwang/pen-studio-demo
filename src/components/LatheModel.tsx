import * as THREE from 'three';

const DARK_METAL = '#2a2a2a';
const LIGHT_METAL = '#555555';
const BLANK_LENGTH = 5.0;

/** Static lathe machine geometry: bed, headstock, tailstock, tool rest */
export function LatheModel() {
  return (
    <group>
      {/* Lathe bed / rails */}
      <LatheBed />
      {/* Headstock (left side, drives the blank) */}
      <Headstock />
      {/* Tailstock (right side, supports the blank) */}
      <Tailstock />
      {/* Tool rest (in front of the blank) */}
      <ToolRest />
    </group>
  );
}

function LatheBed() {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Main bed */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[8, 0.3, 1.8]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.6} metalness={0.7} />
      </mesh>
      {/* Rails */}
      <Rail position={[0, 0.2, 0.55]} />
      <Rail position={[0, 0.2, -0.55]} />
    </group>
  );
}

function Rail({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[8, 0.1, 0.15]} />
      <meshStandardMaterial color={LIGHT_METAL} roughness={0.3} metalness={0.8} />
    </mesh>
  );
}

function Headstock() {
  const x = -BLANK_LENGTH / 2 - 0.6;
  return (
    <group position={[x, 0, 0]}>
      {/* Main body */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.0, 1.2, 1.4]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Spindle face plate */}
      <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 32]} />
        <meshStandardMaterial color={LIGHT_METAL} roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Drive center point */}
      <mesh position={[0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.2, 16]} />
        <meshStandardMaterial color={LIGHT_METAL} roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
}

function Tailstock() {
  const x = BLANK_LENGTH / 2 + 0.6;
  return (
    <group position={[x, 0, 0]}>
      {/* Main body */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.8, 1.0, 1.2]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Live center */}
      <mesh position={[-0.45, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.25, 16]} />
        <meshStandardMaterial color={LIGHT_METAL} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Quill / barrel */}
      <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
        <meshStandardMaterial color={LIGHT_METAL} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Handwheel */}
      <mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.03, 8, 24]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
}

function ToolRest() {
  return (
    <group position={[0, -0.15, 1.0]}>
      {/* Post */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 12]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Rest bar */}
      <mesh position={[0, 0.07, -0.1]}>
        <boxGeometry args={[4.5, 0.08, 0.12]} />
        <meshStandardMaterial color={LIGHT_METAL} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Clamp */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.25]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.5} metalness={0.7} />
      </mesh>
    </group>
  );
}

// Suppress unused import warning - THREE is used for type context in JSX
void THREE;
