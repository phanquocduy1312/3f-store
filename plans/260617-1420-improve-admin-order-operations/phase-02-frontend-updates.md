# Phase 2: Frontend UI & UX Enhancements

### Context Links
- Plan Overview: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260617-1420-improve-admin-order-operations/plan.md)
- Admin Orders Component: [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)

### Overview
- Priority: High
- Current Status: Pending
- Description: Upgrade the admin order operations page. Fix layout bugs, rendering details, and point calculations. Integrate timeline logging fallback, inline quick action buttons in table rows, a custom confirmation overlay modal with textareas, and corrected customer display logic.

### Key Insights
- Browser tooltips and native alerts are bad for UX. We will build a clean React-based modal overlay for confirmations.
- All items list details must include item subtotal (quantity * price).
- Timeline rendering must support displaying custom statuses, notes, timestamps, and executor.
- Payment method & status strings must map to localized labels.

### Requirements
- **3F Club Points calculation and rules rendering**: Align loyalty display according to order status rules.
- **Detailed items rendering**: Show name, image, variant, SKU, quantity, unit price, and item subtotal.
- **Timeline logs rendering**: Use `log.to_status` and `log.from_status`. Support fallback messages.
- **Quick row actions**: Add state-specific icon buttons to table row (Eye, Check, Package, Truck, CheckCircle).
- **Drawer footer actions**: Dynamic actions based on state (Close, Cancel, Confirm, Start Delivery, Mark Paid, etc.).
- **Confirm dialog modal**: Design a sleek overlay confirmation dialog with a textarea for Cancel reason / Payment note.
- **Localized strings**: Localize payment status, payment method, and order status labels.
- **Date Range Filters**: Add Date range inputs (Từ ngày, Đến ngày) and connect them to API calls.

### Architecture
- Confirmation overlay dialog state will manage the currently clicked action's parameters (title, description, textarea requirement, resolve callbacks).
- Flex-based layout wrapper will isolate list text items to prevent overflow.

### Related Code Files
- [AdminOrdersPage.tsx](file:///c:/Users/Admin/Downloads/ccc/src/pages/admin/AdminOrdersPage.tsx)
- [productsApi.ts](file:///c:/Users/Admin/Downloads/ccc/src/api/productsApi.ts)

### Implementation Steps
1. **Modify `src/api/productsApi.ts`**:
   - Add optional customer fields to `OrderDetail` type.
2. **Modify `src/pages/admin/AdminOrdersPage.tsx`**:
   - Add new imports (`Check`, `Package`, `Truck`, `X`).
   - Add Date range filter state and inputs to filter bar.
   - Implement `ConfirmState` dialog component and rendering block.
   - Update table actions rendering with conditional icon buttons.
   - Update drawer footer with absolute status rules and "Đánh dấu đã thanh toán" button.
   - Update loyalty points section display logic.
   - Update items rendering list with price * quantity subtotal and fallback empty text.
   - Update timeline logging mapping using `to_status` and `from_status` with fallback state support.
   - Replace layout details of customer and shipping information.

### Todo List
- [ ] Add date inputs in React.
- [ ] Implement ConfirmState modal component.
- [ ] Implement quick action buttons in table row.
- [ ] Update drawer footer actions.
- [ ] Update loyalty display box logic.
- [ ] Update items list view in drawer.
- [ ] Update customer & shipping details layout in drawer.
- [ ] Validate TypeScript typecheck and build.

### Success Criteria
- Table displays action buttons matching order states.
- Confirmation overlay modal functions correctly.
- Clamped fields do not overlap and points render correctly according to status.
- TypeScript compiler passes without any errors.

### Risk Assessment
- Responsive issues on small displays for filter grid. *Mitigated by using responsive classes (grid-cols-1 md:grid-cols-3 lg:grid-cols-6).*

### Security Considerations
- Sanitize confirmation note inputs before sending to server.
