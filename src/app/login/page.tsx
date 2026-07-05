import { Suspense } from "react";
import LoginClient from "@/components/LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink flex items-center justify-center"><p className="text-paper">Loading...</p></div>}>
      <LoginClient />
    </Suspense>
  );
}