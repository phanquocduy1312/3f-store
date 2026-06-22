---
title: Pet Profile as AI Consultation History
description: Redesign Pet Profiles to automatically trigger from the AI advisor quiz, persist AI advice in the database, and display consultation summaries.
status: in-progress
priority: high
effort: medium
branch: feature/pet-profile-ai-consultation
tags:
  - backend
  - frontend
  - ai-advisor
  - database
created: 2026-06-22
---

# Overview Plan

Transform the customer pet profile page into a detailed AI consultation history review log.

## Phases

1. [Phase 1: Database and Backend Migration](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1130-pet-profile-ai-consultation/phase-01-database-backend.md) - Alter `customer_pets` table and update backend controller to handle `ai_result`.
2. [Phase 2: Save AI Quiz Result on Submission](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1130-pet-profile-ai-consultation/phase-02-save-quiz-submission.md) - Hook quiz completion to call backend `createPetApi` with AI advice content.
3. [Phase 3: UI Redesign of PetsPage](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1130-pet-profile-ai-consultation/phase-03-ui-redesign.md) - Update `PetsPage.tsx` to launch quiz on "Thêm thú cưng" and display AI advice details (summary, recommended products, budget, care tips) for each pet.
4. [Phase 4: Testing & Deployment](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1130-pet-profile-ai-consultation/phase-04-testing-deployment.md) - Compile TS, run Vite build, and deploy PHP files.
5. [Phase 5: Transition to Pure AI Advice History](file:///c:/Users/Admin/Downloads/ccc/plans/260622-1130-pet-profile-ai-consultation/phase-05-pure-ai-advice-history.md) - Redesign client view and modal to focus strictly on consultation history.

