# Milestone 2 Consensus Notes

- Primary evidence is now rendered in both text and screenshot modes.
- Historical web archive, wallet explorer, GitHub commits, and social signals are added when metadata is available.
- The prompt requires three internal perspectives plus `confidence`, `evidence_quality`, and `sources_used`.
- Deterministic logic now routes low-confidence high-severity cases to `NEEDS_REVIEW` and caps slash ratio when evidence quality is weak.
