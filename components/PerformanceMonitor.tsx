"use client";

import { useEffect, useState } from "react";

export function PerformanceMonitor() {
  const [stats, setStats] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0,
  });

  useEffect(() => {
    // Track FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    function countFPS() {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setStats(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (currentTime - lastTime)),
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFPS);
    }
    
    countFPS();
    
    // Track memory (if available)
    if ((performance as any).memory) {
      const interval = setInterval(() => {
        const memory = (performance as any).memory;
        setStats(prev => ({
          ...prev,
          memory: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, []);

  // Track page load time
  useEffect(() => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    setStats(prev => ({
      ...prev,
      loadTime: Math.round(loadTime / 1000),
    }));
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-lg bg-black/80 p-3 text-xs text-white font-mono">
      <div className="font-bold mb-1">⚡ Performance</div>
      <div>FPS: {stats.fps}</div>
      {stats.memory > 0 && <div>Memory: {stats.memory} MB</div>}
      <div>Load: {stats.loadTime}s</div>
    </div>
  );
}
