# Technical Research: AI Pet Advisor Popup Architecture

**Date**: 2026-06-10  
**Type**: Researcher (Technical Research / Solution Analysis)

## 1. Architectural Strategy
To keep files under 200 lines and preserve code quality, we will implement a modular structure inside `components/pet-advisor/`.

### State Machine Definition
The main state in `PetAdvisorPopup` will coordinate:
- `status`: `'welcome' | 'quiz' | 'contact' | 'loading' | 'result'`
- `petType`: `'dog' | 'cat' | 'both' | null`
- `currentStepIndex`: index pointing to active question in `quizConfig.ts`
- `answers`: dictionary of answer values keyed by question ID (e.g. `{ age_group: 'under_6_months' }`)
- `customer`: `{ name: string, phone: string, email: string }`
- `aiResult`: output object from mock AI result generation

### Configuration-Driven Form
Questions are stored as static structures inside `quizConfig.ts`:
- `id`: unique string matching backend requirements
- `question`: label to render
- `options`: array of choices containing `{ label, value }`
- Support for conditional fields (e.g., custom text input when `breed === 'other'`)

## 2. Responsive Bottom Sheets & CSS
- **Desktop**: Centered overlays `max-w-[520px] w-full bg-white shadow-2xl rounded-3xl p-6`.
- **Mobile**: Fixed bottom sheets starting from `bottom-0 left-0 right-0 w-full rounded-t-3xl max-h-[90vh] overflow-y-auto`.
- Animations will use `framer-motion` for slide-up and fade transitions.

## 3. LocalStorage Logic
We will implement checks for popup visibility:
- `pet_popup_closed_at`: set to `Date.now()` on close; prevents display for 24 hours.
- `pet_quiz_submitted_at`: set to `Date.now()` on lead submission; prevents display for 30 days.
- Floating helper button will display if the popup is closed, allowing users to explicitly launch the quiz.
