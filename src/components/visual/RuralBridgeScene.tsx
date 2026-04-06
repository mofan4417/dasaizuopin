import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const GOLD = '#D4AF37';
const WINE = '#8B0000';
const DEEP = '#120304';
const ROSE = '#B24652';

const gradientVertexShader = `
  uniform float uTime;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vPosition = position;
    vNormal = normal;

    float waveA = sin(position.y * 5.5 + uTime * 1.2) * 0.08;
    float waveB = cos(position.x * 4.5 - uTime * 1.4) * 0.07;
    float waveC = sin((position.z + position.x) * 6.0 + uTime * 0.8) * 0.05;

    vec3 displaced = position + normal * (waveA + waveB + waveC);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const gradientFragmentShader = `
  uniform float uTime;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vec3 colorA = vec3(0.83, 0.68, 0.22);
    vec3 colorB = vec3(0.74, 0.23, 0.38);
    vec3 colorC = vec3(1.0, 0.93, 0.78);

    float verticalMix = smoothstep(-1.2, 1.2, vPosition.y);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.4 + vPosition.y * 4.0);
    float swirl = 0.5 + 0.5 * sin((vPosition.x + vPosition.z) * 5.0 - uTime * 1.1);

    vec3 base = mix(colorA, colorB, verticalMix);
    base = mix(base, colorC, pulse * 0.35);
    base += swirl * 0.08;

    vec3 viewNormal = normalize(normalMatrix * vNormal);
    float fresnel = pow(1.0 - abs(viewNormal.z), 2.6);
    vec3 finalColor = base + fresnel * vec3(0.9, 0.55, 0.32);

    gl_FragColor = vec4(finalColor, 0.94);
  }
`;

const bridgeVertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normal;
    vec3 transformed = position;
    transformed.y += sin(uv.x * 10.0 + uTime * 1.8) * 0.015;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const bridgeFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 colorA = vec3(0.82, 0.67, 0.18);
    vec3 colorB = vec3(0.69, 0.18, 0.24);
    vec3 colorC = vec3(1.0, 0.95, 0.82);

    float flow = 0.5 + 0.5 * sin(vUv.x * 14.0 - uTime * 2.1);
    float edge = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);

    vec3 base = mix(colorA, colorB, vUv.x);
    base = mix(base, colorC, flow * 0.26);
    base += edge * 0.15;

    gl_FragColor = vec4(base, 0.96);
  }
`;

function VillageLight({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#fff2c7" emissive={new THREE.Color(GOLD)} emissiveIntensity={2.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.11} />
      </mesh>
    </group>
  );
}

function House({ position, rotation = 0, school = false }: { position: [number, number, number]; rotation?: number; school?: boolean }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={school ? [0.34, 0.22, 0.2] : [0.22, 0.16, 0.18]} />
        <meshStandardMaterial color={school ? '#5A252A' : '#412024'} roughness={0.92} />
      </mesh>
      <mesh position={[0, school ? 0.27 : 0.22, 0]}>
        <coneGeometry args={school ? [0.24, 0.14, 4] : [0.16, 0.12, 4]} />
        <meshStandardMaterial color={school ? '#D4AF37' : '#72373C'} roughness={0.78} metalness={0.1} />
      </mesh>
      {school ? (
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.03, 0.16, 0.03]} />
          <meshStandardMaterial color="#c9b7b9" />
        </mesh>
      ) : null}
    </group>
  );
}

function Terrain() {
  return (
    <group>
      <mesh position={[-2.25, -1.55, 1.55]} rotation={[0.08, 0.18, -0.12]}>
        <coneGeometry args={[1.7, 3, 7]} />
        <meshStandardMaterial color="#220809" roughness={0.98} metalness={0.02} />
      </mesh>
      <mesh position={[-0.55, -1.95, 0.42]} rotation={[0.04, -0.1, 0.03]}>
        <coneGeometry args={[2.35, 3.5, 8]} />
        <meshStandardMaterial color="#311012" roughness={0.96} metalness={0.03} />
      </mesh>
      <mesh position={[1.8, -1.65, -1.25]} rotation={[-0.04, 0.24, 0.09]}>
        <coneGeometry args={[1.82, 3.05, 7]} />
        <meshStandardMaterial color="#1B0608" roughness={0.98} metalness={0.01} />
      </mesh>
      <mesh position={[0.4, -2.25, -0.12]} rotation={[-Math.PI / 2, 0.18, 0]}>
        <circleGeometry args={[4.6, 80]} />
        <meshStandardMaterial color="#160506" roughness={1} />
      </mesh>
    </group>
  );
}

