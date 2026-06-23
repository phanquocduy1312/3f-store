---
title: Sync AI Advisor Voucher Shape and Constraint
description: Sync AI Advisor voucher card styling to match VoucherCard, and enforce the single active voucher rule with UI warning and backend verification.
status: in-progress
priority: high
effort: low
branch: main
tags: [ui, admin, coupons, ai-advisor]
created: 2026-06-23
---

# Sync AI Advisor Voucher Shape and Constraint

## Phases

- [ ] [Phase 01: Sync AI Result Voucher Design](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1128-sync-ai-advisor-voucher/phase-01-sync-ai-voucher-design.md) - Update AiResult.tsx voucher card styling, notches, and responsive shape to match VoucherCard.
- [ ] [Phase 02: Admin Panel Hint and Safety Check](file:///c:/Users/Admin/Downloads/ccc/plans/260623-1128-sync-ai-advisor-voucher/phase-02-admin-safety-check.md) - Add a clear warning hint under the "Tư vấn AI" toggle in the voucher form.

## Key Dependencies
- `AiResult.tsx` retrieves active advisor voucher from `/api/vouchers/ai-advisor`.
- Coupons database holds `show_in_ai_advisor` attribute.
