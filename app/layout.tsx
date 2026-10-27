import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { CalculationProvider } from "@/lib/calculation-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Should I Buy It? · Andrew Kodkod",
  description:
    "Take a moment before buying. Think through the cost, how often you’ll use it and whether you still want it after a few days.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CalculationProvider>
            {children}
            <Toaster />
          </CalculationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
