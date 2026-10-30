import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function DashboardCard({ title, description, href, icon: Icon, badge }) {
  const content = (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-500 hover:shadow-md min-h-[160px]">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
          {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              {badge}
            </span>
          )}
          <ArrowRightIcon className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#2563EB]" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#2563EB] transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {content}
      </Link>
    );
  }

  return <div className="w-full">{content}</div>;
}
