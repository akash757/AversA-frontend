"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Ui/Toast";
import Loader from "@/components/Ui/Loader";
import ProjectHeader from "@/components/project/ProjectHeader";
import MeetingCard from "@/components/meetings/MeetingCard";
import GoogleCalendarConnect from "@/components/meetings/GoogleCalendarConnect";
import DeepDiscoveryTranscripts from "@/components/project/DeepDiscoveryTranscripts";
import {
  getProjectById,
  getProjectQuestions,
  createProjectQuestion,
  updateProjectQuestion,
  deleteProjectQuestion,
  updateProject,
  updateProjectStage,
  deleteProject,
  regenerateProjectAiSuggestions,
  getProjectSuggestionsStatus,
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
import { getProjectTranscripts } from "@/features/transcript/transcript";
import { getAccessToken, BASE_URL } from "@/lib/api/api";
import {
  QuestionMarkCircleIcon,
  CalendarDaysIcon,
  SparklesIcon,
  CheckCircleIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  VideoCameraIcon,
  PencilSquareIcon,
  TrashIcon,
  LightBulbIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  UserGroupIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  FunnelIcon,
  DocumentTextIcon,
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
  const [isLoadingTranscripts, setIsLoadingTranscripts] = useState(false);
  const [showDayOneQuestions, setShowDayOneQuestions] = useState(false);
  const [togglingMeetingId, setTogglingMeetingId] = useState(null);
  const [activeTab, setActiveTab] = useState("questions"); // "questions" | "meetings" | "contacts"

  // Question Filters & Search
  const [questionStatusFilter, setQuestionStatusFilter] = useState("all");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("all");
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");
  const [collapsedTopics, setCollapsedTopics] = useState({});

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [isRegeneratingAi, setIsRegeneratingAi] = useState(false);
  const isRegeneratingAiRef = useRef(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const isCheckingStatusRef = useRef(false);
  const [copiedAgenda, setCopiedAgenda] = useState(false);

  // AI Suggestion State
  const [suggestionStatus, setSuggestionStatus] = useState("none"); // "none" | "running" | "ready" | "failed"
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

  // Expanded question answer form state: { [questionId]: { isOpen, answerText, meetingId } }
  const [editingAnswers, setEditingAnswers] = useState({});
  const [savingQuestionId, setSavingQuestionId] = useState(null);

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

  // Main Load Data (stable identity, no auto-re-renders)
  const loadData = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const [projRes, questRes, meetRes, contactRes, transRes] = await Promise.all([
        getProjectById(id),
        getProjectQuestions(id),
        getMeetingsByProject(id),
        getProjectContacts(id),
        getProjectTranscripts(id).catch(() => null),
      ]);

      if (projRes?.success) {
        const p = projRes.data?.project || null;
        setProject(p);
        if (p) {
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
      } else {
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
    } catch {
      toastRef.current?.error("Failed to load workspace data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Transcripts Only (for refresh after upload/delete)
  const fetchTranscriptsOnly = useCallback(async (id) => {
    if (!id) return;
    try {
      setIsLoadingTranscripts(true);
      const res = await getProjectTranscripts(id);
      if (res?.success) {
        setTranscripts(res.data?.transcripts || []);
      }
    } catch {
      // background silent fallback
    } finally {
      setIsLoadingTranscripts(false);
    }
  }, []);

  // Meeting Status Toggle Handler (Completing call automatically advances stage to discovery)
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

  // Strict one-time load per projectId (prevents duplicate hits on mount / Strict Mode)
  useEffect(() => {
    if (!projectId) return;
    if (hasLoadedRef.current === projectId) return;
    hasLoadedRef.current = projectId;
    void loadData(projectId);
  }, [projectId, loadData]);

  // Real-time updates via Server-Sent Events (SSE)
  useEffect(() => {
    if (!projectId) return;

    const token = getAccessToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const sseUrl = `${BASE_URL}/projects/${projectId}/events${tokenQuery}`;

    let eventSource;
    try {
      eventSource = new EventSource(sseUrl, { withCredentials: true });

      eventSource.addEventListener("suggestions.running", () => {
        setSuggestionStatus("running");
      });

      eventSource.addEventListener("suggestions.ready", (event) => {
        try {
          const data = JSON.parse(event.data);
          setSuggestionStatus("ready");
          if (data.briefTooThin !== undefined) {
            setBriefTooThin(Boolean(data.briefTooThin));
          }
          if (Array.isArray(data.topics)) {
            setTopics(data.topics);
          }
          toastRef.current?.success("✨ AI Discovery suggestions are ready!");
        } catch {
          void fetchQuestionsOnly(projectId);
        }
      });

      eventSource.addEventListener("suggestions.failed", (event) => {
        try {
          const data = JSON.parse(event.data);
          setSuggestionStatus("failed");
          toastRef.current?.error(data?.error || "AI suggestion generation failed.");
        } catch {
          setSuggestionStatus("failed");
        }
      });

      eventSource.onerror = () => {
        // Native EventSource auto-reconnects on temporary network drops
      };
    } catch {
      // Graceful fallback if EventSource unavailable
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [projectId, fetchQuestionsOnly]);

  // Manual Check Status Handler (no auto-polling loops spamming network)
  const handleCheckStatus = async () => {
    if (isCheckingStatus || isCheckingStatusRef.current || !projectId) return;
    isCheckingStatusRef.current = true;
    setIsCheckingStatus(true);
    try {
      const res = await getProjectSuggestionsStatus(projectId);
      if (res?.success) {
        const status = res.data?.suggestionStatus;
        if (status) {
          setSuggestionStatus(status);
          setBriefTooThin(Boolean(res.data?.briefTooThin));
          if (status === "ready") {
            toastRef.current?.success("✨ AI Discovery suggestions are ready!");
            await fetchQuestionsOnly(projectId);
          } else if (status === "failed") {
            toastRef.current?.error(res.data?.suggestionError || "AI suggestion generation failed.");
          } else if (status === "running") {
            toastRef.current?.info("AI analysis is still in progress. Please check again in a moment.");
          }
        }
      } else {
        toastRef.current?.error(res?.message || "Could not check suggestion status.");
      }
    } catch {
      toastRef.current?.error("Error checking suggestion status.");
    } finally {
      setIsCheckingStatus(false);
      isCheckingStatusRef.current = false;
    }
  };

  // Trigger Re-run AI Suggestions (strictly guarded against duplicate clicks)
  const handleRegenerateAi = async () => {
    if (isRegeneratingAi || isRegeneratingAiRef.current || !projectId) return;
    isRegeneratingAiRef.current = true;
    setIsRegeneratingAi(true);

    try {
      const res = await regenerateProjectAiSuggestions(projectId);
      if (res?.success) {
        setSuggestionStatus("running");
        toastRef.current?.success("AI suggestion analysis started in background!");
      } else {
        toastRef.current?.error(res?.message || "Could not trigger AI suggestions.");
      }
    } catch {
      toastRef.current?.error("Failed to trigger AI suggestions.");
    } finally {
      setIsRegeneratingAi(false);
      isRegeneratingAiRef.current = false;
    }
  };

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

  // Delete Question Handler
  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Are you sure you want to delete this custom question?")) return;
    try {
      setSavingQuestionId(questionId);
      const res = await deleteProjectQuestion(questionId, projectId);
      if (res?.success) {
        toast.success("Question deleted successfully.");
        void fetchQuestionsOnly(projectId);
      } else {
        toast.error(res?.message || "Could not delete question.");
      }
    } catch {
      toast.error("Failed to delete question.");
    } finally {
      setSavingQuestionId(null);
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

  // Accept AI Suggested Question (suggested -> pending)
  const handleAcceptSuggestion = async (questionId) => {
    try {
      setSavingQuestionId(questionId);
      const res = await updateProjectQuestion(questionId, { status: "pending" }, projectId);
      if (res?.success) {
        toast.success("Question accepted into discovery backlog!");
        void fetchQuestionsOnly(projectId);
      } else {
        toast.error(res?.message || "Could not accept suggestion.");
      }
    } catch {
      toast.error("Failed to accept suggestion.");
    } finally {
      setSavingQuestionId(null);
    }
  };

  // Dismiss AI Suggested Question (suggested -> skipped)
  const handleDismissSuggestion = async (questionId) => {
    try {
      setSavingQuestionId(questionId);
      const res = await updateProjectQuestion(questionId, { status: "skipped" }, projectId);
      if (res?.success) {
        toast.success("Suggestion dismissed.");
        void fetchQuestionsOnly(projectId);
      } else {
        toast.error(res?.message || "Could not dismiss suggestion.");
      }
    } catch {
      toast.error("Failed to dismiss suggestion.");
    } finally {
      setSavingQuestionId(null);
    }
  };

  // Accept Skip Recommendation (status -> skipped)
  const handleAcceptSkipRecommendation = async (questionId) => {
    try {
      setSavingQuestionId(questionId);
      const res = await updateProjectQuestion(questionId, { status: "skipped" }, projectId);
      if (res?.success) {
        toast.success("Question marked as skipped per AI suggestion.");
        void fetchQuestionsOnly(projectId);
      } else {
        toast.error(res?.message || "Could not update question.");
      }
    } catch {
      toast.error("Failed to accept skip recommendation.");
    } finally {
      setSavingQuestionId(null);
    }
  };

  // Keep Question (dismiss skip suggestion: skipSuggested -> false)
  const handleKeepQuestion = async (questionId) => {
    try {
      setSavingQuestionId(questionId);
      const res = await updateProjectQuestion(questionId, { skipSuggested: false }, projectId);
      if (res?.success) {
        toast.success("Skip recommendation dismissed; question retained.");
        void fetchQuestionsOnly(projectId);
      } else {
        toast.error(res?.message || "Could not update question.");
      }
    } catch {
      toast.error("Failed to dismiss skip recommendation.");
    } finally {
      setSavingQuestionId(null);
    }
  };

  // Handle Question Status Change
  const handleUpdateStatus = async (questionId, newStatus) => {
    try {
      setSavingQuestionId(questionId);
      const res = await updateProjectQuestion(questionId, { status: newStatus }, projectId);
      if (res?.success) {
        toast.success(`Question status updated to ${newStatus}`);
        void fetchQuestionsOnly(projectId);
      } else {
        toast.error(res?.message || "Could not update status.");
      }
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setSavingQuestionId(null);
    }
  };

  // Handle Question Answer Submit
  const handleSaveAnswer = async (question) => {
    const editState = editingAnswers[question.id];
    if (!editState?.answerText?.trim()) {
      toast.error("Answer cannot be empty.");
      return;
    }

    try {
      setSavingQuestionId(question.id);

      // Backend status machine: pending -> asked -> answered
      // If currently pending, transition through asked to satisfy server validation
      if (question.status === "pending") {
        await updateProjectQuestion(question.id, { status: "asked" }, projectId);
      }

      const payload = {
        status: "answered",
        answerText: editState.answerText.trim(),
        answeredInMeetingId: editState.meetingId || null,
      };

      const res = await updateProjectQuestion(question.id, payload, projectId);
      if (res?.success) {
        toast.success("Answer confirmed and recorded!");
        setEditingAnswers((prev) => ({
          ...prev,
          [question.id]: { ...prev[question.id], isOpen: false },
        }));
        void fetchQuestionsOnly(projectId);
      } else {
        toast.error(res?.message || "Failed to save answer.");
      }
    } catch {
      toast.error("Error saving answer.");
    } finally {
      setSavingQuestionId(null);
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

  // Toggle Collapse Topic
  const toggleTopicCollapse = (topicId) => {
    setCollapsedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
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
    const skipRecommended = allQuestions.filter((q) => q.skipSuggested && q.status !== "skipped").length;
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { total, answered, asked, pending, suggested, skipped, skipRecommended, progress };
  }, [allQuestions]);

  // Filtered Topics & Questions List based on current search & filters
  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => {
        if (selectedTopicFilter !== "all" && (t.id || t._id || t.key) !== selectedTopicFilter) {
          return false;
        }
        return true;
      })
      .map((t) => {
        const matchingQuestions = (t.questions || []).filter((q) => {
          // Status filter
          if (questionStatusFilter === "suggested" && q.status !== "suggested") return false;
          if (questionStatusFilter === "pending" && q.status !== "pending") return false;
          if (questionStatusFilter === "asked" && q.status !== "asked") return false;
          if (questionStatusFilter === "answered" && q.status !== "answered") return false;
          if (questionStatusFilter === "skipped" && q.status !== "skipped") return false;
          if (questionStatusFilter === "skipSuggested" && (!q.skipSuggested || q.status === "skipped")) return false;

          // Search Query
          if (questionSearchQuery.trim()) {
            const query = questionSearchQuery.toLowerCase();
            const textMatch = q.text?.toLowerCase().includes(query);
            const reasonMatch = q.reason?.toLowerCase().includes(query);
            const answerMatch = q.answerText?.toLowerCase().includes(query);
            const topicMatch = t.title?.toLowerCase().includes(query);
            if (!textMatch && !reasonMatch && !answerMatch && !topicMatch) {
              return false;
            }
          }

          return true;
        });

        return {
          ...t,
          questions: matchingQuestions,
          totalInTopic: t.questions?.length || 0,
          answeredInTopic: (t.questions || []).filter((q) => q.status === "answered").length,
        };
      })
      .filter((t) => {
        // If searching or filtering, hide empty topics
        if (questionStatusFilter !== "all" || questionSearchQuery.trim()) {
          return t.questions.length > 0;
        }
        return true;
      });
  }, [topics, questionStatusFilter, selectedTopicFilter, questionSearchQuery]);

  if (isLoading && !project) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link href="/projects" className="hover:text-gray-900 transition">
          Projects
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold truncate max-w-xs">{project?.name}</span>
      </nav>

      {/* Modern Light Project Header */}
      <ProjectHeader
        project={project}
        onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        onOpenEditModal={() => setIsEditProjectModalOpen(true)}
        onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        onUpdateStage={handleUpdateStage}
        isUpdatingStage={isUpdatingStage}
      />

      {/* Google Calendar Connect Banner */}
      <GoogleCalendarConnect onConnected={() => loadData(projectId)} />

      {/* Workspace Tabs */}
      {(() => {
        const isDeepDiscovery = project?.stage === "discovery";
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("questions")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "questions"
                    ? "bg-blue-50 text-[#2563EB] border border-blue-200/80 shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                {isDeepDiscovery ? (
                  <>
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>Deep Discovery & Transcripts</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        activeTab === "questions"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {transcripts.length}
                    </span>
                  </>
                ) : (
                  <>
                    <QuestionMarkCircleIcon className="h-4 w-4" />
                    <span>Discovery Matrix</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        activeTab === "questions"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stats.answered}/{stats.total}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("meetings")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "meetings"
                    ? "bg-blue-50 text-[#2563EB] border border-blue-200/80 shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                <CalendarDaysIcon className="h-4 w-4" />
                <span>Alignments & Meetings</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "meetings"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {meetings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("contacts")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "contacts"
                    ? "bg-blue-50 text-[#2563EB] border border-blue-200/80 shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                <UserGroupIcon className="h-4 w-4" />
                <span>Key Stakeholders</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "contacts"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {contacts.length}
                </span>
              </button>
            </div>

            {/* Global Tab Actions */}
            <div className="flex items-center gap-2">
              {activeTab === "questions" && (
                <>
                  {isDeepDiscovery && (
                    <button
                      type="button"
                      onClick={() => setShowDayOneQuestions((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition"
                      title="Switch between Deep Discovery transcripts and Day 1 questionnaire"
                    >
                      {showDayOneQuestions ? (
                        <>
                          <DocumentTextIcon className="h-4 w-4 text-[#2563EB]" />
                          <span>Switch to Transcripts</span>
                        </>
                      ) : (
                        <>
                          <InformationCircleIcon className="h-4 w-4 text-[#2563EB]" />
                          <span>View Day 1 Questionnaire</span>
                        </>
                      )}
                    </button>
                  )}

                  {(!isDeepDiscovery || showDayOneQuestions) && (
                    <>
                      <button
                        type="button"
                        onClick={handleCopyAgenda}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition"
                        title="Copy formatted discovery checklist to clipboard"
                      >
                        {copiedAgenda ? (
                          <>
                            <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                            <span>Copy Agenda</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAddQuestionModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2563EB] transition shadow-xs"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                        <span>Add Question</span>
                      </button>
                    </>
                  )}
                </>
              )}

              {activeTab === "meetings" && (
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition shadow-xs"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>Schedule Call</span>
                </button>
              )}

              {activeTab === "contacts" && (
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition shadow-xs"
                >
                  <UserPlusIcon className="h-3.5 w-3.5" />
                  <span>Add Stakeholder</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* TAB 1: DISCOVERY MATRIX OR DEEP DISCOVERY TRANSCRIPTS */}
      {/* ============================================================== */}
      {activeTab === "questions" && (
        project?.stage === "discovery" && !showDayOneQuestions ? (
          <DeepDiscoveryTranscripts
            projectId={projectId}
            meetings={meetings}
            transcripts={transcripts}
            onRefreshTranscripts={() => fetchTranscriptsOnly(projectId)}
            onSwitchToQuestions={() => setShowDayOneQuestions(true)}
            toast={toastRef.current}
          />
        ) : (
          <div className="space-y-6">
            {project?.stage === "discovery" && showDayOneQuestions && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <InformationCircleIcon className="h-5 w-5 text-[#2563EB] shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">
                      Viewing Day 1 Baseline Questions (Stage: Deep Discovery)
                    </h4>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      These questions represent the initial discovery baseline. The active project stage is Deep Discovery.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDayOneQuestions(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] shadow-2xs transition shrink-0"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Return to Transcripts</span>
                </button>
              </div>
            )}
          {/* AI Suggestion Status Banner */}
          {suggestionStatus === "running" && (
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                    <SparklesIcon className="h-5 w-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">
                      AI Suggestion Engine is Analyzing Project Brief…
                    </h4>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Synthesizing requirements to generate tailored discovery questions and mark template items that can be skipped.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    disabled={isCheckingStatus}
                    onClick={handleCheckStatus}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-50 disabled:opacity-50 shadow-2xs transition"
                  >
                    <ArrowPathIcon className={`h-3.5 w-3.5 ${isCheckingStatus ? "animate-spin" : ""}`} />
                    <span>{isCheckingStatus ? "Checking…" : "Check Status"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {suggestionStatus === "ready" && stats.suggested > 0 && (
            <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50/70 to-indigo-50/50 p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-950">
                      AI Generated {stats.suggested} Custom Discovery Question{stats.suggested > 1 ? "s" : ""}
                    </h4>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      Review the tailored suggestions highlighted with purple badges below, and accept them into your backlog.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isRegeneratingAi}
                  onClick={handleRegenerateAi}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-50 shadow-xs transition self-start sm:self-auto shrink-0"
                >
                  <ArrowPathIcon className={`h-3.5 w-3.5 ${isRegeneratingAi ? "animate-spin" : ""}`} />
                  <span>Re-run Analysis</span>
                </button>
              </div>
            </div>
          )}

          {briefTooThin && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 flex items-start gap-3">
              <InformationCircleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-amber-950">Project brief is concise: </span>
                <span>
                  The AI kept suggested additions minimal to avoid making assumptions. Update the project description in &quot;Edit Details&quot; anytime and re-run analysis to unlock domain-specific discovery questions.
                </span>
              </div>
            </div>
          )}

          {suggestionStatus === "failed" && (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <InformationCircleIcon className="h-5 w-5 text-red-600 shrink-0" />
                <p className="text-xs text-red-900 font-medium">
                  AI suggestions could not complete. You can still proceed with standard Day 1 templates or try again.
                </p>
              </div>
              <button
                type="button"
                disabled={isRegeneratingAi}
                onClick={handleRegenerateAi}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 transition shadow-2xs shrink-0"
              >
                <ArrowPathIcon className={`h-3.5 w-3.5 ${isRegeneratingAi ? "animate-spin" : ""}`} />
                <span>{isRegeneratingAi ? "Retrying…" : "Retry"}</span>
              </button>
            </div>
          )}

          {/* Discovery Metrics & Progress Dashboard Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Discovery Matrix Completion</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirm client requirements across the 8 essential discovery topics before proceeding to delivery.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-36 sm:w-48 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-900 min-w-[36px]">{stats.progress}%</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-gray-100">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</span>
                <p className="text-base font-black text-gray-900">{stats.total}</p>
              </div>

              <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Pending</span>
                <p className="text-base font-black text-blue-900">{stats.pending}</p>
              </div>

              <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">In Meeting</span>
                <p className="text-base font-black text-amber-900">{stats.asked}</p>
              </div>

              <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Answered</span>
                <p className="text-base font-black text-emerald-900">{stats.answered}</p>
              </div>

              <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-2.5 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center justify-center gap-1">
                  <SparklesIcon className="h-3 w-3" />
                  Suggested
                </span>
                <p className="text-base font-black text-purple-900">{stats.suggested}</p>
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs space-y-3">
            {/* Top Row: Search and Topic Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Question Search Input */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={questionSearchQuery}
                  onChange={(e) => setQuestionSearchQuery(e.target.value)}
                  placeholder="Search questions by keyword (e.g. tech, budget, deadline)…"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-8 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none shadow-2xs"
                />
                {questionSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setQuestionSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Topic Select */}
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-gray-400 shrink-0 hidden sm:block" />
                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#2563EB] shadow-2xs w-full sm:w-auto"
                >
                  <option value="all">All Topics ({topics.length})</option>
                  {topics.map((t) => (
                    <option key={t.id || t._id || t.key} value={t.id || t._id || t.key}>
                      {t.title} ({(t.questions || []).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom Row: Quick Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1">Status:</span>

              <button
                type="button"
                onClick={() => setQuestionStatusFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  questionStatusFilter === "all"
                    ? "bg-gray-900 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({stats.total})
              </button>

              {stats.suggested > 0 && (
                <button
                  type="button"
                  onClick={() => setQuestionStatusFilter("suggested")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    questionStatusFilter === "suggested"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                  }`}
                >
                  <SparklesIcon className="h-3 w-3" />
                  <span>AI Suggested ({stats.suggested})</span>
                </button>
              )}

              {stats.skipRecommended > 0 && (
                <button
                  type="button"
                  onClick={() => setQuestionStatusFilter("skipSuggested")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    questionStatusFilter === "skipSuggested"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  <LightBulbIcon className="h-3 w-3" />
                  <span>AI Skip Recs ({stats.skipRecommended})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setQuestionStatusFilter("pending")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  questionStatusFilter === "pending"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                Pending ({stats.pending})
              </button>

              <button
                type="button"
                onClick={() => setQuestionStatusFilter("asked")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  questionStatusFilter === "asked"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                Asked ({stats.asked})
              </button>

              <button
                type="button"
                onClick={() => setQuestionStatusFilter("answered")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  questionStatusFilter === "answered"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Answered ({stats.answered})
              </button>

              <button
                type="button"
                onClick={() => setQuestionStatusFilter("skipped")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  questionStatusFilter === "skipped"
                    ? "bg-gray-600 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Skipped ({stats.skipped})
              </button>
            </div>
          </div>

          {/* Topics and Questions List */}
          {filteredTopics.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
              <QuestionMarkCircleIcon className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
              <h3 className="mt-3 text-sm font-bold text-gray-900">No matching questions</h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                No discovery questions matched your search query or status filter.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuestionStatusFilter("all");
                    setSelectedTopicFilter("all");
                    setQuestionSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Custom Question
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredTopics.map((topic, topicIdx) => {
                const topicKey = topic.id || topic._id || topic.key;
                const isCollapsed = Boolean(collapsedTopics[topicKey]);
                const qList = topic.questions || [];

                return (
                  <div
                    key={topicKey}
                    className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden transition"
                  >
                    {/* Topic Header Accordion */}
                    <div className="p-5 flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100 text-xs font-bold mt-0.5">
                          {topicIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900">{topic.title}</h4>
                            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                              {topic.answeredInTopic}/{topic.totalInTopic} answered
                            </span>
                          </div>
                          {topic.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{topic.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setNewQuestionTopicId(topic.id || topic._id);
                            setIsAddQuestionModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
                        >
                          <PlusIcon className="h-3 w-3" />
                          <span>Add</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleTopicCollapse(topicKey)}
                          className="rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          title={isCollapsed ? "Expand Topic" : "Collapse Topic"}
                        >
                          {isCollapsed ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronUpIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Questions in this topic */}
                    {!isCollapsed && (
                      <div className="p-5 space-y-3">
                        {qList.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-2">
                            No questions match current filter in this section.
                          </p>
                        ) : (
                          qList.map((question) => {
                            const isAnswered = question.status === "answered";
                            const isAsked = question.status === "asked";
                            const isSkipped = question.status === "skipped";
                            const isPending = question.status === "pending";
                            const isSuggested = question.status === "suggested";
                            const isAiSource = question.source === "brief_ai";
                            const isCustomPm = question.source === "pm_added";
                            const hasSkipRecommendation = question.skipSuggested && !isSkipped;

                            const editState = editingAnswers[question.id] || {
                              isOpen: false,
                              answerText: question.answerText || "",
                              meetingId: question.answeredInMeetingId || "",
                            };

                            return (
                              <div
                                key={question.id || question._id}
                                className={`rounded-xl border p-4 transition-all duration-150 ${
                                  isAnswered
                                    ? "border-emerald-200 bg-emerald-50/25"
                                    : isSkipped
                                    ? "border-gray-200 bg-gray-50/50 opacity-60"
                                    : isSuggested
                                    ? "border-purple-300 bg-purple-50/30 ring-1 ring-purple-400/20 shadow-xs"
                                    : isAsked
                                    ? "border-amber-200 bg-amber-50/30"
                                    : "border-gray-200 bg-white hover:border-gray-300 shadow-2xs"
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                  {/* Left: Badges & Question Text */}
                                  <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {/* Status Badge */}
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                          isAnswered
                                            ? "bg-emerald-100 text-emerald-800"
                                            : isAsked
                                            ? "bg-amber-100 text-amber-800"
                                            : isSkipped
                                            ? "bg-gray-100 text-gray-600"
                                            : isSuggested
                                            ? "bg-purple-100 text-purple-800 flex items-center gap-1"
                                            : "bg-blue-100 text-blue-800"
                                        }`}
                                      >
                                        {isSuggested && <SparklesIcon className="h-2.5 w-2.5" />}
                                        {question.status}
                                      </span>

                                      {/* Source Badge */}
                                      {isAiSource && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/70 border border-purple-200 text-purple-800 px-2 py-0.5 text-[9px] font-bold">
                                          <SparklesIcon className="h-2.5 w-2.5" />
                                          <span>AI Tailored</span>
                                        </span>
                                      )}

                                      {isCustomPm && (
                                        <span className="rounded-full bg-violet-50 border border-violet-200 text-violet-700 px-2 py-0.5 text-[9px] font-semibold">
                                          Custom PM
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug pt-0.5">
                                      {question.text}
                                    </p>

                                    {/* AI Suggestion Reason Box */}
                                    {isAiSource && question.reason && (
                                      <div className="mt-2 rounded-xl bg-purple-50/90 border border-purple-200/90 p-2.5 text-xs text-purple-950 flex items-start gap-2 shadow-2xs">
                                        <SparklesIcon className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                                        <div className="leading-relaxed">
                                          <span className="font-bold text-purple-900">Why AI tailored this: </span>
                                          <span>{question.reason}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* AI Skip Recommendation Notice */}
                                    {hasSkipRecommendation && (
                                      <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200/90 p-2.5 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                                        <div className="flex items-start gap-2">
                                          <LightBulbIcon className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                          <div>
                                            <span className="font-bold text-amber-900">AI Recommendation: </span>
                                            <span>
                                              {question.skipReason || "Brief appears to answer this question. You may skip it to save time."}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                          <button
                                            type="button"
                                            disabled={savingQuestionId === question.id}
                                            onClick={() => handleAcceptSkipRecommendation(question.id)}
                                            className="px-2 py-0.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 text-[11px] transition shadow-2xs"
                                          >
                                            Accept Skip
                                          </button>
                                          <button
                                            type="button"
                                            disabled={savingQuestionId === question.id}
                                            onClick={() => handleKeepQuestion(question.id)}
                                            className="px-2 py-0.5 rounded-lg border border-amber-300 bg-white text-amber-900 font-semibold hover:bg-amber-100 text-[11px] transition"
                                          >
                                            Keep
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Answer Display */}
                                    {isAnswered && question.answerText && (
                                      <div className="mt-2.5 rounded-xl bg-white border border-emerald-200/80 p-3 text-xs text-gray-800 shadow-2xs">
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                                            <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                                            <span>Confirmed Client Answer:</span>
                                          </p>
                                          {question.answeredAt && (
                                            <span className="text-[10px] text-gray-400">
                                              {new Date(question.answeredAt).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                        <p className="whitespace-pre-wrap leading-relaxed font-medium text-gray-900">
                                          {question.answerText}
                                        </p>
                                        {question.answeredInMeetingId && (
                                          <p className="mt-2 pt-1.5 border-t border-emerald-100 text-[10px] text-gray-500 flex items-center gap-1">
                                            <CalendarDaysIcon className="h-3 w-3 text-emerald-600" />
                                            <span>Documented in alignment call</span>
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: Actions */}
                                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                    {/* AI Suggested Question Actions */}
                                    {isSuggested && (
                                      <>
                                        <button
                                          type="button"
                                          disabled={savingQuestionId === question.id}
                                          onClick={() => handleAcceptSuggestion(question.id)}
                                          className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-purple-700 transition shadow-2xs"
                                          title="Accept question into discovery backlog"
                                        >
                                          <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                                          <span>Accept</span>
                                        </button>
                                        <button
                                          type="button"
                                          disabled={savingQuestionId === question.id}
                                          onClick={() => handleDismissSuggestion(question.id)}
                                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-2xs"
                                          title="Dismiss suggestion"
                                        >
                                          <XMarkIcon className="h-3.5 w-3.5" />
                                          <span>Dismiss</span>
                                        </button>
                                      </>
                                    )}

                                    {/* Edit / Answer toggle button */}
                                    {!isSuggested && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingAnswers((prev) => ({
                                            ...prev,
                                            [question.id]: {
                                              isOpen: !editState.isOpen,
                                              answerText: editState.answerText || question.answerText || "",
                                              meetingId: editState.meetingId || question.answeredInMeetingId || "",
                                            },
                                          }))
                                        }
                                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition shadow-2xs ${
                                          editState.isOpen
                                            ? "bg-gray-200 text-gray-800"
                                            : isAnswered
                                            ? "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                            : "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                                        }`}
                                      >
                                        <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                                        <span>{isAnswered ? "Edit Answer" : "Answer"}</span>
                                      </button>
                                    )}

                                    {/* Move Pending -> Asked */}
                                    {isPending && (
                                      <button
                                        type="button"
                                        disabled={savingQuestionId === question.id}
                                        onClick={() => handleUpdateStatus(question.id, "asked")}
                                        className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition shadow-2xs"
                                        title="Mark as Asked in meeting"
                                      >
                                        Mark Asked
                                      </button>
                                    )}

                                    {/* Reopen Answered -> Asked */}
                                    {isAnswered && (
                                      <button
                                        type="button"
                                        disabled={savingQuestionId === question.id}
                                        onClick={() => handleUpdateStatus(question.id, "asked")}
                                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-2xs"
                                        title="Reopen question"
                                      >
                                        Reopen
                                      </button>
                                    )}

                                    {/* Skip / Dismiss */}
                                    {!isSkipped && !isAnswered && !isSuggested && (
                                      <button
                                        type="button"
                                        disabled={savingQuestionId === question.id}
                                        onClick={() => handleUpdateStatus(question.id, "skipped")}
                                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 shadow-2xs"
                                        title="Skip question"
                                      >
                                        Skip
                                      </button>
                                    )}

                                    {/* Restore Skipped */}
                                    {isSkipped && (
                                      <button
                                        type="button"
                                        disabled={savingQuestionId === question.id}
                                        onClick={() => handleUpdateStatus(question.id, "pending")}
                                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2563EB] hover:bg-blue-100 shadow-2xs"
                                        title="Restore to pending"
                                      >
                                        Restore
                                      </button>
                                    )}

                                    {/* Delete custom question */}
                                    {isCustomPm && !isAnswered && (
                                      <button
                                        type="button"
                                        disabled={savingQuestionId === question.id}
                                        onClick={() => handleDeleteQuestion(question.id)}
                                        className="rounded-lg border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100 shadow-2xs"
                                        title="Delete custom question"
                                      >
                                        <TrashIcon className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Expandable Answer Drawer */}
                                {editState.isOpen && (
                                  <div className="mt-3 pt-3 border-t border-gray-200/80 space-y-3 animate-in fade-in duration-150">
                                    <div>
                                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Client Response / Confirmed Requirement *
                                      </label>
                                      <textarea
                                        rows={3}
                                        value={editState.answerText}
                                        onChange={(e) =>
                                          setEditingAnswers((prev) => ({
                                            ...prev,
                                            [question.id]: {
                                              ...editState,
                                              answerText: e.target.value,
                                            },
                                          }))
                                        }
                                        placeholder="Record confirmed answer, client requirements, or stakeholder decisions…"
                                        className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-1 focus:ring-blue-500/20 focus:outline-none shadow-2xs"
                                      />
                                    </div>

                                    {meetings.length > 0 && (
                                      <div>
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                          Link to Alignment Call (Optional)
                                        </label>
                                        <select
                                          value={editState.meetingId}
                                          onChange={(e) =>
                                            setEditingAnswers((prev) => ({
                                              ...prev,
                                              [question.id]: {
                                                ...editState,
                                                meetingId: e.target.value,
                                              },
                                            }))
                                          }
                                          className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-800 focus:border-[#2563EB] focus:outline-none"
                                        >
                                          <option value="">-- No Meeting Linked (Answered Async) --</option>
                                          {meetings.map((m) => (
                                            <option key={m.id || m._id} value={m.id || m._id}>
                                              {m.title} ({new Date(m.startTime).toLocaleDateString()})
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingAnswers((prev) => ({
                                            ...prev,
                                            [question.id]: { ...editState, isOpen: false },
                                          }))
                                        }
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        disabled={savingQuestionId === question.id}
                                        onClick={() => handleSaveAnswer(question)}
                                        className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-xs"
                                      >
                                        {savingQuestionId === question.id ? "Saving…" : "Save Answer"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )
      )}

      {/* ============================================================== */}
      {/* TAB 2: ALIGNMENTS & MEETINGS */}
      {/* ============================================================== */}
      {activeTab === "meetings" && (
        <div className="space-y-5">
          {meetings.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
              <CalendarDaysIcon className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
              <h3 className="mt-3 text-sm font-bold text-gray-900">No calls scheduled</h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                Schedule a discovery alignment with your client. Google Meet room links are generated automatically.
              </p>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
              >
                <PlusIcon className="h-4 w-4" />
                Schedule First Call
              </button>
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

      {/* ============================================================== */}
      {/* TAB 3: CLIENT STAKEHOLDERS & CONTACTS */}
      {/* ============================================================== */}
      {activeTab === "contacts" && (
        <div className="space-y-5">
          {contacts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
              <UserGroupIcon className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
              <h3 className="mt-3 text-sm font-bold text-gray-900">No client stakeholders added</h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                Add client decision makers, technical champions, and points of contact to streamline discovery communication.
              </p>
              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
              >
                <UserPlusIcon className="h-4 w-4" />
                Add First Stakeholder
              </button>
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
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
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

      {/* ============================================================== */}
      {/* MODAL 1: ADD CUSTOM QUESTION */}
      {/* ============================================================== */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Add Discovery Question
              </h3>
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomQuestion} className="mt-4 space-y-4">
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
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingQuestion}
                  className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {isAddingQuestion ? "Adding…" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: SCHEDULE MEETING */}
      {/* ============================================================== */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <VideoCameraIcon className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Schedule Project Alignment Call
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4">
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
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {isScheduling ? "Generating Meet Link…" : "Confirm & Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT PROJECT DETAILS */}
      {/* ============================================================== */}
      {isEditProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <PencilSquareIcon className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Edit Project Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProjectModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectDetails} className="mt-4 space-y-4">
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
                <button
                  type="button"
                  onClick={() => setIsEditProjectModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {isSavingProject ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: DELETE PROJECT CONFIRMATION */}
      {/* ============================================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Project?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">{project?.name}</span>? All discovery questions, answers, and meetings associated with this project will be removed.
            </p>

            <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProject}
                onClick={handleDeleteProject}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 shadow-xs"
              >
                {isDeletingProject ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: ADD STAKEHOLDER CONTACT */}
      {/* ============================================================== */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlusIcon className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Add Client Stakeholder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="mt-4 space-y-4">
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
                  className="rounded border-gray-300 text-[#2563EB] focus:ring-blue-500"
                />
                <label htmlFor="decisionMaker" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Primary Decision Maker (Signs off on scope & requirements)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingContact}
                  className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {isAddingContact ? "Adding…" : "Add Stakeholder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
