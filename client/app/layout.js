import "./globals.css";
import { ToastProvider } from "../components/ToastProvider";

export const metadata = {
  title: "Email SaaS Platform",
  description: "Multi-tenant email automation dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
