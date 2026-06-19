# Phase 3: Frontend Chart Refinement

## Overview
- Priority: High
- Status: Planned
- Description: Fix the average orders divisor for weekly/monthly ranges, and resolve overlapping X-axis labels.

## Proposed Changes
- In `components/admin/admin-revenue-chart.tsx`:
  - Update `getDivisorAndSuffix` to return 7 for `this_week`, number of days in the month for `this_month`, 12 for `this_year`, and 24 for `today`.
  - Update the X-axis label visibility mapping to prevent overlap:
    - Today: show label every 4 hours.
    - Weekly: show label for all 7 days.
    - Monthly: show label every 5 days.
    - Yearly: show label for all 12 months.

## Related Code Files
- [admin-revenue-chart.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/admin-revenue-chart.tsx)

## Verification Plan
- Start Vite dev server locally (`npm run dev`).
- Switch filters between "Hôm nay", "Tuần này", "Tháng này", and "Năm nay" on the dashboard.
- Verify column charts render correctly and averages match expected results.
