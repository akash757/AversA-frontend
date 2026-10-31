# AversA Frontend Implementation Tracking Checklist

This document tracks client-side user interface, state management, and API integrations in the **`frontend`** repository.

> **Status**: All Discovery, AI Analysis, Extracted Items Review, Hierarchical Follow-Ups, and Requirement Baseline frontend modules are **Fully Implemented and Verified**.

---

## 1. Speaker Review & Mapping UI Workflow
- [x] **1.1. Add API Functions in `frontend/src/features/transcript/transcript.js`**:
  - `getTranscriptSpeakers(transcriptId)`
  - `mapTranscriptSpeakers(transcriptId, mappings)`
- [x] **1.2. Create `SpeakerMappingModal.jsx` in `frontend/src/components/project/`**:
  - Triggered from transcript card when status is `needs_speaker_mapping`.
  - Autocompletes existing participants via `GET /api/projects/:projectId/participants`.
  - Supports inline creation of new participants (`client`, `internal`, `third_party`) with roles and decision-maker flags.
- [x] **1.3. Update `DeepDiscoveryTranscripts.jsx`**:
  - Displays distinct badges: `Needs Speaker Mapping` (Amber) vs `Speakers Mapped` (Emerald).
  - One-click trigger opens `SpeakerMappingModal`.

---

## 2. Triggering AI Transcript Analysis & Real-Time Polling
- [x] **2.1. Add `triggerTranscriptAnalysis(transcriptId)` in `frontend/src/features/transcript/transcript.js`**:
  - Calls `POST /api/transcripts/:transcriptId/analysis`.
- [x] **2.2. Add "Analyze Transcript" Action Button in `DeepDiscoveryTranscripts.jsx`**:
  - Shows primary action button on ready transcripts.
  - While `analysisStatus === 'running'`, displays pulse animation with *"AI Analyzing Dialogue..."*.
- [x] **2.3. Implement Polling and State Transition**:
  - Auto-polls status every 4 seconds while running.
  - On transition to `ready`: Displays discovered item and follow-up count pills with one-click *"View Discovered Items $\rightarrow$"* navigation.
  - On transition to `failed`: Displays retry button.

---

## 3. Extracted Items Review Board (Answers, Decisions, Requirements, Actions)
- [x] **3.1. Create `frontend/src/features/items/item.js`**:
  - `getTranscriptItems(transcriptId, { type, status })`
  - `updateExtractedItem(itemId, { status, text, ownerParticipantId, dueDate, dueText, replaceAnswer })`
- [x] **3.2. Build `ExtractedItemsBoard.jsx` in `frontend/src/components/project/`**:
  - Category Filter Tabs: All, Answers, Decisions, Requirements, Action Items.
  - Status filters: `all`, `proposed` (amber), `accepted` (emerald), `rejected` (gray).
  - In-place Accept, Reject, and Revert-to-Proposed buttons.
  - Action item participant owner selector and due-date picker.
  - Summary metrics banner with instant counts.
- [x] **3.3. Build Line Evidence Drawer (`EvidenceDrawer.jsx`)**:
  - Slide-over drawer displaying highlighted transcript utterances, line numbers, and speaker labels linked to the selected extracted item.
- [x] **3.4. Handle 409 Conflict on Answer Acceptance**:
  - Detects HTTP 409 Conflict and prompts user with confirmation modal: *"This question was already answered. Replace the existing answer with this new answer?"*
  - On confirmation, resends with `replaceAnswer: true`.

---

## 4. Hierarchical Follow-Up Questions UI & Discussion Sheet
- [x] **4.1. Update Questions Tab in `frontend/src/app/(dashboard)/projects/[projectId]/page.js`**:
  - **Threaded View**: Render clarifying follow-up questions indented directly under their answered parent question with a "Clarifying Follow-Up" badge.
  - **New Discovery Gaps Callout**: Render orphan follow-ups (`parentQuestionId === null`) in an alert callout box highlighting newly uncovered requirements.
- [x] **4.2. Follow-Up Action Controls**:
  - "Approve Question" button promotes suggested follow-ups into active `pending` questions for meetings.
  - "Dismiss" button to skip non-relevant follow-ups.
- [x] **4.3. Build `DiscussionSheetModal.jsx`**:
  - Clean printable / copyable discussion sheet for upcoming client meetings with formatted question checklist grouped by topic.

---

## 5. Rate Limiting (HTTP 429) Handling
- [x] **5.1. Update `frontend/src/lib/api/api.js` Error Handling**:
  - Detects HTTP status 429 and returns structured `{ isRateLimited: true, retryAfter: 900, message }`.

---

## 6. Production Health & Diagnostic Status Panel
- [x] **6.1. Add AI Service Status Indicator in `frontend/src/app/(dashboard)/settings/page.js`**:
  - "AI Inference Engine Diagnostic" panel that pings `/api/health/ai` with live green/red dot and roundtrip latency in ms.
- [x] **6.2. Conditional API Docs Link**:
  - Interactive API docs link in settings page is conditionally rendered only in development mode (`process.env.NODE_ENV !== "production"`).

---

## 7. Requirement Baselines: Draft Snapshot & Version Viewer
- [x] **7.1. Add Baseline API Client in `frontend/src/features/baseline/baseline.js`**:
  - `createDraftBaseline(projectId, { note })`
  - `getProjectBaselines(projectId)`
  - `getLatestConfirmedBaseline(projectId)`
  - `getBaselineById(baselineId)`
  - `addBaselineItem(baselineId, payload)`
  - `updateBaselineItem(baselineId, itemId, payload)`
  - `deleteBaselineItem(baselineId, itemId)`
  - `updateBaselineNote(baselineId, { note })`
  - `confirmBaseline(baselineId, { acknowledgeWarnings })`
  - `discardDraftBaseline(baselineId)`
- [x] **7.2. Build `BaselineManager.jsx` in `frontend/src/components/project/`**:
  - Baseline version history selector (`vX [status]`).
  - "Build New Baseline Draft" action button.
  - Ordered items list with category filtering (All, Requirements, Decisions, Answers).
  - Draft manual item creator modal (`+ Add Manual Item`).
  - Inline and modal snapshot item editor.
  - Item removal from draft snapshot only.
  - Release notes editor with save/clear.
  - "Discard Draft" modal.
- [x] **7.3. Build Baseline Freeze & Confirmation Modal**:
  - Available to `product_manager`, `admin`, and `superadmin`.
  - Pre-flight readiness check displays warning checklist for open questions, proposed items, and suggested follow-ups.
  - `acknowledgeWarnings: true` confirmation checkbox advances project stage to `requirements_confirmed`.
