# AversA Frontend Implementation Pending Checklist

This tracking document lists all backend and AI engine capabilities that have been fully built, tested, and deployed, but still require corresponding client-side user interface, state management, or API hook implementation in the **`frontend`** repository.

> **Rule**: As each feature or component is implemented in `frontend`, check off the corresponding item `[x]` and document the component file and PR/commit.

---

## 1. Speaker Review & Mapping UI Workflow

### Background & Backend Contract
When a transcript is uploaded, the parser detects unique speaker labels and attempts alias resolution. If unmapped speakers remain, the transcript is placed in `status: "needs_speaker_mapping"`. The backend exposes:
- **`GET /api/transcripts/:transcriptId/speakers`**: Returns detected speaker labels and existing mappings.
- **`POST /api/transcripts/:transcriptId/speakers/map`**: Accepts mapped participants:
  ```json
  {
    "mappings": [
      {
        "label": "Priyanka",
        "participantId": "par_cl123",
        "party": "internal",
        "displayName": "Priyanka Sharma"
      },
      {
        "label": "Ouali",
        "party": "client",
        "displayName": "Ouali K.",
        "email": "ouali@client.com"
      }
    ]
  }
  ```

### Pending Frontend Implementation Steps
- [ ] **1.1. Add API Functions in `frontend/src/features/transcript/transcript.js`**:
  - Implement `getTranscriptSpeakers(transcriptId)`
  - Implement `mapTranscriptSpeakers(transcriptId, mappings)`
- [ ] **1.2. Create `SpeakerMappingModal.jsx` in `frontend/src/components/project/`**:
  - Modal triggered from transcript card when status is `needs_speaker_mapping` or via a "Review Speakers" button.
  - Fetch existing project participants via `GET /api/projects/:projectId/participants` for autocomplete.
  - Table/list showing:
    - Detected Label (e.g., `"Speaker 1"`, `"Ouali"`).
    - Dropdown: Map to Existing Participant OR "+ Create New Participant".
    - Party Selector: `client` (Client Team), `internal` (AversA / Core Team), `third_party` (External Vendor).
    - Display Name & optional Email inputs.
  - Validation: Ensure every speaker is assigned a party before submission.
- [ ] **1.3. Update `DeepDiscoveryTranscripts.jsx`**:
  - Display a distinct badge: `Needs Speaker Mapping` (Amber) vs `Ready for AI Analysis` (Blue).
  - Open `SpeakerMappingModal` immediately following transcript indexing if unmapped speakers are detected.

---

## 2. Triggering AI Transcript Analysis & Real-Time Polling

### Background & Backend Contract
Once speakers are mapped, the transcript can be analyzed by the Gemini 2.5 Flash Lite engine:
- **`POST /api/transcripts/:transcriptId/analyze`**: Claims the transcript, transitions `analysisStatus` to `running`, and dispatches the multi-chunk pipeline.
- **`GET /api/transcripts/:transcriptId`**: Returns:
  ```json
  {
    "analysisStatus": "running" | "ready" | "failed",
    "analysisError": null,
    "itemCount": 18,
    "followUpCount": 3
  }
  ```

### Pending Frontend Implementation Steps
- [ ] **2.1. Add `analyzeTranscript(transcriptId)` in `frontend/src/features/transcript/transcript.js`**:
  - Calls `POST /api/transcripts/:transcriptId/analyze`.
- [ ] **2.2. Add "Analyze Transcript" Action Button in `DeepDiscoveryTranscripts.jsx`**:
  - Show primary action button on transcript cards where `status === 'ready'`.
  - While `analysisStatus === 'running'`, display an active pulse animation with message: *"AI Agent Analyzing Dialogue..."*.
- [ ] **2.3. Implement Short-Polling Hook for Running Analysis**:
  - Poll `GET /api/transcripts/:transcriptId` every 3 seconds while `analysisStatus === 'running'`.
  - On transition to `ready`:
    - Trigger success toast: *"AI Extraction Complete: 18 items discovered, 3 follow-ups generated"*.
    - Automatically update project badge counts.
    - Provide a one-click button: *"View Discovered Items $\rightarrow$"*.
  - On transition to `failed`:
    - Display error alert with retry option.

---

## 3. Extracted Items Review Board (Answers, Decisions, Requirements, Actions)

