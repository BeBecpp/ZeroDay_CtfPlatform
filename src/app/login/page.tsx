import { Suspense } from "react";
import { MatrixBackdrop } from "@/components/MatrixBackdrop";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <MatrixBackdrop density="low" opacity={0.22} speed="slow">
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
    </MatrixBackdrop>
  );
}
