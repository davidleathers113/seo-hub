import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { Document } from 'https://esm.sh/@docarray/core';
import { DocArray } from 'https://esm.sh/@docarray/core';

interface WebResearchRequestBody {
  query: string;
  subpillarId: string;
  includeImages?: boolean;
}

interface ResearchResult {
  content: string;
  source: string;
  relevance: number;
  images?: {
    url: string;
    alt: string;
    context: string;
  }[];
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { query, subpillarId, includeImages = false } = await req.json() as WebResearchRequestBody;

    // Initialize DocArray for web search
    const da = new DocArray();

    // Create a Document for the search query
    const searchDoc = new Document({ text: query });

    // Perform semantic search using Jina AI
    const results = await searchDoc.post(
      'https://api.jina.ai/v1/search',
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('JINA_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        data: {
          top_k: 10,
          include_metadata: true
        }
      }
    );

    // Process search results
    const researchResults: ResearchResult[] = await Promise.all(
      results.data.map(async (result: any) => {
        const doc = new Document(result);

        // Extract text content
        const content = doc.text;

        // Get source URL and metadata
        const source = doc.tags.url || 'Unknown source';
        const relevance = result.scores.relevance || 0.5;

        let images = [];
        if (includeImages) {
          // Extract images from the content
          const imageElements = await doc.chunks.filter(chunk =>
            chunk.mime_type?.startsWith('image/')
          ).map(chunk => ({
            url: chunk.uri,
            alt: chunk.tags.alt || '',
            context: chunk.tags.context || ''
          }));

          // If no images found in content, search for relevant images
          if (imageElements.length === 0) {
            const imageSearch = await fetch('https://api.jina.ai/v1/images/search', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('JINA_API_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                query: content.substring(0, 200), // Use first 200 chars as context
                top_k: 3
              })
            });

            if (imageSearch.ok) {
              const imageResults = await imageSearch.json();
              images = imageResults.data.map((img: any) => ({
                url: img.uri,
                alt: img.tags.caption || '',
                context: content.substring(0, 200)
              }));
            }
          } else {
            images = imageElements;
          }
        }

        return {
          content,
          source,
          relevance,
          ...(includeImages && { images })
        };
      })
    );

    // Store research results in database
    const { data: research, error } = await supabaseClient
      .from('research')
      .insert(
        researchResults.map(result => ({
          subpillar_id: subpillarId,
          content: result.content,
          source: result.source,
          relevance: result.relevance,
          images: result.images,
          created_at: new Date().toISOString()
        }))
      )
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ data: research }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in web research:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});