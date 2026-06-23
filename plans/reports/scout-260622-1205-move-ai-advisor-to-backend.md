# Scout Report: AI Advisor Backend Migration & API Key Configuration

## Executive Summary
This report analyzes the current state of the AI Advisor system, which has encountered recurring 401/403 Groq API errors due to client-side requests and outdated environment variables. The goal is to move the Groq API call logic entirely to the backend, deploy the updated controller and routes, and restore functionality.

## Discoveries & Codebase State
1. **Frontend State**:
   - `components/pet-advisor/groqApi.ts` is corrupted (syntax errors around imports and function bodies).
   - `src/api/customerPetsApi.ts` includes `consultPetAdviceApi` which makes a `POST` request to `/api/customer/pet-advisor/consult`.
2. **Backend State**:
   - `3f-api/app/Controllers/CustomerPetController.php` implements `consult()` which formats system/user prompts and calls `https://api.groq.com/openai/v1/chat/completions` using PHP cURL.
   - `3f-api/public/index.php` registers `/api/customer/pet-advisor/consult` route locally, but this has not been deployed to the remote server `https://trial1506895.mbws.vn`.
3. **API Keys**:
   - The user-provided API key (`gsk_fhCa...`) currently returns 401/403.
   - The fallback/default API key (`gsk_197m...`) in the code is currently functional and returns valid chat completions. We must configure both local and remote envs to use a working key.
