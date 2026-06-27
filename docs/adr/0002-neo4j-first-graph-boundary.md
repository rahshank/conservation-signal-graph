# ADR 0002: Neo4j First Graph Boundary

## Decision
Use Neo4j as the named graph boundary for the project, with an in-memory fallback for local development and static UI checks.

## Reason
The project needs recognizable graph semantics: nodes, relationships, evidence, confidence, and traversable questions. Neo4j gives the prototype a serious graph-database layer while memory mode keeps the local loop usable.

## Consequences
- The graph repository exposes the same interface for Neo4j and memory mode.
- The UI always shows graph state.
- Neo4j-specific work can expand without rewriting the app.

## Change log
- 2026-06-27: Recorded the graph boundary decision.
