# Flick Media | Intake Engine & Applicant Operations Hub

A custom production software platform engineered for **Flick Media** and indie creators to create custom forms, collect applications without Google permissions barriers, and manage talent pipelines in real-time.

---

## 🌐 Custom Subdomain Architecture (`buildwithrex.me`)

The platform is configured with Next.js multi-zone / subdomain middleware:

| Role | Domain / Route | Target |
|---|---|---|
| **Public Forms** | `https://forms.buildwithrex.me/{hash}` | Directly renders the public submission form (e.g. `forms.buildwithrex.me/flk2026`) |
| **Admin Control Panel** | `https://panel.buildwithrex.me/` | Call Sheet Data Grid, Kanban Pipeline, Form Architect, CSV Export |
| **Local Development** | `http://localhost:3000/f/{hash}` | Local testing fallback |

### DNS Setup (in Cloudflare / Namecheap / Hostinger for `buildwithrex.me`):
Point both CNAME records to your Vercel or server deployment:
- `forms.buildwithrex.me` ➔ `cname.vercel-dns.com` (or server IP)
- `panel.buildwithrex.me` ➔ `cname.vercel-dns.com` (or server IP)

The Next.js `middleware.ts` automatically detects the subdomain and routes requests accordingly.

---

## 🚀 Key Features

1. **Custom Form URL Hashes**:
   - Each form has an assigned short hash (e.g., `flk2026`, `x8k2m9`).
   - Accessible at `forms.buildwithrex.me/{hash}`.
2. **Instant QR Code Generator**:
   - 1-click **Download High-Res QR PNG** for flyers, Instagram stories, casting calls, and print.
3. **HTML Embed Snippet**:
   - Copy responsive `<iframe>` code to embed any form directly inside your website or portfolio.
4. **Flick Media Production Tracker**:
   - Pre-loaded with the exact 18 fields from your Google Sheet.
   - Live embedded **Spotify** (`open.spotify.com/track/...`) and **YouTube** player preview.
   - 1-click **WhatsApp Pitch Bridge** (`wa.me/...`) with pre-composed messages.
   - High-density **Production Call Sheet** & **Kanban Casting Pipeline**.
   - 1-click **CSV / Excel Export**.
5. **Form Architect**:
   - Add/configure 10+ field types (Text, Textarea, Dropdowns, Checkboxes, WhatsApp, Date, Number).
   - Test in real-time using Desktop or iPhone/Mobile Device Viewport frames.

---

## 🏃 Running Locally

```bash
npm run dev
# or for production server:
npm run build
npm run start
```
Visit:
- Admin Panel: `http://localhost:3000`
- Public Form: `http://localhost:3000/f/flk2026`
