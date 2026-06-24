---
title: "Nâng cấp Admin Dashboard Analytics — Đẹp hơn, Xịn hơn, Đúng nghiệp vụ"
description: >
  Redesign toàn bộ Admin Dashboard từ layout đến dữ liệu: thêm các widget mới
  theo đúng nghiệp vụ pet store (AOV theo danh mục, conversion funnel, tỉ lệ
  hoàn trả, CLV cơ bản, phân tích pet type), nâng cấp UX biểu đồ, thêm
  quick-action intelligent, và cải thiện visual design tổng thể.
status: planning
priority: high
effort: large
branch: dev
tags: [dashboard, analytics, admin, ui, ux]
created: 2026-06-23
---

# Tổng quan kế hoạch

## Mục tiêu
1. Mỗi KPI card đều có **ý nghĩa nghiệp vụ rõ ràng**, không chỉ là con số
2. Thêm **các widget insight mới** theo đặc thù pet store: top categories, pet type mix, order funnel, return rate
3. Nâng cấp **biểu đồ doanh thu** sang combo line+bar chart xịn hơn (Recharts)
4. **UX flow tốt hơn**: quick-actions thông minh, empty states đẹp, loading skeletons
5. **Layout linh hoạt**: pin/reorder widgets, responsive hoàn chỉnh

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | [KPI Cards 2.0 + Layout Row 1](phase-01-kpi-cards.md) | `pending` | M |
| 2 | [Biểu đồ doanh thu nâng cấp (Recharts)](phase-02-revenue-chart.md) | `pending` | L |
| 3 | [Widget mới: Funnel đơn hàng + Top danh mục](phase-03-new-widgets.md) | `pending` | L |
| 4 | [Backend: APIs mới cho widget mới](phase-04-backend-apis.md) | `pending` | M |
| 5 | [Polish: Skeleton loading, empty states, quick actions](phase-05-polish.md) | `pending` | S |

## Dependencies
- Phase 4 (Backend) phải làm **trước hoặc song song** với Phase 3
- Phase 2 cần install Recharts: `npm install recharts`
- Phases 1, 5 độc lập — làm được ngay
