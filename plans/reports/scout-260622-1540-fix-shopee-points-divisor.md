# Scout Report: Fix Shopee Points Divisor

## Problem Description
The system's active loyalty point rule defines `200 VND = 1 Point` for Shopee transactions. However, when:
1. An admin approves a request via the backend, the backend hardcodes a division by `10000` (10k = 1 point).
2. An admin creates a request manually in the admin dashboard, the frontend displays and calculates expected points based on a hardcoded division by `10000`.
3. The helper function `computeExpectedPoints` in the frontend utility file `lib/shopee-requests.ts` hardcodes a division by `10000`.

## Findings & Affected Files

### 1. Backend Points Calculation (Approval)
- **File**: `3f-api/app/Controllers/ShopeePointRequestController.php` ([ShopeePointRequestController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/ShopeePointRequestController.php#L372-L374))
- **Current Code**:
  ```php
  // Strict point calculation: FLOOR(verifiedAmount / 10000)
  $approvedPoints = (int)floor($verifiedAmount / 10000);
  $pointPreview = ['finalPoints' => $approvedPoints, 'note' => 'Strict FLOOR(verified_amount / 10000)'];
  ```
- **Action**: Replace `(int)floor($verifiedAmount / 10000)` with `PointService::calculateShopeePoints($verifiedAmount)` to use the active point rule dynamically.

### 2. Frontend Manual Request Modal
- **File**: `components/admin/shopee/ShopeeManualRequestModal.tsx` ([ShopeeManualRequestModal.tsx](file:///c:/Users/Admin/Downloads/ccc/components/admin/shopee/ShopeeManualRequestModal.tsx))
- **Hardcoded Areas**:
  - Line 191: `expectedPoints: Math.floor(orderAmount / 10000),`
  - Line 516: `<span className="font-bold text-[#0B1F3A]">Tổng tiền / 10.000</span>`
  - Line 540: `{Math.floor(orderAmount / 10000)} điểm`
- **Action**: Fetch active rate from `${API_BASE_URL}/api/loyalty/point-rules/shopee` on mount. Default to `200` and display dynamic rate calculation (`Tổng tiền / {rate}`) and expected points (`orderAmount / rate`).

### 3. Frontend Utility Function
- **File**: `lib/shopee-requests.ts` ([shopee-requests.ts](file:///c:/Users/Admin/Downloads/ccc/lib/shopee-requests.ts#L49-L51))
- **Current Code**:
  ```typescript
  export function computeExpectedPoints(amount: number) {
    return Math.floor(amount / 10000);
  }
  ```
- **Action**: Update the divisor from `10000` to `200` to match the active rule rate.
