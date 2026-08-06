// ...existing code...
# CaptionFlow

CaptionFlow is a full-stack web app that helps users generate, manage, and browse captions for images or social posts. This repository contains both the client (React/Tailwind) and server (Node/Express) projects.

## Features
- Responsive navigation and UI components (Tailwind CSS)
- Authentication (signup / login)
- Caption creation, editing, listing
- Secure API with JWT-based auth
- Designed for easy AI integration (optional OpenAI/other provider)

## Tech Stack
- Client: React, React Router, Tailwind CSS, lucide-react
- Server: Node.js, Express, JWT auth, (MongoDB/Postgres optional)
- Dev tooling: npm, nodemon (server), Vite or CRA (client)

## Repository structure
- /client — React frontend
  - src/components (ex: Navbar.jsx)
  - src/pages
- /server — Express API
  - routes, controllers, models
- README.md

## Prerequisites
- Node.js >= 16, npm
- Database (MongoDB or Postgres) if using persistence
- (Optional) AI provider API key (OpenAI or similar)

## Quickstart (Linux)

1. Clone
   - git clone <repo-url>
   - cd CaptionFlow

2. Run server
   - cd server
   - cp .env.example .env
   - Edit .env with required values
   - npm install
   - npm run dev        # uses nodemon
   - npm start          # production

3. Run client
   - cd ../client
   - cp .env.example .env
   - Edit .env (e.g., REACT_APP_API_URL=http://localhost:4000)
   - npm install
   - npm run dev        # Vite or react-scripts start
   - npm run build      # production

## Environment variables (examples)

Server (.env)
- PORT=4000
- NODE_ENV=development
- DATABASE_URL=mongodb://localhost:27017/captionflow
- JWT_SECRET=your_jwt_secret
- OPENAI_API_KEY=your_openai_key   # optional

Client (.env)
- VITE_API_URL=http://localhost:4000    # for Vite
- REACT_APP_API_URL=http://localhost:4000  # for CRA
- VITE_OPENAI_KEY=...                   # optional for client-side calls (not recommended)

## API (examples)
- POST /api/auth/signup — create user
- POST /api/auth/login — get JWT
- GET /api/captions — list captions (auth)
- POST /api/captions — create caption (auth)
- PUT /api/captions/:id — update (auth)
- DELETE /api/captions/:id — delete (auth)

Adjust routes to match server implementation.

## Testing
- Server: add Jest / Supertest for routes
- Client: add React Testing Library
- Example: from server folder — npm test

## Deployment
- Server: deploy to Heroku/Render/Vercel (serverless) or Docker
- Client: build and host on Netlify/Vercel or serve static build from server
- Ensure environment variables are configured in the host

## Contributing
- Fork -> branch -> PR
- Run linters and tests before submitting
- Keep changes scoped and document breaking changes

## License
- MIT (adjust as needed)

## Contact
- Project: CaptionFlow
- Repository maintained in this workspace.

// ...existing code...