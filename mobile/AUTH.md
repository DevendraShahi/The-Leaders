# Backend admin login

Settings → Admin sign in opens the shared email/password form at `/admin-auth`.
It calls `POST /api/v1/auth/login` on the configured The Leaders backend, which
checks the existing Admin password hash and active status. These are the same
password records used by the previous website email/password login. No Clerk
instance or external browser is involved in mobile authentication.

The backend issues a 12-hour signed session scoped to the mobile account API.
`GET /api/v1/auth/me` verifies its signature, audience, issuer and expiry, then
rechecks the current Admin record. Disabled/deleted accounts and password changes
invalidate access. Login has IP and account rate limits and never returns a hash.

Native sessions are stored with SecureStore; web-preview sessions use tab-scoped
sessionStorage. Passwords remain only in the form's memory and are cleared after
successful login. Session storage is isolated by API origin. Sign-out and rejected
sessions hide cached Studio access; readers never need to sign in.

Local development: the ignored mobile `.env.local` points to the backend on port
3001. The server's signing secret stays in the root `.env.local` and is never put
in the mobile bundle. For releases, configure a public HTTPS API origin and a
stable backend signing secret. The website's existing Clerk migration is unchanged.
No cloud build was started.

Checks: `npm run check` and `npm run test:auth` cover transport, successful password
verification, rejection of bad credentials, session validation, account status,
password changes, expiry, tampering, audience separation and sign-out access.