### Background & Backend Contract
Extracted knowledge items are persisted in the database with status `proposed`:
- **`GET /api/transcripts/:id/items?type=&status=`**: Returns list of `ExtractedItem` objects filtered by valid enums (`action_item`, `decision`, `requirement`, `answer` and `proposed`, `accepted`, `rejected`).
- **`PATCH /api/transcripts/items/:itemId`**: Updates status (`proposed`, `accepted`, `rejected`), text, and for action items: `ownerParticipantId` (or null) and `dueDate`. Supports `replaceAnswer: true` when accepting answers.
- **`GET /api/transcripts/items/:itemId/evidence`**: Returns line numbers and corresponding `TranscriptUtterance` rows.

### Pending Frontend Implementation Steps
- [ ] **3.1. Create `frontend/src/features/items/item.js`**:
  - Implement `getTranscriptItems(transcriptId, { type, status })`
  - Implement `updateExtractedItem(itemId, { status, text, ownerParticipantId, dueDate, replaceAnswer })`
  - Implement `getItemEvidence(itemId)`
- [ ] **3.2. Build `ExtractedItemsBoard.jsx` in `frontend/src/components/project/`**:
  - Category Filter Tabs:
    - **Answers** (linked to `ProjectQuestion`).
    - **Decisions** (confirmed agreements).
    - **Requirements** (client software capabilities).
    - **Action Items** (assigned tasks with due dates).
  - Item Card Layout:
    - Verified text statement (editable inline).
    - Confidence badge: `high` (green), `medium` (amber), `low` (gray).
    - Spoken due date & resolved ISO date (for action items).
    - Owner chip / dropdown (`ownerParticipantId` scoped to project participants).
    - Citation Pill: e.g., `[Lines 14, 15]`.
    - Action buttons: "Accept" (Green checkmark) and "Reject" (Red cross).
- [ ] **3.3. Build Line Evidence Drawer / Modal**:
  - Clicking on a citation pill opens a slide-over drawer displaying the verbatim dialogue turns from the meeting transcript, with cited lines highlighted.
- [ ] **3.4. Handle 409 Conflict on Answer Acceptance**:
  - When accepting an answer item returns HTTP 409 Conflict (`Question already has an answer`), prompt the user with a confirmation modal: *"This question was already answered. Replace the existing answer with this new answer?"*
  - On user confirmation, resend request with `replaceAnswer: true`.
- [ ] **3.5. Reactive Question Answer State Sync**:
  - When an accepted answer item is rejected or reverted back to `proposed`, automatically refresh or synchronize the linked question in the Questions tab (which reverts to `pending` or `suggested`).

---

## 4. Hierarchical Follow-Up Questions UI

### Background & Backend Contract
Follow-up questions are saved to `ProjectQuestion` with `source: "follow_up"`:
- Clarifying follow-ups carry `parentQuestionId` pointing to an answered baseline question.
- New discovery gap follow-ups carry `parentQuestionId: null`.

### Pending Frontend Implementation Steps
- [ ] **4.1. Update Questions Tab in `frontend/src/app/(dashboard)/projects/[projectId]/page.js`**:
  - Threaded view: Render clarifying follow-up questions indented directly under their answered parent question with a "Follow-Up" badge.
  - "New Discovery Gaps" Section: Render orphan follow-ups (`parentQuestionId === null`) in an alert callout box highlighting newly uncovered requirements or business logic gaps.
- [ ] **4.2. Follow-Up Action Controls**:
  - Provide an "Approve Question" button to promote a suggested follow-up into an active `pending` question for upcoming client meetings.
  - Provide a "Dismiss" button to hide non-relevant follow-ups.

---

## 5. Rate Limiting (HTTP 429) User Experience

### Background & Backend Contract
Backend rate limiters return HTTP 429 with `skipSuccessfulRequests: true`:
- Signin: 30 failed attempts / 15 min.
- Signup: 15 attempts / 15 min.
- Forgot Password: 5 attempts / 15 min.
- JSON response:
  ```json
  {
    "success": false,
    "message": "Too many failed sign-in attempts. Please try again after 15 minutes."
  }
  ```

### Pending Frontend Implementation Steps
- [ ] **5.1. Update `frontend/src/lib/api/api.js` Error Handling**:
  - Detect HTTP status 429 specifically and return a structured `{ isRateLimited: true, message, retryAfter }`.
- [ ] **5.2. Update Auth Pages (`(auth)/login`, `(auth)/signup`, `(auth)/forgot-password`)**:
  - Display a red alert banner with a lock icon.
  - Render an active 15-minute countdown clock so the user knows exactly when they can retry.
  - Disable submit button during active lockout.

