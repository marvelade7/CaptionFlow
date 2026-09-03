# CaptionFlow

**Premium AI-powered transcription for audio and video.**

CaptionFlow turns raw media into clean, timestamped transcripts — upload a file, and get back searchable text, export-ready caption formats, and AI-generated summaries in minutes. Built as a full-stack SaaS product with a polished dashboard, role-based admin panel, visitor analytics, and an async processing pipeline.

---

## ✨ Features

- 🔐 **Secure authentication** — JWT-based signup/login, Google Sign-In via Firebase, and "Remember Me" session persistence
- 📁 **Drag-and-drop upload** — client-side validation, real-time upload progress, and Cloudinary media storage
- ⚙️ **Async transcription pipeline** — files are chunked with `ffmpeg` and processed in the background
- 🗣️ **Powered by Groq Whisper** — fast, accurate speech-to-text with timestamped segments
- 🤖 **AI Summaries & Excerpts** — Google Gemini generates summaries and key excerpts from completed transcripts
- 📤 **Multi-format export** — download transcripts as `.txt`, `.srt`, or `.ass`; export AI summaries as PDF
- 📊 **Live status polling** — track a transcription job from *queued* → *processing* → *complete* in the UI
- 👤 **Account management** — update profile, change avatar (Cloudinary), manage settings
- 🛡️ **Admin dashboard** — role-gated panel with user management, transcription oversight, activity logs, error logs, visitor analytics, and audit trails
- 📈 **Visitor analytics** — anonymous session tracking with geo-IP, device/browser detection via `ua-parser-js` and `geoip-lite`
- 📱 **PWA-ready** — installable progressive web app with `vite-plugin-pwa`
- 🚦 **Rate limiting** — `express-rate-limit` protection on admin endpoints

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v7, Tailwind CSS v4 |
| **UI / Charts** | lucide-react, recharts, bootstrap-icons, AOS |
| **Forms** | Formik + Yup |
| **HTTP** | Axios |
| **PDF** | jsPDF |
| **Notifications** | react-hot-toast |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB (Mongoose 9) |
| **Auth** | JWT (`jsonwebtoken`), bcrypt, Firebase Admin SDK |
| **Google Sign-In** | Firebase client SDK |
| **Transcription** | Groq SDK (Whisper) |
| **AI Summaries** | Google Gemini (`@google/genai`) |
| **Media processing** | ffmpeg (via `ffmpeg-static`, `fluent-ffmpeg`) |
| **File storage** | Cloudinary (`multer-storage-cloudinary`) |
| **Analytics** | `geoip-lite`, `ua-parser-js` |
| **Deployment** | Vercel (client), Render (server), MongoDB Atlas |

---

## 🗺️ How It Works

```
┌────────────┐     ┌──────────────┐     ┌────────────────┐     ┌───────────────────┐
│   Upload    │ ──▶ │  Validate &   │ ──▶ │  Chunk with     │ ──▶ │  Transcribe via    │
│   (client)  │     │  create job   │     │  ffmpeg         │     │  Groq Whisper      │
└────────────┘     └──────────────┘     └────────────────┘     └───────────────────┘
                                                                          │
                                                                          ▼
                                                              ┌───────────────────────┐
                                                              │  Save transcript,       │
                                                              │  timestamps, status     │
                                                              └───────────────────────┘
                                                                          │
                                                     ┌────────────────────┴───────────────────┐
                                                     ▼                                        ▼
                                         ┌─────────────────────┐              ┌───────────────────────┐
                                         │  Poll & download     │              │  Generate AI summary   │
                                         │  (TXT / SRT / ASS)  │              │  & excerpts via Gemini │
                                         └─────────────────────┘              └───────────────────────┘
```

1. A user uploads a media file through the dashboard.
2. The server validates, stores the file on Cloudinary, and creates a transcription record in MongoDB.
3. A background job splits the media using `ffmpeg`, then sends chunks to Groq Whisper.
4. The transcript, timestamped segments, and job status are saved back to MongoDB.
5. The client polls the job until complete and offers copy/download in multiple formats.
6. Optionally, the user triggers Gemini to generate an AI summary and excerpts, downloadable as a PDF.

---

## 📂 Project Structure

