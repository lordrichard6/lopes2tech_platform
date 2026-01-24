import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { cookies } from "next/headers";
import { ThemeColorProvider, ThemeColor } from "@/contexts/theme-color-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lopes2Tech Platform",
  description: "Client Portal & Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeColor = (cookieStore.get("NEXT_THEME_COLOR")?.value || "horizon") as ThemeColor;

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
            {children}
            <Toaster />
          </ThemeProvider>
        </ThemeColorProvider>
      </body>
    </html>
  );
}

