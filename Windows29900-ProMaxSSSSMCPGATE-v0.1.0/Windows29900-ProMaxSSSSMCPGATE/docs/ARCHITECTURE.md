# Architecture
## MCPGATE
AI request -> identity -> capability check -> policy -> sandbox -> approval -> execution -> audit -> result.

Default posture is deny. No unrestricted shell, filesystem, credential, boot, or security-policy access.
Windows compatibility is a future test target and is never inferred from UI similarity.
