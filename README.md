# TextGuard V2

TextGuard is an originality workspace focused on evidence-first plagiarism analysis.

## Current V2 capabilities
- Functional plagiarism analysis against a small demo source corpus.
- Phrase and lexical overlap evidence.
- Source-level match cards.
- Internal repeated-sentence detection.
- Clear distinction between checked-source similarity and internet-wide claims.
- TXT upload in the browser.
- Humanizer and paraphraser workspace shells with safe product framing.

## Important
This is not yet a web-scale plagiarism service. A production version needs licensed/indexed source retrieval and a server-side similarity pipeline before presenting broad plagiarism claims.

## Next production layer
Connect source retrieval, document parsing, persistent reports, accounts, billing/usage limits, and an AI provider through a server-side API. Vercel's current AI SDK 7 requires Node.js 22+ and ESM when used. See current Vercel documentation before adding it.
