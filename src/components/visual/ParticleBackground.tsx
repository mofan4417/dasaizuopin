import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const THEME = {
  bg: '#0A0505',
  primary: '#8B0000',
  secondary: '#722F37',
  accent: '#D4AF37',
} as const;

const resolveParticleCount = () => {
  if (typeof window === 'undefined') return 2800;
  const hc = typeof navigator !== 'undefined' ? Number((navigator as any).hardwareConcurrency) : NaN;
  const dm = typeof navigator !== 'undefined' ? Number((navigator as any).deviceMemory) : NaN;
  if (Number.isFinite(dm) && dm > 0 && dm <= 4) return 1800;
  if (Number.isFinite(hc) && hc > 0 && hc <= 4) return 2000;
  return 3200;
};

const Particles = ({ count }: { count: number }) => {
  const points = useRef<THREE.Points>(null!);
  const { mouse, viewport } = useThree();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      particle.mx += (mouse.x * viewport.width - particle.mx) * 0.01;
      particle.my += (mouse.y * viewport.height - particle.my) * 0.01;
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      
      const pos = points.current.geometry.attributes.position;
      pos.setXYZ(i, dummy.position.x / 15, dummy.position.y / 15, dummy.position.z / 15);
    });
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y += 0.001;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={new Float32Array(count * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={THEME.primary}
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const ParticleBackground = () => {
  const reducedMotion = (() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  })();

  const particleCount = useMemo(() => resolveParticleCount(), []);

  return (
    <div className="fixed inset-0 z-0 bg-[#0A0505]">
      {/* 4K Gradient Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(139,0,0,0.18)_0%,_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(212,175,55,0.10)_0%,_transparent_45%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0505]/40 to-[#0A0505]" />
      
      {!reducedMotion && (
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Particles count={particleCount} />
            <fog attach="fog" args={[THEME.bg, 0, 10]} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};

export default ParticleBackground;
