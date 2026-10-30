import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OneWorld Platform",
  description: "OneWorld Platform",
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
