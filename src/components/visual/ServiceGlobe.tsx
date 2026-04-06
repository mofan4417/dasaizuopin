import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const GOLD = '#D4AF37';
const WINE = '#8B0000';
const DEEP = '#220406';

const serviceMarkers = [
  [39.9, 116.4],
  [31.2, 121.5],
  [23.1, 113.3],
  [30.6, 104.1],
  [29.5, 106.5],
  [34.3, 108.9],
  [25.0, 102.7],
  [36.1, 103.8],
  [43.8, 87.6],
  [26.6, 106.7],
  [28.2, 112.9],
  [22.8, 108.3],
] as const;

const chinaOutline = [
  [49.8, 87.4],
  [47.8, 82.5],
  [44.6, 79.6],
  [43.6, 87.6],
  [46.8, 96.2],
  [48.4, 106.6],
  [47.8, 118.0],
  [48.4, 126.5],
  [45.3, 131.1],
  [41.8, 123.4],
  [39.9, 121.7],
  [36.1, 120.4],
  [31.2, 121.5],
  [26.0, 119.3],
  [22.6, 114.1],
  [21.3, 110.3],
  [20.0, 109.6],
  [22.2, 108.3],
  [24.8, 102.8],
  [28.2, 97.0],
  [30.8, 90.6],
  [35.2, 78.3],
  [39.1, 76.0],
  [42.3, 78.5],
  [45.0, 82.2],
  [49.8, 87.4],
] as const;

const hainanOutline = [
  [20.2, 109.3],
  [19.6, 110.2],
  [18.6, 110.7],
  [18.1, 109.7],
  [18.5, 108.9],
  [19.4, 108.7],
  [20.2, 109.3],
] as const;

const taiwanOutline = [
  [25.2, 121.5],
  [24.1, 121.1],
  [23.0, 120.8],
  [22.0, 121.0],
  [22.5, 121.7],
  [23.7, 121.9],
  [24.8, 121.7],
  [25.2, 121.5],
] as const;

const connectionPairs = [
  [0, 1],
  [1, 2],
  [3, 1],
  [3, 2],
  [3, 8],
  [6, 2],
  [8, 4],
  [9, 3],
  [10, 4],
  [11, 2],
] as const;

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createArcCurve(start: THREE.Vector3, end: THREE.Vector3, height = 0.36) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const control = mid.normalize().multiplyScalar(1 + height);
  return new THREE.QuadraticBezierCurve3(start, control, end);
}

function ChinaGlowOutline() {
  const outlines = useMemo(
    () =>
      [chinaOutline, hainanOutline, taiwanOutline].map((outline) =>
        outline.map(([lat, lng]) => latLngToVector3(lat, lng, 1.036))
      ),
    []
  );

  return (
    <group>
      {outlines.map((points, index) => (
        <group key={`outline-${index}`}>
          <Line points={points} color={GOLD} lineWidth={2.8} transparent opacity={0.82} />
          <Line points={points} color="#fff4cf" lineWidth={1.1} transparent opacity={0.95} />
        </group>
      ))}
    </group>
  );
}

