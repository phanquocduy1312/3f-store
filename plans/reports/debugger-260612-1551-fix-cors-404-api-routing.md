# Debugger Report - Fix CORS & 404 API Routing in Laragon Apache

- **Path**: `./plans/reports/debugger-260612-1551-fix-cors-404-api-routing.md`
- **Current Date/Time**: 2026-06-12 15:51
- **Task Slug**: `fix-cors-404-api-routing`

---

## 1. Issue Description

- **Symptom**: When attempting to scan an order receipt in the frontend, the request to `http://localhost/3f-api/public/api/shopee/order-scan` failed with a `404 (Not Found)` error, which subsequently triggered a CORS block policy inside the browser.
- **Errors**:
  - `Access to fetch at 'http://localhost/3f-api/public/api/shopee/order-scan' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`
  - `POST http://localhost/3f-api/public/api/shopee/order-scan net::ERR_FAILED 404 (Not Found)`

---

## 2. Root Cause Analysis

1. **Process Inspection**: The web server listening on port 80 is Laragon's Apache service (`httpd.exe`), with its default document root configured at `C:\laragon\www\`.
2. **Missing Folder**: The project codebase, including `3f-api`, is located outside of Laragon's www folder, in `c:\Users\Admin\Downloads\ccc\`. 
3. **Apache 404**: Because Apache could not find the `/3f-api` subdirectory under its root directory, it immediately served a generic Apache 404 response.
4. **CORS Block**: The raw Apache 404 page does not contain standard CORS headers, which caused the browser to raise a CORS error.

---

## 3. Resolution

- **Directory Junction**: Created a native NTFS Directory Junction from `c:\Users\Admin\Downloads\ccc\3f-api` to `C:\laragon\www\3f-api`:
  ```cmd
  mklink /j C:\laragon\www\3f-api c:\Users\Admin\Downloads\ccc\3f-api
  ```
- **Validation**: Verified the routing works perfectly by calling:
  - `curl -i "http://127.0.0.1/3f-api/public/api/customer/points?phone=0901234567"`
  - Response returned a successful HTTP 200 OK along with correct CORS headers and JSON payload.
