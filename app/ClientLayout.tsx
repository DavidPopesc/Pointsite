// ClientLayout.tsx
"use client";

import { useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log("Service worker registered.", reg);
      });
    }
  }, []);

  return <>{children}</>;
}