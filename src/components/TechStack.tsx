import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Decal } from "@react-three/drei";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";

const textureLoader = new THREE.TextureLoader();
const imageUrls = [
  "/images/ml/numpy_proper.png",
  "/images/ml/pandas_proper.png",
  "/images/ml/sklearn_proper.svg",
  "/images/ml/tensorflow_proper.png",
  "/images/ml/keras_proper.png",
  "/images/ml/pytorch_proper.png",
  "/images/ml/rag_proper.png",
  "/images/ml/nlp_proper.png",
  "/images/ml/llm_proper.png",
  "/images/ml/genai_proper.png",
];
const textures = imageUrls.map((url) => {
  const tex = textureLoader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
});

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

const spheres = [...Array(20)].map(() => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  texture: THREE.Texture;
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  texture,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive) return;
    delta = Math.min(0.1, delta);
    const impulse = vec
      .copy(api.current!.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale
        )
      );

    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        rotation={[0.3, 1, 1]}
      >
        <meshStandardMaterial
          color="#ffffff"
          polygonOffset
          polygonOffsetFactor={-5}
          flatShading
          roughness={0.3}
          metalness={0.2}
        />
        <Decal
          position={[0, 0, 1]}
          rotation={[0, 0, 0]}
          scale={1.2}
          map={texture}
        />
      </mesh>
    </RigidBody>
  );
}

type PointerProps = {
  vec?: THREE.Vector3;
  isActive: boolean;
};

function Pointer({ vec = new THREE.Vector3(), isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const techStackElem = document.querySelector(".techstack");
    let observer: IntersectionObserver | null = null;
    if (techStackElem) {
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsActive(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      observer.observe(techStackElem);
    }
    
    return () => {
      if (observer) observer.disconnect();
    };
  }, []);
  return (
    <div className="techstack">
      <h2> My Techstack</h2>

      <Canvas
        frameloop={isActive ? "always" : "never"}
        shadows
        dpr={[1, 1.5]}
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.0)}
        className="tech-canvas"
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        <Physics gravity={[0, 0, 0]} paused={!isActive}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              texture={textures[Math.floor(Math.random() * textures.length)]}
              isActive={isActive}
            />
          ))}
        </Physics>
        <Environment
          files="/models/char_enviorment.hdr"
          environmentIntensity={0.5}
          environmentRotation={[0, 4, 2]}
        />
      </Canvas>
    </div>
  );
};

export default TechStack;
