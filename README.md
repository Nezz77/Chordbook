# Chordroom

A private guitar songbook with a searchable library, chord transposition, saved key choices, a sheet editor, and PDF export.

## Included collection

48 title entries: the user's 30 individually named songs plus 18 verified Channuka release titles and variants. Channuka's listing is a researched starting collection, not a guarantee of an exhaustive discography. The Dangakara Hadakari lyrics and chord positions were transcribed from the image the user supplied. Other entries intentionally await user-supplied sheets; this application does not scrape or redistribute third-party lyrics.

Catalog references: https://www.shazam.com/artist/channuka/1599136249 and https://music.apple.com/us/artist/channuka-devnindu/1475334263

## Use

- Choose a song, then select a key or use the semitone controls. Click Save key to retain the choice.
- Add or edit songs with ChordPro inline chords (`[G]words`) or plain text with chords above lyrics. Import `.txt`, `.cho`, `.pro`, or `.chordpro` sheets.
- Set the starting key to match the original sheet before transposing. Minor and slash-chord suffixes are retained; internal key changes move by the same interval.
- Export a single song or the whole playable collection in the current keys. An optional checklist includes titles still awaiting lyrics.
- Enter Sinhala lyrics in English-letter transliteration. The PDF typography is intended for English-letter song sheets.

## Storage and privacy

Cloudflare D1 stores the personal library, favorites and selected keys. Access is protected by the owner-private Sites hosting policy; there is no second application sign-in. Reads merge the starter collection and all legacy per-user records in update order, preserving pre-update saved songs. New writes use a shared personal-songbook owner key and prepared statements. The site must remain private; making it public would require a separate write-authorization design. Failed saves preserve the editor contents. Add a song opens even during connection delays; the editor shows a retry action when saving is unavailable.

## Development

Use the provided npm scripts. `npm run dev` starts the preview. `npm run db:generate` produces migrations. The Sites build and deployment helpers preserve the hosting setup. The schema is in `db/schema.ts`; generated migrations live in `drizzle/`.

Validation completed: TypeScript check, production build, 300 transposition round trips, seventh/minor/slash-chord examples, two-line chord import, PDF generation and rendered-page inspection, browser transposition and saved-key reload, editor preview, responsive desktop/mobile layouts, and WebMCP valid/invalid inputs.
