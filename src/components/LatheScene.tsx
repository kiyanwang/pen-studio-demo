import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { PenBlank } from './PenBlank';
import { LatheModel } from './LatheModel';
import { CuttingInteraction } from './CuttingInteraction';

function SceneContents() {
  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.1}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.1}
      />

      {/* Lighting setup: key + fill + rim + ambient */}
      <ambientLight intensity={0.3} />
      {/* Key light - main directional from upper right */}
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-near={0.5}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      {/* Fill light - softer from the left */}
      <directionalLight position={[-4, 3, 2]} intensity={0.4} />
      {/* Rim / back light */}
      <directionalLight position={[0, 2, -5]} intensity={0.6} />
      {/* Subtle point light near the work area for warmth */}
      <pointLight position={[0, 2, 2]} intensity={0.3} color="#fff5e0" />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* Scene contents */}
      <PenBlank />
      <LatheModel />
      <CuttingInteraction />

      {/* Ground plane / shadow catcher */}
      <ContactShadows
        position={[0, -0.75, 0]}
        opacity={0.4}
        scale={12}
        blur={2.5}
        far={4}
      />
      <mesh
        position={[0, -0.76, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  );
}

// Stable references — prevent Canvas from recreating the WebGL renderer on re-render
const cameraConfig = { position: [0, 3, 6] as [number, number, number], fov: 45, near: 0.1, far: 100 };
const glConfig = { antialias: true, toneMapping: 3 }; // ACESFilmic = 3
const canvasStyle = { width: '100%', height: '100%' };

export function LatheScene() {
  return (
    <Canvas camera={cameraConfig} shadows style={canvasStyle} gl={glConfig}>
      <SceneContents />
    </Canvas>
  );
}
