"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/Ui/Toast";
import Skeleton from "@/components/Ui/Skeleton";
import Tabs from "@/components/Ui/Tabs";
import Modal from "@/components/Ui/Modal";
import Button from "@/components/Ui/Button";
import ProjectHeader from "@/components/project/ProjectHeader";
import MeetingCard from "@/components/meetings/MeetingCard";
import GoogleCalendarConnect from "@/components/meetings/GoogleCalendarConnect";
import DeepDiscoveryTranscripts from "@/components/project/DeepDiscoveryTranscripts";
import ExtractedItemsBoard from "@/components/project/ExtractedItemsBoard";
import BaselineManager from "@/components/project/BaselineManager";
import DiscussionSheetModal from "@/components/project/DiscussionSheetModal";
import DiscoveryQuestionsBoard from "@/components/project/DiscoveryQuestionsBoard";
import {
  getProjectById,
  getProjectQuestions,
  createProjectQuestion,
  updateProject,
  updateProjectStage,
  deleteProject,
  getProjectContacts,
  createProjectContact,
  deleteProjectContact,
} from "@/features/project/project";
import {
  getMeetingsByProject,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "@/features/meeting/meeting";
import { getProjectTranscripts, getProjectParticipants } from "@/features/transcript/transcript";
import {
  QuestionMarkCircleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  PlusIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function ProjectWorkspacePage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const router = useRouter();
  const params = useParams();
  const projectId = Array.isArray(params?.projectId) ? params.projectId[0] : params?.projectId;

  const [project, setProject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [togglingMeetingId, setTogglingMeetingId] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [participants, setParticipants] = useState([]);
  const [isDiscussionSheetOpen, setIsDiscussionSheetOpen] = useState(false);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [copiedAgenda, setCopiedAgenda] = useState(false);

  // AI Suggestion State
  const [suggestionStatus, setSuggestionStatus] = useState("none");
  const [briefTooThin, setBriefTooThin] = useState(false);
  const hasLoadedRef = useRef(null);

  // Edit Project Modal State
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState({
    name: "",
    clientName: "",
    description: "",
    status: "planning",
    priority: "medium",
    techStack: "",
  });

  // Delete Project Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // New Question Modal State
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [newQuestionTopicId, setNewQuestionTopicId] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Schedule Meeting Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    meetingDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    durationMinutes: 45,
    participantsInput: "",
    participants: [],
  });

  // Client Contacts Modal State
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    jobTitle: "",
    email: "",
    isDecisionMaker: false,
  });

  // Fetch Questions
  const fetchQuestionsOnly = useCallback(async (id) => {
    try {
      const questRes = await getProjectQuestions(id);
      if (questRes?.success) {
        setTopics(questRes.data?.topics || []);
        if (questRes.data?.suggestionStatus) {
          setSuggestionStatus(questRes.data.suggestionStatus);
        }
      }
    } catch {
      // Background reload failure silent fallback
    }
  }, []);

  // Main Load Data
  const loadData = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const projPromise = getProjectById(id).then((res) => {
        if (res?.success && res.data?.project) {
          const p = res.data.project;
          setProject(p);
          setSuggestionStatus(p.suggestionStatus || "none");
          setBriefTooThin(Boolean(p.briefTooThin));
          setEditProjectForm({
            name: p.name || "",
            clientName: p.clientName || "",
            description: p.description || "",
            status: p.status || "planning",
            priority: p.priority || "medium",
            techStack: Array.isArray(p.techStack) ? p.techStack.join(", ") : "",
          });
        }
        return res;
      });

      const [projRes, questRes, meetRes, contactRes, transRes, partRes] = await Promise.all([
        projPromise,
        getProjectQuestions(id),
        getMeetingsByProject(id),
        getProjectContacts(id),
        getProjectTranscripts(id).catch(() => null),
        getProjectParticipants(id).catch(() => null),
      ]);

      if (!projRes?.success) {
        toastRef.current?.error(projRes?.message || "Failed to load project details.");
      }

      if (questRes?.success) {
        setTopics(questRes.data?.topics || []);
        if (questRes.data?.suggestionStatus) {
          setSuggestionStatus(questRes.data.suggestionStatus);
        }
      }

      if (meetRes?.success) {
        setMeetings(meetRes.data?.meetings || []);
      }

      if (contactRes?.success) {
        setContacts(contactRes.data?.contacts || []);
      }

      if (transRes?.success) {
        setTranscripts(transRes.data?.transcripts || []);
      }

      if (partRes?.success) {
        setParticipants(partRes.data?.participants || []);
      }
    } catch {
      toastRef.current?.error("Failed to load workspace data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Transcripts Only
  const fetchTranscriptsOnly = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await getProjectTranscripts(id);
      if (res?.success) {
        setTranscripts(res.data?.transcripts || []);
      }
    } catch {
      // background silent fallback
    }
  }, []);

  // Meeting Status Toggle Handler
  const handleToggleMeetingStatus = async (meetingId, newStatus) => {
    if (togglingMeetingId || !projectId) return;
    setTogglingMeetingId(meetingId);
    try {
      const res = await updateMeeting(projectId, meetingId, { status: newStatus });
      if (res?.success) {
        if (newStatus === "completed") {
          toastRef.current?.success("Meeting marked completed! Stage advanced to Deep Discovery.");
        } else {
          toastRef.current?.success("Meeting reopened as scheduled.");
        }
        await loadData(projectId);
      } else {
        toastRef.current?.error(res?.message || "Could not update meeting status.");
      }
    } catch {
      toastRef.current?.error("Failed to update meeting status.");
    } finally {
      setTogglingMeetingId(null);
    }
  };

  // Strict one-time load per projectId
  useEffect(() => {
    if (!projectId) return;
    if (hasLoadedRef.current === projectId) return;
    hasLoadedRef.current = projectId;
    void loadData(projectId);
  }, [projectId, loadData]);

  // Stage Update Handler
  const handleUpdateStage = async (newStage) => {
    setIsUpdatingStage(true);
    try {
      let res = await updateProjectStage(projectId, newStage);
      if (!res?.success) {
        res = await updateProject(projectId, { stage: newStage });
      }
      if (res?.success) {
        toast.success(`Project stage moved to ${newStage.replace(/_/g, " ")}`);
        setProject((prev) => (prev ? { ...prev, stage: newStage } : null));
        void fetchQuestionsOnly(projectId);
      } else {
        toast.error(res?.message || "Could not update project stage.");
      }
    } catch {
      toast.error("Failed to update project stage.");
    } finally {
      setIsUpdatingStage(false);
    }
  };

  // Edit Project Details Submit Handler
  const handleSaveProjectDetails = async (e) => {
    e.preventDefault();
    if (!editProjectForm.name.trim() || !editProjectForm.description.trim()) {
      toast.error("Project name and description are required.");
      return;
    }

    setIsSavingProject(true);
    try {
      const payload = {
        name: editProjectForm.name.trim(),
        description: editProjectForm.description.trim(),
        clientName: editProjectForm.clientName.trim() || null,
        status: editProjectForm.status,
        priority: editProjectForm.priority,
        techStack: editProjectForm.techStack
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await updateProject(projectId, payload);
      if (res?.success) {
        toast.success("Project updated successfully!");
        setProject(res.data?.project || { ...project, ...payload });
        setIsEditProjectModalOpen(false);
      } else {
        toast.error(res?.message || "Failed to update project.");
      }
    } catch {
      toast.error("Failed to update project.");
    } finally {
      setIsSavingProject(false);
    }
  };

  // Delete Project Handler
  const handleDeleteProject = async () => {
    setIsDeletingProject(true);
    try {
      const res = await deleteProject(projectId);
      if (res?.success) {
        toast.success("Project deleted successfully.");
        router.push("/projects");
      } else {
        toast.error(res?.message || "Failed to delete project.");
      }
    } catch {
      toast.error("Failed to delete project.");
    } finally {
      setIsDeletingProject(false);
    }
  };

  // Handle Add Custom Question
  const handleAddCustomQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newQuestionTopicId) {
      toast.error("Please fill in question text and select a topic.");
      return;
    }

    setIsAddingQuestion(true);
    try {
      const res = await createProjectQuestion(projectId, {
        text: newQuestionText.trim(),
        topicId: newQuestionTopicId,
      });

      if (res?.success) {
        toast.success("Discovery question added!");
        setIsAddQuestionModalOpen(false);
        setNewQuestionText("");
        void fetchQuestionsOnly(projectId);
      } else {
        toast.error(res?.message || "Failed to add question.");
      }
    } catch {
      toast.error("Failed to add question.");
    } finally {
      setIsAddingQuestion(false);
    }
  };

  // Handle Copy Discovery Checklist / Agenda
  const handleCopyAgenda = () => {
    let text = `# ${project?.name || "Project"} — Discovery Questionnaire\n`;
    if (project?.clientName) text += `Client: ${project.clientName}\n`;
    text += `Stage: ${project?.stage ? project.stage.replace(/_/g, " ") : "Day 1 Discovery"}\n\n`;

    topics.forEach((t, idx) => {
      const activeQs = (t.questions || []).filter((q) => q.status !== "skipped");
      if (activeQs.length === 0) return;
      text += `### ${idx + 1}. ${t.title}\n`;
      if (t.description) text += `_${t.description}_\n`;
      activeQs.forEach((q) => {
        const check = q.status === "answered" ? "[x]" : "[ ]";
        text += `- ${check} ${q.text}\n`;
        if (q.status === "answered" && q.answerText) {
          text += `  *Confirmed Answer:* ${q.answerText}\n`;
        }
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text);
    setCopiedAgenda(true);
    toast.success("Discovery questionnaire copied to clipboard!");
    setTimeout(() => setCopiedAgenda(false), 3000);
  };

  // Handle Schedule Meeting Submit
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!meetingForm.title.trim()) {
      toast.error("Meeting title is required.");
      return;
    }

    const startDateTime = new Date(`${meetingForm.meetingDate}T${meetingForm.startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + meetingForm.durationMinutes * 60000);

    const emailList = [
      ...meetingForm.participants,
      ...meetingForm.participantsInput
        .split(/[\s,]+/)
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email && email.includes("@")),
    ];
    const uniqueEmails = [...new Set(emailList)];

    setIsScheduling(true);
    try {
      const res = await createMeeting(projectId, {
        title: meetingForm.title.trim(),
        description: meetingForm.description.trim(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        participants: uniqueEmails,
      });

      if (res?.success) {
        toast.success("Meeting scheduled successfully with Google Meet!");
        setIsScheduleModalOpen(false);
        setMeetingForm({
          title: "",
          description: "",
          meetingDate: new Date().toISOString().split("T")[0],
          startTime: "10:00",
          durationMinutes: 45,
          participantsInput: "",
          participants: [],
        });
        const meetRes = await getMeetingsByProject(projectId);
        if (meetRes?.success) setMeetings(meetRes.data?.meetings || []);
      } else {
        toast.error(res?.message || "Failed to schedule meeting.");
      }
    } catch {
      toast.error("Failed to schedule meeting.");
    } finally {
      setIsScheduling(false);
    }
  };

  // Handle Delete Meeting
  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm("Are you sure you want to cancel and delete this meeting?")) return;
    try {
      const res = await deleteMeeting(projectId, meetingId);
      if (res?.success) {
        toast.success("Meeting deleted.");
        const meetRes = await getMeetingsByProject(projectId);
        if (meetRes?.success) setMeetings(meetRes.data?.meetings || []);
      } else {
        toast.error(res?.message || "Failed to delete meeting.");
      }
    } catch {
      toast.error("Failed to delete meeting.");
    }
  };

  // Handle Add Client Contact
  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim()) {
      toast.error("Contact name is required.");
      return;
    }

    setIsAddingContact(true);
    try {
      const res = await createProjectContact(projectId, {
        name: contactForm.name.trim(),
        jobTitle: contactForm.jobTitle.trim() || null,
        email: contactForm.email.trim() || null,
        isDecisionMaker: Boolean(contactForm.isDecisionMaker),
      });

      if (res?.success) {
        toast.success("Client stakeholder added!");
        setIsAddContactModalOpen(false);
        setContactForm({ name: "", jobTitle: "", email: "", isDecisionMaker: false });
        const cRes = await getProjectContacts(projectId);
        if (cRes?.success) setContacts(cRes.data?.contacts || []);
      } else {
        toast.error(res?.message || "Failed to add stakeholder.");
      }
    } catch {
      toast.error("Failed to add stakeholder.");
    } finally {
      setIsAddingContact(false);
    }
  };

  // Handle Delete Client Contact
  const handleDeleteContact = async (contactId) => {
    if (!confirm("Remove this stakeholder contact?")) return;
    try {
      const res = await deleteProjectContact(projectId, contactId);
      if (res?.success) {
        toast.success("Stakeholder removed.");
        const cRes = await getProjectContacts(projectId);
        if (cRes?.success) setContacts(cRes.data?.contacts || []);
      } else {
        toast.error(res?.message || "Could not delete contact.");
      }
    } catch {
      toast.error("Failed to delete contact.");
    }
  };

  // Compute Overall Stats Across All Topics
  const allQuestions = useMemo(() => {
    return topics.flatMap((t) => t.questions || []);
  }, [topics]);

  const stats = useMemo(() => {
    const total = allQuestions.length;
    const answered = allQuestions.filter((q) => q.status === "answered").length;
    const asked = allQuestions.filter((q) => q.status === "asked").length;
    const pending = allQuestions.filter((q) => q.status === "pending").length;
    const suggested = allQuestions.filter((q) => q.status === "suggested").length;
    const skipped = allQuestions.filter((q) => q.status === "skipped").length;
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { total, answered, asked, pending, suggested, skipped, progress };
  }, [allQuestions]);

  // Tab Definitions
  const workspaceTabs = useMemo(() => {
    return [
      {
        value: "questions",
        label: "Discovery Checklist",
      },
      {
        value: "transcripts",
        label: "Deep Discovery Transcripts",
        count: transcripts.length > 0 ? transcripts.length : undefined,
      },
      {
        value: "meetings",
        label: "Alignments & Calls",
        count: meetings.length > 0 ? meetings.length : undefined,
      },
      {
        value: "items",
        label: "Discovered Items",
      },
      {
        value: "baselines",
        label: "Requirement Baselines",
      },
      {
        value: "contacts",
        label: "Stakeholders",
        count: contacts.length > 0 ? contacts.length : undefined,
      },
    ];
  }, [transcripts.length, meetings.length, contacts.length]);

  if (isLoading && !project) return <Skeleton.ProjectDetail />;

  return (
    <div className="space-y-6">
      {/* ── Modern High-Clarity Project Card & Header ─────────────────────── */}
      <ProjectHeader
        project={project}
        stats={stats}
        meetingsCount={meetings.length}
        contactsCount={contacts.length}
        transcriptsCount={transcripts.length}
        onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        onOpenEditModal={() => setIsEditProjectModalOpen(true)}
        onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        onOpenDiscussionSheet={() => setIsDiscussionSheetOpen(true)}
        onCopyAgenda={handleCopyAgenda}
        copiedAgenda={copiedAgenda}
        onUpdateStage={handleUpdateStage}
        isUpdatingStage={isUpdatingStage}
      />

      {/* ── Workspace Tab Navigation ─────────────────────────────────────── */}
      <div className="pt-0.5">
        <Tabs
          variant="underline"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={workspaceTabs}
        />
      </div>

      {/* ── Tab 1: Discovery Questions Board ─────────────────────────────── */}
      {activeTab === "questions" && (
        <DiscoveryQuestionsBoard
          projectId={projectId}
          topics={topics}
          setTopics={setTopics}
          suggestionStatus={suggestionStatus}
          briefTooThin={briefTooThin}
          onRefreshQuestions={() => fetchQuestionsOnly(projectId)}
          onAddQuestionClick={() => setIsAddQuestionModalOpen(true)}
          toast={toastRef.current}
        />
      )}

      {/* ── Tab 2: Deep Discovery Transcripts ────────────────────────────── */}
      {activeTab === "transcripts" && (
        <DeepDiscoveryTranscripts
          projectId={projectId}
          meetings={meetings}
          transcripts={transcripts}
          onRefreshTranscripts={() => fetchTranscriptsOnly(projectId)}
          onSwitchToQuestions={() => setActiveTab("questions")}
          onViewItems={() => setActiveTab("items")}
          toast={toastRef.current}
        />
      )}

      {/* ── Tab 3: Alignments & Meetings ─────────────────────────────────── */}
      {activeTab === "meetings" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] font-display">
              Scheduled Alignment Calls
            </h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsScheduleModalOpen(true)}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Schedule Call
            </Button>
          </div>

          <GoogleCalendarConnect onConnected={() => loadData(projectId)} />

          {meetings.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
              <CalendarDaysIcon className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
              <h3 className="mt-3 text-sm font-bold text-gray-900">No calls scheduled</h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                Schedule a discovery alignment with your client. Google Meet room links are generated automatically.
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(true)}
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                >
                  Schedule First Call
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id || meeting._id}
                  meeting={meeting}
                  showProjectTag={false}
                  onDelete={() => handleDeleteMeeting(meeting.id || meeting._id)}
                  onToggleComplete={handleToggleMeetingStatus}
                  isTogglingComplete={togglingMeetingId === (meeting.id || meeting._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Discovered Items Review Board ─────────────────────────── */}
      {activeTab === "items" && (
        <ExtractedItemsBoard
          projectId={projectId}
          transcripts={transcripts}
          participants={participants}
          toast={toastRef.current}
          onRefreshProject={() => loadData(projectId)}
        />
      )}

      {/* ── Tab 5: Requirement Baselines ─────────────────────────────────── */}
      {activeTab === "baselines" && (
        <BaselineManager
          projectId={projectId}
          userRole={project?.currentUserRole || "product_manager"}
          topics={topics}
          toast={toastRef.current}
          onRefreshProject={() => loadData(projectId)}
        />
      )}

      {/* ── Tab 6: Client Stakeholders & Contacts ────────────────────────── */}
      {activeTab === "contacts" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] font-display">
                Client Stakeholders & Decision Makers
              </h3>
              <p className="text-xs text-[#64748B]">
                Key contacts who participate in requirements sign-off and discovery sessions.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddContactModalOpen(true)}
              leftIcon={<UserPlusIcon className="h-4 w-4" />}
            >
              Add Stakeholder
            </Button>
          </div>

          {contacts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
              <UserGroupIcon className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
              <h3 className="mt-3 text-sm font-bold text-gray-900">No client stakeholders added</h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                Add client decision makers, technical champions, and points of contact to streamline discovery communication.
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddContactModalOpen(true)}
                  leftIcon={<UserPlusIcon className="h-4 w-4" />}
                >
                  Add First Stakeholder
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id || contact._id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">{contact.name}</span>
                      {contact.isDecisionMaker && (
                        <span className="rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 border border-purple-200">
                          Decision Maker
                        </span>
                      )}
                    </div>
                    {contact.jobTitle && (
                      <p className="text-xs text-gray-500">{contact.jobTitle}</p>
                    )}
                    {contact.email && (
                      <p className="text-xs text-[#2563EB] font-medium truncate pt-1">
                        {contact.email}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id || contact._id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Remove contact"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modal 1: Add Custom Question ─────────────────────────────────── */}
      <Modal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        title="Add Discovery Question"
        subtitle="Add a customized requirement validation question to this project"
        icon={<PlusIcon className="h-5 w-5" />}
        size="md"
      >
        <form onSubmit={handleAddCustomQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Topic Section *
            </label>
            <select
              required
              value={newQuestionTopicId}
              onChange={(e) => setNewQuestionTopicId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
            >
              <option value="">-- Select Topic --</option>
              {topics.map((t) => (
                <option key={t.id || t._id} value={t.id || t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Question Text * (5 - 500 characters)
            </label>
            <textarea
              required
              rows={3}
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="e.g. What third-party payment gateways must be integrated into the MVP?"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddQuestionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isAddingQuestion}
            >
              {isAddingQuestion ? "Adding…" : "Add Question"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Schedule Meeting ────────────────────────────────────── */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Alignment Call"
        subtitle="Create a session and generate a Google Meet room for your team and client"
        icon={<CalendarDaysIcon className="h-5 w-5" />}
        size="lg"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={meetingForm.title}
              onChange={(e) => setMeetingForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Scope Discovery Alignment Call"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={meetingForm.meetingDate}
                onChange={(e) => setMeetingForm((prev) => ({ ...prev, meetingDate: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={meetingForm.startTime}
                onChange={(e) => setMeetingForm((prev) => ({ ...prev, startTime: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Duration
              </label>
              <select
                value={meetingForm.durationMinutes}
                onChange={(e) =>
                  setMeetingForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Participant Emails (comma or space separated)
            </label>
            <input
              type="text"
              value={meetingForm.participantsInput}
              onChange={(e) =>
                setMeetingForm((prev) => ({ ...prev, participantsInput: e.target.value }))
              }
              placeholder="client@company.com, pm@aversa.ai"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Agenda & Session Description
            </label>
            <textarea
              rows={2}
              value={meetingForm.description}
              onChange={(e) =>
                setMeetingForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Outline key questions and discovery objectives for this call…"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isScheduling}
            >
              {isScheduling ? "Generating Meet Link…" : "Confirm & Schedule"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 3: Edit Project Details ────────────────────────────────── */}
      <Modal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        title="Edit Project Details"
        subtitle="Update project identity, status, client name, and technical scope"
        icon={<PencilSquareIcon className="h-5 w-5" />}
        size="lg"
      >
        <form onSubmit={handleSaveProjectDetails} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={editProjectForm.name}
                onChange={(e) => setEditProjectForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={editProjectForm.clientName}
                onChange={(e) =>
                  setEditProjectForm((prev) => ({ ...prev, clientName: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={editProjectForm.status}
                onChange={(e) =>
                  setEditProjectForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={editProjectForm.priority}
                onChange={(e) =>
                  setEditProjectForm((prev) => ({ ...prev, priority: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tech Stack (comma separated)
            </label>
            <input
              type="text"
              value={editProjectForm.techStack}
              onChange={(e) =>
                setEditProjectForm((prev) => ({ ...prev, techStack: e.target.value }))
              }
              placeholder="e.g. Next.js, Node.js, PostgreSQL, Redis"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Project Description *
            </label>
            <textarea
              required
              rows={3}
              value={editProjectForm.description}
              onChange={(e) =>
                setEditProjectForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSavingProject}
            >
              {isSavingProject ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 4: Delete Project Confirmation ─────────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project?"
        subtitle="This action cannot be undone"
        icon={<TrashIcon className="h-5 w-5 text-red-600" />}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-gray-900">{project?.name}</span>? All discovery questions, answers, and meetings associated with this project will be removed.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isDeletingProject}
              onClick={handleDeleteProject}
            >
              {isDeletingProject ? "Deleting…" : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal 5: Add Stakeholder Contact ─────────────────────────────── */}
      <Modal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        title="Add Client Stakeholder"
        subtitle="Add a key decision maker or technical champion"
        icon={<UserPlusIcon className="h-5 w-5" />}
        size="md"
      >
        <form onSubmit={handleAddContactSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={contactForm.name}
              onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Sarah Connor"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Job Title / Role
            </label>
            <input
              type="text"
              value={contactForm.jobTitle}
              onChange={(e) => setContactForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
              placeholder="e.g. VP of Product / Key Stakeholder"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="e.g. sarah@client.com"
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="decisionMaker"
              checked={contactForm.isDecisionMaker}
              onChange={(e) => setContactForm((prev) => ({ ...prev, isDecisionMaker: e.target.checked }))}
              className="rounded border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="decisionMaker" className="text-xs font-semibold text-gray-700 cursor-pointer">
              Primary Decision Maker (Signs off on scope & requirements)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddContactModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isAddingContact}
            >
              {isAddingContact ? "Adding…" : "Add Stakeholder"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 6: Discussion Sheet Modal ──────────────────────────────── */}
      <DiscussionSheetModal
        isOpen={isDiscussionSheetOpen}
        onClose={() => setIsDiscussionSheetOpen(false)}
        project={project}
        topics={topics}
        toast={toastRef.current}
      />
    </div>
  );
}
