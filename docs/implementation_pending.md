# AversA Frontend Implementation Tracking Checklist

This document tracks client-side user interface, state management, and API integrations in the **`frontend`** repository.

> **Rule & Strict Scope**: This document **STRICTLY AND ONLY** tracks tasks, APIs, data contracts, and events that are **already implemented and live in `backend` (or `ai-backend`)**, but are **not yet integrated / implemented in `frontend`**. Speculative features, future backend roadmaps, or purely frontend visual redesigns without a backing backend capability must never be added.

---

## 📌 Pending Frontend Implementations (Backend Ready & Live)

### 1. Real-Time Server-Sent Events (SSE) Stream Integration (`GET /api/projects/:id/events`)
- **Backend Capability Live**:
  - Route: `GET /api/projects/:id/events` (protected, authorized for all internal roles: managers, sales, developers, designers, QA, DevOps).
  - Stream headers: `text/event-stream`, `Connection: keep-alive`, `X-Accel-Buffering: no`.
  - Heartbeat: Sends `: keep-alive\n\n` comments every 25 seconds.
  - Events Broadcast:
    - `transcript.analysis.started`: `{ transcriptId, projectId, status: "running", startedAt }`
    - `transcript.analysis.completed`: `{ transcriptId, projectId, status: "ready", itemsSaved, followUpsSaved }`
    - `transcript.analysis.failed`: `{ transcriptId, projectId, status: "failed", error }`
    - `suggestions.started`: `{ projectId, status: "running", startedAt }`
    - `suggestions.completed`: `{ projectId, status: "ready", validAdds, validMarks, briefTooThin }`
    - `suggestions.failed`: `{ projectId, status: "failed", error }`
- **Pending Frontend Tasks**:
  - [ ] **1.1. Create `useProjectSSE(projectId)` Hook**:
    - Connect to `GET /api/projects/:id/events` via native `EventSource` (with `withCredentials: true` / cookies).
    - Handle reconnect on tab resume or network drop with exponential backoff.
  - [ ] **1.2. Wire Real-Time State Invalidation (Zero Page Refresh Needed)**:
    - On `transcript.analysis.started`: Set local transcript card `analysisStatus = "running"` and activate pulse animation.
    - On `transcript.analysis.completed`: Set `analysisStatus = "ready"`, invalidate queries for extracted items (`/api/transcripts/:id/items`) and follow-ups (`/api/projects/:id/questions`), show completion toast.
    - On `transcript.analysis.failed`: Set `analysisStatus = "failed"` and render retry action button.
    - On `suggestions.started`: Set project `suggestionStatus = "running"`.
    - On `suggestions.completed`: Set project `suggestionStatus = "ready"`, invalidate questions query to display newly generated questions and skipped recommendations in real-time.
    - On `suggestions.failed`: Set project `suggestionStatus = "failed"`, show actionable error alert.

---

### 2. Unified Multi-Entity Keyword Search UI (`GET /api/projects/:id/search?keyword=...`)
- **Backend Capability Live**:
  - Route: `GET /api/projects/:id/search?keyword=...` (in `backend/src/routes/project.route.ts`).
  - Search Scope: Performs case-insensitive matching across **Meetings** (`title`, `description`, `notes`), **Project Questions** (`text`, `answerText`), and **Transcripts** (`name`, `sourceFormat`).
  - API Client Ready: `searchProjectByKeyword(projectId, keyword)` in `frontend/src/features/project/project.js`.
- **Pending Frontend Tasks**:
  - [ ] **2.1. Project Workspace Search Bar**:
    - Add search input in `ProjectHeader.jsx` or top navigation of `projects/[projectId]/page.js`.
  - [ ] **2.2. Search Results Drawer / Dropdown**:
    - Render unified search results grouped by category: **Meetings**, **Questions & Answers**, and **Transcripts**.
    - Show highlighted text snippets and timestamp/date badges.
    - Implement 1-click jump links that switch tabs and focus on the matched entity.

---

### 3. Participant Profile & Metadata Management (`GET /api/projects/:id/participants`, `PATCH /api/participants/:id`)
- **Backend Capability Live**:
  - Routes:
    - `GET /api/projects/:id/participants` (lists all participants with utterance stats, aliases, party, role, decisionMaker flag).
    - `PATCH /api/participants/:id` (accepts `{ displayName, party, jobTitle, isDecisionMaker, userId, clientContactId }` in `backend/src/routes/participant.route.ts`).
