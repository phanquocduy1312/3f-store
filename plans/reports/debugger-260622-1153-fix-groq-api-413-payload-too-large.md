# Debugger Report: Groq API Error 413 & Missing Recommended Products

## Root Cause Analysis
- **Symptom 1: Groq API 413 Error**:
  - AI Pet Advisor Quiz submission fails with `[GROQ API ERROR] Error: Groq API error: 413` at `getPetAdviceFromGroq` in `groqApi.ts`.
  - **Diagnosis**: The chosen model `llama-3.1-8b-instant` has a very low TPM limit on the free tier (**6,000 tokens**). Sending a system prompt + user prompt along with a 30-item catalog exceeded this limit (requested 6,062 tokens).
- **Symptom 2: Missing Recommended Products ("Tổng 0 sản phẩm")**:
  - After bypassing the 413 error, the results modal rendered properly but showed "Tổng 0 sản phẩm" and did not list any recommended products.
  - **Diagnosis**: Products were migrated from `products.json` to a MySQL database/PHP API, leaving the static `ALL_PRODUCTS` array in `data/store.ts` empty (`[]`). Because of this, `getProductById` in `AiResult.tsx` returned `undefined` for all recommended products, filtering them out completely (`if (!product) return null`).

## Actions Taken
- **Model Upgrade & Payload Size Optimization**:
  - Changed default fallback model from decommissioned/low-limit `llama-3.1-8b-instant` to `llama-3.3-70b-versatile` in `components/pet-advisor/groqApi.ts` (has 12,000 TPM limit).
  - Reduced the `limit` of fetched catalog products in `groqApi.ts` from 30 to 20 for single-type flows (cat/dog), and from 15 to 10 for dual flows (reducing token usage by ~40% to ~3,500 - 4,000 tokens).
- **Dynamic Product Rendering**:
  - Updated `groqApi.ts` to map recommended products against the fetched `availableProducts` database list and attach the full product object to `item.product`.
  - Updated `mockAiResult.ts` interface `AiRecommendedProduct` to include `product?: Product | null`.
  - Modified `AiResult.tsx` (`selectedProducts` and `renderProductGroupSection`) to resolve product details from `item.product` dynamically, falling back to `getProductById(item.id)` only if missing.

## Verification & Compilation
- Ran `npx tsc --noEmit` and `npm run build` successfully (zero errors, production bundle compiled cleanly in 7.75s).
- Verified that recommended product cards render correctly with name, image, price, select toggles, and total price calculation.

## Unresolved Questions
- None.
