---
title: Implement Contact Page and Contact Message API for 3F Store
description: Redesign and implement the Contact (Liên hệ) page with a fully validated backend contact message API and pet-friendly styles.
status: in-progress
priority: high
effort: medium
branch: dev
tags: [frontend, backend, contact-page, api, mysql]
created: 2026-06-23T15:05:00+07:00
---

# Re-implement Contact Page

Implement a clean, pet-friendly Contact page (`/contact` & `/lien-he`), backend form API `/api/contact` storing messages in MySQL table, spam protection, and navigation links.

## Phases

- [Phase 1: Database and Backend API](./phase-01-backend.md)
  - Create the `ContactMessage` model with automatic migrations for `contact_messages`.
  - Create the `ContactController` with input validation, Honeypot check, and JSON response.
  - Register `/api/contact` route in `3f-api/public/index.php`.
- [Phase 2: Asset Generation](./phase-02-assets.md)
  - Generate quality contact/support photography using Nano Banana (`generate_image`).
  - Save assets into `public/images/contact/`.
- [Phase 3: Page and Sub-components Implementation](./phase-03-frontend.md)
  - Create modular components: `ContactHero`, `ContactQuickCards`, `ContactForm`, `ContactLocation`, `ContactFaq`, `ContactCTA`.
  - Build `src/pages/ContactPage.tsx` under the 200-line limit.
- [Phase 4: Routing and Navigation Updates](./phase-04-routing.md)
  - Register routing paths `/contact` and `/lien-he` in `src/App.tsx`.
  - Connect Header and Footer links.
- [Phase 5: Verification and QA](./phase-05-verification.md)
  - Run type checks (`npx tsc --noEmit`) and build checks (`npm run build`).
  - Validate form submissions, anti-spam, and responsive views.
