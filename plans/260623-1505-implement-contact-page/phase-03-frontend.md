# Phase 3: Page and Sub-components Implementation

## Context Links
- [globals.css](file:///c:/Users/Admin/Downloads/ccc/src/globals.css)

## Requirements
- Maintain code modularity (ensure all files are `< 200` lines of code).
- Build the page with 8 specific sections:
  1. `ContactHero.tsx`: Title, subtitle, quick CTA.
  2. `ContactQuickCards.tsx`: Information items (Phone, Email, Address, Shopee).
  3. `ContactForm.tsx`: Anti-double-submit contact form. Gathers inputs, validates client-side, post to `/api/contact`, displays error messages or success banner.
  4. `ContactLocation.tsx`: Embeds Google Maps searching.
  5. `ContactFaq.tsx`: Displays 5 pet shop FAQs.
  6. `ContactCTA.tsx`: Bottom call to action.
- Place all components under `components/contact/` folder.
- Create `src/pages/ContactPage.tsx` page file.

## Todo List
- [ ] Implement `ContactHero.tsx`
- [ ] Implement `ContactQuickCards.tsx`
- [ ] Implement `ContactForm.tsx`
- [ ] Implement `ContactLocation.tsx`
- [ ] Implement `ContactFaq.tsx`
- [ ] Implement `ContactCTA.tsx`
- [ ] Implement `ContactPage.tsx` page file

## Success Criteria
- Fully responsive on desktop and mobile.
- Form handles submitting state correctly.
