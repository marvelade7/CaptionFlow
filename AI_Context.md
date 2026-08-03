# CaptionFlow AI Context

## Project Overview

CaptionFlow is a full-stack web application that converts uploaded audio and video files into transcripts and subtitle formats.

Users upload a media file, the backend stores it in Cloudinary, a Python transcription service processes the media using Faster Whisper, and the resulting transcript is stored in MongoDB. Users can then download the transcript in TXT, SRT, or ASS formats.

---

# Primary Goal

Build a fast, clean, scalable, and production-ready transcription platform.

The application should be modular, maintainable, and easy to extend.

---

# Tech Stack

## Frontend

- React
- Vite
- React Router
- Axios
- Bootstrap
- React Icons

## Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Nodemailer
- Cloudinary
- Multer

## AI Service

- Python
- Faster Whisper

---

# Architecture

Frontend

↓

Node.js API

↓

Cloudinary (Stores Original Files)

↓

Python Transcription Service

↓

MongoDB (Stores Transcript + Metadata)

↓

Frontend

---

# Storage Rules

Cloudinary stores only the original uploaded file.

MongoDB stores:

- transcript
- language
- file metadata
- Cloudinary URL
- processing status

The transcript is the source used to generate:

- TXT
- SRT
- ASS

Never store generated subtitle files permanently.

Generate them only when requested.

---

# User Flow

Register

↓

Login

↓

Upload File

↓

Validation

↓

Upload to Cloudinary

↓

Create MongoDB Record

↓

Status = Uploaded

↓

Python Processes File

↓

Status = Processing

↓

Transcript Saved

↓

Status = Completed

↓

User Downloads Transcript

---

# Processing Status

Possible statuses:

uploaded

queued

processing

completed

failed

Always update the database status instead of relying on frontend state.

---

# Authentication

JWT Authentication

Protected Routes

Email Verification

Forgot Password

Reset Password

Passwords must always be hashed.

Never store plain passwords.

---

# Database Collections

## User

- firstName
- lastName
- username
- email
- password
- isVerified
- subscription
- createdAt

---

## Transcription

- userId
- originalFileName
- cloudinaryUrl
- duration
- fileSize
- language
- transcript
- status
- processingTime
- errorMessage
- expiresAt
- createdAt

---

# Validation Rules

Maximum Duration

10 minutes

Maximum File Size

200 MB

Supported Formats

Audio

- mp3
- wav
- m4a
- flac

Video

- mp4
- mov
- mkv
- webm

Validate duration and size separately.

---

# Cleanup

Uploaded files expire after 14 days.

Daily cleanup should:

Delete Cloudinary file

Delete transcript

Delete database record

---

# Backend Folder Structure

backend/

controllers/

models/

routes/

middlewares/

services/

utils/

config/

jobs/

uploads/

---

# Frontend Pages

Landing Page

Register

Login

Forgot Password

Dashboard

Upload

History

Settings

Profile

---

# API Endpoints

POST /auth/register

POST /auth/login

POST /auth/verify-email

POST /auth/forgot-password

POST /auth/reset-password

POST /upload

GET /transcriptions

GET /transcription/:id

DELETE /transcription/:id

GET /download/:id/txt

GET /download/:id/srt

GET /download/:id/ass

---

# Coding Style

Use JavaScript (ES6).

Use CommonJS on the backend unless otherwise specified.

Use .then() and .catch() instead of async/await.

Keep controllers thin.

Move business logic into services.

Create reusable utility functions.

Always validate incoming data.

Return consistent JSON responses.

Use meaningful variable names.

Prefer small reusable functions.

---

# Error Response Format

{
  "success": false,
  "message": "Description of the error"
}

---

# Success Response Format

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

---

# Development Principles

Build scalable code.

Avoid duplicated logic.

Prefer reusable components.

Separate concerns.

Keep API responses consistent.

Write production-ready code.

---

# AI Assistant Instructions

When generating code:

- Follow the existing folder structure.
- Do not rewrite unrelated files.
- Maintain consistent naming conventions.
- Explain significant architectural decisions.
- Suggest improvements when appropriate.
- Preserve existing functionality unless asked to change it.

When modifying code:

- Change only the requested parts.
- Do not introduce breaking changes.
- Keep responses concise and practical.
- Ensure new code integrates with the current project.

When creating new features:

- Consider scalability.
- Reuse existing services and utilities.
- Keep authentication and validation consistent.
- Write clean, maintainable code.