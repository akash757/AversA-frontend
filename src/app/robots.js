export default function robots() {
  const baseUrl = "https://aversa.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/projects",
          "/projects/",
          "/organizations",
          "/organizations/",
          "/users",
          "/users/",
          "/meetings",
          "/meetings/",
          "/settings",
          "/settings/",
          "/pending-approval",
          "/pending-approval/",
          "/api/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/projects/",
          "/organizations/",
          "/users/",
          "/meetings/",
          "/settings/",
          "/pending-approval/",
          "/api/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/projects/",
          "/organizations/",
          "/users/",
          "/meetings/",
          "/settings/",
          "/pending-approval/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
