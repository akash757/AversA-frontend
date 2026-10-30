import Link from "next/link";
import AversALogo from "@/components/Ui/AversALogo";

const footerLinks = {
  Platform: [
    { label: "Product", href: "/#product" },
    { label: "How we work", href: "/#how-we-work" },
    { label: "AI Agents", href: "/#agents" },
    { label: "FAQ", href: "/#faq" },
  ],
  Company: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Contact", href: "/contact" },
    { label: "Support", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07090f] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          <div className="sm:col-span-2">
            <Link href="/" className="inline-flex items-center">
              <AversALogo size="sm" showTagline={true} inverted />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              The AI product management platform that turns client conversations into
              requirements, estimates, proposals, and shippable work.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                {category}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AversA Platform Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
