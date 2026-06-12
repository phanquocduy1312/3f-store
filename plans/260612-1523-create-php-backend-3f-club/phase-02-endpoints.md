# Phase 2: Core Endpoints - API implementation

## Context Links

- Scout report: [scout-260612-1523-create-php-backend-3f-club.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260612-1523-create-php-backend-3f-club.md)
- Main plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1523-create-php-backend-3f-club/plan.md)

## Overview

- **Priority**: High
- **Status**: Planning
- **Description**: Build 7 independent PHP files inside `3f-api/api/` representing the business logic, validating request bodies, issuing database queries, managing database transactions, and returning clean JSON structures.

## Key Insights

- Always use `json_decode(file_get_contents('php://input'), true)` to parse JSON POST bodies.
- Enforce CORS by starting each API file with a call to the global `cors()` helper.
- Verify path mappings for uploads so they resolve cleanly to standard HTTP paths.

## Requirements

- Scanning: stores image and OCR metadata with a transaction.
- Create request: rejects duplicates if order code exists and processing status is not `rejected`.
- List requests: joins request table with images, supports pagination, and returns total count metadata.
- Detail request: joins request with both image and scan records.
- Approve/Reject: validates requestId, blocks invalid transitions, and stamps dates.
- Customer points: aggregates approved points and computes member tier (Silver < 500, Gold < 1500, Platinum >= 1500).

## Related Code Files

- [3f-api/api/shopee-order-scan.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/api/shopee-order-scan.php) [NEW]
- [3f-api/api/shopee-request-create.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/api/shopee-request-create.php) [NEW]
- [3f-api/api/shopee-request-list.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/api/shopee-request-list.php) [NEW]
- [3f-api/api/shopee-request-detail.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/api/shopee-request-detail.php) [NEW]
- [3f-api/api/shopee-request-approve.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/api/shopee-request-approve.php) [NEW]
- [3f-api/api/shopee-request-reject.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/api/shopee-request-reject.php) [NEW]
- [3f-api/api/customer-points.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/api/customer-points.php) [NEW]

## Todo List

- [ ] Implement `shopee-order-scan.php`.
- [ ] Implement `shopee-request-create.php`.
- [ ] Implement `shopee-request-list.php`.
- [ ] Implement `shopee-request-detail.php`.
- [ ] Implement `shopee-request-approve.php`.
- [ ] Implement `shopee-request-reject.php`.
- [ ] Implement `customer-points.php`.

## Success Criteria

- All endpoints return correct response payloads matching the user specification.
- Duplicate order codes are blocked correctly.
- SQL queries use parameter placeholders to prevent injection.
- Re-scanning works dynamically.
