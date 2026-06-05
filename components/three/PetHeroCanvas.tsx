"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Setup Draco decoder LOCALLY (faster than CDN)
if (typeof window !== 'undefined') {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  dracoLoader.preload();
}

function Models() {
  const dog = useGLTF("/assets/glb/dog.glb");
  const cat = useGLTF("/assets/glb/cat.glb");
  
  return (
    <>
      <primitive object={dog.scene} scale={1.72} position={[-1.16, -1.12, 0]} rotation={[0, 0.08, 0]} />
      <primitive object={cat.scene} scale={1.32} position={[1.16, -1.12, 0]} rotation={[0, -0.08, 0]} />
    </>
  );
}

export function PetHeroCanvas() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (inView) {
      // Chỉ preload khi component vào viewport
      useGLTF.preload("/assets/glb/dog.glb");
      setTimeout(() => useGLTF.preload("/assets/glb/cat.glb"), 500);
    }
  }, [inView]);
  
  return (
    <div 
      ref={ref}
      className="relative h-[420px] w-full overflow-visible sm:h-[520px] lg:h-[610px]"
    >
      <div className="pointer-events-none absolute -inset-x-10 bottom-0 top-4 rounded-[999px] bg-[#DCEFE5]/70 blur-3xl" />
      <div className="pointer-events-none absolute bottom-6 left-1/2 h-[34%] w-[82%] -translate-x-1/2 rounded-[50%] bg-[#B7D2A8]/75 blur-sm" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[22%] w-[58%] -translate-x-1/2 rounded-[50%] bg-[#F4E6BC]/70 blur-xl" />
      {inView ? (
        <Canvas 
          className="relative z-10 cursor-grab active:cursor-grabbing"
          camera={{ position: [0, 0.05, 6.45], fov: 48 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true }}
          shadows={false}
          performance={{ min: 0.5 }}
        >
          <ambientLight intensity={1.25} />
          <directionalLight position={[5, 6, 5]} intensity={2.15} castShadow={false} />
          <directionalLight position={[-4, 2, 3]} intensity={0.55} castShadow={false} />
          <Suspense fallback={null}>
            <Models />
            <OrbitControls
              target={[0, -0.55, 0]}
              enablePan={false}
              enableZoom={false}
              enableRotate
              rotateSpeed={0.65}
              minPolarAngle={Math.PI / 2.6}
              maxPolarAngle={Math.PI / 2}
            />
            <Preload all />
          </Suspense>
        </Canvas>
      ) : (
        <div className="h-full flex items-center justify-center text-forest font-bold">
          🐕 🐱
        </div>
      )}
    </div>
  );
}
