import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { niche } = await request.json()

    // Call OpenRouter API to generate pillars
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-2",
        messages: [
          {
            role: "system",
            content: "You are an expert content strategist. Generate 20 comprehensive content pillars for the given niche. Each pillar should be a broad topic that can be broken down into multiple subtopics."
          },
          {
            role: "user",
            content: `Generate 20 content pillars for the niche: ${niche}. For each pillar, provide a title and a brief description explaining its relevance to the niche. Format the response as a JSON array.`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      throw new Error("Failed to generate pillars")
    }

    const data = await response.json()
    const pillars = data.choices[0].message.content.pillars

    // Store pillars in database
    const { data: storedPillars, error: dbError } = await supabase
      .from("pillars")
      .insert(
        pillars.map((pillar: any) => ({
          title: pillar.title,
          description: pillar.description,
          user_id: user.id,
          niche: niche
        }))
      )
      .select()

    if (dbError) throw dbError

    return NextResponse.json({ pillars: storedPillars })
  } catch (error) {
    console.error("Error in POST /api/generate/pillars:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}