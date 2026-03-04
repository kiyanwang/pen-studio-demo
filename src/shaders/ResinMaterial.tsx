import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ResinConfig } from '../types/index.ts';

interface ResinMaterialProps {
  config: ResinConfig;
}

export function ResinMaterial({ config }: ResinMaterialProps) {
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const timeRef = useRef(0);

  // Update shimmer normal map perturbation over time
  useFrame((_state, delta) => {
    if (matRef.current && config.shimmer) {
      timeRef.current += delta;
      // Subtle normal perturbation via rotation of normalScale
      const shimmerAmount = Math.sin(timeRef.current * 2.0) * 0.1 + 0.9;
      matRef.current.normalScale.set(shimmerAmount, shimmerAmount);
    }
  });

  // Update material properties when config changes
  const prevConfig = useRef(config);
  if (prevConfig.current !== config && matRef.current) {
    prevConfig.current = config;
    matRef.current.color.setRGB(...config.color);
    matRef.current.opacity = config.opacity;
  }

  return (
    <meshPhysicalMaterial
      ref={matRef}
      color={new THREE.Color(...config.color)}
      transparent={true}
      opacity={config.opacity}
      transmission={0.6}
      thickness={2.0}
      roughness={0.1}
      metalness={0.0}
      ior={1.5}
      envMapIntensity={1.0}
      clearcoat={1.0}
      clearcoatRoughness={0.05}
      side={THREE.DoubleSide}
      // Shimmer via specular tint when enabled
      specularColor={
        config.shimmer
          ? new THREE.Color(...config.shimmerColor)
          : new THREE.Color(1, 1, 1)
      }
      specularIntensity={config.shimmer ? 1.5 : 0.5}
      sheen={config.shimmer ? 1.0 : 0.0}
      sheenRoughness={config.shimmer ? 0.3 : 0.0}
      sheenColor={
        config.shimmer
          ? new THREE.Color(...config.shimmerColor).multiplyScalar(0.5)
          : new THREE.Color(0, 0, 0)
      }
    />
  );
}

export default ResinMaterial;
