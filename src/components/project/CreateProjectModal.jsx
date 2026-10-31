"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Ui/Toast";
import TagInput from "@/components/Ui/TagInput";
import ModernDateInput from "@/components/Ui/ModernDateInput";
import Button from "@/components/Ui/Button";
import { createProject } from "@/features/project/project";
import {
  XMarkIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  CodeBracketIcon,
  ClipboardDocumentCheckIcon,
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

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setForm(DEFAULT_FORM);
    setErrors({});
    onClose();
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = "Project name must be at least 2 characters.";
    }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      errs.endDate = "End date cannot be earlier than start date.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = (e) => {
    e?.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.description.trim() || form.description.trim().length < 10) {
      errs.description = "Project description must be at least 10 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-gray-200 bg-white shadow-2xl transition-all my-8 overflow-hidden">
        {/* Modal Top Header with Stepper */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 p-6 pb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md shadow-blue-500/20">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Create New Project</h3>
                <p className="text-xs text-gray-500">Initiate Day 1 Discovery & Scope Orchestration</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 2-Step Progress Indicator */}
          <div className="flex items-center gap-3 pt-2">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex flex-1 items-center gap-2.5 rounded-xl border p-2.5 transition text-left ${
                step === 1
                  ? "border-[#2563EB] bg-blue-50/80 text-[#2563EB]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  step === 1
                    ? "bg-[#2563EB] text-white"
                    : step > 1
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {step > 1 ? <CheckIcon className="h-3.5 w-3.5 stroke-2" /> : "1"}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider">Step 1</p>
                <p className="text-xs font-semibold truncate">Project Essentials</p>
              </div>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className={`flex flex-1 items-center gap-2.5 rounded-xl border p-2.5 transition text-left ${
                step === 2
                  ? "border-[#2563EB] bg-blue-50/80 text-[#2563EB]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  step === 2 ? "bg-[#2563EB] text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                2
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider">Step 2</p>
                <p className="text-xs font-semibold truncate">Tech Stack & Scope</p>
              </div>
            </button>
          </div>
        </div>

        {/* STEP 1: PROJECT ESSENTIALS */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
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
                className={`w-full rounded-xl border p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none transition ${
                  errors.name
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500"
                    : "border-gray-200 bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10"
                }`}
              />
              {errors.name && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.name}</p>}
            </div>

            {/* Multiple Client Names / Stakeholders tag input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Client / Stakeholders
                </label>
                <span className="text-[11px] text-gray-400">Press Enter to add multiple</span>
              </div>
              <TagInput
                tags={form.clientNames}
                onChange={(names) => setForm((prev) => ({ ...prev, clientNames: names }))}
                placeholder="Type client or stakeholder name and press Enter..."
                tagColor="blue"
              />
            </div>

            {/* Project Stage, Status & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">Stage</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm((prev) => ({ ...prev, stage: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="day_one">Day 1 Discovery</option>
                  <option value="discovery">Deep Discovery</option>
                  <option value="requirements_confirmed">Requirements Confirmed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Modern Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <ModernDateInput
                label="Target Start Date"
                value={form.startDate}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, startDate: val }));
                  if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: null }));
                }}
                placeholder="Optional start date"
              />
              <ModernDateInput
                label="Target Delivery Date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, endDate: val }));
                  if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: null }));
                }}
                placeholder="Optional end date"
                helperText={errors.endDate}
              />
            </div>
            {errors.endDate && <p className="text-[11px] font-medium text-rose-500">{errors.endDate}</p>}

            {/* Modal Step 1 Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleClose}
              >
                Cancel
              </Button>

              <Button
                variant="secondary"
                size="sm"
                type="submit"
                rightIcon={<ArrowRightIcon className="h-3.5 w-3.5" />}
              >
                Continue to Step 2
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: TECH STACK & DESCRIPTION */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Tech Stack Chips Tag Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <CodeBracketIcon className="h-4 w-4 text-[#2563EB]" />
                  <label className="text-xs font-bold text-gray-800">
                    Tech Stack & Technologies
                  </label>
                </div>
                <span className="text-[11px] text-gray-400">Press Enter or comma to save</span>
              </div>
              <TagInput
                tags={form.techStack}
                onChange={(stack) => setForm((prev) => ({ ...prev, techStack: stack }))}
                placeholder="e.g. Next.js, Node.js, PostgreSQL (Press Enter to add)..."
                suggestions={TECH_SUGGESTIONS}
                tagColor="emerald"
              />
            </div>

            {/* Description textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-[#2563EB]" />
                  <label className="text-xs font-bold text-gray-800">
                    Project Scope & Description <span className="text-rose-500">*</span>
                  </label>
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    form.description.trim().length >= 10 ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {form.description.trim().length} / 2000 chars (min. 10)
                </span>
              </div>
              <textarea
                required
                autoFocus
                rows={4}
                minLength={10}
                maxLength={2000}
                value={form.description}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, description: e.target.value }));
                  if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                }}
                placeholder="Outline the client's business context, core functional objectives, target delivery timeline, and initial deliverables..."
                className={`w-full rounded-xl border p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none transition leading-relaxed ${
                  errors.description
                    ? "border-rose-300 bg-rose-50/40 focus:border-rose-500"
                    : "border-gray-200 bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.description}</p>
              )}
            </div>

            {/* Quick Summary Pill of Step 1 */}
            <div className="rounded-xl border border-gray-200/80 bg-gray-50/80 p-3 text-xs text-gray-600 flex items-center justify-between">
              <div className="min-w-0">
                <span className="font-semibold text-gray-900">{form.name}</span>
                {form.clientNames.length > 0 && (
                  <span className="text-gray-500 text-[11px] ml-2">
                    ({form.clientNames.join(", ")})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] font-bold text-[#2563EB] hover:underline shrink-0 ml-2"
              >
                Edit Details
              </button>
            </div>

            {/* Modal Step 2 Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setStep(1)}
                leftIcon={<ArrowLeftIcon className="h-3.5 w-3.5" />}
              >
                Back to Essentials
              </Button>

              <Button
                variant="secondary"
                size="sm"
                type="submit"
                loading={isSubmitting}
                leftIcon={<SparklesIcon className="h-4 w-4" />}
              >
                Create Project
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
