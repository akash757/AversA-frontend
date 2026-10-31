"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Ui/Toast";
import Skeleton from "@/components/Ui/Skeleton";
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
import { getProjectTranscripts, getProjectParticipants } from "@/features/transcript/transcript";
import { getValidAccessToken, silentRefresh, getAccessToken, BASE_URL } from "@/lib/api/api";
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
  DocumentCheckIcon,
  ShieldCheckIcon,
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
  const [activeTab, setActiveTab] = useState("questions"); // "questions" | "meetings" | "contacts" | "items" | "baselines"
  const [participants, setParticipants] = useState([]);
  const [isDiscussionSheetOpen, setIsDiscussionSheetOpen] = useState(false);

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

  if (isLoading && !project) return <Skeleton.ProjectDetail />;

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

              <button
                type="button"
                onClick={() => setActiveTab("items")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "items"
                    ? "bg-blue-50 text-[#2563EB] border border-blue-200/80 shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                <DocumentCheckIcon className="h-4 w-4" />
                <span>Discovered Items</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("baselines")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "baselines"
                    ? "bg-blue-50 text-[#2563EB] border border-blue-200/80 shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                <ShieldCheckIcon className="h-4 w-4" />
                <span>Baselines</span>
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
                        onClick={() => setIsDiscussionSheetOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-100 shadow-xs transition"
                        title="Open client discovery discussion sheet"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span>Discussion Sheet</span>
                      </button>

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
            onViewItems={() => setActiveTab("items")}
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
      {/* TAB 4: DISCOVERED ITEMS REVIEW BOARD */}
      {/* ============================================================== */}
      {activeTab === "items" && (
        <ExtractedItemsBoard
          projectId={projectId}
          transcripts={transcripts}
          participants={participants}
          toast={toastRef.current}
          onRefreshProject={() => loadData(projectId)}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 5: REQUIREMENT BASELINES */}
      {/* ============================================================== */}
      {activeTab === "baselines" && (
        <BaselineManager
          projectId={projectId}
          userRole={project?.currentUserRole || "product_manager"}
          topics={topics}
          toast={toastRef.current}
          onRefreshProject={() => loadData(projectId)}
        />
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
      {/* Discussion Sheet Modal */}
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
