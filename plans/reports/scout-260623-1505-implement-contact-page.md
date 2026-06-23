# Scout Report: Contact Page Implementation Context

Scouted the frontend and backend codebase to determine files to create and modify for the Contact page feature.

## Key Files Found & Checked

1. **Backend Autoloader & Routes**:
   - [index.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/public/index.php): Core router and database model instantiations. Need to register `/api/contact` route and instantiate `ContactMessage` model.
   - [Request.php](file:///c:/Users/Admin/Downloads/ccc/3f-api/app/Core/Request.php): Handles standard HTTP requests and JSON payload reading.

2. **Frontend Routing**:
   - [App.tsx](file:///c:/Users/Admin/Downloads/ccc/src/App.tsx): Registers routes `/contact` and `/lien-he`.

3. **Frontend Menus**:
   - [Header.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Header.tsx): Needs a "Liên hệ" link pointing to `/contact` (can be mapped in `navigationData`).
   - [Footer.tsx](file:///c:/Users/Admin/Downloads/ccc/components/Footer.tsx): Needs a "Liên hệ" footer column link mapping to `/contact`.

4. **New Files Needed**:
   - **Backend**:
     - `3f-api/app/Models/ContactMessage.php`: Auto-creates `contact_messages` table and handles insertions.
     - `3f-api/app/Controllers/ContactController.php`: Handles API route `POST /api/contact`, performs validation, and runs basic anti-spam (Honeypot + rate limits/sanitization).
   - **Frontend**:
     - `src/pages/ContactPage.tsx`: Main page wrapper.
     - `components/contact/ContactHero.tsx`: Page hero banner.
     - `components/contact/ContactQuickCards.tsx`: Top details cards (Phone, Mail, Address, Shopee).
     - `components/contact/ContactForm.tsx`: Anti-double-submit validated contact form.
     - `components/contact/ContactLocation.tsx`: Address and Google Maps container.
     - `components/contact/ContactFaq.tsx`: Accordion/grid listing the 5 pet FAQs.
     - `components/contact/ContactCTA.tsx`: Bottom call to action.
