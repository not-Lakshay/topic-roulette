import type { ReactNode } from "react";

export const metadata = { title: "Roulette", description: "Day X of … — history" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b0c10" />
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: "#0b0c10", color: "#f2f2f4", fontFamily: '"Inter Tight",Inter,system-ui,sans-serif' }}>{children}</body>
    </html>
  );
}
