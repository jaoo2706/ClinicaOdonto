import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Clínica Odontológica",
  description: "Sistema de gerenciamento para clínica odontológica",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
