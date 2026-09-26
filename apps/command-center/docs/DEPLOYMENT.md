# Deployment guide

## Local PowerShell

```powershell
.\Start-Melodiespark.ps1 -Initialize -SetPassword -Open
```

The server binds to `127.0.0.1` by default. Do not expose it directly to the internet.

## Docker Compose

```powershell
docker compose up --build
```

Compose mounts a local data directory and passes `.env` to the container. It is a development topology, not a regulated production deployment.

## Managed cloud pattern

A reviewed deployment can use:

- Node.js 22.5+ containers behind an HTTPS reverse proxy/load balancer;
- managed PostgreSQL with encrypted backups and point-in-time recovery;
- Redis or a managed queue for asynchronous jobs;
- a secret manager such as AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, or Vault;
- object storage for exports and audit archives;
- centralized logs/metrics with alerting;
- private networking between API, database, and workers;
- separate webhook ingress with signature validation and replay protection.

AWS, GCP, and Azure each provide these primitives, but selecting a region, regulated-data boundary, processor, or vendor requires a real compliance and legal review.

## Production gates

- [ ] Qualified legal counsel reviewed the actual business model and jurisdiction.
- [ ] Required corporate, tax, privacy, gaming, securities, and money-services registrations are verified independently.
- [ ] MFA and a real identity provider are enabled.
- [ ] No demo mode or sample ledger is shown to customers.
- [ ] All secrets are rotated and stored outside source control.
- [ ] HTTPS, secure cookies, trusted proxy configuration, and webhook replay protection are tested.
- [ ] PostgreSQL migrations, backups, restore test, and retention policy are complete.
- [ ] KYC/AML, sanctions, fraud, tax, and dispute workflows are implemented where applicable.
- [ ] Financial actions have dual control, limits, reconciliation, cancellation, and independent review.
- [ ] Smart contracts, if any, are independently audited and funded only after legal approval.
- [ ] Incident response and security contact are published.

## Rollback

Keep migrations reversible, retain an immutable release identifier, and never deploy a financial action and a data-model change in the same uncontrolled step. A failed sync should leave the last verified ledger visible and create an alert; it should not fabricate a replacement balance.
