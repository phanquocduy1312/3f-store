# Phase 1: Parsing Refactoring

## Context Links

- Scout report: [scout-260612-1607-improve-ocr-shopee-parsing.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260612-1607-improve-ocr-shopee-parsing.md)
- Main plan: [plan.md](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1607-improve-ocr-shopee-parsing/plan.md)

## Overview

- **Priority**: High
- **Status**: Planning
- **Description**: Refactor `OcrService::parseShopeeOrderText` to split OCR raw text into lines and perform targeted, context-aware extractions.

## Key Insights

- Standard line-by-line normalization avoids false matches (e.g. parsing SPX tracking number as a phone number).
- Target "Đến" block strictly for recipient details (customerName and phone).
- Handle multi-line amounts where the amount is on a line below the "Tiền thu Người nhận" label.

## Requirements

- Parse trackingCode and shopeeOrderCode correctly, avoiding mixing them.
- Exclude SPX/GHN/GHTK prefix codes from shopeeOrderCode.
- Normalize phone numbers to 0xxxxxxxxx (supporting 84 prefix conversion).
- Clean money format to integer, ignoring dates/weights/quantities.
- Match exact requested warning strings.

## Related Code Files

- [3f-api/app/Services/OcrService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/OcrService.php) [MODIFY]

## Implementation Steps

1. Read and split raw text into trimmed lines and normalized flat text.
2. Search for the "Đến" recipient block to isolate customer name and recipient phone.
3. Apply specific regexes for:
   - `trackingCode`
   - `shopeeOrderCode` (filtering prefixes)
   - `phone` (with block preference and strict prefix normalization)
   - `customerName` (block-based line inspection)
   - `orderAmount` (same line or next 1-3 lines checks)
   - `orderDate` (dd-mm-yyyy parsing)
   - `orderStatus` (strict completed checking)
   - `shippingProvider` (SPX, GHTK, GHN checks)
   - `email`
4. Update the confidence scoring logic based on the new weights.
5. Populate warning messages precisely as requested.

## Todo List

- [ ] Modify `parseShopeeOrderText` in `OcrService.php`
- [ ] Create a PHP test script to run test cases 1, 2, and 3
- [ ] Verify execution outputs match expected fields

## Success Criteria

- Test Case 1 parses customerName "Nam", orderAmount 182700, shopeeOrderCode "221168M5W6ABM", no phone.
- Test Case 2 parses phone "0389904318", orderAmount 32150, shippingProvider "GHTK", customerName "vân anh".
- Test Case 3 parses trackingCode "SPXVN01564628722B", orderAmount 129987, orderDate "2023-05-19", customerName "Shopee Buyer", no phone.
