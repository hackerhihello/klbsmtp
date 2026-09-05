"use client";

export default function ApiDocsPage() {
  return (
    <div className="h-screen w-full bg-white">
      <iframe
        src="/swagger.html"
        title="API Documentation"
        className="h-full w-full border-0"
      />
    </div>
  );
}