function FlightPaths({ markerPositions }: { markerPositions: THREE.Vector3[] }) {
  const movingLightsRef = useRef<THREE.Group>(null);

  const paths = useMemo(
    () =>
      connectionPairs.map(([startIndex, endIndex], index) => {
        const start = markerPositions[startIndex].clone();
        const end = markerPositions[endIndex].clone();
        const curve = createArcCurve(start, end, 0.28 + (index % 3) * 0.05);
        return {
          curve,
          points: curve.getPoints(60),
          offset: index * 0.09,
        };
      }),
    [markerPositions]
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (!movingLightsRef.current) return;

    movingLightsRef.current.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh;
      const path = paths[index];
      const progress = (t * 0.14 + path.offset) % 1;
      const point = path.curve.getPoint(progress);
      mesh.position.copy(point);
      const pulse = 0.8 + Math.sin(t * 6 + index) * 0.2;
      mesh.scale.setScalar(pulse);
    });
  });

  return (
    <group>
      {paths.map((path, index) => (
        <group key={`path-${index}`}>
          <Line points={path.points} color={GOLD} lineWidth={1.3} transparent opacity={0.44} />
          <Line points={path.points} color="#fff5d4" lineWidth={0.35} transparent opacity={0.9} />
        </group>
      ))}

      <group ref={movingLightsRef}>
        {paths.map((_, index) => (
          <mesh key={`moving-light-${index}`}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial color="#fff8e6" emissive={new THREE.Color(GOLD)} emissiveIntensity={2.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function ServiceGlobeMesh() {
  const rootRef = useRef<THREE.Group>(null);
  const globeRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const markersRef = useRef<THREE.Group>(null);

  const markerPositions = useMemo(
    () => serviceMarkers.map(([lat, lng]) => latLngToVector3(lat, lng, 1.03)),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const targetX = state.pointer.y * 0.28;
    const targetY = state.pointer.x * 0.4;

    if (rootRef.current) {
      rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetX, 0.06);
      rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetY, 0.06);
      rootRef.current.position.x = THREE.MathUtils.lerp(rootRef.current.position.x, state.pointer.x * 0.18, 0.04);
      rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, state.pointer.y * 0.14, 0.04);
    }

    if (globeRef.current) {
      globeRef.current.rotation.y = t * 0.28;
      globeRef.current.rotation.x = Math.sin(t * 0.35) * 0.08;
    }

    if (haloRef.current) {
      haloRef.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.03);
    }

    if (markersRef.current) {
      markersRef.current.children.forEach((child, index) => {
        const mesh = child as THREE.Mesh;
        const pulse = 0.82 + Math.sin(t * 2 + index * 0.45) * 0.18;
        mesh.scale.setScalar(pulse);
      });
    }
  });

  return (
    <group ref={rootRef} scale={0.84}>
      <Float speed={1.2} rotationIntensity={0.14} floatIntensity={0.18}>
        <group ref={globeRef}>
          <mesh>
            <sphereGeometry args={[1, 96, 96]} />
            <meshPhysicalMaterial
              color={WINE}
              roughness={0.45}
              metalness={0.35}
              clearcoat={0.85}
              clearcoatRoughness={0.35}
              emissive={new THREE.Color('#250409')}
              emissiveIntensity={0.9}
            />
          </mesh>

          <mesh rotation={[0.12, 0.3, 0]}>
            <sphereGeometry args={[1.018, 48, 48]} />
            <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.18} />
          </mesh>

          <ChinaGlowOutline />

          <group ref={markersRef}>
            {markerPositions.map((position, index) => (
              <group key={`${position.x}-${position.y}-${index}`} position={position}>
                <mesh>
                  <sphereGeometry args={[0.028, 16, 16]} />
                  <meshStandardMaterial
                    color={index % 2 === 0 ? GOLD : '#F7D879'}
                    emissive={new THREE.Color(GOLD)}
                    emissiveIntensity={1.6}
                  />
                </mesh>
                <mesh>
                  <sphereGeometry args={[0.048, 16, 16]} />
                  <meshBasicMaterial color={GOLD} transparent opacity={0.12} />
                </mesh>
              </group>
            ))}
          </group>

          <FlightPaths markerPositions={markerPositions} />

          <mesh rotation={[Math.PI / 3.2, 0, 0]}>
            <torusGeometry args={[1.28, 0.018, 24, 180]} />
            <meshStandardMaterial color={GOLD} emissive={new THREE.Color(GOLD)} emissiveIntensity={0.65} />
          </mesh>

          <mesh rotation={[Math.PI / 2.1, Math.PI / 6, 0]}>
            <torusGeometry args={[1.45, 0.01, 24, 180]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.22} />
          </mesh>
        </group>
      </Float>

      <mesh ref={haloRef}>
        <sphereGeometry args={[1.35, 48, 48]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

export default function ServiceGlobe() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 5.2], fov: 34 }} dpr={[1, 2]}>
        <color attach="background" args={[DEEP]} />
        <fog attach="fog" args={[DEEP, 4.5, 8.5]} />
        <ambientLight intensity={0.9} />
        <pointLight position={[2.6, 2.4, 2.8]} intensity={45} color={GOLD} />
        <pointLight position={[-2.5, -1.5, -2]} intensity={18} color="#7C1C26" />
        <directionalLight position={[0, 0, 4]} intensity={2.4} color="#fff4d1" />

        <Suspense fallback={null}>
          <Stars radius={14} depth={24} count={1200} factor={2.5} saturation={0} fade speed={0.4} />
          <ServiceGlobeMesh />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.55}
        />
      </Canvas>
    </div>
  );
}