function BridgeArchitecture() {
  const leftAnchor = new THREE.Vector3(-2.65, -1.05, 1.45);
  const rightAnchor = new THREE.Vector3(2.82, -1.02, -1.72);

  const deckCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        leftAnchor.clone(),
        new THREE.Vector3(-1.2, -0.58, 0.66),
        new THREE.Vector3(0.28, -0.56, -0.16),
        new THREE.Vector3(1.22, -0.6, -0.7),
        rightAnchor.clone(),
      ]),
    []
  );

  const topCableCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        leftAnchor.clone(),
        new THREE.Vector3(-1.55, 0.62, 0.84),
        new THREE.Vector3(0.18, 0.88, -0.18),
        new THREE.Vector3(1.58, 0.7, -1.04),
        rightAnchor.clone(),
      ]),
    []
  );

  const deckPoints = useMemo(() => deckCurve.getPoints(120), [deckCurve]);
  const topCablePoints = useMemo(() => topCableCurve.getPoints(120), [topCableCurve]);

  const deckTube = useMemo(() => new THREE.TubeGeometry(deckCurve, 140, 0.08, 18, false), [deckCurve]);
  const deckShell = useMemo(() => new THREE.TubeGeometry(deckCurve, 140, 0.11, 18, false), [deckCurve]);
  const bridgeMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const flowRef = useRef<THREE.Group>(null);

  const hangerPairs = useMemo(
    () => [
      { deck: new THREE.Vector3(-1.12, -0.59, 0.62), cable: new THREE.Vector3(-1.05, 0.32, 0.58) },
      { deck: new THREE.Vector3(-0.42, -0.57, 0.24), cable: new THREE.Vector3(-0.32, 0.56, 0.18) },
      { deck: new THREE.Vector3(0.25, -0.56, -0.12), cable: new THREE.Vector3(0.28, 0.75, -0.14) },
      { deck: new THREE.Vector3(0.92, -0.58, -0.52), cable: new THREE.Vector3(0.98, 0.62, -0.56) },
      { deck: new THREE.Vector3(1.52, -0.63, -0.9), cable: new THREE.Vector3(1.62, 0.28, -0.94) },
    ],
    []
  );

  const bridgeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (bridgeMaterialRef.current) {
      bridgeMaterialRef.current.uniforms.uTime.value = t;
    }

    if (flowRef.current) {
      flowRef.current.children.forEach((child, index) => {
        const mesh = child as THREE.Mesh;
        const progress = (t * 0.16 + index * 0.25) % 1;
        mesh.position.copy(deckCurve.getPoint(progress));
      });
    }
  });

  return (
    <group>
      <mesh position={[-1.75, 0.04, 0.95]}>
        <boxGeometry args={[0.18, 1.08, 0.2]} />
        <meshStandardMaterial color="#5B1E25" emissive={new THREE.Color(WINE)} emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[1.95, 0.06, -1.18]}>
        <boxGeometry args={[0.18, 1.12, 0.2]} />
        <meshStandardMaterial color="#5B1E25" emissive={new THREE.Color(WINE)} emissiveIntensity={0.22} />
      </mesh>

      <mesh position={[-1.75, 0.72, 0.95]}>
        <boxGeometry args={[0.3, 0.1, 0.24]} />
        <meshStandardMaterial color="#E5D29A" emissive={new THREE.Color(GOLD)} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[1.95, 0.76, -1.18]}>
        <boxGeometry args={[0.3, 0.1, 0.24]} />
        <meshStandardMaterial color="#E5D29A" emissive={new THREE.Color(GOLD)} emissiveIntensity={0.9} />
      </mesh>

      <mesh geometry={deckTube}>
        <shaderMaterial ref={bridgeMaterialRef} vertexShader={bridgeVertexShader} fragmentShader={bridgeFragmentShader} uniforms={bridgeUniforms} transparent />
      </mesh>

      <mesh geometry={deckShell}>
        <meshPhysicalMaterial
          color="#fff0be"
          roughness={0.08}
          metalness={0.04}
          transmission={0.78}
          thickness={0.9}
          transparent
          opacity={0.16}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      <Line points={deckPoints} color="#fff8db" lineWidth={1.1} transparent opacity={0.85} />
      <Line points={topCablePoints} color="#f3e6bb" lineWidth={2.2} transparent opacity={0.85} />

      {hangerPairs.map((pair, index) => (
        <Line
          key={`hanger-${index}`}
          points={[pair.deck, pair.cable]}
          color={index % 2 === 0 ? '#f6e8c2' : ROSE}
          lineWidth={1.25}
          transparent
          opacity={0.74}
        />
      ))}

      <group ref={flowRef}>
        {[0, 1, 2].map((index) => (
          <mesh key={`bridge-flow-${index}`}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial color="#fff8df" emissive={new THREE.Color(GOLD)} emissiveIntensity={2.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function RuralBuildings() {
  return (
    <group>
      <House position={[-2.45, -1.08, 1.28]} rotation={0.3} />
      <House position={[-2.02, -0.97, 1.02]} rotation={-0.2} />
      <House position={[-1.52, -0.87, 0.72]} rotation={0.12} school />
      <House position={[-0.82, -0.78, 0.34]} rotation={-0.18} />
      <House position={[-0.18, -0.72, -0.02]} rotation={0.08} />
      <House position={[0.58, -0.77, -0.4]} rotation={-0.1} />
      <House position={[1.28, -0.86, -0.82]} rotation={0.18} />
      <House position={[1.96, -0.98, -1.2]} rotation={-0.14} school />
      <House position={[2.45, -1.08, -1.55]} rotation={0.26} />

      <VillageLight position={[-2.28, -0.94, 1.18]} scale={1.05} />
      <VillageLight position={[-1.62, -0.82, 0.68]} />
      <VillageLight position={[-0.2, -0.66, 0.02]} scale={0.9} />
      <VillageLight position={[1.34, -0.82, -0.78]} />
      <VillageLight position={[2.28, -1.0, -1.46]} scale={1.05} />
    </group>
  );
}

function MistBands() {
  const bandRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!bandRef.current) return;
    bandRef.current.children.forEach((child, index) => {
      child.position.x = Math.sin(t * 0.14 + index * 0.8) * 0.28;
      child.position.y = -1.15 + Math.cos(t * 0.11 + index * 0.5) * 0.04;
    });
  });

  return (
    <group ref={bandRef}>
      {[
        { pos: [0, -1.15, -0.1], scale: [6.8, 1.6, 1] },
        { pos: [0.6, -0.95, -0.9], scale: [4.6, 1.1, 1] },
        { pos: [-0.8, -1.02, 0.8], scale: [4.9, 1.15, 1] },
      ].map((item, index) => (
        <mesh key={`mist-${index}`} position={item.pos as [number, number, number]} scale={item.scale as [number, number, number]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#f6dfb5" transparent opacity={0.09} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function VolumeLight() {
  return (
    <group>
      <mesh position={[0.45, 0.9, -0.15]} rotation={[-0.2, 0.1, 0]}>
        <coneGeometry args={[0.95, 2.8, 24, 1, true]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.09} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0.42, 0.32, -0.12]}>
        <sphereGeometry args={[0.24, 20, 20]} />
        <meshStandardMaterial color="#fff8dd" emissive={new THREE.Color(GOLD)} emissiveIntensity={2.1} roughness={0.18} metalness={0.4} />
      </mesh>
      <mesh position={[0.42, 0.32, -0.12]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

function MorphingGradientCore() {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = t;
    }

    if (shellRef.current) {
      shellRef.current.rotation.x = t * 0.15;
      shellRef.current.rotation.y = t * 0.22;
      const pulse = 1.06 + Math.sin(t * 1.8) * 0.03;
      shellRef.current.scale.setScalar(pulse);
    }

    if (glassRef.current) {
      glassRef.current.rotation.x = -t * 0.08;
      glassRef.current.rotation.y = t * 0.13;
      const breathe = 1.15 + Math.sin(t * 1.2) * 0.025;
      glassRef.current.scale.setScalar(breathe);
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.y = t * 0.32;
      orbitRef.current.rotation.z = Math.sin(t * 0.8) * 0.22;
    }
  });

  return (
    <group position={[0.48, 0.42, -0.14]}>
      <mesh>
        <icosahedronGeometry args={[0.42, 18]} />
        <shaderMaterial ref={shaderRef} vertexShader={gradientVertexShader} fragmentShader={gradientFragmentShader} uniforms={uniforms} transparent />
      </mesh>

      <mesh ref={shellRef}>
        <icosahedronGeometry args={[0.58, 8]} />
        <meshPhysicalMaterial
          color="#f6cf72"
          roughness={0.1}
          metalness={0.12}
          transmission={0.62}
          thickness={0.8}
          transparent
          opacity={0.18}
          emissive={new THREE.Color('#a02f48')}
          emissiveIntensity={0.55}
        />
      </mesh>

      <mesh ref={glassRef}>
        <icosahedronGeometry args={[0.76, 8]} />
        <meshPhysicalMaterial
          color="#fff2d2"
          roughness={0.02}
          metalness={0.02}
          transmission={1}
          ior={1.45}
          thickness={1.2}
          clearcoat={1}
          clearcoatRoughness={0}
          transparent
          opacity={0.14}
        />
      </mesh>

      <group ref={orbitRef}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.82, 0.028, 20, 160]} />
          <meshStandardMaterial color="#f3df9b" emissive={new THREE.Color(GOLD)} emissiveIntensity={1.25} />
        </mesh>
        <mesh rotation={[Math.PI / 3.2, Math.PI / 5, 0]}>
          <torusGeometry args={[1.02, 0.012, 20, 160]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      </group>

      <mesh>
        <sphereGeometry args={[1.22, 28, 28]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

function FloatingLinks() {
  const links = useMemo(
    () => [
      [[-2.12, -0.92, 1.08], [-1.55, -0.26, 0.78], [-1.02, 0.18, 0.55]],
      [[-0.18, -0.7, -0.02], [0.22, -0.05, -0.08], [0.75, 0.18, -0.4]],
      [[1.4, -0.84, -0.85], [1.82, -0.14, -1.02], [2.24, 0.16, -1.36]],
    ].map((path) => path.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    []
  );

  return (
    <group>
      {links.map((points, index) => (
        <Line key={`floating-link-${index}`} points={points} color={ROSE} lineWidth={1.2} transparent opacity={0.34} />
      ))}
    </group>
  );
}

function CinematicCamera() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const baseX = Math.sin(t * 0.16) * 0.22;
    const baseY = 0.55 + Math.cos(t * 0.22) * 0.12;
    const baseZ = 6.5 + Math.sin(t * 0.13) * 0.28;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, baseX + state.pointer.x * 0.16, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, baseY + state.pointer.y * 0.08, 0.035);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ, 0.03);
    camera.lookAt(0.2, -0.15, -0.2);
  });

  return null;
}

function HomeHeroModel() {
  const rootRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const targetX = state.pointer.y * 0.18;
    const targetY = state.pointer.x * 0.26;
    if (!rootRef.current) return;
    rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetX, 0.05);
    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetY - 0.42, 0.05);
    rootRef.current.position.x = THREE.MathUtils.lerp(rootRef.current.position.x, state.pointer.x * 0.24, 0.03);
    rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, state.pointer.y * 0.16, 0.03);
  });

  return (
    <group ref={rootRef}>
      <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.18}>
        <Terrain />
        <MistBands />
        <BridgeArchitecture />
        <RuralBuildings />
        <FloatingLinks />
        <VolumeLight />
        <MorphingGradientCore />
      </Float>
    </group>
  );
}

export default function RuralBridgeScene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0.55, 6.5], fov: 34 }} dpr={[1, 2]}>
        <color attach="background" args={[DEEP]} />
        <fog attach="fog" args={[DEEP, 5, 12]} />
        <ambientLight intensity={1.05} />
        <directionalLight position={[3.5, 5.2, 2.2]} intensity={2.7} color="#fff1c2" />
        <pointLight position={[-3.2, 1.6, 2.5]} intensity={26} color={GOLD} />
        <pointLight position={[2.8, 0.6, -0.8]} intensity={15} color={WINE} />

        <Suspense fallback={null}>
          <Stars radius={18} depth={28} count={1600} factor={2.7} saturation={0} fade speed={0.42} />
          <CinematicCamera />
          <HomeHeroModel />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.14}
          minPolarAngle={Math.PI / 2.4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}
