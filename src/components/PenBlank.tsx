import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { WoodMaterial } from '../shaders/WoodMaterial';
import { ResinMaterial } from '../shaders/ResinMaterial';
import type { ProfilePoint } from '../types';

const BLANK_LENGTH = 5.0;
const LATHE_SEGMENTS = 64;
const VISUAL_SPIN_SCALE = 0.03;
const TWO_PI = Math.PI * 2;

function buildGeometry(profile: ProfilePoint[]): THREE.LatheGeometry {
  const points = profile.map(
    (p) => new THREE.Vector2(p.radius, p.t * BLANK_LENGTH - BLANK_LENGTH / 2)
  );
  const geo = new THREE.LatheGeometry(points, LATHE_SEGMENTS);

  // Custom UVs: U = circumference angle, V = position along length
  const posAttr = geo.getAttribute('position');
  const uvAttr = geo.getAttribute('uv');
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = posAttr.getY(i);
    const angle = Math.atan2(z, x);
    uvAttr.setXY(i, (angle + Math.PI) / TWO_PI, (y + BLANK_LENGTH / 2) / BLANK_LENGTH);
  }
  uvAttr.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function PenBlank() {
  const meshRef = useRef<THREE.Mesh>(null);
  const profile = useStore((s) => s.blank.profile);
  const spinning = useStore((s) => s.lathe.spinning);
  const speed = useStore((s) => s.lathe.speed);
  const material = useStore((s) => s.blank.material);
  const woodConfig = useStore((s) => s.blank.woodConfig);
  const resinConfig = useStore((s) => s.blank.resinConfig);

  // Rebuild geometry when profile changes, dispose old one to prevent GPU leak
  useEffect(() => {
    if (!meshRef.current) return;
    const newGeo = buildGeometry(profile);
    const oldGeo = meshRef.current.geometry;
    meshRef.current.geometry = newGeo;
    if (oldGeo) oldGeo.dispose();
    return () => {
      newGeo.dispose();
    };
  }, [profile]);

  useFrame((_, delta) => {
    if (meshRef.current && spinning) {
      const visualRPM = speed * VISUAL_SPIN_SCALE;
      const radiansPerSec = (visualRPM * TWO_PI) / 60;
      meshRef.current.rotation.y =
        (meshRef.current.rotation.y + radiansPerSec * delta) % TWO_PI;
    }
  });

  const renderMaterial = () => {
    if (material === 'wood' && woodConfig) {
      return <WoodMaterial config={woodConfig} />;
    }
    if (material === 'resin' && resinConfig) {
      return <ResinMaterial config={resinConfig} />;
    }
    return (
      <meshStandardMaterial color="#8B6914" roughness={0.4} metalness={0.05} />
    );
  };

  // Initial geometry — will be replaced by useEffect immediately
  const initialGeo = useRef(buildGeometry(profile));

  return (
    <group rotation={[0, 0, -Math.PI / 2]}>
      <mesh ref={meshRef} geometry={initialGeo.current}>
        {renderMaterial()}
      </mesh>
    </group>
  );
}
