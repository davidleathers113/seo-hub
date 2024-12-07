import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/useToast"
import { generatePillars } from "@/api/content"

type ContentForm = {
  niche: string
}

export function Content() {
  const [loading, setLoading] = useState(false)
  const [pillars, setPillars] = useState<Array<{ id: string; title: string; approved: boolean }>>([])
  const { toast } = useToast()
  const { register, handleSubmit, reset } = useForm<ContentForm>()

  const onSubmit = async (data: ContentForm) => {
    try {
      setLoading(true)
      const response = await generatePillars(data.niche)
      setPillars(response.data.pillars)
      toast({
        title: "Success",
        description: "Content pillars generated successfully",
      })
      reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate content pillars",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Content Pillars</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="niche">Enter your niche</Label>
              <Input
                id="niche"
                placeholder="e.g., Digital Marketing"
                {...register("niche", { required: true })}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Pillars"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {pillars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Pillars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pillars.map((pillar) => (
                <Card key={pillar.id}>
                  <CardContent className="p-4">
                    <div className="font-medium">{pillar.title}</div>
                    <div className="mt-2">
                      <Button
                        variant={pillar.approved ? "secondary" : "default"}
                        size="sm"
                        className="w-full"
                      >
                        {pillar.approved ? "Approved" : "Approve"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}