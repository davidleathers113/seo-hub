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

    const { niche, invalidSubpillarIds, pillars } = await request.json()

    // Get existing valid subpillars for context
    const { data: validSubpillars } = await supabase
      .from("subpillars")
      .select("title, description, pillar_id")
      .eq("user_id", user.id)
      .not("id", "in", `(${invalidSubpillarIds.join(",")})`)

    // Call OpenRouter API to regenerate subpillars
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
            content: "You are an expert content strategist. Generate new subpillars that complement existing ones while avoiding redundancy."
          },
          {
            role: "user",
            content: `Generate ${invalidSubpillarIds.length} new subpillars for the niche: ${niche}.

            These subpillars should complement the existing valid subpillars:
            ${JSON.stringify(validSubpillars, null, 2)}

            And align with these content pillars:
            ${JSON.stringify(pillars, null, 2)}

            Ensure the new subpillars are unique and don't overlap with the existing ones.
            For each subpillar, provide a title, description, and the ID of the pillar it belongs to.
            Format the response as a JSON array.`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      throw new Error("Failed to regenerate subpillars")
    }

    const data = await response.json()
    const newSubpillars = data.choices[0].message.content.subpillars

    // Delete invalid subpillars
    const { error: deleteError } = await supabase
      .from("subpillars")
      .delete()
      .in("id", invalidSubpillarIds)

    if (deleteError) throw deleteError

    // Store new subpillars in database
    const { data: storedSubpillars, error: dbError } = await supabase
      .from("subpillars")
      .insert(
        newSubpillars.map((subpillar: any) => ({
          title: subpillar.title,
          description: subpillar.description,
          pillar_id: subpillar.pillarId,
          user_id: user.id
        }))
      )
      .select()

    if (dbError) throw dbError

    return NextResponse.json({ subpillars: storedSubpillars })
  } catch (error) {
    console.error("Error in POST /api/generate/subpillars/regenerate:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}