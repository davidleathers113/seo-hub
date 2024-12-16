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

    const { niche, invalidPillarIds } = await request.json()

    // Get existing valid pillars for context
    const { data: validPillars } = await supabase
      .from("pillars")
      .select("title, description")
      .eq("user_id", user.id)
      .eq("niche", niche)
      .not("id", "in", `(${invalidPillarIds.join(",")})`)

    // Call OpenRouter API to regenerate pillars
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
            content: "You are an expert content strategist. Generate new content pillars that complement existing ones while avoiding redundancy."
          },
          {
            role: "user",
            content: `Generate ${invalidPillarIds.length} new content pillars for the niche: ${niche}.
            These pillars should complement the existing valid pillars:
            ${JSON.stringify(validPillars, null, 2)}

            Ensure the new pillars are unique and don't overlap with the existing ones.
            For each pillar, provide a title and a brief description explaining its relevance to the niche.
            Format the response as a JSON array.`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      throw new Error("Failed to regenerate pillars")
    }

    const data = await response.json()
    const newPillars = data.choices[0].message.content.pillars

    // Delete invalid pillars
    const { error: deleteError } = await supabase
      .from("pillars")
      .delete()
      .in("id", invalidPillarIds)

    if (deleteError) throw deleteError

    // Store new pillars in database
    const { data: storedPillars, error: dbError } = await supabase
      .from("pillars")
      .insert(
        newPillars.map((pillar: any) => ({
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
    console.error("Error in POST /api/generate/pillars/regenerate:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}