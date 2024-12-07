import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import { User, Key, Bell, Palette, Database, AlertTriangle, Copy, RefreshCw } from "lucide-react"

export function Settings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    console.log("Settings component mounted")
    try {
      // Test if all required components are available
      console.log("Tabs component available:", !!Tabs)
      console.log("Card component available:", !!Card)
      console.log("Button component available:", !!Button)
    } catch (err) {
      console.error("Error in Settings component:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
    }
  }, [])

  // Add error display
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500">
        <h2>Error loading Settings</h2>
        <pre>{error.message}</pre>
      </div>
    )
  }

  const handleSaveChanges = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Success",
        description: "Your settings have been saved.",
      })
    }, 1000)
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText("sk-...")
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    })
  }

  const regenerateApiKey = () => {
    toast({
      title: "Regenerated",
      description: "New API key has been generated",
    })
  }

  return (
    <Tabs defaultValue="account" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="account" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Account
        </TabsTrigger>
        <TabsTrigger value="api" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          API
        </TabsTrigger>
        <TabsTrigger value="content" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Content
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="appearance" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Appearance
        </TabsTrigger>
        <TabsTrigger value="data" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add account settings form */}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