---

## 6. Production Health & Diagnostic Status Panel

### Background & Backend Contract
- Backend disables Swagger UI `/docs` in production (`NODE_ENV === "production"`).
- Backend `/health/ai` returns sanitized status:
  ```json
  {
    "success": true,
    "message": "AI service reachable",
    "data": {
      "status": "healthy",
      "latencyMs": 142
    }
  }
  ```

### Pending Frontend Implementation Steps
- [ ] **6.1. Add AI Service Status Indicator in Admin / Settings**:
  - In `src/app/(dashboard)/settings/page.js` or admin dashboard:
  - Add an "Engine Health" widget that pings `/api/health/ai` and renders a live green/red dot with latency in milliseconds.
- [ ] **6.2. Conditional API Docs Link**:
  - Only show "API Documentation" links in header/footer when running in development mode (`process.env.NODE_ENV !== "production"`).

---

## 7. Requirement Baselines: Draft Snapshot & Version Viewer

### Background & Backend Contract
Requirement Baselines freeze agreed requirements, decisions, and answered questions into an immutable versioned snapshot:
- **`POST /api/projects/:id/baselines`**: Builds a draft baseline snapshot (Managers only). Returns 409 with existing draft's ID if one is active.
  ```json
  {
    "success": true,
    "status": 201,
    "message": "Draft baseline created successfully.",
    "data": {
      "baseline": {
        "id": "bsl_01...",
        "version": 1,
        "status": "draft",
        "note": "Optional draft note",
        "items": [...]
      },
      "itemCounts": { "answer": 4, "decision": 2, "requirement": 6, "total": 12 },
      "readiness": {
        "pendingOrAskedQuestions": 2,
        "proposedExtractedItems": 5,
        "suggestedFollowUpQuestions": 1
      }
    }
  }
  ```
- **`GET /api/projects/:id/baselines`**: Lists all baseline versions for a project sorted by version descending with item counts.
- **`GET /api/baselines/:id`**: Retrieves a single baseline by ID with its ordered items.
- **`POST /api/baselines/:id/items`**: Adds a manual item (decision, requirement, or answer) with auto-assigned sortOrder.
- **`PATCH /api/baselines/:id/items/:itemId`**: Edits text, questionText (answer items only), or topicKey of an existing baseline item in a draft without touching source items.
- **`DELETE /api/baselines/:id/items/:itemId`**: Removes an item line from the draft baseline snapshot only ("Removed from this draft only.").
- **`PATCH /api/baselines/:id`**: Updates the draft baseline's note (up to 2,000 chars, null to clear).

### Pending Frontend Implementation Steps
- [ ] **7.1. Add Baseline API Client in `frontend/src/features/baseline/baseline.js`**:
  - Implement `createDraftBaseline(projectId, { note })`
  - Implement `getProjectBaselines(projectId)`
  - Implement `getBaselineById(baselineId)`
  - Implement `addBaselineItem(baselineId, { type, text, questionText, topicKey })`
  - Implement `updateBaselineItem(baselineId, itemId, { text, questionText, topicKey })`
  - Implement `deleteBaselineItem(baselineId, itemId)`
  - Implement `updateBaselineNote(baselineId, { note })`
- [ ] **7.2. Build Baseline Overview Card & Version Drawer**:
  - Show baseline status on project overview (`Draft vX in progress`, `Confirmed vX`, or `No baseline created yet`).
  - "Build Baseline Draft" action button with confirmation modal displaying readiness stats (open questions, proposed items, suggested follow-ups).
  - Version history dropdown/list showing `version`, `status` badge (`draft`, `confirmed`, `superseded`), `createdAt`, and `itemCount`.
- [ ] **7.3. Build `BaselineSnapshotViewer.jsx` & Draft Editor**:
  - Table/list rendering ordered baseline items:
    - Answer items (question text and confirmed answer with topic badge).
    - Requirements & Decisions (with sortOrder and source pointers).
  - When viewing a `draft` baseline (for Managers):
    - Inline or modal edit button to modify item text, question text, or topic badge.
    - Delete item button with confirmation notice: *"This removes the item from this draft only. Source extracted item remains accepted."*
    - "+ Add Manual Item" button modal: type selector (`requirement`, `decision`, `answer`), text, questionText (if answer), and topicKey selector.
    - Editable baseline note section with save / clear button.


