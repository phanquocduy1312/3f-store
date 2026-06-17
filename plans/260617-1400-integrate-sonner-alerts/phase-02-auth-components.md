# Phase 2: Authentication Components Alert Replacements

## Context Links
- [LoginForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Auth/LoginForm.tsx)
- [RegisterForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Auth/RegisterForm.tsx)
- [PhoneAuthForm.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Auth/PhoneAuthForm.tsx)
- [SocialLogins.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Auth/SocialLogins.tsx)

## Overview
- Priority: Medium
- Status: Todo
- Description: Clean up browser alerts in authentication flows and replace them with `sonner` notifications.

## Requirements
- Replace success alerts with `toast.success`.
- Replace social login mock notifications with `toast.info` or `toast.success`.

## Related Code Files
- `components/Auth/LoginForm.tsx` (modify)
- `components/Auth/RegisterForm.tsx` (modify)
- `components/Auth/PhoneAuthForm.tsx` (modify)
- `components/Auth/SocialLogins.tsx` (modify)

## Implementation Steps
1. Import `toast` from `sonner`.
2. In `LoginForm.tsx`: Replace mock login alert with `toast.success`.
3. In `RegisterForm.tsx`: Replace register success alert with `toast.success`.
4. In `PhoneAuthForm.tsx`: Replace verification alerts with `toast.success` / `toast.error`.
5. In `SocialLogins.tsx`: Replace provider demo login alerts with `toast.info`.

## Todo List
- [ ] Update LoginForm to use sonner
- [ ] Update RegisterForm to use sonner
- [ ] Update PhoneAuthForm to use sonner
- [ ] Update SocialLogins to use sonner

## Success Criteria
- Mock login/register flows trigger modern toasts rather than browser alerts.
