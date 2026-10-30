"use client";

import { useState } from "react";
import Link from "next/link";
import AversALogo from "@/components/Ui/AversALogo";
import { useToast } from "@/components/Ui/Toast";
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Thank you for contacting AversA! We will respond shortly.");
  };

  return (
    <div className="relative min-h-screen bg-white text-gray-900 selection:bg-blue-600 selection:text-white">
      <section className="relative z-10 pt-32 pb-20 sm:pt-40 sm:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-gray-50/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Get in Touch
            </span>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
              Contact AversA Support & Sales
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Have questions about deploying AversA for your organization or custom discovery matrices? Reach out to our product team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-950">Email Inquiries</h3>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Drop us an email anytime. Our product operations team responds within 2 hours.
                </p>
                <a
                  href="mailto:contact@aversa.ai"
                  className="mt-3 inline-block font-mono text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  contact@aversa.ai
                </a>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-950">Product Walkthrough</h3>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Book a 20-minute live demonstration of AversA Discovery Matrix and Google Meet scheduling.
                </p>
                <Link
                  href="/signup"
                  className="mt-3 inline-block text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Start free trial →
                </Link>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <BuildingOfficeIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-950">Enterprise Deployments</h3>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Custom question taxonomies, dedicated VPC deployment, and SSO integrations.
                </p>
                <p className="mt-3 text-xs font-semibold text-emerald-700">
                  enterprise@aversa.ai
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-4">
                    <CheckCircleIcon className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-950">Message Dispatched</h3>
                  <p className="mt-2 text-xs text-gray-600 max-w-xs mx-auto">
                    We have received your note and will be in touch shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="mt-6 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-base font-bold text-gray-950 mb-4">Send a Message</h2>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Sarah Connor"
                      className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sarah@agency.com"
                      className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Product Operations Consultation"
                      className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your team and requirement discovery workflow…"
                      className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#2563EB] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition active:scale-95"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
