"use client";

import Button from "@/components/Ui/Button";

export default function MeetingDetailsModal({
  meeting,
  editForm,
  editParticipantInput,
  isEditing,
  isSaving,
  isDeleting,
  timeOptions,
  durationOptions,
  onClose,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onEditFieldChange,
  onParticipantInputChange,
  onParticipantInputKeyDown,
  onParticipantInputBlur,
  onRemoveParticipant,
  scheduleText,
}) {
  if (!meeting) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/55 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Meeting Details</p>
            <h4 className="mt-1 text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">{meeting.title}</h4>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isEditing ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Schedule</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleString()}
              </p>
              {meeting.meetingLink && (
                <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
                  Open meeting link
                </a>
              )}
            </div>

            {meeting.description && (
              <div>
                <p className="text-xs text-slate-500">Description</p>
                <p className="mt-1 text-sm text-slate-700">{meeting.description}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500">Participants</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(meeting.participants || []).map((participant) => (
                  <span key={participant.email} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                    {participant.email} ({participant.status})
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" onClick={onStartEdit}>Edit</Button>
              <Button size="sm" variant="outline" onClick={onDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onSaveEdit();
            }}
          >
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input
                value={editForm.title}
                onChange={(event) => onEditFieldChange("title", event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Date</span>
                <input
                  type="date"
                  value={editForm.meetingDate}
                  onChange={(event) => onEditFieldChange("meetingDate", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Start Time</span>
                <select
                  value={editForm.startClock}
                  onChange={(event) => onEditFieldChange("startClock", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {durationOptions.map((duration) => (
                <button
                  key={duration.value}
                  type="button"
                  onClick={() => onEditFieldChange("durationMin", duration.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    editForm.durationMin === duration.value ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>

            {scheduleText && <p className="text-xs text-slate-500">{scheduleText}</p>}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Participants</span>
              <div className="mt-1 rounded-xl border border-slate-300 px-2 py-2">
                <div className="flex flex-wrap gap-2">
                  {editForm.participants.map((email) => (
                    <span key={email} className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                      {email}
                      <button type="button" onClick={() => onRemoveParticipant(email)}>x</button>
                    </span>
                  ))}
                  <input
                    type="email"
                    value={editParticipantInput}
                    onChange={(event) => onParticipantInputChange(event.target.value)}
                    onKeyDown={onParticipantInputKeyDown}
                    onBlur={onParticipantInputBlur}
                    className="min-w-[180px] flex-1 border-0 px-2 py-1 text-sm outline-none"
                    placeholder="Type email + Enter"
                  />
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(event) => onEditFieldChange("description", event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="flex items-center gap-3">
              <Button size="sm" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
              <Button size="sm" variant="ghost" type="button" onClick={onCancelEdit}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
