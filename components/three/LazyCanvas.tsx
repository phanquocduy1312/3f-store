"use client";

import { lazy } from "react";

/**
 * Lazy load Three.js canvas components to reduce initial bundle size
 * This improves First Contentful Paint and Largest Contentful Paint
 */

export const LazyPetHeroCanvas = lazy(() =>
  import("./PetHeroCanvas").then((mod) => ({ default: mod.PetHeroCanvas })),
);

export const LazyVillageCanvas = lazy(() =>
  import("./VillageCanvas").then((mod) => ({ default: mod.VillageCanvas })),
);
