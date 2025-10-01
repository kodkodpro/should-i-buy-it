import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { CalculationProvider } from "@/lib/calculation-context"
import { AppSidebar } from "@/lib/components/app-sidebar"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Should I Buy It? - Purchase Decision Calculator",
  description:
    "Make smarter purchase decisions based on value, cost and your financial context",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-sidebar/25`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CalculationProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 w-full">
                <SidebarTrigger />
                {children}
              </main>
            </SidebarProvider>

            <Toaster />

            <div className="fixed top-4 right-4 z-50">
              <ModeToggle />
            </div>
          </CalculationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
