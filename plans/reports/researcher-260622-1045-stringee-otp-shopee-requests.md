# Researcher Report: Stringee SMS API Integration & Security

## 1. Stringee SMS REST API
- **Endpoint**: `https://api.stringee.com/v1/sms` (POST request, JSON format).
- **Request Headers**:
  - `Content-Type: application/json`
  - `X-STRINGEE-AUTH: <JWT_ACCESS_TOKEN>`

## 2. JWT Access Token Authentication
The Access Token is a HS256-signed JSON Web Token with:
- **Header**:
  ```json
  {
    "typ": "JWT",
    "alg": "HS256",
    "cty": "stringee-api;v=1"
  }
  ```
- **Payload**:
  ```json
  {
    "jti": "YOUR_STRINGEE_SID-TIMESTAMP",
    "iss": "YOUR_STRINGEE_SID",
    "exp": TIMESTAMP_EXPIRE,
    "rest_api": true
  }
  ```
- **Signature**: `HMACSHA256(base64Url(header) + "." + base64Url(payload), STRINGEE_SECRET)`

## 3. Payload Format for SMS
```json
{
  "sms": [
    {
      "from": "YOUR_BRANDNAME",
      "to": "84909913889",
      "text": "Ma OTP 3F Store cua ban la: 123456. Hieu luc trong 5 phut."
    }
  ]
}
```

## 4. Integration & Security Strategy
- **Phone Number Normalization**: Converts local `0xxxxxxxxx` to Stringee-compliant `84xxxxxxxxx`.
- **Key Security**: Stringee API keys are read strictly from `.env`. Missing keys trigger `"Chưa cấu hình Stringee OTP."` error.
- **Mock Protection**: Mock provider is blocked if `APP_ENV=production`.
- **Purpose Separation**: Strict isolation using `shopee_point_request` purpose.
- **Single-Use OTP Token**: The generated verification token is sent in the Shopee point request creation payload, checked against database logs, and immediately consumed to prevent reuse.
- **Plaintext Logging**: Plaintext OTP codes are never logged to `otp_send_logs` or system output in production.
