import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { menuItems } from "@/config/menu"
import { Link } from "react-router-dom"
import { FileText } from "lucide-react"

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="border-r bg-background">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 transition-colors hover:bg-primary/10",
                  isActive && "bg-primary/10 text-primary"
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
