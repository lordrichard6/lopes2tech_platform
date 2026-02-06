import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { cookies } from "next/headers";
import { ThemeColorProvider, ThemeColor } from "@/contexts/theme-color-context";
import { LanguageProvider } from "@/contexts/language-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Lopes2Tech Platform",
    template: "%s | Lopes2Tech"
  },
  description: "Swiss IT Solutions & Automation | Client Portal, web design automations SAAS and web apps.",
  keywords: [
    "IT Solutions",
    "Automation",
    "Swiss",
    "Zurich",
    "Software Development",
    "Client Portal",
    "Web Design",
    "Automations",
    "SAAS",
    "Web Apps"
  ],
  authors: [{ name: "Paulo Lopes", url: "https://lopes2tech.ch" }],
  creator: "Lopes2Tech",
  metadataBase: new URL("https://app.lopes2tech.ch"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.lopes2tech.ch",
    title: "Lopes2Tech Platform",
    description: "Secure Client Portal for Lopes2Tech Services, including web design automations SAAS and web apps.",
    siteName: "Lopes2Tech Area",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Lopes2Tech Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lopes2Tech Platform",
    description: "Secure Client Portal for Lopes2Tech Services, including web design automations SAAS and web apps.",
    images: ["/logo.png"],
    creator: "@lopes2tech",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  // Default palette should match current design (Neutral).
  const themeColor = (cookieStore.get("NEXT_THEME_COLOR")?.value || "neutral") as ThemeColor;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background text-foreground bg-grid-small-white/5`} suppressHydrationWarning>
        <NextTopLoader
          color="#d4a5a5"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #d4a5a5,0 0 5px #d4a5a5"
        />
        <ThemeColorProvider defaultTheme={themeColor}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <LanguageProvider>
                {children}
                <Toaster />
              </LanguageProvider>
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  "name": "Lopes2Tech",
                  "url": "https://lopes2tech.ch",
                  "logo": "https://app.lopes2tech.ch/logo.png",
                  "sameAs": [
                    "https://twitter.com/lopes2tech",
                    "https://www.linkedin.com/company/lopes2tech"
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+41-78-798-95-33",
                    "contactType": "customer service",
                    "areaServed": "CH",
                    "availableLanguage": ["English", "German", "Portuguese"]
                  }
                })
              }}
            />
          </ThemeProvider>
        </ThemeColorProvider>
      </body>
    </html>
  );
}

