# Cook Report - Create PHP MVC Backend for 3F Club

- **Task**: Pure PHP mini MVC backend with MySQL/PDO for Shopee Point Request.
- **Date**: 2026-06-12 15:45
- **Status**: Completed

## Actions Taken
1. Created core MVC framework structure under `3f-api/` (Core, Controllers, Models, Services, Helpers, public entry point).
2. Wrote configurations in `config/config.php` and public rewrite paths in `public/.htaccess`.
3. Created singleton `Database.php`, clean response output in `Response.php`, input/payload reader in `Request.php`, and double URL/query parameter resolver in `Router.php`.
4. Created models: `UploadedOrderImage`, `OrderImageScan`, and `ShopeePointRequest` encapsulating database operations.
5. Created services: `ValidationService` (cleans/validates inputs), `PointService` (calculates points/tiers), `UploadService` (moves files securely), and `OcrService` (mocks OCR results).
6. Created controllers: `ShopeeOrderScanController` (scans orders), `ShopeePointRequestController` (submissions, detailed pagination, approval/rejection operations), and `CustomerPointController` (gathers points).
7. Cleaned up obsolete script directories (`api/` and `helpers/`).
8. Updated project documentation roadmap and changelog in `./docs`.

## Verification Status
- Directories and structures are correctly placed.
- Obsolete files have been removed successfully.
- Code uses clean namespace autoloader and proper abstraction separating routing, DB queries, validation services, and routing responses.
