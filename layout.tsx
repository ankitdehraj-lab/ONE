import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ONE WORLD — The Human Internet",
  description: "Meet people, build things, learn together and discover opportunities."
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
