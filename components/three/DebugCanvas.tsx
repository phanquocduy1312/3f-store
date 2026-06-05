"use client";

import { useEffect, useState } from "react";

/**
 * Debug component to verify 3D canvas rendering
 * Remove this after testing
 */
export function DebugCanvas() {
  const [info, setInfo] = useState({
    isClient: false,
    webglSupported: false,
    windowSize: { width: 0, height: 0 },
  });

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    setInfo({
      isClient: true,
      webglSupported: !!gl,
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }, []);

  if (!info.isClient) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black/80 p-4 text-xs text-white">
      <div className="font-bold mb-2">3D Canvas Debug</div>
      <div>WebGL: {info.webglSupported ? '✅ Supported' : '❌ Not Supported'}</div>
      <div>Window: {info.windowSize.width} x {info.windowSize.height}</div>
    </div>
  );
}
