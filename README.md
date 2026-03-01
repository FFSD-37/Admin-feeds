# Feeds Admin

This repository contains:

- Admin Server: Node.js backend for super-control operations
- Admin Client: React.js frontend

## Role Split

- Admin role: full control (users, channels, payments, settings, and manager accounts)
- Manager role: moderation-only role, hosted in `../Manager-feeds`

## Run Admin Server

```bash
cd Feeds-admin
npm install
npm start
```

Default URL: `http://localhost:3000`

## Run Admin Client

```bash
cd Feeds-admin-client
npm install
npm start
```

## Notes

- Copy `.env-example` to `.env` inside `Feeds-admin` and fill values.
- Admin authentication rejects manager accounts.
- Admin APIs now include `/manager/*` endpoints for manager account lifecycle.
- While creating managers, pass `managerType` as one of: `user`, `channel`, `kids`, `revenue`.
- Admin can track manager work via:
  - `GET /manager/list` (includes performance summary)
  - `GET /manager/performance/:id` (detailed action history)
