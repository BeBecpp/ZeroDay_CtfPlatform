import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-arena-muted font-mono text-sm animate-pulse">
            Loading...
          </p>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
