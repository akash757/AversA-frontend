"use client";

import { useState } from "react";
import FormField from "@/components/Ui/FormField";
import Input from "@/components/Ui/Input";
import Textarea from "@/components/Ui/Textarea";
import Button from "@/components/Ui/Button";
import { useToast } from "@/components/Ui/Toast";
import {
  CheckCircleIcon,
  PaperAirplaneIcon,
  UserIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function ContactForm() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim()) {
      errs.email = "Work email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid work email";
    }
    if (!formData.message.trim()) {
      errs.message = "Please include a message describing your inquiry";
    } else if (formData.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Thank you for contacting AversA! Our product operations team will reply shortly.");
    }, 600);
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-4">
          <CheckCircleIcon className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-950">Message Sent Successfully</h3>
        <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
          We have received your inquiry. A member of our product management advisory crew will review your note and respond within 2-4 business hours.
        </p>
        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: "", email: "", subject: "", message: "" });
              setErrors({});
            }}
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
      <h2 className="text-base font-bold text-gray-950 mb-1">
        Send Us a Message
      </h2>
      <p className="text-xs text-gray-600 mb-6">
        Ask about our AI Product Management Agent, custom SDLC discovery matrices, or request an enterprise demo.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField
          label="Your Full Name"
          htmlFor="contact-name"
          required
          error={errors.name}
        >
          <Input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="e.g. Alex Morgan"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            prefix={<UserIcon className="h-4 w-4" />}
          />
        </FormField>

        <FormField
          label="Work Email"
          htmlFor="contact-email"
          required
          error={errors.email}
        >
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="alex@company.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            prefix={<EnvelopeIcon className="h-4 w-4" />}
          />
        </FormField>

        <FormField
          label="Subject / Area of Interest"
          htmlFor="contact-subject"
          hint="e.g. AI Product Agent Consultation, Custom SDLC Matrix, Enterprise VPC"
        >
          <Input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder="AI Product Management Agent Consultation"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </FormField>

        <FormField
          label="How Can We Help?"
          htmlFor="contact-message"
          required
          error={errors.message}
        >
          <Textarea
            id="contact-message"
            name="message"
            required
            rows={4}
            placeholder="Tell us about your team size, current client discovery process, and tooling requirements…"
            value={formData.message}
            onChange={(e) => {
              setFormData({ ...formData, message: e.target.value });
              if (errors.message) setErrors({ ...errors, message: undefined });
            }}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          disabled={isSubmitting}
          rightIcon={<PaperAirplaneIcon className="h-4 w-4" />}
        >
          {isSubmitting ? "Dispatching..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
}
