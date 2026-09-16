# A SPA and a typed RPC router are the contract

The client is a Vite React single-page app; the server is one Node process hosting a tRPC router. The router is the contract: the client imports its types and gets typed hooks and query keys, so a change on the server is a type error on the client in the same commit. There is no OpenAPI document, no generated client and no package of shared interfaces. The `domain` package shares pure code (value rules, the completion checks, the refusal reasons, derivations) but never the request and response shapes.

## Considered options

A full-stack React framework with server functions was rejected because every screen is behind sign-in, so server rendering buys nothing, and the worker, the webhooks and the deploy target would take the framework's shape. A schema-first contract (OpenAPI plus codegen) and oRPC were rejected because no non-TypeScript consumer exists and the codegen step is the current shared-types workaround in another form. If a native app or a third party ever needs a contract, the router is exposed then.
