# Phase 3: Frontend Chart Refinement

## Overview
- Priority: High
- Status: Completed
- Description: Fix the average orders divisor for weekly/monthly ranges, resolve overlapping X-axis labels, and fix the invisible columns issue.

## Proposed Changes
- In `components/admin/admin-revenue-chart.tsx`:
  - Update `getDivisorAndSuffix` to return 7 for `this_week`, number of days in the month for `this_month`, 12 for `this_year`, and 24 for `today`.
  - Update the X-axis label visibility mapping to prevent overlap:
    - Today: show label every 4 hours.
    - Weekly: show label for all 7 days.
    - Monthly: show label every 5 days.
    - Yearly: show label for all 12 months.
  - Implement zero-revenue auto-scaling: when there is no confirmed revenue but orders exist, scale the column heights by order counts instead of revenue to display visual columns for the orders.
  - Fix SVG Gradient issue: replaced gradient fill `url(#barGrad)` with solid hex colors (`#0057E7` and `#2563EB`) to prevent browsers from rendering invisible shapes on router navigation.

## Related Code Files
- [admin-revenue-chart.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-revenue-chart.tsx)

## Verification
- Built the project successfully (`npm run build`).
- Confirmed that the columns render beautifully for the 2 pending orders of today.
