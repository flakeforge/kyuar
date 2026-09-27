# Security policy

## Reporting a vulnerability

Do not open a public issue for a security problem.

Report it privately through GitHub:
[Security → Report a vulnerability](https://github.com/flakeforge/kyuar/security/advisories/new).

Include what you found, how to reproduce it and what an attacker could do with
it. Once a fix is released, the advisory is published with credit to you,
unless you ask otherwise.

## Supported versions

Only the latest release on `main` gets security fixes.

## Scope

In scope:

- `initData` verification and anything that lets one Telegram user act as
  another
- the bot webhook (`/api/bot`) and its secret check
- image handling in `/api/render` and `/api/share`
- rate limit bypasses on `/api/qr`
- leaks of `BOT_TOKEN`, `BOT_WEBHOOK_SECRET` or other configuration

Out of scope: QR codes that point to unsafe sites. kyuar encodes what the user
types and warns about risky links when scanning; it does not block content.
