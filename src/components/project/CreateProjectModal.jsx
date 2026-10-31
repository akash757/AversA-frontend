"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Ui/Toast";
import Modal from "@/components/Ui/Modal";
import Button from "@/components/Ui/Button";
import Badge from "@/components/Ui/Badge";
import FormField from "@/components/Ui/FormField";
import Input from "@/components/Ui/Input";
import Select from "@/components/Ui/Select";
import Textarea from "@/components/Ui/Textarea";
import TagInput from "@/components/Ui/TagInput";
import ModernDateInput from "@/components/Ui/ModernDateInput";
import { createProject } from "@/features/project/project";
import {
  XMarkIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  FolderIcon,
  UserGroupIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const DEFAULT_FORM = {
  name: "",
  clientNames: [],
  stage: "day_one",
  status: "planning",
  priority: "medium",
  startDate: "",
  endDate: "",
  techStack: [],
  description: "",
};

const TECH_SUGGESTIONS = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Tailwind CSS",
  "Python",
  "Docker",
  "GraphQL",
  "Redis",
];

const STAGE_LABELS = {
  day_one: "Day 1 Discovery",
  discovery: "Deep Discovery",
  requirements_confirmed: "Requirements Confirmed",
};

const STATUS_LABELS = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PRIORITY_LABELS = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
  critical: "Critical",
};

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleClose = useCallback(() => {
    setStep(1);
    setForm(DEFAULT_FORM);
    setErrors({});
    onClose?.();
  }, [onClose]);

  const validateStep1 = useCallback(() => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = "Project name must be at least 2 characters.";
    }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      errs.endDate = "Target delivery date cannot be earlier than start date.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form.name, form.startDate, form.endDate]);

  const handleNextStep = useCallback((e) => {
    e?.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  }, [validateStep1]);

  const validateStep2 = useCallback(() => {
    const errs = {};
    if (!form.description.trim() || form.description.trim().length < 10) {
      errs.description = "Project description must be at least 10 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form.description]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        clientName: form.clientNames.length > 0 ? form.clientNames.join(", ") : undefined,
        status: form.status,
        priority: form.priority,
        stage: form.stage,
        techStack: form.techStack,
      };

      if (form.startDate) {
        payload.startDate = new Date(form.startDate).toISOString();
      }
      if (form.endDate) {
        payload.endDate = new Date(form.endDate).toISOString();
      }

      const res = await createProject(payload);
      setIsSubmitting(false);

      if (!res?.success) {
        toast.error(res?.message || "Failed to create project.");
        return;
      }

      toast.success("Project created! Navigating to Discovery Matrix...");
      const createdId = res.data?.project?.id || res.data?.project?._id;

      handleClose();

      if (onSuccess) {
        onSuccess(res.data?.project);
      }

      if (createdId) {
        router.push(`/projects/${createdId}`);
      }
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err?.message || "An unexpected error occurred.");
    }
  }, [form, validateStep2, toast, handleClose, onSuccess, router]);

  // Keyboard shortcut: Cmd/Ctrl + Enter to proceed/submit
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (step === 1) {
          handleNextStep();
        } else if (step === 2 && !isSubmitting) {
          handleSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, step, isSubmitting, handleNextStep, handleSubmit]);

  const toggleTechChip = (tech) => {
    setForm((prev) => {
      const exists = prev.techStack.includes(tech);
      return {
        ...prev,
        techStack: exists
          ? prev.techStack.filter((t) => t !== tech)
          : [...prev.techStack, tech],
      };
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      hideCloseButton={true}
      className="max-w-2xl overflow-hidden shadow-2xl border border-[#E2E8F0]"
      bodyClassName="p-0"
    >
      {/* ── Modal Header & Stepper Track ─────────────────── */}
      <div className="border-b border-[#F1F5F9] bg-gradient-to-b from-[#F8FAFC] via-white to-white px-7 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-50/80">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight font-display">
                Create New Project
              </h2>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Set up project workspace, delivery targets, and discovery matrix.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* ── Modern Segmented Stepper Track ───────────────── */}
        <div className="mt-5 grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]/70">
          {/* Step 1 Tab */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              step === 1
                ? "bg-white text-[#2563EB] shadow-xs border border-[#E2E8F0]/80"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold transition ${
                step === 1
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : step > 1
                  ? "bg-[#ECFDF5] text-[#059669]"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {step > 1 ? <CheckIcon className="h-3 w-3 stroke-[2.5]" /> : "1"}
            </span>
            <span>Project Essentials</span>
          </button>

          {/* Step 2 Tab */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setStep(2);
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              step === 2
                ? "bg-white text-[#2563EB] shadow-xs border border-[#E2E8F0]/80"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold transition ${
                step === 2 ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-slate-200 text-slate-600"
              }`}
            >
              2
            </span>
            <span>Scope & Tech Stack</span>
          </button>
        </div>
      </div>

      {/* ── STEP 1: PROJECT ESSENTIALS ────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleNextStep}>
          <div className="px-7 py-5 space-y-5 max-h-[calc(85vh-210px)] overflow-y-auto">
            {/* Project Name */}
            <FormField
              label="Project Name"
              htmlFor="project-name"
              required
              error={errors.name}
            >
              <Input
                id="project-name"
                type="text"
                required
                autoFocus
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="e.g. AversA AI Discovery Workspace"
                prefix={<FolderIcon className="h-4 w-4 text-[#94A3B8]" />}
                error={errors.name}
              />
            </FormField>

            {/* Client / Stakeholders */}
            <FormField
              label="Client & Stakeholders"
              hint="Press Enter or comma to add multiple client entities or teams"
            >
              <TagInput
                tags={form.clientNames}
                onChange={(names) => setForm((prev) => ({ ...prev, clientNames: names }))}
                placeholder="Add client or team stakeholder..."
                suggestions={["Acme Corp", "Internal Venture", "FinTech Client"]}
                tagColor="blue"
                icon={UserGroupIcon}
              />
            </FormField>

            {/* Governance & Status (Stage, Status, Priority) */}
            <div className="rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC]/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Parameters & Governance
                </span>
                <span className="text-[11px] text-[#94A3B8]">Configures AI discovery matrix</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <FormField label="Stage">
                  <Select
                    value={form.stage}
                    onChange={(e) => setForm((prev) => ({ ...prev, stage: e.target.value }))}
                  >
                    <option value="day_one">🎯 Day 1 Discovery</option>
                    <option value="discovery">🔍 Deep Discovery</option>
                    <option value="requirements_confirmed">✅ Requirements Confirmed</option>
                  </Select>
                </FormField>

                <FormField label="Status">
                  <Select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="planning">📋 Planning</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="on_hold">⏸ On Hold</option>
                    <option value="completed">✓ Completed</option>
                    <option value="cancelled">✕ Cancelled</option>
                  </Select>
                </FormField>

                <FormField label="Priority">
                  <Select
                    value={form.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="critical">🔴 Critical</option>
                  </Select>
                </FormField>
              </div>
            </div>

            {/* Target Timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Target Timeline
                </span>
                <span className="text-[11px] text-[#94A3B8]">Optional delivery schedule</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModernDateInput
                  label="Target Start Date"
                  value={form.startDate}
                  onChange={(val) => {
                    setForm((prev) => ({ ...prev, startDate: val }));
                    if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: null }));
                  }}
                  placeholder="Select target start"
                />

                <ModernDateInput
                  label="Target Delivery Date"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={(val) => {
                    setForm((prev) => ({ ...prev, endDate: val }));
                    if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: null }));
                  }}
                  placeholder="Select target delivery"
                  helperText={errors.endDate}
                />
              </div>
              {errors.endDate && (
                <p className="text-xs font-medium text-[#DC2626] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]"></span>
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Step 1 Footer Action Bar */}
          <div className="flex items-center justify-between px-7 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]/80">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#94A3B8]">
                Press <kbd className="rounded border border-[#CBD5E1] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#475569] shadow-2xs">⌘ ↵</kbd>
              </span>

              <Button
                variant="secondary"
                size="md"
                type="submit"
                rightIcon={<ArrowRightIcon className="h-4 w-4" />}
              >
                Continue to Scope
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ── STEP 2: TECH STACK & SCOPE ─────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <div className="px-7 py-5 space-y-5 max-h-[calc(85vh-210px)] overflow-y-auto">
            {/* Tech Stack Selection with Interactive Chips */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CodeBracketIcon className="h-4 w-4 text-[#2563EB]" />
                  <label className="text-xs font-semibold text-[#0F172A]">
                    Tech Stack & Architecture
                  </label>
                </div>
                <span className="text-[11px] text-[#94A3B8]">Click to toggle or type custom tags</span>
              </div>

              {/* Interactive Quick-Pick Chips */}
              <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC]">
                {TECH_SUGGESTIONS.map((tech) => {
                  const isSelected = form.techStack.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTechChip(tech)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-2xs scale-[1.02]"
                          : "bg-white text-[#475569] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50"
                      }`}
                    >
                      {isSelected ? (
                        <CheckIcon className="h-3 w-3 stroke-[2.5]" />
                      ) : (
                        <PlusIcon className="h-3 w-3 text-[#94A3B8]" />
                      )}
                      <span>{tech}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Input */}
              <TagInput
                tags={form.techStack}
                onChange={(stack) => setForm((prev) => ({ ...prev, techStack: stack }))}
                placeholder="Type additional technology & press Enter..."
                tagColor="emerald"
                icon={CodeBracketIcon}
              />
            </div>

            {/* Project Scope Description */}
            <FormField
              label="Project Scope & Business Objectives"
              required
              error={errors.description}
              hint="Outline the client's business context, core functional deliverables, and success metrics."
            >
              <Textarea
                required
                autoFocus
                rows={4}
                maxLength={2000}
                value={form.description}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, description: e.target.value }));
                  if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                }}
                placeholder="e.g. Build an enterprise client discovery workspace with automated requirement mapping, real-time sync, and meeting analytics..."
                error={errors.description}
              />
            </FormField>

            {/* Quick Summary Pill of Step 1 */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Configured Essentials
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" />
                  Edit Essentials
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xs font-bold text-[#0F172A]">{form.name}</span>

                {form.clientNames.length > 0 && (
                  <Badge variant="neutral" size="sm">
                    {form.clientNames.join(", ")}
                  </Badge>
                )}

                <Badge variant="info" size="sm" dot>
                  {STAGE_LABELS[form.stage] || form.stage}
                </Badge>

                <Badge variant="brand" size="sm" dot>
                  {STATUS_LABELS[form.status] || form.status}
                </Badge>

                <Badge
                  variant={
                    form.priority === "critical"
                      ? "error"
                      : form.priority === "high"
                      ? "warning"
                      : "neutral"
                  }
                  size="sm"
                  dot
                >
                  {PRIORITY_LABELS[form.priority] || form.priority}
                </Badge>

                {(form.startDate || form.endDate) && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] ml-auto">
                    <CalendarDaysIcon className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {form.startDate || "TBD"} → {form.endDate || "TBD"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step 2 Footer Action Bar */}
          <div className="flex items-center justify-between px-7 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]/80">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setStep(1)}
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              Back to Essentials
            </Button>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#94A3B8]">
                Press <kbd className="rounded border border-[#CBD5E1] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#475569] shadow-2xs">⌘ ↵</kbd>
              </span>

              <Button
                variant="secondary"
                size="md"
                type="submit"
                loading={isSubmitting}
                leftIcon={<SparklesIcon className="h-4 w-4" />}
              >
                Create Project
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
