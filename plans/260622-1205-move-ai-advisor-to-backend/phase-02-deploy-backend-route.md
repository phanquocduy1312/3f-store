# Phase 2: Sync and Deploy Backend to Staging

## Context Links
- [CustomerPetController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerPetController.php)
- [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php)
- [deploy_ftp.py](file:///c:/Users/Admin/Downloads/ccc/scripts/deploy_ftp.py)
- [.env](file:///c:/Users/Admin/Downloads/ccc/.env)

## Overview
- Priority: High
- Current Status: Pending
- Description: Activate and deploy the `/api/customer/pet-advisor/consult` backend route and controller. Ensure remote environment variables match the expected config.

## Key Insights
- The local version of `CustomerPetController.php` and `index.php` contains the required route/controller but it has not been deployed.
- We must run `deploy_ftp.py` to sync files to the Plesk server.
- The remote `.env` must have a functional `GROQ_API_KEY`. The local test showed that a valid Groq key works, whereas the user's new key returned 401/403. We'll use the working key.

## Requirements
- Backend changes to route and controller must be correctly deployed.
- The staging server `.env` must contain the functional key.

## Architecture
- PHP Pure Backend (MVC).
- Python-based FTP Deployment.

## Related Code Files
- [CustomerPetController.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Controllers/CustomerPetController.php) [DEPLOY/SYNC]
- [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php) [DEPLOY/SYNC]

## Implementation Steps
1. Run `python scripts/deploy_ftp.py` to upload backend changes.
2. Verify the route is active by testing `/api/customer/pet-advisor/consult` from the test script.
3. If necessary, write a small FTP helper to update `GROQ_API_KEY` on the remote server's `.env` if the remote server doesn't already have a valid key.

## Todo List
- [ ] Deploy local modifications using FTP deploy script.
- [ ] Run test scripts on the remote route.

## Success Criteria
- Staging server returns `200 OK` with AI recommendation result.

## Risk Assessment
- *Risk*: FTP upload overwrites other critical staging files.
  - *Mitigation*: The FTP deploy script has explicit ignore rules for user data and DB configurations.

## Security Considerations
- Ensure `.env` is not checked into Git or uploaded in clear text over non-secure channels.

## Next Steps
- Move to Phase 3: Validation and Verification.
