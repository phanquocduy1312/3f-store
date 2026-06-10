# Scout Report: Add 3F Club Flow Section

## 1. Target Files Identified
- `components/threeFclup.tsx` — Main component for the 3F Club page/section containing the hero header, Shopee form section, Tier Cards grid, and benefit list.

## 2. Code Analysis & Placement
- The Shopee Form component is located at lines 591–661 inside the left column of the main grid.
- The Tier Cards grid is located at lines 663–679, directly below the form.
- The new flow section should be placed between the Shopee Form and the Tier Cards grid.
- It will be styled as a horizontal card matching the theme (`bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 rounded-3xl p-6`).

## 3. Asset Analysis
The required images are available under the `/public/assets/images/` directory:
- `/assets/images/note.png`
- `/assets/images/search.png`
- `/assets/images/coin.png`
- `/assets/images/mail.png`

These can be mapped and rendered as standard `img` tags or through the `AssetOrIcon` component defined in `components/threeFclup.tsx`.
