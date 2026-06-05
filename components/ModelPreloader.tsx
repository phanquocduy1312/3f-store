"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

/**
 * Preload 3D models progressively based on page interaction
 * This reduces initial load time while ensuring models are ready when needed
 */
export function ModelPreloader() {
  useEffect(() => {
    // Preload high-priority models after initial page load
    const preloadHighPriority = () => {
      // Cat and Dog for hero section
      useGLTF.preload("/assets/glb/cat.glb");
      useGLTF.preload("/assets/glb/dog.glb");
    };

    // Preload low-priority models after a delay
    const preloadLowPriority = () => {
      // Village model loads later since it's below the fold
      setTimeout(() => {
        useGLTF.preload("/assets/glb/village.glb");
      }, 2000);
    };

    // Wait for page to be interactive before preloading
    if (document.readyState === "complete") {
      preloadHighPriority();
      preloadLowPriority();
    } else {
      window.addEventListener("load", () => {
        preloadHighPriority();
        preloadLowPriority();
      });
    }

    // Also preload on user interaction (mouse movement, scroll, etc.)
    const handleInteraction = () => {
      preloadHighPriority();
      preloadLowPriority();
      // Remove listeners after first interaction
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    window.addEventListener("mousemove", handleInteraction, { once: true });
    window.addEventListener("scroll", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  return null; // This component doesn't render anything
}
