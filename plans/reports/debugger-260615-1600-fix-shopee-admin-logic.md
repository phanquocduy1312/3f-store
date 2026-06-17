# Debugger Report: Shopee Admin Page UI Logic Issues

## 1. Root Cause Analysis

### 1.1 Action Buttons Display & Logic in Details Modal
- **Issue**: The action buttons ("Duyệt & cộng điểm" and "Từ chối") in `ShopeeRequestDetailModal.tsx` were cut off/broken in syntax and lacked proper disabling/hiding logic based on `processingStatus`.
- **Cause**: Line 610-614 contained a syntax error due to an unclosed `isDuplicate && (...)` block. Furthermore, the action footer buttons at line 636-644 had broken JSX rendering and did not restrict showing the buttons solely when `processingStatus === "pending"`.
- **Resolution**: Fix the syntax errors by adding the missing closing parenthesis/brace. Wrap the buttons in a conditional block `{processingStatus === "pending" && ...}`.

### 1.2 Footer Text Warnings
- **Issue**: Missing clear text block showing status descriptions like "Yêu cầu này đã được duyệt và cộng điểm." or "Yêu cầu này đã bị từ chối." when not pending.
- **Cause**: The `footerMessage` did not exactly display these hardcoded values for approved and rejected requests.
- **Resolution**: Update `footerMessage` calculation to match the rules:
  - `"approved"` -> `"Yêu cầu này đã được duyệt và cộng điểm."`
  - `"rejected"` -> `"Yêu cầu này đã bị từ chối."`

### 1.3 Approve Confirmation Warning
- **Issue**: Clicking "Duyệt & cộng điểm" on a request with a non-valid API verification status directly proceeds to approval without warning.
- **Cause**: No conditional confirmation logic (`window.confirm`) exists in the handler.
- **Resolution**: Add `window.confirm` to verify if the admin still wants to manually approve when `verificationStatus !== "valid"`.

### 1.4 Dashboard Counts and Tab Counts Mismatch
- **Issue**: "Đã duyệt" card counts 0 while tab "Đã duyệt" counts 1 and the list shows 1 row.
- **Cause**: The card stats use `currentApprovedRequests` which filters by `approvedAt` date field, whereas the tabs and list use `currentCreatedRequests` which filters by `createdAt`.
- **Resolution**: Update the stats mapping so that all request counts (total, pending, approved, rejected, valid, manual review/need review) use `currentCreatedRequests` and `previousCreatedRequests` filtered solely by `processingStatus` and `verificationStatus` as specified.
  - `manualReviewRequests` (Need review) and `manual_review` tab will both consistently check `["manual_review", "mismatch", "not_found", "duplicate", "invalid_order_status"]`.
  - `totalApprovedPoints` will sum `approvedPoints` of requests having `processingStatus === "approved"`.

### 1.5 Comparison Warnings
- **Issue**: Warnings about amount mismatches are not always displayed or are improperly formatted.
- **Cause**: Conditional check for amountMismatch doesn't consistently output when both `invalid_order_status` and amount mismatch are present.
- **Resolution**: Construct composite reasons if `isInvalidStatus` and `amountMismatch` are both true, and show the chênh lệch box.