```
CaptionFlow/
├── client/                          # Vite + React frontend
│   └── src/
│       ├── components/              # Shared UI components
│       │   ├── DashboardLayout.jsx  # Main shell with Sidebar + Topbar
│       │   ├── Sidebar.jsx
│       │   ├── AIModal.jsx          # AI summary viewer/downloader
│       │   ├── AdminRoute.jsx       # Admin role guard
│       │   ├── ProtectedRoute.jsx   # Auth guard
│       │   ├── GuestRoute.jsx       # Redirects logged-in users
│       │   ├── PWAToast.jsx         # PWA install prompt
│       │   ├── RecentJobsTable.jsx
│       │   ├── VelocityChart.jsx    # recharts dashboard chart
│       │   └── ...
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state (JWT + Google)
│       ├── hooks/                   # Custom React hooks
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── SignUpPage.jsx
│       │   ├── Dashboard.jsx        # User overview
│       │   ├── Upload.jsx           # Upload + transcription result + AI summary
│       │   ├── Downloads.jsx        # Download history
│       │   ├── MyFiles.jsx
│       │   ├── Account.jsx          # Profile management
│       │   ├── Settings.jsx
│       │   └── admin/               # Admin-only pages (lazy-loaded)
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminAnalytics.jsx
│       │       ├── AdminUsers.jsx
│       │       ├── AdminUserDetail.jsx
│       │       ├── AdminTranscriptions.jsx
│       │       ├── AdminActivity.jsx
│       │       └── AdminErrors.jsx
│       ├── services/                # Axios API layer
│       ├── utils/
│       └── validations/             # Yup schemas
│
└── server/                          # Express backend
    ├── controllers/
    │   ├── user.controller.js       # Auth, profile, Google sign-in
    │   ├── transcription.controller.js
    │   ├── aiSummary.controller.js  # Gemini summary generation
    │   └── admin.controller.js      # Admin analytics & management
    ├── middleware/
    │   ├── auth.middleware.js       # JWT verification
    │   ├── admin.middleware.js      # Admin role check
    │   └── upload.middleware.js     # Multer + Cloudinary
    ├── models/
    │   ├── user.model.js
    │   ├── transcription.model.js
    │   ├── activityLog.model.js
    │   ├── adminAuditLog.model.js
    │   ├── downloadHistory.model.js
    │   ├── errorLog.model.js
    │   ├── loginHistory.model.js
    │   └── visitorSession.model.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── transcription.routes.js
    │   ├── aiSummary.route.js
    │   ├── admin.routes.js
    │   └── analytics.routes.js
    ├── services/
    │   ├── transcription.service.js # ffmpeg + Groq Whisper pipeline
    │   ├── aiSummary.js             # Gemini integration
    │   ├── analytics.service.js     # MongoDB aggregation pipelines
    │   ├── activity.service.js
    │   └── visitor.service.js       # Geo-IP + UA session tracking
    └── index.js                     # App entry — Express setup, MongoDB
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18, npm
- MongoDB instance (local or Atlas)
- Groq API key — [console.groq.com](https://console.groq.com)
- Google Gemini API key — [aistudio.google.com](https://aistudio.google.com)
- Cloudinary account
- Firebase project (for Google Sign-In + Admin SDK)
- `ffmpeg` installed on your `PATH` (for local dev)

### Installation

```bash
# clone the repo
git clone <repo-url>
cd CaptionFlow

# install server dependencies
cd server && npm install

# install client dependencies
cd ../client && npm install
```

### Environment Variables

Copy the example files and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

See [server/.env.example](./server/.env.example) and [client/.env.example](./client/.env.example) for all required variables with descriptions.

### Running Locally

```bash
# Terminal 1 — start the backend (from /server)
node index.js
# or with auto-restart via nodemon (if installed globally):
nodemon index.js

# Terminal 2 — start the frontend (from /client)
npm run dev
```

The API will be available at `http://localhost:5050` and the client at `http://localhost:5173` by default.

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | — |
| `POST` | `/api/auth/login` | Log in, receive a JWT | — |
| `POST` | `/api/auth/google` | Sign in / register with Google (Firebase) | — |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `GET` | `/api/auth/users` | List all users | ✅ |
| `GET` | `/api/auth/users/:id` | Get a user by ID | ✅ |
| `PATCH` | `/api/auth/users/:id` | Update user profile | ✅ |
| `PATCH` | `/api/auth/users/:id/profile-picture` | Upload a new profile picture | ✅ |

