# PDF fonts

TrueType files embedded in the media-plan PDF (`lib/pdf/plan-pdf.tsx`). The PDF's built-in
fonts have no ₹ glyph, so real fonts are required.

- Inter (Regular, SemiBold) and Space Grotesk (SemiBold), from Google Fonts.
- Licence: SIL Open Font License 1.1 (https://openfontlicense.org), which allows bundling
  and redistribution.

To rebrand, replace these with the new brand's TTFs (keep the file names, or update
`brand/pdf.ts`). Check the font includes U+20B9 (₹).
