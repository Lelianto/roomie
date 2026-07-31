import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Roomie — Build a workspace that works",
  description:
    "Curate a flexible workspace with considered desks, chairs, and accessories.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Roomie — Your desk. Your rhythm.",
    description: "Design a workspace that looks considered and arrives ready to use.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1734,
        height: 907,
        alt: "Roomie workspace configurator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roomie — Your desk. Your rhythm.",
    description: "Design a workspace that looks considered and arrives ready to use.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
