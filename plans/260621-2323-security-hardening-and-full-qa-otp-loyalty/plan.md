# Implementation Plan: OTP & Loyalty Security Hardening and QA

## Overview
This plan outlines the steps to perform security hardening, provider configuration verification, formula checks, point ledger validation, and full QA for the OTP Provider Adapter and 3F Club Loyalty Rules Engine.

## Status
- **Phase 01**: Hashing & Provider Safety Configuration — *Pending*
- **Phase 02**: Verification & Loyalty Engine QA — *Pending*
- **Phase 03**: Staging Deploy & Remote Validation — *Pending*

## Phases

### [Phase 01: Hashing & Provider Safety](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2323-security-hardening-and-full-qa-otp-loyalty/phase-01-hashing-and-provider-safety.md)
- Implement `OTP_SECRET` checks and mock block in production.
- Harden hashing behavior in `OtpService.php`.
- Ensure environment configuration parameters are properly parsed.

### [Phase 02: Verification & Loyalty Engine QA](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2323-security-hardening-and-full-qa-otp-loyalty/phase-02-verification-and-loyalty-engine-qa.md)
- Verify phone verification flow.
- Test formula calculations (multipliers, shipping exclusion, point deductions).
- Test point ledger safety (idempotency keys, cancel/refund double reversals).

### [Phase 03: Staging Deploy & Remote Validation](file:///c:/Users/Admin/Downloads/ccc/plans/260621-2323-security-hardening-and-full-qa-otp-loyalty/phase-03-staging-deploy-and-remote-validation.md)
- Update env variables on Plesk staging.
- Block public access to `run_migration.php`.
- Run final validation and verify dashboard.
