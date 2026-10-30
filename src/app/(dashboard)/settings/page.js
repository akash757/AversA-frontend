"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChevronRightIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import Loader from "@/components/Ui/Loader";

const SETTINGS_CARDS = [
  {
    title: "Profile & Account",
    description: "Manage your personal profile, credentials, contact info, and preferences.",
    href: "/settings/profile",
    icon: UserCircleIcon,
    color: "bg-blue-50 text-[#2563EB] border border-blue-100",
    roles: ["admin", "superadmin", "developer", "product_manager", "project_manager", "qa", "sales", "devops", "client"],
  },
  {
    title: "Team & Permissions",
    description: "Invite colleagues, assign operational roles, and review pending access requests.",
    href: "/users",
    icon: UsersIcon,
    color: "bg-purple-50 text-purple-600 border border-purple-100",
    roles: ["admin", "superadmin"],
  },
  {
    title: "Organizations",
    description: "Configure workspace settings, organization slug, and multi-tenant domains.",
    href: "/organizations",
    icon: BuildingOfficeIcon,
    color: "bg-cyan-50 text-cyan-600 border border-cyan-100",
    roles: ["superadmin", "admin"],
  },
  {
    title: "Projects Portfolio",
    description: "View and configure project stage discovery roadmaps and client assignments.",
    href: "/projects",
    icon: FolderIcon,
    color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    roles: ["admin", "superadmin", "developer", "product_manager", "project_manager"],
  },
];

export default function SettingsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  const visibleCards = SETTINGS_CARDS.filter(
    (card) => !card.roles || card.roles.includes(user?.role)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
          System Settings & Preferences
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure personal account credentials, team permissions, and workspace parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {visibleCards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition hover:border-[#2563EB] hover:shadow-md"
          >
            <div>
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.color} group-hover:scale-105 transition-transform`}>
                <card.icon className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-gray-900 group-hover:text-[#2563EB] transition-colors">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="mt-6 flex items-center text-xs font-semibold text-[#2563EB]">
              <span>Open Configuration</span>
              <ChevronRightIcon className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
