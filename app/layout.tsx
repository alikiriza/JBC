import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/toast";

// §Typography: friendly rounded heading face (Nunito), clean body face (Inter).
// Exposed as CSS variables so globals.css can map --font-heading / --font-body
// onto them. display: "swap" avoids a flash of invisible text on slow phones.
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  // §Typography + skill rule: headings are 600–700, never 800/900.
  weight: ["600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JBC Skin Cream — Natural healing for the whole family",
  description:
    "A herbal skin cream for fungal infections, burns, eczema, rashes and dry skin. Sign in with Google to see sizes and get your price.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable}`}>
      <body className="font-body">
        {/* §Accessibility: keyboard users can jump straight past the nav. */}
        <a
          href="#main"
          className="sr-only rounded-md bg-[color:var(--color-primary)] px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to main content
        </a>

        {/* React Query owns all server state in the browser. Wrapping the whole
            page (not just one section) means the nav and the footer could use it
            later without restructuring the layout again. */}
        <QueryProvider>
          <Nav />

          <main id="main">{children}</main>

          <Footer />
        </QueryProvider>

        {/* One toaster for the whole app. Confirmations and failures appear
            here so a form never has to render its own alert region. */}
        <Toaster />
      </body>
    </html>
  );
}