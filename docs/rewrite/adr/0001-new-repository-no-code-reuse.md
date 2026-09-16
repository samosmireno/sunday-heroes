# A new repository and no code reuse

The rewrite of Sunday Heroes is a from-scratch rebuild planned in `docs/spec/` (the branch documents). It lives in a new repository, reuses no code from the current one, and reads the current one only for behaviour: no module boundary, table shape, endpoint name or layering carries over. The current repository keeps running until cut-over and is archived afterwards; the one-time data migration job is the only thing that ever reads its database.

## Considered options

Rewriting in place, as a directory or branch of the current repository, would keep the docs, issues and production dumps beside the new code. It was rejected because a clean history, clean CI and the absence of old code to "reuse" are worth more to an agent-driven build than proximity to the old one, and because the spec is copied into the new repository on day one.
