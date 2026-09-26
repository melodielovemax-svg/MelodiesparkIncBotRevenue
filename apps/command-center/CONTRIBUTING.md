# Contributing

1. Do not commit secrets, personal documents, bank data, private keys, or production database dumps.
2. Use synthetic fixtures for tests.
3. Keep financial actions disabled by default.
4. Add validation, failure behavior, audit evidence, and tests for every new endpoint.
5. Run `npm test` before opening a change.
6. Do not describe an integration as “live” until its provider credentials, webhook verification, and reconciliation tests are complete.
7. Do not make guaranteed-return, licensing, or regulatory-status claims in product copy.
