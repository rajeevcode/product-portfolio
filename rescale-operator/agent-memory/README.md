# Agent Memory & RAG

**Status:** Shipped — enable `NEXT_PUBLIC_AGENT_MEMORY` for dedicated UI capture.

## Vector database

**Supermemory** (managed semantic memory service) — `POST /v3/documents` (ingest) and `POST /v3/search` (vector retrieval with similarity scores).

**Not** Supabase pgvector. Supabase Postgres holds relational operator data (runs, snapshots, events, approvals).

## RAG pipeline (from codebase)

1. `supermemory_ingest.py` — scrub secrets, metadata schema, idempotent ingest
2. `supermemory_search.py` — `MemoryQuery` → filters + semantic search → citations
3. `rag_context_provider.py` — `RagContext` with confidence, gated by `AGENT_RAG_ENABLED`
4. `agent_orchestrator.py` — live dashboard + RAG → Claude/Hermes → evidence (read-only)

## API

`POST /api/agents/query` with Redis-backed task registry (multi-worker safe).
