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

Cloudflare D1 stores per-user overrides, new songs, favorites and selected keys. The initial collection is combined with these overrides when loading. A composite owner/song key isolates records. All writes require the platform-provided signed-in identity and use prepared statements. Failed saves preserve the editor's contents. The deployed site is private by default.

## Development

Use the provided npm scripts. `npm run dev` starts the preview. `npm run db:generate` produces migrations. The Sites build and deployment helpers preserve the hosting setup. The schema is in `db/schema.ts`; generated migrations live in `drizzle/`.

Validation completed: TypeScript check, production build, 300 transposition round trips, seventh/minor/slash-chord examples, two-line chord import, PDF generation and rendered-page inspection, browser transposition and saved-key reload, editor preview, responsive desktop/mobile layouts, and WebMCP valid/invalid inputs.