### Transcriptions — `/api/transcriptions`

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/transcriptions/upload` | Upload a file & start a transcription job | ✅ |
| `GET` | `/api/transcriptions` | List the user's transcription jobs | ✅ |
| `GET` | `/api/transcriptions/:id` | Get a single job's status & transcript | ✅ |
| `PATCH` | `/api/transcriptions/:id/status` | Update a job's status | ✅ |
| `POST` | `/api/transcriptions/:id/download` | Track a download event | ✅ |

### AI Summaries — `/api/ai-summary`

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/ai-summary/:jobId/generate-summary` | Generate AI summary & excerpts via Gemini | ✅ |
| `GET` | `/api/ai-summary/:jobId/download/summary` | Download summary as PDF | ✅ |
| `GET` | `/api/ai-summary/:jobId/download/excerpts` | Download excerpts as PDF | ✅ |

### Analytics — `/api/analytics`

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/analytics/visit` | Track an anonymous visitor session | — |

### Admin — `/api/admin` *(admin role required)*

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Overview metrics |
| `GET` | `/api/admin/analytics` | Aggregated analytics |
| `GET` | `/api/admin/users` | All users |
| `GET` | `/api/admin/users/:id` | User detail |
| `GET` | `/api/admin/transcriptions` | All transcription jobs |
| `GET` | `/api/admin/logins` | Login history |
| `GET` | `/api/admin/activity` | Activity log |
| `GET` | `/api/admin/downloads` | Download history |
| `GET` | `/api/admin/visitors` | Visitor sessions |
| `GET` | `/api/admin/errors` | Error log |
| `GET` | `/api/admin/audit-logs` | Admin audit trail |

> All admin routes require both JWT authentication and an `admin` role. A rate limit of 100 requests per 15 minutes applies per IP.

---

## 🔒 Authentication & Route Protection

- Auth state is managed globally via `AuthContext` (supports both JWT and Google Sign-In).
- **"Remember Me"** stores the token in `localStorage` for 30-day persistence; unchecked sessions use `sessionStorage`.
- `ProtectedRoute` guards all dashboard pages, redirecting unauthenticated users to `/login`.
- `GuestRoute` prevents logged-in users from accessing `/login` and `/signup`.
- `AdminRoute` checks the user's role; non-admin users are redirected.
- Backend routes are protected with JWT middleware (`auth.middleware.js`) and an admin role guard (`admin.middleware.js`).

---

## 📤 Export Formats

| Format | Description |
|---|---|
| **TXT** | Plain text transcript |
| **SRT** | SubRip subtitles — ready for most video players |
| **ASS** | Advanced SubStation Alpha — styled captions |
| **PDF** | AI-generated summary and key excerpts (via jsPDF) |

---

## ☁️ Deployment

| Service | Platform |
|---|---|
| **Client** | [Vercel](https://vercel.com) — `npm run build`, rewrites configured in `vercel.json` |
| **Server** | [Render](https://render.com) — Node.js service, ffmpeg available via `ffmpeg-static` |
| **Database** | MongoDB Atlas |
| **Media** | Cloudinary |

Set all environment variables on your hosting platform before deploying. Refer to the `.env.example` files for the full list.

---

## 🛣️ Roadmap

- [ ] Email verification & password reset
- [ ] Transcript editor — inline segment editing with speaker labels
- [ ] Speaker diarization
- [ ] Multiple language transcription & translation
- [ ] Team / workspace support
- [ ] Stripe subscriptions & usage-based billing
- [ ] Public API & webhooks

---

## 🤝 Contributing

This project is in active development. General flow:

1. Fork the repo and create a feature branch
2. Make your changes, keeping them scoped to one concern
3. Run linters before submitting (`npm run lint` from `client/`)
4. Open a PR with a clear description of what changed and why

Issues and pull requests are welcome once the repository is public.

---

## 📄 License

MIT

---

## 📬 Contact

Maintained as part of the CaptionFlow project workspace.