# technoVIT'26

The official web platform for **technoVIT'26**, VIT Chennai's premier Annual Tech Fest. Built with Next.js, GSAP, and a whole lot of green terminal energy.

## Getting Started

This project is built using the modern React stack with [Next.js](https://nextjs.org/) and uses `pnpm` for blazing-fast package management.

### Prerequisites

Make sure you have Node.js and `pnpm` installed on your machine.

### Installation & Running Locally

1. Install all required dependencies:

   ```bash
   pnpm install
   ```

2. Start the local development server:

   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to experience the site.

### Environment Variables

The public site runs without any configuration. The **TechnoVIT registration flow** (login, event listing, registrations, profile) talks to a Cloudflare Worker backed by a **D1** database, and that integration needs a few secrets.

Create a `.env.local` file in the project root. It is git-ignored (`.env*`), so every developer and every deployment keeps its own copy — get the real values from the team.

| Variable | Needed for | Description |
| --- | --- | --- |
| `D1_WORKER_URL` | events, login, registration, profile | Base URL of the Cloudflare Worker that proxies the D1 database. A trailing slash is fine — it's stripped. |
| `D1_WORKER_SECRET` | same as above | Shared secret sent to the Worker as `Authorization: Bearer <secret>`. |
| `TECHNOVIT_CRED_KEY` | login, registration | Base64-encoded **32-byte** key used for AES-256-GCM encryption of the user's portal credentials before they're stored in the session cookie. |

```bash
# .env.local
D1_WORKER_URL=https://your-worker.example.workers.dev
D1_WORKER_SECRET=your-shared-secret
TECHNOVIT_CRED_KEY=base64-encoded-32-byte-key
```

Generate a fresh `TECHNOVIT_CRED_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Graceful degradation: if `D1_WORKER_URL` / `D1_WORKER_SECRET` are missing the D1 client is a no-op and the registration features are simply unavailable; if `TECHNOVIT_CRED_KEY` is missing or not exactly 32 bytes, credential encryption is disabled and login won't persist. Restart `pnpm dev` after editing `.env.local`.

### Build for Production

To create an optimized production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## License & Copyright

**Proprietary and Confidential.**

While we heavily appreciate and support the open-source community, this specific repository and its source code are **proprietary to VIT Chennai**. The code, interface designs, animations, and layouts contained within cannot be reproduced, distributed, or modified without explicit permission.

All digital assets, branding, logos, and related intellectual property are strictly copyrighted by their respective authors and **VIT Chennai**. None of these assets may be used, reproduced, or transmitted in any form unless explicitly authorized and provided by VIT Chennai, VIT University, and/or its official governing bodies.

© 2026 VIT Chennai. All rights reserved.
