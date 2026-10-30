import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OneWorld",
  description: "Seven Networks. One Connected Ecosystem.",
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
