# Scout Report: Admin Dashboard Implementation

**Date:** 260612  
**Time:** 10:13  
**Slug:** create-admin-dashboard  
**Type:** scout  

## 1. Codebase Discovery & Structure

### Files & Paths
- **Route Manager:** `src/App.tsx` handles client-side routing using `react-router-dom` v7.
- **Routing Setup:** Uses `<Routes>` and `<Route>` inside a `<Suspense>` wrapper.
- **Header & Footer:** Rendered globally in `src/App.tsx`. We must hide them for `/admin` paths to match the standalone layout in the design.
- **Styling:** Tailwind CSS v3.4 is configured in `tailwind.config.ts` and `src/globals.css`.
- **Icons:** `lucide-react` is installed (`^0.475.0`). We will use it for all sidebar menu icons and dashboard card icons.
- **Charts:** `recharts` is NOT in `package.json`. Following the user requirements and KISS/YAGNI, we will use custom SVG/CSS implementations for the line chart (revenue) and donut chart (order sources) to avoid heavy libraries and keep compilation swift.

## 2. Directory Layout Proposal
Following the naming rules (kebab-case, self-descriptive names, under 200 lines per file):

- **New Page Component:**
  - `src/pages/admin/admin-dashboard.tsx`
- **Sub-components in `components/admin/`:**
  - `components/admin/admin-sidebar.tsx`
  - `components/admin/admin-header.tsx`
  - `components/admin/admin-kpi-card.tsx`
  - `components/admin/admin-task-queue.tsx`
  - `components/admin/admin-revenue-chart.tsx`
  - `components/admin/admin-source-donut-chart.tsx`
  - `components/admin/admin-top-products.tsx`
  - `components/admin/admin-pet-needs-stats.tsx`
  - `components/admin/admin-ai-lead-list.tsx`
  - `components/admin/admin-shopee-request-list.tsx`

## 3. Findings & Constraints
- **Routing adjustment:** We need to check `location.pathname.startsWith("/admin")` in `src/App.tsx` and disable `Header`, `Footer`, and `PetAdvisorPopup` on admin routes.
- **Theme Palette:** Custom colors will be styled directly using inline Tailwind classes or extended theme in `tailwind.config.ts`. Direct hex values or utility variables will keep changes localized without polluting the main configuration if possible.
