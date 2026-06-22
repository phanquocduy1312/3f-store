# Report: Remake Factual Project Feature Checklist
Date: 2026-06-22
Time: 13:29
Slug: remake-project-checklist
Type: cook

## Summary
- Re-scouted the codebase API controllers (`3f-api/app/Controllers`) and database schemas (`3f-api/database`) to establish the 100% actual, real list of features of the **3F Store & 3F Club** project.
- Reverted the checklist to contain only the **54 real features** mapped to the project, removing all fabricated fashion features (like returns policies, sizing model guides, abandoned carts, or review controllers not present in the code).
- Included the real planned features from the project roadmap that are currently pending (`⬜ Chưa`), such as:
  - `A4.9`: Online payment gateways (SePay / Stripe).
  - `A8.7`: Manual points management in Admin.
  - `A8.8`: OTP verify on point redemption.
  - `A8.9`: Holding points for Shopee / TikTok.
  - `A8.10`: Points expiration warnings.
- Wrote and executed [create_3f_checklist_real.py](file:///c:/Users/Admin/Downloads/ccc/scratch/create_3f_checklist_real.py) using `openpyxl`. Since the original Excel file was locked by the user's Excel editor, the script successfully fell back and created the real checklist at [3f-store-checklist.xlsx](file:///c:/Users/Admin/Downloads/ccc/docs/3f-store-checklist.xlsx).
- Updated [3f-store-project-checklist.md](file:///c:/Users/Admin/Downloads/ccc/docs/3f-store-project-checklist.md) with the correct 54-item factual list.

## Files Created/Updated
- [3f-store-checklist.xlsx](file:///c:/Users/Admin/Downloads/ccc/docs/3f-store-checklist.xlsx) (Real Excel sheet)
- [3f-store-project-checklist.md](file:///c:/Users/Admin/Downloads/ccc/docs/3f-store-project-checklist.md) (Real Markdown list)
- [create_3f_checklist_real.py](file:///c:/Users/Admin/Downloads/ccc/scratch/create_3f_checklist_real.py) (Factual generator script)
