# CaptionFlow

**Premium AI-powered transcription for audio and video.**

CaptionFlow turns raw media into clean, timestamped transcripts — upload a file, and get back searchable text and export-ready caption formats in minutes. Built as a full-stack SaaS product with a polished dashboard experience on the front end and an async processing pipeline on the back end.

---

## ✨ Features

- 🔐 **Secure authentication** — JWT-based signup/login with protected dashboard routes
- 📁 **Drag-and-drop upload** — client-side file validation and real-time upload progress
- ⚙️ **Async transcription pipeline** — large files are chunked with `ffmpeg` and processed in the background, so uploads never block on processing
- 🗣️ **Powered by Groq Whisper** — fast, accurate speech-to-text with timestamped segments
- 📤 **Multi-format export** — download transcripts as `.txt`, `.srt`, or `.ass`
- 📊 **Live status polling** — track a transcription job from *queued* to *complete* right in the UI
- 🎨 **Custom design system** — hand-tuned Tailwind v4 styling, no boilerplate defaults

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), React Router v6, Tailwind CSS v4, lucide-react |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |
| **Transcription** | Groq Whisper API |
| **Media processing** | ffmpeg |
| **Auth** | JWT |

**Design tokens** (used as Tailwind arbitrary values, no config file):

| Role | Hex |
|---|---|
| Primary | `#7C3AED` |
| Secondary | `#6366F1` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |

---

## 🗺️ How It Works

```
 ┌────────────┐     ┌──────────────┐     ┌────────────────┐     ┌───────────────┐
 │   Upload    │ ──▶ │  Validate &   │ ──▶ │  Chunk with     │ ──▶ │  Transcribe     │
 │   (client)  │     │  create job   │     │  ffmpeg         │     │  via Groq Whisper│
 └────────────┘     └──────────────┘     └────────────────┘     └───────────────┘
                                                                          │
                                                                          ▼
                                                              ┌───────────────────┐
                                                              │  Save transcript,   │
                                                              │  timestamps, status │
                                                              └───────────────────┘
                                                                          │
                                                                          ▼
                                                              ┌───────────────────┐
                                                              │  Poll & download    │
                                                              │  (TXT / SRT / ASS)  │
                                                              └───────────────────┘
```

1. A user uploads a media file through the dashboard.
2. The file is validated and a transcription record is created in MongoDB.
3. A background job splits the media into chunks using `ffmpeg`, avoiding upload size limits.
4. Each chunk is sent to Groq Whisper for transcription.
5. The transcript, timestamped segments, and job status are saved back to the database.
6. The client polls the job and, once complete, offers copy/download in multiple formats.

---

## 📂 Project Structure

```
CaptionFlow/
├── client/                      # Vite + React frontend
│   └── src/
│       ├── components/          # Sidebar, DashboardLayout, ProtectedRoute, GuestRoute, etc.
│       ├── context/              # AuthContext (auth state)
│       ├── pages/                 # Login, Sign Up, Upload, Dashboard views
│       └── services/               # api.js — client-side API layer
│
└── server/                       # Express backend
    ├── controllers/                # transcription.controller.js, user.controller.js
    ├── middleware/                  # auth.middleware.js
    ├── models/                       # transcription.model.js
    ├── routes/                        # auth.routes.js, transcription.routes.js
    ├── services/                       # transcription.service.js (ffmpeg + Groq Whisper)
    └── index.js                         # App entry — Express setup, MongoDB connection
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 16, npm
- MongoDB instance (local or hosted, e.g. Atlas)
- Groq API key (for Whisper transcription)
- `ffmpeg` installed and available on your `PATH`

### Installation

```bash
# clone the repo
git clone <repo-url>
cd CaptionFlow

# install server dependencies
cd server
npm install

# install client dependencies
cd ../client
npm install
```

### Environment Variables

**Server** — create `server/.env`:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/captionflow
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

**Client** — create `client/.env`:

```env
VITE_API_URL=http://localhost:4000
```

### Running Locally

```bash
# start the backend (from /server)
npm run dev      # nodemon, auto-restart
npm start        # production

# start the frontend, in a separate terminal (from /client)
npm run dev      # Vite dev server
npm run build    # production build
```

---

## 📡 API Reference

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Create a new user | — |
| `POST` | `/api/auth/login` | Log in, receive a JWT | — |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `POST` | `/api/transcriptions` | Upload a file & start a transcription job | ✅ |
| `GET` | `/api/transcriptions` | List the user's transcription jobs | ✅ |
| `GET` | `/api/transcriptions/:id` | Get a single job's status/transcript | ✅ |
| `DELETE` | `/api/transcriptions/:id` | Delete a transcription job | ✅ |

> Route names are illustrative — check `server/routes/` for the exact paths as the API evolves.

## 🧪 Testing

- **Server**: add Jest + Supertest for route/controller coverage; run with `npm test` from `server/`
- **Client**: add React Testing Library for component/page coverage
- Prioritize testing the transcription status polling and export logic, since that's the most complex client behavior

## ☁️ Deployment

- **Server**: deploy to Render, Railway, or a Docker container; needs `ffmpeg` available in the runtime image
- **Client**: build with `npm run build` and host on Vercel or Netlify, or serve the static build from the Express server
- Set all environment variables (`MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `VITE_API_URL`) on the hosting platform before deploying

## 🔒 Authentication & Route Protection

- Auth state is managed globally via `AuthContext`.
- `ProtectedRoute` guards dashboard pages, redirecting unauthenticated users.
- `GuestRoute` keeps logged-in users out of the login/signup pages.
- Backend routes are protected with JWT-based middleware, ensuring transcription and user data stay private.

---

## 📤 Export Formats

Transcripts can be downloaded as:

- **TXT** — plain text
- **SRT** — SubRip subtitles, ready for video players
- **ASS** — Advanced SubStation Alpha, for styled captions

---

## 🛣️ Roadmap

- [ ] Transcript Detail/Editor page — inline editing of segments, speakers, and timestamps
- [ ] Speaker diarization
- [ ] Team/workspace support
- [ ] Usage-based billing

---

## 🤝 Contributing

This project is in active development. General flow:

1. Fork the repo and create a feature branch
2. Make your changes, keeping them scoped
3. Run linters/tests before submitting
4. Open a PR with a clear description of what changed and why

Issues and pull requests are welcome once the repository is public.

## 📄 License

MIT (adjust as needed).

## 📬 Contact

Maintained as part of the CaptionFlow project workspace.