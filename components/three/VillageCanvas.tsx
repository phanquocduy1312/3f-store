"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Preload } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import { useInView } from "react-intersection-observer";

function VillageModel() {
  const { scene } = useGLTF("/assets/glb/village.glb");
  return <primitive object={scene} scale={2.35} position={[0, -1.55, 0]} rotation={[0, -0.38, 0]} />;
}

export function VillageCanvas() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (inView) {
      // Chỉ load khi scroll đến section này
      setTimeout(() => useGLTF.preload("/assets/glb/village.glb"), 1000);
    }
  }, [inView]);
  
  return (
    <div 
      ref={ref}
      className="relative h-[480px] w-full overflow-visible sm:h-[560px] lg:h-[660px]"
    >
      <div className="pointer-events-none absolute inset-x-[-8%] bottom-[4%] h-[42%] rounded-[50%] bg-[#F2E0AF]/70 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-[4%] bottom-[8%] h-[26%] rounded-[50%] bg-[#AFC9A5]/55 blur-xl" />
      <div className="pointer-events-none absolute left-1/2 top-[14%] h-[52%] w-[72%] -translate-x-1/2 rounded-full bg-white/28 blur-3xl" />
      {inView ? (
        <Canvas 
          className="relative z-10 cursor-grab active:cursor-grabbing"
          camera={{ position: [4.2, 3.15, 4.75], fov: 26 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true }}
          shadows={false}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1.25} />
            <directionalLight position={[5, 7, 4]} intensity={2.2} castShadow={false} />
            <VillageModel />
            <OrbitControls
              autoRotate
              autoRotateSpeed={0.45}
              target={[0, -0.8, 0]}
              enableZoom={false}
              enablePan={false}
              rotateSpeed={0.65}
              minPolarAngle={Math.PI / 3.2}
              maxPolarAngle={Math.PI / 2.05}
            />
            <Preload all />
          </Suspense>
        </Canvas>
      ) : (
        <div className="h-full flex items-center justify-center text-forest font-bold">
          🏘️
        </div>
      )}
    </div>
  );
}
