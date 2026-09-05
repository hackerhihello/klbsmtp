"use client";

export default function ApiDocsPage() {
  return (
    <div className="h-screen w-full bg-white">
      <iframe
        src="/api-docs/"
        title="API Documentation"
        className="h-full w-full border-0"
      />
    </div>
  );
}
