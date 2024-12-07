import { Header } from "./Header"
import { cn } from "@/lib/utils"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4">
        {children}
      </main>
    </div>
  )
}
