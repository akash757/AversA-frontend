import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Ui/Toast";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://aversa.ai"),
  title: {
    default: "AversA — AI Product Management & Client Discovery Platform",
    template: "%s | AversA",
  },
  description:
    "Turn client conversations into shipped products with AversA. Our autonomous AI product manager extracts requirements, PRDs, technical estimates, and user stories from discovery meetings — keeping your entire engineering team aligned.",
  keywords: [
    "AversA",
    "AI Product Manager",
    "Client Discovery Platform",
    "PRD Generator",
    "Requirements Engineering",
    "Discovery Matrix",
    "Meeting Intelligence",
    "Agile Product Operations",
    "Sprint Planning AI",
    "Google Meet Discovery",
  ],
  authors: [{ name: "AversA Product Intelligence" }],
  creator: "AversA Platform Inc.",
  publisher: "AversA Platform Inc.",
  category: "technology",
  applicationName: "AversA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "AversA — AI Product Management & Client Discovery Platform",
    description:
      "Turn client conversations into shipped products. AversA provides autonomous discovery matrices, AI-generated PRDs, technical scoping, and Google Meet synchronization in one workspace.",
    url: "https://aversa.ai",
    siteName: "AversA",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AversA — AI Product Management & Client Discovery Platform",
    description:
      "Turn client discovery meetings into verified PRDs, technical estimates, and sprint-ready user stories with AversA.",
    creator: "@aversahq",
    site: "@aversahq",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32" },
    ],
    apple: [{ url: "/icon.svg" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased font-sans">
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
