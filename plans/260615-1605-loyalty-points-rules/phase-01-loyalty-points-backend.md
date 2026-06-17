# Phase 1: Database and Backend Core

## Context Links
- Related Report: [scout-260615-1605-loyalty-points-rules.md](file:///c:/Users/Admin/Downloads/ccc/plans/reports/scout-260615-1605-loyalty-points-rules.md)

## Overview
- Priority: High
- Current Status: In-Progress
- Brief Description: Implement loyalty rules table structure, rules config model, calculation service, endpoints, and route registrations.

## Requirements
- Create SQL table `loyalty_point_rules` with default rule seeded.
- Implement database auto-table creation inside `LoyaltyPointRuleModel` on instantiation.
- Implement point calculation rules (floor, ceil, round, multiplier, minimum order limits, caps) in `LoyaltyPointService`.
- Expose endpoints to list, create, update, deactivate rules, and calculate rule-based point previews.

## Related Code Files
- [schema.sql](file:///c:/Users/Admin/Downloads/ccc/3f-api/schema.sql)
- [Router.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Router.php)
- [LoyaltyPointRuleModel.php [NEW]](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Models/LoyaltyPointRuleModel.php)
- [LoyaltyPointService.php [NEW]](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Services/LoyaltyPointService.php)
- [LoyaltyController.php [NEW]](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/LoyaltyController.php)

## Implementation Steps
1. **Database Schema**:
   - Add rule table creation to `schema.sql`.
2. **Model**:
   - Create `LoyaltyPointRuleModel.php`. Implement constructor check to run `CREATE TABLE IF NOT EXISTS loyalty_point_rules` and seed default shopee rule.
   - Implement `getActiveRule($source)`, `listRules()`, `createRule($data)`, `updateRule($id, $data)`, `deactivateRule($id)`.
3. **Service**:
   - Create `LoyaltyPointService.php`. Implement `calculatePoints($amount, $source)`.
4. **Controller**:
   - Create `LoyaltyController.php`. Implement `list()`, `create()`, `update()`, `deactivate()`, and `calculatePreview()`.
5. **Routes**:
   - Add routes and fallback query mappings to `Router.php` and `index.php`.
