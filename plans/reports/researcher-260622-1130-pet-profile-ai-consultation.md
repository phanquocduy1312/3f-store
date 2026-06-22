# Technical Research Report: Pet Profile as AI Consultation History

## Context
Redesigning the Pet Profile section so that pet records are created/consulted via the AI Pet Advisor quiz, and their AI advice is stored as a historical log.

## Schema Alteration
Table `customer_pets` lacks a column to hold the AI consultation result.
- We will add `ai_result` TEXT NULL to `customer_pets` table.
- This will store the stringified JSON response of the AI advice.

## Data Flow
1. User clicks "Thêm thú cưng" in `PetsPage.tsx` -> triggers `open-pet-advisor` event.
2. AI Pet Advisor quiz popups opens -> user enters pet info and receives AI advice from Groq.
3. Upon completion, if logged in, `PetAdvisorPopup.tsx` invokes `createPetApi()` with:
   - `name`: customer.petName
   - `species`: activeFlow || petType
   - `breed`: breed
   - `healthNotes`: problem_text
   - `favoriteFood`: current_food
   - `aiResult`: JSON.stringify(aiResultData)
4. Database saves record. `PetsPage.tsx` automatically refreshes.
5. Each card in `PetsPage.tsx` displays the advice summary and has a "Chi tiết tư vấn AI" button to show the full recommendations, budget analysis, and matching products in a modal.
