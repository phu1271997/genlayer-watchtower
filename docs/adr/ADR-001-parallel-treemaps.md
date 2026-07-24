# ADR-001: Parallel TreeMaps Over JSON Blobs

## Status
Accepted

## Decision
Store agent and audit state in indexed `TreeMap` fields instead of a serialized JSON blob.

## Why
- avoids unbounded blob rewrites as audit history grows
- supports partial reads and pagination
- keeps storage explicit for future category, appeal, and token extensions
