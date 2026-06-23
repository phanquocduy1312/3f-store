# Phase 03: Configuration Settings APIs

## Context Links
- [public/index.php routing](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)

## Overview
- Priority: Medium
- Status: Pending
- Description: Build endpoints to allow administration configuration of workflow statuses, transitions, automation rules, shipping carriers, and notification channels.

## Key Insights
- System critical keys must be protected in validation logic: block deleting or renaming the status_key of completed, cancelled, paid, refunded, and credited.

## Requirements
- Endpoint to query and save statuses.
- Endpoint to query and save transitions.
- Config APIs for shipping providers and notifications.
- Config APIs for automation rules.

## Architecture
- Created `WorkflowController.php` for setting configurations.

## Related Code Files
- `3f-api/public/index.php` (Modify)
- `3f-api/app/Controllers/WorkflowController.php` (New)

## Implementation Steps
1. Create `WorkflowController.php` with actions:
   - `listStatuses()`, `saveStatus()`
   - `listTransitions()`, `saveTransition()`, `deleteTransition()`
   - `listNotifications()`, `saveNotification()`
   - `listShippingProviders()`, `saveShippingProvider()`
   - `listAutomationRules()`, `saveAutomationRule()`
2. Add routing hooks to `index.php`.
3. Add safety checks in `saveStatus()` and any delete endpoints to throw an exception if the target has a system-critical key.

## Todo List
- [ ] Create `WorkflowController.php` file
- [ ] Bind routes in `index.php`
- [ ] Implement system-critical key protection rules
- [ ] Build configurations fetching and saving logic

## Success Criteria
- APIs return settings successfully.
- Blocked deletion attempts of critical keys return HTTP 400.

## Risk Assessment
- Unauthorized access to configuration endpoints. Mitigate by applying `AuthMiddleware::requireAdmin()`.

## Security Considerations
- Require admin tokens for all settings mutations.

## Next Steps
- Refactor the Order Admin details page UI in Phase 4.
