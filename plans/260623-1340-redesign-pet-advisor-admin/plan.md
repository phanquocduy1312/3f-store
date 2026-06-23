---
title: Redesign and Modularize AI Pet Advisor Admin Page
description: Convert split layout of Pet Advisor history to a full-width grid and separate detail page, modularizing components to keep files under 200 lines.
status: in-progress
priority: high
effort: low
branch: dev
tags: admin, pet-advisor, ui-redesign, refactor
created: 2026-06-23
---

# Plan Overview

This plan details the modularization of the AI Pet Advisor interface which was split into two views. To adhere to the 200-line limit per file rule and improve maintainability, components and helpers are separated into reusable files.

## Phases

- **Phase 1**: Extract shared helper functions, constants, and types.
  - Link: [Phase 1 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1340-redesign-pet-advisor-admin/phase-01-extract-helpers.md)
- **Phase 2**: Extract shared UI components (KpiCard, SummaryCard, DetailPanel, InfoRow).
  - Link: [Phase 2 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1340-redesign-pet-advisor-admin/phase-02-extract-components.md)
- **Phase 3**: Refactor AdminPetAdvisorPage & AdminPetAdvisorDetailPage.
  - Link: [Phase 3 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1340-redesign-pet-advisor-admin/phase-03-refactor-pages.md)
- **Phase 4**: Verification & Testing.
  - Link: [Phase 4 Details](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1340-redesign-pet-advisor-admin/phase-04-verification.md)
