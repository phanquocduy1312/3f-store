# Technical Research Report: Sync Shopee Rates and Membership Tiers

## Problem Context
- The guest-facing landing page for the 3F Club (`components/threeFclup.tsx`) displays hardcoded static membership tier cards (Silver, Gold, Platinum) with point ranges instead of dynamically configured spend thresholds (Member, Silver, Gold, Diamond) and benefits from the database.
- The guest-facing Shopee order points estimator computes points using a hardcoded formula of `Math.floor(amount / 10000)` (effectively 10k = 1 point), which is out of sync with the active rule.
- In the database, the active Shopee rule has `money_per_point = 12000`, causing Shopee calculations to result in a `12k = 1 point` rate rather than `200đ = 1 point`.

## Database State
- **loyalty_point_rules**:
  - `id = 2` (Quy tắc Shopee mới) is active with `money_per_point = 12000`.
- **loyalty_tiers**:
  - Tiers defined: `Member` (min_spend = 0), `Silver` (min_spend = 2M), `Gold` (min_spend = 5M), `Diamond` (min_spend = 10M).
- **loyalty_settings**:
  - `money_per_point` is set to `200` (which is used for website calculations).

## Proposed Solution
1. **Update Shopee Rules in Database**:
   - Update `money_per_point` to `200` for all rules in `loyalty_point_rules` where `source = 'shopee'` to ensure backend calculations and admin rule previews both reflect the correct 200đ = 1 point rate.
2. **Add Public Backend APIs**:
   - Define a public endpoint `GET /api/loyalty/point-rules/shopee` returning the active Shopee rule's `money_per_point`.
   - Define a public endpoint `GET /api/loyalty/tiers` returning all active loyalty tiers and benefits.
3. **Refactor Frontend Pages**:
   - Update `components/threeFclup.tsx` to fetch the active Shopee point rule and active tiers dynamically.
   - Replace the hardcoded `Math.floor(amount / 10000)` calculation with the dynamic `money_per_point` fetched from the API.
   - Refactor the tier cards grid to dynamically map and display Member, Silver, Gold, and Diamond tiers with their real spend thresholds and benefits.