- **Pending Frontend Tasks**:
  - [ ] **3.1. Add `updateParticipant` in `frontend/src/features/transcript/transcript.js`**:
    - `PATCH /api/participants/:id` accepting `{ displayName, party, jobTitle, isDecisionMaker, clientContactId, userId }`.
  - [ ] **3.2. Build Participant Management View in Project Workspace**:
    - Display project participant roster table with utterance statistics, identified aliases, party badge (`internal`, `client`, `third_party`), and decision-maker star icon.
    - Provide inline / modal editor to update job title, party, decision-maker status, or associate with a user or client contact.

---

### 4. Client Contact to Participant Association (`PATCH /api/participants/:id` with `clientContactId`)
- **Backend Capability Live**:
  - Backend schema: `Participant` model has relation `clientContact ClientContact? @relation(fields: [clientContactId], references: [id])`.
  - Validator: `speaker.validator.ts` accepts `clientContactId` on both participant creation and participant update.
- **Pending Frontend Tasks**:
  - [ ] **4.1. Contact-to-Participant Linking in Contacts Tab**:
    - In `projects/[projectId]/page.js` (Contacts modal), allow selecting a detected transcript participant to link to the contact record (`clientContactId`).
    - Show linked participant badge with direct link to view their dialogue turns and mapped utterances.

---

### 5. Raw Transcript Export / Download Action (`GET /api/transcripts/:id?includeRawText=true`)
- **Backend Capability Live**:
  - Route: `GET /api/transcripts/:id?includeRawText=true` (in `backend/src/services/transcript.service.ts`).
  - Returns `rawText` payload when `includeRawText=true` query parameter is provided.
- **Pending Frontend Tasks**:
  - [ ] **5.1. Add "Download Raw Transcript" Action in `DeepDiscoveryTranscripts.jsx`**:
    - Add button / menu option on transcript cards to download or copy the raw uploaded transcript text.

---

### 6. Discussion Sheet One-Click Meeting Attachment (`PUT /api/meetings/:id`)
- **Backend Capability Live**:
  - Route: `PUT /api/meetings/:id` (in `backend/src/routes/meeting.route.ts`).
  - Accepts `{ title, description, notes, startTime, endTime, status }`.
- **Pending Frontend Tasks**:
  - [ ] **6.1. Attach Sheet to Meeting in `DiscussionSheetModal.jsx`**:
    - Add "Attach to Scheduled Meeting" button with dropdown of upcoming meetings for the project.
    - Appends the formatted question checklist directly into the meeting's `notes` or `description` via `PUT /api/meetings/:id`.

---

## ✅ Completed Frontend Implementations

- [x] **Speaker Review & Mapping Modal (`SpeakerMappingModal.jsx`)**: Autocompletion, inline participant creation, suggestion prefill via `GET /api/projects/:id/participants` and `POST /api/transcripts/:id/speakers/map`.
- [x] **AI Transcript Analysis Pipeline**: Action button, status badges (`running`, `ready`, `failed`), and initial polling mechanism via `POST /api/transcripts/:id/analyze`.
- [x] **Extracted Items Review Board (`ExtractedItemsBoard.jsx`)**: Categories (Answers, Decisions, Requirements, Actions), status filters (`proposed`, `accepted`, `rejected`), inline text editing, owner/due-date picker via `GET /api/transcripts/:id/items` and `PATCH /api/items/:id`.
- [x] **Answer Conflict Resolution Modal**: 409 conflict detection with `replaceAnswer: true` modal.
- [x] **Grounding Evidence Drawer (`EvidenceDrawer.jsx`)**: Verbatim dialogue turn slider with speaker tags and timestamps.
- [x] **Hierarchical Follow-Up Questions**: Threaded clarifying follow-ups under parent questions and orphan discovery gap callouts.
- [x] **Discussion Sheet Generator (`DiscussionSheetModal.jsx`)**: Printable and copyable formatted meeting agenda and questions checklist.
- [x] **Requirement Baselines (`BaselineManager.jsx`)**: Draft baseline builder, manual item addition, release notes editor, and pre-flight Freeze & Confirm modal via `POST /api/projects/:id/baselines`, `GET /api/projects/:id/baselines`, `GET /api/baselines/:id`, and `POST /api/baselines/:id/confirm`.
- [x] **AI Service Diagnostic Panel**: Live `/api/health/ai` ping and roundtrip latency display in settings.
- [x] **Dual-Cookie Session Continuity & Proactive Refresh**: 15m access token + 7d refresh token cookies, Next.js middleware protection (`hasSession`), pre-flight token check (`getValidAccessToken`), and 10m background heartbeat.
