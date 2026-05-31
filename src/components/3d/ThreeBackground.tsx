'use client';

import { Canvas } from '@react-three/fiber';
import { Stars, Float, Text3D, Center } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function FloatingCubes() {
  const cubes = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 5,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI * 2,
      scale: Math.random() * 0.5 + 0.1,
      color: ['#00d4ff', '#7b2ff7', '#00ff88', '#ff2d79'][Math.floor(Math.random() * 4)],
    })), []
  );

  return (
    <div>
      {cubes.map((cube, i) => (
        <Float key={i} speed={0.5 + Math.random() * 0.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={cube.position} rotation={[cube.rotation, cube.rotation, cube.rotation]}>
            <boxGeometry args={[cube.scale, cube.scale, cube.scale]} />
            <meshStandardMaterial
              color={cube.color}
              transparent
              opacity={0.15}
              wireframe
            />
          </mesh>
        </Float>
      ))}
    </div>
  );
}

function WireframeSphere() {
  return (
    <Float speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh position={[0, 0, -3]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#7b2ff7" wireframe transparent opacity={0.08} />
      </mesh>
    </Float>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#00d4ff" />
        <Stars radius={50} depth={50} count={500} factor={3} saturation={0} fade speed={1} />
        <FloatingCubes />
        <WireframeSphere />
      </Canvas>
    </div>
  );
}
