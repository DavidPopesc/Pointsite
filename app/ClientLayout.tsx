// ClientLayout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect based on localStorage user cookie
    const user = localStorage.getItem("user");

    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log("Service worker registered.", reg);
      });
    }
  }, [router]);

  return <>{children}</>;
}
