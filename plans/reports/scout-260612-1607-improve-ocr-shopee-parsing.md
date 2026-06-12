# Scout Report - Improve OCR Shopee Parsing

- **Date**: 2026-06-12 16:07
- **Slug**: improve-ocr-shopee-parsing
- **Status**: Completed

## File Discovered
- [OcrService.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/OcrService.php): Contains parsing method `parseShopeeOrderText($rawText)`.

## Findings in OcrService.php
- Currently parses fields using simple regex globally:
  - Phone: `(0[\d\s.-]{8,15})` - matches tracking numbers if they contain numbers.
  - Order Code: looks for `#` or label, but doesn't distinguish SPX well.
  - Amount: checks `Thành tiền`, `Tổng tiền`, `Tổng cộng`, `Thanh toán`. Doesn't handle `Tiền thu Người nhận` or multiline amounts properly.
  - Customer: checks `Họ tên`, `Người nhận`, `Tên khách`, `Khách hàng`. Shopee labels use `Đến`.
  - Email: parsed via regex.
  - Status: parses completed/shipped.
  - Tracking: SPX patterns.
- Needs block-based line extraction and strict line-by-line parsing to avoid cross-contamination.
